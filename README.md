# HackForge — BeetleX Hackathon Management Platform

A production-grade hackathon management frontend built for the BeetleX Frontend Assignment.
It covers the full lifecycle of an event: public marketing, discovery, multi-step
registration, participant project workspace, judging, and an organizer command center —
all powered by a realistic in-browser mock API.

> **Scope note:** This repository implements **Part 1 (the UI build)** of the assignment.
> The Part 2 system-design write-up is intentionally not included yet.

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (MSW mock API boots automatically)
npm run dev          # http://localhost:5173

# 3. Production build + preview
npm run build
npm run preview

# Quality gates
npm run typecheck    # tsc -b (strict, project references)
npm run lint         # eslint, zero-warning policy
npm run format       # prettier
```

Requirements: **Node 18+**. No `.env` or backend is required — the entire backend is
mocked in the browser with [MSW](https://mswjs.io/), so the app is fully interactive on
first load.

---

## What's implemented

All 8 required pages/flows plus all 4 bonus features.

| #   | Flow                | Route                    | Highlights                                                                                               |
| --- | ------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------- |
| 1   | Landing / marketing | `/`                      | Hero with live countdown, about, timeline, prizes, tracks, sponsors, FAQ accordion                       |
| 2   | Event listing       | `/events`                | Server-style filtering (status, track, search, date range), pagination, skeletons                        |
| 3   | Event details       | `/events/:slug`          | Prizes, rules, eligibility, sticky register card                                                         |
| 4   | Registration        | `/events/:slug/register` | 4-step wizard, live duplicate-email check, 409 handling, confirmation                                    |
| 5   | Team dashboard      | `/dashboard`             | Team overview, submission status tracker, announcements, resources                                       |
| 6   | Project submission  | `/dashboard/submit`      | Draft autosave, deadline countdown, PDF upload, finalize/lock                                            |
| 7   | Judge dashboard     | `/judge`                 | Assignment queue, project detail, rubric scoring (1–10 × 4 criteria)                                     |
| 8   | Organizer dashboard | `/organizer/*`           | Overview KPIs, registrations + CSV export, broadcast, submissions, leaderboard control, judge assignment |

### Bonus features (all four)

1. **Dark mode** — class-based theme with semantic CSS-variable tokens; toggle persists across sessions.
2. **Real-time notifications** — announcement polling plus score-update toasts driven by **real leaderboard rank movement** (the engine compares each poll to the previous tick and announces the biggest climber), surfaced through a bell center and transient toasts. De-duplicated and throttled so refreshes and busy periods never spam the user.
3. **AI project recommendation** — content-based recommender on the events page that scores events by interest overlap with the current user.
4. **Live leaderboard** — `/organizer/leaderboard` (and the public widget) auto-refresh on an interval with animated rank-change deltas, an unpublished state, and a degraded-data fallback. Scores are derived fresh from judge reviews on every request, so rankings can never go stale relative to the underlying data.

---

## Tech stack & why

| Concern         | Choice                             | Rationale                                                                                                                                            |
| --------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework       | **React 18 + TypeScript (strict)** | Required; strict mode + `noUnusedLocals/Parameters` catches issues at compile time.                                                                  |
| Build           | **Vite 6**                         | Fast HMR, native ESM, simple manual-chunk code splitting.                                                                                            |
| Routing         | **React Router v6**                | Lazy-loaded route components behind `Suspense`; nested routes for the organizer area.                                                                |
| Server state    | **TanStack Query v5**              | The right tool for async server cache: dedup, caching, background refetch, `keepPreviousData` pagination, and `refetchInterval` for live data.       |
| Client/UI state | **Zustand + persist**              | Tiny, hook-first store for the three genuinely-global, non-server concerns: theme, session/persona, notifications.                                   |
| Styling         | **Tailwind CSS**                   | Utility-first with a custom semantic token layer (`bg`, `fg`, `primary`, …) mapped to CSS variables so light/dark is a single class flip.            |
| Mock API        | **MSW v2**                         | Intercepts real `fetch` at the network layer — components never see mock code, and the same `apiClient` would work against a real backend unchanged. |
| Icons           | **lucide-react**                   | Consistent, tree-shakeable icon set.                                                                                                                 |

### State management split (the key decision)

The codebase deliberately separates **server state** from **client state**:

- **Server state → React Query.** Everything fetched from the API (events, teams,
  submissions, reviews, leaderboard, stats) lives in the query cache keyed by a
  centralized `queryKeys` factory. Mutations invalidate the relevant keys, so the UI
  stays consistent without manual store wiring.
- **Client state → Zustand.** Only three things are truly app-global and unrelated to
  the server: the **theme**, the **session/persona** (which role you're viewing as), and
  the **notification feed**. These are persisted to `localStorage`.

This avoids the classic anti-pattern of mirroring server data into a global store and
keeping them in sync by hand.

---

## Architecture

```
src/
├── api/
│   ├── client.ts            # fetch wrapper + typed ApiError
│   ├── services.ts          # typed endpoint functions (auth, events, teams, …)
│   ├── hooks.ts             # React Query hooks built on the services
│   ├── queryKeys.ts         # centralized, type-safe cache keys
│   └── mock/                # MSW: seed (in-memory DB), handlers, worker
├── components/
│   ├── ui/                  # primitives: Button, Card, Badge, Field, Modal, States…
│   ├── layout/              # Navbar, Footer, RootLayout, Dashboard shell, Toaster…
│   └── common/              # CountdownTimer, Pagination, StepProgress, SectionHeading
├── features/                # one folder per domain flow, each with local components/
│   ├── landing/  events/  registration/  team/
│   ├── submission/  judge/  organizer/  leaderboard/  misc/
├── hooks/                   # useRealtimeNotifications, useLiveLeaderboard, useDebouncedValue
├── lib/                     # utils, config constants, csv export
├── store/                   # Zustand stores (theme, session, notifications)
└── types/                   # all domain models in one place
```

Conventions:

- **Feature-first organization.** Each flow owns its page plus a local `components/`
  folder; shared building blocks are promoted to `components/ui` or `components/common`.
- **Components stay small** (target < 200 lines) — large pages are decomposed into
  focused subcomponents.
- **No hardcoded data in components.** All data flows through MSW → services → Query hooks.
- **Code splitting.** Every route is lazy-loaded; `react-vendor` and `query-vendor` are
  split into their own chunks (see `vite.config.ts`).

### Data flow

```
Component → React Query hook → service (apiClient.fetch) → MSW handler → in-memory DB
                ▲                                                            │
                └───────────────── typed response ───────────────────────────┘
```

---

## Accessibility

Built toward **WCAG 2.1 AA**:

- Skip-to-content link, semantic landmarks, and logical heading order.
- Keyboard-operable interactive components; the modal traps focus and closes on `Escape`.
- Visible `:focus-visible` rings on all interactive elements.
- `aria-label`/`aria-live` on dynamic regions (toasts, notification center, live leaderboard).
- Form fields wired with labels, `aria-describedby`, and `aria-invalid` error messaging.
- `prefers-reduced-motion` disables non-essential animation.
- Color tokens chosen for AA contrast in both themes.

## Responsiveness

Verified across the required range (**320px → 1440px**) using Tailwind breakpoints —
fluid grids, a collapsing mobile nav, sticky side panels that reflow to stacked layouts,
and horizontally scrollable tables on narrow screens.

---

## Mock API notes

`src/api/mock/seed.ts` builds a mutable in-memory database (6 events across active/
upcoming/closed states, users for each role, teams, submissions, reviews, announcements,
48 participants). `handlers.ts` implements REST-style endpoints with:

- realistic latency (250–700 ms),
- pagination, filtering, and search on list endpoints,
- a ~6% random failure rate on selected writes so **error and retry states are real and testable**,
- duplicate-registration `409` and submission-lock semantics.

Switch the active persona from the navbar (**Participant / Judge / Organizer**) to see
the role-specific dashboards.

---

## What I'd do with more time

An honest list of what I'd tackle next, roughly in priority order:

- **Testing:** there are currently no automated tests. I'd add unit tests for the
  recommender, the submission/registration validators, and the leaderboard rank-delta
  logic, then React Testing Library coverage of the registration wizard and Playwright
  e2e for the core flows. This is the biggest gap.
- **Real transport for live data:** swap the polling in `useLiveLeaderboard` and
  `useRealtimeNotifications` for a single SSE/WebSocket subscription. The hooks are
  already structured so only the transport layer changes.
- **Forms:** adopt React Hook Form + Zod schemas to replace the hand-rolled validators.
- **Judge assignment persistence:** the organizer's judge-to-track assignment grid is
  currently client-side optimistic; I'd add a real mutation endpoint and cache invalidation.
- **Optimistic updates** on scoring, announcements, and submission saves for snappier
  perceived performance.
- **Virtualization** for very large registration/participant tables.
- **i18n** and a richer design-token system (spacing/typography scales) for theming.

## Known limitations / tradeoffs

- The backend is fully mocked (MSW) and **resets on reload** — by assignment design.
  All data lives in an in-memory DB seeded at startup.
- **Polling, not push.** Real-time features re-fetch on an interval rather than using
  WebSockets. This is a deliberate trade-off: polling is simpler, stateless, and fine at
  this scale. The cost is a few seconds of latency and some redundant requests.
- The score "movement" on the leaderboard is **simulated** (a small time-based jitter on
  top of real review averages) so the live experience has something to show during a
  demo; in production the movement would come from judges submitting real scores.
- File "upload" validates and previews the PDF locally but does not persist bytes.
- Auth is simulated via the session/persona switcher rather than a real login.
- The judge-assignment grid's changes are not yet persisted (see "with more time").
- The mock injects a ~6% random failure rate on selected writes; this is intentional (to
  exercise error/retry UI) but means an occasional save genuinely fails and must be retried.
