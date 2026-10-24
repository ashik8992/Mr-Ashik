import React, { useState } from 'react';
import {
  History,
  MapPin,
  Clock,
  Layers,
  AlertTriangle,
  WifiOff,
  CheckCircle2,
  RefreshCw,
  Shield,
  Smartphone,
  Navigation,
  Database,
  Calendar,
} from 'lucide-react';
import { Device, OfflineSyncEvent } from '../types/index.ts';
import { Language, translations } from '../i18n/translations.ts';
import { isLocationStale } from '../utils/deviceLimits.ts';
import { loadOfflineEvents, INITIAL_APP_USAGE } from '../services/storage.ts';

interface OfflineHistoryViewProps {
  devices: Device[];
  selectedDevice: Device;
  onSelectDevice: (device: Device) => void;
  lang: Language;
}

export const OfflineHistoryView: React.FC<OfflineHistoryViewProps> = ({
  devices,
  selectedDevice,
  onSelectDevice,
  lang,
}) => {
  const t = translations[lang];
  const events = loadOfflineEvents(selectedDevice.id);
  const location = selectedDevice.lastLocation;
  const isStale = isLocationStale(location.timestamp);
  const appData = INITIAL_APP_USAGE[selectedDevice.id] || INITIAL_APP_USAGE['dev-001'];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>{t.offline.title}</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              Zero-Loss Persistence
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            {t.offline.description}
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
            className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {devices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.status === 'online' ? 'Online' : 'Offline'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Offline Notice & Connection Banner */}
      <div
        className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
          selectedDevice.status === 'offline'
            ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200'
            : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
        }`}
      >
        {selectedDevice.status === 'offline' ? (
          <WifiOff className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        )}
        <div className="text-xs space-y-1">
          <p className="font-bold">
            {selectedDevice.status === 'offline'
              ? `Device Offline — Last seen ${new Date(selectedDevice.lastHeartbeat).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : 'Device Connected — Telemetry synchronizing continuously'}
          </p>
          <p className="text-[11px] opacity-90 leading-relaxed">
            {selectedDevice.status === 'offline'
              ? t.offline.locationWarning
              : 'When this device disconnects, its last known location and usage history remain safely preserved here.'}
          </p>
        </div>
      </div>

      {/* Two-Column Section: 5.1 Last Known Location & 5.2 Last Recorded Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 5.1 Last Known Location Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500" />
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                {t.offline.lastKnownLocationTitle}
              </h2>
            </div>
            {isStale || selectedDevice.status === 'offline' ? (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                {t.status.staleLocation}
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {t.status.freshLocation}
              </span>
            )}
          </div>

          {/* Interactive Map Visualizer */}
          <div className="relative h-56 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center">
            {/* SVG Map Grid Background */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />
            
            {/* Map Roads simulation */}
            <svg className="absolute inset-0 w-full h-full stroke-slate-300 dark:stroke-slate-700" strokeWidth="2">
              <path d="M0,60 Q120,80 240,40 T480,120" fill="none" />
              <path d="M100,0 L140,240" fill="none" />
              <path d="M260,0 L240,240" fill="none" />
              <path d="M0,180 Q180,160 360,200 T600,160" fill="none" />
            </svg>

            {/* GPS Accuracy Circle and Pin */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center animate-pulse">
                <div className="w-10 h-10 rounded-full bg-indigo-600/30 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-rose-600 ring-4 ring-white dark:ring-slate-900 shadow-md flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>
              </div>
              <div className="mt-2 bg-slate-900/90 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg backdrop-blur-xs shadow-md">
                Last GPS Point
              </div>
            </div>

            {/* Warning Overlay when Offline */}
            {selectedDevice.status === 'offline' && (
              <div className="absolute top-2 left-2 right-2 bg-amber-900/90 text-amber-200 text-[10px] font-semibold px-2.5 py-1 rounded-lg backdrop-blur-xs flex items-center justify-between">
                <span>Not live GPS. Recorded at {new Date(location.timestamp).toLocaleTimeString()}</span>
                <span>Accuracy ±{location.accuracyMeters}m</span>
              </div>
            )}
          </div>

          {/* Location Details Table */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Address</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {location.address}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{t.offline.coordinates}</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">
                {location.latitude.toFixed(4)}° N, {location.longitude.toFixed(4)}° E
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Recorded At</span>
              <span className="text-slate-800 dark:text-slate-200">
                {new Date(location.timestamp).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Last Successful Sync</span>
              <span className="text-slate-800 dark:text-slate-200">
                {new Date(selectedDevice.lastSyncTime).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        {/* 5.2 Last Recorded Device Activity */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                {t.offline.appUsagePreserved}
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Total Screen Time: {Math.floor(selectedDevice.dailyScreenTimeMinutes / 60)}h {selectedDevice.dailyScreenTimeMinutes % 60}m
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Authorized Android Usage Access records preserved prior to connection loss:
          </p>

          {/* App list with durations */}
          <div className="space-y-2.5">
            {appData.apps.map((app) => (
              <div
                key={app.packageName}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                    {app.appName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-slate-900 dark:text-white">
                      {app.appName}
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      {app.category} • {app.packageName}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">
                    {app.durationMinutes} mins
                  </span>
                  <div className="w-20 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-indigo-600 h-full rounded-full"
                      style={{ width: `${Math.min(100, (app.durationMinutes / 90) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Only permitted system-level stats collected. Keystrokes, chat contents, and personal messages are strictly never accessed.</span>
          </div>
        </div>

      </div>

      {/* 5.3 & 5.4 Offline Synchronization Timeline */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>{t.offline.timelineTitle}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Chronological log of synchronized events, connection state transitions, and offline batch receipts
            </p>
          </div>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
            Idempotent Sync Active
          </span>
        </div>

        {/* Timeline items */}
        <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-4 py-2">
          {events.length === 0 ? (
            <div className="text-xs text-slate-500 py-4">
              {t.offline.noQueuedRecords}
            </div>
          ) : (
            events.map((evt, idx) => (
              <div key={evt.eventId || idx} className="relative group">
                {/* Dot */}
                <div
                  className={`absolute -left-[31px] top-1 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                    evt.eventType === 'heartbeat'
                      ? 'bg-emerald-500'
                      : evt.eventType === 'location_update'
                      ? 'bg-rose-500'
                      : evt.eventType === 'permission_change'
                      ? 'bg-amber-500'
                      : 'bg-indigo-500'
                  }`}
                />

                <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{evt.summary}</span>
                      <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700">
                        ID: {evt.eventId}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 capitalize">
                      Event Type: {evt.eventType.replace('_', ' ')}
                    </p>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500 shrink-0 ml-3">
                    {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800 text-[11px] text-indigo-900 dark:text-indigo-300">
          {t.offline.syncNotice}
        </div>
      </div>

    </div>
  );
};
