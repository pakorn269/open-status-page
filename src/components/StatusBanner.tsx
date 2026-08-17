import React from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface StatusBannerProps {
  status: 'operational' | 'degraded' | 'outage';
  lastRefreshed: Date;
  responseTimeMs?: number;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({ status, lastRefreshed, responseTimeMs }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'operational':
        return {
          text: 'All Systems Operational',
          dotClass: 'bg-green-400',
          borderClass: 'border-green-200 dark:border-green-900',
          bgClass: 'bg-green-50 dark:bg-green-950',
          textClass: 'text-green-800 dark:text-green-200',
          badgeBg: 'bg-green-100 dark:bg-green-900',
          badgeText: 'text-green-700 dark:text-green-300',
        };
      case 'degraded':
        return {
          text: 'Degraded Performance',
          dotClass: 'bg-yellow-400',
          borderClass: 'border-yellow-200 dark:border-yellow-900',
          bgClass: 'bg-yellow-50 dark:bg-yellow-950',
          textClass: 'text-yellow-800 dark:text-yellow-200',
          badgeBg: 'bg-yellow-100 dark:bg-yellow-900',
          badgeText: 'text-yellow-700 dark:text-yellow-300',
        };
      case 'outage':
        return {
          text: 'Major Outage',
          dotClass: 'bg-red-400',
          borderClass: 'border-red-200 dark:border-red-900',
          bgClass: 'bg-red-50 dark:bg-red-950',
          textClass: 'text-red-800 dark:text-red-200',
          badgeBg: 'bg-red-100 dark:bg-red-900',
          badgeText: 'text-red-700 dark:text-red-300',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`${config.bgClass} ${config.borderClass} border rounded-lg mb-8 px-5 py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 transition-colors duration-300`}>
      {/* Left: pulse dot + status text */}
      <div className="flex items-center gap-3">
        <span className="relative flex h-3 w-3 shrink-0">
          <span className={`animate-status-pulse absolute inline-flex h-full w-full rounded-full ${config.dotClass} opacity-75`} />
          <span className={`relative inline-flex rounded-full h-3 w-3 ${config.dotClass}`} />
        </span>
        <span className={`text-[15px] font-semibold ${config.textClass}`}>{config.text}</span>
      </div>

      {/* Right: badges */}
      <div className="flex items-center gap-2 flex-wrap">
        {responseTimeMs !== undefined && (
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${config.badgeBg} ${config.badgeText}`}>
            {responseTimeMs}ms
          </span>
        )}
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${config.badgeBg} ${config.badgeText}`}>
          Checked {dayjs(lastRefreshed).fromNow()}
        </span>
      </div>
    </div>
  );
};
