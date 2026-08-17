import React, { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import type { ServiceComponent } from './ComponentList';
import { useTranslation } from '../lib/i18n';
import { translateIncidentTitle, translateIncidentMessage, formatIncidentTimestamp } from '../lib/incidentTranslator';

export interface Incident {
  id: string;
  name: string;
  message: string;
  impact: 'none' | 'minor' | 'major' | 'critical';
  timestamp: string;
  createdAt?: string;
  component?: string;
}

export interface MonthIncidents {
  name: string;
  year: number;
  monthIndex?: number;
  incidents: Incident[];
}

interface IncidentHistoryProps {
  months: MonthIncidents[];
  components?: ServiceComponent[];
}

export const IncidentHistory: React.FC<IncidentHistoryProps> = ({ months, components = [] }) => {
  const { t, language } = useTranslation();
  // Pagination page: 0 = latest 3 months, 1 = previous 3 months, etc.
  const [page, setPage] = useState<number>(0);
  const MAX_PAGES = 3; // Up to 4 quarterly periods (12 months / 1 year total)

  // Track expanded state for months that have > 3 incidents
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});

  // Filter states
  const [selectedComponent, setSelectedComponent] = useState<string>('all');
  const [selectedImpact, setSelectedImpact] = useState<string>('all');

  const toggleMonth = (monthKey: string) => {
    setExpandedMonths(prev => ({
      ...prev,
      [monthKey]: !prev[monthKey]
    }));
  };

  // Derive unique component list from props + incidents
  const availableComponents = useMemo(() => {
    const list = new Set<string>();
    components.forEach(c => list.add(c.name));
    months?.forEach(m => {
      m.incidents.forEach(inc => {
        if (inc.component) {
          list.add(inc.component);
        }
      });
    });
    if (list.size === 0) list.add('gateway.9arm.co');
    return Array.from(list);
  }, [components, months]);

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

  // Generate the 3-month window for current page (from newest to oldest)
  const endMonth = dayjs().startOf('month').subtract(page * 3, 'month');
  const pageMonths = [
    endMonth,
    endMonth.subtract(1, 'month'),
    endMonth.subtract(2, 'month'),
  ];

  const hasActiveFilters = selectedComponent !== 'all' || selectedImpact !== 'all';

  const resetFilters = () => {
    setSelectedComponent('all');
    setSelectedImpact('all');
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-sm p-6 mb-8 shadow-sm">
      {/* Header with filter and functional pagination */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Component Filter */}
          <div className="relative">
            <select
              value={selectedComponent}
              onChange={e => setSelectedComponent(e.target.value)}
              className="text-[13px] font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm px-3 py-1.5 cursor-pointer hover:border-gray-400 dark:hover:border-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-colors"
              aria-label="Filter by component"
            >
              <option value="all">{t('incidentHistory.allComponents')}</option>
              {availableComponents.map(comp => (
                <option key={comp} value={comp}>
                  {comp}
                </option>
              ))}
            </select>
          </div>

          {/* Impact Level Filter */}
          <div className="relative">
            <select
              value={selectedImpact}
              onChange={e => setSelectedImpact(e.target.value)}
              className="text-[13px] font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm px-3 py-1.5 cursor-pointer hover:border-gray-400 dark:hover:border-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-colors"
              aria-label="Filter by impact level"
            >
              <option value="all">{t('incidentHistory.allImpacts')}</option>
              <option value="critical">{t('incidentHistory.impactCritical')}</option>
              <option value="major">{t('incidentHistory.impactMajor')}</option>
              <option value="minor">{t('incidentHistory.impactMinor')}</option>
              <option value="none">{t('incidentHistory.impactNone')}</option>
            </select>
          </div>

          {/* Reset button if filter is active */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-[12px] text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={t('incidentHistory.resetFilters')}
            >
              <RotateCcw size={13} />
              {t('incidentHistory.resetFilters')}
            </button>
          )}
        </div>

        {/* Pagination controls */}
        <div className="flex items-center gap-3 text-[14px] font-medium text-gray-600 dark:text-gray-400">
          <button
            onClick={() => setPage(prev => Math.min(prev + 1, MAX_PAGES))}
            disabled={page >= MAX_PAGES}
            className={`p-1.5 border border-gray-300 dark:border-gray-700 rounded-sm transition-colors ${
              page >= MAX_PAGES
                ? 'bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-pointer active:scale-95'
            }`}
            title={t('incidentHistory.olderIncidents')}
            aria-label={t('incidentHistory.olderIncidents')}
          >
            <ChevronLeft size={18} />
          </button>

          <span className="flex items-center gap-1 select-none">
            <span className="text-gray-900 dark:text-gray-100 font-semibold">{pageMonths[2]?.locale(language).format('MMMM')}</span>
            <var className="not-italic text-gray-500 dark:text-gray-400">{pageMonths[2]?.format('YYYY')}</var>
            <span className="mx-1 text-gray-400 dark:text-gray-500">{t('common.to')}</span>
            <span className="text-gray-900 dark:text-gray-100 font-semibold">{pageMonths[0]?.locale(language).format('MMMM')}</span>
            <var className="not-italic text-gray-500 dark:text-gray-400">{pageMonths[0]?.format('YYYY')}</var>
          </span>

          <button
            onClick={() => setPage(prev => Math.max(prev - 1, 0))}
            disabled={page === 0}
            className={`p-1.5 border border-gray-300 dark:border-gray-700 rounded-sm transition-colors ${
              page === 0
                ? 'bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-pointer active:scale-95'
            }`}
            title={t('incidentHistory.newerIncidents')}
            aria-label={t('incidentHistory.newerIncidents')}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Months Container */}
      <div className="flex flex-col gap-10">
        {pageMonths.map(m => {
          const monthName = m.locale(language).format('MMMM');
          const year = m.year();
          const monthKey = `${m.format('YYYY-MM')}`;

          // Find incidents from props by month index & year
          const matchedMonth = months?.find(
            mObj => (mObj.monthIndex !== undefined ? mObj.monthIndex === m.month() : mObj.name.toLowerCase() === m.locale('en').format('MMMM').toLowerCase()) && mObj.year === year
          );

          let incidentList = matchedMonth ? matchedMonth.incidents : [];

          // Filter by component
          if (selectedComponent !== 'all') {
            incidentList = incidentList.filter(inc => {
              if (inc.component) {
                return inc.component.toLowerCase() === selectedComponent.toLowerCase();
              }
              // If component not explicitly tagged, match name or default
              return inc.name.toLowerCase().includes(selectedComponent.toLowerCase()) || selectedComponent === 'gateway.9arm.co';
            });
          }

          // Filter by impact level
          if (selectedImpact !== 'all') {
            incidentList = incidentList.filter(inc => inc.impact === selectedImpact);
          }

          const isExpanded = expandedMonths[monthKey];
          const visibleIncidents = isExpanded ? incidentList : incidentList.slice(0, 3);
          const hasMore = incidentList.length > 3;

          return (
            <div key={monthKey} className="flex flex-col">
              <h4 className="text-[17px] font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-800 pb-2 mb-4">
                {monthName} <var className="not-italic font-normal text-gray-500 dark:text-gray-400">{year}</var>
              </h4>

              <div className="flex flex-col gap-6">
                {incidentList.length === 0 ? (
                  <p className="text-gray-400 dark:text-gray-500 text-[14px] italic">
                    {hasActiveFilters ? t('incidentHistory.noIncidentsMatchFilter') : t('incidentHistory.noIncidentsReported')}
                  </p>
                ) : (
                  <>
                    <div className="flex flex-col gap-6">
                      {visibleIncidents.map(incident => (
                        <div key={incident.id} className="flex flex-col gap-1 pl-3 border-l-2 border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[15px] font-medium ${getImpactColor(incident.impact)}`}>
                              {translateIncidentTitle(incident.name, language)}
                            </span>
                            <span className={`text-[11px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${getImpactBadge(incident.impact)}`}>
                              {getImpactLabel(incident.impact)}
                            </span>
                            {incident.component && (
                              <span className="text-[11px] font-mono bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded">
                                {incident.component}
                              </span>
                            )}
                          </div>
                          <div className="text-[14px] text-gray-800 dark:text-gray-200 mt-1">
                            {translateIncidentMessage(incident.message, language)}
                          </div>
                          <div className="text-[12px] text-gray-400 dark:text-gray-500 mt-1">
                            {formatIncidentTimestamp(incident.createdAt || incident.timestamp, language)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {hasMore && (
                      <div
                        className="py-2.5 mt-4 border-t border-gray-200 dark:border-gray-800 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-[13px] font-medium text-gray-500 dark:text-gray-400 select-none rounded"
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleMonth(monthKey)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleMonth(monthKey);
                          }
                        }}
                      >
                        {isExpanded ? t('incidentHistory.collapseIncidents') : t('incidentHistory.showAllIncidents', { count: incidentList.length })}
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
