import React from 'react';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

export interface UptimeDay {
  date: string;
  status: 'operational' | 'degraded' | 'outage' | 'maintenance' | 'no-data';
}

interface UptimeGridProps {
  serviceName: string;
  uptimePercentage: number;
  days: UptimeDay[];
}

export const UptimeGrid: React.FC<UptimeGridProps> = ({ serviceName, days }) => {
  const getColor = (status: UptimeDay['status']) => {
    switch (status) {
      case 'operational': return '#76ad2a'; // Atlassian green
      case 'degraded': return '#d9a92a'; // Atlassian yellow/orange
      case 'outage': return '#e04343'; // Atlassian red
      case 'no-data': return '#EAEAEA'; // Atlassian gray
    }
  };

  const getStatusText = (status: UptimeDay['status']) => {
    switch (status) {
      case 'operational': return 'No downtime';
      case 'degraded': return 'Degraded performance';
      case 'outage': return 'Major outage';
      case 'no-data': return 'No data';
    }
  };

  const calculateMonthUptime = (monthDays: UptimeDay[]) => {
    const validDays = monthDays.filter(d => d.status !== 'no-data');
    if (validDays.length === 0) return '100.00';
    let score = 0;
    validDays.forEach(d => {
      if (d.status === 'operational') score += 100;
      else if (d.status === 'degraded') score += 95;
      else if (d.status === 'outage') score += 0;
    });
    return (score / validDays.length).toFixed(2);
  };

  // If no days are provided, fallback safely
  if (!days || days.length === 0) {
    return <div>No data available</div>;
  }

  // Calculate the months to display based on the data range
  let monthsToDisplay: dayjs.Dayjs[] = [];
  let currentMonth = dayjs(days[0].date).startOf('month');
  const lastMonth = dayjs(days[days.length - 1].date).startOf('month');

  while (currentMonth.isBefore(lastMonth) || currentMonth.isSame(lastMonth, 'month')) {
    monthsToDisplay.push(currentMonth);
    currentMonth = currentMonth.add(1, 'month');
  }

  // Force exactly 3 months to fit the 3-column grid design (current month + 2 previous)
  if (monthsToDisplay.length > 3) {
    monthsToDisplay = monthsToDisplay.slice(-3);
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-sm mb-8 shadow-sm">
      {/* Header with selector and pagination */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 pb-6">
        <div className="w-full md:w-72 relative">
          <div className="flex items-center justify-between border border-gray-300 dark:border-gray-700 rounded-sm px-4 py-2 cursor-pointer hover:border-gray-400 dark:hover:border-gray-600 bg-white dark:bg-gray-900">
            <span className="text-[15px] font-medium text-gray-800 dark:text-gray-200">{serviceName}</span>
            <ChevronDown size={18} className="text-gray-500 dark:text-gray-400" />
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-[15px] font-medium text-gray-600 dark:text-gray-400">
          <button className="p-1 border border-gray-300 dark:border-gray-700 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
            <ChevronLeft size={18} />
          </button>
          <span className="flex items-center gap-1">
            <span className="text-gray-900 dark:text-gray-100">{monthsToDisplay[0]?.format('MMMM')}</span>
            <var className="not-italic text-gray-500 dark:text-gray-400">{monthsToDisplay[0]?.format('YYYY')}</var>
            <span className="mx-1">to</span>
            <span className="text-gray-900 dark:text-gray-100">{monthsToDisplay[monthsToDisplay.length - 1]?.format('MMMM')}</span>
            <var className="not-italic text-gray-500 dark:text-gray-400">{monthsToDisplay[monthsToDisplay.length - 1]?.format('YYYY')}</var>
          </span>
          <button className="p-1 border border-gray-300 dark:border-gray-700 rounded-sm bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed" disabled>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Calendar Months Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {monthsToDisplay.map((month, i) => {
          const daysInMonth = month.daysInMonth();
          const monthDays: UptimeDay[] = [];
          
          for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
            const currentDay = month.date(dayNum);
            const foundDay = days.find(d => dayjs(d.date).isSame(currentDay, 'day'));
            monthDays.push(foundDay || { date: currentDay.toISOString(), status: 'no-data' });
          }

          return (
            <div key={i} className="flex flex-col">
              <div className="flex items-baseline gap-3 mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">
                <h6 className="text-[16px] font-semibold text-gray-900 dark:text-gray-100 m-0">
                  {month.format('MMMM')} <var className="not-italic font-normal text-gray-500 dark:text-gray-400">{month.format('YYYY')}</var>
                </h6>
                <small className="text-[13px] font-medium text-green-600">{calculateMonthUptime(monthDays)}%</small>
              </div>
              <div className="flex flex-wrap gap-[4px]">
                {monthDays.map((day, idx) => {
                  const formattedDate = dayjs(day.date).format('MMM D, YYYY');
                  const statusText = getStatusText(day.status);
                  const isNoData = day.status === 'no-data';
                  return (
                    <div 
                      key={idx}
                      className={`inline-flex ${!isNoData ? 'tooltip cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                      title={!isNoData ? `${formattedDate}\n${statusText}` : undefined}
                    >
                      <svg 
                        className="day" 
                        width="32" 
                        height="32" 
                        xmlns="http://www.w3.org/2000/svg" 
                        tabIndex={0}
                      >
                        <rect width="32" height="32" fill={getColor(day.status)} rx="2"></rect>
                      </svg>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
