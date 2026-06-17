import type { HTMLAttributes } from 'react';
import type { EventStatus } from '@/types';
import { cn } from '@/lib/utils';

type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';

const tones: Record<Tone, string> = {
  neutral: 'bg-surface-2 text-muted',
  brand: 'bg-brand-subtle text-brand',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/15 text-danger',
  info: 'bg-info/15 text-info',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

const statusConfig: Record<EventStatus, { tone: Tone; label: string }> = {
  upcoming: { tone: 'info', label: 'Upcoming' },
  active: { tone: 'success', label: 'Active' },
  closed: { tone: 'neutral', label: 'Closed' },
};

export function StatusBadge({ status }: { status: EventStatus }) {
  const cfg = statusConfig[status];
  return (
    <Badge tone={cfg.tone}>
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          status === 'active' && 'animate-pulse bg-success',
          status === 'upcoming' && 'bg-info',
          status === 'closed' && 'bg-muted',
        )}
        aria-hidden
      />
      {cfg.label}
    </Badge>
  );
}
