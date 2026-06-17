import { CheckCircle2, Circle } from 'lucide-react';
import type { JudgeAssignment } from '@/types';
import { cn } from '@/lib/utils';

interface JudgeQueueProps {
  assignments: JudgeAssignment[];
  selectedId: string | null;
  onSelect: (submissionId: string) => void;
}

/** Selectable queue of assigned projects with review status. */
export function JudgeQueue({ assignments, selectedId, onSelect }: JudgeQueueProps) {
  return (
    <ul className="space-y-1.5" role="listbox" aria-label="Assigned projects">
      {assignments.map((a) => {
        const reviewed = a.review?.status === 'completed';
        const selected = a.submission.id === selectedId;
        return (
          <li key={a.submission.id} role="option" aria-selected={selected}>
            <button
              onClick={() => onSelect(a.submission.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                selected ? 'border-brand bg-brand-subtle/40' : 'border-border hover:bg-surface-2',
              )}
            >
              {reviewed ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-success" aria-hidden />
              ) : (
                <Circle className="h-5 w-5 shrink-0 text-muted" aria-hidden />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{a.team.name}</p>
                <p className="truncate text-xs text-muted">{a.submission.title}</p>
              </div>
              {reviewed && a.review && (
                <span className="font-mono text-xs font-semibold text-muted">
                  {a.review.scores.innovation +
                    a.review.scores.technical +
                    a.review.scores.impact +
                    a.review.scores.presentation}
                  /40
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
