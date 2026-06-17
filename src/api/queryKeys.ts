// Centralized, type-safe query keys. Keeps cache invalidation consistent.
export const queryKeys = {
  me: (role: string) => ['me', role] as const,
  events: (filters: unknown) => ['events', filters] as const,
  event: (slug: string) => ['event', slug] as const,
  recommendations: (interests: string[]) => ['recommendations', interests.join(',')] as const,
  team: (teamId: string) => ['team', teamId] as const,
  submission: (teamId: string) => ['submission', teamId] as const,
  announcements: (eventId: string) => ['announcements', eventId] as const,
  leaderboard: (eventId: string) => ['leaderboard', eventId] as const,
  judgeAssignments: (judgeId: string) => ['judge-assignments', judgeId] as const,
  stats: (eventId: string) => ['stats', eventId] as const,
  participants: (eventId: string, opts: unknown) => ['participants', eventId, opts] as const,
  submissions: (eventId: string) => ['submissions', eventId] as const,
  judges: (eventId: string) => ['judges', eventId] as const,
};
