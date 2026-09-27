import React, { useState, useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { SpeakerCard } from '../components/events/SpeakerCard';
import { SpeakerModal } from '../components/events/SpeakerModal';
import { Speaker } from '../types';
import { Search, Filter, Mic, Award } from 'lucide-react';
import { Button } from '../components/ui/Button';

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
  }, [speakers, selectedExpertise, searchQuery]);

  return (
    <div className="space-y-8 sm:space-y-10 pb-20">
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


        {/* Speakers Grid */}
        {filteredSpeakers.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <Mic className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-cib-charcoal-900">No Speakers Found</h3>
            <p className="text-xs text-slate-500">
              No faculty members matched your selected criteria.
            </p>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6"
          >
            {filteredSpeakers.map((speaker) => (
              <motion.div
                key={speaker.id}
                variants={cardVariant}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
              >
                <SpeakerCard
                  speaker={speaker}
                  onSelect={(spk) => setSelectedSpeaker(spk)}
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
