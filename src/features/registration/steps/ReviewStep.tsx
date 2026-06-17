import { Pencil } from 'lucide-react';
import type { Track } from '@/types';
import { Button } from '@/components/ui/Button';
import type { RegistrationForm } from '../validation';

interface ReviewStepProps {
  form: RegistrationForm;
  tracks: Track[];
  /** Jump back to a specific step to edit a section. */
  onEdit: (step: number) => void;
}

function Row({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
        <dd className="truncate font-medium">{value}</dd>
      </div>
      <Button variant="ghost" size="sm" onClick={onEdit} aria-label={`Edit ${label}`}>
        <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit
      </Button>
    </div>
  );
}

export function ReviewStep({ form, tracks, onEdit }: ReviewStepProps) {
  const track = tracks.find((t) => t.id === form.trackId);
  return (
    <div className="space-y-1">
      <p className="mb-2 text-sm text-muted">
        Review your details before submitting. You can edit any section.
      </p>
      <dl className="divide-y divide-border rounded-xl border border-border bg-surface px-4">
        <Row label="Name" value={form.name} onEdit={() => onEdit(0)} />
        <Row label="Email" value={form.email} onEdit={() => onEdit(0)} />
        <Row label="Organization" value={form.organization} onEdit={() => onEdit(0)} />
        <Row label="Role" value={form.participantRole} onEdit={() => onEdit(0)} />
        <Row
          label="Team"
          value={
            form.teamMode === 'create'
              ? `Create — ${form.teamName}`
              : `Join — ${form.inviteCode}`
          }
          onEdit={() => onEdit(1)}
        />
        <Row label="Track" value={track?.name ?? '—'} onEdit={() => onEdit(2)} />
      </dl>
    </div>
  );
}
