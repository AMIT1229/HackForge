import { useEffect, useState } from 'react';
import type { Submission } from '@/types';
import { isValidUrl } from '@/lib/utils';

export interface SubmissionFormState {
  title: string;
  description: string;
  techStack: string[];
  demoUrl: string;
  repoUrl: string;
  videoUrl: string;
  deckFileName?: string;
}

export type SubmissionErrors = Partial<Record<keyof SubmissionFormState, string>>;

function fromSubmission(s?: Submission): SubmissionFormState {
  return {
    title: s?.title ?? '',
    description: s?.description ?? '',
    techStack: s?.techStack ?? [],
    demoUrl: s?.demoUrl ?? '',
    repoUrl: s?.repoUrl ?? '',
    videoUrl: s?.videoUrl ?? '',
    deckFileName: s?.deckFileName,
  };
}

/** Validate the full submission for FINAL submit (drafts skip this). */
export function validateSubmission(form: SubmissionFormState): SubmissionErrors {
  const errors: SubmissionErrors = {};
  if (!form.title.trim()) errors.title = 'A project title is required.';
  if (!form.description.trim() || form.description.trim().length < 20)
    errors.description = 'Add at least a short description (20+ characters).';
  if (!form.demoUrl.trim()) errors.demoUrl = 'A demo link is required.';
  else if (!isValidUrl(form.demoUrl)) errors.demoUrl = 'Enter a valid URL.';
  if (!form.repoUrl.trim()) errors.repoUrl = 'A repository link is required.';
  else if (!isValidUrl(form.repoUrl)) errors.repoUrl = 'Enter a valid URL.';
  if (form.videoUrl.trim() && !isValidUrl(form.videoUrl)) errors.videoUrl = 'Enter a valid URL.';
  return errors;
}

/**
 * Submission form state with local-draft autosave. The draft is mirrored to
 * localStorage on every change so that a participant who loses connectivity (a
 * scenario the assignment explicitly calls out) recovers their work on reload.
 */
export function useSubmissionForm(submissionId: string | undefined, initial?: Submission) {
  const storageKey = submissionId ? `hackforge-draft-${submissionId}` : null;
  const [form, setForm] = useState<SubmissionFormState>(() => fromSubmission(initial));
  const [errors, setErrors] = useState<SubmissionErrors>({});
  const [hydrated, setHydrated] = useState(false);

  // Hydrate once: prefer a locally-saved draft over server data if present.
  useEffect(() => {
    if (hydrated || !initial) return;
    const base = fromSubmission(initial);
    if (storageKey) {
      try {
        const cached = localStorage.getItem(storageKey);
        if (cached) {
          setForm({ ...base, ...(JSON.parse(cached) as Partial<SubmissionFormState>) });
          setHydrated(true);
          return;
        }
      } catch {
        /* ignore malformed cache */
      }
    }
    setForm(base);
    setHydrated(true);
  }, [initial, storageKey, hydrated]);

  // Mirror every change to localStorage as a recovery draft.
  useEffect(() => {
    if (!storageKey || !hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(form));
    } catch {
      /* storage full / unavailable — non-critical */
    }
  }, [form, storageKey, hydrated]);

  const update = (patch: Partial<SubmissionFormState>) => {
    setForm((f) => ({ ...f, ...patch }));
    setErrors({});
  };

  const clearDraft = () => {
    if (storageKey) localStorage.removeItem(storageKey);
  };

  return { form, errors, setErrors, update, clearDraft };
}
