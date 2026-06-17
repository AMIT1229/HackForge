import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/Field';

interface TechStackInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  id?: string;
}

/** Token/tag input for the project's tech stack. Add with Enter or comma. */
export function TechStackInput({ value, onChange, id }: TechStackInputProps) {
  const [draft, setDraft] = useState('');

  const add = (raw: string) => {
    const tag = raw.trim().replace(/,$/, '');
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setDraft('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add(draft);
    } else if (e.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="rounded-lg border border-border bg-surface p-2 focus-within:ring-2 focus-within:ring-brand">
      <ul className="mb-1 flex flex-wrap gap-1.5">
        {value.map((tag) => (
          <li
            key={tag}
            className="flex items-center gap-1 rounded-md bg-brand-subtle px-2 py-0.5 text-xs font-medium text-brand"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              aria-label={`Remove ${tag}`}
              className="hover:text-fg"
            >
              <X className="h-3 w-3" />
            </button>
          </li>
        ))}
      </ul>
      <Input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => draft && add(draft)}
        placeholder={value.length ? 'Add more…' : 'React, TypeScript, Postgres…'}
        className="border-0 px-1 focus-visible:ring-0"
        aria-label="Add technology"
      />
    </div>
  );
}
