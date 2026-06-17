import { useEffect, useRef } from 'react';
import { useAnnouncements, useLeaderboard } from '@/api/hooks';
import { useNotificationStore } from '@/store/notificationStore';
import { ACTIVE_EVENT_ID, ANNOUNCEMENT_POLL_MS, LEADERBOARD_REFETCH_MS } from '@/lib/config';

/**
 * Realtime notification engine (bonus feature).
 *
 * In production this would be a single SSE/WebSocket subscription. Here we
 * simulate server push by polling the announcements endpoint and fanning new
 * items into the notification store, plus emitting "score update" alerts driven
 * by real rank movement on the live leaderboard. The store de-dupes by id, so
 * re-renders and refreshes never produce duplicate notifications.
 */
export function useRealtimeNotifications() {
  const add = useNotificationStore((s) => s.add);
  const seenAnnouncements = useRef<Set<string>>(new Set());
  const initialized = useRef(false);

  const { data: announcements } = useAnnouncements(ACTIVE_EVENT_ID, {
    refetchInterval: ANNOUNCEMENT_POLL_MS,
  });

  // Fan announcements into notifications (skipping the initial backlog so we
  // don't toast a burst of historical items on first load).
  useEffect(() => {
    if (!announcements) return;
    if (!initialized.current) {
      announcements.forEach((a) => seenAnnouncements.current.add(a.id));
      initialized.current = true;
      return;
    }
    announcements.forEach((a) => {
      if (seenAnnouncements.current.has(a.id)) return;
      seenAnnouncements.current.add(a.id);
      add({
        id: `ann-${a.id}`,
        kind: 'announcement',
        level: a.priority === 'urgent' ? 'urgent' : 'info',
        title: a.title,
        body: a.body,
      });
    });
  }, [announcements, add]);

  // Emit score-update notifications from REAL leaderboard movement: poll the
  // same leaderboard the UI shows, compare each tick to the last, and toast the
  // biggest upward mover. Throttled so a busy board doesn't spam the user.
  const { data: leaderboard } = useLeaderboard(ACTIVE_EVENT_ID, {
    refetchInterval: LEADERBOARD_REFETCH_MS,
  });
  const prevRanks = useRef<Map<string, number>>(new Map());
  const lastNotifiedAt = useRef(0);

  useEffect(() => {
    if (!leaderboard) return;

    // First tick just records a baseline — no notification.
    if (prevRanks.current.size === 0) {
      prevRanks.current = new Map(leaderboard.map((e) => [e.teamId, e.rank]));
      return;
    }

    // Find the team that climbed the most places since the previous tick.
    let topMover: { name: string; from: number; to: number; gain: number } | null = null;
    for (const entry of leaderboard) {
      const prev = prevRanks.current.get(entry.teamId);
      if (prev === undefined) continue;
      const gain = prev - entry.rank; // positive = moved up
      if (gain > 0 && (!topMover || gain > topMover.gain)) {
        topMover = { name: entry.teamName, from: prev, to: entry.rank, gain };
      }
    }
    prevRanks.current = new Map(leaderboard.map((e) => [e.teamId, e.rank]));

    // Throttle: at most one score toast every 12s.
    const now = Date.now();
    if (topMover && now - lastNotifiedAt.current > 12_000) {
      lastNotifiedAt.current = now;
      add({
        kind: 'score',
        level: 'success',
        title: 'Leaderboard update',
        body: `${topMover.name} moved up to #${topMover.to} (${topMover.gain > 1 ? `+${topMover.gain} places` : '+1 place'}).`,
      });
    }
  }, [leaderboard, add]);
}
