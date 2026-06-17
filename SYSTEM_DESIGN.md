## Q1 — Real-Time Leaderboard

**The context:** up to 5,000 people viewing the leaderboard simultaneously during the
last hour of the judging, with judges continuously submitting scores.

### Data transfer — the technology I'd really use

Use **Server-Sent Events (SSE)**, not WebSockets, and definitely not plain old polling.

This particular problem is one-way — only the client listens for the events. SSE
matches that need perfectly. It uses a long-lived HTTP connection, it reconnects
automatically and without any effort, it works through all sorts of proxies and
corporate firewalls, and it doesn't cost nearly as much as keeping open 5,000
WebSockets. WebSockets are worth the hassle only when both the client and the
server need to exchange an endless stream (e.g. chat application or collaborative
editor). I'd use plain old polling as the **backup mechanism** when SSE isn't available.

> In my repository here, I used polling, namely setting `refetchInterval` in
> `useLeaderboard`. This time there's no actual server involved; however, the point
> was precisely to hide data transfer from components and use hooks instead.
> Replacing polling with an `EventSource` will require no changes whatsoever to
> the UI.

In order to save 5,000 connections being expensive, I will **not** calculate the board per connection.
The server calculates the sorted board when scores change, stores it in cache (for example in Redis),
and all connections simply broadcast the same snapshot from cache. Fan-out, not fan-compute.

### Scores updating out-of-order

Solution in two parts: Do not rely on order of arrival, let the data tell the story.

1. Each event carries a monotonically increasing version – either sequence
   number or server time stamp. On client side, client stores the latest version
   applied, and ignores anything older than that. Thus, if an update 42 comes
   later than 43 because of network out-of-order, then 42 update is simply
   dropped.
2. In this case, I would **send the whole sorted board**, and not deltas.
   Snapshot is an idempotent value – sending the same value again does not hurt,
   and applying a snapshot replaces any previous snapshot, and thus cannot get
   out of sync. Deltas are very delicate – lose one and you drift forever.
   The board is not very large, so pushing snapshots is affordable.

### Avoiding unnecessary re-renders

That’s exactly what my `useLiveLeaderboard` already does, in fact:

- The feed is stored in **one place** (query/cache/hook), rather than all over the
  place.
- I calculate **rank changes** (which rows went up/down) within the hook itself, and
  keep the previous-tick rank values in a **ref**, which won’t cause a re-render,
  but needs to just store values.
- The rows have their keys based on `teamId`, so React will only render rows that
  **actually change**, i.e., either the score or rank changes.
- If this isn't enough and I had to optimize further, say at 5,000 users, I would
  **coalesce** the events: queue the snapshots and render a maximum of once per
  frame, i.e., via `requestAnimationFrame`.

### Graceful degradation when the connection goes down

This is all built into the UI. The useLiveLeaderboard hook provides an `isStale`
flag and the component displays a "Reconnecting…" badge and keeps all old scores on
the screen — there’s nothing to reload at any point. The full plan of action:

1. SSE reconnects automatically with exponential backoff. During reconnect, display
   the stale badge.
2. If SSE cannot come back online within a certain timeframe, **fall back to using**
   polling of the exact same REST API endpoint.
3. Once we get reconnected, the first packet is going to be a full snapshot of the
   board, meaning that we’re always up-to-date.
4. In the worst case, where everything falls apart, we show the user their last
   correct board and explain the problem in a polite manner (`ErrorState`).

---

## Q2 — 50,000 Registrations in One Day

**The scenario:** the newsletter feature generates 50,000 sign-up attempts within 24
hours. ~35 attempts/min on average, but realistically highly spiky — several
thousands at once, immediately after getting the email.

### Protect the API from bombarding by the form

- **Use debounce on the live validation.** The check for the duplicate email happens
  after debouncing; that is, not right away but only once the user stops typing
  their email address. (This feature is available in the project via
  `useDebouncedValue`.)
- **Validation on the client-side.** The client-side ensures that all fields are
  filled properly, that the email format is correct, and other rules are applied.
  Malformed submissions will not reach the server-side.
- **Lock the submit button after the click.** It won't accept further clicks until
  the submission process completes. The button is locked with the in-flight flag,
  preventing double and triple submissions.
- **Idempotency key for each form submission attempt.** An idempotency key is an ID
  (UUID) assigned to each attempt when the form opens.

### Managing expectations during times of high load

- **Truthful, acted-out button states:** "Register" → "Submitting…" → success or error.
  No hung, indefinite state ever for buttons.
- **In case the server queues up submissions** (almost certain here), the server
  responds with `202 Accepted` and gives a ticket number. The user will see something like,
  "You've taken your place in line and we'll verify it. It may take a few minutes."
