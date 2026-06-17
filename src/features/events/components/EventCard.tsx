import { Link } from 'react-router-dom';
import { CalendarDays, Users, ArrowRight } from 'lucide-react';
import type { HackathonEvent } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { formatDate, formatCompact } from '@/lib/utils';

export function EventCard({ event }: { event: HackathonEvent }) {
  return (
    <Card className="group relative flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <div
        className="h-2 w-full"
        style={{ backgroundColor: event.bannerColor }}
        aria-hidden
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <StatusBadge status={event.status} />
          <span className="text-xs text-muted">{event.location}</span>
        </div>

        <h3 className="mt-3 text-lg font-semibold tracking-tight">
          <Link
            to={`/events/${event.slug}`}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {event.name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{event.tagline}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {event.tracks.slice(0, 3).map((t) => (
            <Badge key={t.id} tone="neutral">
              {t.tag}
            </Badge>
          ))}
        </div>

        <dl className="mt-4 flex items-center gap-4 border-t border-border pt-4 text-sm text-muted">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" aria-hidden />
            <dt className="sr-only">Starts</dt>
            <dd>{formatDate(event.startsAt)}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" aria-hidden />
            <dt className="sr-only">Participants</dt>
            <dd>{formatCompact(event.participantCount)}</dd>
          </div>
          <ArrowRight
            className="ml-auto h-4 w-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </dl>
      </div>
    </Card>
  );
}

export function EventCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="h-2 w-full bg-surface-2" aria-hidden />
      <div className="space-y-3 p-5">
        <div className="h-5 w-20 animate-pulse rounded-full bg-surface-2" />
        <div className="h-6 w-3/4 animate-pulse rounded bg-surface-2" />
        <div className="h-4 w-full animate-pulse rounded bg-surface-2" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-surface-2" />
        <div className="flex gap-2 pt-2">
          <div className="h-5 w-12 animate-pulse rounded-full bg-surface-2" />
          <div className="h-5 w-12 animate-pulse rounded-full bg-surface-2" />
        </div>
      </div>
    </Card>
  );
}
