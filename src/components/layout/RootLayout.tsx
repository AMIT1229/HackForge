import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Toaster } from './Toaster';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

/** App shell: skip link, navbar, routed content, footer, toaster, and the
 *  realtime notification engine. Scrolls to top on navigation. */
export function RootLayout() {
  const { pathname } = useLocation();
  useRealtimeNotifications();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="flex flex-1 flex-col">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}
