import React from 'react';
import {
  LayoutDashboard,
  Smartphone,
  Info,
  Clock,
  Layers,
  MapPin,
  History,
  Cast,
  SlidersHorizontal,
  CalendarCheck,
  BellRing,
  FileSpreadsheet,
  KeyRound,
  UserCog,
  ShieldAlert,
  HelpCircle,
  Menu,
  X,
} from 'lucide-react';
import { Language, translations } from '../i18n/translations.ts';

export type PageId =
  | 'dashboard'
  | 'myDevices'
  | 'deviceDetails'
  | 'screenTime'
  | 'appUsage'
  | 'location'
  | 'offlineHistory'
  | 'liveScreen'
  | 'appLimits'
  | 'schedules'
  | 'safetyAlerts'
  | 'reports'
  | 'permissions'
  | 'settings'
  | 'privacy'
  | 'help';

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  lang: Language;
  unreadAlertsCount: number;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  lang,
  unreadAlertsCount,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const t = translations[lang];

  const navItems: Array<{
    id: PageId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
    isNew?: boolean;
  }> = [
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'myDevices', label: t.nav.myDevices, icon: Smartphone, badge: '7/10' },
    { id: 'deviceDetails', label: t.nav.deviceDetails, icon: Info },
    { id: 'screenTime', label: t.nav.screenTime, icon: Clock },
    { id: 'appUsage', label: t.nav.appUsage, icon: Layers },
    { id: 'location', label: t.nav.location, icon: MapPin },
    {
      id: 'offlineHistory',
      label: t.nav.offlineHistory,
      icon: History,
      isNew: true,
      badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    },
    {
      id: 'liveScreen',
      label: t.nav.liveScreen,
      icon: Cast,
      isNew: true,
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    },
    { id: 'appLimits', label: t.nav.appLimits, icon: SlidersHorizontal },
    { id: 'schedules', label: t.nav.schedules, icon: CalendarCheck },
    {
      id: 'safetyAlerts',
      label: t.nav.safetyAlerts,
      icon: BellRing,
      badge: unreadAlertsCount > 0 ? unreadAlertsCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    { id: 'reports', label: t.nav.reports, icon: FileSpreadsheet },
    { id: 'permissions', label: t.nav.permissions, icon: KeyRound },
    { id: 'settings', label: t.nav.settings, icon: UserCog },
    { id: 'privacy', label: t.nav.privacy, icon: ShieldAlert },
    { id: 'help', label: t.nav.help, icon: HelpCircle },
  ];

  return (
    <>
      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {t.parentWorkspace}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectPage(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? 'text-white'
                        : 'text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {item.isNew && (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                      NEW
                    </span>
                  )}
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info in sidebar */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
          <span>Safe Web v2.0</span>
          <span className="flex items-center gap-1 text-emerald-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Sync Active
          </span>
        </div>
      </aside>
    </>
  );
};
