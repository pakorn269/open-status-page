import React from 'react';
import dayjs from 'dayjs';

interface StatusBannerProps {
  status: 'operational' | 'degraded' | 'outage';
  lastRefreshed: Date;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({ status, lastRefreshed }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'operational':
        return {
          text: 'All Systems Operational',
          bgClass: 'bg-green-600',
          badgeClass: 'bg-green-700'
        };
      case 'degraded':
        return {
          text: 'Degraded Performance',
          bgClass: 'bg-yellow-500',
          badgeClass: 'bg-yellow-600'
        };
      case 'outage':
        return {
          text: 'Major Outage',
          bgClass: 'bg-red-600',
          badgeClass: 'bg-red-700'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`${config.bgClass} text-white p-4 rounded-sm mb-10 flex justify-between items-center shadow-sm transition-colors`}>
      <span className="font-medium text-lg">{config.text}</span>
      <span className={`text-sm ${config.badgeClass} px-3 py-1 rounded-full whitespace-nowrap ml-4`}>
        Refreshed {dayjs(lastRefreshed).format('HH:mm')}
      </span>
    </div>
  );
};
