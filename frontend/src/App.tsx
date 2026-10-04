import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigationType, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { Home } from './pages/Home';
import { Events } from './pages/Events';
import { EventDetails } from './pages/EventDetails';
import { Register } from './pages/Register';
import { Ticket } from './pages/Ticket';
import { Speakers } from './pages/Speakers';
import { PastEvents } from './pages/PastEvents';
import { Resources } from './pages/Resources';
import { Contact } from './pages/Contact';

import { PartnersSponsors } from './pages/PartnersSponsors';
import { MyPortal } from './pages/MyPortal';
import { NotFound } from './pages/NotFound';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminEvents } from './pages/admin/AdminEvents';
import { AdminEventCreate } from './pages/admin/AdminEventCreate';
import { AdminRegistrations } from './pages/admin/AdminRegistrations';
import { AdminCheckIn } from './pages/admin/AdminCheckIn';
import { AdminSpeakers } from './pages/admin/AdminSpeakers';
import { AdminSponsors } from './pages/admin/AdminSponsors';
import { AdminPayments } from './pages/admin/AdminPayments';
import { AdminCertificates } from './pages/admin/AdminCertificates';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminResources } from './pages/admin/AdminResources';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminGuard } from './components/auth/AdminGuard';

import { ScrollProgressBar } from './components/ui/ScrollProgressBar';
import { WhatsAppWidget } from './components/chat/WhatsAppWidget';
import { ChatbotWidget } from './components/chat/ChatbotWidget';
import { saveCurrentHomeSection, setRestorationInProgress } from './utils/scrollSections';

// Ensures all screens render at full natural scale (100%)
function DpiScaleManager() {
  useEffect(() => {
    if (document.body) {
      (document.body.style as any).zoom = '1';
    }
  }, []);

  return null;
}

// Prevent browser from auto-restoring mid-page scroll position on page refresh
if (typeof window !== 'undefined') {
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }

  window.addEventListener('beforeunload', () => {
    if (window.location.pathname === '/') {
      try {
        sessionStorage.removeItem('cib_last_home_scroll');
        sessionStorage.removeItem('cib_home_section');
        sessionStorage.removeItem('cib_active_section');
        sessionStorage.removeItem('cib_scroll_path_/');
      } catch {}
    }
  });
}

// Memory cache of scroll positions by location key
const scrollHistory = new Map<string, number>();

// Reusable multi-attempt scroll to an element with navbar offset
function scrollToElementWithRetry(
  targetId: string,
  options: { smooth?: boolean; maxTries?: number; offset?: number } = {}
) {
  const { smooth = false, maxTries = 35, offset = 80 } = options;
  setRestorationInProgress(true);
  let tries = 0;
  let stableCount = 0;
  let lastTop = -9999;

  const attempt = () => {
    const el = document.getElementById(targetId);
    if (el) {
      // 1. Native scrollIntoView handles scroll-mt-24 perfectly
      el.scrollIntoView({ behavior: 'instant', block: 'start' });

      // 2. Fine-tune with exact bounding rect to guarantee 80px navbar offset
      const rect = el.getBoundingClientRect();
      const currentScrollY = window.scrollY || document.documentElement.scrollTop || 0;
      const targetY = Math.max(0, currentScrollY + rect.top - offset);
      const diff = Math.abs(rect.top - offset);

      if (diff > 8) {
        window.scrollTo({
          top: targetY,
          behavior: 'instant',
        });
        document.documentElement.scrollTop = targetY;
        document.body.scrollTop = targetY;
        stableCount = 0;
      } else {
        if (Math.abs(rect.top - lastTop) < 3) {
          stableCount++;
        } else {
          stableCount = 0;
        }
      }
      lastTop = rect.top;

      tries++;
      // Keep verifying position until stable across layout shifts
      if (tries < maxTries && (stableCount < 5 || diff > 8)) {
        setTimeout(attempt, tries < 8 ? 40 : 80);
      } else {
        setTimeout(() => setRestorationInProgress(false), 800);
      }
    } else {
      tries++;
      if (tries < maxTries) {
        setTimeout(attempt, 50);
      } else {
        setRestorationInProgress(false);
      }
    }
  };

  attempt();
}

