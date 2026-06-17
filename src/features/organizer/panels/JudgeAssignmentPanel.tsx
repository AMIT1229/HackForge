import { useEffect, useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { useEventJudges } from '@/api/hooks';
import { ACTIVE_EVENT_ID } from '@/lib/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { ErrorState, LoadingState } from '@/components/ui/States';
import { cn } from '@/lib/utils';

/** Assign judges to specific project categories (tracks). Assignment toggles
 *  are kept client-side for the demo (no persistence endpoint in the mock). */
export function JudgeAssignmentPanel() {
  const { data, isLoading, isError, refetch } = useEventJudges(ACTIVE_EVENT_ID);
  const [assignments, setAssignments] = useState<Record<string, boolean>>({});

  // Seed local assignment state from the server response.
  useEffect(() => {
    if (!data) return;
    setAssignments(
      Object.fromEntries(data.map((r) => [`${r.judgeId}:${r.trackId}`, r.assigned])),
    );
  }, [data]);

  const judges = useMemo(() => {
    if (!data) return [];
    const byJudge = new Map<string, { judgeId: string; judgeName: string; tracks: { trackId: string; trackName: string }[] }>();
    data.forEach((r) => {
      const existing = byJudge.get(r.judgeId) ?? {
        judgeId: r.judgeId,
        judgeName: r.judgeName,
        tracks: [],
      };
      existing.tracks.push({ trackId: r.trackId, trackName: r.trackName });
      byJudge.set(r.judgeId, existing);
    });
    return [...byJudge.values()];
  }, [data]);

  if (isError) return <ErrorState message="Couldn't load judges." onRetry={() => refetch()} />;
  if (isLoading) return <LoadingState label="Loading judges…" />;

  const toggle = (judgeId: string, trackId: string) => {
    const key = `${judgeId}:${trackId}`;
    setAssignments((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-4">
      {judges.map((judge) => {
        const count = judge.tracks.filter((t) => assignments[`${judge.judgeId}:${t.trackId}`]).length;
        return (
          <Card key={judge.judgeId}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2.5 text-base">
                <Avatar name={judge.judgeName} size="sm" />
                {judge.judgeName}
              </CardTitle>
              <Badge tone="brand">{count} categor{count === 1 ? 'y' : 'ies'}</Badge>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="mb-2 text-xs text-muted">Assign categories to review:</p>
              <div className="flex flex-wrap gap-2">
                {judge.tracks.map((track) => {
                  const active = assignments[`${judge.judgeId}:${track.trackId}`];
                  return (
                    <button
                      key={track.trackId}
                      onClick={() => toggle(judge.judgeId, track.trackId)}
                      aria-pressed={active}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                        active
                          ? 'border-brand bg-brand text-brand-fg'
                          : 'border-border text-muted hover:bg-surface-2',
                      )}
                    >
                      {active && <Check className="h-3.5 w-3.5" aria-hidden />}
                      {track.trackName}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
