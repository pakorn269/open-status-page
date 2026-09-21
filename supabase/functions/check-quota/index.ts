// Supabase Edge Function: check-quota
// Stateless, zero-knowledge passthrough to query LiteLLM rate limit headers from gateway.9arm.co
// NEVER saves the user's API key to database, disk, or persistent logs.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-api-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    let apiKey = '';

    // Extract apiKey from body or header
    const authHeader = req.headers.get('x-user-api-key') || req.headers.get('Authorization');
    if (authHeader) {
      apiKey = authHeader.replace(/^Bearer\s+/i, '').trim();
    }

    if (!apiKey) {
      try {
        const body = await req.json();
        apiKey = (body?.apiKey || '').trim();
      } catch {
        // Body was empty or invalid JSON
      }
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({ valid: false, error: 'API Key is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Query gateway.9arm.co /v1/models with the user's key
    const startTime = Date.now();
    const gatewayRes = await fetch('https://gateway.9arm.co/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'x-api-key': apiKey,
      },
    });
    const latencyMs = Date.now() - startTime;

    // 3. Extract telemetry headers
    const maxParallel = Number(gatewayRes.headers.get('x-ratelimit-api_key-limit-max_parallel_requests')) || 3;
    const remainingParallelHeader = gatewayRes.headers.get('x-ratelimit-api_key-remaining-max_parallel_requests');
    const remainingParallel = remainingParallelHeader !== null ? Number(remainingParallelHeader) : maxParallel;

    const tokenLimit = Number(gatewayRes.headers.get('x-ratelimit-api_key-limit-tokens')) || 1000000;
    const remainingTokensHeader = gatewayRes.headers.get('x-ratelimit-api_key-remaining-tokens');
    const remainingTokens = remainingTokensHeader !== null ? Number(remainingTokensHeader) : tokenLimit;

    const keyMaxBudget = Number(gatewayRes.headers.get('x-litellm-key-max-budget')) || 50.0;
    const keySpend = Number(gatewayRes.headers.get('x-litellm-key-spend')) || 0.0;

    // Compute headroom percentages
    const parallelPctRemaining = Math.max(0, Math.min(100, Math.round((remainingParallel / maxParallel) * 100)));
    const tokenPctRemaining = Math.max(0, Math.min(100, Math.round((remainingTokens / tokenLimit) * 100)));
    const budgetRemaining = Math.max(0, keyMaxBudget - keySpend);
    const budgetPctRemaining = Math.max(0, Math.min(100, Math.round((budgetRemaining / keyMaxBudget) * 100)));

    // 4. Return sanitized telemetry payload (API key is never logged or saved)
    if (gatewayRes.status === 200) {
      return new Response(
        JSON.stringify({
          valid: true,
          statusCode: 200,
          latencyMs,
          maxParallel,
          remainingParallel,
          parallelPctRemaining,
          tokenLimit,
          remainingTokens,
          tokenPctRemaining,
          keyMaxBudget,
          keySpend,
          budgetRemaining,
          budgetPctRemaining,
          checkedAt: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (gatewayRes.status === 401) {
      return new Response(
        JSON.stringify({
          valid: false,
          statusCode: 401,
          error: 'Authentication failed: Invalid or expired API Key',
          checkedAt: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (gatewayRes.status === 429) {
      return new Response(
        JSON.stringify({
          valid: true,
          isRateLimited: true,
          statusCode: 429,
          error: 'Rate Limit (HTTP 429): Parallel request cap or token quota reached',
          latencyMs,
          maxParallel,
          remainingParallel: 0,
          parallelPctRemaining: 0,
          tokenLimit,
          remainingTokens,
          tokenPctRemaining,
          keyMaxBudget,
          keySpend,
          budgetRemaining,
          budgetPctRemaining,
          checkedAt: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Other non-200 responses
    return new Response(
      JSON.stringify({
        valid: false,
        statusCode: gatewayRes.status,
        error: `Gateway returned unexpected status: ${gatewayRes.status}`,
        checkedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ valid: false, error: `Internal error checking quota: ${errorMsg}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
