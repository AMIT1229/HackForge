import { LayoutDashboard, Send } from 'lucide-react';
import type { DashboardNavItem } from '@/components/layout/DashboardLayout';

/** Sidebar items shared by the participant's dashboard pages. */
export const participantNav: DashboardNavItem[] = [
  { to: '/dashboard', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" />, end: true },
  { to: '/dashboard/submit', label: 'Submit Project', icon: <Send className="h-4 w-4" /> },
];
