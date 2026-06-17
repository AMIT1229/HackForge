import { useMemo, useState } from 'react';
import { ClipboardCheck, Gavel } from 'lucide-react';
import type { RubricScore } from '@/types';
import { useJudgeAssignments, useSubmitReview } from '@/api/hooks';
import { useNotificationStore } from '@/store/notificationStore';
import { JUDGE_ID } from '@/lib/config';
import { DashboardLayout, type DashboardNavItem } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { cn } from '@/lib/utils';
import { JudgeQueue } from './components/JudgeQueue';
import { ProjectReviewDetail } from './components/ProjectReviewDetail';
import { ScoringPanel } from './components/ScoringPanel';

const judgeNav: DashboardNavItem[] = [
  { to: '/judge', label: 'Review Queue', icon: <Gavel className="h-4 w-4" />, end: true },
];

/** Judge interface: a review queue plus a master-detail scoring workspace. */
export default function JudgeDashboardPage() {
  const { data: assignments, isLoading, isError, refetch } = useJudgeAssignments(JUDGE_ID);
  const submitReview = useSubmitReview(JUDGE_ID);
  const addNotification = useNotificationStore((s) => s.add);

  const [tab, setTab] = useState<'pending' | 'completed'>('pending');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { pending, completed } = useMemo(() => {
    const list = assignments ?? [];
    return {
      pending: list.filter((a) => a.review?.status !== 'completed'),
      completed: list.filter((a) => a.review?.status === 'completed'),
    };
  }, [assignments]);

  const visible = tab === 'pending' ? pending : completed;
  const selected =
    (assignments ?? []).find((a) => a.submission.id === selectedId) ?? visible[0] ?? null;

  const handleSubmit = async (data: { scores: RubricScore; comments: string }) => {
    if (!selected) return;
    await submitReview.mutateAsync({ submissionId: selected.submission.id, ...data });
    addNotification({
      kind: 'system',
      level: 'success',
      title: 'Review submitted',
      body: `Your score for ${selected.team.name} was recorded.`,
    });
    setTab('completed');
  };

  return (
    <DashboardLayout
      title="Judge Dashboard"
      subtitle="Review and score assigned projects"
      nav={judgeNav}
      actions={
        assignments && (
          <Badge tone="brand">
            <ClipboardCheck className="h-3.5 w-3.5" aria-hidden />
            {completed.length}/{assignments.length} reviewed
          </Badge>
        )
      }
    >
      {isError ? (
        <ErrorState message="Couldn't load your review queue." onRetry={() => refetch()} />
      ) : isLoading ? (
        <LoadingState label="Loading assignments…" />
      ) : !assignments || assignments.length === 0 ? (
        <EmptyState title="No assignments yet" message="Projects assigned to you will appear here." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
          <div>
            <div className="mb-3 flex rounded-lg border border-border p-1" role="tablist">
              {(['pending', 'completed'] as const).map((t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className={cn(
                    'flex-1 rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors',
                    tab === t ? 'bg-brand text-brand-fg' : 'text-muted hover:text-fg',
                  )}
                >
                  {t} ({t === 'pending' ? pending.length : completed.length})
                </button>
              ))}
            </div>
            {visible.length === 0 ? (
              <p className="rounded-lg border border-border p-4 text-center text-sm text-muted">
                Nothing here.
              </p>
            ) : (
              <JudgeQueue
                assignments={visible}
                selectedId={selected?.submission.id ?? null}
                onSelect={setSelectedId}
              />
            )}
          </div>

          <div className="min-w-0">
            {selected ? (
              <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
                <Card>
                  <CardContent>
                    <ProjectReviewDetail assignment={selected} />
                  </CardContent>
                </Card>
                <Card className="xl:sticky xl:top-20 xl:self-start">
                  <CardContent>
                    <h3 className="mb-4 font-semibold">Scoring rubric</h3>
                    <ScoringPanel
                      assignment={selected}
                      isSaving={submitReview.isPending}
                      onSubmit={handleSubmit}
                    />
                  </CardContent>
                </Card>
              </div>
            ) : (
              <EmptyState title="Select a project" message="Pick a project from the queue to review." />
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
