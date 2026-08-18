import React, { useState } from 'react';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight, CheckCheck } from 'lucide-react';
import type { ServiceComponent } from './ComponentList';
import { useTranslation } from '../lib/i18n';

export interface UptimeDay {
  date: string;
  status: 'operational' | 'degraded' | 'outage' | 'maintenance' | 'no-data';
  uptimePercentage?: number;
  totalPings?: number;
  outages?: number;
  slowPings?: number;
}

interface UptimeGridProps {
  serviceName?: string;
  uptimePercentage?: number;
  days: UptimeDay[];
  components?: ServiceComponent[];
}

export const UptimeGrid: React.FC<UptimeGridProps> = ({
  serviceName = 'gateway.9arm.co',
  days,
  components = []
}) => {
  const { t } = useTranslation();
  // Active component selection
  const [selectedCompId, setSelectedCompId] = useState<string>(() => {
    return components.length > 0 ? components[0].id : '';
  });

  // Page offset: 0 = current 3 months (latest), 1 = previous 3 months, etc.
  const [pageOffset, setPageOffset] = useState<number>(0);
  const MAX_PAGE_OFFSET = 3; // Allows navigating up to 1 year back (4 quarters)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showCopyToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const copyDayData = (compName: string, day: UptimeDay) => {
    const payload = {
      service: compName,
      date: dayjs(day.date).format('YYYY-MM-DD'),
      timestamp: day.date,
      status: day.status,
      ...(day.uptimePercentage !== undefined ? { uptime_percentage: day.uptimePercentage } : {}),
      ...(day.totalPings !== undefined ? { total_pings: day.totalPings } : {}),
      ...(day.outages !== undefined ? { outages: day.outages } : {}),
      ...(day.slowPings !== undefined ? { slow_pings: day.slowPings } : {}),
    };

    const textToCopy = JSON.stringify(payload, null, 2);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      showCopyToast(t('uptimeGrid.copiedUptime', { name: compName, date: dayjs(day.date).format('MMM D, YYYY') }));
    }
  };

  // Determine which component's data to display
  const activeComponent = components.find(c => c.id === selectedCompId) || components[0];
  const activeServiceName = activeComponent ? activeComponent.name : serviceName;
  const activeDays = activeComponent?.uptimeDays?.length ? activeComponent.uptimeDays : days;

  const getColor = (status: UptimeDay['status']) => {
    switch (status) {
      case 'operational': return '#22c55e'; // Green
      case 'degraded':    return '#eab308'; // Amber/Yellow
      case 'outage':      return '#ef4444'; // Red
      case 'maintenance': return '#3b82f6'; // Blue
      case 'no-data':     return '#e5e7eb'; // Light gray
      default:            return '#e5e7eb';
    }
  };

  const getStatusText = (day: UptimeDay) => {
    const pct = day.uptimePercentage !== undefined ? day.uptimePercentage.toFixed(2) : undefined;
    switch (day.status) {
      case 'operational':
        return pct !== undefined && pct !== '100.00'
          ? t('uptimeGrid.operationalWithPct', { pct })
          : t('uptimeGrid.operational100');
      case 'degraded':
        return pct !== undefined
          ? t('uptimeGrid.degradedWithPct', { pct })
          : t('uptimeGrid.degraded');
      case 'outage':
        return pct !== undefined
          ? t('uptimeGrid.outageWithPct', { pct })
          : t('uptimeGrid.majorOutage');
      case 'maintenance':
        return t('uptimeGrid.maintenance');
      case 'no-data':
        return t('uptimeGrid.noData');
      default:
        return t('uptimeGrid.noData');
    }
  };

  const calculateMonthUptime = (monthDays: UptimeDay[]) => {
    const validDays = monthDays.filter(d => d.status !== 'no-data');
    if (validDays.length === 0) return '100.00';
    const total = validDays.reduce((acc, d) => {
      if (d.uptimePercentage !== undefined) return acc + d.uptimePercentage;
      if (d.status === 'operational') return acc + 100;
      if (d.status === 'degraded') return acc + 95;
      if (d.status === 'outage') return acc + 0;
      return acc + 100;
    }, 0);
    return (total / validDays.length).toFixed(2);
  };

  // Compute 3 months based on pageOffset (oldest to newest for calendar layout)
  const endMonth = dayjs().startOf('month').subtract(pageOffset * 3, 'month');
  const monthsToDisplay: dayjs.Dayjs[] = [
    endMonth.subtract(2, 'month'),
    endMonth.subtract(1, 'month'),
    endMonth,
  ];

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-lg mb-8 shadow-sm relative">
      {/* Toast feedback notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-semibold px-4 py-2 rounded-full shadow-xl flex items-center gap-2 z-50 animate-fade-in">
          <CheckCheck size={14} className="text-green-400 dark:text-green-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with component selector and functional pagination */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
        <div className="w-full md:w-80 relative">
          {components.length > 1 ? (
            <select
              value={selectedCompId}
              onChange={e => setSelectedCompId(e.target.value)}
              className="w-full text-[14px] font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3.5 py-2 cursor-pointer hover:border-gray-400 dark:hover:border-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-colors"
              aria-label={t('uptimeGrid.selectComponent')}
            >
              {components.map(comp => (
                <option key={comp.id} value={comp.id}>
                  {comp.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-[15px] font-semibold text-gray-800 dark:text-gray-200 py-1">
              {activeServiceName}
            </div>
          )}
        </div>

        {/* Pagination controls */}
        <div className="flex items-center gap-3 text-[14px] font-medium text-gray-600 dark:text-gray-400">
          <button
            onClick={() => setPageOffset(prev => Math.min(prev + 1, MAX_PAGE_OFFSET))}
            disabled={pageOffset >= MAX_PAGE_OFFSET}
            className={`p-1.5 border border-gray-300 dark:border-gray-700 rounded-lg transition-colors ${
              pageOffset >= MAX_PAGE_OFFSET
                ? 'bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-pointer active:scale-95'
            }`}
            title={t('uptimeGrid.prev3Months')}
            aria-label={t('uptimeGrid.prev3Months')}
          >
            <ChevronLeft size={18} />
          </button>

          <span className="flex items-center gap-1 select-none">
            <span className="text-gray-900 dark:text-gray-100 font-semibold">{monthsToDisplay[0]?.format('MMMM')}</span>
            <var className="not-italic text-gray-500 dark:text-gray-400">{monthsToDisplay[0]?.format('YYYY')}</var>
            <span className="mx-1 text-gray-400 dark:text-gray-500">{t('common.to')}</span>
            <span className="text-gray-900 dark:text-gray-100 font-semibold">{monthsToDisplay[2]?.format('MMMM')}</span>
            <var className="not-italic text-gray-500 dark:text-gray-400">{monthsToDisplay[2]?.format('YYYY')}</var>
          </span>

          <button
            onClick={() => setPageOffset(prev => Math.max(prev - 1, 0))}
            disabled={pageOffset === 0}
            className={`p-1.5 border border-gray-300 dark:border-gray-700 rounded-lg transition-colors ${
              pageOffset === 0
                ? 'bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-pointer active:scale-95'
            }`}
            title={t('uptimeGrid.next3Months')}
            aria-label={t('uptimeGrid.next3Months')}
          >
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
            const isFuture = currentDay.isAfter(dayjs(), 'day');

            if (isFuture) {
              monthDays.push({ date: currentDay.toISOString(), status: 'no-data' });
            } else {
              const foundDay = activeDays?.find(d => dayjs(d.date).isSame(currentDay, 'day'));
              monthDays.push(foundDay || { date: currentDay.toISOString(), status: 'no-data' });
            }
          }

          return (
            <div key={i} className="flex flex-col">
              <div className="flex items-baseline justify-between mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">
                <h6 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 m-0">
                  {month.format('MMMM')} <var className="not-italic font-normal text-gray-500 dark:text-gray-400">{month.format('YYYY')}</var>
                </h6>
                <small className="text-[13px] font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                  {calculateMonthUptime(monthDays)}%
                </small>
              </div>

              {/* Day blocks grid */}
              <div className="flex flex-wrap gap-[4px]">
                {monthDays.map((day, idx) => {
                  const formattedDate = dayjs(day.date).format('MMM D, YYYY');
                  const statusText = getStatusText(day);
                  const isNoData = day.status === 'no-data';

                  return (
                    <div
                      key={idx}
                      onClick={() => !isNoData && copyDayData(activeServiceName, day)}
                      className={`inline-flex ${
                        !isNoData
                          ? 'tooltip cursor-pointer hover:opacity-85 hover:scale-110 active:scale-95 transition-all'
                          : 'opacity-30 dark:opacity-20'
                      }`}
                      title={
                        !isNoData
                          ? `${activeServiceName}\n${formattedDate}\n${statusText}\n\n${t('uptimeGrid.clickToCopyDiagnostic')}`
                          : `${formattedDate}\n${t('uptimeGrid.noDataRecorded')}`
                      }
                    >
                      <svg
                        className="day"
                        width="30"
                        height="30"
                        xmlns="http://www.w3.org/2000/svg"
                        tabIndex={0}
                      >
                        <rect
                          width="30"
                          height="30"
                          fill={getColor(day.status)}
                          rx="4"
                          className="transition-colors dark:fill-opacity-90"
                        />
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
