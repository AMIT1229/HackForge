import type {
  Announcement,
  HackathonEvent,
  ParticipantRow,
  Review,
  Submission,
  Team,
  User,
} from '@/types';
import { uid } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// In-memory mock database. Seeded once on startup and mutated by MSW handlers
// so the app behaves like a real (if ephemeral) backend across a session.
// ─────────────────────────────────────────────────────────────────────────────

const PALETTE = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444', '#0ea5e9'];
const color = (i: number) => PALETTE[i % PALETTE.length];

function daysFromNow(days: number, hour = 9): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function buildEvent(
  partial: Pick<HackathonEvent, 'id' | 'slug' | 'name' | 'tagline' | 'status' | 'bannerColor'> &
    Partial<HackathonEvent> & { offset: number },
): HackathonEvent {
  const { offset } = partial;
  const tracks = [
    { id: uid('trk'), name: 'AI & Agents', description: 'Autonomous agents, LLM tooling, RAG systems.', tag: 'AI' },
    { id: uid('trk'), name: 'Web3 & Onchain', description: 'Smart contracts, wallets, DeFi, identity.', tag: 'Web3' },
    { id: uid('trk'), name: 'Developer Tooling', description: 'SDKs, CLIs, observability, DX improvements.', tag: 'DevTools' },
    { id: uid('trk'), name: 'Open Innovation', description: 'Anything goes — surprise us.', tag: 'Open' },
  ];
  return {
    description:
      'A high-intensity build sprint where developers ship real products against the clock. ' +
      'Mentors from across the BeetleX network drop in throughout the weekend, and the best ' +
      'teams walk away with prizes, fast-track interviews, and infrastructure credits.',
    location: 'Online + Bangalore Hub',
    registrationOpensAt: daysFromNow(offset - 21),
    registrationClosesAt: daysFromNow(offset - 2),
    startsAt: daysFromNow(offset),
    submissionDeadline: daysFromNow(offset + 2, 23),
    judgingEndsAt: daysFromNow(offset + 3, 18),
    resultsAt: daysFromNow(offset + 4, 17),
    tracks,
    prizes: [
      { id: uid('prz'), place: 'Grand Prize', amount: '$15,000', perks: ['Fast-track interview', 'BeetleX residency'] },
      { id: uid('prz'), place: 'Runner Up', amount: '$7,500', perks: ['Cloud credits', 'Mentorship'] },
      { id: uid('prz'), place: 'Best AI Hack', amount: '$5,000', trackId: tracks[0].id, perks: ['GPU credits'] },
      { id: uid('prz'), place: 'Best Web3 Hack', amount: '$5,000', trackId: tracks[1].id, perks: ['Audit voucher'] },
    ],
    sponsors: [
      { id: uid('spo'), name: 'NeuralForge', tier: 'platinum' },
      { id: uid('spo'), name: 'ChainStack', tier: 'platinum' },
      { id: uid('spo'), name: 'VectorDB', tier: 'gold' },
      { id: uid('spo'), name: 'DeployHub', tier: 'gold' },
      { id: uid('spo'), name: 'EdgeNet', tier: 'silver' },
      { id: uid('spo'), name: 'PixelLabs', tier: 'silver' },
    ],
    faqs: [
      { id: uid('faq'), question: 'Who can participate?', answer: 'Any developer 18+, student or professional. Teams of 1–4.' },
      { id: uid('faq'), question: 'Does it cost anything?', answer: 'No. Participation is completely free.' },
      { id: uid('faq'), question: 'Can I join without a team?', answer: 'Yes — register solo and use our team-matching board, or form a team later.' },
      { id: uid('faq'), question: 'What can I build?', answer: 'Anything that fits a track. Pre-existing projects are not allowed — start fresh.' },
      { id: uid('faq'), question: 'Who owns the IP?', answer: 'You do. BeetleX only requests permission to showcase winning projects.' },
    ],
    timeline: [
      { id: uid('ml'), label: 'Registration Opens', date: daysFromNow(offset - 21), description: 'Sign-ups go live.' },
      { id: uid('ml'), label: 'Registration Closes', date: daysFromNow(offset - 2), description: 'Last chance to register.' },
      { id: uid('ml'), label: 'Hacking Begins', date: daysFromNow(offset), description: 'Kickoff & opening ceremony.' },
      { id: uid('ml'), label: 'Submission Deadline', date: daysFromNow(offset + 2, 23), description: 'Hard cutoff for all projects.' },
      { id: uid('ml'), label: 'Judging', date: daysFromNow(offset + 3, 18), description: 'Judges score submissions.' },
      { id: uid('ml'), label: 'Results', date: daysFromNow(offset + 4, 17), description: 'Winners announced live.' },
    ],
    rules: [
      'All code must be written during the event window.',
      'Open-source libraries and APIs are allowed and encouraged.',
      'Teams must submit before the hard deadline — no extensions.',
      'Plagiarism or reused prior projects lead to disqualification.',
      'Be respectful. Our code of conduct applies to everyone.',
    ],
    eligibility: [
      'Open to participants aged 18 and above.',
      'Students and working professionals both welcome.',
      'Team size between 1 and 4 members.',
      'One registration per person across all teams.',
    ],
    teamSizeMin: 1,
    teamSizeMax: 4,
    participantCount: 0,
    teamCount: 0,
    submissionCount: 0,
    prizePoolUsd: 32500,
    ...partial,
  };
}

