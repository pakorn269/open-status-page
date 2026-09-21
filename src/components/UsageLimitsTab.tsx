import React, { useMemo } from 'react';
import { 
  Zap, 
  Layers, 
  CreditCard, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Code2
} from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import type { ServiceComponent } from './ComponentList';
import type { PingLog } from './ResponseTimeChart';
import { UserQuotaChecker } from './UserQuotaChecker';
import { FaqSection } from './FaqSection';
import dayjs from 'dayjs';

interface UsageLimitsTabProps {
  components: ServiceComponent[];
  recentLogs: PingLog[];
  lastRefreshed: Date;
}

export const UsageLimitsTab: React.FC<UsageLimitsTabProps> = ({
  components,
  recentLogs,
  lastRefreshed,
}) => {
  const { t } = useTranslation();

  // Find representative telemetry values from components or latest logs
  const telemetry = useMemo(() => {
    // Check if any component is actively rate limited
    const isRateLimited = components.some(c => c.status === 'rate_limited');

    // Find first component with limits or default to gateway standard
    const qwenModel = components.find(c => c.id.includes('qwen') || c.id.includes('fp8')) || components[0];

    const maxParallel = qwenModel?.maxParallelRequests ?? 3;
    const remainingParallel = isRateLimited 
      ? (qwenModel?.remainingParallelRequests ?? 0)
      : (qwenModel?.remainingParallelRequests ?? maxParallel);

    const parallelInUse = Math.max(0, maxParallel - remainingParallel);
    const parallelPctRemaining = Math.max(0, Math.min(100, Math.round((remainingParallel / maxParallel) * 100)));

    const tokenLimit = qwenModel?.tokenLimit ?? 1000000;
    const remainingTokens = isRateLimited
      ? (qwenModel?.remainingTokens ?? 0)
      : (qwenModel?.remainingTokens ?? tokenLimit);
    const tokenPctRemaining = Math.max(0, Math.min(100, Math.round((remainingTokens / tokenLimit) * 100)));

    const keyMaxBudget = qwenModel?.keyMaxBudget ?? 50.0;
    const keySpend = qwenModel?.keySpend ?? 1.05;
    const budgetRemaining = Math.max(0, keyMaxBudget - keySpend);
    const budgetPctRemaining = Math.max(0, Math.min(100, Math.round((budgetRemaining / keyMaxBudget) * 100)));

    return {
      isRateLimited,
      maxParallel,
      remainingParallel,
      parallelInUse,
      parallelPctRemaining,
      tokenLimit,
      remainingTokens,
      tokenPctRemaining,
      keyMaxBudget,
      keySpend,
      budgetRemaining,
      budgetPctRemaining,
    };
  }, [components]);

  // Find 429 logs in the last 24h
  const throttledLogs = useMemo(() => {
    return recentLogs
      .filter(log => log.status_code === 429 || log.error_type === 'rate_limited')
      .slice(0, 10);
  }, [recentLogs]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className={`p-6 rounded-2xl border transition-all ${
        telemetry.isRateLimited
          ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/80 shadow-md shadow-amber-500/5'
          : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-xs'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl shrink-0 ${
              telemetry.isRateLimited
                ? 'bg-amber-500 text-white animate-pulse'
                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60'
            }`}>
              {telemetry.isRateLimited ? <AlertTriangle size={24} /> : <Zap size={24} />}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {t('usageLimits.title')}
                </h2>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                  telemetry.isRateLimited
                    ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    telemetry.isRateLimited ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'
                  }`} />
                  {telemetry.isRateLimited ? 'HTTP 429 Throttled' : t('usageLimits.allNormal')}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t('usageLimits.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 self-start md:self-center font-mono bg-gray-50 dark:bg-gray-800/60 px-3 py-1.5 rounded-lg border border-gray-200/60 dark:border-gray-700/60">
            <Clock size={13} />
            <span>{dayjs(lastRefreshed).format('HH:mm:ss')}</span>
          </div>
        </div>
      </div>

      {/* 3 Main Metric Cards with X% Remaining Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1: Concurrency */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-sm">
                <Zap size={16} />
                <span>{t('usageLimits.concurrencyTitle')}</span>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                telemetry.parallelPctRemaining > 50
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                  : telemetry.parallelPctRemaining > 0
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60'
              }`}>
                {telemetry.parallelPctRemaining}% {t('usageLimits.remaining')}
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 font-mono tracking-tight">
                {telemetry.remainingParallel}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                / {telemetry.maxParallel} slots free
              </span>
            </div>

            <p className="text-[11.5px] text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              {t('usageLimits.concurrencyDesc')}
            </p>
          </div>

          {/* Slot visual display */}
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mb-2">
              <span>{t('usageLimits.capacity')}</span>
              <span className="font-mono font-semibold text-gray-700 dark:text-gray-300">
                {t('usageLimits.freeSlots', { free: telemetry.remainingParallel, max: telemetry.maxParallel })}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: telemetry.maxParallel }).map((_, idx) => {
                const isOccupied = idx < telemetry.parallelInUse;
                return (
                  <div
                    key={idx}
                    className={`h-3 rounded-md transition-all ${
                      isOccupied
                        ? 'bg-amber-500 shadow-xs shadow-amber-500/20'
                        : 'bg-emerald-500/20 dark:bg-emerald-500/30 border border-emerald-500/40'
                    }`}
                    title={isOccupied ? `Slot ${idx + 1}: In Use` : `Slot ${idx + 1}: Available`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 font-mono">
              <span>Slot 1</span>
              <span>Slot 2</span>
              <span>Slot 3</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Token Quota (TPM) */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm">
                <Layers size={16} />
                <span>{t('usageLimits.tokensTitle')}</span>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                telemetry.tokenPctRemaining > 20
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60'
              }`}>
                {telemetry.tokenPctRemaining}% {t('usageLimits.remaining')}
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 font-mono tracking-tight">
                {(telemetry.remainingTokens / 1000).toFixed(0)}k
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                / {(telemetry.tokenLimit / 1000).toFixed(0)}k TPM
              </span>
            </div>

            <p className="text-[11.5px] text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              {t('usageLimits.tokensDesc')}
            </p>
          </div>

          {/* Progress bar */}
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mb-2 font-mono">
              <span>{t('usageLimits.remaining')}: {telemetry.remainingTokens.toLocaleString()} tokens</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">{telemetry.tokenPctRemaining}%</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden p-0.5">
              <div 
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${telemetry.tokenPctRemaining}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 font-mono">
              <span>0 TPM</span>
              <span>1,000,000 TPM Cap</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Key Budget */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold text-sm">
                <CreditCard size={16} />
                <span>{t('usageLimits.budgetTitle')}</span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60">
                {telemetry.budgetPctRemaining}% {t('usageLimits.remaining')}
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 font-mono tracking-tight">
                ${telemetry.budgetRemaining.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                / ${telemetry.keyMaxBudget.toFixed(2)}
              </span>
            </div>

            <p className="text-[11.5px] text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              {t('usageLimits.budgetDesc')}
            </p>
          </div>

          {/* Spend progress bar */}
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mb-2 font-mono">
              <span>{t('usageLimits.used')}: ${telemetry.keySpend.toFixed(2)}</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                ${telemetry.budgetRemaining.toFixed(2)} free
              </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden p-0.5">
              <div 
                className="bg-purple-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(telemetry.keySpend / telemetry.keyMaxBudget) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 font-mono">
              <span>$0.00</span>
              <span>$50.00 / Mo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal User API Key Quota Checker */}
      <UserQuotaChecker />

      {/* Per-Model Quota Breakdown */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-indigo-500" />
          <h3 className="text-[15px] font-bold text-gray-900 dark:text-gray-100">
            {t('usageLimits.perModelTitle')}
          </h3>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {components.map((component) => {
            const isModelRateLimited = component.status === 'rate_limited';
            const compTokens = component.remainingTokens ?? 1000000;
            const compTokenLimit = component.tokenLimit ?? 1000000;
            const compTokenPct = Math.round((compTokens / compTokenLimit) * 100);

            return (
              <div key={component.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {component.name}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      isModelRateLimited
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                        : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                    }`}>
                      {isModelRateLimited ? '429 Rate Limited' : '200 OK Normal'}
                    </span>
                    {component.responseTimeMs && (
                      <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500">
                        {component.responseTimeMs}ms
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Anthropic API compatible model endpoint
                  </p>
                </div>

                <div className="flex items-center gap-6 self-start md:self-center shrink-0">
                  {/* Concurrency slots */}
                  <div className="text-right">
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 block mb-0.5">Concurrency</span>
                    <div className="flex items-center gap-1 font-mono text-xs font-semibold">
                      <span className={isModelRateLimited ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}>
                        {isModelRateLimited ? '0/3' : '3/3'}
                      </span>
                      <span className="text-gray-400 text-[10px]">slots</span>
                    </div>
                  </div>

                  {/* TPM tokens */}
                  <div className="text-right min-w-[110px]">
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 block mb-0.5">TPM Tokens</span>
                    <div className="flex items-center justify-end gap-1.5 font-mono text-xs font-semibold">
                      <span>{(compTokens / 1000).toFixed(0)}k</span>
                      <span className="text-gray-400 text-[10px]">({compTokenPct}%)</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 24-Hour 429 Incidents Log */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <Clock size={17} className="text-gray-500 dark:text-gray-400" />
            <h3 className="text-[15px] font-bold text-gray-900 dark:text-gray-100">
              {t('usageLimits.historyTitle')}
            </h3>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
            {t('componentList.last288Checks')}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          {t('usageLimits.historySubtitle')}
        </p>

        {throttledLogs.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-center bg-gray-50/50 dark:bg-gray-800/30 rounded-lg border border-dashed border-gray-200 dark:border-gray-800">
            <ShieldCheck size={36} className="text-emerald-500 mb-2" />
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {t('usageLimits.no429In24h')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-500">
                  <th className="py-2.5 px-3">{t('usageLimits.colTimestamp')}</th>
                  <th className="py-2.5 px-3">{t('usageLimits.colEndpoint')}</th>
                  <th className="py-2.5 px-3">{t('usageLimits.colStatus')}</th>
                  <th className="py-2.5 px-3">{t('usageLimits.colDetails')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-mono">
                {throttledLogs.map((log, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                    <td className="py-2 px-3 text-gray-600 dark:text-gray-300">
                      {dayjs(log.created_at).format('YYYY-MM-DD HH:mm:ss')}
                    </td>
                    <td className="py-2 px-3 font-sans font-medium text-gray-800 dark:text-gray-200">
                      {log.endpoint}
                    </td>
                    <td className="py-2 px-3">
                      <span className="px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                        HTTP 429
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-500 dark:text-gray-400 font-sans">
                      {log.error_message || 'Parallel request cap exceeded or TPM quota exhausted'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Developer Best Practices Guidelines */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50/60 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-900/60">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0">
            <Code2 size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {t('usageLimits.devTipsTitle')}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
              {t('usageLimits.devTipsDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* FAQ & Q&A Section */}
      <FaqSection />
    </div>
  );
};
