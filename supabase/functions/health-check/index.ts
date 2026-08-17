import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

serve(async (req) => {
  // CORS Headers if needed (standard for edge functions)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  const startTime = Date.now();

  try {
    const apiKey = Deno.env.get('ANTHROPIC_AUTH_TOKEN');
    if (!apiKey) {
      throw new Error('ANTHROPIC_AUTH_TOKEN is not set');
    }

    // Ping the API
    const response = await fetch("https://gateway.9arm.co/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen3.6-35b-a3b",
        messages: [{ role: "user", content: "test" }],
        max_tokens: 5,
      }),
    });

    const endTime = Date.now();
    const responseTimeMs = endTime - startTime;
    const isOperational = response.status >= 200 && response.status < 300;

    // Initialize Supabase Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase environment variables are missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert the result into the api_status_logs table
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
    
    // Log failures as non-operational as well
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
              status_code: 500,
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
