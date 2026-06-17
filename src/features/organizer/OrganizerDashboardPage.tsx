import { Routes, Route, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, Megaphone, FileCheck2, Trophy, Gavel } from 'lucide-react';
import { DashboardLayout, type DashboardNavItem } from '@/components/layout/DashboardLayout';
import { OverviewPanel } from './panels/OverviewPanel';
import { RegistrationsPanel } from './panels/RegistrationsPanel';
import { AnnouncementsPanel } from './panels/AnnouncementsPanel';
import { SubmissionsPanel } from './panels/SubmissionsPanel';
import { LeaderboardControlPanel } from './panels/LeaderboardControlPanel';
import { JudgeAssignmentPanel } from './panels/JudgeAssignmentPanel';

const organizerNav: DashboardNavItem[] = [
  { to: '/organizer', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" />, end: true },
  { to: '/organizer/registrations', label: 'Registrations', icon: <Users className="h-4 w-4" /> },
  { to: '/organizer/announcements', label: 'Announcements', icon: <Megaphone className="h-4 w-4" /> },
  { to: '/organizer/submissions', label: 'Submissions', icon: <FileCheck2 className="h-4 w-4" /> },
  { to: '/organizer/leaderboard', label: 'Leaderboard', icon: <Trophy className="h-4 w-4" /> },
  { to: '/organizer/judges', label: 'Judge Assignment', icon: <Gavel className="h-4 w-4" /> },
];

/** Organizer command center. Sub-views are nested routes under /organizer. */
export default function OrganizerDashboardPage() {
  return (
    <DashboardLayout
      title="Organizer Dashboard"
      subtitle="Full visibility and control over HackForge 2026"
      nav={organizerNav}
    >
      <Routes>
        <Route index element={<OverviewPanel />} />
        <Route path="registrations" element={<RegistrationsPanel />} />
        <Route path="announcements" element={<AnnouncementsPanel />} />
        <Route path="submissions" element={<SubmissionsPanel />} />
        <Route path="leaderboard" element={<LeaderboardControlPanel />} />
        <Route path="judges" element={<JudgeAssignmentPanel />} />
        <Route path="*" element={<Navigate to="/organizer" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
