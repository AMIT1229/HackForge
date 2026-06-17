// ─────────────────────────────────────────────────────────────────────────────
// Domain types — the single source of truth for the platform's data shapes.
// Kept framework-agnostic so they can be shared across API layer, stores and UI.
// ─────────────────────────────────────────────────────────────────────────────

export type UserRole = 'participant' | 'judge' | 'organizer' | 'public';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarColor: string;
  organization?: string;
  /** Track tags used by the AI recommendation engine. */
  interests: string[];
}

export type EventStatus = 'upcoming' | 'active' | 'closed';

export interface Track {
  id: string;
  name: string;
  description: string;
  /** e.g. "AI", "Web3", "DevTools" — used for filtering & recommendations. */
  tag: string;
}

export interface Prize {
  id: string;
  place: string;
  amount: string;
  trackId?: string;
  perks: string[];
}

export interface Sponsor {
  id: string;
  name: string;
  tier: 'platinum' | 'gold' | 'silver';
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface TimelineMilestone {
  id: string;
  label: string;
  date: string; // ISO
  description: string;
}

export interface HackathonEvent {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  status: EventStatus;
  bannerColor: string;
  location: string;
  registrationOpensAt: string; // ISO
  registrationClosesAt: string; // ISO
  startsAt: string; // ISO
  submissionDeadline: string; // ISO
  judgingEndsAt: string; // ISO
  resultsAt: string; // ISO
  tracks: Track[];
  prizes: Prize[];
  sponsors: Sponsor[];
  faqs: FaqItem[];
  timeline: TimelineMilestone[];
  rules: string[];
  eligibility: string[];
  teamSizeMin: number;
  teamSizeMax: number;
  participantCount: number;
  teamCount: number;
  submissionCount: number;
  prizePoolUsd: number;
}

export type SubmissionStatus = 'not_started' | 'in_progress' | 'submitted';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'lead' | 'member';
  avatarColor: string;
}

export interface Team {
  id: string;
  name: string;
  eventId: string;
  inviteCode: string;
  trackId: string;
  members: TeamMember[];
  submissionStatus: SubmissionStatus;
}

export interface Submission {
  id: string;
  teamId: string;
  eventId: string;
  title: string;
  description: string;
  techStack: string[];
  demoUrl: string;
  repoUrl: string;
  videoUrl?: string;
  deckFileName?: string;
  status: SubmissionStatus;
  draftSavedAt?: string;
  submittedAt?: string;
}

export interface RubricScore {
  innovation: number;
  technical: number;
  impact: number;
  presentation: number;
}

export type ReviewStatus = 'pending' | 'completed';

export interface Review {
  id: string;
  submissionId: string;
  judgeId: string;
  scores: RubricScore;
  comments: string;
  status: ReviewStatus;
  updatedAt: string;
}

/** A submission enriched with judge-facing review context. */
export interface JudgeAssignment {
  submission: Submission;
  team: Pick<Team, 'id' | 'name' | 'trackId'>;
  review: Review | null;
}

export type AnnouncementPriority = 'info' | 'urgent';

export interface Announcement {
  id: string;
  eventId: string;
  title: string;
  body: string;
  priority: AnnouncementPriority;
  createdAt: string;
}

export interface LeaderboardEntry {
  teamId: string;
  teamName: string;
  trackName: string;
  score: number;
  rank: number;
  /** Change in rank vs the previous tick (positive = moved up). */
  delta: number;
  published: boolean;
}

export interface RegistrationPayload {
  eventId: string;
  personal: {
    name: string;
    email: string;
    organization: string;
    role: string;
  };
  team: {
    mode: 'create' | 'join';
    teamName?: string;
    inviteCode?: string;
  };
  trackId: string;
}

export interface RegistrationResult {
  registrationId: string;
  team: Team;
  eventId: string;
}

export interface OrganizerStats {
  totalRegistrations: number;
  teamsFormed: number;
  submissionsReceived: number;
  judgesActive: number;
  registrationsTrend: number;
  submissionsTrend: number;
}

export interface ParticipantRow {
  id: string;
  name: string;
  email: string;
  organization: string;
  teamName: string;
  trackName: string;
  registeredAt: string;
}

/** Generic paginated envelope returned by list endpoints. */
export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
