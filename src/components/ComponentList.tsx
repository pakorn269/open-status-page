import React, { useState } from 'react';
import { Check, Minus, AlertTriangle, X, Wrench, Clock, Calendar, CheckCheck } from 'lucide-react';
import dayjs from 'dayjs';
import type { UptimeDay } from './UptimeGrid';
import type { PingLog } from './ResponseTimeChart';

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
  status: 'operational' | 'degraded' | 'outage' | 'no-data';
  responseTimeMs?: number;
  statusCode?: number;
}

export const ComponentList: React.FC<ComponentListProps> = ({ components, recentLogs = [] }) => {
  // Default to '288' entries view mode as requested
  const [viewMode, setViewMode] = useState<'288' | '90d'>('288');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
      ...('responseTimeMs' in entry && entry.responseTimeMs !== undefined ? { response_time_ms: entry.responseTimeMs } : {}),
      ...('statusCode' in entry && entry.statusCode !== undefined ? { status_code: entry.statusCode } : {}),
    };

    const textToCopy = JSON.stringify(payload, null, 2);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      showCopyToast(`Copied ${compName} data (${dayjs(entry.date).format('MMM D, HH:mm')})`);
    }
  };

  const getStatusColor = (status: 'operational' | 'degraded' | 'outage' | 'maintenance' | 'no-data') => {
    switch (status) {
      case 'operational': return '#76ad2a'; // Green
      case 'degraded':    return '#d9a92a'; // Yellow
      case 'outage':      return '#e04343'; // Red
      case 'maintenance': return '#2c84db'; // Blue
      case 'no-data':     return '#d1d5db'; // Light gray
      default:            return '#d1d5db';
    }
  };

  const getComponentStatusText = (status: ServiceComponent['status']) => {
    switch (status) {
      case 'operational':    return 'Operational';
      case 'degraded':       return 'Degraded Performance';
      case 'partial_outage': return 'Partial Outage';
      case 'major_outage':   return 'Major Outage';
      case 'maintenance':    return 'Under Maintenance';
    }
  };

  const getComponentStatusColor = (status: ServiceComponent['status']) => {
    switch (status) {
      case 'operational':    return 'text-[#76ad2a]';
      case 'degraded':       return 'text-[#d9a92a]';
      case 'partial_outage': return 'text-[#e86235]';
      case 'major_outage':   return 'text-[#e04343]';
      case 'maintenance':    return 'text-[#2c84db]';
    }
  };

  const getStatusIcon = (status: ServiceComponent['status']) => {
    const className = `${getComponentStatusColor(status)} w-4 h-4`;
    switch (status) {
      case 'operational':    return <Check className={className} />;
      case 'degraded':       return <Minus className={className} />;
      case 'partial_outage': return <AlertTriangle className={className} />;
      case 'major_outage':   return <X className={className} />;
      case 'maintenance':    return <Wrench className={className} />;
    }
  };

  // Helper to build 288 entries for a specific component
  const getEntriesForComponent = (compName: string): { entries: CheckEntry[]; uptime24h: string } => {
    const totalSlots = 288;
    const result: CheckEntry[] = [];

    // Filter logs for this component (or all logs if component not tagged)
    let compLogs = recentLogs.filter(l => l.endpoint === compName);
    if (compLogs.length === 0 && components.length === 1) {
      compLogs = recentLogs;
    }

    const sorted = [...compLogs].sort((a, b) => dayjs(a.created_at).valueOf() - dayjs(b.created_at).valueOf());
    const paddingCount = Math.max(0, totalSlots - sorted.length);

    for (let i = 0; i < paddingCount; i++) {
      result.push({
        date: dayjs().subtract((totalSlots - i) * 5, 'minute').toISOString(),
        status: 'no-data',
      });
    }

    const isModel = compName.toLowerCase().includes('model');
    const latencyThresholdMs = isModel ? 3500 : 1500;

    const logsToUse = sorted.slice(-totalSlots);
    logsToUse.forEach(log => {
      let entryStatus: CheckEntry['status'] = 'operational';
      if (!log.is_operational || log.status_code >= 500) {
        entryStatus = 'outage';
      } else if (log.response_time_ms > latencyThresholdMs || (log.status_code >= 400 && log.status_code !== 401)) {
        entryStatus = 'degraded';
      }

      result.push({
        date: log.created_at,
        status: entryStatus,
        responseTimeMs: log.response_time_ms,
        statusCode: log.status_code,
      });
    });

    const valid = result.filter(e => e.status !== 'no-data');
    const operational = valid.filter(e => e.status === 'operational').length;
    const uptime24h = valid.length > 0 ? ((operational / valid.length) * 100).toFixed(2) : '100.00';

    return { entries: result, uptime24h };
  };

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
              Showing the last <var className="font-semibold not-italic text-gray-700 dark:text-gray-300">288</var> health checks (~24 hours).{' '}
              <span className="text-gray-400 dark:text-gray-500 text-[11px]">(Click any bar to copy diagnostic data)</span>
            </span>
          ) : (
            <span>
              Uptime over the past <var className="font-semibold not-italic text-gray-700 dark:text-gray-300">90</var> days.{' '}
              <a
                href="/uptime"
                className="text-gray-500 dark:text-gray-400 underline hover:text-gray-800 dark:hover:text-gray-200"
                onClick={e => {
                  e.preventDefault();
                  window.history.pushState(null, '', '/uptime');
                  window.dispatchEvent(new Event('popstate'));
                }}
              >
                View historical uptime.
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
            <span>Last 288 entries (24h)</span>
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
            <span>Past 90 days</span>
          </button>
        </div>
      </div>

      {/* Component Status Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-sm mb-6 shadow-sm divide-y divide-gray-200 dark:divide-gray-800">
        {components.map((comp) => {
          const { entries: compEntries, uptime24h } = getEntriesForComponent(comp.name);

          return (
            <div key={comp.id} className="p-5 flex flex-col gap-3.5">
              {/* Component Name and Status Header */}
              <div className="flex justify-between items-center">
                <span className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">{comp.name}</span>
                <div className="flex items-center gap-2 group relative flex-wrap justify-end">
                  {comp.responseTimeMs !== undefined && (
                    <span className="text-[12px] text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                      {comp.responseTimeMs}ms
                    </span>
                  )}
                  <span className={`text-[13px] font-medium ${getComponentStatusColor(comp.status)}`}>
                    {getComponentStatusText(comp.status)}
                  </span>
                  {getStatusIcon(comp.status)}
                </div>
              </div>

              {/* View Mode 1: 288 Multi-row Check Blocks (Default) */}
              {viewMode === '288' && (
                <div className="w-full pt-1">
                  <div className="flex flex-wrap gap-[2.5px] sm:gap-[3px] py-1">
                    {compEntries.map((entry, entryIdx) => {
                      const hasData = entry.status !== 'no-data';
                      const tooltipText = hasData
                        ? `${comp.name}\n${dayjs(entry.date).format('MMM D, HH:mm:ss')}\n${entry.responseTimeMs}ms · HTTP ${entry.statusCode} (${entry.status})\n\nClick to copy JSON diagnostic data`
                        : `${comp.name}\n${dayjs(entry.date).format('MMM D, HH:mm')}\nNo ping recorded`;

                      return (
                        <div
                          key={entryIdx}
                          onClick={() => copyCheckData(comp.name, entry)}
                          className={`tooltip cursor-pointer transition-transform hover:scale-125 active:scale-95 ${
                            !hasData ? 'opacity-35' : ''
                          }`}
                          title={tooltipText}
                          style={{ flex: '1 0 calc(100% / 72 - 3px)', minWidth: '4px', maxWidth: '10px' }}
                        >
                          <div
                            className="h-5 sm:h-6 w-full rounded-[1.5px] transition-colors"
                            style={{ backgroundColor: getStatusColor(entry.status) }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Inline 24h Legend */}
                  <div className="flex justify-between items-center text-[12px] text-gray-400 dark:text-gray-500 mt-2">
                    <span>24 hours ago</span>
                    <span className="text-gray-600 dark:text-gray-300 font-medium font-mono">
                      {uptime24h}% uptime (288 checks)
                    </span>
                    <span>Now</span>
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
                        fill={getStatusColor(day.status)}
                        onClick={() => copyCheckData(comp.name, day)}
                        className="hover:opacity-75 cursor-pointer transition-opacity"
                      >
                        <title>{`${comp.name}\n${dayjs(day.date).format('MMM D, YYYY')}\n${day.status}\n\nClick to copy JSON diagnostic data`}</title>
                      </rect>
                    ))}
                  </svg>

                  {/* Inline 90d Legend */}
                  <div className="flex justify-between items-center text-[12px] text-gray-400 dark:text-gray-500 mt-2">
                    <span>90 days ago</span>
                    <span className="text-gray-600 dark:text-gray-300 font-medium font-mono">
                      {comp.uptimePercentage.toFixed(2)}% uptime
                    </span>
                    <span>Today</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Legend */}
      <div className="flex flex-wrap items-center gap-6 text-[13px] text-gray-600 dark:text-gray-400 mb-10 pt-1">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-[#76ad2a]" /> Operational
        </div>
        <div className="flex items-center gap-2">
          <Minus className="w-4 h-4 text-[#d9a92a]" /> Degraded Performance
        </div>
        <div className="flex items-center gap-2">
          <X className="w-4 h-4 text-[#e04343]" /> Major Outage
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-xs bg-[#d1d5db] dark:bg-gray-700 inline-block" /> No Data
        </div>
      </div>
    </div>
  );
};
