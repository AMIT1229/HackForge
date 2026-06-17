import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/** The MSW worker that intercepts network calls in the browser during dev. */
export const worker = setupWorker(...handlers);