- **Waiting room for the initial burst:** A simple static page served out of the CDN
  and allowing access to users by controlled batch sizes. The API will not experience a
  rush of users but rather a constant flow of users. This is the typical approach for
  drop-ticket traffic.

### CDN and Asset Strategy

- The landing page is **fully cached** by the CDN – HTML, JavaScript, CSS,
  Images, and fonts served by the edge locations nearest to the user. This ensures
  the landing page remains fast no matter how much pressure there is on the API
  as it will be used by 50,000 users at once.
- **Code splitting** is done already – every single route is loaded lazily, and the
  vendor modules are chunked off into their own files.
- **Content Hashed Filenames**, images optimized for web usage and modern file
  formats, preloading of fonts, and `font-display: swap`
- The dynamic registration is the sole origin request made by this landing page,
  and it must be made very lightweight.

### Client behavior when a 503 is returned

- **Avoid scaring them with an error message.** It's a "we're busy, come back later" response,
  which is retryable, so show _"We're experiencing high traffic right now – retrying..."_
  and retry after **exponential backoff with jitter** (for example 1s, 2s, 4s...),
  adding jitter because otherwise all 50,000 users would be trying again at the
  same time, creating synchronized waves of requests.
- **Limit the number of retries** (maybe 3–4), and finally show them a manual _"Retry"_
  button so that they stay in control.
- **Do not erase their input,** so keep the whole form filled (draft saving, same concept as
  on submission page).

---

## Q3 — Duplicate Registration Prevention

**Scenario:** Same email, different browser session (or different tabs). The
frontend will be able to **assist** but it cannot **ensure** — thus, the contract
between the frontend and the backend becomes crucial.

### Detection on the client side (the useful first step)

This is already implemented within the app: while the user is typing their email
(debounced), the application checks the **registration status endpoint** for the
email, and if it has already been used, displays an inline notification, before the
submission actually takes place. It's only about UX, quick feedback and avoiding
pointless requests. This feature is **not** related to security whatsoever.

### Handling the API response error

Actual enforcement is done on the server side: the **unique** email field triggers
a **409 Conflict** error for any duplicate value. The frontend catches this
specific status and informs the user with a relevant message: _"This email is
already registered."_ along with a link to log in/view the existing profile
(`ApiError` entity already has a `status`, so no additional conditions required).

### Edge case: two tabs submitting simultaneously

This can’t be caught by client-side validation as both tabs validate independently
and submit. That’s why the **server should be the single source of truth**:

- Because of the unique constraint, **only one** insert will go through, while the
  other fails with `409`.
- Both submissions come with the **same idempotency key**, which in this case is a
  combination of the email address and attempt. This way, a genuine double submit
  from a single user will be treated as a single registration by the server, and the
  "loser" tab will render the success state for the record that has just been
  created.
- Alternatively, you may use `BroadcastChannel` to notify tab B about the submit
  made in tab A and, therefore, prevent another submission. However, it’s not
  necessary since there’s a guarantee on the backend side.

### Backend Response

For the frontend to react accordingly, the content of the `409` response needs to
be **designed and not just plain text**:

```json
{
  "code": "EMAIL_ALREADY_REGISTERED",
  "message": "This email is already registered for HackForge 2026.",
  "registrationId": "reg_abc123"
}
```

- The **machine-understandable `code`** should allow branching based on logic, and not
  on parsing the meaning of the message.
- The **human-understandable `message`** as an easy-to-use fallback.
- There should be **enough information** (in this case, the registration id) for
  offering to view the existing registration.

## Q4 — Notification System for Announcements

**Scenario**: Organizers notify everyone who's actively online ("deadline
extended by 30 minutes"). It must be reliable, noticeable, and non-intrusive.

### Delivery method

Same as Question 1, **SSE is the proper default**. The use case for
announcements is server-to-client broadcasting to multiple listeners, which makes SSE a
good fit. Since it reconnects automatically, any participant who momentarily goes
offline will receive their notification the next time they become active.
Currently,
it's implemented using polling to the announcements API (`useRealtimeNotifications` +
`ANNOUNCEMENT_POLL_MS`). It's the right mock equivalent and, as before, confined to
a single hook.

### Toast, Banner, or Center? All Three by Intended Purpose

I am using **all three notification types, each for its intended purpose**, as follows:

- **Notification center (bell icon):** the reliable log where the user can
  scroll down and find whatever notifications were missed.
- **Toast:** an indication of the new arrival in a temporary and non-disruptive way,
  auto-disappears after a few seconds.
- **Banner:** for **high-priority messages,** where a certain action is expected from
  the user (deadline changed), the banner will be displayed on top of the screen
  until acknowledged, because "the deadline moved" is too important even for a fade-away
  toast.

### Priority Levels for Announcements

