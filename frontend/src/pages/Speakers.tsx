import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { SpeakerCard } from '../components/events/SpeakerCard';
import { SpeakerModal } from '../components/events/SpeakerModal';
import { Speaker } from '../types';
import { Search, Mic } from 'lucide-react';

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
      delayChildren: 0.05,
    },
  },
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
};

export const Speakers: React.FC = () => {
  const { speakers } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const typeFilter = searchParams.get('type') || 'all';
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState('ALL');

  // Extract all unique expertise tags
  const allExpertise = useMemo(() => {
    const set = new Set<string>();
    speakers.forEach((s) => s.expertise?.forEach((e) => set.add(e)));
    return ['ALL', ...Array.from(set)];
  }, [speakers]);

  // Filter speakers
  const filteredSpeakers = useMemo(() => {
    return speakers.filter((spk) => {
      // Role filter from dropdown links (?type=keynote or ?type=faculty)
      if (typeFilter === 'keynote' && !spk.is_keynote) return false;
      if (typeFilter === 'faculty' && spk.is_keynote) return false;

      const matchesExpertise =
        selectedExpertise === 'ALL' || spk.expertise?.includes(selectedExpertise);

      const q = searchQuery.toLowerCase();
      const matchesQuery =
        searchQuery === '' ||
        spk.name.toLowerCase().includes(q) ||
        spk.organization.toLowerCase().includes(q) ||
        spk.position.toLowerCase().includes(q) ||
        spk.biography.toLowerCase().includes(q);

      return matchesExpertise && matchesQuery;
    });
  }, [speakers, typeFilter, selectedExpertise, searchQuery]);

  return (
    <div className="min-h-screen bg-[#0D3A21] space-y-8 sm:space-y-10 pb-24 text-white">
      {/* Sleek Banner for Speakers (Green to Yellow Gradient & Left-aligned) */}
      <section className="w-full bg-gradient-to-r from-[#088d01] via-[#72ac00] to-[#dccb00] text-white py-10 sm:py-14 relative overflow-hidden shadow-sm">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
        >
          <div className="text-left max-w-3xl space-y-2 sm:space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white uppercase">
              Speakers
            </h1>
            <p className="text-white/95 text-sm sm:text-base leading-relaxed max-w-2xl font-medium">
              Meet central bankers, financial directors, compliance titans, and visionary fintech leaders convening across CIB Ghana summits.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Main Page Content */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        {/* Category Tabs & Search Bar (Crisp White Card controls) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="inline-flex rounded-none border border-slate-200 bg-white p-1 shadow-sm overflow-x-auto">
            <button
              type="button"
              onClick={() => setSearchParams({})}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-none transition-all cursor-pointer whitespace-nowrap ${
                typeFilter === 'all'
                  ? 'bg-[#008129] text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              All Speakers ({speakers.length})
            </button>
            <button
              type="button"
              onClick={() => setSearchParams({ type: 'keynote' })}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-none transition-all cursor-pointer whitespace-nowrap ${
                typeFilter === 'keynote'
                  ? 'bg-[#008129] text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Keynotes &amp; Distinguished ({speakers.filter((s) => s.is_keynote).length})
            </button>
            <button
              type="button"
              onClick={() => setSearchParams({ type: 'faculty' })}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-none transition-all cursor-pointer whitespace-nowrap ${
                typeFilter === 'faculty'
                  ? 'bg-[#008129] text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Panels &amp; Faculty ({speakers.filter((s) => !s.is_keynote).length})
            </button>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search speaker, title, bank..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 rounded-none focus:outline-none focus:border-[#008129] shadow-sm"
            />
          </div>
        </div>

        {/* Speakers Grid - Aligned on a straight line */}
        {filteredSpeakers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-none border border-slate-200 space-y-3 text-slate-900 shadow-xl">
            <Mic className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">No Speakers Found</h3>
            <p className="text-xs text-slate-600">
              No faculty members matched your selected criteria.
            </p>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6 items-stretch"
          >
            {filteredSpeakers.map((speaker) => (
              <motion.div
                key={speaker.id}
                variants={cardVariant}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="h-full flex flex-col"
              >
                <SpeakerCard
                  speaker={speaker}
                  onSelect={(spk) => setSelectedSpeaker(spk)}
                  className="h-full"
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Speaker Bio Dossier Modal */}
        <SpeakerModal
          speaker={selectedSpeaker}
          isOpen={selectedSpeaker !== null}
          onClose={() => setSelectedSpeaker(null)}
        />
      </div>
    </div>
  );
};
