import { UserPlus, KeyRound } from 'lucide-react';
import { Field, Input } from '@/components/ui/Field';
import { cn } from '@/lib/utils';
import type { FieldErrors, RegistrationForm } from '../validation';

interface StepProps {
  form: RegistrationForm;
  errors: FieldErrors;
  onChange: (patch: Partial<RegistrationForm>) => void;
}

const MODES = [
  { value: 'create' as const, label: 'Create a new team', icon: UserPlus, hint: "You'll be the team lead and can invite others." },
  { value: 'join' as const, label: 'Join with invite code', icon: KeyRound, hint: 'Use a code shared by your team lead.' },
];

export function TeamStep({ form, errors, onChange }: StepProps) {
  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="mb-3 text-sm font-medium">How are you participating?</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {MODES.map((mode) => {
            const selected = form.teamMode === mode.value;
            return (
              <label
                key={mode.value}
                className={cn(
                  'flex cursor-pointer flex-col gap-2 rounded-xl border-2 p-4 transition-colors',
                  selected ? 'border-brand bg-brand-subtle/40' : 'border-border hover:bg-surface-2',
                )}
              >
                <input
                  type="radio"
                  name="teamMode"
                  value={mode.value}
                  checked={selected}
                  onChange={() => onChange({ teamMode: mode.value })}
                  className="sr-only"
                />
                <mode.icon className={cn('h-5 w-5', selected ? 'text-brand' : 'text-muted')} aria-hidden />
                <span className="font-medium">{mode.label}</span>
                <span className="text-xs text-muted">{mode.hint}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {form.teamMode === 'create' ? (
        <Field label="Team name" htmlFor="reg-team" error={errors.teamName} describedById="reg-team" required>
          <Input
            id="reg-team"
            value={form.teamName}
            onChange={(e) => onChange({ teamName: e.target.value })}
            aria-invalid={Boolean(errors.teamName)}
            aria-describedby={errors.teamName ? 'reg-team-error' : undefined}
            placeholder="Quasar Labs"
          />
        </Field>
      ) : (
        <Field
          label="Invite code"
          htmlFor="reg-invite"
          error={errors.inviteCode}
          describedById="reg-invite"
          hint="Looks like QSR-7F3K"
          required
        >
          <Input
            id="reg-invite"
            value={form.inviteCode}
            onChange={(e) => onChange({ inviteCode: e.target.value.toUpperCase() })}
            aria-invalid={Boolean(errors.inviteCode)}
            aria-describedby={errors.inviteCode ? 'reg-invite-error' : 'reg-invite-hint'}
            placeholder="QSR-7F3K"
            className="font-mono uppercase"
          />
        </Field>
      )}
    </div>
  );
}
