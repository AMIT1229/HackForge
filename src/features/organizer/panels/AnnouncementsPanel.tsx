import { useState } from 'react';
import { Send, AlertTriangle, Info } from 'lucide-react';
import type { AnnouncementPriority } from '@/types';
import { useAnnouncements, useCreateAnnouncement } from '@/api/hooks';
import { useNotificationStore } from '@/store/notificationStore';
import { ACTIVE_EVENT_ID } from '@/lib/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { AnnouncementsFeed } from '@/features/team/components/AnnouncementsFeed';
import { cn } from '@/lib/utils';

/** Compose-and-broadcast announcements to all participants. */
export function AnnouncementsPanel() {
  const announcements = useAnnouncements(ACTIVE_EVENT_ID);
  const create = useCreateAnnouncement(ACTIVE_EVENT_ID);
  const addNotification = useNotificationStore((s) => s.add);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<AnnouncementPriority>('info');
  const [errors, setErrors] = useState<{ title?: string; body?: string }>({});

  const submit = async () => {
    const next: typeof errors = {};
    if (!title.trim()) next.title = 'Add a title.';
    if (!body.trim()) next.body = 'Write a message.';
    setErrors(next);
    if (Object.keys(next).length) return;

    await create.mutateAsync({ title, body, priority });
    // Reflect the broadcast locally for the organizer too.
    addNotification({
      kind: 'announcement',
      level: priority === 'urgent' ? 'urgent' : 'info',
      title,
      body,
    });
    setTitle('');
    setBody('');
    setPriority('info');
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Broadcast announcement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Title" htmlFor="ann-title" error={errors.title} describedById="ann-title" required>
            <Input
              id="ann-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-invalid={Boolean(errors.title)}
              placeholder="Submission deadline extended by 30 minutes"
            />
          </Field>
          <Field label="Message" htmlFor="ann-body" error={errors.body} describedById="ann-body" required>
            <Textarea
              id="ann-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              aria-invalid={Boolean(errors.body)}
              rows={4}
              placeholder="Share the details participants need to know…"
            />
          </Field>

          <fieldset>
            <legend className="mb-2 text-sm font-medium">Priority</legend>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { value: 'info', label: 'Informational', icon: Info },
                  { value: 'urgent', label: 'Urgent', icon: AlertTriangle },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.value}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-lg border-2 p-3 text-sm transition-colors',
                    priority === opt.value
                      ? opt.value === 'urgent'
                        ? 'border-danger bg-danger/5'
                        : 'border-brand bg-brand-subtle/40'
                      : 'border-border hover:bg-surface-2',
                  )}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={opt.value}
                    checked={priority === opt.value}
                    onChange={() => setPriority(opt.value)}
                    className="sr-only"
                  />
                  <opt.icon
                    className={cn(
                      'h-4 w-4',
                      opt.value === 'urgent' ? 'text-danger' : 'text-brand',
                    )}
                    aria-hidden
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>

          <Button onClick={submit} loading={create.isPending} className="w-full">
            <Send className="h-4 w-4" aria-hidden /> Send to all participants
          </Button>
        </CardContent>
      </Card>

      <AnnouncementsFeed
        announcements={announcements.data}
        isLoading={announcements.isLoading}
        isError={announcements.isError}
        onRetry={announcements.refetch}
      />
    </div>
  );
}
