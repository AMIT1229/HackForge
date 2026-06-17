import type { TimelineMilestone } from '@/types';
import { SectionHeading } from '@/components/common/SectionHeading';
import { formatDateTime } from '@/lib/utils';

export function Timeline({ milestones }: { milestones: TimelineMilestone[] }) {
  const now = Date.now();
  return (
    <section className="border-y border-border bg-surface py-16 sm:py-24" aria-labelledby="timeline-heading">
      <div className="container-page">
        <SectionHeading eyebrow="Timeline" title="Key dates">
          <span id="timeline-heading" className="sr-only">
            Event timeline
          </span>
        </SectionHeading>

        <ol className="mx-auto mt-12 max-w-2xl">
          {milestones.map((m, i) => {
            const isPast = new Date(m.date).getTime() < now;
            const isLast = i === milestones.length - 1;
            return (
              <li key={m.id} className="relative flex gap-5 pb-8 last:pb-0">
                {!isLast && (
                  <span
                    className="absolute left-[11px] top-7 h-full w-0.5 bg-border"
                    aria-hidden
                  />
                )}
                <span
                  className={`relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                    isPast ? 'border-brand bg-brand' : 'border-border bg-surface'
                  }`}
                  aria-hidden
                >
                  {isPast && <span className="h-2 w-2 rounded-full bg-brand-fg" />}
                </span>
                <div className="flex-1">
                  <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
                    <h3 className="font-semibold">{m.label}</h3>
                    <time className="text-sm text-muted" dateTime={m.date}>
                      {formatDateTime(m.date)}
                    </time>
                  </div>
                  <p className="mt-1 text-sm text-muted">{m.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
