import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, Trash2, Megaphone, Trophy, Clock, Info } from 'lucide-react';
import { useNotificationStore, type NotificationKind } from '@/store/notificationStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const kindIcon: Record<NotificationKind, typeof Bell> = {
  announcement: Megaphone,
  score: Trophy,
  deadline: Clock,
  system: Info,
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/** Notification center: a bell with unread count and a dropdown panel.
 *  Notifications persist across refreshes (see notificationStore). */
export function NotificationCenter() {
  const notifications = useNotificationStore((s) => s.notifications);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const remove = useNotificationStore((s) => s.remove);
  const clear = useNotificationStore((s) => s.clear);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) markAllRead();
        }}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </Button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 z-40 mt-2 w-80 animate-fade-in rounded-xl border border-border bg-surface shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="font-semibold">Notifications</p>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" aria-label="Mark all read" onClick={markAllRead}>
                <CheckCheck className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Clear all" onClick={clear}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted">You're all caught up.</p>
            ) : (
              <ul className="divide-y divide-border">
                {notifications.map((n) => {
                  const Icon = kindIcon[n.kind];
                  return (
                    <li key={n.id} className="flex gap-3 px-4 py-3">
                      <span
                        className={cn(
                          'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                          n.level === 'urgent' && 'bg-danger/15 text-danger',
                          n.level === 'success' && 'bg-success/15 text-success',
                          n.level === 'info' && 'bg-brand-subtle text-brand',
                        )}
                      >
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="text-xs text-muted">{n.body}</p>
                        <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted">
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={() => remove(n.id)}
                        aria-label="Dismiss notification"
                        className="text-muted hover:text-fg"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
