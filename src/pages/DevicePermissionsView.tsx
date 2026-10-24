import React from 'react';
import {
  KeyRound,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { Device } from '../types/index.ts';
import { Language, translations } from '../i18n/translations.ts';

interface DevicePermissionsViewProps {
  devices: Device[];
  selectedDevice: Device;
  onSelectDevice: (device: Device) => void;
  lang: Language;
}

export const DevicePermissionsView: React.FC<DevicePermissionsViewProps> = ({
  devices,
  selectedDevice,
  onSelectDevice,
  lang,
}) => {
  const t = translations[lang];

  const permissionDefinitions = [
    {
      id: 'usageAccess',
      title: 'Usage Access (PACKAGE_USAGE_STATS)',
      desc: 'Allows Safe Web Companion to monitor screen time and app usage durations without inspecting private user content.',
      granted: selectedDevice.permissions.usageAccess,
      instruction: 'Settings → Apps & notifications → Special app access → Usage access → Enable Safe Web.',
    },
    {
      id: 'backgroundLocation',
      title: 'Background Location (ACCESS_BACKGROUND_LOCATION)',
      desc: 'Provides periodic safe location coordinates even when screen is locked, enabling last known location when offline.',
      granted: selectedDevice.permissions.backgroundLocation,
      instruction: 'Settings → Location → App permissions → Safe Web → Set to "Allow all the time".',
    },
    {
      id: 'mediaProjection',
      title: 'MediaProjection Screen Capture',
      desc: 'Required for transparent, consent-driven live screen sharing sessions. Requires explicit child consent per session.',
      granted: selectedDevice.permissions.mediaProjection,
      instruction: 'Prompts child with system dialog whenever parent requests live screen.',
    },
    {
      id: 'accessibilityService',
      title: 'Accessibility Service (BIND_ACCESSIBILITY_SERVICE)',
      desc: 'Required in Personal Android Mode to detect blocked apps and enforce schedule lockouts.',
      granted: selectedDevice.permissions.accessibilityService,
      instruction: 'Settings → Accessibility → Downloaded services → Safe Web Companion → Turn On.',
    },
    {
      id: 'overlayAlertWindow',
      title: 'Display Over Other Apps (SYSTEM_ALERT_WINDOW)',
      desc: 'Renders the lock screen reminder and countdown dialogs over restricted apps when time limits expire.',
      granted: selectedDevice.permissions.overlayAlertWindow,
      instruction: 'Settings → Apps → Special app access → Display over other apps → Allow.',
    },
    {
      id: 'ignoreBatteryOptimizations',
      title: 'Battery Optimization Exemption',
      desc: 'Prevents Android Doze mode from killing the background heartbeat and offline sync worker queue.',
      granted: selectedDevice.permissions.ignoreBatteryOptimizations,
      instruction: 'Settings → Battery → Battery optimization → Safe Web → Do not optimize.',
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>{t.nav.permissions}: {selectedDevice.name}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Android operating system permission audit, security justifications, and step-by-step setup guides
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

      {/* Permissions List */}
      <div className="space-y-3">
        {permissionDefinitions.map((perm) => (
          <div
            key={perm.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4"
          >
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {perm.title}
                </h3>
                {perm.granted ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" /> Active & Granted
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800">
                    <XCircle className="w-3 h-3" /> Attention Required
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {perm.desc}
              </p>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-850 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 font-mono mt-2">
                Setup guide: {perm.instruction}
              </div>
            </div>

            <div className="shrink-0 text-right">
              <span className="text-[11px] font-semibold text-slate-400">
                Android 14/15 Verified
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
