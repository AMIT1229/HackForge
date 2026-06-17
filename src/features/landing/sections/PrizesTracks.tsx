import { Trophy, Medal, Award } from 'lucide-react';
import type { HackathonEvent } from '@/types';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const placeIcon = [Trophy, Medal, Award];

export function PrizesTracks({ event }: { event: HackathonEvent }) {
  return (
    <section className="container-page py-16 sm:py-24" aria-labelledby="prizes-heading">
      <SectionHeading
        eyebrow="Prizes & Tracks"
        title="What you're building for"
        description="Choose a track that fits your idea. Every track has dedicated prizes on top of the grand prize."
      >
        <span id="prizes-heading" className="sr-only">
          Prizes and tracks
        </span>
      </SectionHeading>

      {/* Prizes — visual hierarchy: grand prize is emphasized first. */}
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {event.prizes.map((prize, i) => {
          const Icon = placeIcon[i] ?? Award;
          const isTop = i === 0;
          return (
            <Card
              key={prize.id}
              className={isTop ? 'ring-2 ring-brand md:col-span-2 lg:col-span-1' : ''}
            >
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      isTop ? 'bg-brand text-brand-fg' : 'bg-surface-2 text-brand'
                    }`}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  {prize.trackId && (
                    <Badge tone="brand">
                      {event.tracks.find((t) => t.id === prize.trackId)?.tag ?? 'Track'}
                    </Badge>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted">{prize.place}</p>
                  <p className="text-2xl font-bold">{prize.amount}</p>
                </div>
                <ul className="space-y-1 text-sm text-muted">
                  {prize.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-brand" aria-hidden />
                      {perk}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tracks */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {event.tracks.map((track) => (
          <Card key={track.id} className="bg-surface-2">
            <CardContent className="space-y-2">
              <Badge tone="brand">{track.tag}</Badge>
              <h3 className="font-semibold">{track.name}</h3>
              <p className="text-sm text-muted">{track.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
