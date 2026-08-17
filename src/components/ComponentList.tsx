import React from 'react';
import { Check, Minus, AlertTriangle, X, Wrench } from 'lucide-react';
import type { UptimeDay } from './UptimeGrid';

export interface ServiceComponent {
  id: string;
  name: string;
  status: 'operational' | 'degraded' | 'partial_outage' | 'major_outage' | 'maintenance';
  uptimeDays: UptimeDay[];
  uptimePercentage: number;
}

interface ComponentListProps {
  components: ServiceComponent[];
}

export const ComponentList: React.FC<ComponentListProps> = ({ components }) => {
  const getStatusColor = (status: UptimeDay['status']) => {
    switch (status) {
      case 'operational': return '#76ad2a';
      case 'degraded': return '#d9a92a';
      case 'outage': return '#e04343';
      case 'maintenance': return '#2c84db';
      case 'no-data': return '#b0aea5';
      default: return '#b0aea5';
    }
  };

  const getComponentStatusText = (status: ServiceComponent['status']) => {
    switch (status) {
      case 'operational': return 'Operational';
      case 'degraded': return 'Degraded Performance';
      case 'partial_outage': return 'Partial Outage';
      case 'major_outage': return 'Major Outage';
      case 'maintenance': return 'Under Maintenance';
    }
  };

  const getComponentStatusColor = (status: ServiceComponent['status']) => {
    switch (status) {
      case 'operational': return 'text-[#76ad2a]';
      case 'degraded': return 'text-[#d9a92a]';
      case 'partial_outage': return 'text-[#e86235]';
      case 'major_outage': return 'text-[#e04343]';
      case 'maintenance': return 'text-[#2c84db]';
    }
  };

  const getStatusIcon = (status: ServiceComponent['status']) => {
    const className = `${getComponentStatusColor(status)} w-4 h-4`;
    switch (status) {
      case 'operational': return <Check className={className} />;
      case 'degraded': return <Minus className={className} />;
      case 'partial_outage': return <AlertTriangle className={className} />;
      case 'major_outage': return <X className={className} />;
      case 'maintenance': return <Wrench className={className} />;
    }
  };

  return (
    <div className="w-full font-sans">
      <div className="text-[14px] text-gray-500 dark:text-gray-400 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        Uptime over the past <var className="font-semibold not-italic text-gray-700 dark:text-gray-300">90</var> days. <a href="/uptime" className="text-gray-500 dark:text-gray-400 underline hover:text-gray-800 dark:hover:text-gray-200" onClick={(e) => { e.preventDefault(); window.history.pushState(null, '', '/uptime'); window.dispatchEvent(new Event('popstate')); }}>View historical uptime.</a>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-sm mb-6 shadow-sm">
        {components.map((comp, idx) => (
          <div key={comp.id} className={`p-4 flex flex-col gap-3 ${idx !== components.length - 1 ? 'border-b border-gray-200 dark:border-gray-800' : ''}`}>
            {/* Component Header */}
            <div className="flex justify-between items-center">
              <span className="text-[15px] font-medium text-gray-900 dark:text-gray-100">{comp.name}</span>
              <div className="flex items-center gap-2 group relative">
                <span className={`text-[13px] font-medium ${getComponentStatusColor(comp.status)}`}>
                  {getComponentStatusText(comp.status)}
                </span>
                {getStatusIcon(comp.status)}
              </div>
            </div>

            {/* Sparkline Inline Uptime SVG */}
            <div className="w-full pt-2">
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
                    width="3" 
                    x={dayIdx * 5} 
                    y="0" 
                    fill={getStatusColor(day.status)}
                    className="hover:opacity-75 cursor-pointer transition-opacity"
                  >
                    <title>{`${day.date}\n${day.status}`}</title>
                  </rect>
                ))}
              </svg>
              
              {/* Inline Legend */}
              <div className="flex justify-between items-center text-[12px] text-gray-400 dark:text-gray-500 mt-2">
                <span>90 days ago</span>
                <span className="text-gray-500 dark:text-gray-400 font-medium">
                  {comp.uptimePercentage.toFixed(2)} % uptime
                </span>
                <span>Today</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Legend */}
      <div className="flex flex-wrap items-center gap-6 text-[13px] text-gray-600 dark:text-gray-400 mb-10 pt-2">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-[#76ad2a]" /> Operational
        </div>
        <div className="flex items-center gap-2">
          <Minus className="w-4 h-4 text-[#d9a92a]" /> Degraded Performance
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#e86235]" /> Partial Outage
        </div>
        <div className="flex items-center gap-2">
          <X className="w-4 h-4 text-[#e04343]" /> Major Outage
        </div>
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-[#2c84db]" /> Maintenance
        </div>
      </div>
    </div>
  );
};
