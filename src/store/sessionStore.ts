import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRole } from '@/types';

interface SessionState {
  /** The active demo persona. The platform serves four user types; switching
   *  persona changes which dashboards and nav are available. */
  role: UserRole;
  /** Team the participant persona belongs to (set after registration). */
  teamId: string | null;
  setRole: (role: UserRole) => void;
  setTeamId: (teamId: string | null) => void;
}

/** Lightweight session/auth store. In a real app this would be backed by a
 *  token + /me call; here we model personas for the assignment demo. */
export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      role: 'participant',
      teamId: 'team-quasar',
      setRole: (role) => set({ role }),
      setTeamId: (teamId) => set({ teamId }),
    }),
    { name: 'hackforge-session' },
  ),
);
