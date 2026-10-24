import React, { useState, useEffect, useRef } from 'react';
import {
  Cast,
  Square,
  Play,
  Wifi,
  WifiOff,
  Shield,
  ShieldAlert,
  Clock,
  Radio,
  Lock,
  Smartphone,
  AlertTriangle,
  RotateCw,
  CheckCircle2,
  XCircle,
  Eye,
  Activity,
} from 'lucide-react';
import { Device, ScreenShareStatus, ScreenShareSession } from '../types/index.ts';
import { Language, translations } from '../i18n/translations.ts';
import {
  startScreenShareSession,
  terminateScreenShareSession,
} from '../services/api.ts';

interface LiveScreenShareViewProps {
  devices: Device[];
  selectedDevice: Device;
  onSelectDevice: (device: Device) => void;
  activeScreenShare: {
    status: ScreenShareStatus;
    sessionId?: string;
  };
  onUpdateScreenShareStatus: (status: ScreenShareStatus) => void;
  onOpenSimulator: () => void;
  lang: Language;
}

export const LiveScreenShareView: React.FC<LiveScreenShareViewProps> = ({
  devices,
  selectedDevice,
  onSelectDevice,
  activeScreenShare,
  onUpdateScreenShareStatus,
  onOpenSimulator,
  lang,
}) => {
  const t = translations[lang];
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [elapsedSecs, setElapsedSecs] = useState<number>(0);
  const [fps, setFps] = useState(30);
  const [latencyMs, setLatencyMs] = useState(32);
  const [activeChildApp, setActiveChildApp] = useState<'Duolingo' | 'Khan Academy' | 'Home' | 'Settings'>('Khan Academy');

  // Timer for session duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeScreenShare.status === 'live') {
      if (!sessionStartTime) setSessionStartTime(Date.now());
      interval = setInterval(() => {
        setElapsedSecs((prev) => prev + 1);
        // Realistic micro jitter
        setFps(Math.floor(29 + Math.random() * 2));
        setLatencyMs(Math.floor(28 + Math.random() * 12));
      }, 1000);
    } else {
      setSessionStartTime(null);
      setElapsedSecs(0);
    }
    return () => clearInterval(interval);
  }, [activeScreenShare.status]);

  // Offline handler: if device is offline, live screen is unavailable
  useEffect(() => {
    if (selectedDevice.status === 'offline' && activeScreenShare.status === 'live') {
      onUpdateScreenShareStatus('interrupted');
    }
  }, [selectedDevice.status, activeScreenShare.status]);

  const handleStartRequest = async () => {
    if (selectedDevice.status === 'offline') {
      onUpdateScreenShareStatus('interrupted');
      return;
    }

    onUpdateScreenShareStatus('requesting');
    
    // Call backend API
    const session = await startScreenShareSession(selectedDevice.id);
    
    // Move to waiting for child Android MediaProjection consent prompt
    setTimeout(() => {
      onUpdateScreenShareStatus('waiting_consent');
      onOpenSimulator(); // Proactively open simulator so parent/tester can click consent!
    }, 1000);
  };

  const handleStopSession = async () => {
    if (activeScreenShare.sessionId) {
      await terminateScreenShareSession(activeScreenShare.sessionId);
    }
    onUpdateScreenShareStatus('ended');
    setTimeout(() => onUpdateScreenShareStatus('idle'), 2500);
  };

  const formatElapsed = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Cast className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>{t.liveScreen.title}</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              WebRTC Secure Tunnel
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            {t.liveScreen.description}
          </p>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Target Device:
          </label>
          <select
            value={selectedDevice.id}
            onChange={(e) => {
              const d = devices.find((dev) => dev.id === e.target.value);
              if (d) {
                onSelectDevice(d);
                if (activeScreenShare.status === 'live') {
                  onUpdateScreenShareStatus('idle');
                }
              }
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

      {/* Main Streaming Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Stream Viewport (2 cols) */}
        <div className="lg:col-span-2 bg-slate-950 rounded-3xl border-4 border-slate-800 shadow-2xl overflow-hidden flex flex-col justify-between min-h-[520px]">
          
          {/* Stream Overlay Header */}
          <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  activeScreenShare.status === 'live'
                    ? 'bg-emerald-500 animate-pulse'
                    : activeScreenShare.status === 'waiting_consent' || activeScreenShare.status === 'requesting'
                    ? 'bg-amber-500 animate-ping'
                    : 'bg-slate-600'
                }`}
              />
              <span className="font-bold text-white">
                {selectedDevice.name} ({selectedDevice.model})
              </span>
            </div>

            {activeScreenShare.status === 'live' && (
              <div className="flex items-center gap-4 text-[11px] font-mono">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <Activity className="w-3.5 h-3.5" /> {fps} FPS
                </span>
                <span className="text-slate-400">{latencyMs} ms</span>
                <span className="text-rose-400 font-bold bg-rose-950 px-2 py-0.5 rounded-md border border-rose-800">
                  {formatElapsed(elapsedSecs)}
                </span>
              </div>
            )}
          </div>

          {/* Viewport Canvas / Content */}
          <div className="flex-1 flex items-center justify-center p-6 relative">
            
            {/* Case 1: Device is Offline */}
            {selectedDevice.status === 'offline' ? (
              <div className="text-center space-y-3 max-w-sm p-6 bg-slate-900/80 rounded-2xl border border-slate-800">
                <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <WifiOff className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {t.liveScreen.statusOffline}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Last connection verified at {new Date(selectedDevice.lastHeartbeat).toLocaleTimeString()}. Live streaming requires an active internet connection and valid child device approval.
                </p>
                <div className="text-[11px] font-mono text-amber-400 bg-amber-950/40 p-2 rounded-lg border border-amber-900">
                  Offline history remains available under "Offline History".
                </div>
              </div>
            ) : activeScreenShare.status === 'idle' ? (
              /* Case 2: Idle -> Prompt to start */
              <div className="text-center space-y-4 max-w-sm">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-inner">
                  <Cast className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Start Real-Time Screen Stream
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Click below to dispatch an authorized MediaProjection screen-capture request to {selectedDevice.childName}’s device.
                  </p>
                </div>
                <button
                  onClick={handleStartRequest}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 mx-auto"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{t.liveScreen.startSessionBtn}</span>
                </button>
              </div>
            ) : activeScreenShare.status === 'requesting' ? (
              /* Case 3: Requesting */
              <div className="text-center space-y-3">
                <RotateCw className="w-8 h-8 mx-auto text-indigo-400 animate-spin" />
                <p className="text-sm font-semibold text-white">
                  {t.liveScreen.statusRequesting}
                </p>
                <p className="text-xs text-slate-400">Dispatching TLS session token...</p>
              </div>
            ) : activeScreenShare.status === 'waiting_consent' ? (
              /* Case 4: Waiting for Android child consent dialog */
              <div className="text-center space-y-4 max-w-md p-6 bg-slate-900/90 rounded-2xl border border-indigo-500/40">
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center animate-pulse">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-white">
                  {t.liveScreen.statusWaitingConsent}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  An Android system permission prompt has been displayed on {selectedDevice.name}. The child must tap <strong>"Start now"</strong> to initiate screen capture.
                </p>
                <button
                  onClick={onOpenSimulator}
                  className="px-4 py-2 bg-indigo-600/80 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 mx-auto"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Open Android Companion to Approve</span>
                </button>
              </div>
            ) : activeScreenShare.status === 'live' ? (
              /* Case 5: Live Streaming Active Screen */
              <div className="w-full max-w-sm rounded-2xl bg-slate-900 border-2 border-indigo-500 shadow-2xl p-4 text-white space-y-3 relative overflow-hidden">
                
                {/* Android Phone Mock View */}
                <div className="flex items-center justify-between text-[11px] pb-2 border-b border-slate-800 text-slate-400 font-mono">
                  <span>10:42 AM</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Radio className="w-3 h-3 text-rose-500 animate-pulse" /> LIVE STREAM
                  </span>
                  <span>100% Battery</span>
                </div>

                {/* Simulated child app UI */}
                <div className="h-64 rounded-xl bg-slate-950 p-4 flex flex-col justify-between border border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-xs font-bold text-black">
                        KA
                      </div>
                      <span className="font-bold text-xs">{activeChildApp}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Lesson 4.2</span>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg space-y-1 text-xs">
                    <div className="font-semibold text-indigo-300">Polynomial Equations & Graphing</div>
                    <div className="text-[10px] text-slate-400">Child is currently completing homework quiz questions.</div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                      <div className="bg-emerald-500 h-full w-2/3" />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span>Touch Ripples: Detected</span>
                    <span>Android MediaProjection Active</span>
                  </div>
                </div>

                <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Transparent Screen Mirroring Active</span>
                </div>
              </div>
            ) : activeScreenShare.status === 'denied' ? (
              /* Case 6: Consent Denied */
              <div className="text-center space-y-3 p-6 bg-slate-900/90 rounded-2xl border border-rose-500/40">
                <XCircle className="w-10 h-10 mx-auto text-rose-400" />
                <h3 className="text-sm font-bold text-white">
                  {t.liveScreen.statusDenied}
                </h3>
                <p className="text-xs text-slate-400">
                  The Android user declined the screen-capture request. Screen sharing cannot proceed without explicit consent.
                </p>
                <button
                  onClick={() => onUpdateScreenShareStatus('idle')}
                  className="px-4 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Return to Idle
                </button>
              </div>
            ) : (
              /* Case 7: Ended or Interrupted */
              <div className="text-center space-y-3">
                <div className="w-10 h-10 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                  <Square className="w-5 h-5 fill-current" />
                </div>
                <h3 className="text-sm font-bold text-white">
                  {t.liveScreen.statusEnded}
                </h3>
                <p className="text-xs text-slate-400">Media session terminated cleanly.</p>
              </div>
            )}

          </div>

          {/* Stream Overlay Controls Footer */}
          <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">Encrypted DTLS-SRTP • No permanent cloud video recording</span>
            </div>

            {activeScreenShare.status === 'live' && (
              <button
                onClick={handleStopSession}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/30 flex items-center gap-2 transition-all"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{t.actions.stopSharing}</span>
              </button>
            )}
          </div>

        </div>

        {/* Security & Audit Sidebar (1 col) */}
        <div className="space-y-4">
          
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-500" />
              <span>Android Compliance & Security</span>
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t.liveScreen.disclaimer}
            </p>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>System MediaProjection API</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Child consent prompt enforced</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Persistent status bar notification</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>DRM/Protected screens respected</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Session Technical Telemetry
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Device Protocol:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">WebRTC PeerConnection</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Audio Stream:</span>
                <span className="text-slate-500">Muted (Privacy Disclosed)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Session Token:</span>
                <span className="font-mono text-slate-500">tok_9918x_exp15m</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
