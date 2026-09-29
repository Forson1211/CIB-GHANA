import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { MOCK_CATEGORIES } from '../data/mockData';
import { EventCard } from '../components/events/EventCard';
import { Button } from '../components/ui/Button';
import { Search, Filter, SlidersHorizontal, Calendar, MapPin, DollarSign, X } from 'lucide-react';
import { AttendanceType } from '../types';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
};

export const Events: React.FC = () => {
  const { events } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [priceFilter, setPriceFilter] = useState<'ALL' | 'FREE' | 'PAID'>('ALL');
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Distinct locations
  const locations = useMemo(() => {
    const locs = Array.from(new Set(events.map((e) => e.location)));
    return ['ALL', ...locs];
  }, [events]);

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      // Don't show past events in upcoming discovery by default unless specifically asked
      if (e.is_past) return false;
      if (e.status === 'DRAFT') return false;

      // Category filter
      if (selectedCategory !== 'ALL' && e.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Attendance type filter
      if (selectedType !== 'ALL' && e.event_type !== selectedType) {
        return false;
      }

      // Price filter
      if (priceFilter === 'FREE' && e.registration_fee > 0) return false;
      if (priceFilter === 'PAID' && e.registration_fee === 0) return false;

      // Location filter
      if (selectedLocation !== 'ALL' && e.location !== selectedLocation) return false;

      // Search Query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesTitle = e.title.toLowerCase().includes(q);
        const matchesDesc = e.description.toLowerCase().includes(q);
        const matchesVenue = e.venue.toLowerCase().includes(q);
        const matchesThemes = e.themes?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesVenue && !matchesThemes) return false;
      }

      return true;
    });
  }, [events, selectedCategory, selectedType, priceFilter, selectedLocation, searchQuery]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedType('ALL');
    setPriceFilter('ALL');
    setSelectedLocation('ALL');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCategory !== 'ALL' ||
    selectedType !== 'ALL' ||
    priceFilter !== 'ALL' ||
    selectedLocation !== 'ALL';

  return (
    <div className="min-h-screen bg-[#0D3A21] space-y-8 sm:space-y-10 pb-24 text-white">
      {/* Sleek Banner for Programmes (Green to Yellow Gradient & Left-aligned) */}
      <section className="w-full bg-gradient-to-r from-[#088d01] via-[#72ac00] to-[#dccb00] text-white py-10 sm:py-14 relative overflow-hidden shadow-sm">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
        >
          <div className="text-left max-w-3xl space-y-2 sm:space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white uppercase">
              Events
            </h1>
            <p className="text-white/95 text-sm sm:text-base leading-relaxed max-w-2xl font-medium">
              Browse CIB Ghana's accredited conferences, executive workshops, risk masterclasses, and networking forums.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Main Page Content (Aligned with site) */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        {/* Search & Filter Toolbar (Crisp White Card on Brand Green Background) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="bg-white p-6 rounded-none border border-slate-200 space-y-4 shadow-xl text-slate-800"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search events by title, topic, theme, or venue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-none border border-slate-200 text-base sm:text-xs focus:border-[#008129] focus:outline-none bg-slate-50 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-2 md:pb-0">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3.5 py-1.5 rounded-none text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === 'ALL'
                    ? 'bg-[#008129] text-white font-bold shadow-xs'
                    : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              {MOCK_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3.5 py-1.5 rounded-none text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory.toLowerCase() === cat.name.toLowerCase()
                      ? 'bg-[#008129] text-white font-bold shadow-xs'
                      : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Event Type / Mode */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-1.5 rounded-none border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-[#008129]"
              >
                <option value="ALL">All Modes (In-Person / Virtual)</option>
                <option value="PHYSICAL">In-Person Only</option>
                <option value="VIRTUAL">Virtual Only</option>
                <option value="HYBRID">Hybrid</option>
              </select>

              {/* Price Filter */}
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value as any)}
                className="px-3 py-1.5 rounded-none border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-[#008129]"
              >
                <option value="ALL">All Pricing (Free & Paid)</option>
                <option value="FREE">Free Admission</option>
                <option value="PAID">Paid Events</option>
              </select>

              {/* Location */}
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-3 py-1.5 rounded-none border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-[#008129]"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc === 'ALL' ? 'All Locations' : loc}
                  </option>
                ))}
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-[#008129] hover:text-[#006821] font-bold ml-2 cursor-pointer transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Clear filters
                </button>
              )}
            </div>

            <div className="text-slate-500 font-medium">
              Showing <strong className="text-slate-900">{filteredEvents.length}</strong> available events
            </div>
          </div>
        </motion.div>

        {/* Events Results Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-none border border-slate-200 space-y-4 text-slate-900 shadow-xl">
            <Search className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-xl font-bold text-slate-900">No Matching Events Found</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Try adjusting your search criteria or resetting filters to explore all CIB Ghana calendar events.
            </p>
            <Button variant="primary" size="md" onClick={clearFilters}>
              Reset All Filters
            </Button>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {filteredEvents.map((event) => (
              <motion.div
                key={event.id}
                variants={cardVariant}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
              >
                <EventCard event={event} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};
