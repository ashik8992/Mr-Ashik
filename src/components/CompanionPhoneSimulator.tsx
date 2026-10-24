import React, { useState } from 'react';
import {
  Smartphone,
  Wifi,
  WifiOff,
  Battery,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  Square,
  RefreshCw,
  X,
  Lock,
  ArrowRight,
  Sparkles,
  Info,
  Radio,
  FileText,
  Clock,
  Layers,
  Check,
} from 'lucide-react';
import { Device, OfflineSyncEvent } from '../types/index.ts';
import { Language, translations } from '../i18n/translations.ts';

interface CompanionPhoneSimulatorProps {
  device: Device;
  onUpdateDevice: (updated: Partial<Device>) => void;
  onSyncOfflineEvents: (newEvents: OfflineSyncEvent[]) => void;
  activeScreenShare: {
    status: string;
    sessionId?: string;
  };
  onApproveScreenShare: () => void;
  onDenyScreenShare: (reason?: string) => void;
  onStopScreenShare: () => void;
  onPairNewDeviceSuccess: (newDevice: Device) => void;
  onClose: () => void;
  lang: Language;
  onTriggerNotification?: (
    type:
      | 'device_disconnected'
      | 'device_connected'
      | 'screen_time_limit'
      | 'safety_alert'
      | 'pairing_request'
  ) => void;
}

