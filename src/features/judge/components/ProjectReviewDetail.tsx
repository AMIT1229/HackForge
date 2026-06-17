import { ExternalLink, Github, FileText, Youtube } from 'lucide-react';
import type { JudgeAssignment } from '@/types';
import { Badge } from '@/components/ui/Badge';

/** Read-only project detail shown to a judge alongside the scoring panel. */
export function ProjectReviewDetail({ assignment }: { assignment: JudgeAssignment }) {
  const { submission, team } = assignment;
  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-bold">{submission.title || 'Untitled project'}</h2>
          {assignment.review ? (
            <Badge tone="success">Reviewed</Badge>
          ) : (
            <Badge tone="warning">Pending</Badge>
          )}
        </div>
        <p className="mt-1 text-sm text-muted">by {team.name}</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {submission.techStack.map((t) => (
          <Badge key={t} tone="neutral">
            {t}
          </Badge>
        ))}
      </div>

      <p className="leading-relaxed text-muted">{submission.description}</p>

      <div className="grid gap-2 sm:grid-cols-2">
        <a
          href={submission.demoUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm hover:bg-surface-2"
        >
          <ExternalLink className="h-4 w-4 text-brand" aria-hidden /> Live demo
        </a>
        <a
          href={submission.repoUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm hover:bg-surface-2"
        >
          <Github className="h-4 w-4 text-brand" aria-hidden /> Repository
        </a>
        {submission.videoUrl && (
          <a
            href={submission.videoUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm hover:bg-surface-2"
          >
            <Youtube className="h-4 w-4 text-brand" aria-hidden /> Demo video
          </a>
        )}
      </div>

      {/* Pitch deck viewer (placeholder surface — no real binary in the mock). */}
      <div>
        <p className="mb-2 text-sm font-medium">Pitch deck</p>
        {submission.deckFileName ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-surface-2 py-10 text-center">
            <FileText className="h-8 w-8 text-brand" aria-hidden />
            <p className="text-sm font-medium">{submission.deckFileName}</p>
            <button className="text-xs font-medium text-brand hover:underline" type="button">
              Open deck viewer
            </button>
          </div>
        ) : (
          <p className="rounded-lg border border-border bg-surface-2 p-4 text-sm text-muted">
            No pitch deck was uploaded.
          </p>
        )}
      </div>
    </div>
  );
}
