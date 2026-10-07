import React, { createContext, useContext, useState, useEffect } from 'react';
import { EventItem, Registration, UserProfile, Speaker, SpeakerType, Sponsor, SponsorType, SponsorTier, EventResource } from '../types';
import { MOCK_EVENTS, MOCK_REGISTRATIONS, DEMO_USERS, MOCK_SPEAKERS, MOCK_SPONSORS } from '../data/mockData';
import { generateRegistrationNumber } from '../lib/utils';
import { ApiClient } from '../lib/api';
import { supabase, supabaseAdmin, stringToUuid, uploadSpeakerPhotoToCloud, uploadSponsorLogoToCloud } from '../lib/supabase';
import { syncRegistrationPayment } from '../lib/registrationSync';

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
  refreshRegistrations: (options?: { silent?: boolean }) => Promise<void>;
  refreshSpeakers: () => Promise<void>;
  refreshSponsors: () => Promise<void>;
  refreshAll: (options?: { silent?: boolean }) => Promise<void>;
  isLiveSyncing: boolean;
  lastSyncedAt: Date | null;
  addRegistration: (reg: Omit<Registration, 'id' | 'registration_number' | 'created_at'>) => Registration;
  checkInAttendee: (regNumber: string, targetStatus?: 'CHECKED_IN' | 'REGISTERED') => { success: boolean; message: string; registration?: Registration };
  updatePaymentStatus: (identifier: string, status: 'SUCCESSFUL' | 'PENDING' | 'FAILED', reference?: string, method?: string, category?: string) => Promise<boolean>;
  addEvent: (event: Omit<EventItem, 'id' | 'created_at' | 'updated_at'>) => Promise<EventItem> | EventItem;
  updateEvent: (id: string, updates: Partial<EventItem>) => Promise<void> | void;
  deleteEvent: (id: string) => Promise<boolean> | void;
  toggleEventPublish: (id: string) => Promise<void> | void;
  toggleEventFeatured: (id: string) => Promise<void> | void;
  isAdminAuthenticated: boolean;
  adminLogin: (password: string) => Promise<boolean>;
  adminLogout: () => void;
  addSpeaker: (speaker: Partial<Speaker>) => Promise<void> | void;
  updateSpeaker: (id: string, updates: Partial<Speaker>) => Promise<void> | void;
  deleteSpeaker: (id: string) => Promise<void> | void;
  addSponsor: (sponsor: Partial<Sponsor>) => void;
  updateSponsor: (id: string, updates: Partial<Sponsor>) => void;
  deleteSponsor: (id: string, entityName?: string, entityType?: SponsorType) => Promise<void> | void;
  addResourceToEvent: (eventId: string, resource: Omit<EventResource, 'id'>) => void;
  updateEventResource: (eventId: string, resourceId: string, updates: Partial<EventResource>) => void;
  deleteEventResource: (eventId: string, resourceId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_EVENTS = 'cib_ghana_events_v7';
const STORAGE_KEY_REGS = 'cib_ghana_registrations_v1';
const STORAGE_KEY_USER = 'cib_ghana_current_user_v1';
const STORAGE_KEY_REG_EMAIL = 'cib_ghana_registered_email_v1';
const STORAGE_KEY_REG_NAME = 'cib_ghana_registered_name_v1';
const STORAGE_KEY_ADMIN_AUTH = 'cib_admin_auth_v1';
// v13: Force re-fetch to pick up new CEO portrait
const STORAGE_KEY_SPEAKERS = 'cib_ghana_speakers_v13';
const STORAGE_KEY_DELETED_SPEAKERS = 'cib_ghana_deleted_spk_ids_v13';
// v7: Synchronize 20 Corporate Members and 20 Sponsors across all devices
const STORAGE_KEY_SPONSORS = 'cib_ghana_sponsors_v7';
const STORAGE_KEY_DELETED_SPONSORS = 'cib_ghana_deleted_sponsors_v1';

export const getDeletedSponsorKeys = (): Set<string> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DELETED_SPONSORS);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.map((x: string) => String(x).toLowerCase()) : []);
  } catch {
    return new Set();
  }
};

export const addDeletedSponsorKey = (keys: string[]) => {
  try {
    const existing = getDeletedSponsorKeys();
    keys.forEach((k) => {
      if (k && k.trim()) existing.add(k.trim().toLowerCase());
    });
    localStorage.setItem(STORAGE_KEY_DELETED_SPONSORS, JSON.stringify(Array.from(existing)));
  } catch {}
};

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

export const PURGED_MOCK_SPEAKER_NAMES: string[] = [];

// Any speaker created by admin, having an 'sp-' ID, or having a Supabase UUID is genuine
const isAdminCreatedSpeaker = (id: string): boolean =>
  /^sp-/.test(id) || /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

export const isPurgedMockSpeaker = (s: { id: string; name?: string }): boolean => {
  // Never purge admin-created, live database, or UUID speakers
  if (isAdminCreatedSpeaker(s.id)) return false;
  // Only purge legacy static placeholder IDs
  if (PURGED_MOCK_SPEAKER_IDS.has(s.id)) return true;
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
  if (nameA && nameB && nameA === nameB) return true;
  return false;
};

