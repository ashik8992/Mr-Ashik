import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Clock,
  Shield,
  AlertTriangle,
  History,
  Layers,
  Compass,
} from 'lucide-react';
import { Device } from '../types/index.ts';
import { Language, translations } from '../i18n/translations.ts';
import { isLocationStale } from '../utils/deviceLimits.ts';

interface LocationViewProps {
  devices: Device[];
  selectedDevice: Device;
  onSelectDevice: (device: Device) => void;
  lang: Language;
}

export const LocationView: React.FC<LocationViewProps> = ({
  devices,
  selectedDevice,
  onSelectDevice,
  lang,
}) => {
  const t = translations[lang];
  const [showHistory, setShowHistory] = useState(false);
  const location = selectedDevice.lastLocation;
  const isStale = isLocationStale(location.timestamp);

  const mockHistory = [
    { time: '10:35 AM', address: 'Central Park West', status: 'Arrived' },
    { time: '09:40 AM', address: 'Metropolitan High School', status: 'Departed' },
    { time: '08:15 AM', address: 'Home Residence', status: 'Departed' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-500" />
              <span>{t.nav.location}: {selectedDevice.name}</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Permission-based Android Location API telemetry with GPS accuracy radius and stale tracking
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
                {d.name} ({d.status === 'online' ? 'Online' : 'Offline'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stale Warning Banner if offline or old */}
      {(selectedDevice.status === 'offline' || isStale) && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 flex items-start gap-3 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Last Known Safe Location (Device Offline)</p>
            <p className="text-[11px] opacity-90 mt-0.5">
              Device is currently disconnected from cellular/Wi-Fi. The pin below represents the last confirmed location received at {new Date(location.timestamp).toLocaleTimeString()}. It is not a real-time live tracker.
            </p>
          </div>
        </div>
      )}

      {/* Interactive Map Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Map Viewport (2 cols) */}
        <div className="lg:col-span-2 bg-slate-950 rounded-3xl border-4 border-slate-800 shadow-xl overflow-hidden min-h-[440px] flex flex-col justify-between relative">
          
          {/* Map Grid & Road paths */}
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px]" />
          
          <svg className="absolute inset-0 w-full h-full stroke-slate-800" strokeWidth="3">
            <path d="M0,120 L800,240" fill="none" />
            <path d="M200,0 L250,500" fill="none" />
            <path d="M0,360 Q300,300 800,420" fill="none" />
          </svg>

          {/* Top Floating Map Info */}
          <div className="relative z-10 p-4 flex items-center justify-between text-xs">
            <div className="bg-slate-900/90 text-white px-3 py-1.5 rounded-xl border border-slate-700 backdrop-blur-xs flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-400 animate-spin" style={{ animationDuration: '10s' }} />
              <span className="font-semibold">{location.address}</span>
            </div>
            <div className="bg-slate-900/90 text-slate-300 font-mono text-[11px] px-2.5 py-1.5 rounded-xl border border-slate-700 backdrop-blur-xs">
              ±{location.accuracyMeters}m Accuracy
            </div>
          </div>

          {/* Center Pin & GPS Ring */}
          <div className="relative z-10 flex flex-col items-center my-auto">
            <div className="relative flex items-center justify-center">
              <div className="w-28 h-28 rounded-full bg-indigo-500/15 border border-indigo-400/30 animate-pulse flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-indigo-500/25 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-rose-600 ring-4 ring-white dark:ring-slate-900 shadow-xl flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-2 bg-slate-900 text-white font-bold text-xs px-3 py-1 rounded-full border border-slate-700 shadow-lg">
              {selectedDevice.childName}’s Device
            </div>
          </div>

          {/* Bottom Coordinates Bar */}
          <div className="relative z-10 p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <span className="font-mono text-[11px]">
              GPS: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </span>
            <span className="text-[11px] text-slate-400">
              Synced: {new Date(location.timestamp).toLocaleTimeString()}
            </span>
          </div>

        </div>

        {/* Sidebar Info & History */}
        <div className="space-y-4">
          
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Location Permission Policy</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">ACCESS_BACKGROUND_LOCATION:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Granted</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sharing Mode:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Parent Supervised</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">History Retention:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">60 Days</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-500" />
                <span>Recent Location Points</span>
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              {mockHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                      {item.address}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.time} • {item.status}
                    </span>
                  </div>
                  <Navigation className="w-3.5 h-3.5 text-slate-400" />
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
