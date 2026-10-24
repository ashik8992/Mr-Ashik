import React, { useState } from 'react';
import {
  BellRing,
  AlertTriangle,
  CheckCircle2,
  Filter,
  ShieldAlert,
  Smartphone,
  Clock,
  Trash2,
} from 'lucide-react';
import { SafetyAlert, AlertSeverity } from '../types/index.ts';
import { Language, translations } from '../i18n/translations.ts';

interface SafetyAlertsViewProps {
  alerts: SafetyAlert[];
  onResolveAlert: (id: string) => void;
  onClearAllAlerts: () => void;
  lang: Language;
}

export const SafetyAlertsView: React.FC<SafetyAlertsViewProps> = ({
  alerts,
  onResolveAlert,
  onClearAllAlerts,
  lang,
}) => {
  const t = translations[lang];
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const filtered = alerts.filter((a) => {
    if (filterSeverity === 'all') return true;
    return a.severity === filterSeverity;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BellRing className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>{t.nav.safetyAlerts}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time notifications for device connectivity, permission status changes, screen limits, and media capture
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Severity Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            {['all', 'high', 'medium', 'low'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-all ${
                  filterSeverity === sev
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <button
            onClick={onClearAllAlerts}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-semibold"
          >
            Clear Resolved
          </button>
        </div>
      </div>

      {/* Alert Feed List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            No safety alerts matching the current filter.
          </div>
        ) : (
          filtered.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                alert.resolved
                  ? 'bg-slate-50 dark:bg-slate-850/40 border-slate-200 dark:border-slate-800 opacity-60'
                  : alert.severity === 'high' || alert.severity === 'critical'
                  ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                  : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-3 h-3 rounded-full mt-1 shrink-0 ${
                    alert.severity === 'high' || alert.severity === 'critical'
                      ? 'bg-rose-500'
                      : alert.severity === 'medium'
                      ? 'bg-amber-500'
                      : 'bg-indigo-500'
                  }`}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {alert.title}
                    </h3>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {alert.deviceName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {alert.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {alert.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-mono text-slate-400">
                  {new Date(alert.timestamp).toLocaleString()}
                </span>
                {!alert.resolved ? (
                  <button
                    onClick={() => onResolveAlert(alert.id)}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold shadow-2xs"
                  >
                    {t.actions.markResolved}
                  </button>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
