import { Trophy, ChevronUp, ChevronDown, Minus, Wifi, WifiOff, EyeOff } from 'lucide-react';
import type { LeaderboardEntry } from '@/types';
import { useLiveLeaderboard } from '@/hooks/useLiveLeaderboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ErrorState, Skeleton } from '@/components/ui/States';
import { cn } from '@/lib/utils';

function DeltaIndicator({ delta }: { delta: number }) {
  if (delta === 0)
    return (
      <span className="inline-flex items-center text-muted" aria-label="No change">
        <Minus className="h-3.5 w-3.5" aria-hidden />
      </span>
    );
  const up = delta > 0;
  return (
    <span
      className={cn('inline-flex items-center gap-0.5 text-xs font-semibold', up ? 'text-success' : 'text-danger')}
      aria-label={up ? `Up ${delta} places` : `Down ${Math.abs(delta)} places`}
    >
      {up ? <ChevronUp className="h-3.5 w-3.5" aria-hidden /> : <ChevronDown className="h-3.5 w-3.5" aria-hidden />}
      {Math.abs(delta)}
    </span>
  );
}

function Row({ entry, highlightTeamId }: { entry: LeaderboardEntry; highlightTeamId?: string }) {
  const isYou = entry.teamId === highlightTeamId;
  return (
    <li
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
        entry.delta > 0 && 'animate-rank-up',
        entry.delta < 0 && 'animate-rank-down',
        isYou && 'bg-brand-subtle/50 ring-1 ring-brand/40',
      )}
    >
      <span
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold',
          entry.rank === 1 && 'bg-amber-400/20 text-amber-500',
          entry.rank === 2 && 'bg-slate-400/20 text-slate-400',
          entry.rank === 3 && 'bg-orange-500/20 text-orange-500',
          entry.rank > 3 && 'bg-surface-2 text-muted',
        )}
      >
        {entry.rank}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {entry.teamName}
          {isYou && <span className="ml-1.5 text-xs text-brand">(you)</span>}
        </p>
        <p className="truncate text-xs text-muted">{entry.trackName}</p>
      </div>
      <DeltaIndicator delta={entry.delta} />
      <span className="w-12 text-right font-mono text-sm font-semibold tabular-nums">
        {entry.score.toFixed(1)}
      </span>
    </li>
  );
}

interface LiveLeaderboardProps {
  eventId: string;
  highlightTeamId?: string;
  limit?: number;
  title?: string;
}

/** Auto-updating leaderboard with rank-change animations and delta indicators.
 *  Degrades gracefully: shows a banner and last-known data if polling fails. */
export function LiveLeaderboard({
  eventId,
  highlightTeamId,
  limit,
  title = 'Live Leaderboard',
}: LiveLeaderboardProps) {
  const { entries, isLoading, isError, isStale, refetch } = useLiveLeaderboard(eventId);

  const visible = limit ? entries.slice(0, limit) : entries;
  const published = entries[0]?.published ?? true;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-4 w-4 text-brand" aria-hidden />
          {title}
        </CardTitle>
        <span
          className={cn('flex items-center gap-1 text-xs', isStale ? 'text-warning' : 'text-success')}
          aria-live="polite"
        >
          {isStale ? <WifiOff className="h-3.5 w-3.5" aria-hidden /> : <Wifi className="h-3.5 w-3.5" aria-hidden />}
          {isStale ? 'Reconnecting…' : 'Live'}
        </span>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: limit ?? 5 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-full" />
            ))}
          </div>
        ) : isError && entries.length === 0 ? (
          <ErrorState message="Couldn't load the leaderboard." onRetry={refetch} />
        ) : !published ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center text-muted">
            <EyeOff className="h-6 w-6" aria-hidden />
            <p className="text-sm">Results are not published yet. Check back after judging.</p>
          </div>
        ) : (
          <ol className="space-y-1">
            {visible.map((entry) => (
              <Row key={entry.teamId} entry={entry} highlightTeamId={highlightTeamId} />
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
