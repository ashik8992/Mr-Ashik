import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Shield,
  Smartphone,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Layers,
} from 'lucide-react';
import { Device, DeviceMode } from '../types/index.ts';
import { Language, translations } from '../i18n/translations.ts';

interface AppLimitsViewProps {
  devices: Device[];
  selectedDevice: Device;
  onSelectDevice: (device: Device) => void;
  onUpdateDevice: (updated: Partial<Device>) => void;
  lang: Language;
}

export const AppLimitsView: React.FC<AppLimitsViewProps> = ({
  devices,
  selectedDevice,
  onSelectDevice,
  onUpdateDevice,
  lang,
}) => {
  const t = translations[lang];
  const [dailyCap, setDailyCap] = useState(selectedDevice.screenTimeLimitMinutes);
  const [gamesCap, setGamesCap] = useState(60);
  const [socialCap, setSocialCap] = useState(45);
  const [entertainmentCap, setEntertainmentCap] = useState(60);

  const handleSave = () => {
    onUpdateDevice({ screenTimeLimitMinutes: dailyCap });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>{t.nav.appLimits}: {selectedDevice.name}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enforce daily screen allowances, category caps, and compare Personal vs Managed Android restrictions
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
                {d.name} ({d.mode === 'managed' ? 'Managed' : 'Personal'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Section 8: Personal Android Mode vs Managed Android Mode Comparison Card */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">
              Android Supervision Mode
            </h2>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            Current: {selectedDevice.mode === 'managed' ? 'Managed Android Mode' : 'Personal Android Mode'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Personal Mode */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              selectedDevice.mode === 'personal'
                ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-slate-900 dark:text-white">
                Personal Android Mode
              </span>
              {selectedDevice.mode === 'personal' && (
                <span className="text-[10px] bg-indigo-600 text-white font-bold px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Operates using standard Android user permissions (Accessibility, Usage Access, Overlay). Limits are applied via reminder overlays.
            </p>
            <div className="mt-3 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg text-[10px] text-amber-800 dark:text-amber-300">
              Platform Disclosure: A standard Android app cannot guarantee blocking every app or prevent its own uninstallation.
            </div>
          </div>

          {/* Managed Mode */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              selectedDevice.mode === 'managed'
                ? 'border-purple-600 dark:border-purple-500 bg-purple-50/30 dark:bg-purple-950/20'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-slate-900 dark:text-white">
                Managed Android Mode (Device Owner)
              </span>
              {selectedDevice.mode === 'managed' && (
                <span className="text-[10px] bg-purple-600 text-white font-bold px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Enrolled through Android Enterprise / ADB Device Owner. Enables hardware-level policy enforcement, mandatory app blocking, and tamper-proof uninstall protection.
            </p>
            <div className="mt-3 p-2.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 rounded-lg text-[10px] text-purple-800 dark:text-purple-300">
              Requires initial factory setup or ADB pairing. See Help & Support for enrollment instructions.
            </div>
          </div>

        </div>
      </div>

      {/* Daily Limits Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Daily Device Allowance
          </h3>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Total Screen Allowance:</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {Math.floor(dailyCap / 60)}h {dailyCap % 60}m ({dailyCap} mins)
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="360"
              step="15"
              value={dailyCap}
              onChange={(e) => setDailyCap(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              {t.actions.saveChanges}
            </button>
          </div>
        </div>

        {/* Category Caps */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Category Daily Caps
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-500">Games:</span>
                <span className="font-mono font-bold">{gamesCap} mins</span>
              </div>
              <input
                type="range"
                min="0"
                max="180"
                step="15"
                value={gamesCap}
                onChange={(e) => setGamesCap(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-500">Social & Chat:</span>
                <span className="font-mono font-bold">{socialCap} mins</span>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                step="15"
                value={socialCap}
                onChange={(e) => setSocialCap(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-500">Entertainment & Videos:</span>
                <span className="font-mono font-bold">{entertainmentCap} mins</span>
              </div>
              <input
                type="range"
                min="0"
                max="180"
                step="15"
                value={entertainmentCap}
                onChange={(e) => setEntertainmentCap(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
