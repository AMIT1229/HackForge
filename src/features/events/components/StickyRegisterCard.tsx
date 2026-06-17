import { Users, Calendar, Clock } from 'lucide-react';
import type { HackathonEvent } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { StatusBadge } from '@/components/ui/Badge';
import { CountdownTimer } from '@/components/common/CountdownTimer';
import { formatCompact, formatDate } from '@/lib/utils';

/** Sticky registration panel: countdown, live participant count, team limits
 *  and the primary register CTA. Disabled once the event is closed. */
export function StickyRegisterCard({ event }: { event: HackathonEvent }) {
  const closed = event.status === 'closed';
  const countdownTarget =
    event.status === 'upcoming' ? event.registrationClosesAt : event.submissionDeadline;
  const countdownLabel =
    event.status === 'upcoming' ? 'Registration closes in' : 'Submission closes in';

  return (
    <Card className="lg:sticky lg:top-20">
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between">
          <StatusBadge status={event.status} />
          <span className="flex items-center gap-1.5 text-sm text-muted">
            <span
              className="h-2 w-2 animate-pulse rounded-full bg-success"
              aria-hidden
            />
            <Users className="h-4 w-4" aria-hidden />
            <span className="font-semibold text-fg">{formatCompact(event.participantCount)}</span>
            registered
          </span>
        </div>

        {!closed && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
              {countdownLabel}
            </p>
            <CountdownTimer target={countdownTarget} />
          </div>
        )}

        <dl className="space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex items-center justify-between">
            <dt className="flex items-center gap-2 text-muted">
              <Calendar className="h-4 w-4" aria-hidden /> Event dates
            </dt>
            <dd className="font-medium">
              {formatDate(event.startsAt)} – {formatDate(event.resultsAt)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="flex items-center gap-2 text-muted">
              <Clock className="h-4 w-4" aria-hidden /> Registration closes
            </dt>
            <dd className="font-medium">{formatDate(event.registrationClosesAt)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="flex items-center gap-2 text-muted">
              <Users className="h-4 w-4" aria-hidden /> Team size
            </dt>
            <dd className="font-medium">
              {event.teamSizeMin}–{event.teamSizeMax} members
            </dd>
          </div>
        </dl>

        {closed ? (
          <div className="rounded-lg bg-surface-2 p-3 text-center text-sm text-muted">
            Registration for this event has closed.
          </div>
        ) : (
          <ButtonLink to={`/events/${event.slug}/register`} size="lg" className="w-full">
            Register now
          </ButtonLink>
        )}
      </CardContent>
    </Card>
  );
}
