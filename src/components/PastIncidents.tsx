import React, { useState } from 'react';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight, RotateCcw, Calendar } from 'lucide-react';
import type { MonthIncidents, Incident } from './IncidentHistory';
import { useTranslation } from '../lib/i18n';
import { translateIncidentTitle, translateIncidentMessage, formatIncidentTimestamp } from '../lib/incidentTranslator';

interface PastIncidentsProps {
  months: MonthIncidents[];
  incidentCount24h?: number;
}

export const PastIncidents: React.FC<PastIncidentsProps> = ({ months, incidentCount24h = 0 }) => {
  const { t, language } = useTranslation();
  const allIncidents = months.flatMap(m => m.incidents);

  // Pagination state: page 0 = latest 14 days, page 1 = 14-27 days ago, etc.
  const [page, setPage] = useState<number>(0);
  const DAYS_PER_PAGE = 14;
  const MAX_DAYS = 90;
  const MAX_PAGES = Math.ceil(MAX_DAYS / DAYS_PER_PAGE); // 7 pages (90 days total)

  const startOffset = page * DAYS_PER_PAGE;
  const daysInWindow = Math.min(DAYS_PER_PAGE, MAX_DAYS - startOffset);

  const currentPeriodDays = Array.from({ length: daysInWindow }).map((_, i) =>
    dayjs().subtract(startOffset + i, 'day')
  );

  const newestDay = currentPeriodDays[0];
  const oldestDay = currentPeriodDays[currentPeriodDays.length - 1];

  const getImpactColor = (impact: Incident['impact']) => {
    switch (impact) {
      case 'none':     return 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200';
      case 'minor':    return 'text-yellow-600 dark:text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-400';
      case 'major':    return 'text-orange-600 dark:text-orange-500 hover:text-orange-700 dark:hover:text-orange-400';
      case 'critical': return 'text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400';
    }
  };

  const getImpactBadge = (impact: Incident['impact']) => {
    switch (impact) {
      case 'none':     return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
      case 'minor':    return 'bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900';
      case 'major':    return 'bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-900';
      case 'critical': return 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900';
    }
  };

  const getImpactLabel = (impact: Incident['impact']) => {
    switch (impact) {
      case 'none':     return t('incidentHistory.impactNone');
      case 'minor':    return t('incidentHistory.impactMinor');
      case 'major':    return t('incidentHistory.impactMajor');
      case 'critical': return t('incidentHistory.impactCritical');
    }
  };

  // Proper date comparison using dayjs isSame — no fragile string matching
  const isIncidentOnDay = (incident: Incident, day: dayjs.Dayjs): boolean => {
    const source = incident.createdAt || incident.timestamp;
    return dayjs(source).isSame(day, 'day');
  };

  return (
    <div className="w-full mt-10">
      {/* Header with Title, 24h Badge & Pagination Controls */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-[18px] font-semibold text-gray-900 dark:text-gray-100">
            {t('pastIncidents.title')}
          </h3>

          {/* 24h Incident count pill */}
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              incidentCount24h > 0
                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            {incidentCount24h === 0
              ? t('pastIncidents.zeroIncidents24h')
              : t('pastIncidents.incidentsCount24h', { count: incidentCount24h, s: incidentCount24h > 1 ? 's' : '' })}
          </span>
        </div>

        {/* Top Pagination Controls */}
        <div className="flex items-center gap-2">
          {page > 0 && (
            <button
              onClick={() => setPage(0)}
              className="px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
              title={t('pastIncidents.todayBtn')}
            >
              <RotateCcw size={12} />
              <span>{t('pastIncidents.todayBtn')}</span>
            </button>
          )}

          <div className="flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-0.5 shadow-2xs">
            <button
              onClick={() => setPage(p => Math.min(MAX_PAGES - 1, p + 1))}
              disabled={page >= MAX_PAGES - 1}
              className={`p-1.5 rounded-md transition-colors ${
                page >= MAX_PAGES - 1
                  ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer'
              }`}
              title={t('pastIncidents.prevPeriod')}
              aria-label={t('pastIncidents.prevPeriod')}
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-xs font-mono font-medium px-2 text-gray-600 dark:text-gray-400">
              {t('pastIncidents.pageOf', { current: page + 1, total: MAX_PAGES })}
            </span>

            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className={`p-1.5 rounded-md transition-colors ${
                page === 0
                  ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer'
              }`}
              title={t('pastIncidents.nextPeriod')}
              aria-label={t('pastIncidents.nextPeriod')}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Date Range Subheader Banner */}
      <div className="mb-6 px-3 py-2 bg-gray-50 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800/80 rounded-lg flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 flex-wrap gap-2">
        <div className="flex items-center gap-1.5 font-medium">
          <Calendar size={13} className="text-gray-400 dark:text-gray-500" />
          <span>
            {oldestDay?.locale(language).format(language === 'th' ? 'D MMMM YYYY' : 'MMM D, YYYY')} — {newestDay?.locale(language).format(language === 'th' ? 'D MMMM YYYY' : 'MMM D, YYYY')}
          </span>
        </div>
        <span className="font-mono text-[11px] bg-gray-200/60 dark:bg-gray-800/80 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">
          {t('pastIncidents.daysCount', { count: daysInWindow })}
        </span>
      </div>

      {/* Day-by-day Incident Timeline */}
      <div className="flex flex-col gap-6">
        {currentPeriodDays.map((day, i) => {
          const dayIncidents = allIncidents.filter(inc => isIncidentOnDay(inc, day));

          return (
            <div key={i} className="flex flex-col">
              <h4 className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-200 dark:border-gray-800 pb-2 mb-3">
                {day.locale(language).format(language === 'th' ? 'D MMMM YYYY' : 'MMM D, YYYY')}
              </h4>

              {dayIncidents.length === 0 ? (
                <p className="text-[14px] text-gray-400 dark:text-gray-500 italic">
                  {t('pastIncidents.noIncidentsReported')}
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {dayIncidents.map(incident => (
                    <div key={incident.id} className="flex flex-col gap-1 pl-3 border-l-2 border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[14px] font-medium ${getImpactColor(incident.impact)}`}>
                          {translateIncidentTitle(incident.name, language)}
                        </span>
                        <span className={`text-[11px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${getImpactBadge(incident.impact)}`}>
                          {getImpactLabel(incident.impact)}
                        </span>
                      </div>
                      <div className="text-[14px] text-gray-700 dark:text-gray-300">
                        {translateIncidentMessage(incident.message, language)}
                      </div>
                      <div className="text-[12px] text-gray-400 dark:text-gray-500">
                        {formatIncidentTimestamp(incident.createdAt || incident.timestamp, language)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Footer Actions & Full History Link */}
      <div className="mt-8 mb-12 flex justify-between items-center flex-wrap gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <a
          href="/incidents"
          onClick={e => {
            e.preventDefault();
            window.history.pushState(null, '', '/incidents');
            window.dispatchEvent(new Event('popstate'));
          }}
          className="text-[14px] font-medium text-blue-600 dark:text-blue-500 hover:text-blue-800 dark:hover:text-blue-400 flex items-center gap-1 transition-colors"
        >
          {t('pastIncidents.viewFullHistory')}
        </a>

        {/* Bottom Pagination Bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setPage(p => Math.min(MAX_PAGES - 1, p + 1));
              window.scrollTo({ top: document.getElementById('past-incidents-section')?.offsetTop || 0, behavior: 'smooth' });
            }}
            disabled={page >= MAX_PAGES - 1}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1 ${
              page >= MAX_PAGES - 1
                ? 'border-gray-200 dark:border-gray-800 text-gray-300 dark:text-gray-700 cursor-not-allowed'
                : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer shadow-2xs'
            }`}
          >
            <ChevronLeft size={14} />
            <span>{t('pastIncidents.prevPeriod')}</span>
          </button>

          <button
            onClick={() => {
              setPage(p => Math.max(0, p - 1));
              window.scrollTo({ top: document.getElementById('past-incidents-section')?.offsetTop || 0, behavior: 'smooth' });
            }}
            disabled={page === 0}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1 ${
              page === 0
                ? 'border-gray-200 dark:border-gray-800 text-gray-300 dark:text-gray-700 cursor-not-allowed'
                : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer shadow-2xs'
            }`}
          >
            <span>{t('pastIncidents.nextPeriod')}</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
