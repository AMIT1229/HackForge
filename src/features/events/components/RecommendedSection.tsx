import { Sparkles } from 'lucide-react';
import { useMe, useRecommendations } from '@/api/hooks';
import { useSessionStore } from '@/store/sessionStore';
import { EventCard } from './EventCard';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

/**
 * AI-powered "Recommended for you" (bonus).
 *
 * Recommendation logic: we take the signed-in user's interest tags (derived
 * from their profile / past activity) and score every open event by the number
 * of track tags that overlap. Events are ranked by overlap count and the top
 * three are surfaced, each with a human-readable reason. This is a transparent,
 * explainable content-based filter — no opaque model — which is the right fit
 * for a cold-start catalog of this size.
 */
export function RecommendedSection() {
  const role = useSessionStore((s) => s.role);
  const { data: me } = useMe(role);
  const interests = me?.interests ?? [];
  const { data: recommendations, isLoading } = useRecommendations(interests);

  if (role === 'public' || interests.length === 0) return null;
  if (isLoading || !recommendations || recommendations.length === 0) return null;

  return (
    <section aria-labelledby="rec-heading" className="mb-10">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-subtle text-brand">
          <Sparkles className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <h2 id="rec-heading" className="font-semibold">
            Recommended for you
          </h2>
          <p className="text-xs text-muted">
            Based on your interest in {interests.join(', ')}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((rec) => (
          <div key={rec.event.id} className="relative">
            <EventCard event={rec.event} />
            <Card className="mt-2 border-brand/30 bg-brand-subtle/40">
              <CardContent className="flex items-center gap-2 p-3">
                <Badge tone="brand">
                  <Sparkles className="h-3 w-3" aria-hidden /> Why
                </Badge>
                <p className="text-xs text-fg">{rec.reason}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
}
