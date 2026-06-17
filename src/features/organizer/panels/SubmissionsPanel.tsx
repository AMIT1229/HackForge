import { ExternalLink, Github } from 'lucide-react';
import type { SubmissionStatus } from '@/types';
import { useEventSubmissions } from '@/api/hooks';
import { ACTIVE_EVENT_ID } from '@/lib/config';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { formatDateTime } from '@/lib/utils';

const statusTone: Record<SubmissionStatus, 'success' | 'warning' | 'neutral'> = {
  submitted: 'success',
  in_progress: 'warning',
  not_started: 'neutral',
};

const statusLabel: Record<SubmissionStatus, string> = {
  submitted: 'Submitted',
  in_progress: 'In progress',
  not_started: 'Not started',
};

/** Read-only monitor of every team's submission and its current status. */
export function SubmissionsPanel() {
  const { data, isLoading, isError, refetch } = useEventSubmissions(ACTIVE_EVENT_ID);

  if (isError) return <ErrorState message="Couldn't load submissions." onRetry={() => refetch()} />;
  if (isLoading) return <LoadingState label="Loading submissions…" />;
  if (!data || data.length === 0)
    return <EmptyState title="No submissions yet" message="Submissions will show up here." />;

  return (
    <Card>
      <CardContent>
        <p className="mb-4 text-sm text-muted">{data.length} submissions tracked</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th scope="col" className="py-2 pr-4 font-medium">Team</th>
                <th scope="col" className="py-2 pr-4 font-medium">Project</th>
                <th scope="col" className="py-2 pr-4 font-medium">Status</th>
                <th scope="col" className="py-2 pr-4 font-medium">Submitted</th>
                <th scope="col" className="py-2 font-medium">Links</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((s) => (
                <tr key={s.id}>
                  <td className="py-2.5 pr-4 font-medium">{s.teamName}</td>
                  <td className="py-2.5 pr-4 text-muted">{s.title || '—'}</td>
                  <td className="py-2.5 pr-4">
                    <Badge tone={statusTone[s.status]}>{statusLabel[s.status]}</Badge>
                  </td>
                  <td className="py-2.5 pr-4 text-muted">
                    {s.submittedAt ? formatDateTime(s.submittedAt) : '—'}
                  </td>
                  <td className="py-2.5">
                    <div className="flex gap-2">
                      {s.demoUrl && (
                        <a
                          href={s.demoUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          aria-label={`${s.teamName} demo`}
                          className="text-muted hover:text-brand"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      {s.repoUrl && (
                        <a
                          href={s.repoUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          aria-label={`${s.teamName} repository`}
                          className="text-muted hover:text-brand"
                        >
                          <Github className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
