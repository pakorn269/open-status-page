import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  ShieldCheck, 
  Terminal, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Loader2, 
  Clock, 
  Zap, 
  CreditCard, 
  Layers, 
  AlertCircle,
  Trash2,
  X,
  ExternalLink,
  RotateCw
} from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import dayjs from 'dayjs';

export interface QuotaResult {
  valid: boolean;
  statusCode?: number;
  error?: string;
  latencyMs?: number;
  isRateLimited?: boolean;
  maxParallel?: number;
  remainingParallel?: number;
  parallelPctRemaining?: number;
  tokenLimit?: number;
  remainingTokens?: number;
  tokenPctRemaining?: number;
  keyMaxBudget?: number;
  keySpend?: number;
  budgetRemaining?: number;
  budgetPctRemaining?: number;
  retryAfter?: number;
  checkedAt: string;
}

export const UserQuotaChecker: React.FC = () => {
  const { t } = useTranslation();
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuotaResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [showCurlHelper, setShowCurlHelper] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Keyboard accessibility for ESC to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ssqvojmcrubohsudmrta.supabase.co';

  const handleCheck = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanKey = apiKey.trim();
    if (!cleanKey) {
      setError(t('userQuotaChecker.emptyInputAlert'));
      return;
    }

    setLoading(true);
    setError(null);
    setCooldown(3); // 3-second anti-spam cooldown

    try {
      const endpoint = `${supabaseUrl}/functions/v1/check-quota`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-api-key': cleanKey,
        },
        body: JSON.stringify({ apiKey: cleanKey }),
      });

      const data: QuotaResult = await res.json();

      if (res.status === 429 || data.statusCode === 429) {
        if (data.retryAfter) setCooldown(data.retryAfter);
        setError(data.error || t('userQuotaChecker.rateLimitWarning'));
        setResult(null);
        setIsModalOpen(false);
        return;
      }

      if (!res.ok && !data.statusCode) {
        throw new Error(data.error || `HTTP error ${res.status}`);
      }

      setResult(data);
      if (data.valid) {
        setIsModalOpen(true);
      } else {
        setError(data.error || t('userQuotaChecker.statusInvalid'));
        setIsModalOpen(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`${t('userQuotaChecker.errorPrefix')} ${msg}`);
      setResult(null);
      setIsModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setApiKey('');
    setResult(null);
    setError(null);
    setIsModalOpen(false);
  };

  const curlCommand = `curl -i https://gateway.9arm.co/v1/messages \\
  -H "x-api-key: ${apiKey.trim() || 'YOUR_API_KEY'}" \\
  -H "anthropic-version: 2023-06-01" \\
  -H "content-type: application/json" \\
  -d '{"model":"qwen3.8-27b-fp8","messages":[{"role":"user","content":"hi"}],"max_tokens":1}'`;

  const handleCopyCurl = async () => {
    try {
      await navigator.clipboard.writeText(curlCommand);
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopySummary = async () => {
    if (!result) return;
    const summaryText = [
      `=== 9ARM Gateway Quota Inspection Report ===`,
      `Status: ${result.statusCode === 200 ? 'HTTP 200 (Healthy)' : `HTTP ${result.statusCode}`}`,
      `Checked: ${dayjs(result.checkedAt).format('YYYY-MM-DD HH:mm:ss')} (${result.latencyMs}ms latency)`,
      `Concurrency: ${result.remainingParallel}/${result.maxParallel} slots free (${result.parallelPctRemaining}% remaining)`,
      `Token Quota: ${(result.remainingTokens ?? 1000000).toLocaleString()} / ${(result.tokenLimit ?? 1000000).toLocaleString()} TPM (${result.tokenPctRemaining}% remaining)`,
      `Monthly Budget: $${(result.budgetRemaining ?? 50).toFixed(2)} / $${(result.keyMaxBudget ?? 50).toFixed(2)} remaining (${result.budgetPctRemaining}% remaining, Used: $${(result.keySpend ?? 0).toFixed(2)})`,
      `Note: Evaluated for your personal API key (Zero-Knowledge, not retained).`
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 sm:p-6 shadow-xs transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
            <KeyRound size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                {t('userQuotaChecker.title')}
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <span>{t('userQuotaChecker.personalBadge')}</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {t('userQuotaChecker.subtitle')}
            </p>
          </div>
        </div>

        {/* Toggle cURL instruction button */}
        <button
          type="button"
          onClick={() => setShowCurlHelper(!showCurlHelper)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors cursor-pointer self-start sm:self-center"
        >
          <Terminal size={13} />
          <span>{showCurlHelper ? 'Hide cURL' : 'cURL Terminal'}</span>
        </button>
      </div>

      {/* Distinction & Privacy Callout */}
      <div className="mb-5 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/40 text-[11.5px] text-blue-900/90 dark:text-blue-300/90 flex items-start gap-2.5 leading-relaxed">
        <ShieldCheck size={16} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">{t('userQuotaChecker.securityBadge')}: </span>
          <span>{t('userQuotaChecker.securityDisclaimer')}</span>
        </div>
      </div>

      {/* Optional cURL instruction snippet */}
      {showCurlHelper && (
        <div className="mb-5 p-3.5 rounded-lg bg-gray-900 text-gray-200 font-mono text-xs border border-gray-800 relative group">
          <div className="flex items-center justify-between mb-2 text-[11px] text-gray-400 font-sans">
            <span>{t('userQuotaChecker.curlDesc')}</span>
            <button
              onClick={handleCopyCurl}
              className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              {copiedCurl ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copiedCurl ? t('userQuotaChecker.curlCopied') : t('userQuotaChecker.copyCurlBtn')}</span>
            </button>
          </div>
          <pre className="overflow-x-auto whitespace-pre p-2 bg-black/40 rounded text-amber-300/90">
            {curlCommand}
          </pre>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleCheck} className="space-y-4">
        <div>
          <label 
            htmlFor="user-api-key-input"
            className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
          >
            {t('userQuotaChecker.inputLabel')}
          </label>
          <div className="relative flex items-center">
            <input
              id="user-api-key-input"
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                if (error) setError(null);
              }}
              placeholder={t('userQuotaChecker.inputPlaceholder')}
              autoComplete="off"
              spellCheck={false}
              className="w-full pl-3.5 pr-20 py-2.5 rounded-lg text-xs sm:text-sm font-mono border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-2xs"
            />
            <div className="absolute right-2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="submit"
            disabled={loading || !apiKey.trim() || cooldown > 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>{t('userQuotaChecker.checkingBtn')}</span>
              </>
            ) : cooldown > 0 ? (
              <>
                <Clock size={15} className="animate-pulse" />
                <span>{t('userQuotaChecker.cooldownBtn', { seconds: cooldown })}</span>
              </>
            ) : (
              <>
                <Zap size={15} />
                <span>{t('userQuotaChecker.checkBtn')}</span>
              </>
            )}
          </button>

          {(apiKey || result) && (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <Trash2 size={14} />
              <span>{t('userQuotaChecker.clearBtn')}</span>
            </button>
          )}

          {result && result.valid && !isModalOpen && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer ml-auto"
            >
              <ExternalLink size={14} />
              <span>{t('userQuotaChecker.viewModalBtn')}</span>
            </button>
          )}
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5 animate-in fade-in duration-200">
          <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-500" />
          <div className="leading-relaxed">
            <span className="font-semibold">{error}</span>
          </div>
        </div>
      )}

      {/* Compact Status Strip (When results are ready) */}
      {result && result.valid && !isModalOpen && (
        <div className="mt-4 p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div>
              <div className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 flex-wrap">
                <span>{t('userQuotaChecker.resultTitle')}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-mono font-semibold">
                  HTTP {result.statusCode} OK
                </span>
              </div>
              <div className="text-[11.5px] text-gray-500 dark:text-gray-400 font-mono mt-0.5 flex items-center gap-2 flex-wrap">
                <span>${(result.budgetRemaining ?? 0).toFixed(2)} free</span>
                <span>•</span>
                <span>{result.remainingParallel}/{result.maxParallel} slots</span>
                <span>•</span>
                <span>{result.latencyMs}ms latency</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto shrink-0"
          >
            <ExternalLink size={13} />
            <span>{t('userQuotaChecker.viewModalBtn')}</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DIALOG / MODAL POPUP FOR PERSONAL QUOTA REPORT */}
      {/* ========================================================================= */}
      {isModalOpen && result && result.valid && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5 animate-in zoom-in-95 duration-200 my-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 shrink-0 mt-0.5">
                  <KeyRound size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {t('userQuotaChecker.modalTitle')}
                    </h2>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                      {t('userQuotaChecker.personalBadge')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t('userQuotaChecker.modalSubtitle')}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer shrink-0"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Clear Separation / Personal Scope Notice */}
            <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2.5 leading-relaxed">
              <ShieldCheck size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">{t('userQuotaChecker.personalBadge')}: </span>
                <span>{t('userQuotaChecker.personalNotice')}</span>
              </div>
            </div>

            {/* Status & Latency Banner */}
            <div className="flex items-center justify-between gap-3 text-xs bg-gray-50 dark:bg-gray-850/60 p-3 rounded-xl border border-gray-200/80 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                  result.isRateLimited
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                    : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${result.isRateLimited ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  <span>
                    {result.isRateLimited 
                      ? t('userQuotaChecker.statusThrottled')
                      : t('userQuotaChecker.statusValid')}
                  </span>
                </span>
                {result.latencyMs !== undefined && (
                  <span className="font-mono text-gray-500 dark:text-gray-400">
                    ({result.latencyMs}ms latency)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500 font-mono">
                <Clock size={12} />
                <span>{dayjs(result.checkedAt).format('HH:mm:ss')}</span>
              </div>
            </div>

            {/* 3 Metric Hero Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* 1. Concurrency */}
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850/40">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-semibold">
                    <Zap size={14} className="text-amber-500" />
                    <span>{t('userQuotaChecker.concurrencyLabel')}</span>
                  </div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                    {result.parallelPctRemaining}% free
                  </span>
                </div>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
                    {result.remainingParallel ?? 3}
                  </span>
                  <span className="text-xs text-gray-400">/ {result.maxParallel ?? 3} slots</span>
                </div>

                {/* Slot indicators */}
                <div className="grid grid-cols-3 gap-1.5 mt-3">
                  {Array.from({ length: result.maxParallel ?? 3 }).map((_, idx) => {
                    const isFree = idx < (result.remainingParallel ?? 3);
                    return (
                      <div
                        key={idx}
                        className={`h-2.5 rounded-xs transition-colors ${
                          isFree 
                            ? 'bg-emerald-500' 
                            : 'bg-amber-500'
                        }`}
                        title={isFree ? 'Slot Free' : 'Slot In-use'}
                      />
                    );
                  })}
                </div>
              </div>

              {/* 2. Tokens (TPM) */}
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850/40">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-semibold">
                    <Layers size={14} className="text-blue-500" />
                    <span>{t('userQuotaChecker.tpmLabel')}</span>
                  </div>
                  <span className="font-bold text-blue-600 dark:text-blue-400 font-mono text-[11px]">
                    {result.tokenPctRemaining}% free
                  </span>
                </div>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
                    {((result.remainingTokens ?? 1000000) / 1000).toFixed(0)}k
                  </span>
                  <span className="text-xs text-gray-400">
                    / {((result.tokenLimit ?? 1000000) / 1000).toFixed(0)}k TPM
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-3 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${result.tokenPctRemaining ?? 100}%` }}
                  />
                </div>
              </div>

              {/* 3. Key Budget */}
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850/40">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-semibold">
                    <CreditCard size={14} className="text-purple-500" />
                    <span>{t('userQuotaChecker.budgetLabel')}</span>
                  </div>
                  <span className="font-bold text-purple-600 dark:text-purple-400 font-mono text-[11px]">
                    {result.budgetPctRemaining}% free
                  </span>
                </div>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
                    ${(result.budgetRemaining ?? 50.0).toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-400">
                    / ${(result.keyMaxBudget ?? 50.0).toFixed(2)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-3 overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, ((result.keySpend ?? 0) / (result.keyMaxBudget ?? 50)) * 100))}%` }}
                  />
                </div>
                <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 font-mono text-right">
                  Used: ${(result.keySpend ?? 0).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <ShieldCheck size={14} />
                <span>{t('userQuotaChecker.securityBadge')} (Ephemeral in memory)</span>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  {copiedSummary ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  <span>{copiedSummary ? t('userQuotaChecker.copiedSummary') : t('userQuotaChecker.copySummaryBtn')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCheck()}
                  disabled={loading || cooldown > 0}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  {loading ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <RotateCw size={13} className={cooldown > 0 ? 'animate-spin' : ''} />
                  )}
                  <span>
                    {cooldown > 0 
                      ? t('userQuotaChecker.cooldownBtn', { seconds: cooldown })
                      : t('userQuotaChecker.recheckBtn')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <span>{t('userQuotaChecker.closeModalBtn')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
