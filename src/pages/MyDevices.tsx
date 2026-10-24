import React, { useState } from 'react';
import {
  Smartphone,
  PlusCircle,
  Wifi,
  WifiOff,
  Battery,
  Lock,
  Unlock,
  Cast,
  History,
  Trash2,
  Copy,
  Check,
  Shield,
  Clock,
  QrCode,
  AlertCircle,
  Layers,
} from 'lucide-react';
import { Device } from '../types/index.ts';
import { Language, translations } from '../i18n/translations.ts';
import { PageId } from '../components/Sidebar.tsx';
import { requestPairingCode } from '../services/api.ts';
import { evaluateDeviceConnection } from '../utils/deviceLimits.ts';

interface MyDevicesProps {
  devices: Device[];
  selectedDevice: Device;
  onSelectDevice: (device: Device) => void;
  onNavigate: (page: PageId) => void;
  onToggleLock: (deviceId: string) => void;
  onDeleteDevice: (deviceId: string) => void;
  onAddNewDevice: (newDevice: Device) => void;
  lang: Language;
}

export const MyDevices: React.FC<MyDevicesProps> = ({
  devices,
  selectedDevice,
  onSelectDevice,
  onNavigate,
  onToggleLock,
  onDeleteDevice,
  onAddNewDevice,
  lang,
}) => {
  const t = translations[lang];
  const [showPairModal, setShowPairModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadingCode, setLoadingCode] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newDeviceModel, setNewDeviceModel] = useState('Samsung Galaxy S24');

  const maxDevices = 10;
  const isLimitReached = devices.length >= maxDevices;

  const handleOpenPairing = async () => {
    if (isLimitReached) return;
    setLoadingCode(true);
    setShowPairModal(true);
    const result = await requestPairingCode(devices.length);
    setGeneratedCode(result.code);
    setLoadingCode(false);
  };

  const copyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard?.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateDeviceLinked = () => {
    if (!generatedCode) return;
    const newDevice: Device = {
      id: `dev-${Date.now().toString().slice(-4)}`,
      name: `${newChildName || 'Alex'}'s Phone`,
      model: newDeviceModel,
      androidVersion: 'Android 15',
      childName: newChildName || 'Alex',
      childAge: 11,
      mode: 'personal',
      status: 'online',
      batteryLevel: 94,
      isCharging: false,
      lastHeartbeat: new Date().toISOString(),
      lastSyncTime: new Date().toISOString(),
      lastLocation: {
        id: `loc-${Date.now()}`,
        deviceId: `dev-${Date.now().toString().slice(-4)}`,
        latitude: 23.794,
        longitude: 90.408,
        accuracyMeters: 5,
        timestamp: new Date().toISOString(),
        address: 'Gulshan 2, Dhaka, Bangladesh',
        isStale: false,
      },
      permissions: {
        usageAccess: true,
        backgroundLocation: true,
        mediaProjection: true,
        accessibilityService: true,
        overlayAlertWindow: true,
        ignoreBatteryOptimizations: true,
      },
      storageUsedGB: 34,
      totalStorageGB: 128,
      ramUsedGB: 4.2,
      totalRamGB: 8.0,
      dailyScreenTimeMinutes: 50,
      weeklyScreenTimeMinutes: 490,
      screenTimeLimitMinutes: 120,
      isLocked: false,
      pairingCode: generatedCode,
      pairedAt: new Date().toISOString(),
    };

    onAddNewDevice(newDevice);
    setShowPairModal(false);
    setGeneratedCode(null);
    setNewChildName('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & 10-Device Limit Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {t.nav.myDevices}
            </h1>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Active Devices: {devices.length}/{maxDevices}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage paired Android phones & tablets. Each Parent Account supports up to 10 active devices.
          </p>
        </div>

        <button
          onClick={handleOpenPairing}
          disabled={isLimitReached}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
            isLimitReached
              ? 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isLimitReached ? t.deviceLimitReached : t.actions.pairNewDevice}</span>
        </button>
      </div>

      {/* Grid of Devices */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {devices.map((device) => {
          const isSelected = selectedDevice.id === device.id;
          const conn = evaluateDeviceConnection(device.lastHeartbeat);

          return (
            <div
              key={device.id}
              className={`rounded-2xl border transition-all overflow-hidden bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/10'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="p-5 space-y-4">
                {/* Device Title & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                      <Smartphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                        {device.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {device.model} • {device.androidVersion}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
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

                {/* Metadata details */}
                <div className="space-y-2 text-xs bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">Child:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {device.childName} (Age {device.childAge})
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">Connection:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {device.status === 'online'
                        ? conn.statusLabel
                        : `Offline — Last Seen ${new Date(device.lastHeartbeat).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">Battery:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Battery className="w-3.5 h-3.5" /> {device.batteryLevel}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">Screen Time Today:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {Math.floor(device.dailyScreenTimeMinutes / 60)}h {device.dailyScreenTimeMinutes % 60}m / {Math.floor(device.screenTimeLimitMinutes / 60)}h limit
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">Management Mode:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {device.mode === 'managed' ? 'Managed Android Mode' : 'Personal Android Mode'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5">
                <button
                  onClick={() => {
                    onSelectDevice(device);
                    onNavigate('deviceDetails');
                  }}
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-semibold"
                >
                  Details
                </button>

                <button
                  onClick={() => {
                    onSelectDevice(device);
                    onNavigate('liveScreen');
                  }}
                  className="px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                >
                  <Cast className="w-3 h-3" />
                  <span>Live</span>
                </button>

                <button
                  onClick={() => {
                    onSelectDevice(device);
                    onNavigate('offlineHistory');
                  }}
                  className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                >
                  <History className="w-3 h-3" />
                  <span>Offline</span>
                </button>

                <button
                  onClick={() => onToggleLock(device.id)}
                  className={`p-1.5 rounded-lg text-xs font-semibold ${
                    device.isLocked
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-white dark:bg-slate-800 text-slate-600 border border-slate-200 dark:border-slate-700'
                  }`}
                  title={device.isLocked ? 'Unlock device' : 'Lock device'}
                >
                  {device.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => onDeleteDevice(device.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="Remove device"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pairing Modal */}
      {showPairModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Pair New Android Device
                </h3>
              </div>
              <button
                onClick={() => setShowPairModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Open the <strong>Safe Web Companion</strong> app on your child’s Android device. Enter the short-lived 6-digit code below to securely authenticate and link the device.
            </p>

            {/* Generated Code Display */}
            <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 text-center space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Single-Use Pairing Code (Valid 15m)
              </span>
              <div className="text-3xl font-mono font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wider">
                {loadingCode ? 'Generating...' : generatedCode}
              </div>

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={copyCode}
                  className="px-3 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-2xs hover:bg-slate-50"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
            </div>

            {/* Quick Simulate Device Connection */}
            <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl space-y-2 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                Simulator Quick-Link:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Child Name (e.g. Maya)"
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                />
                <select
                  value={newDeviceModel}
                  onChange={(e) => setNewDeviceModel(e.target.value)}
                  className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value="Google Pixel 9">Google Pixel 9</option>
                  <option value="Samsung Galaxy S24">Samsung Galaxy S24</option>
                  <option value="OnePlus 12">OnePlus 12</option>
                  <option value="Galaxy Tab S9 FE">Galaxy Tab S9 FE</option>
                </select>
              </div>
              <button
                onClick={handleSimulateDeviceLinked}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs"
              >
                Simulate Child Companion Entering Code
              </button>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Parent approval is required before device begins sending telemetry.</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
