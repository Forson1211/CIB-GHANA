import React, { createContext, useContext, useState, useEffect } from 'react';
import { EventItem, Registration, UserProfile, Speaker, Sponsor, EventResource } from '../types';
import { MOCK_EVENTS, MOCK_REGISTRATIONS, DEMO_USERS, MOCK_SPEAKERS, MOCK_SPONSORS } from '../data/mockData';
import { generateRegistrationNumber } from '../lib/utils';
import { ApiClient } from '../lib/api';
import { supabase, supabaseAdmin, stringToUuid, uploadSpeakerPhotoToCloud } from '../lib/supabase';

interface AppContextType {
  events: EventItem[];
  registrations: Registration[];
  speakers: Speaker[];
  sponsors: Sponsor[];
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  registeredUserEmail: string | null;
  setRegisteredUserEmail: (email: string | null) => void;
  registeredUserName: string | null;
  setRegisteredUserName: (name: string | null) => void;
  getEventBySlug: (slug: string) => EventItem | undefined;
  getEventById: (id: string) => EventItem | undefined;
  getRegistrationByNumber: (regNumber: string) => Registration | undefined;
  refreshRegistrations: () => Promise<void>;
  refreshSpeakers: () => Promise<void>;
  refreshAll: () => Promise<void>;
  isLiveSyncing: boolean;
  lastSyncedAt: Date | null;
  addRegistration: (reg: Omit<Registration, 'id' | 'registration_number' | 'created_at'>) => Registration;
  checkInAttendee: (regNumber: string) => { success: boolean; message: string; registration?: Registration };
  addEvent: (event: Omit<EventItem, 'id' | 'created_at' | 'updated_at'>) => Promise<EventItem> | EventItem;
  updateEvent: (id: string, updates: Partial<EventItem>) => Promise<void> | void;
  deleteEvent: (id: string) => Promise<boolean> | void;
  toggleEventPublish: (id: string) => Promise<void> | void;
  toggleEventFeatured: (id: string) => Promise<void> | void;
  isAdminAuthenticated: boolean;
  adminLogin: (password: string) => Promise<boolean>;
  adminLogout: () => void;
  addSpeaker: (speaker: Partial<Speaker>) => void;
  updateSpeaker: (id: string, updates: Partial<Speaker>) => void;
  deleteSpeaker: (id: string) => void;
  addSponsor: (sponsor: Partial<Sponsor>) => void;
  updateSponsor: (id: string, updates: Partial<Sponsor>) => void;
  deleteSponsor: (id: string) => void;
  addResourceToEvent: (eventId: string, resource: Omit<EventResource, 'id'>) => void;
  updateEventResource: (eventId: string, resourceId: string, updates: Partial<EventResource>) => void;
  deleteEventResource: (eventId: string, resourceId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_EVENTS = 'cib_ghana_events_v6';
const STORAGE_KEY_REGS = 'cib_ghana_registrations_v1';
const STORAGE_KEY_USER = 'cib_ghana_current_user_v1';
const STORAGE_KEY_REG_EMAIL = 'cib_ghana_registered_email_v1';
const STORAGE_KEY_REG_NAME = 'cib_ghana_registered_name_v1';
const STORAGE_KEY_ADMIN_AUTH = 'cib_admin_auth_v1';
// v9: Supabase-synced photos; service-role upload; no duplicates
const STORAGE_KEY_SPEAKERS = 'cib_ghana_speakers_v9';
const STORAGE_KEY_DELETED_SPEAKERS = 'cib_ghana_deleted_spk_ids_v9';
const STORAGE_KEY_SPONSORS = 'cib_ghana_sponsors_v2';

export const PURGED_MOCK_SPEAKER_IDS = new Set([
  'spk-1',
  'spk-3',
  'spk-4',
  'spk-5',
  'spk-6',
  'spk-7',
  'spk-8',
  'spk-9',
  'spk-10',
  'spk-11',
  'spk-12',
]);

export const PURGED_MOCK_SPEAKER_NAMES = [
  'dr. ernest addison',
  'ernest addison',
  'mansa nettey',
  'mawu nettey',
  'hakim ouzzani',
  'abena osei-poku',
  'akenu osei-poku',
  'prof. kweku',
  'john kofi adomakoh',
  'patricia poku diaby',
  'kojo addo-kufuor',
  'elsie addo awadzi',
  'nana ama poku',
];

// Admin-created speakers have IDs like 'sp-1234567890' (sp- followed by timestamp digits)
// We must NEVER purge them by name — only purge known old mock IDs.
const isAdminCreatedSpeaker = (id: string): boolean => /^sp-\d+/.test(id);

export const isPurgedMockSpeaker = (s: { id: string; name?: string }): boolean => {
  // Never purge admin-created speakers regardless of name
  if (isAdminCreatedSpeaker(s.id)) return false;
  if (PURGED_MOCK_SPEAKER_IDS.has(s.id)) return true;
  if (s.name) {
    const clean = s.name.toLowerCase().trim();
    for (const name of PURGED_MOCK_SPEAKER_NAMES) {
      if (clean.includes(name)) return true;
    }
  }
  return false;
};

export const isSameSpeaker = (
  a: { id?: string; name?: string; slug?: string },
  b: { id?: string; name?: string; slug?: string }
): boolean => {
  if (a.id && b.id) {
    if (a.id === b.id) return true;
    if (stringToUuid(a.id) === b.id || a.id === stringToUuid(b.id)) return true;
  }
  if (a.slug && b.slug && a.slug === b.slug) return true;
  const nameA = (a.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const nameB = (b.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (nameA && nameB) {
    if (nameA === nameB) return true;
    if (nameA.length > 5 && nameB.length > 5) {
      if (nameA.includes(nameB) || nameB.includes(nameA)) return true;
    }
  }
  return false;
};

export const deduplicateSpeakers = (list: Speaker[]): Speaker[] => {
  const result: Speaker[] = [];
  for (const s of list) {
    if (isPurgedMockSpeaker(s)) continue;
    const existingIndex = result.findIndex((r) => isSameSpeaker(r, s));
    if (existingIndex === -1) {
      result.push(s);
    } else {
      const existing = result[existingIndex];
      const hasPhoto = (p?: string) => p && p.trim() !== '';
      result[existingIndex] = {
        ...existing,
        ...s,
        photo_url: hasPhoto(s.photo_url) ? s.photo_url : existing.photo_url,
      };
    }
  }
  return result;
};

export const normalizeRegistration = (r: Registration): Registration => {
  let cat = r.membership_category;
  if (!cat || !['ACIB', 'FCIB', 'Student', 'Non-Member'].includes(cat)) {
    const memId = (r.cib_member_id || '').toUpperCase();
    const typeName = (r.registration_type_name || '').toLowerCase();
    if (memId.startsWith('FCIB') || typeName.includes('fellow')) {
      cat = 'FCIB';
    } else if (memId.startsWith('ACIB') || typeName.includes('associate') || typeName.includes('chartered')) {
      cat = 'ACIB';
    } else if (memId.startsWith('STU') || typeName.includes('student')) {
      cat = 'Student';
    } else {
      cat = 'Non-Member';
    }
  }
  return { ...r, membership_category: cat };
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLiveSyncing, setIsLiveSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(new Date());

  // Proactively clean up old speaker and event storage versions
  useEffect(() => {
    try {
      [
        'cib_ghana_speakers_v8',
        'cib_ghana_speakers_v7',
        'cib_ghana_speakers_v6',
        'cib_ghana_speakers_v5',
        'cib_ghana_deleted_spk_ids_v8',
        'cib_ghana_deleted_spk_ids_v7',
        'cib_ghana_events_v5',
      ].forEach((key) => localStorage.removeItem(key));
    } catch {
      /* ignore */
    }
  }, []);

  const [events, setEvents] = useState<EventItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_EVENTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const onlyEvt1 = parsed.filter((evt) => evt.id === 'evt-1');
          if (onlyEvt1.length > 0) {
            return onlyEvt1.map((evt) => ({
              ...evt,
              speakers: MOCK_SPEAKERS.filter((s) => !isPurgedMockSpeaker(s)),
              agenda: MOCK_EVENTS[0].agenda,
            }));
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    return MOCK_EVENTS;
  });

  const [registrations, setRegistrations] = useState<Registration[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_REGS);
    if (saved) {
      try {
        const list = JSON.parse(saved);
        if (Array.isArray(list)) return list.map(normalizeRegistration);
      } catch (e) { console.error(e); }
    }
    return MOCK_REGISTRATIONS.map(normalizeRegistration);
  });

  const [speakers, setSpeakers] = useState<Speaker[]>(() => {
    // Read permanently-deleted speaker IDs so they never come back
    let deletedIds = new Set<string>();
    try {
      const raw = localStorage.getItem(STORAGE_KEY_DELETED_SPEAKERS);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) deletedIds = new Set(arr);
      }
    } catch { /* ignore */ }

    const saved = localStorage.getItem(STORAGE_KEY_SPEAKERS);
    if (saved) {
      try {
        const parsed: Speaker[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Remove any that were deleted or are purged mock speakers
          // Admin-created speakers (sp-<timestamp>) are NEVER purged by name
          const live = parsed.filter(
            (s) => !deletedIds.has(s.id) && !isPurgedMockSpeaker(s)
          );
          // Backfill photo from MOCK_SPEAKERS ONLY if the saved speaker has no photo
          // AND is a known mock speaker (never overwrite admin-uploaded photos)
          const enriched = live.map((s) => {
            if (!s.photo_url && !isAdminCreatedSpeaker(s.id)) {
              const mock = MOCK_SPEAKERS.find((m) => m.id === s.id);
              if (mock?.photo_url) return { ...s, photo_url: mock.photo_url };
            }
            return s;
          });
          // Add MOCK_SPEAKERS whose IDs aren't yet in localStorage and weren't deleted
          const liveIds = new Set(enriched.map((s) => s.id));
          const fresh = MOCK_SPEAKERS.filter(
            (s) => !liveIds.has(s.id) && !deletedIds.has(s.id) && !isPurgedMockSpeaker(s)
          );
          return deduplicateSpeakers([...enriched, ...fresh]);
        }
      } catch (e) { console.error(e); }
    }
    // First load — seed from code-defined list (minus already-deleted and purged)
    return deduplicateSpeakers(
      MOCK_SPEAKERS.filter((s) => !deletedIds.has(s.id) && !isPurgedMockSpeaker(s))
    );
  });
  const [sponsors, setSponsors] = useState<Sponsor[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SPONSORS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { console.error(e); }
    }
    return MOCK_SPONSORS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEMO_USERS[0]; // default to SUPER_ADMIN for rich evaluation
  });

  const [registeredUserEmail, setRegisteredUserEmailState] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY_REG_EMAIL) || null;
  });

  const setRegisteredUserEmail = (email: string | null) => {
    setRegisteredUserEmailState(email);
    if (email) {
      localStorage.setItem(STORAGE_KEY_REG_EMAIL, email);
    } else {
      localStorage.removeItem(STORAGE_KEY_REG_EMAIL);
    }
  };

  const [registeredUserName, setRegisteredUserNameState] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY_REG_NAME) || null;
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_ADMIN_AUTH) === 'true';
  });

  const adminLogin = async (password: string): Promise<boolean> => {
    const trimmed = password.trim();
    if (trimmed === 'cibghana') {
      setIsAdminAuthenticated(true);
      localStorage.setItem(STORAGE_KEY_ADMIN_AUTH, 'true');
      setCurrentUser(DEMO_USERS[0]);
      try {
        await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: trimmed }),
        });
      } catch (err) {
        // local fallback
      }
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem(STORAGE_KEY_ADMIN_AUTH);
  };

  const setRegisteredUserName = (name: string | null) => {
    setRegisteredUserNameState(name);
    if (name) {
      localStorage.setItem(STORAGE_KEY_REG_NAME, name);
    } else {
      localStorage.removeItem(STORAGE_KEY_REG_NAME);
    }
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_REGS, JSON.stringify(registrations));
  }, [registrations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SPEAKERS, JSON.stringify(speakers));
  }, [speakers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SPONSORS, JSON.stringify(sponsors));
  }, [sponsors]);

  const addSpeaker = (speaker: Partial<Speaker>) => {
    const newSpeaker: Speaker = {
      id: speaker.id ?? `sp-${Date.now()}`,
      name: speaker.name ?? '',
      slug: speaker.slug ?? (speaker.name ?? '').toLowerCase().replace(/\s+/g, '-'),
      position: speaker.position ?? '',
      organization: speaker.organization ?? '',
      country: speaker.country ?? 'Ghana',
      photo_url: speaker.photo_url ?? '',
      biography: speaker.biography ?? '',
      expertise: speaker.expertise ?? [],
      is_keynote: speaker.is_keynote ?? false,
      linkedin_url: speaker.linkedin_url,
      twitter_url: speaker.twitter_url,
      website_url: speaker.website_url,
    };
    // If this speaker ID was previously blacklisted, un-blacklist it
    try {
      const raw = localStorage.getItem(STORAGE_KEY_DELETED_SPEAKERS);
      if (raw) {
        const arr: string[] = JSON.parse(raw);
        if (Array.isArray(arr) && arr.includes(newSpeaker.id)) {
          localStorage.setItem(STORAGE_KEY_DELETED_SPEAKERS, JSON.stringify(arr.filter((id) => id !== newSpeaker.id)));
        }
      }
    } catch { /* ignore */ }

    setSpeakers((prev) => {
      // Prevent duplicates: if a speaker with the same id already exists, replace instead of append
      if (prev.some((s) => s.id === newSpeaker.id)) {
        return prev.map((s) => (s.id === newSpeaker.id ? newSpeaker : s));
      }
      return [...prev, newSpeaker];
    });
  };

  const updateSpeaker = (id: string, updates: Partial<Speaker>) => {
    setSpeakers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const deleteSpeaker = (id: string) => {
    // 1. Remove from live state (useEffect auto-saves to STORAGE_KEY_SPEAKERS)
    setSpeakers((prev) => prev.filter((s) => s.id !== id));
    // 2. Add to permanent deleted-IDs blacklist so it never re-appears on refresh
    try {
      const raw = localStorage.getItem(STORAGE_KEY_DELETED_SPEAKERS);
      const arr: string[] = raw ? JSON.parse(raw) : [];
      if (!arr.includes(id)) {
        arr.push(id);
        localStorage.setItem(STORAGE_KEY_DELETED_SPEAKERS, JSON.stringify(arr));
      }
    } catch { /* ignore */ }
  };

  const addSponsor = (sponsor: Partial<Sponsor>) => {
    const newSponsor: Sponsor = {
      id: sponsor.id || `sp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: sponsor.name || 'New Entity',
      logo_url: sponsor.logo_url || '',
      website_url: sponsor.website_url || '',
      type: sponsor.type === 'PARTNER' ? 'PARTNER' : 'SPONSOR',
      tier: sponsor.type === 'PARTNER' ? 'PARTNER' : 'SPONSOR',
      categoryOrRole: sponsor.categoryOrRole || (sponsor.type === 'PARTNER' ? 'Strategic Partner' : 'Corporate Sponsor'),
      description: sponsor.description || '',
    };
    setSponsors((prev) => [newSponsor, ...prev]);
  };

  const updateSponsor = (id: string, updates: Partial<Sponsor>) => {
    setSponsors((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates, tier: (updates.type || s.type) } : s))
    );
  };

  const deleteSponsor = (id: string) => {
    setSponsors((prev) => prev.filter((s) => s.id !== id));
  };

  const refreshEvents = async () => {
    try {
      const res = await ApiClient.getEvents();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setEvents((prev) => {
          const filtered = res.data.filter((e) => e.id === 'evt-1');
          const targetList = filtered.length > 0 ? filtered : [MOCK_EVENTS[0]];
          const merged = targetList.map((be) => {
            const local = prev.find((pe) => pe.id === be.id);
            const defaultAgenda = MOCK_EVENTS.find((m) => m.id === be.id)?.agenda || MOCK_EVENTS[0].agenda;
            const isUpToDate = (ag?: any[]) => ag && ag.some((s) => s.id === 'ag-d1-1' || s.title === 'REGISTRATION' || s.title?.includes('Deploying AI'));
            if (!local) {
              return {
                ...be,
                agenda: (be.agenda && isUpToDate(be.agenda))
                  ? be.agenda
                  : defaultAgenda.map((s) => ({ ...s, id: `${s.id}-${be.id}`, event_id: be.id })),
                speakers: (be.speakers && be.speakers.length > 0) ? be.speakers : (MOCK_EVENTS.find((m) => m.id === be.id)?.speakers || MOCK_SPEAKERS),
                resources: (be.resources && be.resources.length > 0) ? be.resources : (MOCK_EVENTS.find((m) => m.id === be.id)?.resources || []),
              };
            }
            const { resources: _locRes, speakers: _locSpk, agenda: _locAgenda, ...restLocal } = local;
            const finalAgenda = (be.agenda && isUpToDate(be.agenda))
              ? be.agenda
              : ((_locAgenda && isUpToDate(_locAgenda)) ? _locAgenda : defaultAgenda.map((s) => ({ ...s, id: `${s.id}-${be.id}`, event_id: be.id })));
            return {
              ...be,
              ...restLocal,
              agenda: finalAgenda,
              resources: (local.resources && local.resources.length > 0) ? local.resources : (be.resources || []),
              speakers: (local.speakers && local.speakers.length > 0) ? local.speakers : (be.speakers || []),
            };
          });
          return merged;
        });
        return;
      }
    } catch (err) {
      console.warn('ApiClient events failed, trying direct Supabase:', err);
    }

    // Direct Supabase fallback
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*, registration_types(*)')
          .order('start_date', { ascending: true });
        if (!error && Array.isArray(data) && data.length > 0) {
          setEvents((prev) => {
            const filtered = (data as EventItem[]).filter((e: any) => e.id === 'evt-1');
            const targetList = filtered.length > 0 ? filtered : [MOCK_EVENTS[0]];
            const merged = targetList.map((be) => {
              const local = prev.find((pe) => pe.id === be.id);
              const defaultAgenda = MOCK_EVENTS.find((m) => m.id === be.id)?.agenda || MOCK_EVENTS[0].agenda;
              const isUpToDate = (ag?: any[]) => ag && ag.some((s) => s.id === 'ag-d1-1' || s.title === 'REGISTRATION' || s.title?.includes('Deploying AI'));
              if (!local) {
                return {
                  ...be,
                  agenda: (be.agenda && isUpToDate(be.agenda))
                    ? be.agenda
                    : defaultAgenda.map((s) => ({ ...s, id: `${s.id}-${be.id}`, event_id: be.id })),
                  speakers: (be.speakers && be.speakers.length > 0) ? be.speakers : (MOCK_EVENTS.find((m) => m.id === be.id)?.speakers || MOCK_SPEAKERS),
                  resources: (be.resources && be.resources.length > 0) ? be.resources : (MOCK_EVENTS.find((m) => m.id === be.id)?.resources || []),
                };
              }
              const { resources: _locRes, speakers: _locSpk, agenda: _locAgenda, ...restLocal } = local;
              const finalAgenda = (be.agenda && isUpToDate(be.agenda))
                ? be.agenda
                : ((_locAgenda && isUpToDate(_locAgenda)) ? _locAgenda : defaultAgenda.map((s) => ({ ...s, id: `${s.id}-${be.id}`, event_id: be.id })));
              return {
                ...be,
                ...restLocal,
                agenda: finalAgenda,
                resources: (local.resources && local.resources.length > 0) ? local.resources : (be.resources || []),
                speakers: (local.speakers && local.speakers.length > 0) ? local.speakers : (be.speakers || []),
              };
            });
            return merged;
          });
        }
      } catch (sbErr) {
        console.warn('Direct Supabase fetch failed:', sbErr);
      }
    }
  };

  const refreshRegistrations = async () => {
    setIsLiveSyncing(true);
    let synced = false;
    try {
      const res = await ApiClient.getRegistrations();
      if (res.success && Array.isArray(res.data)) {
        setRegistrations(res.data.map(normalizeRegistration));
        setLastSyncedAt(new Date());
        synced = true;
      }
    } catch {
      // Backend temporarily offline; check direct Supabase fallback below
    }

    if (!synced && supabase) {
      try {
        const { data, error } = await supabase
          .from('registrations')
          .select('*, registration_types(name), events(title)')
          .order('created_at', { ascending: false });
        if (!error && Array.isArray(data) && data.length > 0) {
          const mapped: Registration[] = data.map((r: any) => ({
            id: r.id,
            event_id: r.event_id,
            event_title: r.events?.title || 'CIB Ghana Event',
            registration_number: r.registration_number,
            registration_type_id: r.registration_type_id,
            registration_type_name: r.registration_types?.name || 'Standard Delegate Pass',
            first_name: r.first_name,
            last_name: r.last_name,
            email: r.email,
            phone: r.phone,
            organization: r.organization,
            job_title: r.job_title,
            country: r.country || 'Ghana',
            cib_member_id: r.cib_member_id,
            membership_category: r.membership_category || 'Non-Member',
            attendance_type: r.attendance_type || 'PHYSICAL',
            dietary_requirements: r.dietary_requirements,
            special_assistance: r.special_assistance,
            total_amount: Number(r.total_amount) || 0,
            currency: r.currency || 'GHS',
            payment_status: r.payment_status || 'PENDING',
            payment_reference: r.payment_reference,
            payment_method: r.payment_method,
            check_in_status: r.check_in_status || 'REGISTERED',
            check_in_time: r.check_in_time,
            created_at: r.created_at,
          }));
          setRegistrations(mapped.map(normalizeRegistration));
          setLastSyncedAt(new Date());
        }
      } catch {
        // RLS prevents unauthenticated anon reading registrations; handled by backend
      }
    }

    setIsLiveSyncing(false);
  };

  // Fetch speakers from backend API / Supabase and merge into local state
  // Ensures cloud photos and new speakers are visible on ALL devices (mobile, tablet, desktop)
  const refreshSpeakers = async () => {
    let remoteSpeakers: any[] = [];
    try {
      const res = await ApiClient.getSpeakers();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        remoteSpeakers = res.data;
      }
    } catch {
      // ApiClient offline
    }

    if (remoteSpeakers.length === 0 && supabase) {
      try {
        const { data, error } = await supabase
          .from('speakers')
          .select('*')
          .order('name', { ascending: true });
        if (!error && Array.isArray(data) && data.length > 0) {
          remoteSpeakers = data;
        }
      } catch (err) {
        console.warn('Supabase speakers query failed:', err);
      }
    }

    if (remoteSpeakers.length === 0) return;

    setSpeakers((prev) => {
      // 1. Update existing speakers with cloud photo and latest info
      const updated = prev.map((s) => {
        const remote = remoteSpeakers.find((d: any) => isSameSpeaker(s, d));
        if (!remote) return s;

        // Prefer remote cloud photo URL (starts with http/https)
        const remotePhoto = remote.photo_url && remote.photo_url.trim() !== '' ? remote.photo_url : '';
        const localPhotoIsRemote = s.photo_url && (s.photo_url.startsWith('http://') || s.photo_url.startsWith('https://'));
        const photoToUse = remotePhoto.startsWith('http')
          ? remotePhoto
          : (localPhotoIsRemote ? s.photo_url : (remotePhoto || s.photo_url || ''));

        return {
          ...s,
          photo_url: photoToUse,
          name: remote.name || s.name || '',
          position: remote.position || s.position || '',
          organization: remote.organization || s.organization || '',
          biography: remote.biography || s.biography || '',
        };
      });

      // 2. Add only genuine new remote speakers not already present locally
      const toAdd: Speaker[] = [];
      for (const d of remoteSpeakers) {
        const alreadyExists = updated.some((p) => isSameSpeaker(p, d));
        if (!alreadyExists && !isPurgedMockSpeaker(d)) {
          toAdd.push({
            id: d.id,
            name: d.name ?? '',
            slug: d.slug ?? '',
            position: d.position ?? '',
            organization: d.organization ?? '',
            country: d.country ?? 'Ghana',
            photo_url: d.photo_url ?? '',
            biography: d.biography ?? '',
            expertise: Array.isArray(d.expertise) ? d.expertise : [],
            is_keynote: d.is_keynote ?? false,
            linkedin_url: d.linkedin_url ?? '',
            twitter_url: d.twitter_url ?? '',
            website_url: d.website_url ?? '',
          });
        }
      }

      return deduplicateSpeakers([...updated, ...toAdd]);
    });
  };

  // Auto-migrate any local base64 photos to cloud storage so they show on all devices
  // Runs only once on mount — not on every speakers change to avoid loops
  useEffect(() => {
    const base64List = speakers.filter(
      (s) => s.photo_url && s.photo_url.startsWith('data:image/')
    );
    if (base64List.length === 0) return;

    Promise.allSettled(
      base64List.map(async (spk) => {
        try {
          const { url, isPublic } = await uploadSpeakerPhotoToCloud(spk.photo_url, spk.id);
          if (isPublic && url.startsWith('http')) {
            setSpeakers((prev) =>
              prev.map((s) => (s.id === spk.id ? { ...s, photo_url: url } : s))
            );
            const uuid = stringToUuid(spk.id);
            const slug = spk.slug || spk.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            await supabaseAdmin.from('speakers').upsert({
              id: uuid,
              name: spk.name,
              slug,
              position: spk.position,
              organization: spk.organization,
              country: spk.country || 'Ghana',
              photo_url: url,
              biography: spk.biography || '',
              expertise: spk.expertise || [],
              is_keynote: Boolean(spk.is_keynote),
            });
          }
        } catch (err) {
          console.warn('Base64 auto-upload failed:', err);
        }
      })
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount only

  const refreshAll = async () => {
    setIsLiveSyncing(true);
    try {
      await Promise.allSettled([refreshRegistrations(), refreshEvents()]);
      setLastSyncedAt(new Date());
    } finally {
      setIsLiveSyncing(false);
    }
  };

  // Cross-tab and real-time backend synchronization for admin and attendees
  useEffect(() => {
    refreshAll();
    // Restore admin-added speakers from Supabase (recovers from localStorage version bumps)
    refreshSpeakers();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_REGS && e.newValue) {
        try {
          const list = JSON.parse(e.newValue);
          if (Array.isArray(list)) {
            setRegistrations(list.map(normalizeRegistration));
          }
        } catch {}
      }
    };

    const handleCustom = (e: Event) => {
      const customEvent = e as CustomEvent<Registration>;
      if (customEvent.detail) {
        const normalized = normalizeRegistration(customEvent.detail);
        setRegistrations((prev) => {
          if (prev.some((r) => r.registration_number === normalized.registration_number)) {
            return prev;
          }
          return [normalized, ...prev];
        });
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('cib_registration_created', handleCustom);
    const interval = setInterval(refreshAll, 6000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('cib_registration_created', handleCustom);
      clearInterval(interval);
    };
  }, []);

  const getEventBySlug = (slug: string) =>
    events.find((e) => e.slug === slug || e.id === slug) || (events.length > 0 ? events[0] : MOCK_EVENTS[0]);
  const getEventById = (id: string) =>
    events.find((e) => e.id === id || e.slug === id) || (events.length > 0 ? events[0] : MOCK_EVENTS[0]);
  const getRegistrationByNumber = (regNumber: string) => 
    registrations.find((r) => r.registration_number.toUpperCase() === regNumber.trim().toUpperCase());

  const addRegistration = (regData: Omit<Registration, 'id' | 'registration_number' | 'created_at'>): Registration => {
    const newReg: Registration = normalizeRegistration({
      ...regData,
      id: `reg-${Date.now()}`,
      registration_number: generateRegistrationNumber(),
      created_at: new Date().toISOString(),
    });

    setRegistrations((prev) => [newReg, ...prev]);

    // Store in localStorage immediately & notify other tabs
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REGS);
      const list = saved ? JSON.parse(saved) : [];
      localStorage.setItem(STORAGE_KEY_REGS, JSON.stringify([newReg, ...list]));
      window.dispatchEvent(new CustomEvent('cib_registration_created', { detail: newReg }));
    } catch (e) {
      console.warn('Storage sync error:', e);
    }

    // Dispatch registration asynchronously to backend API with full metadata
    ApiClient.createRegistration({
      id: newReg.id,
      registration_number: newReg.registration_number,
      event_id: regData.event_id,
      event_title: regData.event_title,
      registration_type_id: regData.registration_type_id,
      registration_type_name: regData.registration_type_name,
      first_name: regData.first_name,
      last_name: regData.last_name,
      email: regData.email,
      phone: regData.phone,
      organization: regData.organization,
      job_title: regData.job_title,
      country: regData.country,
      cib_member_id: regData.cib_member_id,
      membership_category: regData.membership_category,
      attendance_type: regData.attendance_type,
      dietary_requirements: regData.dietary_requirements,
      special_assistance: regData.special_assistance,
      total_amount: regData.total_amount,
      currency: regData.currency,
      payment_status: regData.payment_status,
      payment_reference: regData.payment_reference,
      payment_method: regData.payment_method,
      check_in_status: regData.check_in_status,
    }).then((res) => {
      if (res.success && res.data?.registration) {
        refreshRegistrations();
      }
    }).catch((err) => {
      console.log('[AppContext] Backend registration sync notice:', err);
    });

    // increment event registered count
    setEvents((prev) =>
      prev.map((evt) => {
        if (evt.id === regData.event_id) {
          const newCount = evt.registered_count + 1;
          return {
            ...evt,
            registered_count: newCount,
            status: newCount >= evt.capacity ? 'REGISTRATION_CLOSED' : evt.status,
          };
        }
        return evt;
      })
    );

    return newReg;
  };

  const checkInAttendee = (regNumber: string) => {
    const cleanNumber = regNumber.trim().toUpperCase();
    const regIndex = registrations.findIndex((r) => r.registration_number.toUpperCase() === cleanNumber);

    if (regIndex === -1) {
      return { success: false, message: `Registration number "${cleanNumber}" was not found in the system.` };
    }

    const reg = registrations[regIndex];
    if (reg.check_in_status === 'CHECKED_IN') {
      return {
        success: false,
        message: `Already Checked In! Attendee ${reg.first_name} ${reg.last_name} checked in at ${reg.check_in_time ? new Date(reg.check_in_time).toLocaleTimeString() : 'earlier'}.`,
        registration: reg,
      };
    }

    const updatedReg: Registration = {
      ...reg,
      check_in_status: 'CHECKED_IN',
      check_in_time: new Date().toISOString(),
    };

    const updatedList = [...registrations];
    updatedList[regIndex] = updatedReg;
    setRegistrations(updatedList);

    // Sync check-in status with backend engine
    ApiClient.checkInAttendee(cleanNumber).catch((err) => {
      console.log('[AppContext] Backend check-in sync:', err);
    });

    return {
      success: true,
      message: `Checked In Successfully! Welcome, ${reg.first_name} ${reg.last_name}.`,
      registration: updatedReg,
    };
  };

  const addEvent = async (eventData: Omit<EventItem, 'id' | 'created_at' | 'updated_at'>): Promise<EventItem> => {
    try {
      const res = await ApiClient.createEvent(eventData);
      if (res.success && res.data) {
        setEvents((prev) => [res.data, ...prev.filter((e) => e.id !== res.data.id)]);
        return res.data;
      }
    } catch (err) {
      console.warn('Backend event creation warning:', err);
    }
    const newEvent: EventItem = {
      ...eventData,
      id: `evt-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setEvents((prev) => [newEvent, ...prev]);
    return newEvent;
  };

  const updateEvent = async (id: string, updates: Partial<EventItem>) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates, updated_at: new Date().toISOString() } : e))
    );
    try {
      await ApiClient.updateEvent(id, updates);
    } catch (err) {
      console.warn('Backend update event failed:', err);
    }
  };

  const deleteEvent = async (id: string): Promise<boolean> => {
    // 1. Optimistically remove from events and registrations state
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setRegistrations((prev) => prev.filter((r) => r.event_id !== id));

    // 2. Call backend to delete from Supabase and database
    try {
      await ApiClient.deleteEvent(id);
      await refreshEvents();
      return true;
    } catch (err) {
      console.error('Backend deleteEvent error:', err);
      await refreshEvents();
      return false;
    }
  };

  const toggleEventPublish = async (id: string) => {
    const ev = events.find((e) => e.id === id);
    if (!ev) return;
    const nextStatus = ev.status === 'DRAFT' ? 'OPEN_FOR_REGISTRATION' : 'DRAFT';
    await updateEvent(id, { status: nextStatus });
  };

  const toggleEventFeatured = async (id: string) => {
    const ev = events.find((e) => e.id === id);
    if (!ev) return;
    await updateEvent(id, { is_featured: !ev.is_featured });
  };

  const addResourceToEvent = (eventId: string, resource: Omit<EventResource, 'id'>) => {
    const newResource: EventResource = {
      ...resource,
      id: `res-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      event_id: eventId,
    };
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          const existing = e.resources || [];
          return { ...e, resources: [newResource, ...existing], updated_at: new Date().toISOString() };
        }
        return e;
      })
    );
  };

  const updateEventResource = (eventId: string, resourceId: string, updates: Partial<EventResource>) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          const updatedRes = (e.resources || []).map((r) =>
            r.id === resourceId ? { ...r, ...updates } : r
          );
          return { ...e, resources: updatedRes, updated_at: new Date().toISOString() };
        }
        return e;
      })
    );
  };

  const deleteEventResource = (eventId: string, resourceId: string) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          const filtered = (e.resources || []).filter((r) => r.id !== resourceId);
          return { ...e, resources: filtered, updated_at: new Date().toISOString() };
        }
        return e;
      })
    );
  };

  return (
    <AppContext.Provider
      value={{
        events,
        registrations,
        speakers,
        sponsors,
        currentUser,
        setCurrentUser,
        registeredUserEmail,
        setRegisteredUserEmail,
        registeredUserName,
        setRegisteredUserName,
        getEventBySlug,
        getEventById,
        getRegistrationByNumber,
        refreshRegistrations,
        refreshSpeakers,
        refreshAll,
        isLiveSyncing,
        lastSyncedAt,
        addRegistration,
        checkInAttendee,
        addEvent,
        updateEvent,
        deleteEvent,
        toggleEventPublish,
        toggleEventFeatured,
        isAdminAuthenticated,
        adminLogin,
        adminLogout,
        addSpeaker,
        updateSpeaker,
        deleteSpeaker,
        addSponsor,
        updateSponsor,
        deleteSponsor,
        addResourceToEvent,
        updateEventResource,
        deleteEventResource,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
