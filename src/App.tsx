import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';
import { LoadingState } from '@/components/ui/States';

// Route-level code splitting keeps the initial bundle small (performance).
const LandingPage = lazy(() => import('@/features/landing/LandingPage'));
const EventListingPage = lazy(() => import('@/features/events/EventListingPage'));
const EventDetailsPage = lazy(() => import('@/features/events/EventDetailsPage'));
const RegistrationPage = lazy(() => import('@/features/registration/RegistrationPage'));
const TeamDashboardPage = lazy(() => import('@/features/team/TeamDashboardPage'));
const ProjectSubmissionPage = lazy(() => import('@/features/submission/ProjectSubmissionPage'));
const JudgeDashboardPage = lazy(() => import('@/features/judge/JudgeDashboardPage'));
const OrganizerDashboardPage = lazy(() => import('@/features/organizer/OrganizerDashboardPage'));
const NotFoundPage = lazy(() => import('@/features/misc/NotFoundPage'));

function PageFallback() {
  return (
    <div className="container-page py-20">
      <LoadingState />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="events" element={<EventListingPage />} />
          <Route path="events/:slug" element={<EventDetailsPage />} />
          <Route path="events/:slug/register" element={<RegistrationPage />} />
          <Route path="dashboard" element={<TeamDashboardPage />} />
          <Route path="dashboard/submit" element={<ProjectSubmissionPage />} />
          <Route path="judge" element={<JudgeDashboardPage />} />
          <Route path="organizer/*" element={<OrganizerDashboardPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
