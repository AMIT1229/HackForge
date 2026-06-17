import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ScrollText, ShieldCheck, Trophy, Users2 } from 'lucide-react';
import { useEvent } from '@/api/hooks';
import { ErrorState, LoadingState } from '@/components/ui/States';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StickyRegisterCard } from './components/StickyRegisterCard';

/** Deep-dive page for a single hackathon. */
export default function EventDetailsPage() {
  const { slug = '' } = useParams();
  const { data: event, isLoading, isError, refetch } = useEvent(slug);

  if (isLoading) {
    return (
      <div className="container-page py-24">
        <LoadingState label="Loading event…" />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="container-page py-24">
        <ErrorState
          title="Event not found"
          message="This hackathon may have been removed."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="container-page py-8 lg:py-10">
      <Link
        to="/events"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> All events
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <header>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {event.tracks.map((t) => (
                <Badge key={t.id} tone="brand">
                  {t.tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{event.name}</h1>
            <p className="mt-2 text-lg text-muted">{event.tagline}</p>
          </header>

          <section aria-labelledby="desc-heading">
            <h2 id="desc-heading" className="mb-3 flex items-center gap-2 text-xl font-semibold">
              <ScrollText className="h-5 w-5 text-brand" aria-hidden /> About this event
            </h2>
            <p className="leading-relaxed text-muted">{event.description}</p>
          </section>

          <section aria-labelledby="prizes-heading">
            <h2 id="prizes-heading" className="mb-3 flex items-center gap-2 text-xl font-semibold">
              <Trophy className="h-5 w-5 text-brand" aria-hidden /> Prize breakdown
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {event.prizes.map((prize) => {
                const track = event.tracks.find((t) => t.id === prize.trackId);
                return (
                  <Card key={prize.id}>
                    <CardContent className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted">{prize.place}</p>
                        {track ? (
                          <Badge tone="brand">{track.tag}</Badge>
                        ) : (
                          <Badge tone="neutral">Overall</Badge>
                        )}
                      </div>
                      <p className="text-2xl font-bold">{prize.amount}</p>
                      <p className="text-sm text-muted">{prize.perks.join(' · ')}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="rules-heading">
            <h2 id="rules-heading" className="mb-3 flex items-center gap-2 text-xl font-semibold">
              <ShieldCheck className="h-5 w-5 text-brand" aria-hidden /> Rules
            </h2>
            <ul className="space-y-2">
              {event.rules.map((rule) => (
                <li key={rule} className="flex gap-2 text-muted">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
                  {rule}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="elig-heading">
            <h2 id="elig-heading" className="mb-3 flex items-center gap-2 text-xl font-semibold">
              <Users2 className="h-5 w-5 text-brand" aria-hidden /> Eligibility & team formation
            </h2>
            <ul className="mb-4 space-y-2">
              {event.eligibility.map((item) => (
                <li key={item} className="flex gap-2 text-muted">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <Card className="bg-surface-2">
              <CardContent className="text-sm">
                <p className="font-medium">Team formation</p>
                <p className="mt-1 text-muted">
                  Teams can have between {event.teamSizeMin} and {event.teamSizeMax} members. You can
                  register solo and use the team-matching board, create a team and invite others, or
                  join an existing team with an invite code during registration.
                </p>
              </CardContent>
            </Card>
          </section>
        </div>

        <div className="lg:col-span-1">
          <StickyRegisterCard event={event} />
        </div>
      </div>
    </div>
  );
}
