// Supabase Edge Function: check-quota
// Stateless, zero-knowledge passthrough to query LiteLLM rate limit headers from gateway.9arm.co
// NEVER saves the user's API key to database, disk, or persistent logs.
// Protected by In-Memory IP Rate Limiting (10 requests/minute per client IP).

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-api-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface RateLimitRecord {
  count: number;
  resetTime: number; // Unix epoch in ms
}

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 60 seconds
const MAX_REQUESTS_PER_WINDOW = 10; // Max 10 requests per minute per IP
const ipRateLimits = new Map<string, RateLimitRecord>();

function getClientIp(req: Request): string {
  return (
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    '127.0.0.1'
  );
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = ipRateLimits.get(ip);

  // Periodically clean up expired entries if map grows
  if (ipRateLimits.size > 500) {
    for (const [key, val] of ipRateLimits.entries()) {
      if (now > val.resetTime) {
        ipRateLimits.delete(key);
      }
    }
  }

  if (!record || now > record.resetTime) {
    ipRateLimits.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  record.count += 1;
  return { allowed: true };
}

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

  // 2. IP-based Rate Limiting (Prevent abuse, DoS, and Brute-force)
  const clientIp = getClientIp(req);
  const rateLimitStatus = checkRateLimit(clientIp);

  if (!rateLimitStatus.allowed) {
    const retryAfter = rateLimitStatus.retryAfterSeconds ?? 60;
    return new Response(
      JSON.stringify({
        valid: false,
        statusCode: 429,
        isRateLimited: true,
        error: `Rate limit exceeded: Too many checks from your IP (max 10/minute). Please retry in ${retryAfter}s.`,
        retryAfter,
      }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfter),
        },
      }
    );
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

    // 3. Query gateway.9arm.co /v1/messages with 1 token on Qwen FP8
    // This allows LiteLLM to calculate exact key spend (x-litellm-key-spend) and all rate limit headers
    const startTime = Date.now();
    let gatewayRes = await fetch('https://gateway.9arm.co/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen3.8-27b-fp8',
        messages: [{ role: 'user', content: 'hi' }],
        max_tokens: 1,
      }),
    });
    let latencyMs = Date.now() - startTime;

    // Fallback to GET /v1/models if /v1/messages is unavailable (404/5xx)
    if (gatewayRes.status === 404 || gatewayRes.status >= 500) {
      const fallbackStart = Date.now();
      const fallbackRes = await fetch('https://gateway.9arm.co/v1/models', {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
      });
      if (fallbackRes.status === 200 || fallbackRes.status === 401) {
        gatewayRes = fallbackRes;
        latencyMs = Date.now() - fallbackStart;
      }
    }

    // 4. Extract telemetry headers
    const maxParallel = Number(gatewayRes.headers.get('x-ratelimit-api_key-limit-max_parallel_requests')) || 3;
    const remainingParallelHeader = gatewayRes.headers.get('x-ratelimit-api_key-remaining-max_parallel_requests');
    const remainingParallel = remainingParallelHeader !== null ? Number(remainingParallelHeader) : maxParallel;

    const tokenLimit = Number(gatewayRes.headers.get('x-ratelimit-api_key-limit-tokens')) 
      || Number(gatewayRes.headers.get('anthropic-ratelimit-tokens-limit'))
      || 1000000;
    const remainingTokensHeader = gatewayRes.headers.get('x-ratelimit-api_key-remaining-tokens')
      || gatewayRes.headers.get('anthropic-ratelimit-tokens-remaining');
    const remainingTokens = remainingTokensHeader !== null ? Number(remainingTokensHeader) : tokenLimit;

    const keyMaxBudget = Number(gatewayRes.headers.get('x-litellm-key-max-budget')) || 50.0;
    const keySpendHeader = gatewayRes.headers.get('x-litellm-key-spend');
    const keySpend = keySpendHeader !== null ? Number(keySpendHeader) : 0.0;

    // Compute headroom percentages
    const parallelPctRemaining = Math.max(0, Math.min(100, Math.round((remainingParallel / maxParallel) * 100)));
    const tokenPctRemaining = Math.max(0, Math.min(100, Math.round((remainingTokens / tokenLimit) * 100)));
    const budgetRemaining = Math.max(0, keyMaxBudget - keySpend);
    const budgetPctRemaining = Math.max(0, Math.min(100, Math.round((budgetRemaining / keyMaxBudget) * 100)));

    // 5. Return sanitized telemetry payload (API key is never logged or saved)
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
