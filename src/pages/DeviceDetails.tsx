import React from 'react';
import {
  Smartphone,
  Cpu,
  HardDrive,
  Battery,
  Shield,
  Wifi,
  WifiOff,
  Clock,
  Layers,
  Calendar,
  KeyRound,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
} from 'lucide-react';
import { Device, DeviceMode } from '../types/index.ts';
import { Language, translations } from '../i18n/translations.ts';

interface DeviceDetailsProps {
  devices: Device[];
  selectedDevice: Device;
  onSelectDevice: (device: Device) => void;
  onUpdateDevice: (updated: Partial<Device>) => void;
  onToggleLock: (deviceId: string) => void;
  lang: Language;
}

export const DeviceDetails: React.FC<DeviceDetailsProps> = ({
  devices,
  selectedDevice,
  onSelectDevice,
  onUpdateDevice,
  onToggleLock,
  lang,
}) => {
  const t = translations[lang];

  return (
    <div className="space-y-6">
      
      {/* Header & Switcher */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>{t.nav.deviceDetails}: {selectedDevice.name}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Hardware specifications, operating system profile, and operational permissions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Switch Device:
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
                {d.name} ({d.model})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Specs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Device Mode & Profile Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Supervision Profile
            </span>
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                selectedDevice.mode === 'managed'
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
              }`}
            >
              {selectedDevice.mode === 'managed' ? 'Managed Android' : 'Personal Android'}
            </span>
          </div>

          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {selectedDevice.childName}’s Phone
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Assigned child: Age {selectedDevice.childAge}
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Unique Device UID:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{selectedDevice.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Paired Date:</span>
              <span className="text-slate-700 dark:text-slate-300">
                {new Date(selectedDevice.pairedAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Remote Lock:</span>
              <button
                onClick={() => onToggleLock(selectedDevice.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 ${
                  selectedDevice.isLocked
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                {selectedDevice.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                <span>{selectedDevice.isLocked ? 'Locked' : 'Unlocked'}</span>
              </button>
            </div>
          </div>

          {/* Mode Switch Toggle */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Switch Device Supervision Mode:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onUpdateDevice({ mode: 'personal' })}
                className={`py-1.5 px-2 rounded-lg font-semibold border ${
                  selectedDevice.mode === 'personal'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                Personal Mode
              </button>
              <button
                onClick={() => onUpdateDevice({ mode: 'managed' })}
                className={`py-1.5 px-2 rounded-lg font-semibold border ${
                  selectedDevice.mode === 'managed'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                Managed Mode
              </button>
            </div>
          </div>
        </div>

        {/* Hardware & Storage Telemetry */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Hardware & Resources
          </span>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5" /> Storage ({selectedDevice.storageUsedGB} GB / {selectedDevice.totalStorageGB} GB)
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {Math.round((selectedDevice.storageUsedGB / selectedDevice.totalStorageGB) * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full"
                  style={{ width: `${(selectedDevice.storageUsedGB / selectedDevice.totalStorageGB) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" /> RAM Memory ({selectedDevice.ramUsedGB} GB / {selectedDevice.totalRamGB} GB)
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {Math.round((selectedDevice.ramUsedGB / selectedDevice.totalRamGB) * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-500 h-full rounded-full"
                  style={{ width: `${(selectedDevice.ramUsedGB / selectedDevice.totalRamGB) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Battery className="w-3.5 h-3.5" /> Battery ({selectedDevice.batteryLevel}%)
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {selectedDevice.isCharging ? 'Charging' : 'Discharging'}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${selectedDevice.batteryLevel > 20 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ width: `${selectedDevice.batteryLevel}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Device Model:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedDevice.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">OS Version:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedDevice.androidVersion}</span>
            </div>
          </div>
        </div>

        {/* Permissions Audit Checklist */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Permission Status Audit
          </span>

          <div className="space-y-2 text-xs">
            {[
              { label: 'Usage Access API', granted: selectedDevice.permissions.usageAccess },
              { label: 'Background Location', granted: selectedDevice.permissions.backgroundLocation },
              { label: 'MediaProjection Capture', granted: selectedDevice.permissions.mediaProjection },
              { label: 'Accessibility Service', granted: selectedDevice.permissions.accessibilityService },
              { label: 'Overlay (Alert Window)', granted: selectedDevice.permissions.overlayAlertWindow },
              { label: 'Battery Optimization Ignored', granted: selectedDevice.permissions.ignoreBatteryOptimizations },
            ].map((p, idx) => (
              <div
                key={idx}
                className="p-2 rounded-lg bg-slate-50 dark:bg-slate-850 flex items-center justify-between"
              >
                <span className="text-slate-700 dark:text-slate-300 font-medium">{p.label}</span>
                {p.granted ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Granted
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-rose-500">
                    <XCircle className="w-3.5 h-3.5" /> Missing
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
