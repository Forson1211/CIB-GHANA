import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
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

// Ensures all screens render at full natural scale (100%)
function DpiScaleManager() {
  useEffect(() => {
    if (document.body) {
      (document.body.style as any).zoom = '1';
    }
  }, []);

  return null;
}

// Disable browser automatic scroll restoration so page transitions and refreshes always start from the top
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

// Helper component to ensure page transitions scroll to top, or smoothly to hash anchor when present
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  React.useLayoutEffect(() => {
    if (hash) {
      const targetId = hash.replace('#', '');
      const scrollToHashElement = () => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return true;
        }
        return false;
      };

      if (!scrollToHashElement()) {
        const timer = setTimeout(scrollToHashElement, 150);
        return () => clearTimeout(timer);
      }
      return;
    }

    // Immediately set scroll to top before browser paint
    const originalBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';

    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Reset scroll on any internal scrollable panels
    const scrollContainers = document.querySelectorAll('.overflow-y-auto, [data-scroll-container]');
    scrollContainers.forEach((el) => {
      el.scrollTop = 0;
    });

    const rafId = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      setTimeout(() => {
        document.documentElement.style.scrollBehavior = originalBehavior;
      }, 50);
    });

    return () => cancelAnimationFrame(rafId);
  }, [pathname, hash]);

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
        <ScrollToTop />
        <LayoutWrapper>
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:slug" element={<EventDetails />} />
            <Route path="/events/:slug/register" element={<Register />} />
            <Route path="/events/:slug/ticket/:id" element={<Ticket />} />
            <Route path="/ticket/:id" element={<Ticket />} />
            <Route path="/speakers" element={<Speakers />} />
            <Route path="/partners" element={<PartnersSponsors />} />
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
