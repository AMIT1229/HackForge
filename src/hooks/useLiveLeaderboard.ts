import { useEffect, useRef, useState } from 'react';
import { useLeaderboard } from '@/api/hooks';
import { LEADERBOARD_REFETCH_MS } from '@/lib/config';
import type { LeaderboardEntry } from '@/types';

export interface LiveLeaderboardState {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  isError: boolean;
  /** True while polling but disconnected from fresh data (used for degraded UI). */
  isStale: boolean;
  refetch: () => void;
  lastUpdated: number | null;
}

/**
 * Live leaderboard hook (bonus feature).
 *
 * Polls the leaderboard endpoint and computes each team's rank delta versus the
 * previous tick, so the UI can animate rank changes and show "+2 / -1" movement
 * without a full reload. Previous ranks are kept in a ref to avoid re-renders.
 */
export function useLiveLeaderboard(eventId: string, refetchInterval = LEADERBOARD_REFETCH_MS): LiveLeaderboardState {
  const { data, isLoading, isError, refetch, dataUpdatedAt, isRefetchError } = useLeaderboard(
    eventId,
    { refetchInterval },
  );
  const prevRanks = useRef<Map<string, number>>(new Map());
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    if (!data) return;
    const withDelta = data.map((entry) => {
      const prev = prevRanks.current.get(entry.teamId);
      const delta = prev === undefined ? 0 : prev - entry.rank; // positive = moved up
      return { ...entry, delta };
    });
    prevRanks.current = new Map(data.map((e) => [e.teamId, e.rank]));
    setEntries(withDelta);
  }, [data]);

  return {
    entries,
    isLoading,
    isError,
    isStale: isRefetchError,
    refetch,
    lastUpdated: dataUpdatedAt || null,
  };
}
