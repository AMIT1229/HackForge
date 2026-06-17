import { forwardRef, useId, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

const baseField =
  'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg placeholder:text-muted ' +
  'transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ' +
  'focus-visible:ring-offset-bg disabled:opacity-50 aria-[invalid=true]:border-danger';

interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  /** id of the element the error/hint describe, for aria-describedby wiring. */
  describedById?: string;
}

/** Accessible field wrapper: label, optional hint, and an error message wired
 *  with aria-describedby. Use with the inputs below. */
export function Field({ label, htmlFor, error, hint, required, children, describedById }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-fg">
        {label}
        {required && (
          <span className="text-danger" aria-hidden>
            {' '}
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p id={describedById ? `${describedById}-hint` : undefined} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={describedById ? `${describedById}-error` : undefined}
          role="alert"
          className="text-xs font-medium text-danger"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(baseField, className)} {...props} />;
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn(baseField, 'min-h-24 resize-y', className)} {...props} />;
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select ref={ref} className={cn(baseField, 'cursor-pointer', className)} {...props}>
        {children}
      </select>
    );
  },
);

/** Convenience hook to generate a stable id when a caller doesn't supply one. */
// eslint-disable-next-line react-refresh/only-export-components
export function useFieldId(provided?: string): string {
  const generated = useId();
  return provided ?? generated;
}
