import { useEffect, useState } from 'react';
import { X, Megaphone, Trophy, Clock, Info } from 'lucide-react';
import { useNotificationStore, type AppNotification, type NotificationKind } from '@/store/notificationStore';
import { cn } from '@/lib/utils';

const kindIcon: Record<NotificationKind, typeof Info> = {
  announcement: Megaphone,
  score: Trophy,
  deadline: Clock,
  system: Info,
};

const AUTO_DISMISS_MS = 6000;

interface ActiveToast extends AppNotification {
  leaving?: boolean;
}

/** Transient toast surface. Subscribes to the notification store and shows any
 *  newly-added notification once (tracked via toastedIds so refreshes don't
 *  replay old toasts). Urgent toasts persist until dismissed. */
export function Toaster() {
  const notifications = useNotificationStore((s) => s.notifications);
  const toastedIds = useNotificationStore((s) => s.toastedIds);
  const markToasted = useNotificationStore((s) => s.markToasted);
  const [toasts, setToasts] = useState<ActiveToast[]>([]);

  useEffect(() => {
    const fresh = notifications.filter((n) => !toastedIds.includes(n.id));
    if (fresh.length === 0) return;
    fresh.forEach((n) => markToasted(n.id));
    setToasts((prev) => [...fresh, ...prev].slice(0, 4));
  }, [notifications, toastedIds, markToasted]);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 200);
  };

  useEffect(() => {
    const timers = toasts
      .filter((t) => t.level !== 'urgent' && !t.leaving)
      .map((t) => window.setTimeout(() => dismiss(t.id), AUTO_DISMISS_MS));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [toasts]);

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((t) => {
        const Icon = kindIcon[t.kind];
        return (
          <div
            key={t.id}
            role={t.level === 'urgent' ? 'alert' : 'status'}
            className={cn(
              'pointer-events-auto flex gap-3 rounded-xl border bg-surface p-4 shadow-lg',
              t.leaving ? 'opacity-0 transition-opacity' : 'animate-slide-in',
              t.level === 'urgent' ? 'border-danger' : 'border-border',
            )}
          >
            <span
              className={cn(
                'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                t.level === 'urgent' && 'bg-danger/15 text-danger',
                t.level === 'success' && 'bg-success/15 text-success',
                t.level === 'info' && 'bg-brand-subtle text-brand',
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{t.title}</p>
              <p className="text-sm text-muted">{t.body}</p>
            </div>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="text-muted hover:text-fg"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
