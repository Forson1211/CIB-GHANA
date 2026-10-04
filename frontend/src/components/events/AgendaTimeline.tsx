import React, { useState } from 'react';
import { AgendaSession, Speaker } from '../../types';
import { Clock, MapPin, Calendar, Users, Award, Mic, Coffee, Sparkles } from 'lucide-react';
import { ProfilePlaceholder } from '../ui/ProfilePlaceholder';

interface AgendaTimelineProps {
  sessions: AgendaSession[];
  speakers: Speaker[];
  onSelectSpeaker?: (speaker: Speaker) => void;
}

export const AgendaTimeline: React.FC<AgendaTimelineProps> = ({
  sessions,
  speakers,
  onSelectSpeaker,
}) => {
  const safeSessions = sessions || [];
  // Distinct days sorted (e.g. [0, 1, 2] for Sunday Arrival, Day 1 Masterclass, Day 2 3T Conference)
  const sessionDays = Array.from(new Set(safeSessions.map((s) => s.day_number))).sort((a, b) => a - b);
  const days = sessionDays.length > 0 ? sessionDays : [0, 1, 2];

  const [activeDay, setActiveDay] = useState<number>(() =>
    safeSessions.some((s) => s.day_number === 0) ? 0 : (days[0] ?? 1)
  );

  React.useEffect(() => {
    if (days.length > 0 && !days.includes(activeDay)) {
      setActiveDay(days[0]);
    }
  }, [days, activeDay]);
  const [selectedType, setSelectedType] = useState<string>('ALL');

  // Helper to convert "HH:MM" to total minutes for strict chronological sorting
  const timeToMinutes = (timeStr?: string): number => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map((val) => parseInt(val, 10) || 0);
    return (h || 0) * 60 + (m || 0);
  };

  // Filtered sessions strictly sorted by start time
  const sortedSessions = React.useMemo(() => {
    const list = safeSessions.filter((s) => {
      const matchesDay = s.day_number === activeDay;
      const matchesType = selectedType === 'ALL' || s.session_type === selectedType;
      return matchesDay && matchesType;
    });

    return list.sort((a, b) => {
      const diffStart = timeToMinutes(a.start_time) - timeToMinutes(b.start_time);
      if (diffStart !== 0) return diffStart;
      return timeToMinutes(a.end_time) - timeToMinutes(b.end_time);
    });
  }, [sessions, activeDay, selectedType]);

  const getSessionSpeakers = (speakerIds?: string[]) => {
    if (!speakerIds || !Array.isArray(speakerIds)) return [];
    const validSpeakers = (speakers && Array.isArray(speakers)) ? speakers : [];
    return validSpeakers.filter((spk) => spk && spk.id && speakerIds.includes(spk.id));
  };

  const dayLabels: Record<number, { title: string; date: string; theme: string }> = {
    0: { title: 'ARRIVAL', date: 'Sun, 8th Nov 2026', theme: 'Sunday, 8 November — Arrival of Participants' },
    1: { title: 'DAY ONE', date: 'Mon, 9th Nov 2026', theme: 'Day 1 — 9 November 2026: Masterclass & Mentorship Corner' },
    2: { title: 'DAY TWO', date: 'Tue, 10th Nov 2026', theme: 'Day 2 — 10 November 2026: 3T Conference' },
  };

  const sessionTypeConfig: Record<string, { bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }> = {
    KEYNOTE: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Mic },
    PANEL: { bg: 'bg-emerald-50', text: 'text-[#008129]', border: 'border-emerald-200', icon: Users },
    MASTERCLASS: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Award },
    NETWORKING: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', icon: Coffee },
    CEREMONY: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: Sparkles },
    WORKSHOP: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: Award },
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Day Tabs on Left + Category Filter Pills on Right (Side-by-side on desktop) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 pb-1">
        {/* Day Selector Tabs (ARRIVAL, DAY ONE & DAY TWO arranged equally on mobile) */}
        <div className="flex w-full sm:w-auto p-1.5 bg-black/30 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner overflow-x-auto max-w-full scrollbar-none shrink-0">
          {days.map((dayNum) => {
            const isActive = activeDay === dayNum;
            const labelInfo = dayLabels[dayNum] || { title: `DAY ${dayNum}`, date: `Day ${dayNum}`, theme: `Day ${dayNum}` };
            return (
              <button
                key={dayNum}
                onClick={() => setActiveDay(dayNum)}
                className={`flex-1 sm:flex-initial px-3 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-wide uppercase transition-all flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-[#008129] shadow-sm'
                    : 'text-white hover:text-white hover:bg-white/10'
                }`}
              >
                <Calendar className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isActive ? 'text-[#008129]' : 'text-white'}`} />
                <span>{labelInfo.title}</span>
              </button>
            );
          })}
        </div>

        {/* Category Filters (Matching exact rounded-xl edge from reference) */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 scrollbar-none">
          {['ALL', 'KEYNOTE', 'PANEL', 'MASTERCLASS', 'WORKSHOP', 'CEREMONY', 'NETWORKING'].map((type) => {
            const isActive = selectedType === type;
            const labelMap: Record<string, string> = {
              ALL: 'All Sessions',
              KEYNOTE: 'Keynotes',
              PANEL: 'Panels',
              MASTERCLASS: 'Masterclasses',
              WORKSHOP: 'Workshops',
              CEREMONY: 'Ceremonies',
              NETWORKING: 'Networking',
            };
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white text-[#008129] font-bold shadow-sm'
                    : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                }`}
              >
                {labelMap[type] || type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Sessions (Arranged beautifully matching reference design) */}
      {sortedSessions.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-md border border-white/40">
          <p className="text-slate-700 text-xs sm:text-sm font-medium">
            No sessions scheduled under this filter for {dayLabels[activeDay]?.title || `Day ${activeDay}`}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {sortedSessions.map((session) => {
            const sessionSpeakers = getSessionSpeakers(session.speaker_ids);
            const conf = sessionTypeConfig[session.session_type] || sessionTypeConfig.NETWORKING;
            const Icon = conf.icon;
            const isAllDay = session.id?.includes('d0-1') || session.title?.toLowerCase().includes('arrival of participants');

            return (
              <div
                key={session.id}
                className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Top Row: Icon + Time Badge + Session Type Pill */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${conf.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-4 h-4 ${conf.text}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 font-display font-bold text-xs sm:text-sm text-slate-900">
                          <Clock className="w-3.5 h-3.5 text-[#008129]" />
                          <span className="whitespace-nowrap">{isAllDay ? 'All Day' : `${session.start_time} – ${session.end_time}`}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px] sm:max-w-[240px]">{session.room}</span>
                        </div>
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border shrink-0 ${conf.bg} ${conf.text} ${conf.border}`}>
                      {session.session_type}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display leading-snug group-hover:text-[#008129] transition-colors">
                    {session.title}
                  </h3>

                  {/* Description */}
                  {session.description && (
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-3">
                      {session.description}
                    </p>
                  )}
                </div>

                {/* Bottom: Faculty Members */}
                {sessionSpeakers.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Featured Faculty:
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {sessionSpeakers.map((spk) => (
                        <button
                          key={spk.id}
                          onClick={() => onSelectSpeaker && onSelectSpeaker(spk)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-300 text-[11px] font-semibold text-slate-800 hover:text-[#008129] transition-all"
                        >
                          {spk.photo_url ? (
                            <img
                              src={spk.photo_url}
                              alt={spk.name}
                              className="w-4 h-4 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <span className="w-4 h-4 rounded-full overflow-hidden border border-slate-200 flex items-center justify-center shrink-0">
                              <ProfilePlaceholder className="w-full h-full" />
                            </span>
                          )}
                          <span>{spk.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
