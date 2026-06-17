import { BookOpen, FileCode2, CalendarClock, LifeBuoy, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

const RESOURCES = [
  { label: 'API Documentation', href: 'https://docs.hackforge.dev', icon: FileCode2, desc: 'Endpoints, SDKs & auth' },
  { label: 'Problem Statements', href: 'https://hackforge.dev/problems', icon: BookOpen, desc: 'Track briefs & ideas' },
  { label: 'Mentor Schedules', href: 'https://hackforge.dev/mentors', icon: CalendarClock, desc: 'Book office hours' },
  { label: 'Get Help', href: 'https://hackforge.dev/support', icon: LifeBuoy, desc: 'Discord & support desk' },
];

/** Quick-access resource links for participants during the event. */
export function ResourceLinks() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Resources</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 pt-0 sm:grid-cols-2">
        {RESOURCES.map((r) => (
          <a
            key={r.label}
            href={r.href}
            target="_blank"
            rel="noreferrer noopener"
            className="group flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-surface-2"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-subtle text-brand">
              <r.icon className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 text-sm font-medium">
                {r.label}
                <ExternalLink className="h-3 w-3 text-muted opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
              </p>
              <p className="truncate text-xs text-muted">{r.desc}</p>
            </div>
          </a>
        ))}
      </CardContent>
    </Card>
  );
}
