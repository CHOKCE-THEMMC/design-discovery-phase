import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const checks: Record<string, { ok: boolean; latencyMs?: number; error?: string }> = {}

  // Auth check: GET the auth health endpoint
  const authStart = Date.now()
  try {
    const url = Deno.env.get('SUPABASE_URL')!
    const r = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: Deno.env.get('SUPABASE_ANON_KEY')! },
    })
    checks.auth = { ok: r.ok, latencyMs: Date.now() - authStart }
    if (!r.ok) checks.auth.error = `HTTP ${r.status}`
  } catch (e) {
    checks.auth = { ok: false, error: e instanceof Error ? e.message : 'unknown' }
  }

  // Chatbot check: confirm LOVABLE_API_KEY is configured (avoid burning credits)
  checks.chatbot = { ok: !!Deno.env.get('LOVABLE_API_KEY') }
  if (!checks.chatbot.ok) checks.chatbot.error = 'LOVABLE_API_KEY missing'

  const allOk = Object.values(checks).every((c) => c.ok)

  return new Response(
    JSON.stringify({ status: allOk ? 'ok' : 'degraded', checks, timestamp: new Date().toISOString() }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  )
})