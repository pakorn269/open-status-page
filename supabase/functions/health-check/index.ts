import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

export type StatusClassification = 'operational' | 'rate_limited' | 'quota_exhausted' | 'degraded' | 'outage';

export interface CheckResult {
  status: number;
  ok: boolean;
  statusType: StatusClassification;
  remainingTokens?: number | null;
  tokenLimit?: number | null;
  maxParallelRequests?: number | null;
  remainingParallelRequests?: number | null;
  keySpend?: number | null;
  keyMaxBudget?: number | null;
  errorType?: string | null;
  errorMessage?: string | null;
}

interface TargetCheck {
  id: string;
  name: string;
  maxHealthyMs: number; // Tailored latency threshold (HTTP vs LLM GPU inference)
  check: (apiKey: string) => Promise<CheckResult>;
}

function parseNumberHeader(res: Response, headerName: string): number | null {
  const val = res.headers.get(headerName);
  if (!val) return null;
  const num = parseFloat(val);
  return isNaN(num) ? null : num;
}

const TARGETS: TargetCheck[] = [
  {
    id: 'gateway-http',
    name: 'API Gateway (HTTP / Models)',
    maxHealthyMs: 1500, // Gateway proxy & model list should respond under 1.5s
    check: async (apiKey: string): Promise<CheckResult> => {
      const res = await fetch("https://gateway.9arm.co/v1/models", {
        method: "GET",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
      });

      const ok = res.status >= 200 && res.status < 300;
      let statusType: StatusClassification = ok ? 'operational' : 'outage';
      if (res.status === 429) statusType = 'rate_limited';

      return {
        status: res.status,
        ok,
        statusType,
      };
    },
  },
  // Qwen 3.8 27B (BF16) is temporarily disabled per 9arm testing conclusion announcement (at 09:00 today)
  // Ref: https://discord.com/channels/826099393694400574/1512469795218653417/1541558041692872745
  // Uncomment when BF16 model testing resumes:
  // {
  //   id: 'model-qwen-bf16',
  //   name: 'Model: Qwen 3.8 27B (BF16)',
  //   maxHealthyMs: 4000,
  //   check: async (apiKey: string) => { ... }
  // },
  {
    id: 'model-qwen-fp8',
    name: 'Model: Qwen 3.8 27B (FP8)',
    maxHealthyMs: 3500, // FP8 128k context LLM inference
    check: async (apiKey: string): Promise<CheckResult> => {
      const res = await fetch("https://gateway.9arm.co/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "qwen3.8-27b-fp8",
          messages: [{ role: "user", content: "hi" }],
          max_tokens: 1,
        }),
      });

      // Extract Rate Limit, Quota, and Concurrency Telemetry from Headers
      const remainingTokens = parseNumberHeader(res, 'x-ratelimit-api_key-remaining-tokens')
        ?? parseNumberHeader(res, 'anthropic-ratelimit-tokens-remaining');
      const tokenLimit = parseNumberHeader(res, 'x-ratelimit-api_key-limit-tokens')
        ?? parseNumberHeader(res, 'anthropic-ratelimit-tokens-limit')
        ?? parseNumberHeader(res, 'x-litellm-key-tpm-limit');
      const maxParallel = parseNumberHeader(res, 'x-ratelimit-api_key-limit-max_parallel_requests');
      const remainingParallel = parseNumberHeader(res, 'x-ratelimit-api_key-remaining-max_parallel_requests');
      const keySpend = parseNumberHeader(res, 'x-litellm-key-spend');
      const keyMaxBudget = parseNumberHeader(res, 'x-litellm-key-max-budget');

      let errorType: string | null = null;
      let errorMessage: string | null = null;

      if (res.status >= 400) {
        try {
          const errJson = await res.json();
          if (errJson?.error) {
            errorType = errJson.error.type || null;
            errorMessage = errJson.error.message || null;
          }
        } catch {
          // ignore json parse error
        }
      }

      // Precise Status Classification
      let ok = false;
      let statusType: StatusClassification = 'outage';

      if (res.status >= 200 && res.status < 300) {
        ok = true;
        statusType = 'operational';
      } else if (res.status === 429) {
        ok = false;
        statusType = 'rate_limited';
        errorType = errorType || 'rate_limit_error';
        errorMessage = errorMessage || 'Usage / Rate limit reached (HTTP 429)';
      } else if (res.status === 400 || res.status === 402) {
        const isBudget = errorType?.includes('budget') || errorMessage?.toLowerCase().includes('budget') || errorMessage?.toLowerCase().includes('quota');
        if (isBudget) {
          ok = false;
          statusType = 'quota_exhausted';
        } else {
          ok = false;
          statusType = 'outage';
        }
      } else {
        ok = false;
        statusType = 'outage';
      }

      return {
        status: res.status,
        ok,
        statusType,
        remainingTokens,
        tokenLimit,
        maxParallelRequests: maxParallel,
        remainingParallelRequests: remainingParallel,
        keySpend,
        keyMaxBudget,
        errorType,
        errorMessage,
      };
    },
  },
  // DeepSeek is temporarily disabled per 9arm announcement ("Deepseek will be disabled NOW... will return soon")
  // Ref: https://discord.com/channels/826099393694400574/1512469795218653417/1540781941148622928
  // Uncomment when DeepSeek is restored
];

