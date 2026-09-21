import React, { useState } from 'react';
import { 
  KeyRound, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Zap, 
  Layers, 
  CreditCard, 
  Trash2, 
  Copy, 
  Check, 
  Terminal, 
  AlertCircle, 
  Loader2,
  Clock
} from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import dayjs from 'dayjs';

interface QuotaResult {
  valid: boolean;
  statusCode: number;
  isRateLimited?: boolean;
  error?: string;
  latencyMs?: number;
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
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [showCurlHelper, setShowCurlHelper] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown countdown timer
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

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
        return;
      }

      if (!res.ok && !data.statusCode) {
        throw new Error(data.error || `HTTP error ${res.status}`);
      }

      setResult(data);
      if (!data.valid) {
        setError(data.error || t('userQuotaChecker.statusInvalid'));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`${t('userQuotaChecker.errorPrefix')} ${msg}`);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setApiKey('');
    setResult(null);
    setError(null);
  };

  const curlCommand = `curl -i https://gateway.9arm.co/v1/models \\
  -H "x-api-key: ${apiKey.trim() || 'YOUR_API_KEY'}"`;

  const handleCopyCurl = async () => {
    try {
      await navigator.clipboard.writeText(curlCommand);
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
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
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                <ShieldCheck size={12} />
                <span>{t('userQuotaChecker.securityBadge')}</span>
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

      {/* Security Disclaimer Callout */}
      <div className="mb-5 p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 text-[11.5px] text-emerald-900/90 dark:text-emerald-300/90 flex items-start gap-2.5 leading-relaxed">
        <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
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

      {/* Results Dashboard */}
      {result && result.valid && (
        <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 animate-in fade-in duration-300 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {t('userQuotaChecker.resultTitle')}
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
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
            </div>

            <div className="flex items-center gap-3 text-[11px] text-gray-400 dark:text-gray-500 font-mono">
              {result.latencyMs !== undefined && (
                <span>{result.latencyMs}ms latency</span>
              )}
              <div className="flex items-center gap-1">
                <Clock size={11} />
                <span>{dayjs(result.checkedAt).format('HH:mm:ss')}</span>
              </div>
            </div>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* 1. Concurrency */}
            <div className="p-3.5 rounded-lg border border-gray-200/80 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850/30">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-medium">
                  <Zap size={13} className="text-amber-500" />
                  <span>{t('userQuotaChecker.concurrencyLabel')}</span>
                </div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                  {result.parallelPctRemaining}% free
                </span>
              </div>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {result.remainingParallel ?? 3}
                </span>
                <span className="text-xs text-gray-400">/ {result.maxParallel ?? 3} slots</span>
              </div>

              {/* Slot indicators */}
              <div className="grid grid-cols-3 gap-1.5 mt-2.5">
                {Array.from({ length: result.maxParallel ?? 3 }).map((_, idx) => {
                  const isFree = idx < (result.remainingParallel ?? 3);
                  return (
                    <div
                      key={idx}
                      className={`h-2 rounded-xs transition-colors ${
                        isFree 
                          ? 'bg-emerald-500/80' 
                          : 'bg-amber-500'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* 2. Tokens (TPM) */}
            <div className="p-3.5 rounded-lg border border-gray-200/80 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850/30">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-medium">
                  <Layers size={13} className="text-blue-500" />
                  <span>{t('userQuotaChecker.tpmLabel')}</span>
                </div>
                <span className="font-bold text-blue-600 dark:text-blue-400 font-mono text-[11px]">
                  {result.tokenPctRemaining}% free
                </span>
              </div>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {((result.remainingTokens ?? 1000000) / 1000).toFixed(0)}k
                </span>
                <span className="text-xs text-gray-400">
                  / {((result.tokenLimit ?? 1000000) / 1000).toFixed(0)}k TPM
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2.5 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${result.tokenPctRemaining ?? 100}%` }}
                />
              </div>
            </div>

            {/* 3. Key Budget */}
            <div className="p-3.5 rounded-lg border border-gray-200/80 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850/30">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-medium">
                  <CreditCard size={13} className="text-purple-500" />
                  <span>{t('userQuotaChecker.budgetLabel')}</span>
                </div>
                <span className="font-bold text-purple-600 dark:text-purple-400 font-mono text-[11px]">
                  {result.budgetPctRemaining}% free
                </span>
              </div>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  ${(result.budgetRemaining ?? 48.87).toFixed(2)}
                </span>
                <span className="text-xs text-gray-400">
                  / ${(result.keyMaxBudget ?? 50.0).toFixed(2)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2.5 overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${((result.keySpend ?? 0) / (result.keyMaxBudget ?? 50)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
