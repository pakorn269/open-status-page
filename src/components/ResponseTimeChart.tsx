import React, { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { Activity, AlertCircle, CheckCheck } from 'lucide-react';

export interface PingLog {
  created_at: string;
  response_time_ms: number;
  status_code: number;
  is_operational: boolean;
  endpoint?: string;
}

interface ResponseTimeChartProps {
  logs: PingLog[];
  loading?: boolean;
}

interface EndpointColor {
  stroke: string;
  fillGradient: string;
  bgDot: string;
  text: string;
  badgeBg: string;
}

const ENDPOINT_COLORS: Record<string, EndpointColor> = {
  'API Gateway (HTTP / Models)': {
    stroke: '#3b82f6', // Blue
    fillGradient: '#3b82f6',
    bgDot: 'bg-blue-500',
    text: 'text-blue-600 dark:text-blue-400',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/70 border-blue-200 dark:border-blue-800',
  },
  'Model: Qwen 3.8 27B': {
    stroke: '#8b5cf6', // Violet/Purple
    fillGradient: '#8b5cf6',
    bgDot: 'bg-purple-500',
    text: 'text-purple-600 dark:text-purple-400',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/70 border-purple-200 dark:border-purple-800',
  },
  'Model: DeepSeek v4 Flash': {
    stroke: '#f59e0b', // Amber/Orange
    fillGradient: '#f59e0b',
    bgDot: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/70 border-amber-200 dark:border-amber-800',
  },
};

const FALLBACK_PALETTE: EndpointColor[] = [
  {
    stroke: '#10b981',
    fillGradient: '#10b981',
    bgDot: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-200 dark:border-emerald-800',
  },
  {
    stroke: '#ec4899',
    fillGradient: '#ec4899',
    bgDot: 'bg-pink-500',
    text: 'text-pink-600 dark:text-pink-400',
    badgeBg: 'bg-pink-50 dark:bg-pink-950/70 border-pink-200 dark:border-pink-800',
  },
  {
    stroke: '#06b6d4',
    fillGradient: '#06b6d4',
    bgDot: 'bg-cyan-500',
    text: 'text-cyan-600 dark:text-cyan-400',
    badgeBg: 'bg-cyan-50 dark:bg-cyan-950/70 border-cyan-200 dark:border-cyan-800',
  },
];

const getEndpointColor = (name: string, index = 0): EndpointColor => {
  if (ENDPOINT_COLORS[name]) return ENDPOINT_COLORS[name];
  return FALLBACK_PALETTE[index % FALLBACK_PALETTE.length];
};

export const ResponseTimeChart: React.FC<ResponseTimeChartProps> = ({ logs, loading = false }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    log: PingLog;
    endpoint: string;
  } | null>(null);

  const showCopyToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const copyPointData = (log: PingLog) => {
    const payload = {
      service: log.endpoint || 'API Gateway',
      timestamp: log.created_at,
      formatted_time: dayjs(log.created_at).format('YYYY-MM-DD HH:mm:ss'),
      response_time_ms: log.response_time_ms,
      status_code: log.status_code,
      is_operational: log.is_operational,
    };

    const textToCopy = JSON.stringify(payload, null, 2);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      showCopyToast(`Copied latency data (${log.response_time_ms}ms at ${dayjs(log.created_at).format('HH:mm:ss')})`);
    }
  };

  // Discover all unique endpoints present in logs
  const availableEndpoints = useMemo(() => {
    const set = new Set<string>();
    logs.forEach(l => {
      if (l.endpoint) set.add(l.endpoint);
    });
    return Array.from(set);
  }, [logs]);

  // Group logs by endpoint
  const seriesByEndpoint = useMemo(() => {
    const map: Record<string, PingLog[]> = {};
    logs.forEach(log => {
      const ep = log.endpoint || 'API Gateway (HTTP / Models)';
      if (!map[ep]) map[ep] = [];
      map[ep].push(log);
    });

    // Sort each series by timestamp
    Object.keys(map).forEach(ep => {
      map[ep].sort((a, b) => dayjs(a.created_at).valueOf() - dayjs(b.created_at).valueOf());
    });

    return map;
  }, [logs]);

  // Global time bounds over the last 24 hours
  const { minTime, maxTime } = useMemo(() => {
    const now = dayjs().valueOf();
    const past24h = dayjs().subtract(24, 'hour').valueOf();
    if (logs.length === 0) return { minTime: past24h, maxTime: now };
    const firstLogTime = Math.min(...logs.map(l => dayjs(l.created_at).valueOf()));
    return {
      minTime: Math.min(firstLogTime, past24h),
      maxTime: Math.max(now, Math.max(...logs.map(l => dayjs(l.created_at).valueOf()))),
    };
  }, [logs]);

  // Global Max Y value across active endpoints
  const maxY = useMemo(() => {
    const activeLogs = selectedEndpoint === 'all'
      ? logs
      : logs.filter(l => l.endpoint === selectedEndpoint);

    if (activeLogs.length === 0) return 1000;
    const peak = Math.max(...activeLogs.map(l => l.response_time_ms));
    return Math.max(Math.ceil((peak + 200) / 500) * 500, 1000);
  }, [logs, selectedEndpoint]);

  // Dimensions
  const chartHeight = 175;
  const chartWidth = 720;
  const padding = { top: 22, right: 15, bottom: 25, left: 45 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;
  const timeSpan = Math.max(maxTime - minTime, 1);

  // Compute SVG paths and points for each endpoint series
  const seriesData = useMemo(() => {
    const eps = selectedEndpoint === 'all' ? availableEndpoints : [selectedEndpoint];

    return eps.map((ep, idx) => {
      const epLogs = seriesByEndpoint[ep] || [];
      const color = getEndpointColor(ep, idx);

      const points = epLogs.map((log) => {
        const t = dayjs(log.created_at).valueOf();
        const x = padding.left + ((t - minTime) / timeSpan) * innerWidth;
        const clampedMs = Math.min(log.response_time_ms, maxY);
        const y = padding.top + innerHeight - (clampedMs / maxY) * innerHeight;
        return { x, y, log, endpoint: ep };
      });

      const linePath = points.reduce(
        (acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`,
        ''
      );

      const areaPath = points.length > 0
        ? `${linePath} L ${points[points.length - 1].x.toFixed(1)},${(padding.top + innerHeight).toFixed(1)} L ${points[0].x.toFixed(1)},${(padding.top + innerHeight).toFixed(1)} Z`
        : '';

      // Compute statistics for this series
      const times = epLogs.map(l => l.response_time_ms).sort((a, b) => a - b);
      const avg = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
      const min = times.length > 0 ? times[0] : 0;
      const max = times.length > 0 ? times[times.length - 1] : 0;
      const p95 = times.length > 0 ? (times[Math.floor(times.length * 0.95)] || max) : 0;

      return {
        endpoint: ep,
        color,
        points,
        linePath,
        areaPath,
        stats: { avg, min, max, p95, count: times.length },
      };
    });
  }, [availableEndpoints, selectedEndpoint, seriesByEndpoint, minTime, timeSpan, innerWidth, innerHeight, maxY, padding.left, padding.top]);

  // Grid tick marks
  const yTicks = [0, Math.round(maxY / 2), maxY];

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 mb-8 shadow-sm animate-pulse">
        <div className="h-5 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
        <div className="h-40 bg-gray-100 dark:bg-gray-800/50 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 mb-8 shadow-sm relative">
      {/* Toast feedback notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-semibold px-4 py-2 rounded-full shadow-xl flex items-center gap-2 z-50 animate-fade-in">
          <CheckCheck size={14} className="text-green-400 dark:text-green-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with Title and Quick Per-Service Latency Badges */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-md">
            <Activity size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Response Time & Latency (24h)
            </h3>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              Continuous multi-service latency measurements · (Click any point to copy)
            </p>
          </div>
        </div>

        {/* Live Averages Per Endpoint Badges */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {seriesData.map(s => (
            <div
              key={s.endpoint}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded border ${s.color.badgeBg}`}
            >
              <span className={`h-2 w-2 rounded-full ${s.color.bgDot}`} />
              <span className="text-gray-600 dark:text-gray-300 font-medium">
                {s.endpoint.replace('Model: ', '')}:
              </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100 font-mono">
                {s.stats.avg}ms
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Endpoint Selector Tabs with Distinct Color Indicators */}
      {availableEndpoints.length > 1 && (
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 text-xs select-none">
          <button
            onClick={() => setSelectedEndpoint('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all font-medium whitespace-nowrap cursor-pointer ${
              selectedEndpoint === 'all'
                ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-xs font-semibold'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>All Endpoints (Multi-line)</span>
          </button>

          {availableEndpoints.map((ep, i) => {
            const epColor = getEndpointColor(ep, i);
            const isSelected = selectedEndpoint === ep;

            return (
              <button
                key={ep}
                onClick={() => setSelectedEndpoint(ep)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all font-medium whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? `${epColor.badgeBg} ${epColor.text} font-semibold shadow-xs ring-1 ring-current`
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${epColor.bgDot}`} />
                <span>{ep}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* SVG Multi-Line Chart */}
      {logs.length === 0 ? (
        <div className="h-36 flex flex-col justify-center items-center text-gray-400 dark:text-gray-500 text-xs italic">
          <AlertCircle size={20} className="mb-1 text-gray-300 dark:text-gray-600" />
          No latency measurements recorded in the last 24 hours.
        </div>
      ) : (
        <div className="relative w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto overflow-visible select-none"
          >
            <defs>
              {/* Dynamic gradient definitions for each endpoint */}
              {seriesData.map((s, idx) => (
                <linearGradient
                  key={s.endpoint}
                  id={`gradient-${idx}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={s.color.fillGradient} stopOpacity={selectedEndpoint === 'all' ? 0.08 : 0.25} />
                  <stop offset="100%" stopColor={s.color.fillGradient} stopOpacity={0.0} />
                </linearGradient>
              ))}
            </defs>

            {/* Horizontal Grid lines & Y-axis labels */}
            {yTicks.map(tick => {
              const y = padding.top + innerHeight - (tick / maxY) * innerHeight;
              return (
                <g key={tick}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={padding.left + innerWidth}
                    y2={y}
                    stroke="currentColor"
                    strokeDasharray="3 3"
                    className="text-gray-200 dark:text-gray-800"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[10px] fill-gray-400 dark:fill-gray-500 font-mono"
                  >
                    {tick}ms
                  </text>
                </g>
              );
            })}

            {/* Render Area Fills for each series */}
            {seriesData.map((s, idx) => (
              s.areaPath && (
                <path
                  key={`area-${s.endpoint}`}
                  d={s.areaPath}
                  fill={`url(#gradient-${idx})`}
                />
              )
            ))}

            {/* Render Distinct Colored Line Series */}
            {seriesData.map((s) => (
              s.linePath && (
                <path
                  key={`line-${s.endpoint}`}
                  d={s.linePath}
                  fill="none"
                  stroke={s.color.stroke}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-opacity duration-200"
                  style={{
                    opacity: hoveredPoint && hoveredPoint.endpoint !== s.endpoint ? 0.35 : 1,
                  }}
                />
              )
            ))}

            {/* Render Interactive Data Points & Hover Targets */}
            {seriesData.flatMap((s) =>
              s.points.map((pt, ptIdx) => {
                const isHovered = hoveredPoint?.log.created_at === pt.log.created_at && hoveredPoint?.endpoint === s.endpoint;

                return (
                  <g key={`${s.endpoint}-${ptIdx}`}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 4.5 : 2.5}
                      fill={s.color.stroke}
                      className="transition-all"
                      style={{
                        opacity: hoveredPoint && !isHovered ? 0.35 : 1,
                      }}
                    />
                    {/* Wide transparent click/hover target */}
                    <rect
                      x={pt.x - 7}
                      y={0}
                      width={14}
                      height={chartHeight}
                      fill="transparent"
                      className="cursor-pointer"
                      onClick={() => copyPointData(pt.log)}
                      onMouseEnter={() => setHoveredPoint(pt)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  </g>
                );
              })
            )}

            {/* X-axis time labels */}
            <g className="text-[10px] fill-gray-400 dark:fill-gray-500">
              <text x={padding.left} y={chartHeight - 4} textAnchor="start">
                24h ago
              </text>
              <text x={padding.left + innerWidth / 2} y={chartHeight - 4} textAnchor="middle">
                12h ago
              </text>
              <text x={padding.left + innerWidth} y={chartHeight - 4} textAnchor="end">
                Now
              </text>
            </g>
          </svg>

          {/* Floating Hover Tooltip with Matching Service Color */}
          {hoveredPoint && (
            <div
              className="absolute pointer-events-none z-20 bg-gray-900 dark:bg-gray-800 text-white text-xs py-2 px-3 rounded-lg shadow-xl -translate-x-1/2 -translate-y-full mb-2 border border-gray-700 dark:border-gray-700"
              style={{
                left: `${Math.min(Math.max((hoveredPoint.x / chartWidth) * 100, 10), 90)}%`,
                top: `${(hoveredPoint.y / chartHeight) * 100}%`,
              }}
            >
              <div className="flex items-center gap-1.5 font-semibold font-mono">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: getEndpointColor(hoveredPoint.endpoint).stroke }}
                />
                <span className="text-white text-[13px]">{hoveredPoint.log.response_time_ms}ms</span>
                <span className="text-[10px] text-gray-400">({hoveredPoint.log.status_code})</span>
              </div>
              <div
                className="text-[11px] font-medium mt-0.5"
                style={{ color: getEndpointColor(hoveredPoint.endpoint).stroke }}
              >
                {hoveredPoint.endpoint}
              </div>
              <div className="text-[10px] text-gray-400 whitespace-nowrap mt-1">
                {dayjs(hoveredPoint.log.created_at).format('MMM D, HH:mm:ss')} · Click to copy
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