export const CompanionPhoneSimulator: React.FC<CompanionPhoneSimulatorProps> = ({
  device,
  onUpdateDevice,
  onSyncOfflineEvents,
  activeScreenShare,
  onApproveScreenShare,
  onDenyScreenShare,
  onStopScreenShare,
  onPairNewDeviceSuccess,
  onClose,
  lang,
  onTriggerNotification,
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<
    'welcome' | 'pair' | 'status' | 'permissions' | 'consent' | 'live' | 'sync' | 'help'
  >(activeScreenShare.status === 'waiting_consent' ? 'consent' : activeScreenShare.status === 'live' ? 'live' : 'status');

  const [inputCode, setInputCode] = useState('');
  const [offlineQueue, setOfflineQueue] = useState<OfflineSyncEvent[]>([]);
  const [simulatedApp, setSimulatedApp] = useState('YouTube Kids');
  const [simulatedMins, setSimulatedMins] = useState(25);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState('');

  // Switch tab automatically if parent requests screen share consent
  React.useEffect(() => {
    if (activeScreenShare.status === 'waiting_consent') {
      setActiveTab('consent');
    } else if (activeScreenShare.status === 'live') {
      setActiveTab('live');
    }
  }, [activeScreenShare.status]);

  const toggleConnection = () => {
    const newStatus = device.status === 'online' ? 'offline' : 'online';
    const nowIso = new Date().toISOString();
    onUpdateDevice({
      status: newStatus,
      lastHeartbeat: nowIso,
      ...(newStatus === 'online' ? { lastSyncTime: nowIso } : {}),
    });
    if (onTriggerNotification) {
      onTriggerNotification(
        newStatus === 'offline' ? 'device_disconnected' : 'device_connected'
      );
    }
  };

  const handleSimulateOfflineRecord = () => {
    const newEvent: OfflineSyncEvent = {
      eventId: `offline-evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      eventType: 'app_usage',
      timestamp: new Date().toISOString(),
      summary: `${simulatedApp} usage record (${simulatedMins}m)`,
      details: {
        app: simulatedApp,
        durationMinutes: simulatedMins,
        recordedOffline: true,
      },
    };
    setOfflineQueue((prev) => [newEvent, ...prev]);
  };

  const handleSyncQueued = () => {
    if (offlineQueue.length === 0) return;
    onSyncOfflineEvents(offlineQueue);
    setSyncSuccessMessage(`Successfully uploaded ${offlineQueue.length} records!`);
    setOfflineQueue([]);
    setTimeout(() => setSyncSuccessMessage(''), 3000);
  };

  const handlePairSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    const newPairedDevice: Device = {
      id: `dev-${Date.now().toString().slice(-4)}`,
      name: `${device.childName || 'Child'}'s Phone`,
      model: 'Google Pixel 8a',
      androidVersion: 'Android 15',
      childName: device.childName || 'Child',
      childAge: 11,
      mode: 'personal',
      status: 'online',
      batteryLevel: 88,
      isCharging: false,
      lastHeartbeat: new Date().toISOString(),
      lastSyncTime: new Date().toISOString(),
      lastLocation: {
        id: `loc-${Date.now()}`,
        deviceId: `dev-${Date.now().toString().slice(-4)}`,
        latitude: 23.7925,
        longitude: 90.4078,
        accuracyMeters: 6,
        timestamp: new Date().toISOString(),
        address: 'Gulshan Lake Promenade, Dhaka',
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
      storageUsedGB: 45,
      totalStorageGB: 128,
      ramUsedGB: 4.5,
      totalRamGB: 8.0,
      dailyScreenTimeMinutes: 45,
      weeklyScreenTimeMinutes: 450,
      screenTimeLimitMinutes: 120,
      isLocked: false,
      pairedAt: new Date().toISOString(),
    };

    onPairNewDeviceSuccess(newPairedDevice);
    setActiveTab('status');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 sm:w-96 shadow-2xl rounded-3xl bg-slate-900 border-4 border-slate-700 text-white overflow-hidden transition-all duration-300">
      
      {/* Phone Header / Dynamic Island */}
      <div className="bg-slate-950 px-4 py-2 flex items-center justify-between border-b border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 font-mono font-semibold">
          <span>10:42</span>
          {activeScreenShare.status === 'live' && (
            <span className="flex items-center gap-1 text-rose-400 font-bold animate-pulse px-1.5 py-0.2 rounded-full bg-rose-950 border border-rose-800">
              <Radio className="w-3 h-3" /> REC
            </span>
          )}
        </div>
        <div className="w-16 h-3 rounded-full bg-slate-800/80 mx-auto"></div>
        <div className="flex items-center gap-2">
          {device.status === 'online' ? (
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-rose-400" />
          )}
          <div className="flex items-center gap-0.5">
            <span className="font-mono text-[10px]">{device.batteryLevel}%</span>
            <Battery className="w-3.5 h-3.5 text-slate-300" />
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-0.5 rounded-full hover:bg-slate-800"
            title="Minimize phone emulator"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Screen Title Bar */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-indigo-900/60 to-purple-900/40 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold tracking-tight">
            {t.companion.welcomeTitle}
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          {device.model}
        </span>
      </div>

      {/* Companion App Navigation Pills (8 screens from spec) */}
      <div className="px-2 py-1.5 bg-slate-950/70 border-b border-slate-800 flex items-center gap-1 overflow-x-auto text-[10px]">
        {[
          { id: 'welcome', label: 'Welcome' },
          { id: 'pair', label: 'Pair' },
          { id: 'status', label: 'Status' },
          { id: 'permissions', label: 'Permissions' },
          { id: 'consent', label: 'Consent', notify: activeScreenShare.status === 'waiting_consent' },
          { id: 'live', label: 'Live Stream' },
          { id: 'sync', label: `Sync (${offlineQueue.length})` },
          { id: 'help', label: 'Help' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-2 py-1 rounded-md shrink-0 font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.label}
            {tab.notify && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            )}
          </button>
        ))}
      </div>

      {/* Android Screen Body */}
      <div className="p-4 max-h-[440px] overflow-y-auto space-y-4 text-xs">
        
        {/* 1. Welcome Screen */}
        {activeTab === 'welcome' && (
          <div className="space-y-3 text-center py-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-white">
              {t.companion.welcomeTitle}
            </h3>
            <p className="text-[11px] text-slate-300 leading-relaxed px-2">
              Transparent, safety-first child companion. Keeps you safely connected with your parent, manages screen time, and protects your online well-being.
            </p>
            <div className="bg-slate-800/80 p-3 rounded-xl text-left space-y-2 border border-slate-700">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Zero hidden spyware or keystroke tracking</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Screen sharing requires your explicit approval</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Clear notification whenever sharing is active</span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('pair')}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5"
            >
              <span>Pair Device</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 2. Pair Device Screen */}
        {activeTab === 'pair' && (
          <form onSubmit={handlePairSubmit} className="space-y-3">
            <div className="text-center">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 mx-auto flex items-center justify-center text-purple-400 mb-2">
                <Smartphone className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-xs">Pair With Parent Account</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Generate a 6-digit code in the Parent Dashboard, then enter it here.
              </p>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                6-Digit Pairing Code
              </label>
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="SAF-4912"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-center font-mono font-bold text-sm tracking-wider text-white focus:outline-none focus:border-indigo-500 uppercase"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setInputCode(`SAF-${Math.floor(1000 + Math.random() * 9000)}`)}
                className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[11px] font-medium"
              >
                Auto-generate Code
              </button>
              <button
                type="submit"
                className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-bold"
              >
                {t.companion.pairButton}
              </button>
            </div>
          </form>
        )}

        {/* 3. Connection Status Screen */}
        {activeTab === 'status' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-3 h-3 rounded-full ${
                    device.status === 'online'
                      ? 'bg-emerald-500 animate-pulse'
                      : 'bg-rose-500'
                  }`}
                />
                <div>
                  <p className="font-bold text-white text-xs">
                    {device.status === 'online' ? t.status.online : t.status.offline}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Mode: {device.mode === 'managed' ? t.status.managedMode : t.status.personalMode}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleConnection}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                  device.status === 'online'
                    ? 'bg-rose-600/80 hover:bg-rose-700 text-white'
                    : 'bg-emerald-600/80 hover:bg-emerald-700 text-white'
                }`}
              >
                {device.status === 'online' ? 'Go Offline' : 'Go Online'}
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Simulate Battery:</span>
                <span className="font-mono font-bold text-white">{device.batteryLevel}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={device.batteryLevel}
                onChange={(e) => onUpdateDevice({ batteryLevel: Number(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Last Sync:</span>
                <span className="text-slate-200 font-mono">
                  {new Date(device.lastSyncTime).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last Location:</span>
                <span className="text-slate-200 truncate max-w-[150px]">
                  {device.lastLocation.address}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                const now = new Date().toISOString();
                onUpdateDevice({ lastHeartbeat: now, lastSyncTime: now });
              }}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t.companion.simulateHeartbeat}</span>
            </button>

            {/* Real-time Notification Simulator Buttons */}
            {onTriggerNotification && (
              <div className="p-3 rounded-xl bg-slate-900/90 border border-indigo-950/60 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
                  Simulate Parent Alerts
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onTriggerNotification('screen_time_limit')}
                    className="py-1.5 px-2 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800 text-rose-300 text-[10px] font-semibold transition-colors"
                  >
                    Exceed Limit
                  </button>
                  <button
                    onClick={() => onTriggerNotification('safety_alert')}
                    className="py-1.5 px-2 rounded-lg bg-red-950/50 hover:bg-red-900/60 border border-red-800 text-red-300 text-[10px] font-semibold transition-colors"
                  >
                    Flagged Content
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. Permissions & Privacy Screen */}
        {activeTab === 'permissions' && (
          <div className="space-y-2.5">
            <p className="text-[11px] text-slate-300">
              Android OS required permissions for transparent monitoring:
            </p>

            {[
              {
                id: 'usageAccess',
                title: 'Usage Access API',
                desc: t.companion.usageAccessDesc,
                val: device.permissions.usageAccess,
              },
              {
                id: 'backgroundLocation',
                title: 'Background Location',
                desc: t.companion.locationDesc,
                val: device.permissions.backgroundLocation,
              },
              {
                id: 'mediaProjection',
                title: 'Screen Capture (MediaProjection)',
                desc: t.companion.mediaProjectionDesc,
                val: device.permissions.mediaProjection,
              },
              {
                id: 'accessibilityService',
                title: 'Accessibility Service',
                desc: 'Detects launched apps in Personal Android Mode.',
                val: device.permissions.accessibilityService,
              },
              {
                id: 'overlayAlertWindow',
                title: 'Display Over Other Apps',
                desc: 'Renders limit reminder dialogs over locked apps.',
                val: device.permissions.overlayAlertWindow,
              },
            ].map((p) => (
              <div
                key={p.id}
                className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start justify-between gap-2"
              >
                <div>
                  <div className="font-bold text-white text-xs">{p.title}</div>
                  <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                    {p.desc}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={p.val}
                  onChange={(e) => {
                    onUpdateDevice({
                      permissions: {
                        ...device.permissions,
                        [p.id]: e.target.checked,
                      },
                    });
                  }}
                  className="w-4 h-4 rounded accent-indigo-600 mt-1"
                />
              </div>
            ))}
          </div>
        )}

        {/* 5. Screen Sharing Consent Dialog (Android MediaProjection Prompt) */}
        {activeTab === 'consent' && (
          <div className="p-4 rounded-2xl bg-slate-800 border-2 border-indigo-500/60 shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-indigo-400">
              <Cast className="w-5 h-5 animate-pulse" />
              <h4 className="font-bold text-white text-xs">
                {t.companion.consentDialogTitle}
              </h4>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              {t.companion.consentDialogBody}
            </p>

            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-[10px] text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Visible status bar icon will show while sharing.</span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onDenyScreenShare('Child user tapped Cancel on consent prompt')}
                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-xl text-xs"
              >
                {t.actions.cancel}
              </button>
              <button
                onClick={onApproveScreenShare}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{t.actions.startNow}</span>
              </button>
            </div>
          </div>
        )}

        {/* 6. Live Sharing Status Screen */}
        {activeTab === 'live' && (
          <div className="space-y-3 text-center py-2">
            {activeScreenShare.status === 'live' ? (
              <>
                <div className="relative w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400">
                  <Radio className="w-7 h-7 animate-pulse" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
                </div>
                <h4 className="font-bold text-white text-xs text-emerald-400">
                  Screen Sharing Active
                </h4>
                <p className="text-[11px] text-slate-300 px-2">
                  {t.companion.consentNotification}
                </p>

                {/* Simulated live screen content */}
                <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/40 text-left space-y-1 font-mono text-[10px] text-slate-400">
                  <div>Status: 1080p @ 30 FPS</div>
                  <div>Encryption: WebRTC DTLS-SRTP</div>
                  <div>Bitrate: 2.4 Mbps</div>
                </div>

                <button
                  onClick={onStopScreenShare}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>{t.actions.stopSharing}</span>
                </button>
              </>
            ) : (
              <div className="py-6 text-slate-400">
                <Cast className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No active live screen session.</p>
                <p className="text-[10px] mt-1 text-slate-500">
                  Initiate stream from Parent Web Dashboard.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 7. Last Successful Sync & Offline Queue */}
        {activeTab === 'sync' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
              <h4 className="font-bold text-white text-xs">
                {t.companion.simulateOfflineUsage}
              </h4>
              <p className="text-[10px] text-slate-400">
                Simulate collecting local usage events while internet is disconnected:
              </p>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">App</label>
                  <select
                    value={simulatedApp}
                    onChange={(e) => setSimulatedApp(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-[11px] text-white"
                  >
                    <option value="YouTube Kids">YouTube Kids</option>
                    <option value="Roblox">Roblox</option>
                    <option value="Khan Academy">Khan Academy</option>
                    <option value="Duolingo">Duolingo</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Minutes</label>
                  <input
                    type="number"
                    value={simulatedMins}
                    onChange={(e) => setSimulatedMins(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-[11px] text-white"
                  />
                </div>
              </div>

              <button
                onClick={handleSimulateOfflineRecord}
                className="w-full py-1.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg text-[11px]"
              >
                + {t.companion.generateOfflineRecord}
              </button>
            </div>

            {/* Queue List */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                <span>{t.companion.pendingQueue}</span>
                <span className="font-mono text-indigo-400">{offlineQueue.length} records</span>
              </div>

              {offlineQueue.length === 0 ? (
                <div className="p-3 text-center text-[10px] text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
                  Offline queue is empty.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {offlineQueue.map((ev) => (
                    <div
                      key={ev.eventId}
                      className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[10px] flex items-center justify-between"
                    >
                      <span className="truncate">{ev.summary}</span>
                      <span className="font-mono text-slate-500 shrink-0 ml-2">
                        {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {syncSuccessMessage && (
              <div className="p-2 rounded-lg bg-emerald-950 text-emerald-300 text-[11px] flex items-center gap-1.5 border border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{syncSuccessMessage}</span>
              </div>
            )}

            <button
              onClick={handleSyncQueued}
              disabled={offlineQueue.length === 0 || device.status === 'offline'}
              className="w-full py-2 bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t.actions.syncQueue}</span>
            </button>
          </div>
        )}

        {/* 8. Help & Safety Screen */}
        {activeTab === 'help' && (
          <div className="space-y-2.5 text-[11px] text-slate-300">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5">
              <h4 className="font-bold text-white text-xs">Child Transparency Disclosure</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Safe Web Companion complies with Google Play Families Policy. It informs you whenever location or screen sharing is active and never records private messaging contents.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
              <div className="text-xs font-semibold text-white">Emergency SOS</div>
              <p className="text-[10px] text-slate-400">
                In case of emergency, you can dial emergency services without any restriction from Safe Web.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Phone Bottom Home Bar */}
      <div className="bg-slate-950 p-2 flex justify-center border-t border-slate-800">
        <div className="w-24 h-1 rounded-full bg-slate-600"></div>
      </div>

    </div>
  );
};
