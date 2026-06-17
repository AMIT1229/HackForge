import { useEffect, useState } from 'react';

/** Returns a debounced copy of `value` that only updates after `delay` ms of
 *  no changes. Used to avoid firing a request on every keystroke. */
export function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
