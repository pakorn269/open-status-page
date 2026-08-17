import dayjs from 'dayjs';
import type { Language } from './translations';

/**
 * Translates automated and custom incident titles to the target language.
 */
export function translateIncidentTitle(title: string, language: Language): string {
  if (language === 'en' || !title) return title;

  // Pattern: Elevated Latency: <Endpoint>
  const latencyMatch = title.match(/^Elevated\s+Latency:\s*(.+)$/i);
  if (latencyMatch) {
    return `ความหน่วงสูงขึ้น: ${latencyMatch[1]}`;
  }

  // Pattern: Service Outage: <Endpoint>
  const outageMatch = title.match(/^Service\s+Outage:\s*(.+)$/i);
  if (outageMatch) {
    return `บริการขัดข้อง: ${outageMatch[1]}`;
  }

  // Pattern: Degraded Performance: <Endpoint>
  const degradedMatch = title.match(/^Degraded\s+Performance:\s*(.+)$/i);
  if (degradedMatch) {
    return `ประสิทธิภาพลดลง: ${degradedMatch[1]}`;
  }

  // Pattern: Under Maintenance: <Endpoint> / Scheduled Maintenance: <Endpoint>
  const maintMatch = title.match(/^(?:Under|Scheduled)\s*Maintenance:\s*(.+)$/i);
  if (maintMatch) {
    return `อยู่ระหว่างปรับปรุงระบบ: ${maintMatch[1]}`;
  }

  return title;
}

/**
 * Translates automated health-check messages and status updates to Thai if active.
 */
export function translateIncidentMessage(message: string, language: Language): string {
  if (language === 'en' || !message) return message;

  let translated = message;

  // 1. Match: "Automated health check detected that <Endpoint> is currently unreachable or returning server errors (HTTP <code>). Monitoring service recovery."
  const outageRegex = /Automated\s+health\s+check\s+detected\s+that\s+(.+?)\s+is\s+currently\s+unreachable\s+or\s+returning\s+server\s+errors\s*\(HTTP\s*(\d+)\)\.?\s*Monitoring\s+service\s+recovery\.?/gi;
  translated = translated.replace(
    outageRegex,
    (_, endpoint, code) =>
      `ระบบตรวจสอบสุขภาพอัตโนมัติตรวจพบว่า ${endpoint.trim()} ไม่สามารถเข้าถึงได้หรือส่งคืนข้อผิดพลาดจากเซิร์ฟเวอร์ (HTTP ${code}) กำลังเฝ้าติดตามการฟื้นตัวของระบบ`
  );

  // 2. Match: "Automated health check detected severe response latency on <Endpoint> (<ms>ms). Requests are completing but experiencing significant delays."
  const latencyRegex = /Automated\s+health\s+check\s+detected\s+severe\s+response\s+latency\s+on\s+(.+?)\s+\((\d+)ms\)\.?\s*Requests\s+are\s+completing\s+but\s+experiencing\s+significant\s+delays\.?/gi;
  translated = translated.replace(
    latencyRegex,
    (_, endpoint, ms) =>
      `ระบบตรวจสอบสุขภาพอัตโนมัติตรวจพบความหน่วงในการตอบสนองสูงบน ${endpoint.trim()} (${ms}ms) คำขอยังคงประมวลผลสำเร็จแต่อาจพบความล่าช้าอย่างมีนัยสำคัญ`
  );

  // 3. Match: "[Auto-Resolved] All service health checks have returned to normal operational status."
  translated = translated.replace(
    /(?:[—–-]\s*)?\[Auto-Resolved\]\s*All\s+service\s+health\s+checks\s+have\s+returned\s+to\s+normal\s+operational\s+status\.?/gi,
    '— [แก้ไขอัตโนมัติ] การตรวจสอบสุขภาพของทุกบริการกลับสู่สถานะการทำงานปกติแล้ว'
  );

  // 4. Match: "— This incident has been resolved." or "— Resolved."
  translated = translated.replace(
    /(?:[—–-]\s*)?(?:This incident has been resolved|Resolved)\.?/gi,
    '— ได้รับการแก้ไขเรียบร้อยแล้ว'
  );

  return translated;
}

/**
 * Formats incident timestamps localized by language.
 * e.g., "17 ส.ค., 14:55 UTC" in Thai, "Aug 17, 14:55 UTC" in English
 */
export function formatIncidentTimestamp(dateStr: string, language: Language): string {
  if (!dateStr) return '';
  const d = dayjs(dateStr).locale(language);
  if (!d.isValid()) return dateStr;

  if (language === 'th') {
    return `${d.format('D MMM')}, ${d.format('HH:mm')} UTC`;
  }
  return d.format('MMM D, HH:mm [UTC]');
}
