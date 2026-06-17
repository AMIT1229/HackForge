import { apiClient } from './client';
import type {
  Announcement,
  AnnouncementPriority,
  HackathonEvent,
  JudgeAssignment,
  LeaderboardEntry,
  OrganizerStats,
  Paginated,
  ParticipantRow,
  RegistrationPayload,
  RegistrationResult,
  Review,
  RubricScore,
  Submission,
  Team,
  User,
  UserRole,
} from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Service layer: one function per endpoint. UI components never construct URLs
// or know about query params — they call these typed functions instead.
// ─────────────────────────────────────────────────────────────────────────────

export const authService = {
  me: (role: UserRole) => apiClient.get<User>(`/me?role=${role}`),
};

export interface EventFilters {
  status?: string;
  track?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface Recommendation {
  event: HackathonEvent;
  reason: string;
}

export const eventService = {
  list: (filters: EventFilters) => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.track) params.set('track', filters.track);
    if (filters.search) params.set('search', filters.search);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    params.set('page', String(filters.page ?? 1));
    params.set('pageSize', String(filters.pageSize ?? 6));
    return apiClient.get<Paginated<HackathonEvent>>(`/events?${params.toString()}`);
  },
  bySlug: (slug: string) => apiClient.get<HackathonEvent>(`/events/${slug}`),
  recommendations: (interests: string[]) =>
    apiClient.get<Recommendation[]>(`/recommendations?interests=${interests.join(',')}`),
};

export const registrationService = {
  checkEmail: (eventId: string, email: string) =>
    apiClient.get<{ registered: boolean }>(
      `/events/${eventId}/registration-status?email=${encodeURIComponent(email)}`,
    ),
  register: (payload: RegistrationPayload) =>
    apiClient.post<RegistrationResult>('/registrations', payload),
};

export const teamService = {
  get: (teamId: string) => apiClient.get<Team>(`/teams/${teamId}`),
  submission: (teamId: string) => apiClient.get<Submission>(`/teams/${teamId}/submission`),
};

export interface SubmissionPatch extends Partial<Submission> {
  finalize?: boolean;
}

export const submissionService = {
  create: (teamId: string, patch: SubmissionPatch) =>
    apiClient.post<Submission>(`/teams/${teamId}/submission`, patch),
  save: (id: string, patch: SubmissionPatch) =>
    apiClient.put<Submission>(`/submissions/${id}`, patch),
};

export const announcementService = {
  list: (eventId: string) => apiClient.get<Announcement[]>(`/events/${eventId}/announcements`),
  create: (eventId: string, data: { title: string; body: string; priority: AnnouncementPriority }) =>
    apiClient.post<Announcement>(`/events/${eventId}/announcements`, data),
};

export const leaderboardService = {
  get: (eventId: string) => apiClient.get<LeaderboardEntry[]>(`/events/${eventId}/leaderboard`),
  publish: (eventId: string, published: boolean) =>
    apiClient.post<{ published: boolean }>(`/events/${eventId}/leaderboard/publish`, { published }),
};

export const judgeService = {
  assignments: (judgeId: string) =>
    apiClient.get<JudgeAssignment[]>(`/judge/${judgeId}/assignments`),
  submitReview: (
    judgeId: string,
    data: { submissionId: string; scores: RubricScore; comments: string },
  ) => apiClient.post<Review>(`/judge/${judgeId}/reviews`, data),
};

export type SubmissionRow = Submission & { teamName: string };

export interface JudgeAssignmentRow {
  judgeId: string;
  judgeName: string;
  trackId: string;
  trackName: string;
  assigned: boolean;
}

export const organizerService = {
  stats: (eventId: string) => apiClient.get<OrganizerStats>(`/events/${eventId}/stats`),
  participants: (eventId: string, opts: { search?: string; page?: number; pageSize?: number }) => {
    const params = new URLSearchParams();
    if (opts.search) params.set('search', opts.search);
    params.set('page', String(opts.page ?? 1));
    params.set('pageSize', String(opts.pageSize ?? 10));
    return apiClient.get<Paginated<ParticipantRow>>(
      `/events/${eventId}/participants?${params.toString()}`,
    );
  },
  submissions: (eventId: string) =>
    apiClient.get<SubmissionRow[]>(`/events/${eventId}/submissions`),
  judges: (eventId: string) => apiClient.get<JudgeAssignmentRow[]>(`/events/${eventId}/judges`),
};