// Reusable multi-attempt scroll to a numeric Y offset (retries as document height grows)
function scrollToYWithRetry(targetY: number, maxTries = 12) {
  let tries = 0;

  const attempt = () => {
    const maxScroll = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      0
    );
    const scrollVal = Math.min(targetY, maxScroll);
    window.scrollTo({ top: scrollVal, behavior: 'instant' });

    tries++;
    if (tries < maxTries && maxScroll < targetY - 50) {
      setTimeout(attempt, 80);
    }
  };

  attempt();
}

// Intelligent ScrollManager that preserves and restores section positions
function ScrollManager() {
  const location = useLocation();
  const navType = useNavigationType();

  // 1. Observe active sections and track scroll position continuously
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY;
          scrollHistory.set(location.key, y);
          try {
            sessionStorage.setItem('cib_scroll_' + location.key, String(y));
            sessionStorage.setItem('cib_scroll_path_' + location.pathname, String(y));

            // If on homepage, track active section and scroll position
            if (location.pathname === '/') {
              saveCurrentHomeSection();
            }
          } catch {
            // Ignore potential storage quota errors
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Track visible sections using IntersectionObserver for high precision
    let observer: IntersectionObserver | null = null;
    const observedSectionIds = [
      'corporate-members',
      'hero-section',
      'themes',
      'speakers',
      'leadership',
      'why-attend',
      'venue-highlights',
      'the-venue',
      'early-bird',
    ];

    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
              const secId = entry.target.id;
              if (secId) {
                try {
                  sessionStorage.setItem('cib_active_section', secId);
                  if (location.pathname === '/') {
                    sessionStorage.setItem('cib_home_section', secId);
                  }
                } catch { /* ignore */ }
              }
            }
          });
        },
        {
          rootMargin: '-10% 0px -20% 0px',
          threshold: [0.25, 0.5, 0.75],
        }
      );

      observedSectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el && observer) {
          observer.observe(el);
        }
      });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [location.key, location.pathname]);

  // 2. Handle Navigation and Scroll Restoration
  React.useLayoutEffect(() => {
    // A. Detect page reload / browser refresh
    const isReload = (() => {
      try {
        const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        if (navEntries && navEntries.length > 0) {
          return navEntries[0].type === 'reload';
        }
        return (performance as any).navigation?.type === 1;
      } catch {
        return false;
      }
    })();

    // When refreshing on the Home screen without an explicit hash, always reset to the top
    if (location.pathname === '/' && isReload && !location.hash) {
      try {
        sessionStorage.removeItem('cib_last_home_scroll');
        sessionStorage.removeItem('cib_home_section');
        sessionStorage.removeItem('cib_active_section');
        sessionStorage.removeItem('cib_scroll_path_/');
      } catch {}

      const resetTop = () => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      };

      resetTop();
      requestAnimationFrame(resetTop);
      setTimeout(resetTop, 50);
      setTimeout(resetTop, 150);
      return;
    }

    // B. Explicit hash is present in URL (e.g. /#speakers, /#corporate-members)
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      scrollToElementWithRetry(targetId, { smooth: false, offset: 80 });
      return;
    }

    // C. Returning via browser Back / Forward (POP navigation) or navigate(-1)
    if (navType === 'POP') {
      // If returning to Home ('/') and user left while at a specific section (e.g. speakers)
      if (location.pathname === '/') {
        const savedSection =
          sessionStorage.getItem('cib_home_section') ||
          sessionStorage.getItem('cib_active_section');

        if (savedSection && savedSection !== 'hero-section') {
          scrollToElementWithRetry(savedSection, { smooth: false, offset: 80 });
          return;
        }

        const savedHomeY =
          sessionStorage.getItem('cib_last_home_scroll') ||
          sessionStorage.getItem('cib_scroll_' + location.key);

        if (savedHomeY && Number(savedHomeY) > 200) {
          scrollToYWithRetry(Number(savedHomeY));
          return;
        }
      }

      // If returning to any other route, restore saved scroll position
      const savedKeyY =
        scrollHistory.get(location.key) ??
        (sessionStorage.getItem('cib_scroll_' + location.key)
          ? Number(sessionStorage.getItem('cib_scroll_' + location.key))
          : null);

      if (savedKeyY != null && !isNaN(savedKeyY) && savedKeyY > 50) {
        scrollToYWithRetry(savedKeyY);
        return;
      }

      const savedPathY = sessionStorage.getItem('cib_scroll_path_' + location.pathname);
      if (savedPathY && Number(savedPathY) > 50) {
        scrollToYWithRetry(Number(savedPathY));
        return;
      }
      return;
    }

    // C. Returning to Home ('/') from another page via link / button (PUSH navigation)
    if (location.pathname === '/') {
      const savedSection =
        sessionStorage.getItem('cib_home_section') ||
        sessionStorage.getItem('cib_active_section');

      if (savedSection && savedSection !== 'hero-section') {
        scrollToElementWithRetry(savedSection, { smooth: false, offset: 80 });
        return;
      }

      const savedHomeY = sessionStorage.getItem('cib_last_home_scroll');
      if (savedHomeY && Number(savedHomeY) > 250) {
        scrollToYWithRetry(Number(savedHomeY));
        return;
      }
    }

    // D. Fresh page navigation (e.g. user clicks /speakers, /contact, or /events): reliably open from the very top
    if (location.pathname !== '/') {
      document.documentElement.style.scrollBehavior = 'auto';
      const resetTop = () => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      };

      resetTop();
      requestAnimationFrame(resetTop);
      setTimeout(resetTop, 20);
      setTimeout(resetTop, 60);
      setTimeout(resetTop, 150);
      setTimeout(() => {
        document.documentElement.style.scrollBehavior = '';
      }, 200);

      const scrollContainers = document.querySelectorAll('.overflow-y-auto, [data-scroll-container]');
      scrollContainers.forEach((el) => {
        el.scrollTop = 0;
      });
    }
  }, [location.pathname, location.hash, location.key, navType]);

  return null;
}

