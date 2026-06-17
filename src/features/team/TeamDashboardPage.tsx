import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAnnouncements, useSubmission, useTeam } from '@/api/hooks';
import { useSessionStore } from '@/store/sessionStore';
import { ACTIVE_EVENT_ID, ANNOUNCEMENT_POLL_MS } from '@/lib/config';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { EmptyState, LoadingState } from '@/components/ui/States';
import { LiveLeaderboard } from '@/features/leaderboard/LiveLeaderboard';
import { participantNav } from './participantNav';
import { TeamOverviewCard } from './components/TeamOverviewCard';
import { SubmissionStatusTracker } from './components/SubmissionStatusTracker';
import { AnnouncementsFeed } from './components/AnnouncementsFeed';
import { ResourceLinks } from './components/ResourceLinks';

/** Participant's central hub during the event. */
export default function TeamDashboardPage() {
  const teamId = useSessionStore((s) => s.teamId);
  const team = useTeam(teamId ?? '');
  const submission = useSubmission(teamId ?? '');
  const announcements = useAnnouncements(ACTIVE_EVENT_ID, { refetchInterval: ANNOUNCEMENT_POLL_MS });

  if (!teamId) {
    return (
      <DashboardLayout title="Team Dashboard" nav={participantNav}>
        <EmptyState
          title="You haven't registered yet"
          message="Register for an event to unlock your team dashboard."
          action={<ButtonLink to="/events">Browse events</ButtonLink>}
        />
      </DashboardLayout>
    );
  }

  if (team.isLoading) {
    return (
      <DashboardLayout title="Team Dashboard" nav={participantNav}>
        <LoadingState label="Loading your team…" />
      </DashboardLayout>
    );
  }

  // The persisted team may no longer exist (e.g. after a mock-DB reseed). Fail
  // gracefully instead of leaving the dashboard stuck or half-rendered.
  if (team.isError || !team.data) {
    return (
      <DashboardLayout title="Team Dashboard" nav={participantNav}>
        <EmptyState
          title="We couldn't find your team"
          message="Your session may have expired. Register again to set up your team dashboard."
          action={<ButtonLink to="/events">Browse events</ButtonLink>}
        />
      </DashboardLayout>
    );
  }

  const status = submission.data?.status ?? team.data?.submissionStatus ?? 'not_started';

  return (
    <DashboardLayout
      title={team.data ? team.data.name : 'Team Dashboard'}
      subtitle="Your hub for HackForge 2026"
      nav={participantNav}
      actions={
        <ButtonLink to="/dashboard/submit" size="sm">
          {status === 'submitted' ? 'View submission' : 'Continue submission'}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </ButtonLink>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Submission status</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <SubmissionStatusTracker status={status} />
              <div className="mt-5 flex items-center justify-between rounded-lg bg-surface-2 p-3 text-sm">
                <span className="text-muted">
                  {status === 'submitted'
                    ? 'Your project is locked in. You can still view it.'
                    : status === 'in_progress'
                      ? 'Draft saved. Finish and submit before the deadline.'
                      : 'You haven’t started your submission yet.'}
                </span>
                <Link to="/dashboard/submit" className="shrink-0 font-medium text-brand">
                  Open
                </Link>
              </div>
            </CardContent>
          </Card>

          {team.data && <TeamOverviewCard team={team.data} />}

          <AnnouncementsFeed
            announcements={announcements.data}
            isLoading={announcements.isLoading}
            isError={announcements.isError}
            onRetry={announcements.refetch}
          />
        </div>

        <div className="space-y-6">
          <LiveLeaderboard eventId={ACTIVE_EVENT_ID} highlightTeamId={teamId} limit={6} />
          <ResourceLinks />
        </div>
      </div>
    </DashboardLayout>
  );
}
