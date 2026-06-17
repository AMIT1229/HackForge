import { useState } from 'react';
import { Copy, Check, Crown } from 'lucide-react';
import type { Team } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

/** Team roster with roles plus a copyable invite link. */
export function TeamOverviewCard({ team }: { team: Team }) {
  const [copied, setCopied] = useState(false);
  const inviteLink = `${window.location.origin}/events/${team.eventId}/register?invite=${team.inviteCode}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">{team.name}</CardTitle>
        <Badge tone="brand">{team.members.length} members</Badge>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <ul className="space-y-2">
          {team.members.map((m) => (
            <li key={m.id} className="flex items-center gap-3">
              <Avatar name={m.name} color={m.avatarColor} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{m.name}</p>
                <p className="truncate text-xs text-muted">{m.email}</p>
              </div>
              {m.role === 'lead' ? (
                <Badge tone="warning">
                  <Crown className="h-3 w-3" aria-hidden /> Lead
                </Badge>
              ) : (
                <Badge tone="neutral">Member</Badge>
              )}
            </li>
          ))}
        </ul>

        <div className="rounded-lg border border-border bg-surface-2 p-3">
          <p className="text-xs font-medium text-muted">Invite link</p>
          <div className="mt-1.5 flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate font-mono text-xs">{inviteLink}</code>
            <Button variant="outline" size="sm" onClick={copy} aria-label="Copy invite link">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="mt-1.5 text-xs text-muted">
            Invite code: <span className="font-mono font-semibold">{team.inviteCode}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
