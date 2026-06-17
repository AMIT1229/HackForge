import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ChevronDown, Menu, X, UserCog } from 'lucide-react';
import type { UserRole } from '@/types';
import { useSessionStore } from '@/store/sessionStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from './ThemeToggle';
import { NotificationCenter } from './NotificationCenter';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/events', label: 'Events' },
];

const ROLE_DESTINATIONS: Record<UserRole, { label: string; to: string }> = {
  participant: { label: 'Participant', to: '/dashboard' },
  judge: { label: 'Judge', to: '/judge' },
  organizer: { label: 'Organizer', to: '/organizer' },
  public: { label: 'Public', to: '/events' },
};

function RoleSwitcher() {
  const role = useSessionStore((s) => s.role);
  const setRole = useSessionStore((s) => s.setRole);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <UserCog className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">{ROLE_DESTINATIONS[role].label}</span>
        <ChevronDown className="h-3.5 w-3.5" aria-hidden />
      </Button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-52 animate-fade-in rounded-xl border border-border bg-surface p-1.5 shadow-xl"
        >
          <p className="px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-muted">
            View platform as
          </p>
          {(Object.keys(ROLE_DESTINATIONS) as UserRole[]).map((r) => (
            <button
              key={r}
              role="menuitemradio"
              aria-checked={role === r}
              onClick={() => {
                setRole(r);
                setOpen(false);
              }}
              className={cn(
                'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-2',
                role === r && 'bg-surface-2 font-medium',
              )}
            >
              {ROLE_DESTINATIONS[r].label}
              {role === r && <span className="h-2 w-2 rounded-full bg-brand" aria-hidden />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = useSessionStore((s) => s.role);

  const roleLinks =
    role === 'participant'
      ? [{ to: '/dashboard', label: 'My Dashboard' }]
      : role === 'judge'
        ? [{ to: '/judge', label: 'Judge' }]
        : role === 'organizer'
          ? [{ to: '/organizer', label: 'Organizer' }]
          : [];

  const links = [...NAV_LINKS, ...roleLinks];

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <img src="/beetle.svg" alt="" className="h-8 w-8" aria-hidden />
            <span className="text-lg">
              Hack<span className="text-brand">Forge</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={'end' in link ? (link.end as boolean) : false}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive ? 'bg-surface-2 text-fg' : 'text-muted hover:text-fg',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <RoleSwitcher />
          <NotificationCenter />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-border bg-surface md:hidden" aria-label="Mobile">
          <div className="container-page flex flex-col gap-1 py-3">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={'end' in link ? (link.end as boolean) : false}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2.5 text-sm font-medium',
                    isActive ? 'bg-surface-2 text-fg' : 'text-muted',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
