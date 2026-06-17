// Demo configuration. In a real deployment these would come from the route/event
// context or environment; for the assignment we anchor the "live" experience to
// the currently-active event so dashboards have rich data to show.
export const ACTIVE_EVENT_ID = 'evt-forge';
export const ACTIVE_EVENT_SLUG = 'hackforge-2026';

/** How often the live leaderboard re-fetches during judging (ms). */
export const LEADERBOARD_REFETCH_MS = 4000;

/** How often we poll announcements to simulate a realtime feed (ms). */
export const ANNOUNCEMENT_POLL_MS = 8000;

/** The signed-in judge persona used by the judge dashboard demo. */
export const JUDGE_ID = 'usr-judge';
