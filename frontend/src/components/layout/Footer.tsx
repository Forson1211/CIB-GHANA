import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Award, ExternalLink, ChevronDown } from 'lucide-react';
import { CIB_LOGO_URL } from '../../data/mockData';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail('');
    }
  };

  const handleLinkClick = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    document.body.scrollTop = 0;
  };

  return (
    <footer className="bg-[#064225] text-white relative z-20">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* ROW 1: NEWSLETTER SUBSCRIPTION (Matching reference) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 py-10 sm:py-12 border-b border-white/20">
          <div className="space-y-1.5 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
              Subscribe to our Newsletter!
            </h3>
            <p className="text-white/85 text-sm sm:text-base">
              Sign up our newsletter to get update news and articles.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-stretch w-full lg:w-auto max-w-md gap-3 sm:gap-0">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full sm:w-80 px-4 py-3.5 bg-white text-slate-900 placeholder:text-slate-400 rounded-none text-base sm:text-sm outline-none focus:ring-2 focus:ring-[#F5A623]"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#F5A623] hover:bg-[#e09618] text-white font-black uppercase tracking-wider rounded-none text-sm transition-all duration-150 whitespace-nowrap shadow-sm active:scale-95 shrink-0"
            >
              {subscribed ? 'Sent!' : 'Send'}
            </button>
          </form>
        </div>

        {/* ROW 2: LOGO & SOCIAL MEDIA (Matching reference) */}
        <div className="flex items-center justify-between gap-4 py-6 sm:py-8 border-b border-white/20">
          {/* Organization Brand Logo */}
          <Link
            to="/"
            onClick={(e) => {
              if (window.location.pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                document.body.scrollTop = 0;
              } else {
                window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
              }
            }}
            className="inline-block group focus:outline-none shrink-0 cursor-pointer"
          >
            <img
              src="/cib-logo-white.png"
              alt="Chartered Institute of Bankers, Ghana"
              className="h-16 sm:h-20 md:h-[84px] w-auto object-contain group-hover:opacity-90 transition-opacity"
            />
          </Link>

          {/* Social Media Icons */}
          <div className="flex items-center gap-2.5 sm:gap-4 text-white/80 shrink-0">
            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>

            {/* X / Twitter */}
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              aria-label="X"
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* YouTube */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </div>
        </div>

        {/* MOBILE ACCORDION (Visible on screens < md, matches user mockup) */}
        <div className="md:hidden pb-8">
          {/* Section 1: Events */}
          <div className="border-b border-white/20">
            <button
              type="button"
              onClick={() => toggleSection('events')}
              className="w-full py-4 flex items-center justify-between text-left font-bold text-white text-base focus:outline-none"
            >
              <span>Events</span>
              <ChevronDown
                className={`w-5 h-5 text-white/80 transition-transform duration-200 ${
                  openSection === 'events' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openSection === 'events' && (
              <ul className="pb-4 space-y-2.5 text-white/85 text-sm pl-1 animate-in fade-in-50 duration-150">
                <li><Link to="/events" onClick={handleLinkClick} className="hover:text-white transition-colors block py-0.5">Upcoming Events</Link></li>
                <li><Link to="/events/30th-national-banking-ethics-conference-2026" onClick={handleLinkClick} className="hover:text-white transition-colors block py-0.5">Annual Ethics Conference</Link></li>
                <li><Link to="/events" onClick={handleLinkClick} className="hover:text-white transition-colors block py-0.5">Conference Calendar</Link></li>
              </ul>
            )}
          </div>

          {/* Section 2: Delegates */}
          <div className="border-b border-white/20">
            <button
              type="button"
              onClick={() => toggleSection('delegates')}
              className="w-full py-4 flex items-center justify-between text-left font-bold text-white text-base focus:outline-none"
            >
              <span>Delegates</span>
              <ChevronDown
                className={`w-5 h-5 text-white/80 transition-transform duration-200 ${
                  openSection === 'delegates' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openSection === 'delegates' && (
              <ul className="pb-4 space-y-2.5 text-white/85 text-sm pl-1 animate-in fade-in-50 duration-150">
                <li><Link to="/events/30th-national-banking-ethics-conference-2026/register" onClick={handleLinkClick} className="hover:text-white transition-colors block py-0.5">Register for an Event</Link></li>
                <li><Link to="/my-portal" onClick={handleLinkClick} className="hover:text-white transition-colors block py-0.5">Delegate Portal</Link></li>
                <li><Link to="/my-portal" onClick={handleLinkClick} className="hover:text-white transition-colors block py-0.5">Digital Tickets &amp; QR</Link></li>
                <li><Link to="/my-portal" onClick={handleLinkClick} className="hover:text-white transition-colors block py-0.5">CPD Certificates</Link></li>
                <li><Link to="/contact" onClick={handleLinkClick} className="hover:text-white transition-colors block py-0.5">Group &amp; Corporate Booking</Link></li>
              </ul>
            )}
          </div>

          {/* Section 3: Programme */}
          <div className="border-b border-white/20">
            <button
              type="button"
              onClick={() => toggleSection('programme')}
              className="w-full py-4 flex items-center justify-between text-left font-bold text-white text-base focus:outline-none"
            >
              <span>Programme</span>
              <ChevronDown
                className={`w-5 h-5 text-white/80 transition-transform duration-200 ${
                  openSection === 'programme' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openSection === 'programme' && (
              <ul className="pb-4 space-y-2.5 text-white/85 text-sm pl-1 animate-in fade-in-50 duration-150">
                <li><Link to="/speakers" onClick={handleLinkClick} className="hover:text-white transition-colors block py-0.5">Keynote Speakers</Link></li>
                <li><Link to="/events/30th-national-banking-ethics-conference-2026#agenda" onClick={handleLinkClick} className="hover:text-white transition-colors block py-0.5">Agendas &amp; Schedules</Link></li>
                <li><Link to="/resources" onClick={handleLinkClick} className="hover:text-white transition-colors block py-0.5">Conference Resources</Link></li>
                <li><Link to="/#corporate-members" className="hover:text-white transition-colors block py-0.5">Corporate Members</Link></li>
                <li><Link to="/sponsors" onClick={handleLinkClick} className="hover:text-white transition-colors block py-0.5">Corporate Sponsors</Link></li>
                <li><Link to="/contact" onClick={handleLinkClick} className="hover:text-white transition-colors block py-0.5">Become a Sponsor</Link></li>
              </ul>
            )}
          </div>

          {/* Section 4: Support */}
          <div className="border-b border-white/20">
            <button
              type="button"
              onClick={() => toggleSection('support')}
              className="w-full py-4 flex items-center justify-between text-left font-bold text-white text-base focus:outline-none"
            >
              <span>Support</span>
              <ChevronDown
                className={`w-5 h-5 text-white/80 transition-transform duration-200 ${
                  openSection === 'support' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openSection === 'support' && (
              <ul className="pb-4 space-y-2.5 text-white/85 text-sm pl-1 animate-in fade-in-50 duration-150">
                <li><Link to="/contact" onClick={handleLinkClick} className="hover:text-white transition-colors block py-0.5">Event Help &amp; FAQs</Link></li>
                <li><Link to="/contact" onClick={handleLinkClick} className="hover:text-white transition-colors block py-0.5">Payment Assistance</Link></li>
                <li><Link to="/contact" onClick={handleLinkClick} className="hover:text-white transition-colors block py-0.5">Venue &amp; Logistics</Link></li>
                <li><Link to="/contact" onClick={handleLinkClick} className="hover:text-white transition-colors block py-0.5">Terms &amp; Cancellation</Link></li>
              </ul>
            )}
          </div>

          {/* Section 5: Event Secretariat */}
          <div className="border-b border-white/20">
            <button
              type="button"
              onClick={() => toggleSection('secretariat')}
              className="w-full py-4 flex items-center justify-between text-left font-bold text-white text-base focus:outline-none"
            >
              <span>Event Secretariat</span>
              <ChevronDown
                className={`w-5 h-5 text-white/80 transition-transform duration-200 ${
                  openSection === 'secretariat' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openSection === 'secretariat' && (
              <div className="pb-4 space-y-3 text-white/85 text-xs sm:text-sm pl-1 animate-in fade-in-50 duration-150">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">Okponglo-East Legon, Trinity Avenue, Accra, Ghana</span>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <a href="tel:0302541309" className="hover:text-white transition-colors block">0302 541 309</a>
                    <a href="tel:0302541308" className="hover:text-white transition-colors block">0302 541 308</a>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
                  <div>
                    <a href="mailto:events@cibgh.org" className="hover:text-white transition-colors block">events@cibgh.org</a>
                  </div>
                </div>
                <div className="pt-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/15 border border-white/20 text-[11px] text-[#FFE500] font-medium">
                    <Award className="w-3.5 h-3.5" />
                    <span>CPD Accredited Events</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DESKTOP CONTENT COLUMNS (Visible on md and up) */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-8 py-12 text-sm">
          {/* Column 1: Events */}
          <div>
            <h4 className="font-bold text-white text-base">Events</h4>
            <div className="h-[1px] bg-white/20 w-full my-3" />
            <ul className="space-y-2.5 text-white/85">
              <li>
                <Link to="/events" onClick={handleLinkClick} className="hover:text-white transition-colors">
                  Upcoming Events
                </Link>
              </li>
              <li>
                <Link to="/events/30th-national-banking-ethics-conference-2026" onClick={handleLinkClick} className="hover:text-white transition-colors">
                  Annual Ethics Conference
                </Link>
              </li>
              <li>
                <Link to="/events" onClick={handleLinkClick} className="hover:text-white transition-colors">
                  Conference Calendar
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Delegates */}
          <div>
            <h4 className="font-bold text-white text-base">Delegates</h4>
            <div className="h-[1px] bg-white/20 w-full my-3" />
            <ul className="space-y-2.5 text-white/85">
              <li>
                <Link to="/events/30th-national-banking-ethics-conference-2026/register" onClick={handleLinkClick} className="hover:text-white transition-colors">
                  Register for an Event
                </Link>
              </li>
              <li>
                <Link to="/my-portal" onClick={handleLinkClick} className="hover:text-white transition-colors">
                  Delegate Portal
                </Link>
              </li>
              <li>
                <Link to="/my-portal" onClick={handleLinkClick} className="hover:text-white transition-colors">
                  Digital Tickets &amp; QR
                </Link>
              </li>
              <li>
                <Link to="/my-portal" onClick={handleLinkClick} className="hover:text-white transition-colors">
                  CPD Certificates
                </Link>
              </li>
              <li>
                <Link to="/contact" onClick={handleLinkClick} className="hover:text-white transition-colors">
                  Group &amp; Corporate Booking
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Programme */}
          <div>
            <h4 className="font-bold text-white text-base">Programme</h4>
            <div className="h-[1px] bg-white/20 w-full my-3" />
            <ul className="space-y-2.5 text-white/85">
              <li>
                <Link to="/speakers" onClick={handleLinkClick} className="hover:text-white transition-colors">
                  Keynote Speakers
                </Link>
              </li>
              <li>
                <Link to="/events/30th-national-banking-ethics-conference-2026#agenda" onClick={handleLinkClick} className="hover:text-white transition-colors">
                  Agendas &amp; Schedules
                </Link>
              </li>
              <li>
                <Link to="/resources" onClick={handleLinkClick} className="hover:text-white transition-colors">
                  Conference Resources
                </Link>
              </li>
              <li>
                <Link to="/#corporate-members" className="hover:text-white transition-colors">
                  Corporate Members
                </Link>
              </li>
              <li>
                <Link to="/sponsors" onClick={handleLinkClick} className="hover:text-white transition-colors">
                  Corporate Sponsors
                </Link>
              </li>
              <li>
                <Link to="/contact" onClick={handleLinkClick} className="hover:text-white transition-colors">
                  Become a Sponsor
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Support */}
          <div>
            <h4 className="font-bold text-white text-base">Support</h4>
            <div className="h-[1px] bg-white/20 w-full my-3" />
            <ul className="space-y-2.5 text-white/85">
              <li>
                <Link to="/contact" onClick={handleLinkClick} className="hover:text-white transition-colors">
                  Event Help &amp; FAQs
                </Link>
              </li>
              <li>
                <Link to="/contact" onClick={handleLinkClick} className="hover:text-white transition-colors">
                  Payment Assistance
                </Link>
              </li>
              <li>
                <Link to="/contact" onClick={handleLinkClick} className="hover:text-white transition-colors">
                  Venue &amp; Logistics
                </Link>
              </li>
              <li>
                <Link to="/contact" onClick={handleLinkClick} className="hover:text-white transition-colors">
                  Terms &amp; Cancellation
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Event Secretariat */}
          <div className="col-span-2 sm:col-span-1">
            <h4 className="font-bold text-white text-base">Event Secretariat</h4>
            <div className="h-[1px] bg-white/20 w-full my-3" />
            <div className="space-y-3 text-white/85 text-xs sm:text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Okponglo-East Legon, Trinity Avenue, Accra, Ghana
                </span>
              </div>

              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <a href="tel:0302541309" className="hover:text-white transition-colors block">
                    0302 541 309
                  </a>
                  <a
                    href="https://wa.me/233506339248?text=Hello%20CIB%20Ghana%2C%20I%20would%20like%20to%20inquire%20about%20your%20upcoming%20events."
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors block text-[#FFE500] font-semibold"
                  >
                    WhatsApp: 050 633 9248
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <a href="mailto:events@cibgh.org" className="hover:text-white transition-colors block">
                    events@cibgh.org
                  </a>
                  <a href="mailto:info@cibgh.org" className="hover:text-white transition-colors block">
                    info@cibgh.org
                  </a>
                </div>
              </div>

              <div className="pt-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/15 border border-white/20 text-[11px] text-[#FFE500] font-medium">
                  <Award className="w-3.5 h-3.5" />
                  <span>CPD Accredited Events</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 4: BOTTOM COPYRIGHT SUB-FOOTER */}
        <div className="py-6 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/75">
          <p>
            &copy; {new Date().getFullYear()} Chartered Institute of Bankers, Ghana. All Rights Reserved.
          </p>
          <p className="text-white/70 text-center sm:text-right">
            Chartered by the Republic of Ghana under the Chartered Institute of Bankers Act, 2019 (Act 991).
          </p>
        </div>
      </div>
    </footer>
  );
};

