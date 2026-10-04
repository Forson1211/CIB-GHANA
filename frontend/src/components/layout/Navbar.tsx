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
      try {
        sessionStorage.removeItem('cib_home_section');
        sessionStorage.removeItem('cib_active_section');
        sessionStorage.removeItem('cib_last_home_scroll');
        sessionStorage.removeItem('last_home_section');
        sessionStorage.removeItem('last_home_scroll');
      } catch { /* ignore */ }
    } else {
      const lastSection =
        sessionStorage.getItem('cib_home_section') ||
        sessionStorage.getItem('cib_active_section') ||
        sessionStorage.getItem('last_home_section');
      if (lastSection === 'corporate-members') {
        navigate('/#corporate-members');
      } else {
        navigate('/');
      }
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
          label: 'Panels',
          path: '/speakers?type=panel',
        },
        {
          label: 'All Speakers',
          path: '/speakers',
        },
      ],
    },
    {
      title: 'Sponsors',
      links: [
        {
          label: 'Corporate Members',
          path: '/#corporate-members',
        },
        {
          label: 'Corporate Sponsors',
          path: '/sponsors',
        },
        {
          label: 'Become a Sponsor',
          path: '/contact',
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
      className={`z-50 ${
        isHomePage
          ? `fixed top-0 left-0 right-0 transition-[background-color,box-shadow] duration-200 ${
              isScrolled || mobileMenuOpen
                ? 'py-2.5 lg:py-2.5'
                : 'bg-transparent border-none py-2.5 lg:py-4 xl:py-5'
            }`
          : 'sticky top-0 py-2.5 sm:py-3'
      }`}
      style={
        isScrolled || mobileMenuOpen || !isHomePage
          ? {
              backgroundColor: 'rgba(13, 58, 33, 0.97)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.18), 0 8px 32px 0 rgba(0, 0, 0, 0.3)',
            }
          : undefined
      }
    >
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Official Logo */}
          <Link
            to="/"
            onClick={handleHomeNavigation}
            className="flex items-center group focus:outline-none py-0.5 select-none"
          >
            <img
              src="/cib-official-logo.png"
              alt="Chartered Institute of Bankers, Ghana"
              className="h-14 sm:h-16 lg:h-[68px] w-auto max-h-[72px] object-contain hover:brightness-105 transition-opacity"
            />
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
                        className="bg-[#0D3A21] shadow-2xl py-1 rounded-none"
                      >
                        {menu.links.map((link) => (
                          <Link
                            key={link.label}
                            to={link.path}
                            onClick={() => {
                              setActiveDropdown(null);
                              if (link.path.includes('#corporate-members')) {
                                const el = document.getElementById('corporate-members');
                                if (el) {
                                  el.scrollIntoView({ behavior: 'smooth' });
                                }
                              }
                            }}
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
              <span>{registeredUserEmail ? 'ACCESS PASS' : 'REGISTER NOW'}</span>
            </Link>
          </div>

          {/* Mobile Hamburger Button (Gold/Yellow with sharp corners) */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="w-10 h-10 sm:w-11 sm:h-11 text-slate-950 bg-[#FFE500] hover:bg-[#fad800] rounded-none shadow-md focus:outline-none transition-colors flex items-center justify-center cursor-pointer shrink-0"
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            >
              {mobileMenuOpen
                ? <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
                : <Menu className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu — drops down from navbar top */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-dropdown"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="lg:hidden w-full text-white select-none"
            style={{
              backgroundColor: 'rgba(13, 58, 33, 0.97)',
              backdropFilter: 'blur(20px) saturate(160%)',
              WebkitBackdropFilter: 'blur(20px) saturate(160%)',
            }}
          >
            {/* Nav items */}
            <div className="px-4 pt-2 pb-1">
              {/* Home link */}
              <Link
                to="/"
                onClick={handleHomeNavigation}
                className="flex items-center justify-between py-3 border-b border-white/10 text-[#FFE500] font-bold text-[15px]"
              >
                Home
              </Link>

              {/* Dropdown sections with accordion */}
              {navDropdowns.map((menu) => (
                <div key={menu.title} className="border-b border-white/10">
                  <button
                    type="button"
                    onClick={() => handleToggleClick(menu.title)}
                    className="flex items-center justify-between w-full py-3 text-left text-white font-semibold text-[15px] cursor-pointer"
                  >
                    <span>{menu.title}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 opacity-60 ${
                        activeDropdown === menu.title ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {activeDropdown === menu.title && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className="pb-2 pl-3 space-y-0.5">
                          {menu.links.map((link) => (
                            <Link
                              key={link.label}
                              to={link.path}
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setActiveDropdown(null);
                                if (link.path.includes('#corporate-members')) {
                                  const el = document.getElementById('corporate-members');
                                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                                }
                              }}
                              className="block py-2 text-[14px] text-white/75 hover:text-[#FFE500] transition-colors"
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Register CTA */}
            <div className="px-4 py-3">
              <Link
                to={
                  registeredUserEmail
                    ? '/my-portal'
                    : '/events/30th-national-banking-ethics-conference-2026/register'
                }
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-full py-3 bg-gradient-to-r from-[#088d01] via-[#72ac00] to-[#dccb00] hover:brightness-110 active:scale-95 text-white font-black text-sm uppercase tracking-wider shadow-md transition-all"
              >
                <span>{registeredUserEmail ? 'ACCESS PASS' : 'REGISTER NOW'}</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
