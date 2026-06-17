import { useState } from 'react';
import { Save, Send, Lock, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { useEvent, useSaveSubmission, useSubmission } from '@/api/hooks';
import { useSessionStore } from '@/store/sessionStore';
import { useNotificationStore } from '@/store/notificationStore';
import { ACTIVE_EVENT_SLUG } from '@/lib/config';
import { getCountdown, formatDateTime } from '@/lib/utils';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, LoadingState } from '@/components/ui/States';
import { CountdownTimer } from '@/components/common/CountdownTimer';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { participantNav } from '@/features/team/participantNav';
import { SubmissionForm } from './components/SubmissionForm';
import { useSubmissionForm, validateSubmission } from './useSubmissionForm';

/** Project submission page with draft save, hard-deadline countdown, and a
 *  post-deadline locked state. */
export default function ProjectSubmissionPage() {
  const teamId = useSessionStore((s) => s.teamId);
  const addNotification = useNotificationStore((s) => s.add);
  const { data: event } = useEvent(ACTIVE_EVENT_SLUG);
  const submissionQuery = useSubmission(teamId ?? '');
  const save = useSaveSubmission(teamId ?? '');

  const submission = submissionQuery.data;
  const { form, errors, setErrors, update, clearDraft } = useSubmissionForm(submission?.id, submission);
  const [deadlinePassed, setDeadlinePassed] = useState(
    () => (event ? getCountdown(event.submissionDeadline).isPast : false),
  );
  const [feedback, setFeedback] = useState<string>();

  if (!teamId) {
    return (
      <DashboardLayout title="Project Submission" nav={participantNav}>
        <EmptyState
          title="Register first"
          message="You need to register for an event before submitting a project."
          action={<ButtonLink to="/events">Browse events</ButtonLink>}
        />
      </DashboardLayout>
    );
  }

  if (submissionQuery.isLoading || !event) {
    return (
      <DashboardLayout title="Project Submission" nav={participantNav}>
        <LoadingState label="Loading your submission…" />
      </DashboardLayout>
    );
  }

  const isSubmitted = submission?.status === 'submitted';
  const isLocked = deadlinePassed || isSubmitted;

  const saveDraft = async () => {
    setFeedback(undefined);
    try {
      await save.mutateAsync({ id: submission?.id, patch: { ...form, finalize: false } });
      setFeedback('Draft saved.');
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Could not save draft.');
    }
  };

  const submitFinal = async () => {
    const validation = validateSubmission(form);
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      setFeedback('Please fix the highlighted fields before submitting.');
      return;
    }
    try {
      await save.mutateAsync({ id: submission?.id, patch: { ...form, finalize: true } });
      clearDraft();
      addNotification({
        kind: 'system',
        level: 'success',
        title: 'Project submitted 🎉',
        body: `${form.title} is locked in for judging.`,
      });
      setFeedback(undefined);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Submission failed. Please retry.');
    }
  };

  return (
    <DashboardLayout
      title="Project Submission"
      subtitle={event.name}
      nav={participantNav}
      actions={
        isSubmitted ? (
          <Badge tone="success">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Submitted
          </Badge>
        ) : (
          <Badge tone={deadlinePassed ? 'danger' : 'warning'}>
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {deadlinePassed ? 'Closed' : 'Open'}
          </Badge>
        )
      }
    >
      {/* Deadline banner */}
      {!isLocked && (
        <Card className="mb-6 border-warning/40 bg-warning/5">
          <CardContent className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium">Time remaining to submit</p>
              <p className="text-xs text-muted">
                Hard deadline: {formatDateTime(event.submissionDeadline)}
              </p>
            </div>
            <CountdownTimer
              target={event.submissionDeadline}
              onComplete={() => setDeadlinePassed(true)}
            />
          </CardContent>
        </Card>
      )}

      {/* Locked states */}
      {isSubmitted && (
        <Card className="mb-6 border-success/40 bg-success/5">
          <CardContent className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 shrink-0 text-success" aria-hidden />
            <div>
              <p className="font-medium">Your project is submitted</p>
              <p className="text-sm text-muted">
                Submitted {submission?.submittedAt ? formatDateTime(submission.submittedAt) : ''}. It's
                now locked for judging — review only below.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      {deadlinePassed && !isSubmitted && (
        <Card className="mb-6 border-danger/40 bg-danger/5">
          <CardContent className="flex items-center gap-3">
            <Lock className="h-6 w-6 shrink-0 text-danger" aria-hidden />
            <div>
              <p className="font-medium">Submissions are closed</p>
              <p className="text-sm text-muted">
                The deadline passed at {formatDateTime(event.submissionDeadline)}. Editing is locked.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project details</CardTitle>
        </CardHeader>
        <CardContent>
          <fieldset disabled={isLocked} aria-disabled={isLocked}>
            <SubmissionForm form={form} errors={errors} disabled={isLocked} onChange={update} />
          </fieldset>

          {feedback && (
            <p
              role="status"
              className="mt-4 flex items-center gap-2 text-sm text-muted"
            >
              <AlertTriangle className="h-4 w-4" aria-hidden />
              {feedback}
            </p>
          )}

          {!isLocked && (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={saveDraft} loading={save.isPending}>
                <Save className="h-4 w-4" aria-hidden /> Save draft
              </Button>
              <Button onClick={submitFinal} loading={save.isPending}>
                <Send className="h-4 w-4" aria-hidden /> Submit project
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
