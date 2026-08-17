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
  uptimeData: UptimeDay[];
  componentsData: ServiceComponent[];
  incidentData: MonthIncidents[];
  uptimePercentage: number;
  loading: boolean;
}

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
    uptimeData: [],
    componentsData: [],
    incidentData: [],
    uptimePercentage: 100,
    loading: true
  });

  useEffect(() => {
    // Initial fetch
    fetchUptimeData();
    
    // Auto-refresh every 60 seconds
    const intervalId = setInterval(() => {
      fetchUptimeData(true); // pass true to indicate a silent background refresh
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Sync tab state to URL
  useEffect(() => {
    let path = '/';
    if (activeTab === 'uptime') path = '/uptime';
    else if (activeTab === 'incidents') path = '/incidents';
    
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  }, [activeTab]);

  // Listen for browser back/forward navigation
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
      if (!isSilentRefresh) {
         setState(s => ({ ...s, loading: true }));
      }

      // 1. Fetch current status banner (latest ping)
      const { data: statusData, error: statusError } = await supabase
        .from('api_status_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (statusError) throw statusError;

      let overallStatus: AppState['overallStatus'] = 'operational';
      let lastRefreshed = new Date();

      if (statusData && statusData.length > 0) {
        const latest = statusData[0];
        lastRefreshed = new Date(latest.created_at || new Date());
        
        if (!latest.is_operational) {
          // is_operational=false means 5xx or network failure — true outage
          overallStatus = 'outage';
        } else if (latest.response_time_ms > 2000 || latest.status_code >= 400) {
          // Reachable but slow, or gateway rejected the request (auth/quota/model) — degraded
          overallStatus = 'degraded';
        }
      }

      // 2. Fetch 90-day aggregate from RPC
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_uptime_90_days');
      if (rpcError) throw rpcError;

      // Ensure we have an array of 90 days. If the DB doesn't have 90 days yet, we pad it.
      let uptimeDays: UptimeDay[] = [];
      if (rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
        uptimeDays = rpcData.map((row: any) => ({
          date: row.date || dayjs().toISOString(),
          status: row.status || 'operational'
        }));
      } else {
        // Fallback placeholder if RPC returns nothing yet
        uptimeDays = Array.from({ length: 90 }).map((_, i) => ({
          date: dayjs().subtract(89 - i, 'day').toISOString(),
          status: 'no-data'
        }));
      }

      // Calculate percentage based on days that are operational vs outage
      const validDays = uptimeDays.filter(d => d.status !== 'no-data');
      const operationalDays = validDays.filter(d => d.status === 'operational').length;
      const uptimePercentage = validDays.length > 0 
        ? (operationalDays / validDays.length) * 100 
        : 100;

      // 3. Fetch Live Incidents
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
          const key = `${year}-${date.month()}`; // Sortable key
          
          if (!incidentsByMonth[key]) {
            incidentsByMonth[key] = {
              name: monthName,
              year: year,
              incidents: []
            };
          }
          
          incidentsByMonth[key].incidents.push({
            id: row.id,
            name: row.name,
            message: row.message,
            impact: row.impact,
            timestamp: date.format('MMM D, HH:mm [UTC]')
          });
        });
      }

      // Sort the grouped months descending (newest month first)
      const finalIncidentData = Object.keys(incidentsByMonth)
        .sort((a, b) => b.localeCompare(a))
        .map(key => incidentsByMonth[key]);

      const componentsData: ServiceComponent[] = [
        {
          id: 'comp1',
          name: 'gateway.9arm.co',
          status: overallStatus === 'outage' ? 'major_outage' : overallStatus as ServiceComponent['status'],
          uptimeDays: uptimeDays,
          uptimePercentage: uptimePercentage
        }
      ];

      setState({
        overallStatus: overallStatus,
        lastRefreshed: lastRefreshed,
        uptimeData: uptimeDays,
        componentsData: componentsData,
        incidentData: finalIncidentData,
        uptimePercentage: uptimePercentage,
        loading: false
      });
    } catch (error) {
      console.error('Failed to fetch status data:', error);
      setState(s => ({ ...s, loading: false }));
    }
  };

  return (
    <div className="bg-[#f9fafb] dark:bg-[#09090b] text-gray-800 dark:text-gray-100 font-sans antialiased min-h-screen transition-colors duration-200">
      <div className="max-w-4xl mx-auto py-12 px-6">
        <Header isDark={isDark} toggleDark={() => setIsDark(!isDark)} />

        <div className="flex border-b border-gray-200 dark:border-gray-800 mb-8 gap-2">
          <button 
            className={`py-3 px-4 font-medium transition-colors ${activeTab === 'components' ? 'border-b-2 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}`}
            onClick={() => setActiveTab('components')}
          >
            Current Status
          </button>
          <button 
            className={`py-3 px-4 font-medium transition-colors ${activeTab === 'incidents' ? 'border-b-2 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}`}
            onClick={() => setActiveTab('incidents')}
          >
            Incidents
          </button>
          <button 
            className={`py-3 px-4 font-medium transition-colors ${activeTab === 'uptime' ? 'border-b-2 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}`}
            onClick={() => setActiveTab('uptime')}
          >
            Uptime
          </button>
        </div>

        {state.loading ? (
          <div className="flex justify-center items-center py-12 text-gray-500">
            Loading status data...
          </div>
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
                <StatusBanner status={state.overallStatus} lastRefreshed={state.lastRefreshed} />
                <ComponentList components={state.componentsData} />
                <PastIncidents months={state.incidentData} />
              </>
            )}
            
            {activeTab === 'incidents' && (
              <IncidentHistory months={state.incidentData} />
            )}
          </>
        )}

        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 flex justify-center items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Powered by <a href="#" className="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors decoration-2 hover:underline underline-offset-4">Open Status Page</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
