import React, { createContext, useContext, useState, useEffect } from 'react';
import { EventItem, Registration, UserProfile, Speaker, Sponsor } from '../types';
import { MOCK_EVENTS, MOCK_REGISTRATIONS, DEMO_USERS, MOCK_SPEAKERS, MOCK_SPONSORS } from '../data/mockData';
import { generateRegistrationNumber } from '../lib/utils';
import { ApiClient } from '../lib/api';
import { supabase } from '../lib/supabase';

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_EVENTS = 'cib_ghana_events_v2';
const STORAGE_KEY_REGS = 'cib_ghana_registrations_v1';
const STORAGE_KEY_USER = 'cib_ghana_current_user_v1';
const STORAGE_KEY_REG_EMAIL = 'cib_ghana_registered_email_v1';
const STORAGE_KEY_REG_NAME = 'cib_ghana_registered_name_v1';
const STORAGE_KEY_ADMIN_AUTH = 'cib_admin_auth_v1';
const STORAGE_KEY_SPEAKERS = 'cib_ghana_speakers_v1';

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

  const [events, setEvents] = useState<EventItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_EVENTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
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
    const saved = localStorage.getItem(STORAGE_KEY_SPEAKERS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { console.error(e); }
    }
    return MOCK_SPEAKERS;
  });
  const [sponsors] = useState<Sponsor[]>(MOCK_SPONSORS);

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
    setSpeakers((prev) => [...prev, newSpeaker]);
  };

  const updateSpeaker = (id: string, updates: Partial<Speaker>) => {
    setSpeakers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const deleteSpeaker = (id: string) => {
    setSpeakers((prev) => prev.filter((s) => s.id !== id));
  };

  const refreshEvents = async () => {
    try {
      const res = await ApiClient.getEvents();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setEvents(res.data);
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
          setEvents(data as EventItem[]);
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

  const getEventBySlug = (slug: string) => events.find((e) => e.slug === slug);
  const getEventById = (id: string) => events.find((e) => e.id === id);
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
