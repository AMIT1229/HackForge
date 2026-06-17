import { useMemo, useState } from 'react';
import { CalendarSearch } from 'lucide-react';
import { useEvents } from '@/api/hooks';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { Pagination } from '@/components/common/Pagination';
import { EventCard, EventCardSkeleton } from './components/EventCard';
import { EventFiltersBar, type EventFilterValues } from './components/EventFiltersBar';
import { RecommendedSection } from './components/RecommendedSection';

const PAGE_SIZE = 6;
const TRACK_TAGS = ['AI', 'Web3', 'DevTools', 'Open'];

const INITIAL_FILTERS: EventFilterValues = {
  search: '',
  status: 'all',
  track: 'all',
  dateFrom: '',
  dateTo: '',
};

/** Browsable catalog of all hackathons with search, filtering and pagination. */
export default function EventListingPage() {
  const [filters, setFilters] = useState<EventFilterValues>(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(filters.search, 350);

  const queryFilters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      status: filters.status,
      track: filters.track,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [debouncedSearch, filters.status, filters.track, filters.dateFrom, filters.dateTo, page],
  );

  const { data, isLoading, isError, isFetching, refetch } = useEvents(queryFilters);

  const patchFilters = (patch: Partial<EventFilterValues>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setPage(1);
  };

  return (
    <div className="container-page py-8 lg:py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Explore Hackathons</h1>
        <p className="mt-1 text-muted">
          Discover upcoming, active and past events across the BeetleX network.
        </p>
      </header>

      <RecommendedSection />

      <div className="mb-6">
        <EventFiltersBar
          values={filters}
          trackTags={TRACK_TAGS}
          onChange={patchFilters}
          onReset={resetFilters}
        />
      </div>

      {isError ? (
        <ErrorState message="We couldn't load events." onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={<CalendarSearch className="h-6 w-6" />}
          title="No hackathons found"
          message="Try adjusting your filters or search terms."
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-muted" aria-live="polite">
            Showing {data.items.length} of {data.total} event{data.total === 1 ? '' : 's'}
          </p>
          <div
            className={`grid gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${
              isFetching ? 'opacity-60' : ''
            }`}
          >
            {data.items.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          <div className="mt-8">
            <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}
