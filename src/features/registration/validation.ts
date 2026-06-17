import { isValidEmail } from '@/lib/utils';

export interface RegistrationForm {
  name: string;
  email: string;
  organization: string;
  participantRole: string;
  teamMode: 'create' | 'join';
  teamName: string;
  inviteCode: string;
  trackId: string;
}

export const emptyRegistrationForm: RegistrationForm = {
  name: '',
  email: '',
  organization: '',
  participantRole: 'Developer',
  teamMode: 'create',
  teamName: '',
  inviteCode: '',
  trackId: '',
};

export type FieldErrors = Partial<Record<keyof RegistrationForm, string>>;

/** Validate only the fields relevant to a given step. Returns a map of errors. */
export function validateStep(step: number, form: RegistrationForm): FieldErrors {
  const errors: FieldErrors = {};

  if (step === 0) {
    if (!form.name.trim()) errors.name = 'Please enter your full name.';
    else if (form.name.trim().length < 2) errors.name = 'Name looks too short.';
    if (!form.email.trim()) errors.email = 'Email is required.';
    else if (!isValidEmail(form.email)) errors.email = 'Enter a valid email address.';
    if (!form.organization.trim())
      errors.organization = 'Tell us your college or organization.';
  }

  if (step === 1) {
    if (form.teamMode === 'create') {
      if (!form.teamName.trim()) errors.teamName = 'Give your team a name.';
      else if (form.teamName.trim().length < 3) errors.teamName = 'Team name is too short.';
    } else {
      if (!form.inviteCode.trim()) errors.inviteCode = 'Enter the invite code you received.';
      else if (!/^[A-Za-z0-9-]{4,}$/.test(form.inviteCode.trim()))
        errors.inviteCode = 'That invite code looks invalid.';
    }
  }

  if (step === 2) {
    if (!form.trackId) errors.trackId = 'Select a track to continue.';
  }

  return errors;
}

export const STEP_LABELS = ['Personal', 'Team', 'Track', 'Review'];
