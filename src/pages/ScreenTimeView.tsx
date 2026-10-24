import React, { useState } from 'react';
import {
  Clock,
  TrendingUp,
  BarChart3,
  Calendar,
  AlertTriangle,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { Device } from '../types/index.ts';
import { Language, translations } from '../i18n/translations.ts';
import { INITIAL_APP_USAGE } from '../services/storage.ts';

interface ScreenTimeViewProps {
  devices: Device[];
  selectedDevice: Device;
  onSelectDevice: (device: Device) => void;
  lang: Language;
}

export const ScreenTimeView: React.FC<ScreenTimeViewProps> = ({
  devices,
  selectedDevice,
  onSelectDevice,
  lang,
}) => {
  const t = translations[lang];
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const appData = INITIAL_APP_USAGE[selectedDevice.id] || INITIAL_APP_USAGE['dev-001'];

  const weeklyDays = [
    { day: 'Mon', mins: 145 },
    { day: 'Tue', mins: 160 },
    { day: 'Wed', mins: 120 },
    { day: 'Thu', mins: 190 },
    { day: 'Fri', mins: 210 },
    { day: 'Sat', mins: 175 },
    { day: 'Sun', mins: selectedDevice.dailyScreenTimeMinutes },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>{t.nav.screenTime}: {selectedDevice.name}</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Authorized Android Usage Access API analytics, screen-on durations, and category distribution
          </p>
        </div>

        {/* View mode toggle + device selector */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'daily'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'weekly'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Weekly
            </button>
          </div>

          <select
            value={selectedDevice.id}
            onChange={(e) => {
              const d = devices.find((dev) => dev.id === e.target.value);
              if (d) onSelectDevice(d);
            }}
            className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200"
          >
            {devices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Screen Time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">
            Today’s Screen Time
          </span>
          <div className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
            {Math.floor(selectedDevice.dailyScreenTimeMinutes / 60)}h {selectedDevice.dailyScreenTimeMinutes % 60}m
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Daily Limit: {Math.floor(selectedDevice.screenTimeLimitMinutes / 60)}h</span>
            <span className={selectedDevice.dailyScreenTimeMinutes > selectedDevice.screenTimeLimitMinutes ? 'text-rose-500 font-bold' : 'text-emerald-500 font-semibold'}>
              {selectedDevice.dailyScreenTimeMinutes > selectedDevice.screenTimeLimitMinutes ? 'Limit Reached' : 'Within Limit'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">
            Weekly Screen Time
          </span>
          <div className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
            {Math.floor(selectedDevice.weeklyScreenTimeMinutes / 60)}h {selectedDevice.weeklyScreenTimeMinutes % 60}m
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Average: {Math.round(selectedDevice.weeklyScreenTimeMinutes / 7)} mins / day
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">
            Usage Access Status
          </span>
          <div className="mt-2 text-xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <span>Authorized & Syncing</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Compliant with Android PACKAGE_USAGE_STATS
          </div>
        </div>
      </div>

      {/* Chart: Daily Hourly Breakdown or Weekly Chart */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-500" />
            <span>{viewMode === 'daily' ? 'Hourly Usage Distribution (00:00 - 23:00)' : 'Weekly Usage by Day'}</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {viewMode === 'daily' ? 'Minutes per Hour' : 'Daily Total Minutes'}
          </span>
        </div>

        {viewMode === 'daily' ? (
          <div className="h-44 flex items-end gap-1.5 pt-6 pb-2 px-2 overflow-x-auto">
            {appData.hourlyUsage.map((val, hour) => {
              const heightPct = Math.min(100, (val / 45) * 100);
              return (
                <div key={hour} className="flex-1 flex flex-col items-center gap-1.5 min-w-[20px] group">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-32 rounded-t-lg flex items-end overflow-hidden">
                    <div
                      className="w-full bg-indigo-600 dark:bg-indigo-500 rounded-t-lg group-hover:bg-indigo-400 transition-all duration-300"
                      style={{ height: `${heightPct}%` }}
                      title={`${hour}:00 — ${val} mins`}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">
                    {hour % 3 === 0 ? `${hour}h` : ''}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-44 flex items-end gap-4 pt-6 pb-2 px-6">
            {weeklyDays.map((item, idx) => {
              const heightPct = Math.min(100, (item.mins / 250) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
                    {item.mins}m
                  </span>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-28 rounded-t-xl flex items-end overflow-hidden">
                    <div
                      className="w-full bg-indigo-600 dark:bg-indigo-500 rounded-t-xl group-hover:bg-indigo-400 transition-all duration-300"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
