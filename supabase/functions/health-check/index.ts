import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  const startTime = Date.now();

  try {
    // Send an unauthenticated ping to check reachability only.
    // We expect a 401 Unauthorized — this proves the gateway is alive and responding.
    // We do NOT use a real API key, so no token is consumed and no auth issues cause false alerts.
    const response = await fetch("https://gateway.9arm.co/v1/models", {
      method: "GET",
      headers: {
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
    });

    const endTime = Date.now();
    const responseTimeMs = endTime - startTime;

    // Operational = server responded with anything other than 5xx.
    // 401 Unauthorized = gateway is up, auth required (expected, fully operational).
    // 5xx = server-side failure (true outage).
    // Network error / timeout = caught below as non-operational.
    const isOperational = response.status < 500;

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase environment variables are missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: insertError } = await supabase
      .from('api_status_logs')
      .insert([
        {
          endpoint: 'gateway.9arm.co',
          status_code: response.status,
          response_time_ms: responseTimeMs,
          is_operational: isOperational
        }
      ]);

    if (insertError) {
      console.error('Failed to insert log:', insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        endpoint: 'gateway.9arm.co',
        status_code: response.status,
        response_time_ms: responseTimeMs,
        is_operational: isOperational
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (err: any) {
    const endTime = Date.now();
    const responseTimeMs = endTime - startTime;

    // Network failure or timeout — gateway is unreachable
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY');

      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase
          .from('api_status_logs')
          .insert([
            {
              endpoint: 'gateway.9arm.co',
              status_code: 0,
              response_time_ms: responseTimeMs,
              is_operational: false
            }
          ]);
      }
    } catch (logErr) {
      console.error('Failed to log error state:', logErr);
    }

    return new Response(
      JSON.stringify({ error: err.message, success: false }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
