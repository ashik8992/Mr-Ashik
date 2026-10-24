import React, { useState, useEffect } from 'react';
import {
  Activity,
  Radio,
  Layers,
  Wifi,
  WifiOff,
  AlertTriangle,
  KeyRound,
  Filter,
  Sparkles,
  Smartphone,
  Clock,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { ActivityEvent, ActivityEventType, Device } from '../types/index.ts';
import { Language, translations } from '../i18n/translations.ts';
import { filterActivityEvents, formatEventBadge } from '../utils/activityFeed.ts';

interface RealTimeActivityFeedProps {
  devices: Device[];
  lang: Language;
}

export const RealTimeActivityFeed: React.FC<RealTimeActivityFeedProps> = ({ devices, lang }) => {
  const t = translations[lang];
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<'all' | ActivityEventType>('all');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('all');
  const [newEventHighlightId, setNewEventHighlightId] = useState<string | null>(null);

  // Subscribe to real-time SSE stream
  useEffect(() => {
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource('/api/activity/stream');

      eventSource.onopen = () => {
        setIsConnected(true);
      };

      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'SNAPSHOT' && Array.isArray(data.events)) {
            setEvents(data.events);
          } else if (data.id) {
            // New real-time event pushed from server
            setEvents((prev) => [data, ...prev.filter((item) => item.id !== data.id)]);
            setNewEventHighlightId(data.id);
            setTimeout(() => setNewEventHighlightId(null), 3000);
          }
        } catch (err) {
          console.error('Error parsing SSE activity feed message:', err);
        }
      };

      eventSource.onerror = () => {
        setIsConnected(false);
      };
    } catch {
      setIsConnected(false);
    }

    // Fallback initial fetch if SSE is connecting
    fetch('/api/activity')
      .then((res) => res.json())
      .then((initial) => {
        if (Array.isArray(initial) && initial.length > 0) {
          setEvents((prev) => (prev.length === 0 ? initial : prev));
        }
      })
      .catch(() => {});

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  // Filter events
  const filteredEvents = filterActivityEvents(events, selectedType, selectedDeviceId);

  // Simulate pushing a new activity event to test real-time update
  const handleSimulateEvent = async (type: ActivityEventType) => {
    const targetDev = devices[Math.floor(Math.random() * devices.length)] || devices[0];
    let title = '';
    let description = '';
    let metadata: Record<string, unknown> = {};

    if (type === 'app_usage') {
      const apps = ['Duolingo', 'Roblox', 'YouTube Kids', 'Khan Academy'];
      const chosen = apps[Math.floor(Math.random() * apps.length)];
      const mins = Math.floor(15 + Math.random() * 45);
      title = `${chosen} Usage Recorded (${mins}m)`;
      description = `${targetDev.childName} used ${chosen} on ${targetDev.name}.`;
      metadata = { app: chosen, durationMinutes: mins };
    } else if (type === 'connection_change') {
      const isOnline = Math.random() > 0.5;
      title = isOnline ? 'Device Reconnected to Network' : 'Device Lost Connection';
      description = isOnline
        ? `${targetDev.name} established Wi-Fi connection. Telemetry resumed.`
        : `${targetDev.name} missed heartbeat ping. Showing last known GPS position.`;
      metadata = { connectionStatus: isOnline ? 'online' : 'offline' };
    } else if (type === 'safety_alert') {
      title = 'Screen Time Schedule Notice';
      description = `Study & Homework hours schedule active for ${targetDev.childName}.`;
    } else if (type === 'permission_change') {
      title = 'Permission Verified';
      description = `Android Usage Access & Background Location verified on ${targetDev.model}.`;
      metadata = { permissionName: 'PACKAGE_USAGE_STATS', permissionGranted: true };
    }

    try {
      await fetch('/api/activity/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: targetDev.id,
          deviceName: targetDev.name,
          childName: targetDev.childName,
          type,
          title,
          description,
          severity: type === 'safety_alert' ? 'medium' : 'low',
          metadata,
        }),
      });
    } catch {
      // Local fallback
      const localEvent: ActivityEvent = {
        id: `act-${Date.now()}`,
        deviceId: targetDev.id,
        deviceName: targetDev.name,
        childName: targetDev.childName,
        type,
        title,
        description,
        timestamp: new Date().toISOString(),
        metadata,
      };
      setEvents((prev) => [localEvent, ...prev]);
    }
  };

  const getEventIcon = (type: ActivityEventType) => {
    switch (type) {
      case 'app_usage':
        return <Layers className="w-4 h-4 text-indigo-500" />;
      case 'connection_change':
        return <Wifi className="w-4 h-4 text-cyan-500" />;
      case 'safety_alert':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'permission_change':
        return <KeyRound className="w-4 h-4 text-amber-500" />;
      default:
        return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
      
      {/* Feed Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Real-Time Activity Feed
            </h2>
            <span
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isConnected
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
              <span>{isConnected ? 'Live WebSocket/SSE' : 'Polling'}</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automatic chronological stream of app usage, connection state changes, safety alerts, and permission updates
          </p>
        </div>

        {/* Quick Simulation Trigger Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 hidden md:inline">
            Push Event:
          </span>
          <button
            onClick={() => handleSimulateEvent('app_usage')}
            className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold border border-indigo-200 dark:border-indigo-800 flex items-center gap-1"
          >
            <Layers className="w-3 h-3" />
            <span>+ App Usage</span>
          </button>
          <button
            onClick={() => handleSimulateEvent('connection_change')}
            className="px-2 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 text-cyan-700 dark:text-cyan-300 text-[10px] font-bold border border-cyan-200 dark:border-cyan-800 flex items-center gap-1"
          >
            <Wifi className="w-3 h-3" />
            <span>+ Connection</span>
          </button>
          <button
            onClick={() => handleSimulateEvent('safety_alert')}
            className="px-2 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-[10px] font-bold border border-rose-200 dark:border-rose-800 flex items-center gap-1"
          >
            <AlertTriangle className="w-3 h-3" />
            <span>+ Alert</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Device Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Activities' },
            { id: 'app_usage', label: 'App Usage' },
            { id: 'connection_change', label: 'Connection' },
            { id: 'safety_alert', label: 'Safety Alerts' },
            { id: 'permission_change', label: 'Permissions' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id as any)}
              className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
                selectedType === tab.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <label className="text-[11px] text-slate-400 font-semibold">Device:</label>
          <select
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Supervised Devices</option>
            {devices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
            No activity events recorded for this filter.
          </div>
        ) : (
          filteredEvents.map((event) => {
            const badge = formatEventBadge(event.type);
            const isHighlighted = newEventHighlightId === event.id;

            return (
              <div
                key={event.id}
                className={`p-3.5 rounded-xl border transition-all duration-500 flex items-start justify-between gap-3 text-xs ${
                  isHighlighted
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 ring-2 ring-indigo-400/20 shadow-md'
                    : 'bg-slate-50/80 dark:bg-slate-850 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    {getEventIcon(event.type)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {event.title}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.badgeClass}`}>
                        {badge.label}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded-md">
                        {event.deviceName} ({event.childName})
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 text-xs mt-1 leading-relaxed">
                      {event.description}
                    </p>

                    {/* Metadata tags */}
                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono text-slate-400">
                        {event.metadata.app && (
                          <span className="bg-slate-200/80 dark:bg-slate-800 px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-400 font-semibold">
                            App: {String(event.metadata.app)}
                          </span>
                        )}
                        {event.metadata.durationMinutes && (
                          <span className="bg-slate-200/80 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            Duration: {String(event.metadata.durationMinutes)}m
                          </span>
                        )}
                        {event.metadata.connectionStatus && (
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold ${
                              event.metadata.connectionStatus === 'online'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            Status: {String(event.metadata.connectionStatus).toUpperCase()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Timestamp */}
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3" />
                    {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
        <span>Automatic real-time sync with all 10 device slots</span>
        <span className="font-mono text-indigo-500 font-semibold">
          {filteredEvents.length} events logged
        </span>
      </div>

    </div>
  );
};
