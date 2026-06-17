import { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import type { JudgeAssignment, RubricScore } from '@/types';
import { Textarea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const CRITERIA: { key: keyof RubricScore; label: string; help: string }[] = [
  { key: 'innovation', label: 'Innovation', help: 'Originality and creativity of the idea.' },
  { key: 'technical', label: 'Technical Execution', help: 'Engineering quality and complexity.' },
  { key: 'impact', label: 'Impact', help: 'Real-world usefulness and potential.' },
  { key: 'presentation', label: 'Presentation', help: 'Clarity of demo, pitch and docs.' },
];

const emptyScores: RubricScore = { innovation: 5, technical: 5, impact: 5, presentation: 5 };

interface ScoringPanelProps {
  assignment: JudgeAssignment;
  isSaving: boolean;
  onSubmit: (data: { scores: RubricScore; comments: string }) => void;
}

/** Rubric scoring form (1–10 per criterion) with a confirmation step. */
export function ScoringPanel({ assignment, isSaving, onSubmit }: ScoringPanelProps) {
  const existing = assignment.review;
  const [scores, setScores] = useState<RubricScore>(existing?.scores ?? emptyScores);
  const [comments, setComments] = useState(existing?.comments ?? '');
  const [confirming, setConfirming] = useState(false);

  // Reset the form whenever a different project is selected.
  useEffect(() => {
    setScores(assignment.review?.scores ?? emptyScores);
    setComments(assignment.review?.comments ?? '');
    setConfirming(false);
  }, [assignment.submission.id, assignment.review]);

  const total = scores.innovation + scores.technical + scores.impact + scores.presentation;

  return (
    <div className="space-y-5">
      {CRITERIA.map((c) => (
        <div key={c.key}>
          <div className="flex items-center justify-between">
            <label htmlFor={`score-${c.key}`} className="text-sm font-medium">
              {c.label}
            </label>
            <span className="font-mono text-sm font-semibold tabular-nums text-brand">
              {scores[c.key]}/10
            </span>
          </div>
          <p className="text-xs text-muted">{c.help}</p>
          <input
            id={`score-${c.key}`}
            type="range"
            min={1}
            max={10}
            step={1}
            value={scores[c.key]}
            onChange={(e) => setScores((s) => ({ ...s, [c.key]: Number(e.target.value) }))}
            className="mt-2 w-full accent-[rgb(var(--brand))]"
            aria-valuetext={`${scores[c.key]} out of 10`}
          />
        </div>
      ))}

      <div>
        <label htmlFor="judge-comments" className="text-sm font-medium">
          Comments & notes
        </label>
        <Textarea
          id="judge-comments"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={4}
          className="mt-1.5"
          placeholder="Share specific, constructive feedback for this team…"
        />
      </div>

      <div className="flex items-center justify-between rounded-lg bg-surface-2 p-3">
        <span className="text-sm text-muted">Total score</span>
        <span className="font-mono text-lg font-bold tabular-nums">{total}/40</span>
      </div>

      {confirming ? (
        <div className={cn('rounded-lg border border-brand/40 bg-brand-subtle/40 p-4')}>
          <p className="text-sm font-medium">
            Submit a score of {total}/40 for {assignment.team.name}?
          </p>
          <p className="mt-1 text-xs text-muted">You can revise it later if needed.</p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" loading={isSaving} onClick={() => onSubmit({ scores, comments })}>
              Confirm submit
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button className="w-full" onClick={() => setConfirming(true)}>
          <Send className="h-4 w-4" aria-hidden />
          {existing ? 'Update score' : 'Submit score'}
        </Button>
      )}
    </div>
  );
}
