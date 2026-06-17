import { Circle, CircleDot, CheckCircle2 } from 'lucide-react';
import type { SubmissionStatus } from '@/types';
import { cn } from '@/lib/utils';

const STAGES: { status: SubmissionStatus; label: string }[] = [
  { status: 'not_started', label: 'Not started' },
  { status: 'in_progress', label: 'In progress' },
  { status: 'submitted', label: 'Submitted' },
];

const order: Record<SubmissionStatus, number> = {
  not_started: 0,
  in_progress: 1,
  submitted: 2,
};

/** Horizontal status tracker for a team's project submission. */
export function SubmissionStatusTracker({ status }: { status: SubmissionStatus }) {
  const current = order[status];
  return (
    <ol className="flex items-center" aria-label={`Submission status: ${STAGES[current].label}`}>
      {STAGES.map((stage, i) => {
        const reached = i <= current;
        const isCurrent = i === current;
        const Icon = i < current ? CheckCircle2 : isCurrent ? CircleDot : Circle;
        return (
          <li key={stage.status} className={cn('flex items-center', i < STAGES.length - 1 && 'flex-1')}>
            <div className="flex flex-col items-center gap-1.5">
              <Icon
                className={cn('h-6 w-6', reached ? 'text-brand' : 'text-muted')}
                aria-hidden
              />
              <span className={cn('text-xs', isCurrent ? 'font-medium text-fg' : 'text-muted')}>
                {stage.label}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div className={cn('mx-2 h-0.5 flex-1', i < current ? 'bg-brand' : 'bg-border')} aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}
