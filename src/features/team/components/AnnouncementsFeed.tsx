import { Megaphone, AlertTriangle } from 'lucide-react';
import type { Announcement } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/States';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/utils';

interface AnnouncementsFeedProps {
  announcements?: Announcement[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  compact?: boolean;
}

/** Reverse-chronological announcement feed with urgent items emphasized. */
export function AnnouncementsFeed({
  announcements,
  isLoading,
  isError,
  onRetry,
  compact,
}: AnnouncementsFeedProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Megaphone className="h-4 w-4 text-brand" aria-hidden />
          Announcements
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState message="Couldn't load announcements." onRetry={onRetry} />
        ) : !announcements || announcements.length === 0 ? (
          <EmptyState title="No announcements yet" message="Updates from organizers will appear here." />
        ) : (
          <ul className="space-y-3">
            {(compact ? announcements.slice(0, 4) : announcements).map((a) => (
              <li
                key={a.id}
                className={`rounded-lg border p-3 ${
                  a.priority === 'urgent' ? 'border-danger/40 bg-danger/5' : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="flex items-center gap-1.5 font-medium">
                    {a.priority === 'urgent' && (
                      <AlertTriangle className="h-4 w-4 text-danger" aria-hidden />
                    )}
                    {a.title}
                  </p>
                  {a.priority === 'urgent' && <Badge tone="danger">Urgent</Badge>}
                </div>
                <p className="mt-1 text-sm text-muted">{a.body}</p>
                <time className="mt-1.5 block text-xs text-muted" dateTime={a.createdAt}>
                  {formatDateTime(a.createdAt)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
