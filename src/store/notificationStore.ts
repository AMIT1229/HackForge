import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationKind = 'announcement' | 'score' | 'deadline' | 'system';
export type NotificationLevel = 'info' | 'urgent' | 'success';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  level: NotificationLevel;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
}

interface NotificationState {
  notifications: AppNotification[];
  /** Ids already surfaced as a transient toast (so we don't re-toast on refresh). */
  toastedIds: string[];
  add: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'> & { id?: string }) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
  clear: () => void;
  markToasted: (id: string) => void;
}

/** Notification center store. Persisted so notifications survive a page refresh
 *  (a requirement called out in the assignment). */
export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      toastedIds: [],
      add: (n) => {
        const id = n.id ?? `ntf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        if (get().notifications.some((existing) => existing.id === id)) return;
        const notification: AppNotification = {
          id,
          kind: n.kind,
          level: n.level,
          title: n.title,
          body: n.body,
          createdAt: Date.now(),
          read: false,
        };
        set((s) => ({ notifications: [notification, ...s.notifications].slice(0, 50) }));
      },
      markAllRead: () =>
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      remove: (id) => set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
      clear: () => set({ notifications: [] }),
      markToasted: (id) =>
        set((s) => ({ toastedIds: [...s.toastedIds, id].slice(-100) })),
    }),
    { name: 'hackforge-notifications' },
  ),
);