function formatThaiDateTime(date = new Date()): string {
  // Convert UTC to Asia/Bangkok (UTC+7)
  const bangkokTime = new Date(date.getTime() + (7 * 60 * 60 * 1000));
  const pad = (n: number) => n.toString().padStart(2, '0');
  const d = pad(bangkokTime.getUTCDate());
  const m = pad(bangkokTime.getUTCMonth() + 1);
  const y = bangkokTime.getUTCFullYear();
  const hh = pad(bangkokTime.getUTCHours());
  const mm = pad(bangkokTime.getUTCMinutes());
  const ss = pad(bangkokTime.getUTCSeconds());
  return `${d}/${m}/${y} ${hh}:${mm}:${ss} (เวลาไทย)`;
}

async function sendTelegramAlert(botToken: string, chatId: string, htmlMessage: string) {
  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: htmlMessage,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    return await res.json();
  } catch (err) {
    console.error("Failed to send Telegram notification:", err);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY');
  const apiKey = Deno.env.get('ANTHROPIC_AUTH_TOKEN');
  const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const telegramChatId = Deno.env.get('TELEGRAM_CHAT_ID') || '@gateway9armstatus';

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(JSON.stringify({ error: 'Supabase environment variables missing' }), { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const effectiveKey = apiKey || 'sk-4TP8tGwfUbAqewBrHwlJIg';

  // Run all target health checks in parallel
  const results = await Promise.all(
    TARGETS.map(async (target) => {
      const startTime = Date.now();
      try {
        const checkRes = await target.check(effectiveKey);
        const responseTimeMs = Date.now() - startTime;
        return {
          endpoint: target.name,
          max_healthy_ms: target.maxHealthyMs,
          status_code: checkRes.status,
          response_time_ms: responseTimeMs,
          is_operational: checkRes.ok,
          status_type: checkRes.statusType,
          remaining_tokens: checkRes.remainingTokens ?? null,
          token_limit: checkRes.tokenLimit ?? null,
          max_parallel_requests: checkRes.maxParallelRequests ?? null,
          remaining_parallel_requests: checkRes.remainingParallelRequests ?? null,
          key_spend: checkRes.keySpend ?? null,
          key_max_budget: checkRes.keyMaxBudget ?? null,
          error_type: checkRes.errorType ?? null,
          error_message: checkRes.errorMessage ?? null,
        };
      } catch (err: any) {
        const responseTimeMs = Date.now() - startTime;
        return {
          endpoint: target.name,
          max_healthy_ms: target.maxHealthyMs,
          status_code: 0,
          response_time_ms: responseTimeMs,
          is_operational: false,
          status_type: 'outage' as StatusClassification,
          remaining_tokens: null,
          token_limit: null,
          max_parallel_requests: null,
          remaining_parallel_requests: null,
          key_spend: null,
          key_max_budget: null,
          error_type: 'network_error',
          error_message: err.message,
        };
      }
    })
  );

  // Insert all check logs into api_status_logs with telemetry columns
  const rowsToInsert = results.map(r => ({
    endpoint: r.endpoint,
    status_code: r.status_code,
    response_time_ms: r.response_time_ms,
    is_operational: r.is_operational,
    remaining_tokens: r.remaining_tokens,
    token_limit: r.token_limit,
    max_parallel_requests: r.max_parallel_requests,
    remaining_parallel_requests: r.remaining_parallel_requests,
    key_spend: r.key_spend,
    key_max_budget: r.key_max_budget,
    error_type: r.error_type,
    error_message: r.error_message,
  }));

  const { error: insertError } = await supabase
    .from('api_status_logs')
    .insert(rowsToInsert);

  // Defensive fallback: if telemetry columns are not yet added to Postgres, fall back to basic schema
  if (insertError) {
    if (insertError.code === '42703') {
      console.warn('Telemetry columns not yet migrated; falling back to base columns:', insertError.message);
      const fallbackRows = results.map(r => ({
        endpoint: r.endpoint,
        status_code: r.status_code,
        response_time_ms: r.response_time_ms,
        is_operational: r.is_operational,
      }));
      await supabase.from('api_status_logs').insert(fallbackRows);
    } else {
      console.error('Failed to insert multi-endpoint logs:', insertError);
    }
  }

  // --- Automated Incident Lifecycle & Telegram Broadcast in Thai ---
  const autoCreatedIncidents: string[] = [];
  const autoResolvedIncidents: string[] = [];

  try {
    // 1. Fetch current open incidents
    const { data: openIncidents } = await supabase
      .from('incidents')
      .select('id, name, message')
      .is('resolved_at', null);

    // 2. Identify different alert conditions:
    // a) Rate / Usage Limit Throttling (HTTP 429 or quota_exhausted)
    const rateLimitedTargets = results.filter(
      r => r.status_type === 'rate_limited' || r.status_type === 'quota_exhausted' || r.status_code === 429
    );
    // b) Hard Outages (HTTP 500+ or network failure, excluding 429)
    const outageTargets = results.filter(
      r => (!r.is_operational || r.status_code >= 500) && r.status_code !== 429 && r.status_type !== 'rate_limited' && r.status_type !== 'quota_exhausted'
    );
    // c) Severe Latency Degradation (> 2x normal threshold)
    const severeLatencyTargets = results.filter(
      r => r.is_operational && r.status_code < 500 && r.status_code !== 429 && r.response_time_ms > (r.max_healthy_ms * 2)
    );

    // Auto-create incident for Rate / Usage Limits (HTTP 429)
    for (const rl of rateLimitedTargets) {
      const alreadyOpen = openIncidents?.some(
        i => i.name.toLowerCase().includes(rl.endpoint.toLowerCase()) && (i.name.toLowerCase().includes('usage') || i.name.toLowerCase().includes('rate limit'))
      );
      if (!alreadyOpen) {
        const incidentName = `Usage Limit Throttled: ${rl.endpoint}`;
        await supabase.from('incidents').insert({
          name: incidentName,
          impact: 'minor',
          message: `Automated health check detected that ${rl.endpoint} is currently throttled due to Usage / Rate Limit (HTTP ${rl.status_code}). Token or concurrency quota exceeded.`,
        });
        autoCreatedIncidents.push(incidentName);

        // Telegram alert broadcast (in Thai)
        if (telegramBotToken) {
          const timeStr = formatThaiDateTime();
          const tokensInfo = rl.remaining_tokens !== null && rl.remaining_tokens !== undefined
            ? `<b>Tokens คงเหลือ:</b> ${rl.remaining_tokens.toLocaleString()}\n`
            : '';
          const parallelInfo = rl.max_parallel_requests !== null && rl.max_parallel_requests !== undefined
            ? `<b>ขีดจำกัด Concurrency:</b> ${rl.max_parallel_requests} คำขอพร้อมกัน\n`
            : '';

          const alertMsg =
            `⚠️ <b>แจ้งเตือน: ตรวจพบโมเดลติด Usage / Rate Limit</b>\n\n` +
            `<b>บริการ:</b> ${rl.endpoint}\n` +
            `<b>สถานะ:</b> ถูกจำกัดโควตาการใช้งาน (HTTP ${rl.status_code})\n` +
            tokensInfo +
            parallelInfo +
            `<b>เวลาที่ตรวจพบ:</b> ${timeStr}\n\n` +
            `🔗 <a href="https://open-status-page.sinon-7cf.workers.dev">ดูหน้าสถานะระบบ (Status Page)</a>`;
          await sendTelegramAlert(telegramBotToken, telegramChatId, alertMsg);
        }
      }
    }

    // Auto-create incident for hard outages if not already open
    for (const o of outageTargets) {
      const alreadyOpen = openIncidents?.some(
        i => i.name.toLowerCase().includes(o.endpoint.toLowerCase()) && !i.name.toLowerCase().includes('usage limit')
      );
      if (!alreadyOpen) {
        const incidentName = `Service Outage: ${o.endpoint}`;
        await supabase.from('incidents').insert({
          name: incidentName,
          impact: 'major',
          message: `Automated health check detected that ${o.endpoint} is currently unreachable or returning server errors (HTTP ${o.status_code}). Monitoring service recovery.`,
        });
        autoCreatedIncidents.push(incidentName);

        // Telegram alert broadcast (in Thai)
        if (telegramBotToken) {
          const timeStr = formatThaiDateTime();
          const alertMsg =
            `🚨 <b>แจ้งเตือน: ตรวจพบระบบขัดข้อง</b>\n\n` +
            `<b>บริการ:</b> ${o.endpoint}\n` +
            `<b>สถานะ:</b> ขัดข้อง (HTTP ${o.status_code})\n` +
            `<b>เวลาตอบสนอง:</b> ${Math.round(o.response_time_ms)} ms\n` +
            `<b>เวลาที่ตรวจพบ:</b> ${timeStr}\n\n` +
            `🔗 <a href="https://open-status-page.sinon-7cf.workers.dev">ดูหน้าสถานะระบบ (Status Page)</a>`;
          await sendTelegramAlert(telegramBotToken, telegramChatId, alertMsg);
        }
      }
    }

    // Auto-create incident for severe latency (> 2x normal threshold, e.g. > 7s on LLM)
    for (const d of severeLatencyTargets) {
      const alreadyOpen = openIncidents?.some(
        i => i.name.toLowerCase().includes(d.endpoint.toLowerCase()) && i.name.toLowerCase().includes('latency')
      );
      if (!alreadyOpen) {
        const incidentName = `Elevated Latency: ${d.endpoint}`;
        await supabase.from('incidents').insert({
          name: incidentName,
          impact: 'minor',
          message: `Automated health check detected severe response latency on ${d.endpoint} (${Math.round(d.response_time_ms)}ms). Requests are completing but experiencing significant delays.`,
        });
        autoCreatedIncidents.push(incidentName);

        // Telegram alert broadcast (in Thai)
        if (telegramBotToken) {
          const timeStr = formatThaiDateTime();
          const alertMsg =
            `⚠️ <b>แจ้งเตือน: ความเร็วในการตอบสนองช้ากว่าปกติ</b>\n\n` +
            `<b>บริการ:</b> ${d.endpoint}\n` +
            `<b>เวลาตอบสนอง:</b> ${Math.round(d.response_time_ms)} ms\n` +
            `<b>เวลาที่ตรวจพบ:</b> ${timeStr}\n\n` +
            `🔗 <a href="https://open-status-page.sinon-7cf.workers.dev">ดูหน้าสถานะระบบ (Status Page)</a>`;
          await sendTelegramAlert(telegramBotToken, telegramChatId, alertMsg);
        }
      }
    }

    // 3. Auto-close incidents if all endpoints are fully operational and healthy
    const allChecksHealthy = results.every(
      r => r.is_operational && r.status_code < 400 && r.response_time_ms <= (r.max_healthy_ms * 1.5)
    );
    if (allChecksHealthy && openIncidents && openIncidents.length > 0) {
      for (const inc of openIncidents) {
        const resolvedMessage = inc.message.includes('[Auto-Resolved]')
          ? inc.message
          : `${inc.message} — [Auto-Resolved] All service health checks and usage quotas have returned to normal operational status.`;

        await supabase
          .from('incidents')
          .update({
            resolved_at: new Date().toISOString(),
            message: resolvedMessage,
          })
          .eq('id', inc.id);

        autoResolvedIncidents.push(inc.name);
      }

      // Telegram recovery broadcast (in Thai)
      if (telegramBotToken) {
        const timeStr = formatThaiDateTime();
        const recoveryMsg =
          `✅ <b>ระบบกลับมาใช้งานได้ตามปกติแล้ว</b>\n\n` +
          `ระบบตรวจพบว่าทุกบริการและโมเดลสามารถตอบสนองได้อย่างสมบูรณ์ และโควตาพร้อมใช้งาน\n` +
          `<b>รายการที่แก้ไขแล้ว:</b> ${autoResolvedIncidents.join(', ')}\n` +
          `<b>เวลาที่กลับมาปกติ:</b> ${timeStr}\n\n` +
          `🔗 <a href="https://open-status-page.sinon-7cf.workers.dev">ดูหน้าสถานะระบบ (Status Page)</a>`;
        await sendTelegramAlert(telegramBotToken, telegramChatId, recoveryMsg);
      }
    }
  } catch (incidentLifecycleErr) {
    console.error('Incident lifecycle handling error:', incidentLifecycleErr);
  }

  const allHealthy = results.every(r => r.is_operational && r.status_code < 400);

  return new Response(
    JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      checks: results,
      all_healthy: allHealthy,
      auto_created: autoCreatedIncidents,
      auto_resolved: autoResolvedIncidents,
    }),
    {
      headers: { "Content-Type": "application/json" },
      status: 200,
    }
  );
});
