import React, { useState } from 'react';
import { Megaphone, History, ExternalLink, X, ChevronRight, Clock, Sparkles, AlertCircle } from 'lucide-react';
import dayjs from 'dayjs';
import { useTranslation } from '../lib/i18n';

export interface ChangeEvent {
  id: string;
  date: string;
  category: 'model_update' | 'maintenance' | 'feature' | 'notice';
  titleEn: string;
  titleTh: string;
  descEn: string;
  descTh: string;
  refUrl?: string;
  refLabelEn?: string;
  refLabelTh?: string;
  isPinned?: boolean;
}

export const SYSTEM_CHANGES: ChangeEvent[] = [
  {
    id: 'qwen-bf16-launch',
    date: '2026-08-23T19:29:00+07:00',
    category: 'model_update',
    isPinned: true,
    titleEn: 'Qwen 3.8 27B Full Precision (BF16 / 256k Context) Launched',
    titleTh: 'เปิดตัวโมเดล Qwen 3.8 27B เวอร์ชั่นเต็ม (BF16 / 256k Context)',
    descEn: 'นายอาร์ม announced that the full precision Qwen 3.8 27B model (bf16 / 256k context window) is now available under model name "qwen3.8-27b". The previous "qwen3.8-27b-fp8" (fp8 / 128k context) remains fully operational.',
    descTh: 'นายอาร์มได้เปิดให้บริการโมเดล Qwen 3.8 27B เวอร์ชั่นเต็ม (BF16 พร้อม 256k Context Window) ภายใต้ชื่อ "qwen3.8-27b" โดยโมเดลเดิม "qwen3.8-27b-fp8" (FP8 / 128k Context) ยังคงเปิดให้บริการตามปกติ',
    refUrl: 'https://discord.com/channels/826099393694400574/1512469795218653417/1541061828715745402',
    refLabelEn: 'Discord Announcement by 9ARM',
    refLabelTh: 'ประกาศใน Discord โดย นายอาร์ม',
  },
  {
    id: 'deepseek-testing-end',
    date: '2026-08-23T00:57:00+07:00',
    category: 'model_update',
    isPinned: false,
    titleEn: 'DeepSeek v4 Flash Testing Concluded (Temporarily Offline)',
    titleTh: 'ยุติช่วงทดสอบ DeepSeek v4 Flash ชั่วคราว',
    descEn: 'นายอาร์ม announced that DeepSeek v4 Flash testing has finished and the model is temporarily disabled. Status page health check probes for DeepSeek are paused to avoid false downtime alarms. The model will return soon.',
    descTh: 'นายอาร์มได้ประกาศสิ้นสุดการทดสอบโมเดล DeepSeek v4 Flash ชั่วคราว และจะกลับมาเปิดใหม่อีกครั้งในเร็วๆ นี้ หน้าตรวจเช็คสถานะได้หยุดการทดสอบโมเดลดังกล่าวชั่วคราว เพื่อป้องกันการแจ้งเตือนระบบขัดข้องผิดพลาด',
    refUrl: 'https://discord.com/channels/826099393694400574/1512469795218653417/1540781941148622928',
    refLabelEn: 'Discord Announcement',
    refLabelTh: 'ประกาศใน Discord โดย นายอาร์ม',
  },
  {
    id: 'multi-model-monitoring',
    date: '2026-08-17T12:00:00+07:00',
    category: 'feature',
    titleEn: 'Multi-Model Inference & Latency Health Probing',
    titleTh: 'เปิดระบบตรวจวัดสถานะ Inference และ Latency รายโมเดล',
    descEn: 'Added dedicated automated health checking and individual 24-hour latency sparklines for Qwen 3.8 27B and DeepSeek v4 Flash models on gateway.9arm.co.',
    descTh: 'เพิ่มระบบตรวจสอบความพร้อมใช้งานและกราฟ Latency 24 ชม. แยกตามโมเดล (Qwen 3.8 27B และ DeepSeek v4 Flash)',
    refUrl: 'https://github.com/pakorn269/open-status-page',
    refLabelEn: 'GitHub Repository',
    refLabelTh: 'คลังซอร์สโค้ด GitHub',
  },
  {
    id: 'telegram-broadcast-launch',
    date: '2026-08-10T18:00:00+07:00',
    category: 'feature',
    titleEn: 'Telegram 24/7 Broadcast Notifications Launch',
    titleTh: 'เปิดตัวช่องทางการแจ้งเตือนอัตโนมัติผ่าน Telegram 24 ชม.',
    descEn: 'Launched automated Telegram incident and recovery broadcasting channel (@gateway9armstatus) in Thai with instant zero-delay alerts.',
    descTh: 'เปิดตัวช่องทาง Telegram (@gateway9armstatus) แจ้งเตือนเหตุขัดข้องและแจ้งเตือนระบบฟื้นตัวอัตโนมัติแบบ Real-time ตลอด 24 ชั่วโมง',
    refUrl: 'https://t.me/gateway9armstatus',
    refLabelEn: 'Telegram Channel',
    refLabelTh: 'ช่อง Telegram @gateway9armstatus',
  },
];

