import { Search, X } from 'lucide-react';
import { Input, Select } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';

export interface EventFilterValues {
  search: string;
  status: string;
  track: string;
  dateFrom: string;
  dateTo: string;
}

interface EventFiltersBarProps {
  values: EventFilterValues;
  trackTags: string[];
  onChange: (patch: Partial<EventFilterValues>) => void;
  onReset: () => void;
}

const STATUSES = [
  { value: 'all', label: 'All statuses' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'active', label: 'Active' },
  { value: 'closed', label: 'Closed' },
];

export function EventFiltersBar({ values, trackTags, onChange, onReset }: EventFiltersBarProps) {
  const hasActiveFilters =
    values.search ||
    values.status !== 'all' ||
    values.track !== 'all' ||
    values.dateFrom ||
    values.dateTo;

  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <Input
          type="search"
          value={values.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Search hackathons…"
          aria-label="Search hackathons"
          className="pl-9"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-1">
          <span className="text-xs font-medium text-muted">Status</span>
          <Select
            value={values.status}
            onChange={(e) => onChange({ status: e.target.value })}
            aria-label="Filter by status"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </label>

        <label className="space-y-1">
          <span className="text-xs font-medium text-muted">Track</span>
          <Select
            value={values.track}
            onChange={(e) => onChange({ track: e.target.value })}
            aria-label="Filter by track"
          >
            <option value="all">All tracks</option>
            {trackTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </Select>
        </label>

        <label className="space-y-1">
          <span className="text-xs font-medium text-muted">From date</span>
          <Input
            type="date"
            value={values.dateFrom}
            onChange={(e) => onChange({ dateFrom: e.target.value })}
            aria-label="Filter from date"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-medium text-muted">To date</span>
          <Input
            type="date"
            value={values.dateTo}
            onChange={(e) => onChange({ dateTo: e.target.value })}
            aria-label="Filter to date"
          />
        </label>
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X className="h-4 w-4" aria-hidden />
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
