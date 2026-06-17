import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react';
import { useCheckEmail, useEvent, useRegister } from '@/api/hooks';
import { useSessionStore } from '@/store/sessionStore';
import { ApiError } from '@/api/client';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ErrorState, LoadingState } from '@/components/ui/States';
import { StepProgress } from '@/components/common/StepProgress';
import type { RegistrationResult } from '@/types';
import {
  emptyRegistrationForm,
  STEP_LABELS,
  validateStep,
  type FieldErrors,
  type RegistrationForm,
} from './validation';
import { PersonalStep } from './steps/PersonalStep';
import { TeamStep } from './steps/TeamStep';
import { TrackStep } from './steps/TrackStep';
import { ReviewStep } from './steps/ReviewStep';
import { ConfirmationScreen } from './steps/ConfirmationScreen';

/** Multi-step registration flow with per-step validation, live duplicate-email
 *  detection, and graceful handling of duplicate registrations. */
export default function RegistrationPage() {
  const { slug = '' } = useParams();
  const { data: event, isLoading, isError, refetch } = useEvent(slug);
  const setTeamId = useSessionStore((s) => s.setTeamId);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<RegistrationForm>(emptyRegistrationForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [duplicateWarning, setDuplicateWarning] = useState<string>();
  const [result, setResult] = useState<RegistrationResult | null>(null);
  const [submitError, setSubmitError] = useState<string>();

  const checkEmail = useCheckEmail();
  const register = useRegister();

  // Default the track selection once the event loads.
  useEffect(() => {
    if (event && !form.trackId) setForm((f) => ({ ...f, trackId: event.tracks[0]?.id ?? '' }));
  }, [event, form.trackId]);

  if (isLoading) {
    return (
      <div className="container-page py-24">
        <LoadingState label="Loading registration…" />
      </div>
    );
  }
  if (isError || !event) {
    return (
      <div className="container-page py-24">
        <ErrorState title="Event not found" onRetry={() => refetch()} />
      </div>
    );
  }

  if (result) {
    return (
      <div className="container-page py-12">
        <ConfirmationScreen result={result} />
      </div>
    );
  }

  const patch = (p: Partial<RegistrationForm>) => {
    setForm((f) => ({ ...f, ...p }));
    setDuplicateWarning(undefined);
  };

  const goNext = async () => {
    const stepErrors = validateStep(step, form);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;

    // Live duplicate check when leaving the personal step.
    if (step === 0) {
      try {
        const { registered } = await checkEmail.mutateAsync({
          eventId: event.id,
          email: form.email,
        });
        if (registered) {
          setDuplicateWarning('This email is already registered for this event.');
          return;
        }
      } catch {
        /* non-blocking — the final submit re-validates server-side */
      }
    }
    setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    setSubmitError(undefined);
    try {
      const res = await register.mutateAsync({
        eventId: event.id,
        personal: {
          name: form.name,
          email: form.email,
          organization: form.organization,
          role: form.participantRole,
        },
        team: {
          mode: form.teamMode,
          teamName: form.teamMode === 'create' ? form.teamName : undefined,
          inviteCode: form.teamMode === 'join' ? form.inviteCode : undefined,
        },
        trackId: form.trackId,
      });
      setTeamId(res.team.id);
      setResult(res);
    } catch (err) {
      // Graceful duplicate handling (e.g. two tabs submitting at once).
      if (err instanceof ApiError && err.status === 409) {
        setStep(0);
        setDuplicateWarning('This email is already registered. Try signing in instead.');
      } else {
        setSubmitError(err instanceof Error ? err.message : 'Registration failed. Please retry.');
      }
    }
  };

  const isLastStep = step === STEP_LABELS.length - 1;

  return (
    <div className="container-page max-w-2xl py-8 lg:py-10">
      <Link
        to={`/events/${event.slug}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to event
      </Link>

      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Register for {event.name}</h1>
        <p className="mt-1 text-sm text-muted">
          Step {step + 1} of {STEP_LABELS.length}
        </p>
      </header>

      <div className="mb-8">
        <StepProgress steps={STEP_LABELS} current={step} />
      </div>

      <Card>
        <CardContent>
          {step === 0 && (
            <PersonalStep form={form} errors={errors} onChange={patch} duplicateWarning={duplicateWarning} />
          )}
          {step === 1 && <TeamStep form={form} errors={errors} onChange={patch} />}
          {step === 2 && (
            <TrackStep tracks={event.tracks} form={form} errors={errors} onChange={patch} />
          )}
          {step === 3 && <ReviewStep form={form} tracks={event.tracks} onEdit={setStep} />}

          {submitError && (
            <div
              role="alert"
              className="mt-4 flex items-center gap-2 rounded-lg bg-danger/10 p-3 text-sm text-danger"
            >
              <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
              {submitError}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={goBack} disabled={step === 0}>
          <ArrowLeft className="h-4 w-4" aria-hidden /> Back
        </Button>
        {isLastStep ? (
          <Button onClick={submit} loading={register.isPending} size="lg">
            Confirm & register
          </Button>
        ) : (
          <Button onClick={goNext} loading={checkEmail.isPending}>
            Continue <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        )}
      </div>
    </div>
  );
}
