import React from 'react';
import dayjs from 'dayjs';
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

  const past14Days = Array.from({ length: 14 }).map((_, i) =>
    dayjs().subtract(i, 'day')
  );

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
      case 'minor':    return 'bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400';
      case 'major':    return 'bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-400';
      case 'critical': return 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400';
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
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[18px] font-semibold text-gray-900 dark:text-gray-100">
          {t('pastIncidents.title')}
        </h3>

        {/* 24h Incident count pill */}
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            incidentCount24h > 0
              ? 'bg-amber-100 dark:amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          }`}
        >
          {incidentCount24h === 0
            ? t('pastIncidents.zeroIncidents24h')
            : t('pastIncidents.incidentsCount24h', { count: incidentCount24h, s: incidentCount24h > 1 ? 's' : '' })}
        </span>
      </div>

      <div className="flex flex-col gap-6">
        {past14Days.map((day, i) => {
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

      <div className="mt-8 mb-12">
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
      </div>
    </div>
  );
};
