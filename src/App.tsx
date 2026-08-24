import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { StatusBanner } from './components/StatusBanner';
import { Announcements } from './components/Announcements';
import { UptimeGrid } from './components/UptimeGrid';
import { IncidentHistory } from './components/IncidentHistory';
import { ComponentList } from './components/ComponentList';
import { PastIncidents } from './components/PastIncidents';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';
import { ResponseTimeChart, type PingLog } from './components/ResponseTimeChart';
import type { ServiceComponent } from './components/ComponentList';
import type { MonthIncidents } from './components/IncidentHistory';
import type { UptimeDay } from './components/UptimeGrid';
import { supabase } from './lib/supabase';
import { useTranslation } from './lib/i18n';
import dayjs from 'dayjs';

type TabType = 'components' | 'incidents' | 'uptime' | 'admin';

interface AppState {
  overallStatus: 'operational' | 'degraded' | 'outage';
  lastRefreshed: Date;
  responseTimeMs?: number;
  uptimeData: UptimeDay[];
  componentsData: ServiceComponent[];
  incidentData: MonthIncidents[];
  latencyLogs: PingLog[];
  incidentCount24h: number;
  uptimePercentage: number;
  loading: boolean;
}

const MONITORED_SERVICES = [
  { id: 'gateway-http', name: 'API Gateway (HTTP / Models)' },
  { id: 'model-qwen', name: 'Model: Qwen 3.8 27B' },
  // Temporarily disabled per 9arm announcement: "Deepseek will be disabled NOW... will return soon"
  // Ref: https://discord.com/channels/826099393694400574/1512469795218653417/1540781941148622928
  // { id: 'model-deepseek', name: 'Model: DeepSeek v4 Flash' },
];

// Skeleton block for loading state
const SkeletonBlock = ({ className }: { className?: string }) => (
  <div className={`skeleton rounded ${className}`} />
);

const LoadingSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {/* Banner skeleton */}
    <SkeletonBlock className="h-14 w-full rounded-lg" />
    {/* Card skeleton */}
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-sm p-4 space-y-4 shadow-sm">
      <div className="flex justify-between items-center">
        <SkeletonBlock className="h-4 w-40" />
        <SkeletonBlock className="h-4 w-24" />
      </div>
      <SkeletonBlock className="h-8 w-full rounded" />
      <div className="flex justify-between">
        <SkeletonBlock className="h-3 w-16" />
        <SkeletonBlock className="h-3 w-24" />
        <SkeletonBlock className="h-3 w-12" />
      </div>
    </div>
    {/* Chart skeleton */}
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm space-y-4">
      <SkeletonBlock className="h-5 w-48" />
      <SkeletonBlock className="h-36 w-full" />
    </div>
    {/* Past incidents skeleton */}
    <div className="space-y-4 mt-8">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-3 w-full" />
        </div>
      ))}
    </div>
  </div>
);