export interface MockDb {
  users: User[];
  events: HackathonEvent[];
  teams: Team[];
  submissions: Submission[];
  reviews: Review[];
  announcements: Announcement[];
  participants: ParticipantRow[];
  /** Email registry per event to enforce duplicate-registration prevention. */
  registeredEmails: Record<string, Set<string>>;
  leaderboardPublished: Record<string, boolean>;
}

export function seedDb(): MockDb {
  const events: HackathonEvent[] = [
    buildEvent({ id: 'evt-forge', slug: 'hackforge-2026', name: 'HackForge 2026', tagline: 'Build the future in 48 hours.', status: 'active', bannerColor: '#6366f1', offset: -1, participantCount: 3120, teamCount: 842, submissionCount: 318 }),
    buildEvent({ id: 'evt-ai', slug: 'agentic-ai-jam', name: 'Agentic AI Jam', tagline: 'Ship autonomous agents that actually work.', status: 'upcoming', bannerColor: '#8b5cf6', offset: 14, participantCount: 1240, teamCount: 290 }),
    buildEvent({ id: 'evt-web3', slug: 'onchain-summit-hack', name: 'Onchain Summit Hack', tagline: 'Where the next protocols are born.', status: 'upcoming', bannerColor: '#14b8a6', offset: 30, participantCount: 640, teamCount: 150 }),
    buildEvent({ id: 'evt-dx', slug: 'devtools-derby', name: 'DevTools Derby', tagline: 'Make developers 10x happier.', status: 'closed', bannerColor: '#f59e0b', offset: -40, participantCount: 2200, teamCount: 560, submissionCount: 410 }),
    buildEvent({ id: 'evt-climate', slug: 'climate-code', name: 'Climate Code', tagline: 'Engineering for a livable planet.', status: 'closed', bannerColor: '#22c55e', offset: -75, participantCount: 1800, teamCount: 470, submissionCount: 380 }),
    buildEvent({ id: 'evt-fintech', slug: 'fintech-frontier', name: 'Fintech Frontier', tagline: 'Reinvent how money moves.', status: 'upcoming', bannerColor: '#ec4899', offset: 45, participantCount: 410, teamCount: 90 }),
    buildEvent({ id: 'evt-game', slug: 'game-jam-genesis', name: 'Game Jam Genesis', tagline: '48 hours to build a playable world.', status: 'upcoming', bannerColor: '#a855f7', offset: 60, participantCount: 520, teamCount: 130 }),
    buildEvent({ id: 'evt-health', slug: 'healthtech-sprint', name: 'HealthTech Sprint', tagline: 'Code that keeps people healthier.', status: 'closed', bannerColor: '#06b6d4', offset: -110, participantCount: 1500, teamCount: 380, submissionCount: 300 }),
    buildEvent({ id: 'evt-edu', slug: 'edtech-buildout', name: 'EdTech Buildout', tagline: 'Reimagine how the world learns.', status: 'closed', bannerColor: '#f97316', offset: -150, participantCount: 1100, teamCount: 270, submissionCount: 240 }),
    buildEvent({ id: 'evt-quantum', slug: 'quantum-leap-hack', name: 'Quantum Leap Hack', tagline: 'Explore the edge of computing.', status: 'upcoming', bannerColor: '#3b82f6', offset: 78, participantCount: 320, teamCount: 70 }),
  ];

  const users: User[] = [
    { id: 'usr-part', name: 'Ada Lovelace', email: 'ada@hackforge.dev', role: 'participant', avatarColor: color(0), organization: 'Analytical Engine Co.', interests: ['AI', 'DevTools'] },
    { id: 'usr-judge', name: 'Grace Hopper', email: 'grace@beetlex.io', role: 'judge', avatarColor: color(2), organization: 'BeetleX', interests: ['DevTools'] },
    { id: 'usr-org', name: 'Linus Park', email: 'linus@beetlex.io', role: 'organizer', avatarColor: color(4), organization: 'BeetleX', interests: ['Open'] },
  ];

  const active = events[0];
  const track = active.tracks[0];
  const team: Team = {
    id: 'team-quasar',
    name: 'Quasar Labs',
    eventId: active.id,
    inviteCode: 'QSR-7F3K',
    trackId: track.id,
    members: [
      { id: 'usr-part', name: 'Ada Lovelace', email: 'ada@hackforge.dev', role: 'lead', avatarColor: color(0) },
      { id: uid('mbr'), name: 'Alan Turing', email: 'alan@hackforge.dev', role: 'member', avatarColor: color(1) },
      { id: uid('mbr'), name: 'Katherine Johnson', email: 'kat@hackforge.dev', role: 'member', avatarColor: color(3) },
    ],
    submissionStatus: 'in_progress',
  };

  const submission: Submission = {
    id: 'sub-quasar',
    teamId: team.id,
    eventId: active.id,
    title: '',
    description: '',
    techStack: [],
    demoUrl: '',
    repoUrl: '',
    status: 'in_progress',
    draftSavedAt: undefined,
  };

  // Generate a pool of submissions + reviews for judge/organizer dashboards.
  const teamNames = ['Quasar Labs', 'Nimbus', 'ByteForge', 'Polylith', 'Synapse', 'Helix', 'Vertex', 'Cascade', 'Lumen', 'Orbital', 'Photon', 'Cipher'];
  const submissions: Submission[] = [submission];
  const teams: Team[] = [team];
  const reviews: Review[] = [];

  teamNames.slice(1).forEach((name, i) => {
    const t: Team = {
      id: uid('team'),
      name,
      eventId: active.id,
      inviteCode: `INV-${1000 + i}`,
      trackId: active.tracks[i % active.tracks.length].id,
      members: [
        { id: uid('mbr'), name: `${name} Lead`, email: `lead${i}@hackforge.dev`, role: 'lead', avatarColor: color(i) },
        { id: uid('mbr'), name: `${name} Dev`, email: `dev${i}@hackforge.dev`, role: 'member', avatarColor: color(i + 1) },
      ],
      submissionStatus: 'submitted',
    };
    teams.push(t);
    const sub: Submission = {
      id: uid('sub'),
      teamId: t.id,
      eventId: active.id,
      title: `${name} — ${active.tracks[i % active.tracks.length].name} project`,
      description:
        'A polished prototype that tackles a real developer pain point with a clean UX, ' +
        'a working demo, and a clear path to production.',
      techStack: ['React', 'TypeScript', 'Node', i % 2 ? 'PostgreSQL' : 'Redis'],
      demoUrl: `https://demo.hackforge.dev/${t.id}`,
      repoUrl: `https://github.com/hackforge/${t.id}`,
      videoUrl: i % 3 === 0 ? 'https://youtu.be/dQw4w9WgXcQ' : undefined,
      deckFileName: 'pitch-deck.pdf',
      status: 'submitted',
      submittedAt: daysFromNow(-1, 20),
    };
    submissions.push(sub);

    // Half the submissions already reviewed by our seed judge.
    if (i % 2 === 0) {
      reviews.push({
        id: uid('rev'),
        submissionId: sub.id,
        judgeId: 'usr-judge',
        scores: {
          innovation: 6 + ((i + 1) % 4),
          technical: 5 + ((i + 2) % 5),
          impact: 6 + (i % 4),
          presentation: 5 + ((i + 3) % 5),
        },
        comments: 'Strong technical execution. Would love to see more on the go-to-market angle.',
        status: 'completed',
        updatedAt: daysFromNow(0, 12),
      });
    }
  });

  const announcements: Announcement[] = [
    { id: uid('ann'), eventId: active.id, title: 'Welcome to HackForge 2026!', body: 'Doors are open. Head to the #help channel if you get stuck. Happy hacking!', priority: 'info', createdAt: daysFromNow(-1, 9) },
    { id: uid('ann'), eventId: active.id, title: 'Mentor office hours at 3 PM', body: 'Drop into the mentor lounge for 1:1 guidance on architecture and pitching.', priority: 'info', createdAt: daysFromNow(-1, 14) },
    { id: uid('ann'), eventId: active.id, title: 'Submission deadline reminder', body: 'You have under 48 hours left. Save drafts early and often!', priority: 'urgent', createdAt: daysFromNow(0, 10) },
  ];

  const orgs = ['MIT', 'Stanford', 'IIT Bombay', 'NUS', 'TU Munich', 'UC Berkeley', 'IISc', 'ETH Zurich'];
  const participants: ParticipantRow[] = Array.from({ length: 48 }).map((_, i) => ({
    id: uid('par'),
    name: `Participant ${i + 1}`,
    email: `participant${i + 1}@hackforge.dev`,
    organization: orgs[i % orgs.length],
    teamName: teamNames[i % teamNames.length],
    trackName: active.tracks[i % active.tracks.length].name,
    registeredAt: daysFromNow(-3 + (i % 3)),
  }));

  return {
    users,
    events,
    teams,
    submissions,
    reviews,
    announcements,
    participants,
    registeredEmails: { [active.id]: new Set(['ada@hackforge.dev']) },
    leaderboardPublished: { [active.id]: true },
  };
}
