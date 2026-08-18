import React, { useState, useMemo } from 'react';
import { Check, Minus, AlertTriangle, X, Wrench, Clock, Calendar, CheckCheck } from 'lucide-react';
import dayjs from 'dayjs';
import type { UptimeDay } from './UptimeGrid';
import type { PingLog } from './ResponseTimeChart';
import { useTranslation } from '../lib/i18n';

export interface ServiceComponent {
  id: string;
  name: string;
  status: 'operational' | 'degraded' | 'partial_outage' | 'major_outage' | 'maintenance';
  uptimeDays: UptimeDay[];
  uptimePercentage: number;
  responseTimeMs?: number;
}

interface ComponentListProps {
  components: ServiceComponent[];
  recentLogs?: PingLog[];
}

interface CheckEntry {
  date: string;
  endDate: string;
  status: 'operational' | 'degraded' | 'outage' | 'no-data';
  responseTimeMs?: number;
  statusCode?: number;
  checkCount: number;
}

export const ComponentList: React.FC<ComponentListProps> = ({ components, recentLogs = [] }) => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'288' | '90d'>('288');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hoveredCheck, setHoveredCheck] = useState<{
    compName: string;
    entry: CheckEntry;
    x: number;
    y: number;
  } | null>(null);

  const showCopyToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const copyCheckData = (compName: string, entry: CheckEntry | { date: string; status: string }) => {
    const payload = {
      service: compName,
      timestamp: entry.date,
      formatted_time: dayjs(entry.date).format('YYYY-MM-DD HH:mm:ss'),
      status: entry.status,
      ...('endDate' in entry && entry.endDate ? { end_time: dayjs(entry.endDate).format('YYYY-MM-DD HH:mm:ss') } : {}),
      ...('responseTimeMs' in entry && entry.responseTimeMs !== undefined ? { response_time_ms: entry.responseTimeMs } : {}),
      ...('statusCode' in entry && entry.statusCode !== undefined ? { status_code: entry.statusCode } : {}),
      ...('checkCount' in entry && entry.checkCount !== undefined ? { checks_in_interval: entry.checkCount } : {}),
    };

    const textToCopy = JSON.stringify(payload, null, 2);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      showCopyToast(t('componentList.copiedComponentData', { name: compName, time: dayjs(entry.date).format('MMM D, HH:mm') }));
    }
  };

  const getStatusColor = (status: 'operational' | 'degraded' | 'outage' | 'maintenance' | 'no-data') => {
    switch (status) {
      case 'operational': return '#22c55e'; // Vibrant Emerald/Green
      case 'degraded':    return '#eab308'; // Amber/Yellow
      case 'outage':      return '#ef4444'; // Red
      case 'maintenance': return '#3b82f6'; // Blue
      case 'no-data':     return '#d1d5db'; // Light gray
      default:            return '#d1d5db';
    }
  };

  const getComponentStatusText = (status: ServiceComponent['status']) => {
    switch (status) {
      case 'operational':    return t('componentList.operational');
      case 'degraded':       return t('componentList.degraded');
      case 'partial_outage': return t('componentList.partialOutage');
      case 'major_outage':   return t('componentList.majorOutage');
      case 'maintenance':    return t('componentList.maintenance');
    }
  };

  const getComponentStatusColor = (status: ServiceComponent['status']) => {
    switch (status) {
      case 'operational':    return 'text-[#16a34a] dark:text-[#22c55e]';
      case 'degraded':       return 'text-[#ca8a04] dark:text-[#eab308]';
      case 'partial_outage': return 'text-[#ea580c] dark:text-[#f97316]';
      case 'major_outage':   return 'text-[#dc2626] dark:text-[#ef4444]';
      case 'maintenance':    return 'text-[#2563eb] dark:text-[#3b82f6]';
    }
  };

  const getStatusIcon = (status: ServiceComponent['status']) => {
    const className = `${getComponentStatusColor(status)} w-4 h-4 shrink-0`;
    switch (status) {
      case 'operational':    return <Check className={className} />;
      case 'degraded':       return <Minus className={className} />;
      case 'partial_outage': return <AlertTriangle className={className} />;
      case 'major_outage':   return <X className={className} />;
      case 'maintenance':    return <Wrench className={className} />;
    }
  };

  // Precise 5-minute time bucketing across the full 24-hour window
  const componentChecksData = useMemo(() => {
    const totalSlots = 288;
    const slotDurationMs = 5 * 60 * 1000;
    
    // Anchor to latest log time or current real-time clock
    const now = Date.now();
    const latestLogTime = recentLogs.length > 0
      ? Math.max(...recentLogs.map(l => dayjs(l.created_at).valueOf()))
      : now;
    const anchorTime = Math.max(now, latestLogTime);
    const startTime = anchorTime - (totalSlots * slotDurationMs);

    const map: Record<string, { entries: CheckEntry[]; uptime24h: string; countWithData: number }> = {};

    components.forEach(comp => {
      // Filter logs for this component
      let compLogs = recentLogs.filter(l => l.endpoint === comp.name);
      if (compLogs.length === 0 && components.length === 1) {
        compLogs = recentLogs;
      }

      const isModel = comp.name.toLowerCase().includes('model');
      const latencyThresholdMs = isModel ? 3500 : 1500;

      const entries: CheckEntry[] = [];
      let validSlotCount = 0;
      let operationalSlotCount = 0;

      for (let i = 0; i < totalSlots; i++) {
        const bStart = startTime + (i * slotDurationMs);
        const bEnd = bStart + slotDurationMs;

        // Find all logs that arrived in this exact 5-minute slice
        const matchingLogs = compLogs.filter(l => {
          const t = dayjs(l.created_at).valueOf();
          return t >= bStart && t < bEnd;
        });

        if (matchingLogs.length === 0) {
          entries.push({
            date: new Date(bStart).toISOString(),
            endDate: new Date(bEnd).toISOString(),
            status: 'no-data',
            checkCount: 0,
          });
        } else {
          validSlotCount++;
          // Determine worst status in interval
          const hasOutage = matchingLogs.some(m => !m.is_operational || m.status_code >= 500);
          const hasDegraded = matchingLogs.some(
            m => m.response_time_ms > latencyThresholdMs || (m.status_code >= 400 && m.status_code !== 401)
          );

          let entryStatus: CheckEntry['status'] = 'operational';
          if (hasOutage) {
            entryStatus = 'outage';
          } else if (hasDegraded) {
            entryStatus = 'degraded';
          } else {
            operationalSlotCount++;
          }

          const avgMs = Math.round(
            matchingLogs.reduce((acc, m) => acc + m.response_time_ms, 0) / matchingLogs.length
          );
          const latestCode = matchingLogs[matchingLogs.length - 1].status_code;

          entries.push({
            date: new Date(bStart).toISOString(),
            endDate: new Date(bEnd).toISOString(),
            status: entryStatus,
            responseTimeMs: avgMs,
            statusCode: latestCode,
            checkCount: matchingLogs.length,
          });
        }
      }

      const uptime24h = validSlotCount > 0
        ? ((operationalSlotCount / validSlotCount) * 100).toFixed(2)
        : '100.00';

      map[comp.id] = { entries, uptime24h, countWithData: validSlotCount };
    });

    return map;
  }, [components, recentLogs]);

  return (
    <div className="w-full font-sans relative">
      {/* Toast feedback notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-semibold px-4 py-2 rounded-full shadow-xl flex items-center gap-2 z-50 animate-fade-in">
          <CheckCheck size={14} className="text-green-400 dark:text-green-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with description and View Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div className="text-[13px] text-gray-500 dark:text-gray-400">
          {viewMode === '288' ? (
            <span>
              {t('componentList.showingChecks', { count: 288 })}{' '}
              <span className="text-gray-400 dark:text-gray-500 text-[11px]">{t('componentList.clickToCopyDiagnostic')}</span>
            </span>
          ) : (
            <span>
              {t('componentList.uptimeOverDays', { days: 90 })}{' '}
              <a
                href="/uptime"
                className="text-gray-500 dark:text-gray-400 underline hover:text-gray-800 dark:hover:text-gray-200"
                onClick={e => {
                  e.preventDefault();
                  window.history.pushState(null, '', '/uptime');
                  window.dispatchEvent(new Event('popstate'));
                }}
              >
                {t('componentList.viewHistoricalUptime')}
              </a>
            </span>
          )}
        </div>

        {/* View mode toggle buttons */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-0.5 rounded text-xs font-medium self-start sm:self-auto select-none">
          <button
            onClick={() => setViewMode('288')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all cursor-pointer ${
              viewMode === '288'
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-xs font-semibold'
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <Clock size={12} />
            <span>{t('componentList.last288Checks')}</span>
          </button>

          <button
            onClick={() => setViewMode('90d')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all cursor-pointer ${
              viewMode === '90d'
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-xs font-semibold'
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <Calendar size={12} />
            <span>{t('componentList.past90Days')}</span>
          </button>
        </div>
      </div>

      {/* Component Status Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg mb-6 shadow-sm divide-y divide-gray-100 dark:divide-gray-800 overflow-visible">
        {components.map((comp) => {
          const compData = componentChecksData[comp.id] || { entries: [], uptime24h: '100.00', countWithData: 0 };
          const compEntries = compData.entries;
          const uptime24h = compData.uptime24h;

          return (
            <div key={comp.id} className="p-5 flex flex-col gap-3.5 relative">
              {/* Component Name and Status Header */}
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">{comp.name}</span>
                  {comp.responseTimeMs !== undefined && (
                    <span className="text-[11px] text-gray-600 dark:text-gray-300 font-mono bg-gray-100 dark:bg-gray-800/80 px-2 py-0.5 rounded-md border border-gray-200/60 dark:border-gray-700/50">
                      {comp.responseTimeMs}ms
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 group relative flex-wrap justify-end">
                  <span className="text-[11px] font-mono font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/40 px-2 py-0.5 rounded border border-gray-200/50 dark:border-gray-800">
                    {uptime24h}% (24h)
                  </span>
                  <span className={`text-[13px] font-medium ${getComponentStatusColor(comp.status)}`}>
                    {getComponentStatusText(comp.status)}
                  </span>
                  {getStatusIcon(comp.status)}
                </div>
              </div>

              {/* View Mode 1: 288 Multi-row Check Blocks (Quantized 5-min buckets) */}
              {viewMode === '288' && (
                <div className="w-full pt-1">
                  <div className="flex flex-wrap gap-[2.5px] sm:gap-[3px] py-1">
                    {compEntries.map((entry, entryIdx) => {
                      const hasData = entry.status !== 'no-data';

                      return (
                        <div
                          key={entryIdx}
                          onClick={() => copyCheckData(comp.name, entry)}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredCheck({
                              compName: comp.name,
                              entry,
                              x: rect.left + rect.width / 2,
                              y: rect.top,
                            });
                          }}
                          onMouseLeave={() => setHoveredCheck(null)}
                          className={`cursor-pointer transition-all duration-150 hover:scale-y-125 hover:brightness-110 active:scale-95 ${
                            !hasData ? 'opacity-30 dark:opacity-20' : ''
                          }`}
                          style={{ flex: '1 0 calc(100% / 72 - 3px)', minWidth: '4px', maxWidth: '10px' }}
                        >
                          <div
                            className="h-5 sm:h-6 w-full rounded-[2px] transition-colors shadow-2xs"
                            style={{ backgroundColor: getStatusColor(entry.status) }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Inline 24h Legend with timestamps */}
                  <div className="flex justify-between items-center text-[12px] text-gray-400 dark:text-gray-500 mt-2 font-mono">
                    <span>{t('componentList.twentyFourHoursAgo')}</span>
                    <span className="text-gray-600 dark:text-gray-300 font-medium">
                      {t('componentList.uptime288Summary', { pct: uptime24h })}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{t('common.now')}</span>
                    </span>
                  </div>
                </div>
              )}

              {/* View Mode 2: 90 Days Daily Aggregates */}
              {viewMode === '90d' && (
                <div className="w-full pt-1">
                  <svg
                    className="w-full h-[34px]"
                    preserveAspectRatio="none"
                    viewBox="0 0 450 34"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {comp.uptimeDays.map((day, dayIdx) => (
                      <rect
                        key={dayIdx}
                        height="34"
                        width="3.5"
                        x={dayIdx * 5}
                        y="0"
                        rx="1"
                        fill={getStatusColor(day.status)}
                        onClick={() => copyCheckData(comp.name, day)}
                        className="hover:opacity-75 cursor-pointer transition-opacity"
                      >
                        <title>{`${comp.name}\n${dayjs(day.date).format('MMM D, YYYY')}\n${day.status}\n\n${t('uptimeGrid.clickToCopyDiagnostic')}`}</title>
                      </rect>
                    ))}
                  </svg>

                  {/* Inline 90d Legend */}
                  <div className="flex justify-between items-center text-[12px] text-gray-400 dark:text-gray-500 mt-2 font-mono">
                    <span>{t('componentList.ninetyDaysAgo')}</span>
                    <span className="text-gray-600 dark:text-gray-300 font-medium">
                      {t('componentList.uptime90Summary', { pct: comp.uptimePercentage.toFixed(2) })}
                    </span>
                    <span>{t('common.today')}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Fast Floating Diagnostic Tooltip */}
      {hoveredCheck && (
        <div
          className="fixed pointer-events-none z-50 bg-gray-900/95 dark:bg-gray-800/95 backdrop-blur-sm text-white text-xs py-2.5 px-3.5 rounded-xl shadow-2xl border border-gray-700/80 -translate-x-1/2 -translate-y-full mb-3 min-w-[200px]"
          style={{
            left: `${hoveredCheck.x}px`,
            top: `${hoveredCheck.y}px`,
          }}
        >
          <div className="flex items-center justify-between gap-2 border-b border-gray-700/70 pb-1.5 mb-2 font-semibold">
            <span className="text-[12px] text-white font-medium">{hoveredCheck.compName.replace('Model: ', '')}</span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold uppercase"
              style={{
                backgroundColor: `${getStatusColor(hoveredCheck.entry.status)}25`,
                color: getStatusColor(hoveredCheck.entry.status),
              }}
            >
              {hoveredCheck.entry.status}
            </span>
          </div>

          <div className="text-[11px] text-gray-300 font-mono mb-1">
            {dayjs(hoveredCheck.entry.date).format('MMM D · HH:mm')} - {dayjs(hoveredCheck.entry.endDate).format('HH:mm')}
          </div>

          {hoveredCheck.entry.status !== 'no-data' ? (
            <div className="flex items-center gap-3 text-[11px] font-mono mt-1 pt-1 border-t border-gray-800">
              <span className="font-bold text-white">
                {hoveredCheck.entry.responseTimeMs}ms
              </span>
              <span className="text-gray-400">
                HTTP {hoveredCheck.entry.statusCode || 200}
              </span>
              {hoveredCheck.entry.checkCount > 1 && (
                <span className="text-[10px] text-blue-400 bg-blue-950/60 px-1 rounded">
                  {hoveredCheck.entry.checkCount} pings
                </span>
              )}
            </div>
          ) : (
            <div className="text-[10px] text-gray-400 italic mt-1 pt-1 border-t border-gray-800">
              {t('componentList.noPingRecorded')}
            </div>
          )}

          <div className="text-[9px] text-gray-400 mt-1.5 text-center pt-1 border-t border-gray-800/60">
            {t('chart.clickToCopy')}
          </div>
        </div>
      )}

      {/* Footer Legend */}
      <div className="flex flex-wrap items-center gap-6 text-[13px] text-gray-600 dark:text-gray-400 mb-10 pt-1">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-[#22c55e]" /> {t('componentList.operational')}
        </div>
        <div className="flex items-center gap-2">
          <Minus className="w-4 h-4 text-[#eab308]" /> {t('componentList.degraded')}
        </div>
        <div className="flex items-center gap-2">
          <X className="w-4 h-4 text-[#ef4444]" /> {t('componentList.majorOutage')}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-xs bg-[#d1d5db] dark:bg-gray-700 inline-block" /> {t('componentList.noData')}
        </div>
      </div>
    </div>
  );
};
