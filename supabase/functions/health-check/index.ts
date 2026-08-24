import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

interface TargetCheck {
  id: string;
  name: string;
  maxHealthyMs: number; // Tailored latency threshold (HTTP vs LLM GPU inference)
  check: (apiKey: string) => Promise<{ status: number; ok: boolean }>;
}

const TARGETS: TargetCheck[] = [
  {
    id: 'gateway-http',
    name: 'API Gateway (HTTP / Models)',
    maxHealthyMs: 1500, // Gateway proxy & model list should respond under 1.5s
    check: async (apiKey: string) => {
      const res = await fetch("https://gateway.9arm.co/v1/models", {
        method: "GET",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
      });
      return { status: res.status, ok: res.status < 500 };
    },
  },
  {
    id: 'model-qwen',
    name: 'Model: Qwen 3.8 27B',
    maxHealthyMs: 3500, // LLM tokenizer + GPU inference normal range: 0.3s - 3.5s
    check: async (apiKey: string) => {
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
      return { status: res.status, ok: res.status < 500 };
    },
  },
  // DeepSeek is temporarily disabled per 9arm announcement ("Deepseek will be disabled NOW... will return soon")
  // Uncomment when DeepSeek is restored:
  // {
  //   id: 'model-deepseek',
  //   name: 'Model: DeepSeek v4 Flash',
  //   maxHealthyMs: 3500,
  //   check: async (apiKey: string) => {
  //     const res = await fetch("https://gateway.9arm.co/v1/messages", {
  //       method: "POST",
  //       headers: {
  //         "x-api-key": apiKey,
  //         "anthropic-version": "2023-06-01",
  //         "content-type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         model: "deepseek-v4-flash-0731",
  //         messages: [{ role: "user", content: "hi" }],
  //         max_tokens: 5,
  //       }),
  //     });
  //     return { status: res.status, ok: res.status < 500 };
  //   },
  // },
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
        const { status, ok } = await target.check(effectiveKey);
        const responseTimeMs = Date.now() - startTime;
        return {
          endpoint: target.name,
          max_healthy_ms: target.maxHealthyMs,
          status_code: status,
          response_time_ms: responseTimeMs,
          is_operational: ok,
        };
      } catch (err: any) {
        const responseTimeMs = Date.now() - startTime;
        return {
          endpoint: target.name,
          max_healthy_ms: target.maxHealthyMs,
          status_code: 0,
          response_time_ms: responseTimeMs,
          is_operational: false,
          error: err.message,
        };
      }
    })
  );

  // Insert all check logs into api_status_logs
  const rowsToInsert = results.map(r => ({
    endpoint: r.endpoint,
    status_code: r.status_code,
    response_time_ms: r.response_time_ms,
    is_operational: r.is_operational,
  }));

  const { error: insertError } = await supabase
    .from('api_status_logs')
    .insert(rowsToInsert);

  if (insertError) {
    console.error('Failed to insert multi-endpoint logs:', insertError);
  }

  // --- Automated Incident Lifecycle & Telegram Broadcast in Thai ---
  let autoCreatedIncidents: string[] = [];
  let autoResolvedIncidents: string[] = [];

  try {
    // 1. Fetch current open incidents
    const { data: openIncidents } = await supabase
      .from('incidents')
      .select('id, name, message')
      .is('resolved_at', null);

    // 2. Identify hard outages and severe latency degradation
    const outageTargets = results.filter(r => !r.is_operational || r.status_code >= 500);
    const severeLatencyTargets = results.filter(
      r => r.is_operational && r.status_code < 500 && r.response_time_ms > (r.max_healthy_ms * 2)
    );

    // Auto-create incident for hard outages if not already open
    for (const o of outageTargets) {
      const alreadyOpen = openIncidents?.some(i => i.name.toLowerCase().includes(o.endpoint.toLowerCase()));
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
      const alreadyOpen = openIncidents?.some(i => i.name.toLowerCase().includes(d.endpoint.toLowerCase()));
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
    const allChecksHealthy = results.every(r => r.is_operational && r.status_code < 500 && r.response_time_ms <= (r.max_healthy_ms * 1.5));
    if (allChecksHealthy && openIncidents && openIncidents.length > 0) {
      for (const inc of openIncidents) {
        const resolvedMessage = inc.message.includes('[Auto-Resolved]')
          ? inc.message
          : `${inc.message} — [Auto-Resolved] All service health checks have returned to normal operational status.`;

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
          `ระบบตรวจพบว่าทุกบริการและโมเดลสามารถตอบสนองได้อย่างสมบูรณ์แล้ว\n` +
          `<b>รายการที่แก้ไขแล้ว:</b> ${autoResolvedIncidents.join(', ')}\n` +
          `<b>เวลาที่กลับมาปกติ:</b> ${timeStr}\n\n` +
          `🔗 <a href="https://open-status-page.sinon-7cf.workers.dev">ดูหน้าสถานะระบบ (Status Page)</a>`;
        await sendTelegramAlert(telegramBotToken, telegramChatId, recoveryMsg);
      }
    }
  } catch (incidentLifecycleErr) {
    console.error('Incident lifecycle handling error:', incidentLifecycleErr);
  }

  const allHealthy = results.every(r => r.is_operational && r.status_code < 500);

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
