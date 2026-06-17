import { useMemo, useState } from 'react';
import { Search, Download } from 'lucide-react';
import { useParticipants } from '@/api/hooks';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { exportToCsv } from '@/lib/csv';
import { formatDate } from '@/lib/utils';
import { ACTIVE_EVENT_ID } from '@/lib/config';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { Pagination } from '@/components/common/Pagination';

const PAGE_SIZE = 8;

/** Searchable, paginated participant list with CSV export. */
export function RegistrationsPanel() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debounced = useDebouncedValue(search, 350);

  const opts = useMemo(
    () => ({ search: debounced || undefined, page, pageSize: PAGE_SIZE }),
    [debounced, page],
  );
  const { data, isLoading, isError, isFetching, refetch } = useParticipants(ACTIVE_EVENT_ID, opts);

  const handleExport = () => {
    if (!data) return;
    exportToCsv('hackforge-registrations.csv', data.items, [
      { key: 'name', header: 'Name' },
      { key: 'email', header: 'Email' },
      { key: 'organization', header: 'Organization' },
      { key: 'teamName', header: 'Team' },
      { key: 'trackName', header: 'Track' },
      { key: 'registeredAt', header: 'Registered At' },
    ]);
  };

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden
            />
            <Input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search name, email, org…"
              aria-label="Search participants"
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={!data?.items.length}>
            <Download className="h-4 w-4" aria-hidden /> Export CSV
          </Button>
        </div>

        {isError ? (
          <ErrorState message="Couldn't load participants." onRetry={() => refetch()} />
        ) : isLoading ? (
          <LoadingState label="Loading participants…" />
        ) : !data || data.items.length === 0 ? (
          <EmptyState title="No participants found" message="Try a different search." />
        ) : (
          <>
            <p className="text-sm text-muted" aria-live="polite">
              {data.total} participant{data.total === 1 ? '' : 's'}
            </p>
            <div className="overflow-x-auto">
              <table className={`w-full text-left text-sm ${isFetching ? 'opacity-60' : ''}`}>
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                    <th scope="col" className="py-2 pr-4 font-medium">Participant</th>
                    <th scope="col" className="py-2 pr-4 font-medium">Organization</th>
                    <th scope="col" className="py-2 pr-4 font-medium">Team</th>
                    <th scope="col" className="py-2 pr-4 font-medium">Track</th>
                    <th scope="col" className="py-2 font-medium">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.items.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={p.name} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate font-medium">{p.name}</p>
                            <p className="truncate text-xs text-muted">{p.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 pr-4 text-muted">{p.organization}</td>
                      <td className="py-2.5 pr-4">{p.teamName}</td>
                      <td className="py-2.5 pr-4 text-muted">{p.trackName}</td>
                      <td className="py-2.5 text-muted">{formatDate(p.registeredAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
