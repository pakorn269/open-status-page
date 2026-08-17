import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { StatusBanner } from './components/StatusBanner';
import { UptimeGrid } from './components/UptimeGrid';
import { IncidentHistory } from './components/IncidentHistory';
import { ComponentList } from './components/ComponentList';
import { PastIncidents } from './components/PastIncidents';
import type { ServiceComponent } from './components/ComponentList';
import type { MonthIncidents } from './components/IncidentHistory';
import type { UptimeDay } from './components/UptimeGrid';
import { supabase } from './lib/supabase';
import dayjs from 'dayjs';

type TabType = 'components' | 'incidents' | 'uptime';

interface AppState {
  overallStatus: 'operational' | 'degraded' | 'outage';
  lastRefreshed: Date;
  responseTimeMs?: number;
  uptimeData: UptimeDay[];
  componentsData: ServiceComponent[];
  incidentData: MonthIncidents[];
  uptimePercentage: number;
  loading: boolean;
}

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
    return 'components';
  });

  const [state, setState] = useState<AppState>({
    overallStatus: 'operational',
    lastRefreshed: new Date(),
    responseTimeMs: undefined,
    uptimeData: [],
    componentsData: [],
    incidentData: [],
    uptimePercentage: 100,
    loading: true
  });

  useEffect(() => {
    fetchUptimeData();
    const intervalId = setInterval(() => fetchUptimeData(true), 60000);
    return () => clearInterval(intervalId);
  }, []);

  // Sync tab to URL
  useEffect(() => {
    let path = '/';
    if (activeTab === 'uptime') path = '/uptime';
    else if (activeTab === 'incidents') path = '/incidents';
    if (window.location.pathname !== path) window.history.pushState(null, '', path);
  }, [activeTab]);

  // Browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/uptime') setActiveTab('uptime');
      else if (path === '/incidents') setActiveTab('incidents');
      else setActiveTab('components');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const fetchUptimeData = async (isSilentRefresh = false) => {
    try {
      if (!isSilentRefresh) setState(s => ({ ...s, loading: true }));

      // 1. Latest ping for status banner
      const { data: statusData, error: statusError } = await supabase
        .from('api_status_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (statusError) throw statusError;

      let overallStatus: AppState['overallStatus'] = 'operational';
      let lastRefreshed = new Date();
      let responseTimeMs: number | undefined;

      if (statusData && statusData.length > 0) {
        const latest = statusData[0];
        lastRefreshed = new Date(latest.created_at || new Date());
        responseTimeMs = latest.response_time_ms;

        if (!latest.is_operational) {
          overallStatus = 'outage';
        } else if (latest.response_time_ms > 2000 || latest.status_code >= 400) {
          overallStatus = 'degraded';
        }
      }

      // 2. 90-day uptime aggregate
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_uptime_90_days');
      if (rpcError) throw rpcError;

      let uptimeDays: UptimeDay[] = [];
      if (rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
        uptimeDays = rpcData.map((row: any) => ({
          date: row.date || dayjs().toISOString(),
          status: row.status || 'operational'
        }));
      } else {
        uptimeDays = Array.from({ length: 90 }).map((_, i) => ({
          date: dayjs().subtract(89 - i, 'day').toISOString(),
          status: 'no-data'
        }));
      }

      const validDays = uptimeDays.filter(d => d.status !== 'no-data');
      const operationalDays = validDays.filter(d => d.status === 'operational').length;
      const uptimePercentage = validDays.length > 0 ? (operationalDays / validDays.length) * 100 : 100;

      // 3. Incidents
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
            incidentsByMonth[key] = { name: monthName, year, incidents: [] };
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

      const finalIncidentData = Object.keys(incidentsByMonth)
        .sort((a, b) => b.localeCompare(a))
        .map(key => incidentsByMonth[key]);

      const componentsData: ServiceComponent[] = [
        {
          id: 'comp1',
          name: 'gateway.9arm.co',
          status: overallStatus === 'outage' ? 'major_outage' : overallStatus as ServiceComponent['status'],
          uptimeDays,
          uptimePercentage,
          responseTimeMs,
        }
      ];

      setState({
        overallStatus,
        lastRefreshed,
        responseTimeMs,
        uptimeData: uptimeDays,
        componentsData,
        incidentData: finalIncidentData,
        uptimePercentage,
        loading: false
      });
    } catch (error) {
      console.error('Failed to fetch status data:', error);
      setState(s => ({ ...s, loading: false }));
    }
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'components', label: 'Current Status' },
    { key: 'incidents', label: 'Incidents' },
    { key: 'uptime', label: 'Uptime' },
  ];

  return (
    <div className="bg-[#f9fafb] dark:bg-[#09090b] text-gray-800 dark:text-gray-100 antialiased min-h-screen transition-colors duration-200">
      <div className="max-w-4xl mx-auto py-12 px-6">
        <Header isDark={isDark} toggleDark={() => setIsDark(!isDark)} />

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 mb-8">
          {tabs.map(tab => (
            <button
              key={tab.key}
              id={`tab-${tab.key}`}
              className={`py-3 px-4 text-sm font-medium transition-colors duration-150 -mb-px ${
                activeTab === tab.key
                  ? 'border-b-2 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border-b-2 border-transparent'
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
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
                serviceName="gateway.9arm.co"
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
                />
                <ComponentList components={state.componentsData} />
                <PastIncidents months={state.incidentData} />
              </>
            )}

            {activeTab === 'incidents' && (
              <IncidentHistory months={state.incidentData} />
            )}
          </>
        )}

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 flex justify-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Open source ·{' '}
            <a
              href="https://github.com/pakorn269/open-status-page"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors underline underline-offset-2"
            >
              pakorn269/open-status-page
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
