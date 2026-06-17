import { Field, Input, Select } from '@/components/ui/Field';
import type { FieldErrors, RegistrationForm } from '../validation';

interface StepProps {
  form: RegistrationForm;
  errors: FieldErrors;
  onChange: (patch: Partial<RegistrationForm>) => void;
  /** Duplicate-registration warning surfaced by the live email check. */
  duplicateWarning?: string;
}

const ROLES = ['Developer', 'Designer', 'Product', 'Data / ML', 'Student', 'Other'];

export function PersonalStep({ form, errors, onChange, duplicateWarning }: StepProps) {
  return (
    <div className="space-y-4">
      <Field label="Full name" htmlFor="reg-name" error={errors.name} describedById="reg-name" required>
        <Input
          id="reg-name"
          value={form.name}
          onChange={(e) => onChange({ name: e.target.value })}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'reg-name-error' : undefined}
          autoComplete="name"
          placeholder="Ada Lovelace"
        />
      </Field>

      <Field
        label="Email"
        htmlFor="reg-email"
        error={errors.email ?? duplicateWarning}
        describedById="reg-email"
        required
      >
        <Input
          id="reg-email"
          type="email"
          value={form.email}
          onChange={(e) => onChange({ email: e.target.value })}
          aria-invalid={Boolean(errors.email || duplicateWarning)}
          aria-describedby={errors.email || duplicateWarning ? 'reg-email-error' : undefined}
          autoComplete="email"
          placeholder="you@example.com"
        />
      </Field>

      <Field
        label="College / Organization"
        htmlFor="reg-org"
        error={errors.organization}
        describedById="reg-org"
        required
      >
        <Input
          id="reg-org"
          value={form.organization}
          onChange={(e) => onChange({ organization: e.target.value })}
          aria-invalid={Boolean(errors.organization)}
          aria-describedby={errors.organization ? 'reg-org-error' : undefined}
          autoComplete="organization"
          placeholder="MIT / Acme Inc."
        />
      </Field>

      <Field label="Your role" htmlFor="reg-role">
        <Select
          id="reg-role"
          value={form.participantRole}
          onChange={(e) => onChange({ participantRole: e.target.value })}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>
      </Field>
    </div>
  );
}
