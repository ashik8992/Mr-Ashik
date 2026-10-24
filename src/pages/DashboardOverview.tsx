import React from 'react';
import {
  Smartphone,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Wifi,
  WifiOff,
  Battery,
  ChevronRight,
  Cast,
  History,
  Lock,
  Unlock,
  PlusCircle,
  ExternalLink,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { Device, SafetyAlert } from '../types/index.ts';
import { Language, translations } from '../i18n/translations.ts';
import { PageId } from '../components/Sidebar.tsx';
import { evaluateDeviceConnection } from '../utils/deviceLimits.ts';
import { RealTimeActivityFeed } from '../components/RealTimeActivityFeed.tsx';

interface DashboardOverviewProps {
  devices: Device[];
  alerts: SafetyAlert[];
  selectedDevice: Device;
  onSelectDevice: (device: Device) => void;
  onNavigate: (page: PageId) => void;
  onToggleLock: (deviceId: string) => void;
  onResolveAlert: (alertId: string) => void;
  onOpenPairModal: () => void;
  lang: Language;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  devices,
  alerts,
  selectedDevice,
  onSelectDevice,
  onNavigate,
  onToggleLock,
  onResolveAlert,
  onOpenPairModal,
  lang,
}) => {
  const t = translations[lang];

  const onlineCount = devices.filter((d) => d.status === 'online').length;
  const offlineCount = devices.length - onlineCount;
  const unreadAlerts = alerts.filter((a) => !a.resolved);
  const totalScreenTimeMins = devices.reduce((acc, d) => acc + d.dailyScreenTimeMinutes, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Safe Web & App 2.0 Protection Workspace</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Parent Dashboard
            </h1>
            <p className="text-slate-300 text-xs mt-1 max-w-xl">
              Real-time parental control, transparent screen sharing, and continuous offline history tracking for all registered Android devices.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenPairModal}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.actions.pairNewDevice}</span>
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl backdrop-blur-xs border border-white/20 transition-all"
            >
              Weekly Report
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Active Devices (7/10) */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>{t.activeDevicesCount}</span>
            <Smartphone className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {devices.length}/10
            </span>
            <span className="text-xs text-slate-400">
              ({10 - devices.length} slots free)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-2">
            <span className="text-emerald-500 font-semibold">{onlineCount} Online</span>
            <span>•</span>
            <span className="text-amber-500 font-semibold">{offlineCount} Offline</span>
          </div>
        </div>

        {/* Screen Time Today */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>{t.common.totalScreenTime}</span>
            <Clock className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {Math.floor(totalScreenTimeMins / 60)}h {totalScreenTimeMins % 60}m
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Across {devices.length} supervised devices
          </div>
        </div>

        {/* Safety Alerts */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Safety Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {unreadAlerts.length}
            </span>
            <span className="text-xs text-rose-500 font-semibold">
              Pending Review
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {unreadAlerts.length > 0 ? 'Requires parent action' : 'All alerts resolved'}
          </div>
        </div>

        {/* Offline History Status */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Offline Sync Engine</span>
            <History className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              100%
            </span>
            <span className="text-xs text-emerald-500 font-semibold">
              Idempotent
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Zero data loss on offline recovery
          </div>
        </div>

      </div>

      {/* Device Connection & Status Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Supervised Android Devices ({devices.length}/10)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time heartbeats, battery telemetry, and last known activity
            </p>
          </div>
          <button
            onClick={() => onNavigate('myDevices')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>Manage All Devices</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((device) => {
            const isSelected = selectedDevice.id === device.id;
            const conn = evaluateDeviceConnection(device.lastHeartbeat);

            return (
              <div
                key={device.id}
                onClick={() => onSelectDevice(device)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      {device.name}
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600" />
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Child: {device.childName} (Age {device.childAge})
                    </p>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      device.status === 'online'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                    }`}
                  >
                    {device.status === 'online' ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Online
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-3 h-3 text-amber-600" />
                        Offline
                      </>
                    )}
                  </span>
                </div>

                {/* Status Badges */}
                <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{t.status.lastActivity}:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {device.status === 'online'
                        ? conn.statusLabel
                        : `Offline — Last Seen ${new Date(device.lastHeartbeat).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{t.status.lastLocation}:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[160px]">
                      {device.lastLocation.address}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{t.status.battery}:</span>
                    <span className="flex items-center gap-1 font-mono text-slate-700 dark:text-slate-200">
                      <Battery className="w-3.5 h-3.5" />
                      {device.batteryLevel}% {device.isCharging ? '(Charging)' : ''}
                    </span>
                  </div>
                </div>

                {/* Quick Action Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDevice(device);
                      onNavigate('liveScreen');
                    }}
                    className="flex-1 py-1 px-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold flex items-center justify-center gap-1"
                  >
                    <Cast className="w-3 h-3" />
                    <span>Live Screen</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDevice(device);
                      onNavigate('offlineHistory');
                    }}
                    className="flex-1 py-1 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold flex items-center justify-center gap-1"
                  >
                    <History className="w-3 h-3" />
                    <span>Offline Info</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLock(device.id);
                    }}
                    className={`p-1.5 rounded-lg text-xs font-semibold ${
                      device.isLocked
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                    title={device.isLocked ? 'Unlock device' : 'Lock device'}
                  >
                    {device.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safety Alerts Feed */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Safety Alerts ({unreadAlerts.length} Active)
            </h2>
          </div>
          <button
            onClick={() => onNavigate('safetyAlerts')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View Alert Center
          </button>
        </div>

        <div className="space-y-2.5">
          {alerts.slice(0, 3).map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                alert.resolved
                  ? 'bg-slate-50 dark:bg-slate-850/40 border-slate-200 dark:border-slate-800 opacity-60'
                  : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    alert.severity === 'high'
                      ? 'bg-rose-500'
                      : alert.severity === 'medium'
                      ? 'bg-amber-500'
                      : 'bg-blue-500'
                  }`}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {alert.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {alert.deviceName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    {alert.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {!alert.resolved && (
                  <button
                    onClick={() => onResolveAlert(alert.id)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-Time Activity Feed (WebSockets / SSE streaming) */}
      <RealTimeActivityFeed devices={devices} lang={lang} />

    </div>
  );
};
