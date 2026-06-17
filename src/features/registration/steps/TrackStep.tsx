import type { Track } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import type { FieldErrors, RegistrationForm } from '../validation';

interface StepProps {
  tracks: Track[];
  form: RegistrationForm;
  errors: FieldErrors;
  onChange: (patch: Partial<RegistrationForm>) => void;
}

export function TrackStep({ tracks, form, errors, onChange }: StepProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="mb-2 text-sm font-medium">
        Choose your track
        <span className="text-danger" aria-hidden>
          {' '}
          *
        </span>
      </legend>
      <div className="grid gap-3">
        {tracks.map((track) => {
          const selected = form.trackId === track.id;
          return (
            <label
              key={track.id}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-colors',
                selected ? 'border-brand bg-brand-subtle/40' : 'border-border hover:bg-surface-2',
              )}
            >
              <input
                type="radio"
                name="track"
                value={track.id}
                checked={selected}
                onChange={() => onChange({ trackId: track.id })}
                className="mt-1 h-4 w-4 accent-[rgb(var(--brand))]"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{track.name}</span>
                  <Badge tone="brand">{track.tag}</Badge>
                </div>
                <p className="mt-0.5 text-sm text-muted">{track.description}</p>
              </div>
            </label>
          );
        })}
      </div>
      {errors.trackId && (
        <p role="alert" className="text-xs font-medium text-danger">
          {errors.trackId}
        </p>
      )}
    </fieldset>
  );
}