There is an additional field, indicating priority (info/urgent/success)
in the existing code. Priority determines the type of delivery and styling:

- **Info-level announcement** is presented through a notification center entry and a
  transient toast.
- **High priority announcements** get a notification center entry, banner, and bold
  styling. They bypass all DND settings.

### Notification persistence through refresh

Yes, notifications have to survive a refresh, otherwise, someone who refreshes too late
doesn’t know about the "deadline extended." Currently, the notification store is
**already stored into `localStorage`** (using Zustand’s `persist` module). Important
two things that the application code takes care of:

- **Dedupe notifications by ID**, meaning that polling or reconnections will not cause
  duplicated notifications anymore.
- **Keep track of notifications that were toasted** (i.e., showed in a toast),
  so that, when a user refreshes, he gets the notification centered but is not
  toasted with the same thing again.

The back end side must allow the client to **retrieve recent announcements on page
load** (backlog), so that new devices and cleared local storage do get to see them;
the application code takes care of marking those notifications "seen" without showing
them in a toast (which is done inside the `initialized` guard).

### Notifications While On a Different Tab

- The combination of the persisted store and polling/SSE implies that the **background tab continues to receive and accumulate** the notifications; thus, when the user gets back to the website, the notifications badge already displays the notifications number.
- The **title bar of the document** ("(2) HackForge") should be updated along with an optional favicon change so that users can see the notifications even if not focused.
- In case the notifications were extremely important, one would utilize the Web Notification API to generate an **OS-based notification with the user's permission** and Page Visibility API to display a **toast for several seconds** until the user focuses the tab.

---

## Q5 — Scaling Project Submissions in the Final Hour

**The problem:** 800 teams submit drafts, upload project files, and submit their
projects in the last 30 minutes. The current submission page is made just for this.

### Optimistic UI design approach

- **Draft save operations are optimistic**: Once you click “Save”, the button changes
  to “Saved” and the new state shows right away, whereas the server request happens
  asynchronously in the background. Failure here gets silently retried in the
  background and reported back to users only when it cannot be recovered. Draft
  save errors should never prevent any party from moving forward.
- **Final submission is _not_ optimistic**: It's intended to be so. Submitting
  creates a “high-stakes” and “legally-binding” state that shouldn’t be announced to
  users before receiving an affirmative response from the server. Final submission
  presents a **pending / “Submitting…” state that gets changed into the locked
  “Submitted” only once a 2xx response arrives.**

### Retry policy for uploads that fail

- Use **exponential backoff + jitter**, up to **3–4 times** maximum (say, ~1s -> 2s
  -> 4s, with randomized delay), then return control to the user via an obvious "Retry"
  button. The jitter is important here too; 800 teams retrying in sync at 11:58 is a
  denial-of-service attack against themselves.
- **Retry only safe/idempotent failures** (network error, 503, 429). If you get a
  400 response saying "too large," just bail out of the whole retry loop with an
  appropriate error.
- To upload large files, I'd recommend **chunked/resumable uploads**, so a dropped
  connection right before 100% re-transmits only the last chunk, and an **idempotency
  key** in case there's a retry attempt.

### Save draft vs final submit

These are **distinct in both the UI and the API**, as the following implementation
shows:

- **UI:** two distinct buttons – a humble "Save draft" button and a bold "Submit
  project". The former only cares that there is content there, whereas full
  validation will be triggered by the latter (links required, description not too
  long, correct URL structure).
- **API:** the payload includes a **`finalize` boolean attribute**. With the value of
  `false`, a save action occurs, leaving the entry in `in_progress` state; with
  the value of `true`, validation happens on the server-side and changes its state
  to `submitted`, marking its date and **locking it down**.

### Never lose work at 11:58 PM

This is the worst scenario that’s already protected by the application:
**submission form always mirrors `localStorage` changes** as a recovery draft (thanks to
`useSubmissionForm` hook). Thus, even in case of connection failure, laptop shutdown,
or tab closure, the user will have everything on-device. After reloading the page, the
form will be **restored from local drafts** rather than stale server data; therefore,
the user can continue working from where they left off — and the next save attempt
will sync it with the server.

### Post-deadline UX

The existing interface does an excellent job at addressing the hard deadline. On one
side there is a **timer counting down** until the deadline expires; the moment it
happens, the UI changes into a **lock mode without the need to reload the
page**:

- The form gets converted into the **read-only state** by disabling the form's
  `fieldset`.
- There is also a clear **message informing about closed submissions**.
- If a team submitted before the deadline, they will be able to see a message
  telling them their submission was successfully saved ("Submitted ✓") along with a
  timestamp, while those who couldn't submit will simply face the dead-end screen.
- More importantly, even though this happens in the client-side code for better UX,
  there is also a **hard deadline server-side**, which would reject all submissions
  after the deadline expired.