export const isSameSponsor = (
  a: { id?: string; name?: string; type?: string; tier?: string },
  b: { id?: string; name?: string; type?: string; tier?: string }
): boolean => {
  if (a.id && b.id) {
    if (a.id === b.id) return true;
    if (stringToUuid(a.id) === b.id || a.id === stringToUuid(b.id)) return true;
  }
  const typeA = (a.type as any) === 'PARTNER' ? 'CORPORATE_MEMBER' : a.type;
  const typeB = (b.type as any) === 'PARTNER' ? 'CORPORATE_MEMBER' : b.type;

  const nameA = (a.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const nameB = (b.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  if (nameA && nameB) {
    if (nameA === nameB) {
      if (typeA && typeB) return typeA === typeB;
      return true;
    }
    // Check ADB aliases: 'adb' vs 'agriculturaldevelopmentbankadb'
    if (
      (nameA === 'adb' && nameB.includes('agriculturaldevelopmentbank')) ||
      (nameB === 'adb' && nameA.includes('agriculturaldevelopmentbank'))
    ) {
      if (typeA && typeB) return typeA === typeB;
      return true;
    }
  }
  return false;
};

// Priority order for VIP speakers — lower number = higher priority
const SPEAKER_PRIORITY: Record<string, number> = {
  'spk-president': 1,   // President
  'spk-asiama': 2,      // Governor
  'spk-haruna': 3,      // Education Minister
  'spk-sam-george': 4,  // Comm & Tech Minister
  'spk-2': 5,           // CEO (Dzato)
  'spk-ahiati': 6,      // Doris Ahiati
};

const getSpeakerPriority = (s: Speaker): number =>
  SPEAKER_PRIORITY[s.id] ?? 999;

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
  // Sort: VIP priority first, then photos-first among the rest
  return result.sort((a, b) => {
    const pA = getSpeakerPriority(a);
    const pB = getSpeakerPriority(b);
    if (pA !== pB) return pA - pB;
    // Among non-priority speakers, photos first
    const aHas = Boolean(a.photo_url && a.photo_url.trim() !== '');
    const bHas = Boolean(b.photo_url && b.photo_url.trim() !== '');
    if (aHas && !bHas) return -1;
    if (!aHas && bHas) return 1;
    return 0;
  });
};

export const sortSponsors = (list: Sponsor[]): Sponsor[] => {
  const getPriority = (name: string): number => {
    const n = (name || '').toLowerCase().trim();
    if (n.includes('bank of ghana') || n === 'bog') return 1;
    if (n.includes('ghana association of banks') || n.includes('gab')) return 2;
    if (n.includes('standard chartered') || n.includes('scb')) return 3;
    if (n.includes('ecobank')) return 4;
    if (n.includes('gcb bank') || n === 'gcb') return 5;
    if (n.includes('ghana international bank') || n.includes('ghib')) return 6;
    if (n.includes('absa')) return 7;
    if (n.includes('stanbic')) return 8;
    if (n.includes('fidelity')) return 9;
    if (n.includes('ghipss')) return 10;
    return 100;
  };

  return [...list].sort((a, b) => {
    const pA = getPriority(a.name);
    const pB = getPriority(b.name);
    if (pA !== pB) return pA - pB;
    return (a.name || '').localeCompare(b.name || '');
  });
};

export const normalizeRegistration = (r: Registration): Registration => {
  let cat = r.membership_category;
  const memId = (r.cib_member_id || '').toUpperCase();
  const typeName = (r.registration_type_name || '').toLowerCase();
  const sa = (r.special_assistance || '');

  // 1. Check embedded category in special_assistance e.g. "Category: Student"
  const saMatch = sa.match(/Category:\s*(ACIB|FCIB|Student|Non-Member)/i);
  if (saMatch) {
    cat = saMatch[1];
  } else if (!cat || !['ACIB', 'FCIB', 'Student', 'Non-Member'].includes(cat) || cat === 'Non-Member') {
    // 2. Infer from member PIN or package name if currently unset or defaulted
    if (memId.startsWith('FCIB') || typeName.includes('fellow') || typeName.includes('fcib')) {
      cat = 'FCIB';
    } else if (memId.startsWith('STU') || typeName.includes('student')) {
      cat = 'Student';
    } else if (memId.startsWith('ACIB') || typeName.includes('associate') || typeName.includes('chartered') || typeName.includes('acib')) {
      cat = 'ACIB';
    }
  }

  if (!cat || !['ACIB', 'FCIB', 'Student', 'Non-Member'].includes(cat)) {
    cat = 'Non-Member';
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
        'cib_ghana_speakers_v12',
        'cib_ghana_speakers_v11',
        'cib_ghana_speakers_v8',
        'cib_ghana_speakers_v7',
        'cib_ghana_speakers_v6',
        'cib_ghana_speakers_v5',
        'cib_ghana_deleted_spk_ids_v12',
        'cib_ghana_deleted_spk_ids_v11',
        'cib_ghana_deleted_spk_ids_v8',
        'cib_ghana_deleted_spk_ids_v7',
        'cib_ghana_events_v6',
        'cib_ghana_events_v5',
        'cib_ghana_sponsors_v5',
        'cib_ghana_sponsors_v4',
        'cib_ghana_sponsors_v3',
        'cib_ghana_sponsors_v2',
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
          return parsed.map((evt) => {
            const isConference = evt.id === 'evt-1' || evt.id === 'e1111111-1111-1111-1111-111111111111' || evt.slug === '30th-national-banking-ethics-conference-2026';
            const fee = evt.registration_fee === 1200 ? 6000 : (evt.registration_fee || 6000);
            const types = evt.registration_types?.map((rt: any) => ({
              ...rt,
              price: rt.price === 1200 ? 6000 : rt.price,
            }));
            if (isConference) {
              return {
                ...evt,
                start_date: evt.start_date === '2026-11-08' ? '2026-11-09' : (evt.start_date || '2026-11-09'),
                registration_fee: 5600,
                registration_types: MOCK_EVENTS[0].registration_types,
                speakers: MOCK_SPEAKERS.filter((s) => !isPurgedMockSpeaker(s)),
                agenda: MOCK_EVENTS[0].agenda,
              };
            }
            return {
              ...evt,
              registration_fee: fee,
              registration_types: types || evt.registration_types,
            };
          });
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

    const saved = localStorage.getItem(STORAGE_KEY_SPEAKERS) || localStorage.getItem('cib_ghana_speakers_v10');
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
    const deletedKeys = getDeletedSponsorKeys();
    const isNotDeleted = (s: { id?: string; dbId?: string; name?: string }) => {
      if (!s) return false;
      if (s.id && deletedKeys.has(s.id.toLowerCase())) return false;
      if (s.dbId && deletedKeys.has(s.dbId.toLowerCase())) return false;
      return true;
    };

    const saved = localStorage.getItem(STORAGE_KEY_SPONSORS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return sortSponsors(
            parsed
              .filter(isNotDeleted)
              .map((s) => ({
                ...s,
                type: (s.type as any) === 'PARTNER' ? 'CORPORATE_MEMBER' : s.type,
                tier: (s.tier as any) === 'PARTNER' ? 'CORPORATE_MEMBER' : s.tier,
              }))
          );
        }
      } catch (e) { console.error(e); }
    }

    return sortSponsors(MOCK_SPONSORS.filter(isNotDeleted));
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
    // If initialized on any public route, admin authentication must never be active
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin')) {
      try {
        localStorage.removeItem(STORAGE_KEY_ADMIN_AUTH);
        sessionStorage.removeItem(STORAGE_KEY_ADMIN_AUTH);
      } catch {}
      return false;
    }
    return localStorage.getItem(STORAGE_KEY_ADMIN_AUTH) === 'true';
  });

  const adminLogin = async (password: string): Promise<boolean> => {
    const trimmed = password.trim();
    if (trimmed === 'cibghana') {
      setIsAdminAuthenticated(true);
      try {
        localStorage.setItem(STORAGE_KEY_ADMIN_AUTH, 'true');
        sessionStorage.setItem(STORAGE_KEY_ADMIN_AUTH, 'true');
      } catch {}
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
    try {
      localStorage.removeItem(STORAGE_KEY_ADMIN_AUTH);
      sessionStorage.removeItem(STORAGE_KEY_ADMIN_AUTH);
    } catch {}
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

  const addSpeaker = async (speaker: Partial<Speaker>) => {
    const isKeynote = speaker.speaker_type === 'KEYNOTE' || Boolean(speaker.is_keynote);
    const speakerType: SpeakerType = isKeynote ? 'KEYNOTE' : 'PANEL';
    const rawId = speaker.id || `sp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const uuid = stringToUuid(rawId);
    const cleanSlug = speaker.slug || (speaker.name ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const newSpeaker: Speaker = {
      id: uuid,
      name: speaker.name ?? '',
      slug: cleanSlug,
      position: speaker.position ?? '',
      organization: speaker.organization ?? '',
      country: speaker.country ?? 'Ghana',
      photo_url: speaker.photo_url ?? '',
      biography: speaker.biography ?? '',
      expertise: Array.isArray(speaker.expertise) ? speaker.expertise : [],
      is_keynote: isKeynote,
      speaker_type: speakerType,
      linkedin_url: speaker.linkedin_url || '',
      twitter_url: speaker.twitter_url || '',
      website_url: speaker.website_url || '',
    };

    // Un-blacklist if previously deleted
    try {
      const raw = localStorage.getItem(STORAGE_KEY_DELETED_SPEAKERS);
      if (raw) {
        const arr: string[] = JSON.parse(raw);
        if (Array.isArray(arr) && (arr.includes(rawId) || arr.includes(uuid))) {
          localStorage.setItem(
            STORAGE_KEY_DELETED_SPEAKERS,
            JSON.stringify(arr.filter((id) => id !== rawId && id !== uuid))
          );
        }
      }
    } catch { /* ignore */ }

    // 1. Immediately update state
    setSpeakers((prev) => {
      const filtered = prev.filter((s) => !isSameSpeaker(s, newSpeaker));
      return [newSpeaker, ...filtered];
    });

    // 2. Synchronously update localStorage so immediate page refresh never loses the speaker
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SPEAKERS);
      const list: Speaker[] = saved ? JSON.parse(saved) : [];
      const updated = [newSpeaker, ...list.filter((s) => !isSameSpeaker(s, newSpeaker))];
      localStorage.setItem(STORAGE_KEY_SPEAKERS, JSON.stringify(updated));
    } catch {}

    // 3. Live Sync to Supabase Database
    const payload = {
      id: uuid,
      name: newSpeaker.name,
      slug: newSpeaker.slug,
      position: newSpeaker.position,
      organization: newSpeaker.organization,
      country: newSpeaker.country,
      photo_url: newSpeaker.photo_url,
      biography: newSpeaker.biography,
      expertise: newSpeaker.expertise,
      is_keynote: isKeynote,
      linkedin_url: newSpeaker.linkedin_url || null,
      twitter_url: newSpeaker.twitter_url || null,
      website_url: newSpeaker.website_url || null,
    };

    try {
      await supabaseAdmin.from('speakers').upsert(payload);
    } catch (e) {
      console.warn('Direct Supabase speaker upsert failed:', e);
    }

    try {
      await ApiClient.saveSpeaker({ ...newSpeaker, id: uuid, slug: cleanSlug });
    } catch {}
  };

  const updateSpeaker = async (id: string, updates: Partial<Speaker>) => {
    const uuid = stringToUuid(id);
    let targetSpeaker: Speaker | null = null;

    setSpeakers((prev) =>
      prev.map((s) => {
        if (!isSameSpeaker(s, { id })) return s;
        const merged: Speaker = { ...s, ...updates, id: s.id };
        if (updates.speaker_type !== undefined) {
          merged.is_keynote = updates.speaker_type === 'KEYNOTE';
        } else if (updates.is_keynote !== undefined) {
          merged.speaker_type = updates.is_keynote ? 'KEYNOTE' : 'PANEL';
        }
        targetSpeaker = merged;
        return merged;
      })
    );

    // Save to localStorage immediately
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SPEAKERS);
      if (saved && targetSpeaker) {
        const list: Speaker[] = JSON.parse(saved);
        const updated = list.map((s) => (isSameSpeaker(s, { id }) ? targetSpeaker! : s));
        localStorage.setItem(STORAGE_KEY_SPEAKERS, JSON.stringify(updated));
      }
    } catch {}

    // Persist to Supabase and ApiClient
    const sToSave = targetSpeaker || updates;
    const isKeynote = sToSave.speaker_type === 'KEYNOTE' || Boolean(sToSave.is_keynote);
    const cleanSlug = sToSave.slug || (sToSave.name ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const payload = {
      id: uuid,
      name: sToSave.name || '',
      slug: cleanSlug,
      position: sToSave.position || '',
      organization: sToSave.organization || '',
      country: sToSave.country || 'Ghana',
      photo_url: sToSave.photo_url || '',
      biography: sToSave.biography || '',
      expertise: Array.isArray(sToSave.expertise) ? sToSave.expertise : [],
      is_keynote: isKeynote,
      linkedin_url: sToSave.linkedin_url || null,
      twitter_url: sToSave.twitter_url || null,
      website_url: sToSave.website_url || null,
    };

    try {
      await supabaseAdmin.from('speakers').upsert(payload);
    } catch (e) {
      console.warn('Supabase speaker update error:', e);
    }
    try {
      await ApiClient.saveSpeaker({ ...sToSave, id: uuid, slug: cleanSlug });
    } catch {}
  };

  const deleteSpeaker = async (id: string) => {
    const uuid = stringToUuid(id);
    // 1. Remove from live state
    setSpeakers((prev) => prev.filter((s) => !isSameSpeaker(s, { id })));

    // 2. Add to permanent deleted-IDs blacklist so it never re-appears on refresh
    try {
      const raw = localStorage.getItem(STORAGE_KEY_DELETED_SPEAKERS);
      const arr: string[] = raw ? JSON.parse(raw) : [];
      if (!arr.includes(id)) arr.push(id);
      if (!arr.includes(uuid)) arr.push(uuid);
      localStorage.setItem(STORAGE_KEY_DELETED_SPEAKERS, JSON.stringify(arr));
    } catch {}

    // 3. Immediately update localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SPEAKERS);
      if (saved) {
        const list: Speaker[] = JSON.parse(saved);
        const filtered = list.filter((s) => !isSameSpeaker(s, { id }));
        localStorage.setItem(STORAGE_KEY_SPEAKERS, JSON.stringify(filtered));
      }
    } catch {}

    // 4. Delete from Supabase
    try {
      await supabaseAdmin.from('speakers').delete().eq('id', uuid);
    } catch (e) {
      console.warn('Supabase speaker delete error:', e);
    }
    try {
      await ApiClient.deleteSpeaker(uuid);
    } catch {}
  };

  const addSponsor = async (sponsor: Partial<Sponsor>) => {
    const isMember = sponsor.type === 'CORPORATE_MEMBER' || (sponsor.type as any) === 'PARTNER';
    const newId = sponsor.id || `sp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newSponsor: Sponsor = {
      id: newId,
      name: sponsor.name || 'New Entity',
      logo_url: sponsor.logo_url || '',
      website_url: sponsor.website_url || '',
      type: isMember ? 'CORPORATE_MEMBER' : 'SPONSOR',
      tier: isMember ? 'CORPORATE_MEMBER' : 'SPONSOR',
      categoryOrRole: sponsor.categoryOrRole || (isMember ? 'Licensed Commercial Bank' : 'Corporate Sponsor'),
      description: sponsor.description || '',
    };
    setSponsors((prev) => sortSponsors([newSponsor, ...prev]));

    // Live Sync to Supabase & Backend API
    const uuid = stringToUuid(newId);
    const validTiers = ['PARTNER', 'PLATINUM', 'GOLD', 'SILVER', 'ACADEMIC'];
    const dbTier = isMember ? 'PARTNER' : (validTiers.includes(newSponsor.tier as any) ? newSponsor.tier : 'PLATINUM');
    const descJson = JSON.stringify({
      role: newSponsor.categoryOrRole,
      desc: newSponsor.description,
      type: newSponsor.type,
      originalId: newId,
    });

    try {
      await supabaseAdmin.from('sponsors').upsert({
        id: uuid,
        name: newSponsor.name,
        logo_url: newSponsor.logo_url || '',
        website_url: newSponsor.website_url || null,
        tier: dbTier,
        description: descJson,
      });
    } catch (e) {
      console.warn('Direct Supabase sponsor save failed:', e);
    }
    try {
      await ApiClient.saveSponsor({ ...newSponsor, id: uuid });
    } catch {}
  };

  const updateSponsor = async (id: string, updates: Partial<Sponsor>) => {
    let targetSponsor: Sponsor | null = null;
    setSponsors((prev) =>
      sortSponsors(
        prev.map((s) => {
          if (s.id !== id) return s;
          const newType = updates.type || s.type;
          const normalizedType = (newType as any) === 'PARTNER' ? 'CORPORATE_MEMBER' : newType;
          const merged: Sponsor = {
            ...s,
            ...updates,
            type: normalizedType,
            tier: normalizedType,
          };
          targetSponsor = merged;
          return merged;
        })
      )
    );

    // Live Sync to Supabase & Backend API
    const sToSave: Partial<Sponsor> = targetSponsor || { id, ...updates };
    const uuid = stringToUuid(id);
    const isMember = sToSave.type === 'CORPORATE_MEMBER' || (sToSave.type as any) === 'PARTNER';
    const validTiers = ['PARTNER', 'PLATINUM', 'GOLD', 'SILVER', 'ACADEMIC'];
    const dbTier = isMember ? 'PARTNER' : (validTiers.includes(sToSave.tier as any) ? sToSave.tier : 'PLATINUM');
    const descJson = JSON.stringify({
      role: sToSave.categoryOrRole || '',
      desc: sToSave.description || '',
      type: isMember ? 'CORPORATE_MEMBER' : 'SPONSOR',
      originalId: id,
    });

    try {
      await supabaseAdmin.from('sponsors').upsert({
        id: uuid,
        name: sToSave.name || '',
        logo_url: sToSave.logo_url || '',
        website_url: sToSave.website_url || null,
        tier: dbTier,
        description: descJson,
      });
    } catch (e) {
      console.warn('Direct Supabase sponsor update failed:', e);
    }
    try {
      await ApiClient.saveSponsor({ ...sToSave, id: uuid });
    } catch {}
  };

  const deleteSponsor = async (id: string, entityName?: string, entityType?: SponsorType) => {
    // 1. Locate specific target entity matching ID and (if provided) category type
    const target = sponsors.find((s) => {
      const idMatches = s.id === id || s.dbId === id;
      if (!idMatches) return false;
      if (entityType) {
        const sType = (s.type as any) === 'PARTNER' ? 'CORPORATE_MEMBER' : s.type;
        return sType === entityType;
      }
      return true;
    }) || sponsors.find((s) => s.id === id || s.dbId === id);

    const targetType: SponsorType = entityType || target?.type || ((target?.tier as any) === 'PARTNER' ? 'CORPORATE_MEMBER' : 'SPONSOR');
    const finalName = entityName || target?.name || '';
    const dbId = target?.dbId;
    const uuid = stringToUuid(id);

    // 2. Remove ONLY from matching category in local live state
    setSponsors((prev) =>
      prev.filter((s) => {
        // Direct ID match
        if (s.id === id || (dbId && s.dbId === dbId)) {
          // If entityType was specified, only remove if types match
          if (targetType) {
            const sType = (s.type as any) === 'PARTNER' ? 'CORPORATE_MEMBER' : s.type;
            if (sType !== targetType) return true; // KEEP opposite category untouched!
          }
          return false;
        }

        // Target match within SAME category only
        if (target && isSameSponsor(s, target)) {
          const sType = (s.type as any) === 'PARTNER' ? 'CORPORATE_MEMBER' : s.type;
          if (targetType && sType !== targetType) return true; // KEEP opposite category!
          return false;
        }

        return true;
      })
    );

    // 3. Blacklist unique IDs only (NEVER blacklist name to ensure the other category stays visible)
    const keysToBlacklist = [id];
    if (uuid) keysToBlacklist.push(uuid);
    if (dbId) keysToBlacklist.push(dbId);
    addDeletedSponsorKey(keysToBlacklist);

    // 4. Update localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SPONSORS);
      if (saved) {
        const list: Sponsor[] = JSON.parse(saved);
        const filtered = list.filter((s) => {
          if (s.id === id || (dbId && s.dbId === dbId)) {
            const sType = (s.type as any) === 'PARTNER' ? 'CORPORATE_MEMBER' : s.type;
            if (targetType && sType !== targetType) return true;
            return false;
          }
          if (target && isSameSponsor(s, target)) {
            const sType = (s.type as any) === 'PARTNER' ? 'CORPORATE_MEMBER' : s.type;
            if (targetType && sType !== targetType) return true;
            return false;
          }
          return true;
        });
        localStorage.setItem(STORAGE_KEY_SPONSORS, JSON.stringify(filtered));
      }
    } catch {}

    // 5. Delete targeted DB row from Supabase (by dbId, id, and uuid only)
    try {
      if (dbId) {
        await supabaseAdmin.from('sponsors').delete().eq('id', dbId);
      }
      await supabaseAdmin.from('sponsors').delete().eq('id', id);
      if (uuid && uuid !== id && uuid !== dbId) {
        await supabaseAdmin.from('sponsors').delete().eq('id', uuid);
      }

      // If deleting by name, ALWAYS constrain by tier so the opposite category is NEVER touched
      if (finalName) {
        if (targetType === 'CORPORATE_MEMBER') {
          await supabaseAdmin.from('sponsors').delete().ilike('name', finalName).eq('tier', 'PARTNER');
        } else {
          await supabaseAdmin.from('sponsors').delete().ilike('name', finalName).neq('tier', 'PARTNER');
        }
      }
    } catch (e) {
      console.warn('Direct Supabase sponsor delete error:', e);
    }

    // 6. Delete logo from Supabase Storage ONLY if NO other sponsor or corporate member uses it
    const logoUrl = target?.logo_url;
    if (logoUrl && logoUrl.includes('/storage/v1/object/public/speaker-photos/')) {
      const isLogoShared = sponsors.some(
        (s) => s.id !== id && s.dbId !== id && s.logo_url === logoUrl
      );
      if (!isLogoShared) {
        try {
          const storagePath = logoUrl.split('/storage/v1/object/public/speaker-photos/')[1];
          if (storagePath) {
            await supabaseAdmin.storage.from('speaker-photos').remove([storagePath]);
          }
        } catch {}
      }
    }

    try {
      if (dbId) await ApiClient.deleteSponsor(dbId);
      await ApiClient.deleteSponsor(uuid);
    } catch {}
  };

  const refreshEvents = async () => {
    try {
      const res = await ApiClient.getEvents();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setEvents((prev) => {
          const targetList = res.data;
          const merged = targetList.map((be) => {
            const local = prev.find((pe) => pe.id === be.id);
            const defaultAgenda = MOCK_EVENTS.find((m) => m.id === be.id)?.agenda || MOCK_EVENTS[0].agenda;
            const isUpToDate = (ag?: any[]) => ag && ag.some((s) => s.id?.includes('ag-d0-1') || s.title?.includes('Till Mama Calls') || s.title?.includes('Arrival of participants'));
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
              ...restLocal,
              ...be,
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
    const eventClient = supabaseAdmin || supabase;
    if (eventClient) {
      try {
        const { data, error } = await eventClient
          .from('events')
          .select('*, registration_types(*)')
          .order('start_date', { ascending: true });
        if (!error && Array.isArray(data) && data.length > 0) {
          setEvents((prev) => {
            const targetList = (data as EventItem[]);
            const merged = targetList.map((be) => {
              const local = prev.find((pe) => pe.id === be.id);
              const defaultAgenda = MOCK_EVENTS.find((m) => m.id === be.id)?.agenda || MOCK_EVENTS[0].agenda;
              const isUpToDate = (ag?: any[]) => ag && ag.some((s) => s.id?.includes('ag-d0-1') || s.title?.includes('Till Mama Calls') || s.title?.includes('Arrival of participants'));
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
                ...restLocal,
                ...be,
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

  const refreshRegistrations = async (options?: { silent?: boolean }) => {
    const isSilent = Boolean(options?.silent);
    if (!isSilent) {
      setIsLiveSyncing(true);
    }
    try {
      let remoteRegistrations: Registration[] = [];

      // 1. Direct Supabase query (authoritative source with service role bypass)
      const regClient = supabaseAdmin || supabase;
      if (regClient) {
        try {
          const { data, error } = await regClient
            .from('registrations')
            .select('*, registration_types(name), events(title)')
            .order('created_at', { ascending: false });
          if (!error && Array.isArray(data) && data.length > 0) {
            remoteRegistrations = data.map((r: any) => ({
              id: r.id,
              event_id: r.event_id,
              event_title: r.events?.title || '30th National Banking & Ethics Conference 2026',
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
              membership_category: r.membership_category,
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
          }
        } catch (err) {
          console.warn('Direct Supabase fetch registrations notice:', err);
        }
      }

      // 2. Fetch from backend API as well and merge
      try {
        const res = await ApiClient.getRegistrations();
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          if (remoteRegistrations.length === 0) {
            remoteRegistrations = res.data;
          } else {
            const regMap = new Map<string, Registration>();
            for (const r of remoteRegistrations) {
              regMap.set(r.registration_number.toUpperCase(), r);
            }
            for (const apiReg of res.data) {
              const key = apiReg.registration_number.toUpperCase();
              const existing = regMap.get(key);
              if (!existing) {
                regMap.set(key, apiReg);
              } else if (apiReg.payment_status === 'SUCCESSFUL' && existing.payment_status !== 'SUCCESSFUL') {
                regMap.set(key, { ...existing, ...apiReg, payment_status: 'SUCCESSFUL' });
              }
            }
            remoteRegistrations = Array.from(regMap.values());
          }
        }
      } catch {
        // Backend temporarily offline
      }

      if (remoteRegistrations.length > 0) {
        setRegistrations((prev) => {
          // Protect any registration currently in local state marked SUCCESSFUL from being downgraded to PENDING
          const remoteMap = new Map<string, Registration>();
          for (const r of remoteRegistrations) {
            remoteMap.set(r.registration_number.toUpperCase(), normalizeRegistration(r));
          }

          for (const localReg of prev) {
            const key = localReg.registration_number.toUpperCase();
            const remote = remoteMap.get(key);
            if (remote) {
              if (localReg.payment_status === 'SUCCESSFUL' && remote.payment_status !== 'SUCCESSFUL') {
                remoteMap.set(key, { ...remote, payment_status: 'SUCCESSFUL' });
              }
            } else {
              // Keep local-only draft registrations
              remoteMap.set(key, localReg);
            }
          }

          const merged = Array.from(remoteMap.values()).sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          try {
            localStorage.setItem(STORAGE_KEY_REGS, JSON.stringify(merged));
          } catch {}
          return merged;
        });
        setLastSyncedAt(new Date());
      }
    } finally {
      if (!isSilent) {
        setIsLiveSyncing(false);
      }
    }
  };

  // Fetch speakers from backend API / Supabase and merge into local state
  // Ensures cloud photos and new speakers are visible on ALL devices (mobile, tablet, desktop)
  const refreshSpeakers = async () => {
    let remoteSpeakers: any[] = [];

    // 1. Direct Supabase query (bypasses cache, reads live postgres table)
    const spkClient = supabaseAdmin || supabase;
    if (spkClient) {
      try {
        const { data, error } = await spkClient
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

    // 2. Fallback to ApiClient
    if (remoteSpeakers.length === 0) {
      try {
        const res = await ApiClient.getSpeakers();
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          remoteSpeakers = res.data;
        }
      } catch {
        // ApiClient offline
      }
    }

    if (remoteSpeakers.length === 0) return;

    let deletedIds = new Set<string>();
    try {
      const raw = localStorage.getItem(STORAGE_KEY_DELETED_SPEAKERS);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) deletedIds = new Set(arr);
      }
    } catch {}

    setSpeakers((prev) => {
      // 1. Update existing speakers with cloud photo and latest info
      const updated: Speaker[] = prev.map((s): Speaker => {
        const remote = remoteSpeakers.find((d: any) => isSameSpeaker(s, d));
        if (!remote) return s;

        // Prefer remote cloud photo URL (starts with http/https)
        const remotePhoto = remote.photo_url && remote.photo_url.trim() !== '' ? remote.photo_url : '';
        const localPhotoIsRemote = s.photo_url && (s.photo_url.startsWith('http://') || s.photo_url.startsWith('https://'));
        const photoToUse = remotePhoto.startsWith('http')
          ? remotePhoto
          : (localPhotoIsRemote ? s.photo_url : (remotePhoto || s.photo_url || ''));

        const isKeynote = remote.is_keynote !== undefined ? Boolean(remote.is_keynote) : Boolean(s.is_keynote);
        const speakerType: SpeakerType = isKeynote ? 'KEYNOTE' : 'PANEL';
        // For known mock speakers, prefer the local position (so code updates win over stale Supabase values)
        const positionToUse = !isAdminCreatedSpeaker(s.id) ? (s.position || remote.position || '') : (remote.position || s.position || '');
        return {
          ...s,
          id: remote.id || s.id,
          photo_url: photoToUse,
          name: remote.name || s.name || '',
          position: positionToUse,
          organization: remote.organization || s.organization || '',
          biography: remote.biography || s.biography || '',
          country: remote.country || s.country || 'Ghana',
          expertise: Array.isArray(remote.expertise) ? remote.expertise : (s.expertise || []),
          is_keynote: isKeynote,
          speaker_type: speakerType,
          linkedin_url: remote.linkedin_url ?? s.linkedin_url ?? '',
          twitter_url: remote.twitter_url ?? s.twitter_url ?? '',
          website_url: remote.website_url ?? s.website_url ?? '',
        };
      });

      // 2. Add genuine new remote speakers not already present locally
      const toAdd: Speaker[] = [];
      for (const d of remoteSpeakers) {
        const alreadyExists = updated.some((p) => isSameSpeaker(p, d));
        const wasDeleted = deletedIds.has(d.id);
        if (!alreadyExists && !wasDeleted && !isPurgedMockSpeaker(d)) {
          const isKeynote = Boolean(d.is_keynote);
          const speakerType: SpeakerType = isKeynote ? 'KEYNOTE' : 'PANEL';
          toAdd.push({
            id: d.id,
            name: d.name ?? '',
            slug: d.slug ?? (d.name ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            position: d.position ?? '',
            organization: d.organization ?? '',
            country: d.country ?? 'Ghana',
            photo_url: d.photo_url ?? '',
            biography: d.biography ?? '',
            expertise: Array.isArray(d.expertise) ? d.expertise : [],
            is_keynote: isKeynote,
            speaker_type: speakerType,
            linkedin_url: d.linkedin_url ?? '',
            twitter_url: d.twitter_url ?? '',
            website_url: d.website_url ?? '',
          });
        }
      }

      const merged = deduplicateSpeakers([...updated, ...toAdd]);
      try {
        localStorage.setItem(STORAGE_KEY_SPEAKERS, JSON.stringify(merged));
      } catch {}
      return merged;
    });
  };

  // Fetch sponsors from backend API / Supabase and merge into local state
  // Guarantees all corporate members and sponsors sync live across localhost and deployed site
  const refreshSponsors = async () => {
    let remoteSponsors: Sponsor[] = [];
    const deletedKeys = getDeletedSponsorKeys();
    const isNotDeleted = (s: { id?: string; dbId?: string; name?: string }) => {
      if (!s) return false;
      if (s.id && deletedKeys.has(s.id.toLowerCase())) return false;
      if (s.dbId && deletedKeys.has(s.dbId.toLowerCase())) return false;
      return true;
    };

    // Always query Supabase directly first for freshest data (same source as deployed)
    const spClient = supabaseAdmin || supabase;
    if (spClient) {
      try {
        const { data, error } = await spClient
          .from('sponsors')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          remoteSponsors = data
            .map((row: any) => {
              let meta: any = {};
              try {
                if (row.description && row.description.startsWith('{')) {
                  meta = JSON.parse(row.description);
                }
              } catch {}
              const isMember = row.tier === 'PARTNER' || meta.type === 'CORPORATE_MEMBER';
              const cleanLogo = row.logo_url && !row.logo_url.includes('unsplash.com') ? row.logo_url.trim() : '';
              return {
                id: meta.originalId || row.id,
                dbId: row.id,
                name: row.name,
                logo_url: cleanLogo,
                website_url: row.website_url || '',
                tier: (isMember ? 'CORPORATE_MEMBER' : (row.tier || 'PLATINUM')) as SponsorTier,
                type: (isMember ? 'CORPORATE_MEMBER' : 'SPONSOR') as SponsorType,
                categoryOrRole: meta.role || (row.description && !row.description.startsWith('{') ? row.description : '') || (isMember ? 'Licensed Commercial Bank' : 'Corporate Sponsor'),
                description: meta.desc || (row.description && !row.description.startsWith('{') ? row.description : ''),
              };
            })
            .filter(isNotDeleted);
        }
      } catch (err) {
        console.warn('Supabase sponsors query failed:', err);
      }
    }

    // Fallback to ApiClient if Supabase returned nothing
    if (remoteSponsors.length === 0) {
      try {
        const res = await ApiClient.getSponsors();
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          remoteSponsors = res.data.filter(isNotDeleted);
        }
      } catch {
        // ApiClient offline
      }
    }

    // Supabase / Cloud is the authoritative source of truth across all devices:
    if (remoteSponsors.length > 0) {
      setSponsors((prev) => {
        // Retain only valid unsynced local-only drafts
        const localUnsynced = prev.filter((p) => {
          if (!isNotDeleted(p)) return false;
          const existsInRemote = remoteSponsors.some((r) => isSameSponsor(p, r));
          return !existsInRemote && p.id.startsWith('sp-');
        });
        const finalMerged = sortSponsors([...remoteSponsors, ...localUnsynced]);
        try {
          localStorage.setItem(STORAGE_KEY_SPONSORS, JSON.stringify(finalMerged));
        } catch {}
        return finalMerged;
      });
    }
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

  const refreshAll = async (options?: { silent?: boolean }) => {
    const isSilent = Boolean(options?.silent);
    if (!isSilent) {
      setIsLiveSyncing(true);
    }
    try {
      await Promise.allSettled([
        refreshRegistrations({ silent: true }),
        refreshEvents(),
        refreshSpeakers(),
        refreshSponsors(),
      ]);
      setLastSyncedAt(new Date());
    } finally {
      if (!isSilent) {
        setIsLiveSyncing(false);
      }
    }
  };

  // Cross-tab and real-time backend synchronization for admin and attendees
  useEffect(() => {
    refreshAll();
    // Restore admin-added speakers and sponsors from Supabase
    refreshSpeakers();
    refreshSponsors();

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

    // Realtime Supabase channel for registrations so payments and check-ins appear instantly on all admin dashboards
    const regChannel = (supabaseAdmin || supabase)
      ?.channel('realtime-registrations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'registrations' },
        () => {
          refreshRegistrations();
        }
      )
      .subscribe();

    // Cross-tab broadcast listener
    let broadcast: BroadcastChannel | null = null;
    try {
      broadcast = new BroadcastChannel('cib_registrations_channel');
      broadcast.onmessage = () => {
        refreshRegistrations();
      };
    } catch {}

    // Realtime Supabase channel for sponsors so updates appear instantly on all browsers
    const spChannel = supabase
      ?.channel('realtime-sponsors')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sponsors' },
        () => {
          refreshSponsors();
        }
      )
      .subscribe();

    // Ultra-responsive 5-second interval for delegate registrations and payments
    const regInterval = setInterval(() => {
      refreshRegistrations({ silent: true }).catch(() => {});
    }, 5000);

    // Full catalog refresh every 60s for events, speakers, and sponsors
    const fullInterval = setInterval(() => {
      refreshAll({ silent: true }).catch(() => {});
    }, 60000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('cib_registration_created', handleCustom);
      clearInterval(regInterval);
      clearInterval(fullInterval);
      spChannel?.unsubscribe();
      regChannel?.unsubscribe();
      broadcast?.close();
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

    // Direct Supabase PostgreSQL persistence (ensures registrations are saved on all deployments)
    if (supabaseAdmin) {
      const isUuid = (val?: string) => Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));
      const dbId = isUuid(newReg.id) ? newReg.id : undefined;
      let dbEventId = isUuid(newReg.event_id) ? newReg.event_id : undefined;
      if (!dbEventId) {
        dbEventId = 'e1111111-1111-1111-1111-111111111111';
      }
      let dbRegTypeId = 'd1111111-1111-1111-1111-111111111111';
      if (newReg.registration_type_id?.includes('double')) {
        dbRegTypeId = 'd2222222-2222-2222-2222-222222222222';
      }

      const insertPayload: any = {
        registration_number: newReg.registration_number,
        first_name: newReg.first_name,
        last_name: newReg.last_name,
        email: newReg.email,
        phone: newReg.phone,
        organization: newReg.organization,
        job_title: newReg.job_title,
        country: newReg.country || 'Ghana',
        cib_member_id: newReg.cib_member_id,
        membership_category: newReg.membership_category,
        attendance_type: newReg.attendance_type,
        dietary_requirements: newReg.dietary_requirements,
        special_assistance: newReg.special_assistance,
        total_amount: newReg.total_amount,
        currency: newReg.currency,
        payment_status: newReg.payment_status,
        payment_reference: newReg.payment_reference,
        payment_method: newReg.payment_method,
        check_in_status: newReg.check_in_status,
        event_id: dbEventId,
        registration_type_id: dbRegTypeId,
        created_at: newReg.created_at,
      };
      if (dbId) insertPayload.id = dbId;

      (async () => {
        try {
          let { data: dbReg, error: dbErr } = await supabaseAdmin
            .from('registrations')
            .insert(insertPayload)
            .select()
            .maybeSingle();

          // If membership_category column is missing in legacy schema, retry without it
          if (dbErr && /membership_category/i.test(dbErr.message || '')) {
            delete insertPayload.membership_category;
            ({ data: dbReg, error: dbErr } = await supabaseAdmin
              .from('registrations')
              .insert(insertPayload)
              .select()
              .maybeSingle());
          }

          if (dbErr) {
            console.warn('[AppContext] Supabase direct registration insert notice:', dbErr);
          } else if (dbReg) {
            try {
              await supabaseAdmin.from('tickets').insert({
                registration_id: dbReg.id,
                ticket_code: 'TCK-' + newReg.registration_number,
                qr_code_data: JSON.stringify({ reg: newReg.registration_number }),
                security_hash: 'hash_' + Date.now(),
                status: newReg.check_in_status || 'REGISTERED',
              });
            } catch (tErr) {
              console.warn('[AppContext] Supabase ticket insert notice:', tErr);
            }
          }
        } catch (e) {
          console.warn('[AppContext] Supabase registration direct insert error:', e);
        }
      })();
    }

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

  const checkInAttendee = (regNumber: string, targetStatus: 'CHECKED_IN' | 'REGISTERED' = 'CHECKED_IN') => {
    const cleanNumber = regNumber.trim().toUpperCase();
    const regIndex = registrations.findIndex((r) => r.registration_number.toUpperCase() === cleanNumber);

    if (regIndex === -1) {
      return { success: false, message: `Registration number "${cleanNumber}" was not found in the system.` };
    }

    const reg = registrations[regIndex];
    if (targetStatus === 'CHECKED_IN' && reg.check_in_status === 'CHECKED_IN') {
      return {
        success: false,
        message: `Already Checked In! Attendee ${reg.first_name} ${reg.last_name} checked in at ${reg.check_in_time ? new Date(reg.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'earlier'}.`,
        registration: reg,
      };
    }

    const updatedReg: Registration = {
      ...reg,
      check_in_status: targetStatus,
      check_in_time: targetStatus === 'CHECKED_IN' ? new Date().toISOString() : undefined,
    };

    const updatedList = [...registrations];
    updatedList[regIndex] = updatedReg;
    setRegistrations(updatedList);

    // Save to localStorage immediately so page refresh keeps check-in status
    try {
      localStorage.setItem(STORAGE_KEY_REGS, JSON.stringify(updatedList));
      const bc = new BroadcastChannel('cib_registrations_channel');
      bc.postMessage({ type: 'CHECK_IN_UPDATED', registrationNumber: cleanNumber, status: targetStatus });
      bc.close();
    } catch {}

    // Direct Supabase persistence
    const client = supabaseAdmin || supabase;
    if (client) {
      (async () => {
        try {
          await client
            .from('registrations')
            .update({ check_in_status: targetStatus, check_in_time: updatedReg.check_in_time || null })
            .eq('registration_number', cleanNumber);
        } catch {}
      })();
    }

    // Sync check-in status with backend engine
    if (targetStatus === 'CHECKED_IN') {
      ApiClient.checkInAttendee(cleanNumber).catch((err) => {
        console.log('[AppContext] Backend check-in sync:', err);
      });
    }

    return {
      success: true,
      message: targetStatus === 'CHECKED_IN'
        ? `Checked In Successfully! Welcome, ${reg.first_name} ${reg.last_name}.`
        : `Check-in reversed for ${reg.first_name} ${reg.last_name}.`,
      registration: updatedReg,
    };
  };

  const updatePaymentStatus = async (
    identifier: string,
    status: 'SUCCESSFUL' | 'PENDING' | 'FAILED',
    reference?: string,
    method?: string,
    category?: string
  ): Promise<boolean> => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanRef = reference?.trim().toLowerCase();

    // 1. Update React state immediately and write to localStorage
    setRegistrations((prev) => {
      const updated = prev.map((r) => {
        const match =
          r.registration_number.toLowerCase() === cleanId ||
          r.id.toLowerCase() === cleanId ||
          (r.payment_reference && r.payment_reference.toLowerCase() === cleanId) ||
          (cleanRef && r.payment_reference && r.payment_reference.toLowerCase() === cleanRef) ||
          (cleanRef && r.registration_number.toLowerCase() === cleanRef);

        if (match) {
          return {
            ...r,
            payment_status: status,
            ...(reference ? { payment_reference: reference } : {}),
            ...(method ? { payment_method: method } : {}),
            ...(category ? { membership_category: category } : {}),
          };
        }
        return r;
      });
      try {
        localStorage.setItem(STORAGE_KEY_REGS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // 2. Broadcast to other tabs & windows
    try {
      const bc = new BroadcastChannel('cib_registrations_channel');
      bc.postMessage({ type: 'PAYMENT_STATUS_UPDATED', identifier, status });
      bc.close();
    } catch {}

    // 3. Persist to Supabase (checks errors & drops unsupported columns)
    try {
      await syncRegistrationPayment({
        status,
        registrationNumber: identifier.trim(),
        id: identifier.trim(),
        reference,
        method,
        category,
      });
    } catch (err) {
      console.warn('[AppContext] Supabase payment status sync error:', err);
    }

    return true;
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
    // 1. Update React state immediately
    setEvents((prev) => {
      const updated = prev.map((e) => {
        if (
          e.id === id ||
          (updates.slug && e.slug === updates.slug) ||
          (id === 'evt-1' && e.slug === '30th-national-banking-ethics-conference-2026') ||
          (e.id === 'e1111111-1111-1111-1111-111111111111' && id === 'evt-1')
        ) {
          return { ...e, ...updates, updated_at: new Date().toISOString() };
        }
        return e;
      });
      try {
        localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });

    // 2. Call backend update
    try {
      await ApiClient.updateEvent(id, updates);
    } catch (err) {
      console.warn('Backend update event failed:', err);
    }

    // 3. Directly update Supabase database so date changes persist across all devices!
    if (supabase) {
      try {
        const dbUpdates: any = { ...updates, updated_at: new Date().toISOString() };
        delete dbUpdates.registration_types;
        delete dbUpdates.speakers;
        delete dbUpdates.sponsors;
        delete dbUpdates.agenda;
        delete dbUpdates.resources;

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        let q = supabase.from('events').update(dbUpdates);
        if (isUuid) {
          q = q.eq('id', id);
        } else if (updates.slug) {
          q = q.eq('slug', updates.slug);
        } else {
          q = q.eq('slug', '30th-national-banking-ethics-conference-2026');
        }
        await q;
      } catch (sbErr) {
        console.warn('Direct Supabase event update failed:', sbErr);
      }
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
        refreshSponsors,
        refreshAll,
        isLiveSyncing,
        lastSyncedAt,
        addRegistration,
        checkInAttendee,
        updatePaymentStatus,
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
