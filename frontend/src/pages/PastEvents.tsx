import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Calendar, MapPin, ArrowRight, FileText, Camera, Award } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { formatDateRange } from '../lib/utils';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
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

export const PastEvents: React.FC = () => {
  const { events } = useApp();
  const [selectedYear, setSelectedYear] = useState<string>('ALL');

  // Filter for past events
  const pastEvents = events.filter((e) => e.is_past);

  // Available years
  const years = ['ALL', '2026', '2025', '2024'];

  const filteredPastEvents = pastEvents.filter((e) => {
    if (selectedYear === 'ALL') return true;
    const evtYear = new Date(e.start_date).getFullYear().toString();
    return evtYear === selectedYear;
  });

  return (
    <div className="min-h-screen bg-[#0D3A21] space-y-8 sm:space-y-10 pb-24 text-white">
      {/* Sleek Banner for Past Events (Green to Yellow Gradient & Left-aligned) */}
      <section className="w-full bg-gradient-to-r from-[#088d01] via-[#72ac00] to-[#dccb00] text-white py-10 sm:py-14 relative overflow-hidden shadow-sm">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
        >
          <div className="text-left max-w-3xl space-y-2 sm:space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white uppercase">
              Past Events
            </h1>
            <p className="text-white/95 text-sm sm:text-base leading-relaxed max-w-2xl font-medium">
              Explore moments, conversations, and executive insights from previous CIB Ghana conferences, symposiums, and masterclasses.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Main Page Content */}
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        {/* Year Filter Pills */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-center gap-2"
        >
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-5 py-2 rounded-none text-xs font-bold transition-all cursor-pointer ${
                selectedYear === year
                  ? 'bg-[#008129] text-white font-bold shadow-md'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 shadow-sm'
              }`}
            >
              {year === 'ALL' ? 'All Editions' : `Year ${year}`}
            </button>
          ))}
        </motion.div>

        {/* Past Event Cards Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {filteredPastEvents.map((event) => {
            const eventYear = new Date(event.start_date).getFullYear();

            return (
              <motion.article
                key={event.id}
                variants={cardVariant}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className="group flex flex-col bg-white rounded-none border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                  <img
                    src={event.featured_image}
                    alt={event.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-black bg-cib-charcoal-900 text-white">
                      {eventYear}
                    </span>
                    <Badge variant="green" size="sm" className="bg-white/90 text-cib-green-900 border-none font-bold">
                      {event.category}
                    </Badge>
                  </div>

                  <div className="absolute bottom-3 left-3 flex items-center gap-3 text-white text-xs font-semibold">
                    {event.gallery && event.gallery.length > 0 && (
                      <span className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded">
                        <Camera className="w-3.5 h-3.5 text-cib-gold-400" />
                        {event.gallery.length} Photos
                      </span>
                    )}
                    {event.resources && event.resources.length > 0 && (
                      <span className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded">
                        <FileText className="w-3.5 h-3.5 text-cib-gold-400" />
                        {event.resources.length} Downloads
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6 flex flex-1 flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-cib-green-800 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDateRange(event.start_date, event.end_date)}
                    </p>

                    <h3 className="text-lg font-bold text-cib-charcoal-900 font-display group-hover:text-cib-green-800 transition-colors line-clamp-2">
                      <Link to={`/events/${event.slug}`}>
                        {event.title}
                      </Link>
                    </h3>

                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      {event.venue}, {event.location}
                    </p>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed pt-1">
                      {event.short_description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">
                      Conference Archive
                    </span>
                    <Link
                      to={`/events/${event.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-cib-green-800 hover:text-cib-green-900"
                    >
                      <span>View Proceedings</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};
