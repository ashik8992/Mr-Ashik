/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar, PageId } from './components/Sidebar.tsx';
import { CompanionPhoneSimulator } from './components/CompanionPhoneSimulator.tsx';
import { OnboardingModal } from './components/OnboardingModal.tsx';
import { DashboardOverview } from './pages/DashboardOverview.tsx';
import { MyDevices } from './pages/MyDevices.tsx';
import { DeviceDetails } from './pages/DeviceDetails.tsx';
import { ScreenTimeView } from './pages/ScreenTimeView.tsx';
import { AppUsageView } from './pages/AppUsageView.tsx';
import { LocationView } from './pages/LocationView.tsx';
import { OfflineHistoryView } from './pages/OfflineHistoryView.tsx';
import { LiveScreenShareView } from './pages/LiveScreenShareView.tsx';
import { AppLimitsView } from './pages/AppLimitsView.tsx';
import { SchedulesView } from './pages/SchedulesView.tsx';
import { SafetyAlertsView } from './pages/SafetyAlertsView.tsx';
import { ReportsView } from './pages/ReportsView.tsx';
import { DevicePermissionsView } from './pages/DevicePermissionsView.tsx';
import { AccountSettingsView } from './pages/AccountSettingsView.tsx';
import { PrivacyDataView } from './pages/PrivacyDataView.tsx';
import { HelpSupportView } from './pages/HelpSupportView.tsx';
import {
  Device,
  ParentAccount,
  SafetyAlert,
  ScreenShareStatus,
  OfflineSyncEvent,
  AppNotification,
} from './types/index.ts';
import { Language } from './i18n/translations.ts';
import {
  loadDevices,
  saveDevices,
  loadAccount,
  saveAccount,
  loadAlerts,
  saveAlerts,
  loadOfflineEvents,
  saveOfflineEvents,
  loadNotifications,
  saveNotifications,
} from './services/storage.ts';
import {
  submitScreenShareConsent,
  terminateScreenShareSession,
  syncOfflineRecordsToServer,
  simulateNotificationOnServer,
  markNotificationReadOnServer,
  markAllNotificationsReadOnServer,
  deleteNotificationOnServer,
} from './services/api.ts';
import { processOfflineSyncBatch } from './utils/offlineSync.ts';
import {
  getUnreadCount,
  playNotificationSound,
  sendBrowserPushNotification,
} from './utils/notificationSystem.ts';
import { NotificationCenter } from './components/NotificationCenter.tsx';
import { ToastContainer } from './components/ToastContainer.tsx';
import { Menu } from 'lucide-react';

