import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Body {
  mode: "count" | "send";
  audience?: "all" | "students";
  program?: string;
  body?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return json({ error: "Unauthorized" }, 401);
    }
    const callerId = claimsData.claims.sub as string;

    const admin = createClient(supabaseUrl, serviceKey);

    // Check admin role
    const { data: roles } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId);
    const isAdmin = (roles || []).some((r: any) => r.role === "admin");
    if (!isAdmin) {
      return json({ error: "Forbidden: admin only" }, 403);
    }

    const body = (await req.json()) as Body;

    // Build recipient query: approved users, optionally filtered
    let q = admin
      .from("profiles")
      .select("user_id")
      .eq("approval_status", "approved");

    if (body.program) {
      q = q.eq("enrolled_program", body.program);
    }

    const { data: profiles, error: pErr } = await q;
    if (pErr) return json({ error: pErr.message }, 500);
    let recipientIds = (profiles || []).map((p: any) => p.user_id).filter((id: string) => id !== callerId);

    // Optionally filter to students only (exclude users with admin/moderator/lecturer roles)
    if (body.audience === "students") {
      const { data: rolesAll } = await admin
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", recipientIds.length ? recipientIds : ["00000000-0000-0000-0000-000000000000"]);
      const nonStudent = new Set(
        (rolesAll || [])
          .filter((r: any) => r.role !== "user")
          .map((r: any) => r.user_id)
      );
      recipientIds = recipientIds.filter((id) => !nonStudent.has(id));
    }

    if (body.mode === "count") {
      return json({ count: recipientIds.length });
    }

    // SEND mode
    if (!body.body || !body.body.trim()) {
      return json({ error: "Message body required" }, 400);
    }
    const text = body.body.trim().slice(0, 4000);

    // Ensure conversation exists for each recipient (upsert)
    const convRows = recipientIds.map((uid) => ({ user_id: uid }));
    if (convRows.length) {
      await admin.from("conversations").upsert(convRows, { onConflict: "user_id", ignoreDuplicates: true });
    }

    // Fetch all conversation ids
    const { data: convs } = await admin
      .from("conversations")
      .select("id, user_id")
      .in("user_id", recipientIds.length ? recipientIds : ["00000000-0000-0000-0000-000000000000"]);

    const now = new Date().toISOString();
    const preview = text.slice(0, 120);

    // Insert one message per conversation
    const messageRows = (convs || []).map((c: any) => ({
      conversation_id: c.id,
      sender_id: callerId,
      sender_role: "admin",
      body: text,
    }));
    if (messageRows.length) {
      const { error: mErr } = await admin.from("messages").insert(messageRows);
      if (mErr) return json({ error: mErr.message }, 500);

      // Update conversation previews
      const ids = (convs || []).map((c: any) => c.id);
      await admin
        .from("conversations")
        .update({ last_message_at: now, last_message_preview: preview })
        .in("id", ids);

      // Drop a notification too
      const notifRows = recipientIds.map((uid) => ({
        user_id: uid,
        title: "📣 New message from Admin",
        message: preview,
        type: "broadcast",
      }));
      await admin.from("notifications").insert(notifRows);
    }

    // Audit log
    await admin.from("broadcasts").insert({
      sender_id: callerId,
      body: text,
      audience: { audience: body.audience || "all", program: body.program || null },
      recipient_count: recipientIds.length,
    });

    return json({ ok: true, recipient_count: recipientIds.length });
  } catch (e) {
    console.error("broadcast-message error", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}