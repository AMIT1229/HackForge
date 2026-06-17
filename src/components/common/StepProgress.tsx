import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepProgressProps {
  steps: string[];
  current: number; // 0-based index of the active step
}

/** Horizontal step indicator with accessible "Step X of N" labelling. */
export function StepProgress({ steps, current }: StepProgressProps) {
  return (
    <nav aria-label="Progress">
      <p className="sr-only">
        Step {current + 1} of {steps.length}: {steps[current]}
      </p>
      <ol className="flex items-center">
        {steps.map((label, i) => {
          const isComplete = i < current;
          const isActive = i === current;
          return (
            <li key={label} className={cn('flex items-center', i < steps.length - 1 && 'flex-1')}>
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                    isComplete && 'border-brand bg-brand text-brand-fg',
                    isActive && 'border-brand text-brand',
                    !isComplete && !isActive && 'border-border text-muted',
                  )}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isComplete ? <Check className="h-4 w-4" aria-hidden /> : i + 1}
                </span>
                <span
                  className={cn(
                    'hidden text-xs sm:block',
                    isActive ? 'font-medium text-fg' : 'text-muted',
                  )}
                >
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn('mx-2 h-0.5 flex-1 sm:mx-3', isComplete ? 'bg-brand' : 'bg-border')}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
