import { http, HttpResponse, delay } from 'msw';
import type {
  Announcement,
  JudgeAssignment,
  LeaderboardEntry,
  Paginated,
  ParticipantRow,
  RegistrationPayload,
  RegistrationResult,
  Review,
  Submission,
} from '@/types';
import { uid } from '@/lib/utils';
import { seedDb, type MockDb } from './seed';

const db: MockDb = seedDb();

/** Simulate realistic, slightly variable network latency. */
const latency = () => delay(250 + Math.random() * 450);

/** Occasionally fail to let the UI exercise its error states (~6%). */
const maybeFail = () => Math.random() < 0.06;

function paginate<T>(items: T[], page: number, pageSize: number): Paginated<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), page, pageSize, total, totalPages };
}

/** Derive a live leaderboard from current reviews, with deterministic jitter. */
function computeLeaderboard(eventId: string): LeaderboardEntry[] {
  const published = db.leaderboardPublished[eventId] ?? false;
  const teams = db.teams.filter((t) => t.eventId === eventId);
  const entries = teams.map((team) => {
    const subs = db.submissions.filter((s) => s.teamId === team.id);
    const reviews = db.reviews.filter((r) => subs.some((s) => s.id === r.submissionId));
    const avg =
      reviews.length === 0
        ? 0
        : reviews.reduce((sum, r) => {
            const s = r.scores;
            return sum + s.innovation + s.technical + s.impact + s.presentation;
          }, 0) / reviews.length;
    // Small time-based jitter simulates live score movement during judging.
    // Seed the phase from a stable per-team hash (not id length, which is
    // identical for every generated team) so teams oscillate out of step and
    // actually swap ranks over time.
    const phase = [...team.id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
    const jitter = Math.sin(Date.now() / 9000 + phase) * 1.5;
    const track = db.events.find((e) => e.id === eventId)?.tracks.find((t) => t.id === team.trackId);
    return {
      teamId: team.id,
      teamName: team.name,
      trackName: track?.name ?? 'General',
      rawScore: Math.max(0, avg + jitter),
    };
  });
  entries.sort((a, b) => b.rawScore - a.rawScore);
  return entries.map((e, i) => ({
    teamId: e.teamId,
    teamName: e.teamName,
    trackName: e.trackName,
    score: Math.round(e.rawScore * 10) / 10,
    rank: i + 1,
    delta: 0, 
    published,
  }));
}

const json = <T,>(data: T, init?: ResponseInit) =>
  HttpResponse.json(data as Parameters<typeof HttpResponse.json>[0], init);

export const handlers = [
  // ── Auth (mock personas) ───────────────────────────────────────────────────
  http.get('/api/me', async ({ request }) => {
    await latency();
    const role = new URL(request.url).searchParams.get('role') ?? 'participant';
    const user = db.users.find((u) => u.role === role) ?? db.users[0];
    return json(user);
  }),

  // ── Events ─────────────────────────────────────────────────────────────────
  http.get('/api/events', async ({ request }) => {
    await latency();
    if (maybeFail()) return json({ message: 'Failed to load events' }, { status: 500 });
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const track = url.searchParams.get('track');
    const search = url.searchParams.get('search')?.toLowerCase();
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '6');

    let items = [...db.events];
    if (status && status !== 'all') items = items.filter((e) => e.status === status);
    if (track && track !== 'all') items = items.filter((e) => e.tracks.some((t) => t.tag === track));
    if (search)
      items = items.filter(
        (e) => e.name.toLowerCase().includes(search) || e.tagline.toLowerCase().includes(search),
      );
    if (dateFrom) items = items.filter((e) => new Date(e.startsAt) >= new Date(dateFrom));
    if (dateTo) items = items.filter((e) => new Date(e.startsAt) <= new Date(dateTo));

    return json(paginate(items, page, pageSize));
  }),

  http.get('/api/events/:slug', async ({ params }) => {
    await latency();
    const event = db.events.find((e) => e.slug === params.slug || e.id === params.slug);
    if (!event) return json({ message: 'Event not found' }, { status: 404 });
    return json(event);
  }),

  http.get('/api/recommendations', async ({ request }) => {
    await latency();
    const interests = (new URL(request.url).searchParams.get('interests') ?? '')
      .split(',')
      .filter(Boolean);
    // Score upcoming/active events by overlap with the user's interest tags.
    const scored = db.events
      .filter((e) => e.status !== 'closed')
      .map((e) => {
        const tags = new Set(e.tracks.map((t) => t.tag));
        const overlap = interests.filter((i) => tags.has(i));
        return { event: e, overlap };
      })
      .filter((s) => s.overlap.length > 0)
      .sort((a, b) => b.overlap.length - a.overlap.length)
      .slice(0, 3)
      .map((s) => ({
        event: s.event,
        reason: `Matches your interest in ${s.overlap.join(' & ')}`,
      }));
    return json(scored);
  }),

  // ── Registration ─────────────────────────────────────────────────────────────
  http.get('/api/events/:eventId/registration-status', async ({ request, params }) => {
    await latency();
    const email = new URL(request.url).searchParams.get('email')?.toLowerCase() ?? '';
    const set = db.registeredEmails[String(params.eventId)] ?? new Set();
    return json({ registered: set.has(email) });
  }),

  http.post('/api/registrations', async ({ request }) => {
    await latency();
    const body = (await request.json()) as RegistrationPayload;
    const email = body.personal.email.toLowerCase();
    const set = (db.registeredEmails[body.eventId] ??= new Set());

    if (set.has(email)) {
      return json(
        { code: 'DUPLICATE', message: 'This email is already registered for this event.' },
        { status: 409 },
      );
    }
    set.add(email);

    const event = db.events.find((e) => e.id === body.eventId);
    const track = event?.tracks.find((t) => t.id === body.trackId) ?? event?.tracks[0];

    let team = db.teams.find(
      (t) => body.team.mode === 'join' && t.inviteCode === body.team.inviteCode,
    );
    if (!team) {
      team = {
        id: uid('team'),
        name: body.team.teamName ?? `${body.personal.name}'s Team`,
        eventId: body.eventId,
        inviteCode: `INV-${Math.floor(1000 + Math.random() * 8999)}`,
        trackId: track?.id ?? '',
        members: [
          {
            id: uid('mbr'),
            name: body.personal.name,
            email: body.personal.email,
            role: 'lead',
            avatarColor: '#6366f1',
          },
        ],
        submissionStatus: 'not_started',
      };
      db.teams.push(team);
    } else {
      team.members.push({
        id: uid('mbr'),
        name: body.personal.name,
        email: body.personal.email,
        role: 'member',
        avatarColor: '#14b8a6',
      });
    }

    if (event) event.participantCount += 1;

    const result: RegistrationResult = {
      registrationId: `HF-${Date.now().toString(36).toUpperCase()}`,
      team,
      eventId: body.eventId,
    };
    return json(result, { status: 201 });
  }),

  // ── Team & submission ────────────────────────────────────────────────────────
  http.get('/api/teams/:teamId', async ({ params }) => {
    await latency();
    const team = db.teams.find((t) => t.id === params.teamId);
    if (!team) return json({ message: 'Team not found' }, { status: 404 });
    return json(team);
  }),

  http.get('/api/teams/:teamId/submission', async ({ params }) => {
    await latency();
    const submission = db.submissions.find((s) => s.teamId === params.teamId);
    if (!submission) return json({ message: 'No submission yet' }, { status: 404 });
    return json(submission);
  }),

  http.post('/api/teams/:teamId/submission', async ({ params, request }) => {
    await latency();
    if (maybeFail()) return json({ message: 'Save failed, please retry' }, { status: 503 });
    const team = db.teams.find((t) => t.id === params.teamId);
    if (!team) return json({ message: 'Team not found' }, { status: 404 });

    const existing = db.submissions.find((s) => s.teamId === team.id);
    if (existing) return json(existing, { status: 200 });

    const patch = (await request.json()) as Partial<Submission> & { finalize?: boolean };
    const now = new Date().toISOString();
    const submission: Submission = {
      id: uid('sub'),
      teamId: team.id,
      eventId: team.eventId,
      title: patch.title ?? '',
      description: patch.description ?? '',
      techStack: patch.techStack ?? [],
      demoUrl: patch.demoUrl ?? '',
      repoUrl: patch.repoUrl ?? '',
      videoUrl: patch.videoUrl,
      deckFileName: patch.deckFileName,
      status: patch.finalize ? 'submitted' : 'in_progress',
      submittedAt: patch.finalize ? now : undefined,
      draftSavedAt: patch.finalize ? undefined : now,
    };
    db.submissions.push(submission);
    team.submissionStatus = submission.status;
    return json(submission, { status: 201 });
  }),

  http.put('/api/submissions/:id', async ({ params, request }) => {
    await latency();
    if (maybeFail()) return json({ message: 'Save failed, please retry' }, { status: 503 });
    const patch = (await request.json()) as Partial<Submission> & { finalize?: boolean };
    const submission = db.submissions.find((s) => s.id === params.id);
    if (!submission) return json({ message: 'Submission not found' }, { status: 404 });

    Object.assign(submission, {
      title: patch.title ?? submission.title,
      description: patch.description ?? submission.description,
      techStack: patch.techStack ?? submission.techStack,
      demoUrl: patch.demoUrl ?? submission.demoUrl,
      repoUrl: patch.repoUrl ?? submission.repoUrl,
      videoUrl: patch.videoUrl ?? submission.videoUrl,
      deckFileName: patch.deckFileName ?? submission.deckFileName,
    });

    if (patch.finalize) {
      submission.status = 'submitted';
      submission.submittedAt = new Date().toISOString();
    } else {
      submission.status = 'in_progress';
      submission.draftSavedAt = new Date().toISOString();
    }
    const team = db.teams.find((t) => t.id === submission.teamId);
    if (team) team.submissionStatus = submission.status;
    return json(submission);
  }),

  // ── Announcements ────────────────────────────────────────────────────────────
  http.get('/api/events/:eventId/announcements', async ({ params }) => {
    await latency();
    const items = db.announcements
      .filter((a) => a.eventId === params.eventId)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return json(items);
  }),

  http.post('/api/events/:eventId/announcements', async ({ params, request }) => {
    await latency();
    const body = (await request.json()) as Pick<Announcement, 'title' | 'body' | 'priority'>;
    const announcement: Announcement = {
      id: uid('ann'),
      eventId: String(params.eventId),
      title: body.title,
      body: body.body,
      priority: body.priority,
      createdAt: new Date().toISOString(),
    };
    db.announcements.push(announcement);
    return json(announcement, { status: 201 });
  }),

  // ── Leaderboard ──────────────────────────────────────────────────────────────
  http.get('/api/events/:eventId/leaderboard', async ({ params }) => {
    await latency();
    return json(computeLeaderboard(String(params.eventId)));
  }),

  http.post('/api/events/:eventId/leaderboard/publish', async ({ params, request }) => {
    await latency();
    const body = (await request.json()) as { published: boolean };
    db.leaderboardPublished[String(params.eventId)] = body.published;
    return json({ published: body.published });
  }),

  // ── Judge ────────────────────────────────────────────────────────────────────
  http.get('/api/judge/:judgeId/assignments', async ({ params }) => {
    await latency();
    if (maybeFail()) return json({ message: 'Failed to load queue' }, { status: 500 });
    const assignments: JudgeAssignment[] = db.submissions
      .filter((s) => s.status === 'submitted')
      .map((submission) => {
        const team = db.teams.find((t) => t.id === submission.teamId)!;
        const review =
          db.reviews.find(
            (r) => r.submissionId === submission.id && r.judgeId === params.judgeId,
          ) ?? null;
        return {
          submission,
          team: { id: team.id, name: team.name, trackId: team.trackId },
          review,
        };
      });
    return json(assignments);
  }),

  http.post('/api/judge/:judgeId/reviews', async ({ params, request }) => {
    await latency();
    const body = (await request.json()) as Omit<Review, 'id' | 'judgeId' | 'updatedAt' | 'status'>;
    const existing = db.reviews.find(
      (r) => r.submissionId === body.submissionId && r.judgeId === params.judgeId,
    );
    if (existing) {
      existing.scores = body.scores;
      existing.comments = body.comments;
      existing.status = 'completed';
      existing.updatedAt = new Date().toISOString();
      return json(existing);
    }
    const review: Review = {
      id: uid('rev'),
      judgeId: String(params.judgeId),
      submissionId: body.submissionId,
      scores: body.scores,
      comments: body.comments,
      status: 'completed',
      updatedAt: new Date().toISOString(),
    };
    db.reviews.push(review);
    return json(review, { status: 201 });
  }),

  // ── Organizer ────────────────────────────────────────────────────────────────
  http.get('/api/events/:eventId/stats', async ({ params }) => {
    await latency();
    const eventId = String(params.eventId);
    const teams = db.teams.filter((t) => t.eventId === eventId);
    const submissions = db.submissions.filter((s) => s.eventId === eventId && s.status === 'submitted');
    const event = db.events.find((e) => e.id === eventId);
    return json({
      totalRegistrations: event?.participantCount ?? 0,
      teamsFormed: teams.length,
      submissionsReceived: submissions.length,
      judgesActive: db.users.filter((u) => u.role === 'judge').length,
      registrationsTrend: 12,
      submissionsTrend: 8,
    });
  }),

  http.get('/api/events/:eventId/participants', async ({ request }) => {
    await latency();
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase();
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10');
    let items: ParticipantRow[] = [...db.participants];
    if (search)
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.email.toLowerCase().includes(search) ||
          p.organization.toLowerCase().includes(search),
      );
    return json(paginate(items, page, pageSize));
  }),

  http.get('/api/events/:eventId/submissions', async ({ params }) => {
    await latency();
    const items = db.submissions
      .filter((s) => s.eventId === params.eventId)
      .map((s) => ({
        ...s,
        teamName: db.teams.find((t) => t.id === s.teamId)?.name ?? 'Unknown',
      }));
    return json(items as (Submission & { teamName: string })[]);
  }),

  http.get('/api/events/:eventId/judges', async () => {
    await latency();
    const judges = db.users.filter((u) => u.role === 'judge');
    const tracks = db.events[0].tracks;
    return json(
      judges.flatMap((j) =>
        tracks.map((t) => ({
          judgeId: j.id,
          judgeName: j.name,
          trackId: t.id,
          trackName: t.name,
          assigned: t.id === tracks[0].id,
        })),
      ),
    );
  }),
];
