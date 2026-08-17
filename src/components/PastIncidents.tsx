import React from 'react';
import dayjs from 'dayjs';
import type { MonthIncidents, Incident } from './IncidentHistory';

interface PastIncidentsProps {
  months: MonthIncidents[];
}

export const PastIncidents: React.FC<PastIncidentsProps> = ({ months }) => {
  // Flatten incidents from all months, then sort by timestamp (descending)
  // Our mock data timestamps are strings like "Aug 5, 13:51 - 14:34 UTC"
  // Since this is mock data, we'll just flatten them in the order they appear (already descending)
  const allIncidents = months.flatMap(m => m.incidents);
  
  // A real Atlassian page shows a day-by-day rundown for the past 14 days.
  // For simplicity with our current data model, we'll extract the unique dates from recent incidents 
  // and list them, or show the last 7-14 days. Let's just generate the past 14 days.
  
  const past14Days = Array.from({ length: 14 }).map((_, i) => {
    return dayjs().subtract(i, 'day');
  });

  const getImpactColor = (impact: Incident['impact']) => {
    switch (impact) {
      case 'none': return 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200';
      case 'minor': return 'text-yellow-600 dark:text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-400';
      case 'major': return 'text-orange-600 dark:text-orange-500 hover:text-orange-700 dark:hover:text-orange-400';
      case 'critical': return 'text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400';
    }
  };

  // Helper to check if an incident belongs to a specific dayjs date
  const isIncidentOnDay = (incident: Incident, day: dayjs.Dayjs) => {
    // Our mock timestamp format: "Aug 5, 13:51 - 14:34 UTC"
    // We can just check if the string starts with the formatted date "MMM D," or "MMM DD,"
    const dayFormat1 = day.format('MMM D,');
    const dayFormat2 = day.format('MMM DD,');
    return incident.timestamp.startsWith(dayFormat1) || incident.timestamp.startsWith(dayFormat2);
  };

  return (
    <div className="w-full mt-10">
      <h3 className="text-[20px] font-semibold text-gray-900 dark:text-gray-100 mb-6">Past Incidents</h3>
      
      <div className="flex flex-col gap-8">
        {past14Days.map((day, i) => {
          const dayIncidents = allIncidents.filter(inc => isIncidentOnDay(inc, day));
          
          return (
            <div key={i} className="flex flex-col">
              <h4 className="text-[16px] font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-800 pb-2 mb-4">
                {day.format('MMM D, YYYY')}
              </h4>
              
              {dayIncidents.length === 0 ? (
                <p className="text-[15px] text-gray-500 dark:text-gray-400">No incidents reported today.</p>
              ) : (
                <div className="flex flex-col gap-6">
                  {dayIncidents.map(incident => (
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
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 mb-12">
        <a 
          href="/incidents" 
          onClick={(e) => {
            e.preventDefault();
            window.history.pushState(null, '', '/incidents');
            window.dispatchEvent(new Event('popstate'));
          }}
          className="text-[15px] font-medium text-blue-600 dark:text-blue-500 hover:text-blue-800 dark:hover:text-blue-400 flex items-center"
        >
          ← Incident History
        </a>
      </div>
    </div>
  );
};
