import { useEffect, useState } from 'react';
import { getCountdown } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  target: string; // ISO
  /** Called once when the countdown crosses zero. */
  onComplete?: () => void;
  variant?: 'full' | 'compact';
  className?: string;
}

const PAD = (n: number) => String(n).padStart(2, '0');

/** Live countdown that ticks every second and announces completion. */
export function CountdownTimer({ target, onComplete, variant = 'full', className }: CountdownTimerProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const cd = getCountdown(target, now);

  useEffect(() => {
    if (cd.isPast) onComplete?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cd.isPast]);

  if (variant === 'compact') {
    return (
      <span className={cn('font-mono tabular-nums', className)} aria-live="off">
        {cd.isPast
          ? 'Closed'
          : `${cd.days}d ${PAD(cd.hours)}h ${PAD(cd.minutes)}m ${PAD(cd.seconds)}s`}
      </span>
    );
  }

  const segments = [
    { label: 'Days', value: cd.days },
    { label: 'Hours', value: cd.hours },
    { label: 'Minutes', value: cd.minutes },
    { label: 'Seconds', value: cd.seconds },
  ];

  return (
    <div
      className={cn('flex gap-2 sm:gap-3', className)}
      role="timer"
      aria-label={cd.isPast ? 'Deadline passed' : 'Time remaining'}
    >
      {segments.map((seg) => (
        <div
          key={seg.label}
          className="flex min-w-[3.5rem] flex-col items-center rounded-lg border border-border bg-surface px-2 py-2 sm:min-w-[4.5rem] sm:px-3"
        >
          <span className="font-mono text-xl font-bold tabular-nums sm:text-2xl">
            {PAD(seg.value)}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-muted sm:text-xs">
            {seg.label}
          </span>
        </div>
      ))}
    </div>
  );
}
