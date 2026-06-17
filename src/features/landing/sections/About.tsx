import { Code2, Rocket, Users2, Sparkles } from 'lucide-react';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Card, CardContent } from '@/components/ui/Card';

const HIGHLIGHTS = [
  {
    icon: Code2,
    title: 'Build something real',
    body: 'Ship a working product in 48 hours — not slides. Mentors help you go from idea to demo.',
  },
  {
    icon: Users2,
    title: 'For every developer',
    body: 'Students, professionals, solo hackers, and full teams. Beginners are genuinely welcome.',
  },
  {
    icon: Rocket,
    title: 'Career fast-track',
    body: 'Top teams get fast-track interviews and a spot in the BeetleX builder residency.',
  },
  {
    icon: Sparkles,
    title: 'Real prizes & credits',
    body: 'Cash prizes, infrastructure credits, and tooling from our sponsor network.',
  },
];

export function About() {
  return (
    <section className="container-page py-16 sm:py-24" aria-labelledby="about-heading">
      <SectionHeading
        eyebrow="About"
        title="A hackathon developers actually want to attend"
        description="HackForge brings together builders from across the Web3 and AI communities for a weekend of focused, high-energy creation. No fluff — just great problems, great people, and the tools to ship."
      >
        <span id="about-heading" className="sr-only">
          About the hackathon
        </span>
      </SectionHeading>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {HIGHLIGHTS.map((h) => (
          <Card key={h.title}>
            <CardContent className="space-y-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-subtle text-brand">
                <h.icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="font-semibold">{h.title}</h3>
              <p className="text-sm text-muted">{h.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
