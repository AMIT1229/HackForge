import { Eye, EyeOff } from 'lucide-react';
import { useLeaderboard, usePublishLeaderboard } from '@/api/hooks';
import { ACTIVE_EVENT_ID } from '@/lib/config';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LiveLeaderboard } from '@/features/leaderboard/LiveLeaderboard';

/** Leaderboard control: publish or unpublish results for participants. */
export function LeaderboardControlPanel() {
  const { data } = useLeaderboard(ACTIVE_EVENT_ID);
  const publish = usePublishLeaderboard(ACTIVE_EVENT_ID);
  const published = data?.[0]?.published ?? false;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                published ? 'bg-success/15 text-success' : 'bg-surface-2 text-muted'
              }`}
            >
              {published ? <Eye className="h-5 w-5" aria-hidden /> : <EyeOff className="h-5 w-5" aria-hidden />}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">Results visibility</p>
                <Badge tone={published ? 'success' : 'neutral'}>
                  {published ? 'Published' : 'Hidden'}
                </Badge>
              </div>
              <p className="mt-0.5 text-sm text-muted">
                {published
                  ? 'Participants and the public can see the live leaderboard.'
                  : 'The leaderboard is hidden from participants until you publish.'}
              </p>
            </div>
          </div>
          <Button
            variant={published ? 'outline' : 'primary'}
            loading={publish.isPending}
            onClick={() => publish.mutate(!published)}
          >
            {published ? 'Unpublish results' : 'Publish results'}
          </Button>
        </CardContent>
      </Card>

      <LiveLeaderboard eventId={ACTIVE_EVENT_ID} title="Full leaderboard" />
    </div>
  );
}
