import type { Sponsor } from '@/types';
import { SectionHeading } from '@/components/common/SectionHeading';
import { cn } from '@/lib/utils';

const tierLabel: Record<Sponsor['tier'], string> = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
};

const tierStyle: Record<Sponsor['tier'], string> = {
  platinum: 'text-lg sm:text-xl',
  gold: 'text-base sm:text-lg',
  silver: 'text-sm sm:text-base',
};

export function Sponsors({ sponsors }: { sponsors: Sponsor[] }) {
  const tiers: Sponsor['tier'][] = ['platinum', 'gold', 'silver'];

  return (
    <section className="border-y border-border bg-surface py-16 sm:py-24" aria-labelledby="sponsors-heading">
      <div className="container-page">
        <SectionHeading
          eyebrow="Sponsors"
          title="Backed by the best in the ecosystem"
          description="Our sponsors provide the prizes, credits, and tooling that make HackForge possible."
        >
          <span id="sponsors-heading" className="sr-only">
            Sponsors
          </span>
        </SectionHeading>

        <div className="mt-12 space-y-8">
          {tiers.map((tier) => {
            const group = sponsors.filter((s) => s.tier === tier);
            if (group.length === 0) return null;
            return (
              <div key={tier}>
                <p className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-muted">
                  {tierLabel[tier]}
                </p>
                <ul className="flex flex-wrap items-center justify-center gap-3">
                  {group.map((s) => (
                    <li
                      key={s.id}
                      className={cn(
                        'flex items-center gap-2 rounded-xl border border-border bg-bg px-5 py-3 font-semibold',
                        tierStyle[tier],
                      )}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full bg-brand"
                        aria-hidden
                      />
                      {s.name}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
