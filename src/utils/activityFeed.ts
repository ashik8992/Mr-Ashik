import { ActivityEvent, ActivityEventType } from '../types/index.ts';

export function sortActivityEventsChronological(events: ActivityEvent[]): ActivityEvent[] {
  return [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function filterActivityEvents(
  events: ActivityEvent[],
  typeFilter: 'all' | ActivityEventType = 'all',
  deviceIdFilter: string = 'all'
): ActivityEvent[] {
  return events.filter((ev) => {
    const matchesType = typeFilter === 'all' || ev.type === typeFilter;
    const matchesDevice = deviceIdFilter === 'all' || ev.deviceId === deviceIdFilter;
    return matchesType && matchesDevice;
  });
}

export function formatEventBadge(type: ActivityEventType): {
  label: string;
  badgeClass: string;
} {
  switch (type) {
    case 'app_usage':
      return {
        label: 'App Usage',
        badgeClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300',
      };
    case 'connection_change':
      return {
        label: 'Connection',
        badgeClass: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300',
      };
    case 'safety_alert':
      return {
        label: 'Safety Alert',
        badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300',
      };
    case 'permission_change':
      return {
        label: 'Permission',
        badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300',
      };
    default:
      return {
        label: 'Activity',
        badgeClass: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
      };
  }
}
