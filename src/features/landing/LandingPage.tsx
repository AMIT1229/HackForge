import { useEvent } from '@/api/hooks';
import { ACTIVE_EVENT_SLUG } from '@/lib/config';
import { ErrorState, LoadingState } from '@/components/ui/States';
import { Hero } from './sections/Hero';
import { About } from './sections/About';
import { Timeline } from './sections/Timeline';
import { PrizesTracks } from './sections/PrizesTracks';
import { Sponsors } from './sections/Sponsors';
import { Faq } from './sections/Faq';

/** Public landing page for the featured (active) hackathon. */
export default function LandingPage() {
  const { data: event, isLoading, isError, refetch } = useEvent(ACTIVE_EVENT_SLUG);

  if (isLoading) {
    return (
      <div className="container-page py-24">
        <LoadingState label="Loading event…" />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="container-page py-24">
        <ErrorState message="We couldn't load the event right now." onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <>
      <Hero event={event} />
      <About />
      <Timeline milestones={event.timeline} />
      <PrizesTracks event={event} />
      <Sponsors sponsors={event.sponsors} />
      <Faq faqs={event.faqs} />
    </>
  );
}
