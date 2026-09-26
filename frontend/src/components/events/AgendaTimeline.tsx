import React, { useState } from 'react';
import { AgendaSession, Speaker } from '../../types';
import { Clock, MapPin, Calendar, Users, Award, Mic, Coffee, Sparkles } from 'lucide-react';

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
  const [activeDay, setActiveDay] = useState<number>(1);
  const [selectedType, setSelectedType] = useState<string>('ALL');

  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center py-12 px-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
        <p className="text-slate-500 text-sm font-medium">
          Detailed conference proceedings will be announced shortly.
        </p>
      </div>
    );
  }

  // Distinct days sorted (guaranteed at least [1, 2] for multi-day events)
  const sessionDays = Array.from(new Set(sessions.map((s) => s.day_number))).sort((a, b) => a - b);
  const days = sessionDays.length >= 2 ? sessionDays : [1, 2];

  // Filtered sessions
  const filteredSessions = sessions.filter((s) => {
    const matchesDay = s.day_number === activeDay;
    const matchesType = selectedType === 'ALL' || s.session_type === selectedType;
    return matchesDay && matchesType;
  });

  const getSessionSpeakers = (speakerIds: string[]) => {
    return speakers.filter((spk) => speakerIds.includes(spk.id));
  };

  const dayLabels: Record<number, { title: string; date: string }> = {
    1: { title: 'DAY ONE', date: 'Mon, 9th Nov 2026' },
    2: { title: 'DAY TWO', date: 'Tue, 10th Nov 2026' },
    3: { title: 'DAY THREE', date: 'Wed, 11th Nov 2026' },
    4: { title: 'DAY FOUR', date: 'Thu, 12th Nov 2026' },
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
    <div className="space-y-5">
      {/* Sleek Centered Controls matching reference card aesthetic on Green Background */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-1">
        {/* Day Selector Tabs (DAY ONE & DAY TWO tabs with high-contrast active state) */}
        <div className="inline-flex p-1.5 bg-black/25 backdrop-blur-md rounded-xl border border-white/25 shadow-inner">
          {days.map((dayNum) => {
            const isActive = activeDay === dayNum;
            const labelInfo = dayLabels[dayNum] || { title: `DAY ${dayNum}`, date: `Day ${dayNum}` };
            return (
              <button
                key={dayNum}
                onClick={() => setActiveDay(dayNum)}
                className={`px-4 sm:px-6 py-2.5 rounded-lg text-xs font-black transition-all flex items-center gap-2.5 ${
                  isActive
                    ? 'bg-white text-[#F20300] shadow-lg scale-[1.02]'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <Calendar className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#F20300]' : 'text-yellow-300'}`} />
                <span className="tracking-wide text-xs sm:text-sm font-black">{labelInfo.title}</span>
                <span className={`text-[11px] font-medium hidden sm:inline ${isActive ? 'text-slate-600' : 'text-white/80'}`}>
                  • {labelInfo.date}
                </span>
              </button>
            );
          })}
        </div>

        {/* Category Filters (Clean rounded badges) */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none">
          {['ALL', 'KEYNOTE', 'PANEL', 'CEREMONY', 'NETWORKING'].map((type) => {
            const isActive = selectedType === type;
            const labelMap: Record<string, string> = {
              ALL: 'All Sessions',
              KEYNOTE: 'Keynotes',
              PANEL: 'Panels',
              CEREMONY: 'Ceremony',
              NETWORKING: 'Networking',
            };
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white text-[#F20300] font-black shadow-sm'
                    : 'bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-md'
                }`}
              >
                {labelMap[type] || type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Sessions (Arranged beautifully like the 2nd image cards) */}
      {filteredSessions.length === 0 ? (
        <div className="text-center py-10 px-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-md border border-white/40">
          <p className="text-slate-700 text-xs sm:text-sm font-medium">
            No sessions scheduled under this filter for {dayLabels[activeDay]?.title || `Day ${activeDay}`}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSessions.map((session) => {
            const sessionSpeakers = getSessionSpeakers(session.speaker_ids);
            const conf = sessionTypeConfig[session.session_type] || sessionTypeConfig.NETWORKING;
            const Icon = conf.icon;

            return (
              <div
                key={session.id}
                className="bg-white p-4 sm:p-5 rounded-xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2.5">
                  {/* Top Row: Icon + Time Badge + Session Type Pill */}
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-lg ${conf.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-4 h-4 ${conf.text}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 font-display font-bold text-xs sm:text-sm text-slate-900">
                          <Clock className="w-3 h-3 text-[#F20300]" />
                          <span>{session.start_time} – {session.end_time}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[170px] sm:max-w-[210px]">{session.room}</span>
                        </div>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider border ${conf.bg} ${conf.text} ${conf.border}`}>
                      {session.session_type}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display leading-snug group-hover:text-[#F20300] transition-colors">
                    {session.title}
                  </h3>

                  {/* Description */}
                  {session.description && (
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
                      {session.description}
                    </p>
                  )}
                </div>

                {/* Bottom: Faculty Members */}
                {sessionSpeakers.length > 0 && (
                  <div className="pt-2.5 border-t border-slate-100 space-y-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Featured Faculty:
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {sessionSpeakers.map((spk) => (
                        <button
                          key={spk.id}
                          onClick={() => onSelectSpeaker && onSelectSpeaker(spk)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-red-50 border border-slate-200/70 hover:border-red-300 text-[11px] font-semibold text-slate-800 hover:text-[#F20300] transition-all"
                        >
                          <img
                            src={spk.photo_url}
                            alt={spk.name}
                            className="w-4 h-4 rounded-full object-cover border border-slate-200"
                          />
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
