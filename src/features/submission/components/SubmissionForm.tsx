import { Field, Input, Textarea } from '@/components/ui/Field';
import { TechStackInput } from './TechStackInput';
import { FileUpload } from './FileUpload';
import type { SubmissionFormState, SubmissionErrors } from '../useSubmissionForm';

interface SubmissionFormProps {
  form: SubmissionFormState;
  errors: SubmissionErrors;
  disabled?: boolean;
  onChange: (patch: Partial<SubmissionFormState>) => void;
}

export function SubmissionForm({ form, errors, disabled, onChange }: SubmissionFormProps) {
  return (
    <div className="space-y-5">
      <Field label="Project title" htmlFor="sub-title" error={errors.title} describedById="sub-title" required>
        <Input
          id="sub-title"
          value={form.title}
          disabled={disabled}
          onChange={(e) => onChange({ title: e.target.value })}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? 'sub-title-error' : undefined}
          placeholder="Give your project a memorable name"
        />
      </Field>

      <Field
        label="Description"
        htmlFor="sub-desc"
        error={errors.description}
        describedById="sub-desc"
        hint="What does it do, and what problem does it solve?"
        required
      >
        <Textarea
          id="sub-desc"
          value={form.description}
          disabled={disabled}
          onChange={(e) => onChange({ description: e.target.value })}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? 'sub-desc-error' : 'sub-desc-hint'}
          rows={5}
        />
      </Field>

      <Field label="Tech stack" htmlFor="sub-stack" error={errors.techStack} describedById="sub-stack">
        <TechStackInput id="sub-stack" value={form.techStack} onChange={(v) => onChange({ techStack: v })} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Demo link" htmlFor="sub-demo" error={errors.demoUrl} describedById="sub-demo" required>
          <Input
            id="sub-demo"
            type="url"
            value={form.demoUrl}
            disabled={disabled}
            onChange={(e) => onChange({ demoUrl: e.target.value })}
            aria-invalid={Boolean(errors.demoUrl)}
            aria-describedby={errors.demoUrl ? 'sub-demo-error' : undefined}
            placeholder="https://your-demo.app"
          />
        </Field>

        <Field label="GitHub repository" htmlFor="sub-repo" error={errors.repoUrl} describedById="sub-repo" required>
          <Input
            id="sub-repo"
            type="url"
            value={form.repoUrl}
            disabled={disabled}
            onChange={(e) => onChange({ repoUrl: e.target.value })}
            aria-invalid={Boolean(errors.repoUrl)}
            aria-describedby={errors.repoUrl ? 'sub-repo-error' : undefined}
            placeholder="https://github.com/you/project"
          />
        </Field>
      </div>

      <Field
        label="Demo video (optional)"
        htmlFor="sub-video"
        error={errors.videoUrl}
        describedById="sub-video"
        hint="YouTube or Loom link"
      >
        <Input
          id="sub-video"
          type="url"
          value={form.videoUrl}
          disabled={disabled}
          onChange={(e) => onChange({ videoUrl: e.target.value })}
          aria-invalid={Boolean(errors.videoUrl)}
          aria-describedby={errors.videoUrl ? 'sub-video-error' : 'sub-video-hint'}
          placeholder="https://youtu.be/…"
        />
      </Field>

      <Field label="Pitch deck" htmlFor="sub-deck" error={errors.deckFileName} describedById="sub-deck">
        <FileUpload
          fileName={form.deckFileName}
          disabled={disabled}
          onFileSelected={(name) => onChange({ deckFileName: name })}
          onClear={() => onChange({ deckFileName: undefined })}
        />
      </Field>
    </div>
  );
}
