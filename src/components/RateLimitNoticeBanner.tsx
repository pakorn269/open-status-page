import React, { useState } from 'react';
import { Zap, X, Users, Gauge } from 'lucide-react';
import type { ServiceComponent } from './ComponentList';
import { useTranslation } from '../lib/i18n';

interface RateLimitNoticeBannerProps {
  rateLimitedComponents: ServiceComponent[];
  onNavigateToLimitsTab?: () => void;
}

export const RateLimitNoticeBanner: React.FC<RateLimitNoticeBannerProps> = ({
  rateLimitedComponents,
  onNavigateToLimitsTab,
}) => {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);

  if (rateLimitedComponents.length === 0 || dismissed) {
    return null;
  }

  return (
    <div className="relative overflow-hidden mb-6 rounded-xl border border-amber-500/30 dark:border-amber-500/40 bg-gradient-to-r from-amber-50/90 via-orange-50/60 to-amber-50/90 dark:from-amber-950/40 dark:via-orange-950/25 dark:to-amber-950/40 p-4 sm:p-5 shadow-lg shadow-amber-500/5 transition-all animate-fade-in">
      {/* Subtle glowing ambient background circle */}
      <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-amber-400/10 dark:bg-amber-500/10 blur-2xl pointer-events-none" />

      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-start gap-3.5">
          {/* Animated lightning bolt icon */}
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/15 dark:bg-amber-500/25 text-amber-600 dark:text-amber-400 shrink-0 border border-amber-500/30">
            <span className="absolute -inset-1 rounded-xl bg-amber-400/20 dark:bg-amber-400/10 animate-ping opacity-75" />
            <Zap size={20} className="relative z-10" />
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-[14px] sm:text-[15px] font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <span>{t('rateLimitBanner.title')}</span>
              </h3>
              <span className="text-[10px] uppercase font-mono font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                HTTP 429 Active
              </span>
            </div>

            <p className="text-[12.5px] sm:text-[13px] text-amber-800/90 dark:text-amber-300/80 leading-relaxed max-w-3xl">
              {t('rateLimitBanner.desc')}
            </p>

            {/* Quick Metrics Breakdown for Throttled Components */}
            <div className="pt-2 flex flex-wrap gap-2.5">
              {rateLimitedComponents.map(c => {
                const maxReq = c.maxParallelRequests ?? 3;
                const remReq = c.remainingParallelRequests ?? 0;
                const inUse = Math.max(0, maxReq - remReq);

                return (
                  <div
                    key={c.id}
                    className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/80 dark:bg-gray-900/80 border border-amber-500/20 shadow-2xs text-xs"
                  >
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {c.name.replace('Model: ', '')}
                    </span>

                    {/* Concurrency blocks */}
                    <div className="flex items-center gap-1" title={t('rateLimitBanner.concurrencyInUse', { inUse, total: maxReq })}>
                      <Users size={12} className="text-amber-600 dark:text-amber-400" />
                      <div className="flex gap-0.5">
                        {Array.from({ length: maxReq }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-2.5 h-3.5 rounded-xs transition-colors ${
                              i < inUse
                                ? 'bg-amber-500 shadow-xs shadow-amber-500/50 animate-pulse'
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-mono font-medium text-[11px] text-amber-700 dark:text-amber-400 ml-0.5">
                        {inUse}/{maxReq}
                      </span>
                    </div>

                    {/* Tokens */}
                    {c.remainingTokens !== null && c.remainingTokens !== undefined && (
                      <div className="flex items-center gap-1 border-l border-gray-200 dark:border-gray-700 pl-2">
                        <Gauge size={12} className="text-gray-400" />
                        <span className="font-mono text-[11px] text-gray-700 dark:text-gray-300">
                          {c.remainingTokens.toLocaleString()} tokens
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Jump to FAQ Link */}
              <a
                href="#faq-limits"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('faq-limits')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-850 dark:text-amber-200 border border-amber-500/30 text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>{t('rateLimitBanner.viewFaqBtn')}</span>
              </a>

              {/* Jump to Usage Limits Tab */}
              {onNavigateToLimitsTab && (
                <button
                  type="button"
                  onClick={onNavigateToLimitsTab}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Zap size={13} />
                  <span>{t('tabs.limits')} →</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 p-1 rounded-lg hover:bg-amber-500/15 transition-colors cursor-pointer shrink-0"
          title={t('common.close')}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