export default function App() {
  const [account, setAccount] = useState<ParentAccount>(() => loadAccount());
  const [devices, setDevices] = useState<Device[]>(() => loadDevices());
  const [alerts, setAlerts] = useState<SafetyAlert[]>(() => loadAlerts());
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    loadNotifications()
  );
  const [toasts, setToasts] = useState<AppNotification[]>([]);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(() => {
    const list = loadDevices();
    return list[0]?.id || 'dev-001';
  });
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [lang, setLang] = useState<Language>(() => account.language || 'en');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => account.theme || 'light');
  const [simulatorOpen, setSimulatorOpen] = useState<boolean>(true); // Open by default for immediate testing
  const [onboardingOpen, setOnboardingOpen] = useState<boolean>(() => {
    // Check if ?onboarding=1 or first run
    try {
      return window.location.search.includes('onboarding=1') || !localStorage.getItem('safeweb_onboarded_v2');
    } catch {
      return false;
    }
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Screen share live state
  const [activeScreenShare, setActiveScreenShare] = useState<{
    status: ScreenShareStatus;
    sessionId?: string;
  }>({
    status: 'idle',
  });

  // Keep selected device reference
  const selectedDevice = devices.find((d) => d.id === selectedDeviceId) || devices[0];

  // Theme application
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Persist devices on change
  useEffect(() => {
    saveDevices(devices);
  }, [devices]);

  // Persist alerts on change
  useEffect(() => {
    saveAlerts(alerts);
  }, [alerts]);

  // Persist account on change
  useEffect(() => {
    saveAccount(account);
  }, [account]);

  // Persist notifications on change
  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  // Real-Time Notification SSE Stream Listener
  useEffect(() => {
    let es: EventSource | null = null;
    try {
      es = new EventSource('/api/activity/stream');
      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'NOTIFICATION' && data.notification) {
            const incoming: AppNotification = data.notification;
            setNotifications((prev) => {
              if (prev.some((n) => n.id === incoming.id)) return prev;
              return [incoming, ...prev];
            });

            // Trigger floating popup toast
            setToasts((prev) => [incoming, ...prev.slice(0, 2)]);
            setTimeout(() => {
              setToasts((prev) => prev.filter((t) => t.id !== incoming.id));
            }, 6000);

            // Play sound chime if sound is enabled
            if (soundEnabled) {
              playNotificationSound(incoming.priority);
            }

            // Dispatch browser notification if granted
            sendBrowserPushNotification(incoming);
          } else if (data.type === 'SNAPSHOT' && Array.isArray(data.notifications)) {
            setNotifications((prev) => {
              const existingMap = new Map(prev.map((n) => [n.id, n]));
              for (const n of data.notifications) {
                if (!existingMap.has(n.id)) {
                  existingMap.set(n.id, n);
                }
              }
              return Array.from(existingMap.values()).sort(
                (a, b) =>
                  new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
              );
            });
          }
        } catch (err) {
          console.error('SSE parsing error:', err);
        }
      };
    } catch (err) {
      console.warn('SSE EventSource not supported:', err);
    }

    return () => {
      es?.close();
    };
  }, [soundEnabled]);

  const handleMarkNotificationRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    await markNotificationReadOnServer(id);
  };

  const handleMarkAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await markAllNotificationsReadOnServer();
  };

  const handleDeleteNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await deleteNotificationOnServer(id);
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const handleNotificationActionClick = (notif: AppNotification) => {
    if (notif.actionPage) {
      setCurrentPage(notif.actionPage as PageId);
    }
    if (notif.deviceId) {
      setSelectedDeviceId(notif.deviceId);
    }
    handleMarkNotificationRead(notif.id);
  };

  const handleSimulateNotification = async (
    eventType:
      | 'device_disconnected'
      | 'device_connected'
      | 'screen_time_limit'
      | 'safety_alert'
      | 'pairing_request'
  ) => {
    await simulateNotificationOnServer({
      eventType,
      deviceId: selectedDevice.id,
      deviceName: selectedDevice.name,
      childName: selectedDevice.childName,
    });
  };

  // Lock / Unlock Device toggle
  const handleToggleLock = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, isLocked: !d.isLocked } : d))
    );
  };

  // Resolve Safety Alert
  const handleResolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, resolved: true } : a))
    );
  };

  // Clear resolved alerts
  const handleClearAllAlerts = () => {
    setAlerts((prev) => prev.filter((a) => !a.resolved));
  };

  // Add new device from pairing
  const handleAddNewDevice = (newDev: Device) => {
    setDevices((prev) => [newDev, ...prev]);
    setSelectedDeviceId(newDev.id);
    
    // Add alert for new device paired
    const newAlert: SafetyAlert = {
      id: `alt-${Date.now()}`,
      deviceId: newDev.id,
      deviceName: newDev.name,
      type: 'pairing_request',
      title: 'New Device Linked',
      message: `Device "${newDev.name}" was paired and approved by Parent Admin.`,
      severity: 'low',
      timestamp: new Date().toISOString(),
      resolved: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  // Delete device
  const handleDeleteDevice = (deviceId: string) => {
    setDevices((prev) => prev.filter((d) => d.id !== deviceId));
    if (selectedDeviceId === deviceId) {
      const remaining = devices.filter((d) => d.id !== deviceId);
      if (remaining.length > 0) setSelectedDeviceId(remaining[0].id);
    }
  };

  // Update device partial
  const handleUpdateDevice = (updated: Partial<Device>) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === selectedDeviceId ? { ...d, ...updated } : d))
    );
  };

  // Live Screen Share Handlers
  const handleUpdateScreenShareStatus = (status: ScreenShareStatus) => {
    setActiveScreenShare((prev) => ({ ...prev, status }));
  };

  const handleApproveScreenShareFromCompanion = async () => {
    if (activeScreenShare.sessionId) {
      await submitScreenShareConsent(activeScreenShare.sessionId, true);
    }
    setActiveScreenShare((prev) => ({ ...prev, status: 'live' }));

    const consentAlert: SafetyAlert = {
      id: `alt-${Date.now()}`,
      deviceId: selectedDevice.id,
      deviceName: selectedDevice.name,
      type: 'screen_share_consent_approved',
      title: 'Screen Sharing Authorized',
      message: `${selectedDevice.childName} approved the system screen-capture dialog. Live stream active.`,
      severity: 'low',
      timestamp: new Date().toISOString(),
      resolved: false,
    };
    setAlerts((prev) => [consentAlert, ...prev]);
  };

  const handleDenyScreenShareFromCompanion = async (reason?: string) => {
    if (activeScreenShare.sessionId) {
      await submitScreenShareConsent(activeScreenShare.sessionId, false, reason);
    }
    setActiveScreenShare((prev) => ({ ...prev, status: 'denied' }));

    const denyAlert: SafetyAlert = {
      id: `alt-${Date.now()}`,
      deviceId: selectedDevice.id,
      deviceName: selectedDevice.name,
      type: 'screen_share_consent_denied',
      title: 'Screen Sharing Consent Declined',
      message: `MediaProjection authorization was canceled on ${selectedDevice.name}.`,
      severity: 'medium',
      timestamp: new Date().toISOString(),
      resolved: false,
    };
    setAlerts((prev) => [denyAlert, ...prev]);
  };

  const handleStopScreenShareFromCompanion = async () => {
    if (activeScreenShare.sessionId) {
      await terminateScreenShareSession(activeScreenShare.sessionId);
    }
    setActiveScreenShare({ status: 'ended' });
    setTimeout(() => setActiveScreenShare({ status: 'idle' }), 2000);
  };

  // Sync offline events from companion
  const handleSyncOfflineEvents = async (incomingEvents: OfflineSyncEvent[]) => {
    const existing = loadOfflineEvents(selectedDevice.id);
    const { batch, updatedEvents, addedCount, duplicateCount } = processOfflineSyncBatch(
      selectedDevice.id,
      incomingEvents,
      existing
    );

    saveOfflineEvents(selectedDevice.id, updatedEvents);

    // Call server API for idempotent deduplication
    await syncOfflineRecordsToServer(selectedDevice.id, incomingEvents);

    // Update device sync time
    handleUpdateDevice({ lastSyncTime: new Date().toISOString() });

    // Add alert
    const syncAlert: SafetyAlert = {
      id: `alt-${Date.now()}`,
      deviceId: selectedDevice.id,
      deviceName: selectedDevice.name,
      type: 'device_reconnected',
      title: 'Offline Records Synchronized',
      message: `Successfully uploaded ${addedCount} records (${duplicateCount} duplicate events discarded).`,
      severity: 'low',
      timestamp: new Date().toISOString(),
      resolved: false,
    };
    setAlerts((prev) => [syncAlert, ...prev]);
  };

  const unreadAlertsCount = alerts.filter((a) => !a.resolved).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Top Navigation */}
      <Navbar
        lang={lang}
        setLang={(l) => {
          setLang(l);
          setAccount((acc) => ({ ...acc, language: l }));
        }}
        theme={theme}
        setTheme={(th) => {
          setTheme(th);
          setAccount((acc) => ({ ...acc, theme: th }));
        }}
        account={account}
        activeDeviceCount={devices.length}
        maxDevices={10}
        simulatorOpen={simulatorOpen}
        setSimulatorOpen={setSimulatorOpen}
        onOpenOnboarding={() => setOnboardingOpen(true)}
        unreadNotificationCount={getUnreadCount(notifications)}
        onOpenNotifications={() => setNotificationCenterOpen(true)}
      />

      {/* Main App Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        
        {/* Left Sidebar (16 navigation pages) */}
        <Sidebar
          currentPage={currentPage}
          onSelectPage={setCurrentPage}
          lang={lang}
          unreadAlertsCount={unreadAlertsCount}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Center Content Area */}
        <main className="flex-1 lg:pl-64 min-w-0 pb-16">
          
          {/* Mobile hamburger button */}
          <div className="lg:hidden mb-4 flex items-center justify-between">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2 text-xs font-semibold shadow-2xs"
            >
              <Menu className="w-4 h-4" />
              <span>Menu</span>
            </button>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              Active Devices: {devices.length}/10
            </span>
          </div>

          {/* Page Routing */}
          {currentPage === 'dashboard' && (
            <DashboardOverview
              devices={devices}
              alerts={alerts}
              selectedDevice={selectedDevice}
              onSelectDevice={(d) => setSelectedDeviceId(d.id)}
              onNavigate={setCurrentPage}
              onToggleLock={handleToggleLock}
              onResolveAlert={handleResolveAlert}
              onOpenPairModal={() => setCurrentPage('myDevices')}
              lang={lang}
            />
          )}

          {currentPage === 'myDevices' && (
            <MyDevices
              devices={devices}
              selectedDevice={selectedDevice}
              onSelectDevice={(d) => setSelectedDeviceId(d.id)}
              onNavigate={setCurrentPage}
              onToggleLock={handleToggleLock}
              onDeleteDevice={handleDeleteDevice}
              onAddNewDevice={handleAddNewDevice}
              lang={lang}
            />
          )}

          {currentPage === 'deviceDetails' && (
            <DeviceDetails
              devices={devices}
              selectedDevice={selectedDevice}
              onSelectDevice={(d) => setSelectedDeviceId(d.id)}
              onUpdateDevice={handleUpdateDevice}
              onToggleLock={handleToggleLock}
              lang={lang}
            />
          )}

          {currentPage === 'screenTime' && (
            <ScreenTimeView
              devices={devices}
              selectedDevice={selectedDevice}
              onSelectDevice={(d) => setSelectedDeviceId(d.id)}
              lang={lang}
            />
          )}

          {currentPage === 'appUsage' && (
            <AppUsageView
              devices={devices}
              selectedDevice={selectedDevice}
              onSelectDevice={(d) => setSelectedDeviceId(d.id)}
              lang={lang}
            />
          )}

          {currentPage === 'location' && (
            <LocationView
              devices={devices}
              selectedDevice={selectedDevice}
              onSelectDevice={(d) => setSelectedDeviceId(d.id)}
              lang={lang}
            />
          )}

          {currentPage === 'offlineHistory' && (
            <OfflineHistoryView
              devices={devices}
              selectedDevice={selectedDevice}
              onSelectDevice={(d) => setSelectedDeviceId(d.id)}
              lang={lang}
            />
          )}

          {currentPage === 'liveScreen' && (
            <LiveScreenShareView
              devices={devices}
              selectedDevice={selectedDevice}
              onSelectDevice={(d) => setSelectedDeviceId(d.id)}
              activeScreenShare={activeScreenShare}
              onUpdateScreenShareStatus={handleUpdateScreenShareStatus}
              onOpenSimulator={() => setSimulatorOpen(true)}
              lang={lang}
            />
          )}

          {currentPage === 'appLimits' && (
            <AppLimitsView
              devices={devices}
              selectedDevice={selectedDevice}
              onSelectDevice={(d) => setSelectedDeviceId(d.id)}
              onUpdateDevice={handleUpdateDevice}
              lang={lang}
            />
          )}

          {currentPage === 'schedules' && (
            <SchedulesView
              devices={devices}
              selectedDevice={selectedDevice}
              onSelectDevice={(d) => setSelectedDeviceId(d.id)}
              lang={lang}
            />
          )}

          {currentPage === 'safetyAlerts' && (
            <SafetyAlertsView
              alerts={alerts}
              onResolveAlert={handleResolveAlert}
              onClearAllAlerts={handleClearAllAlerts}
              lang={lang}
            />
          )}

          {currentPage === 'reports' && (
            <ReportsView devices={devices} lang={lang} />
          )}

          {currentPage === 'permissions' && (
            <DevicePermissionsView
              devices={devices}
              selectedDevice={selectedDevice}
              onSelectDevice={(d) => setSelectedDeviceId(d.id)}
              lang={lang}
            />
          )}

          {currentPage === 'settings' && (
            <AccountSettingsView
              account={account}
              devices={devices}
              lang={lang}
              setLang={(l) => {
                setLang(l);
                setAccount((acc) => ({ ...acc, language: l }));
              }}
              theme={theme}
              setTheme={(th) => {
                setTheme(th);
                setAccount((acc) => ({ ...acc, theme: th }));
              }}
              onUpdateAccount={(up) => setAccount((acc) => ({ ...acc, ...up }))}
            />
          )}

          {currentPage === 'privacy' && (
            <PrivacyDataView
              account={account}
              onUpdateAccount={(up) => setAccount((acc) => ({ ...acc, ...up }))}
              lang={lang}
            />
          )}

          {currentPage === 'help' && (
            <HelpSupportView lang={lang} />
          )}

        </main>
      </div>

      {/* Floating Android Child Companion Phone Simulator */}
      {simulatorOpen && (
        <CompanionPhoneSimulator
          device={selectedDevice}
          onUpdateDevice={handleUpdateDevice}
          onSyncOfflineEvents={handleSyncOfflineEvents}
          activeScreenShare={activeScreenShare}
          onApproveScreenShare={handleApproveScreenShareFromCompanion}
          onDenyScreenShare={handleDenyScreenShareFromCompanion}
          onStopScreenShare={handleStopScreenShareFromCompanion}
          onPairNewDeviceSuccess={handleAddNewDevice}
          onClose={() => setSimulatorOpen(false)}
          lang={lang}
          onTriggerNotification={handleSimulateNotification}
        />
      )}

      {/* Comprehensive Parent & Child Device Onboarding Wizard */}
      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={() => {
          localStorage.setItem('safeweb_onboarded_v2', 'true');
          setOnboardingOpen(false);
        }}
        account={account}
        currentDeviceCount={devices.length}
        onCompleteOnboarding={(newDev) => {
          localStorage.setItem('safeweb_onboarded_v2', 'true');
          handleAddNewDevice(newDev);
          setOnboardingOpen(false);
        }}
        lang={lang}
      />

      {/* Floating Real-Time Toast Notifications */}
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
        onActionClick={handleNotificationActionClick}
      />

      {/* Full Notification Center Drawer */}
      <NotificationCenter
        isOpen={notificationCenterOpen}
        onClose={() => setNotificationCenterOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onDeleteNotification={handleDeleteNotification}
        onClearAll={handleClearAllNotifications}
        onActionClick={handleNotificationActionClick}
        onSimulateEvent={handleSimulateNotification}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        lang={lang}
      />

    </div>
  );
}
