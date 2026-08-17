import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

export interface Incident {
  id: string;
  name: string;
  message: string;
  impact: 'none' | 'minor' | 'major' | 'critical';
  timestamp: string;
  createdAt?: string;
}

export interface MonthIncidents {
  name: string;
  year: number;
  incidents: Incident[];
}

interface IncidentHistoryProps {
  months: MonthIncidents[];
}

export const IncidentHistory: React.FC<IncidentHistoryProps> = ({ months }) => {
  // We'll track which months have their "Show All" expanded. 
  // By default, we show only the first 3 incidents per month.
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});

  const toggleMonth = (monthKey: string) => {
    setExpandedMonths(prev => ({
      ...prev,
      [monthKey]: !prev[monthKey]
    }));
  };

  const getImpactColor = (impact: Incident['impact']) => {
    switch (impact) {
      case 'none': return 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200';
      case 'minor': return 'text-yellow-600 dark:text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-400';
      case 'major': return 'text-orange-600 dark:text-orange-500 hover:text-orange-700 dark:hover:text-orange-400';
      case 'critical': return 'text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-sm p-6 mb-8 shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
        <div className="w-full md:w-64 relative">
          <div className="flex items-center justify-between border border-gray-300 dark:border-gray-700 rounded-sm px-4 py-2 cursor-pointer hover:border-gray-400 dark:hover:border-gray-600">
            <span className="text-[15px] font-medium text-gray-700 dark:text-gray-300">Filter Components</span>
            <ChevronDown size={18} className="text-gray-500 dark:text-gray-400" />
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-[15px] font-medium text-gray-600 dark:text-gray-400">
          <button className="p-1 border border-gray-300 dark:border-gray-700 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
            <ChevronLeft size={18} />
          </button>
          <span className="flex items-center gap-1">
            <span className="text-gray-900 dark:text-gray-100">{months[months.length - 1]?.name}</span>
            <var className="not-italic text-gray-500 dark:text-gray-400">{months[months.length - 1]?.year}</var>
            <span className="mx-1">to</span>
            <span className="text-gray-900 dark:text-gray-100">{months[0]?.name}</span>
            <var className="not-italic text-gray-500 dark:text-gray-400">{months[0]?.year}</var>
          </span>
          <button className="p-1 border border-gray-300 dark:border-gray-700 rounded-sm bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed" disabled>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Months Container */}
      <div className="flex flex-col gap-10">
        {months.map((month) => {
          const monthKey = `${month.name}-${month.year}`;
          const isExpanded = expandedMonths[monthKey];
          const visibleIncidents = isExpanded ? month.incidents : month.incidents.slice(0, 3);
          const hasMore = month.incidents.length > 3;

          return (
            <div key={monthKey} className="flex flex-col">
              <h4 className="text-[18px] font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-800 pb-2 mb-4">
                {month.name} <var className="not-italic font-normal text-gray-500 dark:text-gray-400">{month.year}</var>
              </h4>
              
              <div className="flex flex-col gap-6">
                {month.incidents.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-[15px]">No incidents reported.</p>
                ) : (
                  <>
                    <div className="flex flex-col gap-6">
                      {visibleIncidents.map((incident) => (
                        <div key={incident.id} className="flex flex-col gap-1">
                          <a href="#" className={`text-[16px] font-medium ${getImpactColor(incident.impact)}`}>
                            {incident.name}
                          </a>
                          <div className="text-[15px] text-gray-800 dark:text-gray-200 mt-1">
                            {incident.message}
                          </div>
                          <div className="text-[13px] text-gray-500 dark:text-gray-400 mt-1">
                            {incident.timestamp}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {hasMore && (
                      <div 
                        className="py-3 mt-4 border-t border-gray-200 dark:border-gray-800 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-[13px] font-medium text-gray-500 dark:text-gray-400 outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:focus-visible:ring-gray-600"
                        role="button"
                        tabIndex={0}
                        aria-expanded={isExpanded ? "true" : "false"}
                        aria-controls={`incidents-${monthKey}`}
                        onClick={() => toggleMonth(monthKey)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMonth(monthKey); } }}
                      >
                        <span>
                          {isExpanded ? (
                            <>
                              <var className="not-italic mr-1">- Collapse</var>
                              <var className="not-italic">Incidents</var>
                            </>
                          ) : (
                            <>
                              <var className="not-italic mr-1">+ Show All</var>
                              <var className="not-italic mr-1">{month.incidents.length}</var>
                              <var className="not-italic">Incidents</var>
                            </>
                          )}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