export const Announcements: React.FC = () => {
  const { t, language } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const latestPinned = SYSTEM_CHANGES.find(c => c.isPinned) || SYSTEM_CHANGES[0];

  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`announcement_dismissed_${latestPinned.id}`) === 'true';
    }
    return false;
  });

  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(`announcement_dismissed_${latestPinned.id}`, 'true');
  };

  const handleRestore = () => {
    setIsDismissed(false);
    localStorage.removeItem(`announcement_dismissed_${latestPinned.id}`);
  };

  const getCategoryBadge = (cat: ChangeEvent['category']) => {
    switch (cat) {
      case 'model_update':
        return {
          label: t('announcements.badgeModelUpdate'),
          bg: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/60',
        };
      case 'maintenance':
        return {
          label: t('announcements.badgeMaintenance'),
          bg: 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-900/60',
        };
      case 'feature':
        return {
          label: t('announcements.badgeFeature'),
          bg: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60',
        };
      case 'notice':
      default:
        return {
          label: t('announcements.badgeNotice'),
          bg: 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-900/60',
        };
    }
  };

  const filteredChanges = SYSTEM_CHANGES.filter(change => {
    if (selectedFilter === 'all') return true;
    return change.category === selectedFilter;
  });

  return (
    <>
      {/* 1. Main Notice Banner (if not dismissed) */}
      {!isDismissed ? (
        <div className="mb-8 p-4 sm:p-4.5 rounded-lg bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/15 dark:via-amber-500/5 border border-amber-200/90 dark:border-amber-800/60 shadow-xs relative overflow-hidden transition-all">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="p-2 bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-md shrink-0 mt-0.5">
                <Megaphone size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getCategoryBadge(latestPinned.category).bg}`}>
                    {getCategoryBadge(latestPinned.category).label}
                  </span>
                  <span className="text-[12px] text-gray-500 dark:text-gray-400 flex items-center gap-1 font-mono">
                    <Clock size={12} />
                    {dayjs(latestPinned.date).locale(language).format(language === 'th' ? 'D MMMM YYYY, HH:mm น.' : 'MMM D, YYYY, HH:mm')}
                  </span>
                </div>

                <h4 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {language === 'th' ? latestPinned.titleTh : latestPinned.titleEn}
                </h4>

                <p className="text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                  {language === 'th' ? latestPinned.descTh : latestPinned.descEn}
                </p>

                <div className="flex items-center gap-3 flex-wrap text-xs">
                  {latestPinned.refUrl && (
                    <a
                      href={latestPinned.refUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    >
                      <ExternalLink size={13} />
                      <span>{t('announcements.discordRefBtn')}</span>
                    </a>
                  )}

                  <span className="text-gray-300 dark:text-gray-700">·</span>

                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <History size={13} />
                    <span>{t('announcements.viewHistoryBtn')}</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer shrink-0"
              title={t('announcements.dismiss')}
              aria-label={t('announcements.dismiss')}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        /* If dismissed: Show a slim, subtle access pill to open changelog/announcements anytime */
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200/80 dark:border-amber-900/60 rounded-full transition-colors cursor-pointer shadow-2xs"
          >
            <Megaphone size={13} />
            <span>{t('announcements.showNotice')}</span>
          </button>
        </div>
      )}

      {/* 2. Change History & Announcements Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-md">
                    <History size={18} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {t('changeHistory.modalTitle')}
                  </h3>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('changeHistory.modalSubtitle')}
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                aria-label={t('common.close')}
              >
                <X size={18} />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="px-5 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2 flex-wrap text-xs">
              <span className="text-gray-500 dark:text-gray-400 font-medium">{t('changeHistory.filterLabel')}</span>
              {[
                { key: 'all', label: t('changeHistory.allChanges') },
                { key: 'model_update', label: t('announcements.badgeModelUpdate') },
                { key: 'feature', label: t('announcements.badgeFeature') },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setSelectedFilter(f.key)}
                  className={`px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                    selectedFilter === f.key
                      ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Timeline List */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1 divide-y divide-gray-100 dark:divide-gray-800/80">
              {filteredChanges.map((change, idx) => {
                const badge = getCategoryBadge(change.category);
                return (
                  <div key={change.id} className={`flex gap-4 ${idx > 0 ? 'pt-6' : ''}`}>
                    {/* Timeline dot & line */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-2xs">
                        {change.category === 'model_update' ? <AlertCircle size={15} /> : <Sparkles size={15} />}
                      </div>
                      {idx < filteredChanges.length - 1 && (
                        <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-800 my-1" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                          {dayjs(change.date).locale(language).format(language === 'th' ? 'D MMMM YYYY, HH:mm น.' : 'MMM D, YYYY, HH:mm')}
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {language === 'th' ? change.titleTh : change.titleEn}
                      </h4>

                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                        {language === 'th' ? change.descTh : change.descEn}
                      </p>

                      {change.refUrl && (
                        <a
                          href={change.refUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <ExternalLink size={12} />
                          <span>{language === 'th' ? (change.refLabelTh || t('changeHistory.referenceLink')) : (change.refLabelEn || t('changeHistory.referenceLink'))}</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900/90 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center text-xs">
              {isDismissed && (
                <button
                  onClick={handleRestore}
                  className="text-amber-600 dark:text-amber-400 hover:underline font-medium cursor-pointer"
                >
                  {t('announcements.showNotice')}
                </button>
              )}
              <div className="ml-auto">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-white text-white dark:text-gray-900 font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  {t('changeHistory.closeBtn')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
