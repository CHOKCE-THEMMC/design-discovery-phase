import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, message }: ContactEmailRequest = await req.json();

    // Use service role to create notifications for all admins
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch all admin user IDs
    const { data: adminRoles } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (adminRoles && adminRoles.length > 0) {
      const notifications = adminRoles.map((admin: { user_id: string }) => ({
        user_id: admin.user_id,
        title: "📩 New Contact Message",
        message: `From: ${name} (${email}) — "${message.substring(0, 100)}${message.length > 100 ? "..." : ""}"`,
        type: "contact_message",
      }));

      const { error: notifError } = await supabaseAdmin
        .from("notifications")
        .insert(notifications);

      if (notifError) {
        console.error("Error creating admin notifications:", notifError);
      } else {
        console.log(`Created notifications for ${adminRoles.length} admin(s)`);
      }
    }

    // Send confirmation email if Resend is configured
    if (RESEND_API_KEY) {
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "DTI Library <noreply@dti-library.com>",
          to: [email],
          subject: "We received your message!",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #1e3a5f, #4a1e3d); padding: 30px; text-align: center; }
                .header h1 { color: white; margin: 0; }
                .content { padding: 30px; background: #f9fafb; }
                .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>📚 DTI Library</h1>
                </div>
                <div class="content">
                  <h2>Thank you for contacting us, ${name}!</h2>
                  <p>We have received your message and will get back to you as soon as possible.</p>
                  <p><strong>Your message:</strong></p>
                  <blockquote style="border-left: 3px solid #1e3a5f; padding-left: 15px; color: #555;">
                    ${message}
                  </blockquote>
                  <p>Our team typically responds within 24-48 hours during business days.</p>
                  <p>Best regards,<br>The DTI Library Team</p>
                </div>
                <div class="footer">
                  <p>© 2025 DTI Library. Destination Training Institute.</p>
                </div>
              </div>
            </body>
            </html>
          `,
        }),
      });

      const emailData = await emailResponse.json();
      console.log("Email sent:", emailData);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