// Layout wrapper that excludes public Navbar and Footer on admin paths
function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isAdminRoute ? 'bg-slate-100 text-cib-charcoal-900' : 'bg-[#0D3A21] text-white'
      } relative`}
    >
      <ScrollProgressBar />
      {!isAdminRoute && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && (
        <>
          <WhatsAppWidget />
          <ChatbotWidget />
        </>
      )}
    </div>
  );
}

export function App() {
  return (
    <AppProvider>
      <Router>
        <DpiScaleManager />
        <ScrollManager />
        <LayoutWrapper>
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/corporate-members" element={<Navigate to="/#corporate-members" replace />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:slug" element={<EventDetails />} />
            <Route path="/events/:slug/register" element={<Register />} />
            <Route path="/events/:slug/ticket/:id" element={<Ticket />} />
            <Route path="/ticket/:id" element={<Ticket />} />
            <Route path="/speakers" element={<Speakers />} />
            <Route path="/partners" element={<Navigate to="/sponsors" replace />} />
            <Route path="/sponsors" element={<PartnersSponsors />} />

            <Route path="/past-events" element={<PastEvents />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Navigate to="/my-portal" replace />} />
            <Route path="/register" element={<Navigate to="/events" replace />} />
            {/* /dashboard redirects to the attendee portal */}
            <Route path="/dashboard" element={<Navigate to="/my-portal" replace />} />
            <Route path="/my-portal" element={<MyPortal />} />

            {/* Admin Authentication */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
            <Route path="/admin/events" element={<AdminGuard><AdminEvents /></AdminGuard>} />
            <Route path="/admin/events/create" element={<AdminGuard><AdminEventCreate /></AdminGuard>} />
            <Route path="/admin/events/:id/edit" element={<AdminGuard><AdminEventCreate /></AdminGuard>} />
            <Route path="/admin/registrations" element={<AdminGuard><AdminRegistrations /></AdminGuard>} />
            <Route path="/admin/attendees" element={<AdminGuard><AdminRegistrations /></AdminGuard>} />
            <Route path="/admin/speakers" element={<AdminGuard><AdminSpeakers /></AdminGuard>} />
            <Route path="/admin/sponsors" element={<AdminGuard><AdminSponsors /></AdminGuard>} />
            <Route path="/admin/agenda" element={<AdminGuard><AdminEvents /></AdminGuard>} />
            <Route path="/admin/payments" element={<AdminGuard><AdminPayments /></AdminGuard>} />
            <Route path="/admin/check-in" element={<AdminGuard><AdminCheckIn /></AdminGuard>} />
            <Route path="/admin/certificates" element={<AdminGuard><AdminCertificates /></AdminGuard>} />
            <Route path="/admin/resources" element={<AdminGuard><AdminResources /></AdminGuard>} />
            <Route path="/admin/analytics" element={<AdminGuard><AdminAnalytics /></AdminGuard>} />
            <Route path="/admin/settings" element={<AdminGuard><AdminSettings /></AdminGuard>} />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </LayoutWrapper>
      </Router>
    </AppProvider>
  );
}

export default App;
