import { useState } from 'react';
import { CheckCircle2, Copy, Check } from 'lucide-react';
import type { RegistrationResult } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ButtonLink } from '@/components/ui/ButtonLink';

/** Final confirmation with the shareable registration ID and team invite code. */
export function ConfirmationScreen({ result }: { result: RegistrationResult }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard unavailable — silently ignore */
    }
  };

  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15">
        <CheckCircle2 className="h-9 w-9 text-success" aria-hidden />
      </div>
      <h1 className="mt-5 text-2xl font-bold">You're registered! 🎉</h1>
      <p className="mt-2 text-muted">
        Welcome aboard. We've saved your spot — here are the details you'll need.
      </p>

      <Card className="mt-6 text-left">
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Registration ID</p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <code className="font-mono text-lg font-semibold">{result.registrationId}</code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copy(result.registrationId, 'reg')}
                aria-label="Copy registration ID"
              >
                {copied === 'reg' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied === 'reg' ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
          <div className="border-t border-border pt-4">
            <p className="text-xs uppercase tracking-wide text-muted">Team invite code</p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <code className="font-mono text-lg font-semibold">{result.team.inviteCode}</code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copy(result.team.inviteCode, 'inv')}
                aria-label="Copy invite code"
              >
                {copied === 'inv' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied === 'inv' ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <p className="mt-1 text-xs text-muted">Share this code so teammates can join your team.</p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <ButtonLink to="/dashboard" size="lg">
          Go to my dashboard
        </ButtonLink>
        <ButtonLink to="/events" variant="outline" size="lg">
          Browse more events
        </ButtonLink>
      </div>
    </div>
  );
}
