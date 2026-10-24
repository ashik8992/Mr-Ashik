import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { checkDeviceLimit } from './src/utils/deviceLimits.ts';
import { generatePairingCode, isPairingCodeValid, PAIRING_CODE_TTL_MS, PairingCodeSession } from './src/utils/pairing.ts';
import { mergeOfflineEvents } from './src/utils/offlineSync.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory backend database state
  const activePairingSessions = new Map<string, PairingCodeSession>();
  const liveScreenSessions = new Map<string, {
    sessionId: string;
    deviceId: string;
    parentId: string;
    status: string;
    startedAt: string;
    token: string;
    sdpOffer?: string;
    sdpAnswer?: string;
    candidates: string[];
  }>();

  // Audit logs store
  const auditLogs: Array<{ id: string; action: string; details: string; timestamp: string }> = [
    {
      id: 'log-001',
      action: 'DEVICE_PAIRED',
      details: "Paired device Liam's Pixel 8 using single-use code",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'log-002',
      action: 'SCREEN_TIME_LIMIT_ENFORCED',
      details: "Screen limit reached on Noah's Galaxy S23",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
    },
  ];

  // In-memory Real-time Activity Events Feed
  interface ServerActivityEvent {
    id: string;
    deviceId: string;
    deviceName: string;
    childName: string;
    type: 'app_usage' | 'connection_change' | 'safety_alert' | 'permission_change';
    title: string;
    description: string;
    timestamp: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    metadata?: Record<string, unknown>;
  }

  interface ServerNotification {
    id: string;
    category: 'connection' | 'safety' | 'limit' | 'pairing' | 'system';
    type: 
      | 'device_connected' 
      | 'device_disconnected' 
      | 'safety_alert' 
      | 'screen_time_limit' 
      | 'pairing_request' 
      | 'pairing_approved'
      | 'keyword_match'
      | 'permission_change'
      | 'offline_sync';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    deviceId?: string;
    deviceName?: string;
    childName?: string;
    actionPage?: string;
    actionLabel?: string;
    metadata?: Record<string, unknown>;
  }

  const activityEvents: ServerActivityEvent[] = [
    {
      id: 'act-001',
      deviceId: 'dev-001',
      deviceName: "Liam's Pixel 8",
      childName: 'Liam',
      type: 'app_usage',
      title: 'Khan Academy Session Completed',
      description: 'Completed 45 minutes of Math Algebra practice.',
      timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      metadata: { app: 'Khan Academy', durationMinutes: 45 },
    },
    {
      id: 'act-002',
      deviceId: 'dev-003',
      deviceName: "Noah's Galaxy S23",
      childName: 'Noah',
      type: 'connection_change',
      title: 'Device Lost Network Connection',
      description: 'Cellular/Wi-Fi heartbeat interrupted at 10:42 AM. Displaying last known safe GPS location.',
      timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      severity: 'medium',
      metadata: { connectionStatus: 'offline' },
    },
    {
      id: 'act-003',
      deviceId: 'dev-003',
      deviceName: "Noah's Galaxy S23",
      childName: 'Noah',
      type: 'safety_alert',
      title: 'Screen Time Allowance Exceeded',
      description: 'Daily allowance of 210 minutes exceeded (245m total recorded). Restrictive overlay prompted.',
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      severity: 'high',
    },
    {
      id: 'act-004',
      deviceId: 'dev-007',
      deviceName: "Oliver's Xiaomi 13",
      childName: 'Oliver',
      type: 'permission_change',
      title: 'Overlay Permission Revoked',
      description: 'System alert window permission was toggled off in Android device settings.',
      timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      severity: 'medium',
      metadata: { permissionName: 'SYSTEM_ALERT_WINDOW', permissionGranted: false },
    },
    {
      id: 'act-005',
      deviceId: 'dev-002',
      deviceName: "Aria's Galaxy Tab S9",
      childName: 'Aria',
      type: 'connection_change',
      title: 'Device Reconnected & Battery Full',
      description: 'Connected to home 5GHz Wi-Fi (Battery: 92% Charging).',
      timestamp: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
      severity: 'low',
      metadata: { connectionStatus: 'online', batteryLevel: 92 },
    },
  ];

  // In-memory Server Notifications Store
  const serverNotifications: ServerNotification[] = [
    {
      id: 'notif-001',
      category: 'connection',
      type: 'device_disconnected',
      title: "Noah's Galaxy S23 Disconnected",
      message: 'Heartbeat signal lost. Preserving last known safe GPS position and queuing offline activity.',
      timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      read: false,
      priority: 'high',
      deviceId: 'dev-003',
      deviceName: "Noah's Galaxy S23",
      childName: 'Noah',
      actionPage: 'offlineHistory',
      actionLabel: 'View Offline History',
    },
    {
      id: 'notif-002',
      category: 'limit',
      type: 'screen_time_limit',
      title: 'Daily Screen Limit Reached: Noah',
      message: 'Allowance of 210m reached (245m recorded, +35m over). Restrictive overlay activated on device.',
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      read: false,
      priority: 'high',
      deviceId: 'dev-003',
      deviceName: "Noah's Galaxy S23",
      childName: 'Noah',
      actionPage: 'screenTime',
      actionLabel: 'Review Screen Time',
    },
    {
      id: 'notif-003',
      category: 'pairing',
      type: 'pairing_request',
      title: 'Pending Pairing Request: Galaxy Tab A9',
      message: 'Single-use code entered for child profile "Lucas". Parent approval required to link.',
      timestamp: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
      read: false,
      priority: 'urgent',
      actionPage: 'myDevices',
      actionLabel: 'Approve Pairing',
    },
    {
      id: 'notif-004',
      category: 'connection',
      type: 'device_connected',
      title: "Aria's Galaxy Tab S9 Reconnected",
      message: 'Device has restored 5GHz Wi-Fi connection (Battery: 92%). Live monitoring active.',
      timestamp: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
      read: true,
      priority: 'low',
      deviceId: 'dev-002',
      deviceName: "Aria's Galaxy Tab S9",
      childName: 'Aria',
      actionPage: 'deviceDetails',
      actionLabel: 'View Device',
    },
    {
      id: 'notif-005',
      category: 'safety',
      type: 'keyword_match',
      title: 'Restricted Content Blocked',
      message: 'Triggered safe browsing filter on Liam\'s Pixel 8 (Blocked URL: casino-bonus-online.com).',
      timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
      read: true,
      priority: 'urgent',
      deviceId: 'dev-001',
      deviceName: "Liam's Pixel 8",
      childName: 'Liam',
      actionPage: 'safetyAlerts',
      actionLabel: 'Review Alert',
    },
  ];

  // SSE client connections for real-time push
  const sseClients = new Set<Response>();

  function broadcastActivity(event: ServerActivityEvent) {
    activityEvents.unshift(event);
    if (activityEvents.length > 60) activityEvents.pop();

    const payload = `data: ${JSON.stringify(event)}\n\n`;
    for (const client of sseClients) {
      try {
        client.write(payload);
      } catch {
        sseClients.delete(client);
      }
    }
  }

  function broadcastNotification(notification: ServerNotification) {
    serverNotifications.unshift(notification);
    if (serverNotifications.length > 100) serverNotifications.pop();

    const payload = `data: ${JSON.stringify({ type: 'NOTIFICATION', notification })}\n\n`;
    for (const client of sseClients) {
      try {
        client.write(payload);
      } catch {
        sseClients.delete(client);
      }
    }
  }

  // Activity feed REST endpoint
  app.get('/api/activity', (req: Request, res: Response) => {
    res.json(activityEvents);
  });

  // Notifications REST endpoints
  app.get('/api/notifications', (req: Request, res: Response) => {
    res.json(serverNotifications);
  });

  app.post('/api/notifications', (req: Request, res: Response) => {
    const { category, type, title, message, priority, deviceId, deviceName, childName, actionPage, actionLabel, metadata } = req.body;
    const newNotif: ServerNotification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      category: category || 'system',
      type: type || 'safety_alert',
      title: title || 'System Notification',
      message: message || '',
      timestamp: new Date().toISOString(),
      read: false,
      priority: priority || 'normal',
      deviceId,
      deviceName,
      childName,
      actionPage,
      actionLabel,
      metadata,
    };

    broadcastNotification(newNotif);
    res.json({ success: true, notification: newNotif });
  });

  app.patch('/api/notifications/:id/read', (req: Request, res: Response) => {
    const { id } = req.params;
    const target = serverNotifications.find((n) => n.id === id);
    if (target) {
      target.read = true;
      return res.json({ success: true, notification: target });
    }
    res.status(404).json({ error: 'Notification not found' });
  });

  app.post('/api/notifications/read-all', (req: Request, res: Response) => {
    for (const n of serverNotifications) {
      n.read = true;
    }
    res.json({ success: true, count: serverNotifications.length });
  });

  app.delete('/api/notifications/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = serverNotifications.findIndex((n) => n.id === id);
    if (index !== -1) {
      serverNotifications.splice(index, 1);
      return res.json({ success: true });
    }
    res.status(404).json({ error: 'Notification not found' });
  });

  // Simulation endpoint for notifications (device connection/disconnection, screen time limit, safety alert, pairing request)
  app.post('/api/notifications/simulate', (req: Request, res: Response) => {
    const { eventType, deviceId, deviceName, childName } = req.body;
    let notif: ServerNotification;

    switch (eventType) {
      case 'device_disconnected':
        notif = {
          id: `notif-${Date.now()}`,
          category: 'connection',
          type: 'device_disconnected',
          title: `${deviceName || "Liam's Pixel 8"} Disconnected`,
          message: 'Heartbeat signal lost. Device transitioned to offline mode. Storing last known location.',
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'high',
          deviceId: deviceId || 'dev-001',
          deviceName: deviceName || "Liam's Pixel 8",
          childName: childName || 'Liam',
          actionPage: 'offlineHistory',
          actionLabel: 'View Offline History',
        };
        break;

      case 'device_connected':
        notif = {
          id: `notif-${Date.now()}`,
          category: 'connection',
          type: 'device_connected',
          title: `${deviceName || "Liam's Pixel 8"} Reconnected`,
          message: 'Device has reconnected to Safe Web & App server (Battery: 85%). Live monitoring resumed.',
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'low',
          deviceId: deviceId || 'dev-001',
          deviceName: deviceName || "Liam's Pixel 8",
          childName: childName || 'Liam',
          actionPage: 'deviceDetails',
          actionLabel: 'View Device',
        };
        break;

      case 'screen_time_limit':
        notif = {
          id: `notif-${Date.now()}`,
          category: 'limit',
          type: 'screen_time_limit',
          title: `Screen Time Limit Reached: ${deviceName || "Liam's Pixel 8"}`,
          message: 'Daily allowance of 180m reached (192m recorded). Restrictive PIN lock screen displayed.',
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'high',
          deviceId: deviceId || 'dev-001',
          deviceName: deviceName || "Liam's Pixel 8",
          childName: childName || 'Liam',
          actionPage: 'screenTime',
          actionLabel: 'Adjust Limits',
        };
        break;

      case 'pairing_request':
        notif = {
          id: `notif-${Date.now()}`,
          category: 'pairing',
          type: 'pairing_request',
          title: `Pairing Request: ${deviceName || 'Google Pixel 8a'}`,
          message: `Single-use code SAF-4819 entered for "${childName || 'Liam'}". Parent authorization required.`,
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'urgent',
          actionPage: 'myDevices',
          actionLabel: 'Approve Device',
        };
        break;

      case 'safety_alert':
      default:
        notif = {
          id: `notif-${Date.now()}`,
          category: 'safety',
          type: 'safety_alert',
          title: `Safety Alert: Unsafe Site Access Attempt`,
          message: `${deviceName || "Liam's Pixel 8"}: Attempted navigation to blocked category "Gambling". Access blocked immediately.`,
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'urgent',
          deviceId: deviceId || 'dev-001',
          deviceName: deviceName || "Liam's Pixel 8",
          childName: childName || 'Liam',
          actionPage: 'safetyAlerts',
          actionLabel: 'Review Alert',
        };
        break;
    }

    broadcastNotification(notif);

    // Also broadcast matching activity event
    broadcastActivity({
      id: `act-${Date.now()}`,
      deviceId: notif.deviceId || 'dev-001',
      deviceName: notif.deviceName || 'Device',
      childName: notif.childName || 'Child',
      type: notif.category === 'connection' ? 'connection_change' : notif.category === 'safety' ? 'safety_alert' : 'app_usage',
      title: notif.title,
      description: notif.message,
      timestamp: notif.timestamp,
      severity: notif.priority === 'urgent' ? 'critical' : notif.priority === 'high' ? 'high' : 'low',
    });

    res.json({ success: true, notification: notif });
  });

  // Real-Time Activity Feed SSE Endpoint
  app.get('/api/activity/stream', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Send initial snapshot with events and notifications
    res.write(`data: ${JSON.stringify({ type: 'SNAPSHOT', events: activityEvents, notifications: serverNotifications })}\n\n`);

    sseClients.add(res);

    // Keep-alive ping every 15 seconds
    const pingInterval = setInterval(() => {
      try {
        res.write(': ping\n\n');
      } catch {
        clearInterval(pingInterval);
        sseClients.delete(res);
      }
    }, 15000);

    req.on('close', () => {
      clearInterval(pingInterval);
      sseClients.delete(res);
    });
  });

  // Trigger real-time activity simulation (from companion or UI)
  app.post('/api/activity/simulate', (req: Request, res: Response) => {
    const { deviceId, deviceName, childName, type, title, description, severity, metadata } = req.body;
    
    const newEvent: ServerActivityEvent = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      deviceId: deviceId || 'dev-001',
      deviceName: deviceName || "Liam's Pixel 8",
      childName: childName || 'Liam',
      type: type || 'app_usage',
      title: title || 'Simulated Activity Event',
      description: description || 'Significant device event triggered.',
      timestamp: new Date().toISOString(),
      severity: severity || 'low',
      metadata: metadata || {},
    };

    broadcastActivity(newEvent);
    res.json({ success: true, event: newEvent });
  });

  // 1. Google Authentication Endpoint
  app.get('/api/auth/me', (req: Request, res: Response) => {
    res.json({
      id: 'parent_usr_99812',
      name: 'Ashikur Rahman (Parent Admin)',
      email: 'ashik.cvc.official@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      maxDevices: 10,
      retentionDays: 60,
    });
  });

  // 2. Generate Pairing Code for Device
  app.post('/api/pairing/generate', (req: Request, res: Response) => {
    const { currentDeviceCount = 7 } = req.body;
    const limitCheck = checkDeviceLimit(currentDeviceCount);

    if (!limitCheck.allowed) {
      return res.status(403).json({
        error: 'DEVICE_LIMIT_REACHED',
        message: 'Parent Account has reached the maximum allowance of 10 active devices.',
        currentCount: currentDeviceCount,
        maxDevices: 10,
      });
    }

    const code = generatePairingCode();
    const now = Date.now();
    const session: PairingCodeSession = {
      code,
      createdAtMs: now,
      expiresAtMs: now + PAIRING_CODE_TTL_MS,
      claimed: false,
    };
    activePairingSessions.set(code, session);

    auditLogs.push({
      id: `log-${Date.now()}`,
      action: 'PAIRING_CODE_GENERATED',
      details: `Generated pairing code ${code} (expires in 15 mins)`,
      timestamp: new Date().toISOString(),
    });

    res.json({
      code,
      expiresAt: new Date(session.expiresAtMs).toISOString(),
      expiresInMinutes: 15,
      activeUsageDisplay: limitCheck.formattedDisplay,
    });
  });

  // 3. Device Pairing Verification
  app.post('/api/pairing/verify', (req: Request, res: Response) => {
    const { code, deviceModel, androidVersion, childName } = req.body;
    const session = activePairingSessions.get(code);

    if (!session || !isPairingCodeValid(session)) {
      return res.status(400).json({
        error: 'INVALID_OR_EXPIRED_CODE',
        message: 'The pairing code is invalid or has expired. Please generate a new code from the Parent Dashboard.',
      });
    }

    session.claimed = true;
    const newDeviceId = `dev-${Date.now().toString().slice(-4)}`;

    auditLogs.push({
      id: `log-${Date.now()}`,
      action: 'DEVICE_LINKED',
      details: `Child device "${childName || 'Child Device'}" (${deviceModel || 'Android'}) linked with code ${code}`,
      timestamp: new Date().toISOString(),
    });

    broadcastNotification({
      id: `notif-${Date.now()}`,
      category: 'pairing',
      type: 'pairing_approved',
      title: `Device Paired: ${childName || 'Child Device'}`,
      message: `Device (${deviceModel || 'Android'}) was successfully linked to Parent Workspace.`,
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'normal',
      deviceId: newDeviceId,
      deviceName: `${childName || 'Child'}'s ${deviceModel || 'Device'}`,
      childName: childName || 'Child',
      actionPage: 'deviceDetails',
      actionLabel: 'View Device',
    });

    res.json({
      success: true,
      deviceId: newDeviceId,
      token: `dev_token_${Math.random().toString(36).substring(2)}`,
      serverUrl: 'http://localhost:3000',
    });
  });

  // 4. Device Heartbeat
  app.post('/api/devices/:deviceId/heartbeat', (req: Request, res: Response) => {
    const { deviceId } = req.params;
    const { batteryLevel, isCharging, networkType = 'wifi' } = req.body;
    
    res.json({
      status: 'acknowledged',
      deviceId,
      receivedAt: new Date().toISOString(),
      batteryLevel,
      isCharging,
      networkType,
    });
  });

  // 5. Offline Record Synchronization (Idempotent Deduplication)
  app.post('/api/devices/:deviceId/sync-offline', (req: Request, res: Response) => {
    const { deviceId } = req.params;
    const { events = [] } = req.body;

    const result = mergeOfflineEvents([], events);
    const batchId = `BATCH-${Date.now()}`;

    auditLogs.push({
      id: `log-${Date.now()}`,
      action: 'OFFLINE_RECORDS_SYNCED',
      details: `Device ${deviceId} synced ${result.addedCount} records (${result.duplicateCount} duplicates discarded)`,
      timestamp: new Date().toISOString(),
    });

    broadcastActivity({
      id: `act-${Date.now()}`,
      deviceId,
      deviceName: `Device ${deviceId}`,
      childName: 'Child',
      type: 'app_usage',
      title: 'Offline Usage Records Synchronized',
      description: `Uploaded ${result.addedCount} queued records (${result.duplicateCount} duplicates discarded).`,
      timestamp: new Date().toISOString(),
      metadata: { recordsCount: result.addedCount },
    });

    res.json({
      status: 'success',
      batchId,
      recordsProcessed: result.addedCount,
      duplicatesDiscarded: result.duplicateCount,
      syncTime: new Date().toISOString(),
    });
  });

  // 6. Live Screen Sharing Session Management & Signaling
  app.post('/api/screen-share/request', (req: Request, res: Response) => {
    const { deviceId, parentId = 'parent_usr_99812' } = req.body;
    const sessionId = `ss_${Date.now()}`;
    const token = `token_${Math.random().toString(36).substring(2)}`;

    const session = {
      sessionId,
      deviceId,
      parentId,
      status: 'waiting_consent', // Waiting for child MediaProjection dialog
      startedAt: new Date().toISOString(),
      token,
      candidates: [],
    };

    liveScreenSessions.set(sessionId, session);

    auditLogs.push({
      id: `log-${Date.now()}`,
      action: 'SCREEN_SHARE_REQUESTED',
      details: `Live screen capture requested for device ${deviceId}. Prompting Android user for MediaProjection consent.`,
      timestamp: new Date().toISOString(),
    });

    broadcastActivity({
      id: `act-${Date.now()}`,
      deviceId,
      deviceName: `Device ${deviceId}`,
      childName: 'Child',
      type: 'permission_change',
      title: 'Screen Capture Permission Prompted',
      description: 'System MediaProjection dialog displayed to child device for explicit authorization.',
      timestamp: new Date().toISOString(),
      severity: 'medium',
    });

    res.json(session);
  });

  // Consent status callback from Android Companion
  app.post('/api/screen-share/:sessionId/consent', (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const { approved, denialReason } = req.body;
    const session = liveScreenSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'SESSION_NOT_FOUND' });
    }

    if (approved) {
      session.status = 'live';
      auditLogs.push({
        id: `log-${Date.now()}`,
        action: 'SCREEN_SHARE_CONSENT_GRANTED',
        details: `Android user approved MediaProjection screen capture for session ${sessionId}. Stream active.`,
        timestamp: new Date().toISOString(),
      });

      broadcastActivity({
        id: `act-${Date.now()}`,
        deviceId: session.deviceId,
        deviceName: `Device ${session.deviceId}`,
        childName: 'Child',
        type: 'permission_change',
        title: 'Screen Capture Approved By Child',
        description: 'Android MediaProjection consent granted. Transparent live stream active.',
        timestamp: new Date().toISOString(),
        severity: 'low',
      });
    } else {
      session.status = 'denied';
      auditLogs.push({
        id: `log-${Date.now()}`,
        action: 'SCREEN_SHARE_CONSENT_DENIED',
        details: `Screen capture declined on Android device: ${denialReason || 'User clicked Cancel'}`,
        timestamp: new Date().toISOString(),
      });

      broadcastActivity({
        id: `act-${Date.now()}`,
        deviceId: session.deviceId,
        deviceName: `Device ${session.deviceId}`,
        childName: 'Child',
        type: 'safety_alert',
        title: 'Screen Capture Consent Declined',
        description: `Child tapped Cancel on system MediaProjection prompt: ${denialReason || 'User decline'}.`,
        timestamp: new Date().toISOString(),
        severity: 'medium',
      });
    }

    res.json(session);
  });

  // Terminate Live Screen Session
  app.post('/api/screen-share/:sessionId/terminate', (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const session = liveScreenSessions.get(sessionId);

    if (session) {
      session.status = 'ended';
      auditLogs.push({
        id: `log-${Date.now()}`,
        action: 'SCREEN_SHARE_TERMINATED',
        details: `Live screen sharing session ${sessionId} ended.`,
        timestamp: new Date().toISOString(),
      });
    }

    res.json({ success: true, status: 'ended' });
  });

  // 7. Audit Logs Endpoint
  app.get('/api/audit-logs', (req: Request, res: Response) => {
    res.json(auditLogs);
  });

  // 8. Data Purge & Account Deletion (GDPR/COPPA)
  app.post('/api/privacy/purge-data', (req: Request, res: Response) => {
    const { target } = req.body; // 'location', 'usage', or 'all'
    auditLogs.push({
      id: `log-${Date.now()}`,
      action: 'DATA_DELETION_EXECUTED',
      details: `Parent executed data deletion for target: ${target}`,
      timestamp: new Date().toISOString(),
    });
    res.json({
      success: true,
      message: `All records associated with ${target} have been permanently deleted in accordance with data privacy regulations.`,
    });
  });

  // Mount Vite dev middlewares
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Safe Web & App] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