function App() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const path = window.location.pathname;
    if (path === '/uptime') return 'uptime';
    if (path === '/incidents') return 'incidents';
    if (path === '/admin') return 'admin';
    return 'components';
  });

  const [state, setState] = useState<AppState>({
    overallStatus: 'operational',
    lastRefreshed: new Date(),
    responseTimeMs: undefined,
    uptimeData: [],
    componentsData: [],
    incidentData: [],
    latencyLogs: [],
    incidentCount24h: 0,
    uptimePercentage: 100,
    loading: true
  });

  useEffect(() => {
    fetchUptimeData();
    const intervalId = setInterval(() => fetchUptimeData(true), 60000);

    // Supabase Realtime subscription for instant live chart updates
    const channel = supabase
      .channel('api_status_logs_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'api_status_logs' },
        (payload) => {
          const newRow = payload.new as PingLog;
          if (newRow && newRow.created_at) {
            setState(prev => {
              const updatedLatency = [...prev.latencyLogs, newRow].slice(-3000);
              return {
                ...prev,
                latencyLogs: updatedLatency,
                lastRefreshed: new Date(newRow.created_at),
              };
            });
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(intervalId);
      supabase.removeChannel(channel);
    };
  }, []);

  // Sync tab to URL
  useEffect(() => {
    let path = '/';
    if (activeTab === 'uptime') path = '/uptime';
    else if (activeTab === 'incidents') path = '/incidents';
    else if (activeTab === 'admin') path = '/admin';
    if (window.location.pathname !== path) window.history.pushState(null, '', path);
  }, [activeTab]);

  // Browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/uptime') setActiveTab('uptime');
      else if (path === '/incidents') setActiveTab('incidents');
      else if (path === '/admin') setActiveTab('admin');
      else setActiveTab('components');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const fetchUptimeData = async (isSilentRefresh = false) => {
    try {
      if (!isSilentRefresh) setState(s => ({ ...s, loading: true }));

      // 1. Fetch recent pings (up to 20 latest) to determine current status per endpoint
      const { data: statusData, error: statusError } = await supabase
        .from('api_status_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (statusError) throw statusError;

      let lastRefreshed = new Date();
      let avgResponseTime: number | undefined;

      if (statusData && statusData.length > 0) {
        lastRefreshed = new Date(statusData[0].created_at || new Date());
      }

      // 2. Fetch 90-day uptime per component in parallel
      const parseUptimeRow = (row: any): UptimeDay => {
        const uptimePct = row.uptime_pct !== undefined ? Number(row.uptime_pct) : 100;
        let status: UptimeDay['status'] = row.status || 'operational';

        // Accurate Status Grading:
        // If degradation was recorded or uptime is under 99.9%, grade accordingly
        if (status !== 'no-data') {
          if (uptimePct < 90) {
            status = 'outage';
          } else if (uptimePct < 99.9) {
            status = 'degraded';
          } else {
            status = 'operational';
          }
        }

        return {
          date: row.date || dayjs().toISOString(),
          status,
          uptimePercentage: uptimePct,
          totalPings: row.total_pings !== undefined ? Number(row.total_pings) : undefined,
          outages: row.outages !== undefined ? Number(row.outages) : undefined,
        };
      };

      const uptimeByComponent: Record<string, UptimeDay[]> = {};
      const { data: defaultRpcData } = await supabase.rpc('get_uptime_90_days');

      let defaultUptimeDays: UptimeDay[] = [];
      if (defaultRpcData && Array.isArray(defaultRpcData) && defaultRpcData.length > 0) {
        defaultUptimeDays = defaultRpcData.map(parseUptimeRow);
      } else {
        defaultUptimeDays = Array.from({ length: 90 }).map((_, i) => ({
          date: dayjs().subtract(89 - i, 'day').toISOString(),
          status: 'no-data',
          uptimePercentage: 100,
        }));
      }

      await Promise.all(
        MONITORED_SERVICES.map(async (svc) => {
          try {
            const { data } = await supabase.rpc('get_uptime_90_days', { target_endpoint: svc.name });
            if (data && Array.isArray(data) && data.length > 0) {
              uptimeByComponent[svc.id] = data.map(parseUptimeRow);
            }
          } catch (e) {
            console.error(`Failed to fetch 90-day uptime for ${svc.name}:`, e);
          }
        })
      );

      const validDefaultDays = defaultUptimeDays.filter(d => d.status !== 'no-data');
      const uptimePercentage = validDefaultDays.length > 0
        ? validDefaultDays.reduce((acc, d) => acc + (d.uptimePercentage ?? 100), 0) / validDefaultDays.length
        : 100;

      // 3. Scalable Latency Logs (Ordered descending to always include present-time logs, up to 3000 rows)
      const { data: latencyRows } = await supabase
        .from('api_status_logs')
        .select('created_at, response_time_ms, status_code, is_operational, endpoint')
        .order('created_at', { ascending: false })
        .limit(3000);

      const latencyLogs: PingLog[] = latencyRows ? [...latencyRows].reverse() : [];

      // 4. Build Multi-Component Status List
      const componentsData: ServiceComponent[] = MONITORED_SERVICES.map(svc => {
        // Find most recent log for this endpoint
        const latestLog = statusData?.find(l => l.endpoint === svc.name) || statusData?.[0];

        let compStatus: ServiceComponent['status'] = 'operational';
        let compResponseTime = latestLog?.response_time_ms;
        const isModel = svc.name.toLowerCase().includes('model');
        const latencyThresholdMs = isModel ? 3500 : 1500;

        if (latestLog) {
          if (!latestLog.is_operational || latestLog.status_code >= 500) {
            compStatus = 'major_outage';
          } else if (latestLog.response_time_ms > latencyThresholdMs || (latestLog.status_code >= 400 && latestLog.status_code !== 401)) {
            compStatus = 'degraded';
          }
        }

        // Component 90-day uptime history
        const compUptimeDays = uptimeByComponent[svc.id] || defaultUptimeDays;
        const validCompDays = compUptimeDays.filter(d => d.status !== 'no-data');
        const comp90dUptime = validCompDays.length > 0
          ? validCompDays.reduce((acc, d) => acc + (d.uptimePercentage ?? 100), 0) / validCompDays.length
          : 100;

        return {
          id: svc.id,
          name: svc.name,
          status: compStatus,
          uptimeDays: compUptimeDays,
          uptimePercentage: comp90dUptime,
          responseTimeMs: compResponseTime,
        };
      });

      // Compute overall system status across all components
      let overallStatus: AppState['overallStatus'] = 'operational';
      const hasOutage = componentsData.some(c => c.status === 'major_outage' || c.status === 'partial_outage');
      const hasDegraded = componentsData.some(c => c.status === 'degraded');
      const allDown = componentsData.every(c => c.status === 'major_outage');

      if (allDown) {
        overallStatus = 'outage';
      } else if (hasOutage || hasDegraded) {
        overallStatus = 'degraded';
      }

      // Compute average response time across active endpoints
      const validTimes = componentsData.map(c => c.responseTimeMs).filter((t): t is number => typeof t === 'number');
      if (validTimes.length > 0) {
        avgResponseTime = Math.round(validTimes.reduce((a, b) => a + b, 0) / validTimes.length);
      }

      // 5. Incidents
      const { data: incidentRows, error: incidentError } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false });

      if (incidentError) throw incidentError;

      const incidentsByMonth: Record<string, MonthIncidents> = {};
      if (incidentRows) {
        incidentRows.forEach(row => {
          const date = dayjs(row.created_at);
          const monthName = date.format('MMMM');
          const year = date.year();
          const key = `${year}-${date.month()}`;
          if (!incidentsByMonth[key]) {
            incidentsByMonth[key] = { name: monthName, year, monthIndex: date.month(), incidents: [] };
          }
          incidentsByMonth[key].incidents.push({
            id: row.id,
            name: row.name,
            message: row.message,
            impact: row.impact,
            timestamp: date.format('MMM D, HH:mm [UTC]'),
            createdAt: row.created_at,
          });
        });
      }

      const twentyFourHoursAgo = dayjs().subtract(24, 'hour');
      const incidentCount24h = incidentRows
        ? incidentRows.filter(row => dayjs(row.created_at).isAfter(twentyFourHoursAgo)).length
        : 0;

      const finalIncidentData = Object.keys(incidentsByMonth)
        .sort((a, b) => b.localeCompare(a))
        .map(key => incidentsByMonth[key]);

      setState({
        overallStatus,
        lastRefreshed,
        responseTimeMs: avgResponseTime,
        uptimeData: defaultUptimeDays,
        componentsData,
        incidentData: finalIncidentData,
        latencyLogs,
        incidentCount24h,
        uptimePercentage,
        loading: false
      });
    } catch (error) {
      console.error('Failed to fetch status data:', error);
      setState(s => ({ ...s, loading: false }));
    }
  };

  const { t } = useTranslation();

  const tabs: { key: TabType; label: string; badge?: number }[] = [
    { key: 'components', label: t('tabs.currentStatus') },
    { key: 'incidents', label: t('tabs.incidents'), badge: state.incidentCount24h > 0 ? state.incidentCount24h : undefined },
    { key: 'uptime', label: t('tabs.uptime') },
    ...(activeTab === 'admin' ? [{ key: 'admin' as TabType, label: t('tabs.admin') }] : []),
  ];

  return (
    <div className="bg-[#f9fafb] dark:bg-[#09090b] text-gray-800 dark:text-gray-100 antialiased min-h-screen transition-colors duration-200">
      <div className="max-w-4xl mx-auto py-12 px-6">
        <Header
          isDark={isDark}
          toggleDark={() => setIsDark(!isDark)}
        />

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 mb-8">
          {tabs.map(tab => (
            <button
              key={tab.key}
              id={`tab-${tab.key}`}
              className={`py-3 px-4 text-sm font-medium transition-colors duration-150 -mb-px cursor-pointer flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'border-b-2 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100 font-semibold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border-b-2 border-transparent'
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full leading-none">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {state.loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {activeTab === 'uptime' && (
              <UptimeGrid
                components={state.componentsData}
                uptimePercentage={state.uptimePercentage}
                days={state.uptimeData}
              />
            )}

            {activeTab === 'components' && (
              <>
                <StatusBanner
                  status={state.overallStatus}
                  lastRefreshed={state.lastRefreshed}
                  responseTimeMs={state.responseTimeMs}
                  incidentCount24h={state.incidentCount24h}
                />
                <Announcements />
                <ComponentList
                  components={state.componentsData}
                  recentLogs={state.latencyLogs}
                />
                <ResponseTimeChart
                  logs={state.latencyLogs}
                  monitoredEndpoints={MONITORED_SERVICES.map(s => s.name)}
                  lastUpdated={state.lastRefreshed}
                />
                <PastIncidents
                  months={state.incidentData}
                  incidentCount24h={state.incidentCount24h}
                />
              </>
            )}

            {activeTab === 'incidents' && (
              <IncidentHistory
                months={state.incidentData}
                components={state.componentsData}
              />
            )}

            {activeTab === 'admin' && (
              <AdminPanel
                onIncidentChange={() => fetchUptimeData(true)}
                supabaseUrl={import.meta.env.VITE_SUPABASE_URL ?? 'https://ssqvojmcrubohsudmrta.supabase.co'}
              />
            )}
          </>
        )}

        {/* Footer */}
        <Footer
          activeTab={activeTab}
          onExitAdmin={() => setActiveTab('components')}
        />
      </div>
    </div>
  );
}

export default App;
