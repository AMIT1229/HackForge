import type { FaqItem } from '@/types';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Accordion } from '@/components/ui/Accordion';

export function Faq({ faqs }: { faqs: FaqItem[] }) {
  return (
    <section id="faq" className="container-page py-16 sm:py-24" aria-labelledby="faq-heading">
      <SectionHeading eyebrow="FAQ" title="Frequently asked questions">
        <span id="faq-heading" className="sr-only">
          Frequently asked questions
        </span>
      </SectionHeading>
      <div className="mx-auto mt-12 max-w-2xl">
        <Accordion items={faqs.map((f) => ({ id: f.id, title: f.question, content: f.answer }))} />
      </div>
    </section>
  );
}
