import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { FileDown, Search, Filter, BookOpen, FileText, CheckCircle2, RotateCcw } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
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
      delayChildren: 0.04,
    },
  },
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
};

export const Resources: React.FC = () => {
  const { events } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Collect all resources from events
  const allResources = events.flatMap((e) =>
    (e.resources || []).map((r) => ({
      ...r,
      eventTitle: e.title,
      eventSlug: e.slug,
      eventDate: e.start_date,
    }))
  );

  const handleDownload = (res: typeof allResources[0]) => {
    if (res.file_url && res.file_url !== '#' && !res.file_url.startsWith('javascript:')) {
      const a = document.createElement('a');
      a.href = res.file_url;
      a.download = `${res.title.replace(/[^a-z0-9]/gi, '_')}.${(res.file_type || 'PDF').toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const content = `CHARTERED INSTITUTE OF BANKERS (CIB) GHANA\nOFFICIAL PUBLICATION & DOCUMENT RELEASE\n\nTitle: ${res.title}\nCategory: ${res.category}\nAssociated Event: ${res.eventTitle}\nFormat: ${res.file_type} (${res.file_size})\nRelease Date: ${res.eventDate || new Date().toISOString().split('T')[0]}\n\nDOCUMENT OVERVIEW:\n${res.description}\n\n---\nChartered Institute of Bankers (CIB) Ghana\nBanking on Trust, Professionalism, and Ethical Excellence.\nAccra, Ghana.`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${res.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const filteredResources = allResources.filter((res) => {
    const matchesCat = selectedCategory === 'ALL' || res.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      searchQuery === '' ||
      res.title.toLowerCase().includes(q) ||
      res.description.toLowerCase().includes(q) ||
      res.eventTitle.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-[#0D3A21] space-y-8 sm:space-y-10 pb-24 text-white">
      {/* Sleek Banner for Resources (Green to Yellow Gradient & Left-aligned) */}
      <section className="w-full bg-gradient-to-r from-[#088d01] via-[#72ac00] to-[#dccb00] text-white py-10 sm:py-14 relative overflow-hidden shadow-sm">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
        >
          <div className="text-left max-w-3xl space-y-2 sm:space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white uppercase">
              News &amp; Resources
            </h1>
            <p className="text-white/95 text-sm sm:text-base leading-relaxed max-w-2xl font-medium">
              Download executive summaries, keynote slides, conference prospectuses, and banking code compendiums.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Main Page Content */}
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        {/* Filter & Search Toolbar */}
        {/* Filter & Search Toolbar (Crisp White Card) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="bg-white p-6 rounded-none border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-800 shadow-xl"
        >
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search document title or event..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-none border border-slate-200 text-base sm:text-xs focus:border-[#008129] focus:outline-none bg-slate-50 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none">
            {['ALL', 'BROCHURE', 'REPORT', 'PRESENTATION'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-none text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#008129] text-white font-bold shadow-xs'
                    : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat === 'ALL' ? 'All Formats' : cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Resources Table/Card Grid or Empty State */}
        {filteredResources.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="py-16 sm:py-20 px-6 text-center bg-white border border-slate-200 rounded-none max-w-xl mx-auto space-y-4 shadow-xl text-slate-900"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#008129] flex items-center justify-center mx-auto shadow-xs border border-emerald-100">
              <FileText className="w-8 h-8 stroke-[1.8]" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
                {allResources.length === 0
                  ? 'No Resources Available Yet'
                  : 'No Matching Resources Found'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                {allResources.length === 0
                  ? 'Conference brochures, keynote slides, and official documents will be published here as soon as they become available.'
                  : 'We couldn’t find any documents matching your current search query or category filter.'}
              </p>
            </div>

            {(searchQuery || selectedCategory !== 'ALL') && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('ALL');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-none bg-[#008129] text-white text-xs font-bold hover:bg-[#007024] transition-colors shadow-xs cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {filteredResources.map((res) => (
              <motion.div
                key={res.id}
                variants={cardVariant}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white p-6 rounded-none border border-slate-200 shadow-card hover:border-[#FFE500] hover:shadow-xl transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="green" size="sm">
                      {res.category}
                    </Badge>
                    <span className="text-[11px] font-mono text-slate-400">
                      {res.file_type} &bull; {res.file_size}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-cib-charcoal-900 font-display">
                    {res.title}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    {res.description}
                  </p>

                  <p className="text-[11px] text-cib-green-700 font-semibold pt-1">
                    Associated Event: {res.eventTitle}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Verified CIB Release
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDownload(res)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cib-green-50 text-cib-green-800 hover:bg-cib-green-100 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Download Document</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};
