import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import {
  announcementService,
  eventService,
  judgeService,
  leaderboardService,
  organizerService,
  registrationService,
  submissionService,
  teamService,
  authService,
  type EventFilters,
  type SubmissionPatch,
} from './services';
import { queryKeys } from './queryKeys';
import type { AnnouncementPriority, RegistrationPayload, RubricScore, UserRole } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// React Query hooks. These are the *only* way UI talks to the server. They
// encapsulate caching, loading/error states, and cache invalidation.
// ─────────────────────────────────────────────────────────────────────────────

export function useMe(role: UserRole) {
  return useQuery({
    queryKey: queryKeys.me(role),
    queryFn: () => authService.me(role),
  });
}

export function useEvents(filters: EventFilters) {
  return useQuery({
    queryKey: queryKeys.events(filters),
    queryFn: () => eventService.list(filters),
    placeholderData: keepPreviousData,
  });
}

export function useEvent(slug: string) {
  return useQuery({
    queryKey: queryKeys.event(slug),
    queryFn: () => eventService.bySlug(slug),
    enabled: Boolean(slug),
  });
}

export function useRecommendations(interests: string[]) {
  return useQuery({
    queryKey: queryKeys.recommendations(interests),
    queryFn: () => eventService.recommendations(interests),
    enabled: interests.length > 0,
  });
}

export function useTeam(teamId: string) {
  return useQuery({
    queryKey: queryKeys.team(teamId),
    queryFn: () => teamService.get(teamId),
    enabled: Boolean(teamId),
  });
}

export function useSubmission(teamId: string) {
  return useQuery({
    queryKey: queryKeys.submission(teamId),
    queryFn: () => teamService.submission(teamId),
    enabled: Boolean(teamId),
  });
}

export function useAnnouncements(eventId: string, options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: queryKeys.announcements(eventId),
    queryFn: () => announcementService.list(eventId),
    enabled: Boolean(eventId),
    refetchInterval: options?.refetchInterval,
  });
}

export function useLeaderboard(eventId: string, options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: queryKeys.leaderboard(eventId),
    queryFn: () => leaderboardService.get(eventId),
    enabled: Boolean(eventId),
    refetchInterval: options?.refetchInterval,
  });
}

export function useJudgeAssignments(judgeId: string) {
  return useQuery({
    queryKey: queryKeys.judgeAssignments(judgeId),
    queryFn: () => judgeService.assignments(judgeId),
    enabled: Boolean(judgeId),
  });
}

export function useOrganizerStats(eventId: string) {
  return useQuery({
    queryKey: queryKeys.stats(eventId),
    queryFn: () => organizerService.stats(eventId),
    enabled: Boolean(eventId),
  });
}

export function useParticipants(
  eventId: string,
  opts: { search?: string; page?: number; pageSize?: number },
) {
  return useQuery({
    queryKey: queryKeys.participants(eventId, opts),
    queryFn: () => organizerService.participants(eventId, opts),
    enabled: Boolean(eventId),
    placeholderData: keepPreviousData,
  });
}

export function useEventSubmissions(eventId: string) {
  return useQuery({
    queryKey: queryKeys.submissions(eventId),
    queryFn: () => organizerService.submissions(eventId),
    enabled: Boolean(eventId),
  });
}

export function useEventJudges(eventId: string) {
  return useQuery({
    queryKey: queryKeys.judges(eventId),
    queryFn: () => organizerService.judges(eventId),
    enabled: Boolean(eventId),
  });
}

// ── Mutations ──────────────────────────────────────────────────────────────────

export function useCheckEmail() {
  return useMutation({
    mutationFn: ({ eventId, email }: { eventId: string; email: string }) =>
      registrationService.checkEmail(eventId, email),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegistrationPayload) => registrationService.register(payload),
  });
}

export function useSaveSubmission(teamId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id?: string; patch: SubmissionPatch }) =>
      id ? submissionService.save(id, patch) : submissionService.create(teamId, patch),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.submission(teamId), data);
      qc.invalidateQueries({ queryKey: queryKeys.team(teamId) });
    },
  });
}

export function useSubmitReview(judgeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { submissionId: string; scores: RubricScore; comments: string }) =>
      judgeService.submitReview(judgeId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.judgeAssignments(judgeId) });
    },
  });
}

export function useCreateAnnouncement(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; body: string; priority: AnnouncementPriority }) =>
      announcementService.create(eventId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.announcements(eventId) });
    },
  });
}

export function usePublishLeaderboard(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (published: boolean) => leaderboardService.publish(eventId, published),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.leaderboard(eventId) });
    },
  });
}
