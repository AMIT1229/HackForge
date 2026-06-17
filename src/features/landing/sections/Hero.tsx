import { CalendarDays, MapPin, Users, Trophy } from 'lucide-react';
import type { HackathonEvent } from '@/types';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { CountdownTimer } from '@/components/common/CountdownTimer';
import { formatDate, formatCompact, formatUsd } from '@/lib/utils';

export function Hero({ event }: { event: HackathonEvent }) {
  const target =
    event.status === 'upcoming' ? event.registrationClosesAt : event.submissionDeadline;
  const countdownLabel =
    event.status === 'upcoming' ? 'Registration closes in' : 'Submission closes in';

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div
        className="absolute inset-0 -z-10 opacity-[0.18]"
        aria-hidden
        style={{
          background: `radial-gradient(60% 60% at 50% 0%, ${event.bannerColor} 0%, transparent 70%)`,
        }}
      />
      <div className="container-page flex flex-col items-center py-16 text-center sm:py-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-sm">
          <span className="h-2 w-2 animate-pulse rounded-full bg-success" aria-hidden />
          Registrations open now
        </span>
        <h1 className="mt-6 max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl">
          {event.name}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted sm:text-xl">{event.tagline}</p>

        <dl className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-brand" aria-hidden />
            <dt className="sr-only">Dates</dt>
            <dd>
              {formatDate(event.startsAt)} – {formatDate(event.resultsAt)}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand" aria-hidden />
            <dt className="sr-only">Location</dt>
            <dd>{event.location}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-brand" aria-hidden />
            <dt className="sr-only">Participants</dt>
            <dd>{formatCompact(event.participantCount)} registered</dd>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-brand" aria-hidden />
            <dt className="sr-only">Prize pool</dt>
            <dd>{formatUsd(event.prizePoolUsd)} in prizes</dd>
          </div>
        </dl>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <ButtonLink to={`/events/${event.slug}/register`} size="lg">
            Register now
          </ButtonLink>
          <ButtonLink to={`/events/${event.slug}`} variant="outline" size="lg">
            View details
          </ButtonLink>
        </div>

        <div className="mt-10 flex flex-col items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted">
            {countdownLabel}
          </span>
          <CountdownTimer target={target} />
        </div>
      </div>
    </section>
  );
}
