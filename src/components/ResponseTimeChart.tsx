import React, { useState, useMemo, useRef, useCallback } from 'react';
import dayjs from 'dayjs';
import { Activity, AlertCircle, CheckCheck } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

export interface PingLog {
  created_at: string;
  response_time_ms: number;
  status_code: number;
  is_operational: boolean;
  endpoint?: string;
}

export type ChartTimeRange = '1h' | '6h' | '24h' | '7d';

interface ResponseTimeChartProps {
  logs: PingLog[];
  loading?: boolean;
  onTimeRangeChange?: (range: ChartTimeRange) => void;
  lastUpdated?: Date;
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

// Smooth Catmull-Rom to Cubic Bezier curve path generator
function generateSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  if (points.length === 2) {
    return `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)} L ${points[1].x.toFixed(1)},${points[1].y.toFixed(1)}`;
  }

  let d = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

export const ResponseTimeChart: React.FC<ResponseTimeChartProps> = ({
  logs,
  loading = false,
  onTimeRangeChange,
}) => {
  const { t } = useTranslation();
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<ChartTimeRange>('24h');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [scrubberX, setScrubberX] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const handleTimeRangeSelect = (range: ChartTimeRange) => {
    setTimeRange(range);
    if (onTimeRangeChange) {
      onTimeRangeChange(range);
    }
  };

  const showCopyToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const copyPointData = (log: PingLog, endpointName?: string) => {
    const serviceName = endpointName || log.endpoint || 'API Gateway';
    const payload = {
      service: serviceName,
      timestamp: log.created_at,
      formatted_time: dayjs(log.created_at).format('YYYY-MM-DD HH:mm:ss'),
      response_time_ms: log.response_time_ms,
      status_code: log.status_code,
      is_operational: log.is_operational,
    };

    const textToCopy = JSON.stringify(payload, null, 2);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      showCopyToast(
        t('chart.copiedLatency', {
          ms: log.response_time_ms,
          time: dayjs(log.created_at).format('HH:mm:ss'),
        })
      );
    }
  };

  // Compute duration in milliseconds for the selected time range
  const rangeDurationMs = useMemo(() => {
    switch (timeRange) {
      case '1h':
        return 1 * 60 * 60 * 1000;
      case '6h':
        return 6 * 60 * 60 * 1000;
      case '24h':
        return 24 * 60 * 60 * 1000;
      case '7d':
        return 7 * 24 * 60 * 60 * 1000;
      default:
        return 24 * 60 * 60 * 1000;
    }
  }, [timeRange]);

  // Scalable Time Bounds: maxTime is ALWAYS anchored to the current moment / latest log
  const { minTime, maxTime } = useMemo(() => {
    const now = dayjs().valueOf();
    const latestLogTime = logs.length > 0
      ? Math.max(...logs.map(l => dayjs(l.created_at).valueOf()))
      : now;
    
    const anchorNow = Math.max(now, latestLogTime);
    const calculatedMin = anchorNow - rangeDurationMs;

    return {
      minTime: calculatedMin,
      maxTime: anchorNow,
    };
  }, [logs, rangeDurationMs]);

