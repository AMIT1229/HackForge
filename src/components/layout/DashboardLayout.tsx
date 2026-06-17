import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

export interface DashboardNavItem {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
}

interface DashboardLayoutProps {
  title: string;
  subtitle?: string;
  nav: DashboardNavItem[];
  actions?: ReactNode;
  children: ReactNode;
}

/** Two-pane dashboard shell shared by participant, judge and organizer views.
 *  Sidebar collapses to a horizontal scroller on mobile. */
export function DashboardLayout({ title, subtitle, nav, actions, children }: DashboardLayoutProps) {
  return (
    <div className="container-page w-full py-6 lg:py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="lg:w-56 lg:shrink-0">
          <nav
            aria-label="Dashboard"
            className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0"
          >
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive ? 'bg-brand text-brand-fg' : 'text-muted hover:bg-surface-2 hover:text-fg',
                  )
                }
              >
                <span className="shrink-0" aria-hidden>
                  {item.icon}
                </span>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
