import { Users, UsersRound, FileCheck2, Gavel } from 'lucide-react';
import { useAnnouncements, useOrganizerStats } from '@/api/hooks';
import { ACTIVE_EVENT_ID } from '@/lib/config';
import { formatCompact } from '@/lib/utils';
import { LiveLeaderboard } from '@/features/leaderboard/LiveLeaderboard';
import { AnnouncementsFeed } from '@/features/team/components/AnnouncementsFeed';
import { StatCard } from '../components/StatCard';

/** Organizer overview: live KPIs, leaderboard snapshot and recent announcements. */
export function OverviewPanel() {
  const stats = useOrganizerStats(ACTIVE_EVENT_ID);
  const announcements = useAnnouncements(ACTIVE_EVENT_ID);
  const s = stats.data;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total registrations"
          value={s ? formatCompact(s.totalRegistrations) : '—'}
          trend={s?.registrationsTrend}
          loading={stats.isLoading}
          icon={<Users className="h-5 w-5" aria-hidden />}
        />
        <StatCard
          label="Teams formed"
          value={s ? formatCompact(s.teamsFormed) : '—'}
          loading={stats.isLoading}
          icon={<UsersRound className="h-5 w-5" aria-hidden />}
        />
        <StatCard
          label="Submissions received"
          value={s ? formatCompact(s.submissionsReceived) : '—'}
          trend={s?.submissionsTrend}
          loading={stats.isLoading}
          icon={<FileCheck2 className="h-5 w-5" aria-hidden />}
        />
        <StatCard
          label="Judges active"
          value={s ? s.judgesActive : '—'}
          loading={stats.isLoading}
          icon={<Gavel className="h-5 w-5" aria-hidden />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <LiveLeaderboard eventId={ACTIVE_EVENT_ID} limit={6} title="Leaderboard snapshot" />
        <AnnouncementsFeed
          announcements={announcements.data}
          isLoading={announcements.isLoading}
          isError={announcements.isError}
          onRetry={announcements.refetch}
          compact
        />
      </div>
    </div>
  );
}
