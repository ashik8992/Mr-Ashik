import React, { useState } from 'react';
import {
  Layers,
  Filter,
  Clock,
  Lock,
  Unlock,
  AlertCircle,
  Shield,
  Smartphone,
  Sliders,
} from 'lucide-react';
import { Device, AppUsageItem } from '../types/index.ts';
import { Language, translations } from '../i18n/translations.ts';
import { INITIAL_APP_USAGE } from '../services/storage.ts';

interface AppUsageViewProps {
  devices: Device[];
  selectedDevice: Device;
  onSelectDevice: (device: Device) => void;
  lang: Language;
}

export const AppUsageView: React.FC<AppUsageViewProps> = ({
  devices,
  selectedDevice,
  onSelectDevice,
  lang,
}) => {
  const t = translations[lang];
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const appData = INITIAL_APP_USAGE[selectedDevice.id] || INITIAL_APP_USAGE['dev-001'];
  const [apps, setApps] = useState<AppUsageItem[]>(appData.apps);

  const categories = ['All', 'Education', 'Games', 'Social', 'Entertainment', 'Productivity'];

  const filteredApps = selectedCategory === 'All'
    ? apps
    : apps.filter((a) => a.category === selectedCategory);

  const toggleBlockApp = (pkg: string) => {
    setApps((prev) =>
      prev.map((app) =>
        app.packageName === pkg ? { ...app, isBlocked: !app.isBlocked } : app
      )
    );
  };

  const updateAppLimit = (pkg: string, newLimit: number) => {
    setApps((prev) =>
      prev.map((app) =>
        app.packageName === pkg ? { ...app, limitMinutes: newLimit } : app
      )
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>{t.nav.appUsage}: {selectedDevice.name}</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Application-by-application usage, category classification, and individual limit enforcement
          </p>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Device:
          </label>
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

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* App List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 grid grid-cols-12 gap-4">
          <div className="col-span-5">Application</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Usage Duration</div>
          <div className="col-span-3 text-right">Limit & Controls</div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredApps.map((app) => {
            const isExceeded = app.limitMinutes && app.durationMinutes >= app.limitMinutes;

            return (
              <div
                key={app.packageName}
                className="p-4 grid grid-cols-12 gap-4 items-center text-xs hover:bg-slate-50/60 dark:hover:bg-slate-850/50 transition-colors"
              >
                {/* App Name & Package */}
                <div className="col-span-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-extrabold text-sm flex items-center justify-center shrink-0">
                    {app.appName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {app.appName}
                      {app.isBlocked && (
                        <span className="text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 px-1.5 py-0.5 rounded-md font-bold">
                          Blocked
                        </span>
                      )}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
                      {app.packageName}
                    </p>
                  </div>
                </div>

                {/* Category */}
                <div className="col-span-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {app.category}
                  </span>
                </div>

                {/* Duration */}
                <div className="col-span-2">
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {app.durationMinutes} mins
                  </span>
                  <div className="w-24 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full rounded-full ${
                        isExceeded ? 'bg-rose-500' : 'bg-indigo-600 dark:bg-indigo-500'
                      }`}
                      style={{ width: `${Math.min(100, (app.durationMinutes / (app.limitMinutes || 60)) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Limits & Controls */}
                <div className="col-span-3 flex items-center justify-end gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <span>Limit:</span>
                    <input
                      type="number"
                      value={app.limitMinutes || 60}
                      onChange={(e) => updateAppLimit(app.packageName, Number(e.target.value))}
                      className="w-14 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-mono text-xs text-slate-800 dark:text-slate-200"
                    />
                    <span>m</span>
                  </div>

                  <button
                    onClick={() => toggleBlockApp(app.packageName)}
                    className={`p-1.5 rounded-lg text-xs font-semibold ${
                      app.isBlocked
                        ? 'bg-rose-600 text-white hover:bg-rose-700'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                    title={app.isBlocked ? 'Unblock app' : 'Block app'}
                  >
                    {app.isBlocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
