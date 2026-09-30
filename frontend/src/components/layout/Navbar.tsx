import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { registeredUserEmail } = useApp();

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos =
        window.scrollY ||
        window.pageYOffset ||
        document.documentElement?.scrollTop ||
        document.body?.scrollTop ||
        0;
      // Immediately show the solid brand green navbar as soon as the user starts scrolling
      setIsScrolled(scrollPos > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    document.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      document.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname]);

  // Close menus on page navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, [location.pathname, location.search, location.hash]);

  // Click outside and ESC key listener to reliably close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = (menuTitle: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(menuTitle);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const handleToggleClick = (menuTitle: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown((prev) => (prev === menuTitle ? null : menuTitle));
  };

  const handleHomeNavigation = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    setActiveDropdown(null);

    if (location.pathname === '/') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      document.body.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } else {
      navigate('/');
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      document.body.scrollTop = 0;
    }
  };

  const navDropdowns = [
    {
      title: 'Programme',
      links: [
        {
          label: 'Schedule & Agenda',
          path: '/events/30th-national-banking-ethics-conference-2026#agenda',
        },
        {
          label: '30th Ethics Conference',
          path: '/events/30th-national-banking-ethics-conference-2026',
        },
        {
          label: 'All Events',
          path: '/events',
        },
        {
          label: 'Past Editions',
          path: '/past-events',
        },
      ],
    },
    {
      title: 'Speakers',
      links: [
        {
          label: 'Keynote Speakers',
          path: '/speakers?type=keynote',
        },
        {
          label: 'Panels & Faculty',
          path: '/speakers?type=faculty',
        },
        {
          label: 'All Speakers',
          path: '/speakers',
        },
      ],
    },
    {
      title: 'Exhibition & Sponsors',
      links: [
        {
          label: 'Partners',
          path: '/partners',
        },
        {
          label: 'Sponsors',
          path: '/sponsors',
        },
      ],
    },
    {
      title: 'Resources',
      links: [
        {
          label: 'Conference Papers',
          path: '/resources',
        },
        {
          label: 'Delegate Portal',
          path: '/my-portal',
        },
        {
          label: 'Contact Us',
          path: '/contact',
        },
      ],
    },
  ];

  return (
    <header
      className={`transition-all duration-300 z-50 ${
        isHomePage
          ? `fixed top-0 left-0 right-0 ${
              isScrolled || mobileMenuOpen
                ? 'bg-[#0D3A21] shadow-2xl border-b border-white/10 py-2 sm:py-2.5'
                : 'bg-transparent border-none py-4 sm:py-5'
            }`
          : 'sticky top-0 bg-[#0D3A21] border-b border-white/10 shadow-xl py-2.5 sm:py-3'
      }`}
    >
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Wordmark matching reference screenshot (no crest logo) */}
          <Link
            to="/"
            onClick={handleHomeNavigation}
            className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none py-1 select-none"
          >
            {/* Stacked Wordmark in exact reference screenshot style */}
            <div className="flex flex-col text-left font-black tracking-tight leading-none uppercase">
              <span className="text-[#FFE500] text-[13px] sm:text-[15px] font-black tracking-wider drop-shadow-sm">
                CIB GHANA
              </span>
              <span className="text-white text-[15px] sm:text-[17px] font-black tracking-wider leading-none mt-0.5">
                BANKING &amp; ETHICS
              </span>
              <span className="text-white text-[13px] sm:text-[15px] font-black tracking-wider leading-none mt-0.5">
                CONFERENCE
              </span>
            </div>

            {/* Vertical Date Divider */}
            <div className="self-stretch w-[1.5px] bg-white/40 mx-0.5 sm:mx-1 my-0.5" />

            {/* Stacked Date */}
            <div className="flex flex-col justify-center text-left text-white leading-none font-extrabold uppercase">
              <span className="text-[13px] sm:text-[15px] tracking-tight">9-10</span>
              <span className="text-[13px] sm:text-[15px] tracking-tight mt-0.5">NOV</span>
              <span className="text-[13px] sm:text-[15px] tracking-tight mt-0.5">2026</span>
            </div>
          </Link>

          {/* Desktop Navigation Links matching screenshot */}
          <nav ref={navRef} className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navDropdowns.map((menu) => (
              <div
                key={menu.title}
                className="relative"
                onMouseEnter={() => handleMouseEnter(menu.title)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => handleToggleClick(menu.title)}
                  aria-expanded={activeDropdown === menu.title}
                  className={`flex items-center gap-1.5 px-3 py-2 text-[14px] xl:text-[15px] font-medium transition-colors focus:outline-none cursor-pointer rounded-none ${
                    activeDropdown === menu.title
                      ? 'text-[#FFE500]'
                      : 'text-white/95 hover:text-[#FFE500]'
                  }`}
                >
                  <span>{menu.title}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      activeDropdown === menu.title ? 'rotate-180 text-[#FFE500]' : 'opacity-80'
                    }`}
                  />
                </button>

                {/* Dropdown Menu - solid background color, not glass, no round edges, simple words, no sub-text */}
                <AnimatePresence>
                  {activeDropdown === menu.title && (
                    <div
                      className="absolute top-full left-0 pt-1.5 z-50 min-w-[210px]"
                      onMouseEnter={() => handleMouseEnter(menu.title)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 3 }}
                        transition={{ duration: 0.12, ease: 'easeOut' }}
                        className="bg-[#0D3A21] border border-[#1b5835] shadow-2xl py-1 rounded-none"
                      >
                        {menu.links.map((link) => (
                          <Link
                            key={link.label}
                            to={link.path}
                            onClick={() => setActiveDropdown(null)}
                            className="block px-4 py-2.5 rounded-none text-[13.5px] font-semibold text-white/95 hover:text-[#FFE500] hover:bg-[#144f2e] transition-colors whitespace-nowrap cursor-pointer"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* Right Action Button with Green and Yellow Gradient */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to={
                registeredUserEmail
                  ? '/my-portal'
                  : '/events/30th-national-banking-ethics-conference-2026/register'
              }
              className="inline-flex items-center justify-center px-5 sm:px-6 py-2.5 rounded-none bg-gradient-to-r from-[#088d01] via-[#72ac00] to-[#dccb00] hover:brightness-110 active:scale-95 text-white font-black text-xs sm:text-[13px] uppercase tracking-wider transition-all duration-200 shadow-md"
            >
              <span>{registeredUserEmail ? 'ACCESS PASS' : 'GET YOUR PASS NOW'}</span>
            </Link>
          </div>

          {/* Mobile Hamburger Button (Gold/Yellow with sharp corners) */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className={`p-2 sm:p-2.5 text-slate-950 bg-[#FFE500] hover:bg-[#fad800] active:scale-95 rounded-none shadow-md focus:outline-none transition-all flex items-center justify-center cursor-pointer ${
                mobileMenuOpen ? 'opacity-0 pointer-events-none' : ''
              }`}
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer Overlay (Swipes in from left, covers screen partially but not full screen) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Darkened backdrop overlay for right side */}
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 lg:hidden"
            />

            {/* Side Drawer sliding from left - ultra fast and smooth */}
            <motion.div
              key="mobile-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 left-0 z-50 w-[84vw] max-w-[360px] bg-[#0D3A21] border-r border-white/15 shadow-2xl flex flex-col justify-between text-white lg:hidden overflow-hidden select-none will-change-transform transform-gpu"
            >
              {/* Top Header matching reference */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10 shrink-0 bg-[#0D3A21]">
                <Link
                  to="/"
                  onClick={handleHomeNavigation}
                  className="flex items-center gap-2 group select-none"
                >
                  <div className="flex flex-col text-left font-black tracking-tight leading-none uppercase">
                    <span className="text-[#FFE500] text-[11px] font-black tracking-wider">
                      CIB GHANA
                    </span>
                    <span className="text-white text-[13px] font-black tracking-wider leading-none mt-0.5">
                      BANKING &amp; ETHICS
                    </span>
                    <span className="text-white text-[11px] font-black tracking-wider leading-none mt-0.5">
                      CONFERENCE
                    </span>
                  </div>

                  <div className="self-stretch w-[1.5px] bg-white/40 mx-0.5 my-0.5" />

                  <div className="flex flex-col justify-center text-left text-white leading-none font-extrabold uppercase">
                    <span className="text-[11px] tracking-tight">9-10</span>
                    <span className="text-[11px] tracking-tight mt-0.5">NOV</span>
                    <span className="text-[11px] tracking-tight mt-0.5">2026</span>
                  </div>
                </Link>

                {/* Yellow Square Close Button matching screenshot */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-10 h-10 bg-[#FFE500] hover:bg-[#fad800] active:scale-95 text-slate-950 flex items-center justify-center rounded-none shadow-md cursor-pointer shrink-0"
                  aria-label="Close Navigation Menu"
                >
                  <X className="w-6 h-6 stroke-[2.5]" />
                </button>
              </div>

              {/* Scrollable Navigation Categories */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {navDropdowns.map((menu) => (
                  <div key={menu.title} className="border-b border-white/10 pb-3">
                    <div className="text-xs uppercase font-black tracking-wider text-[#FFE500] px-2 py-1">
                      {menu.title}
                    </div>
                    <div className="space-y-0.5 mt-1">
                      {menu.links.map((link) => (
                        <Link
                          key={link.label}
                          to={link.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-2 py-1.5 text-sm font-semibold text-white/90 hover:text-[#FFE500] hover:bg-white/[0.04] transition-colors"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Sticky Action Banner matching screenshot */}
              <div className="p-3 border-t border-white/10 shrink-0 bg-[#0D3A21]">
                <Link
                  to={
                    registeredUserEmail
                      ? '/my-portal'
                      : '/events/30th-national-banking-ethics-conference-2026/register'
                  }
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full py-3.5 rounded-none bg-gradient-to-r from-[#088d01] via-[#72ac00] to-[#dccb00] hover:brightness-110 active:scale-95 text-white font-black text-sm uppercase tracking-wider shadow-lg transition-all"
                >
                  <span>{registeredUserEmail ? 'ACCESS PASS' : 'GET YOUR PASS NOW'}</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