  // Filter logs within the active time range
  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      const time = dayjs(l.created_at).valueOf();
      return time >= minTime && time <= maxTime;
    });
  }, [logs, minTime, maxTime]);

  // Discover all unique endpoints
  const availableEndpoints = useMemo(() => {
    const set = new Set<string>();
    logs.forEach(l => {
      if (l.endpoint) set.add(l.endpoint);
    });
    // Fallback if logs don't have endpoint tags
    if (set.size === 0 && logs.length > 0) {
      set.add('API Gateway (HTTP / Models)');
    }
    return Array.from(set);
  }, [logs]);

  // Group filtered logs by endpoint and sort ascending
  const seriesByEndpoint = useMemo(() => {
    const map: Record<string, PingLog[]> = {};
    availableEndpoints.forEach(ep => {
      map[ep] = [];
    });

    filteredLogs.forEach(log => {
      const ep = log.endpoint || 'API Gateway (HTTP / Models)';
      if (!map[ep]) map[ep] = [];
      map[ep].push(log);
    });

    Object.keys(map).forEach(ep => {
      map[ep].sort((a, b) => dayjs(a.created_at).valueOf() - dayjs(b.created_at).valueOf());
    });

    return map;
  }, [filteredLogs, availableEndpoints]);

  // Scalable Y-Axis ceiling (Adaptive smart rounding)
  const maxY = useMemo(() => {
    const activeLogs = selectedEndpoint === 'all'
      ? filteredLogs
      : filteredLogs.filter(l => l.endpoint === selectedEndpoint);

    if (activeLogs.length === 0) return 1000;
    const peak = Math.max(...activeLogs.map(l => l.response_time_ms));

    if (peak <= 150) return 200;
    if (peak <= 350) return 500;
    if (peak <= 800) return 1000;
    if (peak <= 1600) return 2000;
    if (peak <= 2800) return 3500;
    if (peak <= 4500) return 5000;
    return Math.ceil(peak / 1000) * 1000 + 1000;
  }, [filteredLogs, selectedEndpoint]);

  // Dimensions
  const chartHeight = 180;
  const chartWidth = 760;
  const padding = { top: 22, right: 18, bottom: 28, left: 48 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;
  const timeSpan = Math.max(maxTime - minTime, 1);

  // Compute SVG series paths, points, and metrics
  const seriesData = useMemo(() => {
    const eps = selectedEndpoint === 'all' ? availableEndpoints : [selectedEndpoint];

    return eps.map((ep, idx) => {
      const epLogs = seriesByEndpoint[ep] || [];
      const color = getEndpointColor(ep, idx);

      const points = epLogs.map((log) => {
        const t = dayjs(log.created_at).valueOf();
        const x = padding.left + Math.max(0, Math.min(1, (t - minTime) / timeSpan)) * innerWidth;
        const clampedMs = Math.min(log.response_time_ms, maxY);
        const y = padding.top + innerHeight - (clampedMs / maxY) * innerHeight;
        return { x, y, log, endpoint: ep };
      });

      const linePath = generateSmoothPath(points);
      const areaPath = points.length > 0
        ? `${linePath} L ${points[points.length - 1].x.toFixed(1)},${(padding.top + innerHeight).toFixed(1)} L ${points[0].x.toFixed(1)},${(padding.top + innerHeight).toFixed(1)} Z`
        : '';

      // Statistical metrics
      const times = epLogs.map(l => l.response_time_ms).sort((a, b) => a - b);
      const current = epLogs.length > 0 ? epLogs[epLogs.length - 1].response_time_ms : 0;
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
        stats: { current, avg, min, max, p95, count: times.length },
      };
    });
  }, [availableEndpoints, selectedEndpoint, seriesByEndpoint, minTime, maxTime, timeSpan, innerWidth, innerHeight, maxY, padding.left, padding.top]);

  // Scalable Y-axis grid ticks (4 divisions)
  const yTicks = useMemo(() => {
    return [
      0,
      Math.round(maxY * 0.25),
      Math.round(maxY * 0.5),
      Math.round(maxY * 0.75),
      maxY,
    ];
  }, [maxY]);

  // Scalable X-axis time marks
  const xTicks = useMemo(() => {
    const count = 5;
    const ticks: { x: number; label: string }[] = [];

    for (let i = 0; i < count; i++) {
      const ratio = i / (count - 1);
      const x = padding.left + ratio * innerWidth;
      const tickTime = minTime + ratio * timeSpan;

      let label = '';
      if (i === count - 1) {
        label = t('chart.now');
      } else if (timeRange === '1h') {
        const minsAgo = Math.round((maxTime - tickTime) / (60 * 1000));
        label = `-${minsAgo}m`;
      } else if (timeRange === '6h') {
        const hrsAgo = Math.round((maxTime - tickTime) / (60 * 60 * 1000));
        label = `-${hrsAgo}h`;
      } else if (timeRange === '24h') {
        const hrsAgo = Math.round((maxTime - tickTime) / (60 * 60 * 1000));
        label = hrsAgo === 0 ? t('chart.now') : `-${hrsAgo}h`;
      } else if (timeRange === '7d') {
        const daysAgo = Math.round((maxTime - tickTime) / (24 * 60 * 60 * 1000));
        label = daysAgo === 0 ? t('chart.now') : `-${daysAgo}d`;
      }

      ticks.push({ x, label });
    }
    return ticks;
  }, [minTime, maxTime, timeSpan, innerWidth, padding.left, timeRange, t]);

  // Handle interactive scrubbing across chart
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const svgX = (clientX / rect.width) * chartWidth;

    if (svgX >= padding.left && svgX <= padding.left + innerWidth) {
      setScrubberX(svgX);
    } else {
      setScrubberX(null);
    }
  }, [chartWidth, innerWidth, padding.left]);

  const handleMouseLeave = useCallback(() => {
    setScrubberX(null);
  }, []);

  // Compute closest points across all series at scrubber position
  const activeScrubberData = useMemo(() => {
    if (scrubberX === null) return null;
    const ratio = (scrubberX - padding.left) / innerWidth;
    const targetTimestamp = minTime + ratio * timeSpan;

    const matchedEntries = seriesData.map(series => {
      if (series.points.length === 0) return null;
      let closest = series.points[0];
      let minDiff = Math.abs(dayjs(closest.log.created_at).valueOf() - targetTimestamp);

      for (let i = 1; i < series.points.length; i++) {
        const pt = series.points[i];
        const diff = Math.abs(dayjs(pt.log.created_at).valueOf() - targetTimestamp);
        if (diff < minDiff) {
          minDiff = diff;
          closest = pt;
        }
      }

      return {
        endpoint: series.endpoint,
        color: series.color,
        point: closest,
        diffMs: minDiff,
      };
    }).filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    if (matchedEntries.length === 0) return null;

    // Use the timestamp of the best matching point
    const primaryEntry = matchedEntries[0];
    const timestampStr = primaryEntry.point.log.created_at;

    return {
      x: scrubberX,
      targetTime: targetTimestamp,
      timestampStr,
      entries: matchedEntries,
    };
  }, [scrubberX, seriesData, minTime, timeSpan, innerWidth, padding.left]);

  // Format dynamic title with active range
  const timeRangeLabel = useMemo(() => {
    switch (timeRange) {
      case '1h': return t('chart.range1h');
      case '6h': return t('chart.range6h');
      case '24h': return t('chart.range24h');
      case '7d': return t('chart.range7d');
    }
  }, [timeRange, t]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 mb-8 shadow-sm animate-pulse">
        <div className="h-5 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
        <div className="h-44 bg-gray-100 dark:bg-gray-800/50 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 mb-8 shadow-sm relative transition-colors duration-200">
      {/* Toast feedback notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-semibold px-4 py-2 rounded-full shadow-xl flex items-center gap-2 z-50 animate-fade-in">
          <CheckCheck size={14} className="text-green-400 dark:text-green-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with Title, Live Status Indicator & Scalable Time Range Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-100 dark:border-blue-900/50">
            <Activity size={19} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {t('chart.titleWithRange', { range: timeRangeLabel })}
              </h3>
              {/* Pulsing Live indicator */}
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>{t('chart.liveBadge')}</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
              {t('chart.subtitle')}
            </p>
          </div>
        </div>

        {/* Scalable Time Range Selector Pills */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg text-xs font-medium select-none self-stretch sm:self-auto justify-end">
          {(['1h', '6h', '24h', '7d'] as ChartTimeRange[]).map((range) => {
            const isSelected = timeRange === range;
            return (
              <button
                key={range}
                onClick={() => handleTimeRangeSelect(range)}
                className={`px-3 py-1 rounded-md transition-all font-medium cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-xs font-semibold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                {range}
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Metrics & Averages Badges */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 text-xs select-none">
        <button
          onClick={() => setSelectedEndpoint('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all font-medium whitespace-nowrap cursor-pointer ${
            selectedEndpoint === 'all'
              ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-xs font-semibold'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <span>{t('chart.allEndpoints')}</span>
        </button>

        {seriesData.map((s) => {
          const isSelected = selectedEndpoint === s.endpoint;

          return (
            <button
              key={s.endpoint}
              onClick={() => setSelectedEndpoint(s.endpoint)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all font-medium whitespace-nowrap cursor-pointer ${
                isSelected
                  ? `${s.color.badgeBg} ${s.color.text} font-semibold shadow-xs ring-1 ring-current`
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${s.color.bgDot}`} />
              <span>{s.endpoint.replace('Model: ', '')}</span>
              <span className="font-mono text-[11px] opacity-90 pl-1 border-l border-current/20">
                {s.stats.current}ms
              </span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                ({t('chart.avg')}: {s.stats.avg}ms)
              </span>
            </button>
          );
        })}
      </div>

      {/* Main SVG Interactive Multi-Line Chart */}
      {filteredLogs.length === 0 ? (
        <div className="h-44 flex flex-col justify-center items-center text-gray-400 dark:text-gray-500 text-xs italic bg-gray-50/50 dark:bg-gray-800/20 rounded-lg border border-dashed border-gray-200 dark:border-gray-800">
          <AlertCircle size={22} className="mb-1.5 text-gray-300 dark:text-gray-600" />
          <span>{t('chart.noData')}</span>
        </div>
      ) : (
        <div className="relative w-full overflow-hidden">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto overflow-visible select-none cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              {/* Dynamic glowing gradient definitions for each endpoint */}
              {seriesData.map((s, idx) => (
                <linearGradient
                  key={s.endpoint}
                  id={`area-gradient-${idx}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={s.color.fillGradient}
                    stopOpacity={selectedEndpoint === 'all' ? 0.12 : 0.28}
                  />
                  <stop
                    offset="100%"
                    stopColor={s.color.fillGradient}
                    stopOpacity={0.0}
                  />
                </linearGradient>
              ))}
            </defs>

            {/* Horizontal Grid lines & Y-axis labels */}
            {yTicks.map((tick, i) => {
              const y = padding.top + innerHeight - (tick / maxY) * innerHeight;
              return (
                <g key={tick}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={padding.left + innerWidth}
                    y2={y}
                    stroke="currentColor"
                    strokeDasharray={i === 0 ? undefined : '3 3'}
                    className={i === 0 ? 'text-gray-200 dark:text-gray-800' : 'text-gray-100 dark:text-gray-800/60'}
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 3.5}
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
                  fill={`url(#area-gradient-${idx})`}
                  className="transition-all duration-300 pointer-events-none"
                />
              )
            ))}

            {/* Render Smooth Bezier Line Series */}
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
                  className="transition-opacity duration-200 pointer-events-none"
                  style={{
                    opacity:
                      activeScrubberData &&
                      selectedEndpoint === 'all' &&
                      !activeScrubberData.entries.some(e => e.endpoint === s.endpoint)
                        ? 0.35
                        : 1,
                  }}
                />
              )
            ))}

            {/* Render Point Halos / Small Dots along the curve */}
            {seriesData.flatMap((s) =>
              s.points.map((pt, ptIdx) => {
                const isNearScrubber =
                  activeScrubberData &&
                  activeScrubberData.entries.some(
                    e => e.endpoint === s.endpoint && e.point.log.created_at === pt.log.created_at
                  );

                return (
                  <circle
                    key={`${s.endpoint}-${ptIdx}`}
                    cx={pt.x}
                    cy={pt.y}
                    r={isNearScrubber ? 4.5 : 2}
                    fill={s.color.stroke}
                    stroke="white"
                    strokeWidth={isNearScrubber ? 1.5 : 0}
                    className="transition-all duration-150 pointer-events-none"
                  />
                );
              })
            )}

            {/* Vertical Interactive Scrubber Line */}
            {activeScrubberData && (
              <g className="pointer-events-none">
                <line
                  x1={activeScrubberData.x}
                  y1={padding.top}
                  x2={activeScrubberData.x}
                  y2={padding.top + innerHeight}
                  stroke="currentColor"
                  strokeDasharray="2 2"
                  strokeWidth="1.5"
                  className="text-gray-400 dark:text-gray-500"
                />
                {activeScrubberData.entries.map((entry) => (
                  <g key={`scrub-dot-${entry.endpoint}`}>
                    <circle
                      cx={entry.point.x}
                      cy={entry.point.y}
                      r={5.5}
                      fill={entry.color.stroke}
                      stroke="white"
                      strokeWidth="2"
                    />
                  </g>
                ))}
              </g>
            )}

            {/* X-axis time marks */}
            <g className="text-[10px] fill-gray-400 dark:fill-gray-500 font-mono">
              {xTicks.map((tick, i) => (
                <text
                  key={i}
                  x={tick.x}
                  y={chartHeight - 6}
                  textAnchor={i === 0 ? 'start' : i === xTicks.length - 1 ? 'end' : 'middle'}
                >
                  {tick.label}
                </text>
              ))}
            </g>
          </svg>

          {/* Interactive Multi-Service Scrubber Floating Tooltip */}
          {activeScrubberData && (
            <div
              className="absolute z-20 bg-gray-900/95 dark:bg-gray-800/95 backdrop-blur-sm text-white text-xs py-2.5 px-3.5 rounded-xl shadow-2xl pointer-events-auto border border-gray-700/80 transition-transform duration-75 select-none -translate-x-1/2 -translate-y-full mb-3"
              style={{
                left: `${Math.min(Math.max((activeScrubberData.x / chartWidth) * 100, 15), 85)}%`,
                top: `${padding.top + innerHeight * 0.45}px`,
              }}
            >
              {/* Tooltip Header: Formatted Timestamp & Diagnostics Copy CTA */}
              <div className="flex justify-between items-center gap-3 border-b border-gray-700/70 pb-1.5 mb-2">
                <span className="text-[11px] font-semibold text-gray-200">
                  {dayjs(activeScrubberData.timestampStr).format('MMM D, YYYY · HH:mm:ss')}
                </span>
                <span className="text-[10px] text-blue-400 bg-blue-950/80 px-1.5 py-0.5 rounded font-mono">
                  {dayjs(activeScrubberData.timestampStr).format('HH:mm')}
                </span>
              </div>

              {/* Endpoint Rows */}
              <div className="space-y-1.5">
                {activeScrubberData.entries.map((entry) => (
                  <div
                    key={entry.endpoint}
                    onClick={() => copyPointData(entry.point.log, entry.endpoint)}
                    className="flex items-center justify-between gap-4 group cursor-pointer hover:bg-gray-800/80 p-1 rounded transition-colors"
                    title={t('chart.clickToCopy')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: entry.color.stroke }}
                      />
                      <span className="text-[11px] text-gray-300 font-medium group-hover:text-white">
                        {entry.endpoint.replace('Model: ', '')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-[12px] font-bold text-white">
                        {entry.point.log.response_time_ms}ms
                      </span>
                      <span
                        className={`text-[10px] px-1 rounded ${
                          entry.point.log.is_operational && entry.point.log.status_code < 400
                            ? 'text-green-400 bg-green-950/60'
                            : 'text-amber-400 bg-amber-950/60'
                        }`}
                      >
                        {entry.point.log.status_code || 200}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer hint */}
              <div className="text-[9.5px] text-gray-400 text-center mt-2 pt-1 border-t border-gray-700/50">
                {t('chart.clickToCopy')}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
