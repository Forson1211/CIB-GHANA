import { EventItem, Registration, DigitalTicket, CreateRegistrationRequest, PaymentStatus } from '../types/index.js';
import { TicketService } from './ticketService.js';
import { getSupabase } from '../config/supabase.js';

// Pre-seeded events data matching the CIB Ghana events catalog
const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'evt-1',
    title: '30th National Banking & Ethics Conference 2026',
    slug: '30th-national-banking-ethics-conference-2026',
    tagline: 'Banking on the Future — Trust, Technology and Transformation',
    short_description: 'The premier gathering of Ghanaian bank executives, regulators, and financial professionals shaping ethical standards and sustainable growth.',
    description: 'The 30th National Banking and Ethics Conference hosted by the Chartered Institute of Bankers, Ghana (CIB Ghana) convenes commercial bank CEOs, board chairs, regulatory authorities, compliance officers, and fintech pioneers at Aqua Safari Resort, Ada Foah.',
    category: 'Conferences',
    category_id: 'cat-1',
    featured_image: '/aqua-safari-pool-promenade.png',
    banner_image: '/aqua-safari-lawn-night.jpg',
    start_date: '2026-11-08',
    end_date: '2026-11-10',
    start_time: '08:30',
    end_time: '17:30',
    location: 'Aqua Safari Resort, Ada Foah',
    venue: 'Aqua Safari Resort Convention Pavilion, Ada Foah',
    venue_address: 'Aqua Safari Resort, Ada Foah, Greater Accra Region, Ghana',
    event_type: 'HYBRID',
    registration_fee: 1200,
    currency: 'GHS',
    capacity: 650,
    registered_count: 486,
    registration_deadline: '2026-11-05',
    status: 'OPEN_FOR_REGISTRATION',
    is_featured: true,
    is_past: false,
    themes: [
      'Ethical Governance & Regulatory Compliance',
      'Cyber-Risk Mitigation in Generative AI Era',
      'Sustainable Green Finance & ESG Reporting',
      'AfCFTA Pan-African Payment Systems',
    ],
    speakers: [],
    agenda: [
      // ==========================================
      // DAY 1 — 9 November 2026: Masterclass & Mentorship Corner
      // ==========================================
      {
        id: 'ag-d1-1',
        event_id: 'evt-1',
        day_number: 1,
        date: '2026-11-09',
        start_time: '09:00',
        end_time: '10:00',
        title: 'REGISTRATION',
        description: 'Badge collection, digital check-in, coffee reception, and exhibition tour.',
        session_type: 'NETWORKING',
        room: 'Grand Foyer & Registration Desk',
        speaker_ids: []
      },
      {
        id: 'ag-d1-2',
        event_id: 'evt-1',
        day_number: 1,
        date: '2026-11-09',
        start_time: '10:00',
        end_time: '12:00',
        title: 'Deploying AI to Combat Modern Fraud in International Trade Finance',
        description: 'Clifford Duke Mettle, FCIB & Rita Elumelu, FCIB lead an executive masterclass on utilizing artificial intelligence and automated fraud detection algorithms within cross-border trade rails.',
        session_type: 'MASTERCLASS',
        room: 'Syndicate Hall A',
        speaker_ids: ['spk-mettle', 'spk-elumelu']
      },
      {
        id: 'ag-d1-3',
        event_id: 'evt-1',
        day_number: 1,
        date: '2026-11-09',
        start_time: '10:00',
        end_time: '12:00',
        title: 'Cybersecurity and Fraud Detection',
        description: 'Dr Albert Antwi-Bosiako, Fabiola Amedo (KPMG), Nina Korley (DELOITTE). Advanced cybersecurity briefing and fraud mitigation strategies for banking networks and core transactional infrastructure.',
        session_type: 'MASTERCLASS',
        room: 'Syndicate Hall B',
        speaker_ids: ['spk-antwi']
      },
      {
        id: 'ag-d1-4',
        event_id: 'evt-1',
        day_number: 1,
        date: '2026-11-09',
        start_time: '10:00',
        end_time: '10:30',
        title: 'Megatrends: Virtual Asset, Tokenization and AI',
        description: 'Presentation - Frank Tawiah. Strategic briefing analyzing digital asset evolution, tokenization of banking collateral, and the rise of autonomous financial agents.',
        session_type: 'KEYNOTE',
        room: 'Main Conference Hall',
        speaker_ids: ['spk-tawiah']
      },
      {
        id: 'ag-d1-5',
        event_id: 'evt-1',
        day_number: 1,
        date: '2026-11-09',
        start_time: '10:30',
        end_time: '11:40',
        title: 'PANEL/Q&A: Megatrends, Tokenization & AI Governance',
        description: 'Philip Twum, ACIB, Frank Tawiah, Philip Kwaw Sebuabe, Gillian Darko. Interactive panel examination and delegate Q&A exploring virtual asset integration and compliance.',
        session_type: 'PANEL',
        room: 'Main Conference Hall',
        speaker_ids: ['spk-twum', 'spk-tawiah', 'spk-sebuabe']
      },
      {
        id: 'ag-d1-6',
        event_id: 'evt-1',
        day_number: 1,
        date: '2026-11-09',
        start_time: '12:00',
        end_time: '13:00',
        title: 'Networking Lunch',
        description: 'Executive luncheon and bilateral networking exchange at the waterfront dining terrace.',
        session_type: 'NETWORKING',
        room: 'Lagoon Restaurant Terrace',
        speaker_ids: []
      },
      {
        id: 'ag-d1-7',
        event_id: 'evt-1',
        day_number: 1,
        date: '2026-11-09',
        start_time: '13:00',
        end_time: '14:00',
        title: 'Delegates Prepare for Fun Activities',
        description: 'Delegates transition to suites and recreation venues to prepare for afternoon team bonding and outdoor activities.',
        session_type: 'NETWORKING',
        room: 'Resort Grounds & Promenade',
        speaker_ids: []
      },
      {
        id: 'ag-d1-8',
        event_id: 'evt-1',
        day_number: 1,
        date: '2026-11-09',
        start_time: '14:00',
        end_time: '16:00',
        title: 'Mentorship Corner',
        description: '1. Woman: Rising to the Top — Tea, Tales and Trailblazers | 2. Men’s Talk: Stress and Sex. Dual-track executive mentorship session.',
        session_type: 'WORKSHOP',
        room: 'Executive Pavilion A & B',
        speaker_ids: []
      },
      {
        id: 'ag-d1-9',
        event_id: 'evt-1',
        day_number: 1,
        date: '2026-11-09',
        start_time: '16:00',
        end_time: '18:00',
        title: 'Complimentary Activities at Aqua Safari',
        description: 'Cast net fishing, board & card games, table tennis, lawn tennis, beach volleyball, badminton, canoeing & kayaking, mini soccer, golf, etc.',
        session_type: 'NETWORKING',
        room: 'Aqua Safari Marina & Sports Complex',
        speaker_ids: []
      },
      {
        id: 'ag-d1-10',
        event_id: 'evt-1',
        day_number: 1,
        date: '2026-11-09',
        start_time: '18:00',
        end_time: '19:00',
        title: 'Dinner',
        description: 'Sunset delegate dinner reception overlooking the scenic Volta River estuary.',
        session_type: 'NETWORKING',
        room: 'Lagoon Deck & Dining Terrace',
        speaker_ids: []
      },
      {
        id: 'ag-d1-11',
        event_id: 'evt-1',
        day_number: 1,
        date: '2026-11-09',
        start_time: '20:00',
        end_time: '21:00',
        title: 'By the Fireside Chat – Kwanpa Group',
        description: 'Paul Baah Sackey, FCIB & Charles Ofori Acquah, FCIB. Evening cultural storytelling, acoustic musical networking, and reflections.',
        session_type: 'CEREMONY',
        room: 'Bonfire Beach Arena',
        speaker_ids: ['spk-baah-sackey', 'spk-ofori-acquah']
      },

      // ==========================================
      // DAY 2 — 10 November 2026: 3T Conference
      // ==========================================
      {
        id: 'ag-d2-1',
        event_id: 'evt-1',
        day_number: 2,
        date: '2026-11-10',
        start_time: '05:30',
        end_time: '08:30',
        title: 'Aerobics, Swimming, Breakfast',
        description: 'Morning executive wellness workout, lap swimming in the lagoon pool, followed by an executive buffet breakfast.',
        session_type: 'NETWORKING',
        room: 'Waterfront Poolside & Dining Hall',
        speaker_ids: []
      },
      {
        id: 'ag-d2-2',
        event_id: 'evt-1',
        day_number: 2,
        date: '2026-11-10',
        start_time: '09:00',
        end_time: '10:00',
        title: 'Conference Registration',
        description: 'Second-day delegate check-in, VIP reception, and collection of morning conference materials.',
        session_type: 'NETWORKING',
        room: 'Grand Foyer & Registration Desk',
        speaker_ids: []
      },
      {
        id: 'ag-d2-3',
        event_id: 'evt-1',
        day_number: 2,
        date: '2026-11-10',
        start_time: '10:00',
        end_time: '10:15',
        title: 'Welcome Address — President',
        description: 'Presidential opening declaration and strategic state of the banking sector address.',
        session_type: 'CEREMONY',
        room: 'Main Ball Room',
        speaker_ids: []
      },
      {
        id: 'ag-d2-4',
        event_id: 'evt-1',
        day_number: 2,
        date: '2026-11-10',
        start_time: '10:15',
        end_time: '10:40',
        title: '“Journey to the World Conference 2028” — CEO',
        description: 'Key institutional roadmap presentation by Robert Dzato (FCIB), CEO of CIB Ghana toward hosting the World Banking Conference 2028.',
        session_type: 'KEYNOTE',
        room: 'Main Ball Room',
        speaker_ids: ['spk-2']
      },
      {
        id: 'ag-d2-5',
        event_id: 'evt-1',
        day_number: 2,
        date: '2026-11-10',
        start_time: '10:40',
        end_time: '11:00',
        title: 'Hon Samuel Nartey George',
        description: 'Minister for Communication, Digital Technology and Innovations. Keynote on national digital infrastructure, telecommunications backbone, and banking technology adoption.',
        session_type: 'KEYNOTE',
        room: 'Main Ball Room',
        speaker_ids: ['spk-sam-george']
      },
      {
        id: 'ag-d2-6',
        event_id: 'evt-1',
        day_number: 2,
        date: '2026-11-10',
        start_time: '11:00',
        end_time: '11:20',
        title: 'Dr Johnson Pandit Asiama, FCIB(Hon.), Governor, Bank of Ghana',
        description: 'Official Governor address on macroeconomic stability, banking capitalization, monetary anchoring, and supervisory policy directives.',
        session_type: 'KEYNOTE',
        room: 'Main Ball Room',
        speaker_ids: ['spk-asiama']
      },
      {
        id: 'ag-d2-7',
        event_id: 'evt-1',
        day_number: 2,
        date: '2026-11-10',
        start_time: '11:20',
        end_time: '11:40',
        title: 'Hon. Haruna Idrisu , Minister for Education',
        description: 'Ministerial address on human capital readiness, continuous professional learning, and curriculum alignment for the banking workforce.',
        session_type: 'KEYNOTE',
        room: 'Main Ball Room',
        speaker_ids: ['spk-haruna']
      },
      {
        id: 'ag-d2-8',
        event_id: 'evt-1',
        day_number: 2,
        date: '2026-11-10',
        start_time: '11:40',
        end_time: '12:00',
        title: 'LAUNCH OF DIGITAL ASSET',
        description: 'Official unveiling and live demonstration of CIB Ghana’s flagship Digital Asset initiative and tokenized professional credentials.',
        session_type: 'CEREMONY',
        room: 'Main Ball Room',
        speaker_ids: []
      },
      {
        id: 'ag-d2-9',
        event_id: 'evt-1',
        day_number: 2,
        date: '2026-11-10',
        start_time: '12:00',
        end_time: '12:20',
        title: 'Stablecoins, Virtual Assets and the Future of Money — Dr Stephane Nwolley',
        description: 'Specialized keynote examining central bank digital currencies, tokenized commercial bank deposits, and cross-border settlement with stablecoins.',
        session_type: 'KEYNOTE',
        room: 'Main Ball Room',
        speaker_ids: ['spk-nwolley']
      },
      {
        id: 'ag-d2-10',
        event_id: 'evt-1',
        day_number: 2,
        date: '2026-11-10',
        start_time: '12:20',
        end_time: '13:00',
        title: 'PANEL - Philip Kwaw Sebuabe, Dr Stephane Nwolley',
        description: 'In-depth panel debate on navigating stablecoin adoption, fintech interoperability, and monetary sovereignty in West Africa.',
        session_type: 'PANEL',
        room: 'Main Ball Room',
        speaker_ids: ['spk-sebuabe', 'spk-nwolley']
      },
      {
        id: 'ag-d2-11',
        event_id: 'evt-1',
        day_number: 2,
        date: '2026-11-10',
        start_time: '13:00',
        end_time: '13:40',
        title: 'Networking Lunch',
        description: 'Executive luncheon and bilateral stakeholder engagements at the Waterfront Garden Pavilion.',
        session_type: 'NETWORKING',
        room: 'Waterfront Garden Pavilion',
        speaker_ids: []
      },
      {
        id: 'ag-d2-12',
        event_id: 'evt-1',
        day_number: 2,
        date: '2026-11-10',
        start_time: '13:40',
        end_time: '14:00',
        title: 'Navigating the Regulatory Landscape in Uncertainty - Farihan Alhassan',
        description: 'Executive regulatory insights on supervisory stress testing, AML compliance, and operational resilience amid macroeconomic shifts.',
        session_type: 'KEYNOTE',
        room: 'Main Ball Room',
        speaker_ids: ['spk-farihan']
      },
      {
        id: 'ag-d2-13',
        event_id: 'evt-1',
        day_number: 2,
        date: '2026-11-10',
        start_time: '14:00',
        end_time: '14:40',
        title: 'PANEL – MODERATOR ( DORIS AHIATI,FCIB)',
        description: 'Trust, Ethics & Fraud: Farihan Alhassan, Emelia Sackey, FCIB , John Awuah, Robert Dzato,FCIB.',
        session_type: 'PANEL',
        room: 'Main Ball Room',
        speaker_ids: ['spk-ahiati', 'spk-farihan', 'spk-emelia', 'spk-awuah', 'spk-2']
      },
      {
        id: 'ag-d2-14',
        event_id: 'evt-1',
        day_number: 2,
        date: '2026-11-10',
        start_time: '14:40',
        end_time: '15:00',
        title: 'PHOTO SESSION',
        description: 'Official commemorative photo session with the Governor, Ministers of State, Governing Council, and registered delegates.',
        session_type: 'CEREMONY',
        room: 'Grand Convention Stage',
        speaker_ids: []
      },
      {
        id: 'ag-d2-15',
        event_id: 'evt-1',
        day_number: 2,
        date: '2026-11-10',
        start_time: '15:00',
        end_time: '15:20',
        title: 'AI in Practice — Dr Marcel Lukas, University of St Andrews',
        description: 'Case studies on deploying algorithmic credit underwriting, conversational banking models, and automated compliance tracking.',
        session_type: 'MASTERCLASS',
        room: 'Main Ball Room',
        speaker_ids: ['spk-lukas']
      },
      {
        id: 'ag-d2-16',
        event_id: 'evt-1',
        day_number: 2,
        date: '2026-11-10',
        start_time: '15:20',
        end_time: '16:00',
        title: 'Conference Reflections and Closing',
        description: 'Presentation of official conference resolutions, CPD recognition, and closing remarks by CIB Ghana executive leadership.',
        session_type: 'CEREMONY',
        room: 'Main Ball Room',
        speaker_ids: ['spk-2']
      }
    ],
    sponsors: [],
    registration_types: [
      {
        id: 'rt-1',
        event_id: 'evt-1',
        name: 'CIB Chartered Member Pass',
        code: 'MEM-2026',
        price: 1200,
        currency: 'GHS',
        description: 'Discounted delegate pass for registered FCIB, ACIB, and Student Associates in good standing.',
        capacity: 350,
        spots_left: 68,
        benefits: ['Full 3-Day Executive Access', 'Conference Luncheons & Gala Dinner', 'CPD Accreditation Certificate'],
      },
      {
        id: 'rt-2',
        event_id: 'evt-1',
        name: 'Non-Member Professional Pass',
        code: 'NON-MEM-2026',
        price: 1800,
        currency: 'GHS',
        description: 'Standard executive ticket for commercial bank staff, fintech partners, legal advisors, and consultants.',
        capacity: 250,
        spots_left: 74,
        benefits: ['Full 3-Day Access to All Plenaries', 'Welcome Reception & Networking Mixer', 'Masterclass Materials & Reports'],
      },
      {
        id: 'early-bird-single',
        event_id: 'evt-1',
        name: 'Single Occupancy Package',
        code: 'PKG-SINGLE',
        price: 5600,
        currency: 'GHS',
        description: 'Accommodation for two nights at Aqua Safari, conference & masterclass fee, dinner for 2 nights and complimentary activities.',
        capacity: 100,
        spots_left: 24,
        benefits: ['Luxury Chalet Accommodation (2 Nights)', 'Executive Masterclass Access', 'Gala Dinner & Cruise', 'VIP Welcome Kit'],
      },
      {
        id: 'early-bird-double',
        event_id: 'evt-1',
        name: 'Double Occupancy Package',
        code: 'PKG-DOUBLE',
        price: 4000,
        currency: 'GHS',
        description: 'Shared room package for two nights at Aqua Safari, conference fee, and dinner for 2 nights.',
        capacity: 100,
        spots_left: 32,
        benefits: ['Shared Deluxe Room (2 Nights)', 'Full Conference & Masterclass Access', 'Complimentary Networking Dinner'],
      },
    ],
    created_at: '2026-01-15T00:00:00Z',
    updated_at: '2026-09-20T00:00:00Z',
  },
];

// In-memory persistent collections
const eventsStore = new Map<string, EventItem>(INITIAL_EVENTS.map((e) => [e.id, e]));
const registrationsStore = new Map<string, Registration>();
const ticketsStore = new Map<string, DigitalTicket>();

// Pre-seed mock registrations
const INITIAL_REGISTRATIONS: Registration[] = [
  {
    id: 'reg-001',
    event_id: 'evt-1',
    event_title: '30th National Banking & Ethics Conference 2026',
    registration_number: 'CIB-EVT-782419',
    registration_type_id: 'rt-1',
    registration_type_name: 'CIB Chartered Member',
    first_name: 'Kofi',
    last_name: 'Mensah',
    email: 'kofi.mensah@standardchartered.com',
    phone: '+233 24 412 3456',
    organization: 'Standard Chartered Bank Ghana',
    job_title: 'Head of Credit Risk',
    country: 'Ghana',
    cib_member_id: 'ACIB-2018-0941',
    membership_category: 'ACIB',
    attendance_type: 'PHYSICAL',
    total_amount: 1200,
    currency: 'GHS',
    payment_status: 'SUCCESSFUL',
    payment_reference: 'T1719203912_8492',
    payment_method: 'PAYSTACK_CARD',
    check_in_status: 'REGISTERED',
    created_at: '2026-09-10T14:20:00Z',
  },
  {
    id: 'reg-002',
    event_id: 'evt-1',
    event_title: '30th National Banking & Ethics Conference 2026',
    registration_number: 'CIB-EVT-491028',
    registration_type_id: 'rt-2',
    registration_type_name: 'Non-Member Professional',
    first_name: 'Ama',
    last_name: 'Boateng',
    email: 'ama.boateng@fidelitybank.com.gh',
    phone: '+233 20 891 2345',
    organization: 'Fidelity Bank Ghana',
    job_title: 'Senior Compliance Manager',
    country: 'Ghana',
    membership_category: 'Non-Member',
    attendance_type: 'PHYSICAL',
    total_amount: 1800,
    currency: 'GHS',
    payment_status: 'SUCCESSFUL',
    payment_reference: 'T1719204210_3941',
    payment_method: 'PAYSTACK_MOMO',
    check_in_status: 'CHECKED_IN',
    check_in_time: '2026-11-08T08:15:00Z',
    created_at: '2026-09-12T09:10:00Z',
  },
  {
    id: 'reg-003',
    event_id: 'evt-1',
    event_title: '30th National Banking & Ethics Conference 2026',
    registration_number: 'CIB-EVT-319084',
    registration_type_id: 'rt-1',
    registration_type_name: 'CIB Chartered Member',
    first_name: 'Dr. Yaw',
    last_name: 'Kwarteng',
    email: 'yaw.kwarteng@nibs.edu.gh',
    phone: '+233 55 312 8765',
    organization: 'Nobel International Business School',
    job_title: 'Dean of Executive Programs',
    country: 'Ghana',
    cib_member_id: 'FCIB-2015-0312',
    membership_category: 'FCIB',
    attendance_type: 'PHYSICAL',
    total_amount: 1200,
    currency: 'GHS',
    payment_status: 'SUCCESSFUL',
    payment_reference: 'T1719204981_1204',
    payment_method: 'PAYSTACK_CARD',
    check_in_status: 'REGISTERED',
    created_at: '2026-09-14T16:45:00Z',
  },
  {
    id: 'reg-004',
    event_id: 'evt-1',
    event_title: '30th National Banking & Ethics Conference 2026',
    registration_number: 'CIB-EVT-652914',
    registration_type_id: 'rt-3',
    registration_type_name: 'Student Associate Pass',
    first_name: 'Samuel',
    last_name: 'Addo',
    email: 'samuel.addo@st.ug.edu.gh',
    phone: '+233 50 123 9876',
    organization: 'University of Ghana Business School',
    job_title: 'Banking & Finance Student Associate',
    country: 'Ghana',
    cib_member_id: 'STU-2023-412',
    membership_category: 'Student',
    attendance_type: 'PHYSICAL',
    total_amount: 450,
    currency: 'GHS',
    payment_status: 'SUCCESSFUL',
    payment_reference: 'T1719205123_9011',
    payment_method: 'PAYSTACK_MOMO',
    check_in_status: 'REGISTERED',
    created_at: '2026-09-15T11:00:00Z',
  },
  {
    id: 'reg-demo-1',
    event_id: 'cib-conf-2026',
    event_title: '29th National Banking Conference & Annual General Meeting',
    registration_number: 'CIB-2026-DEMO1',
    registration_type_id: 'reg-cib-member',
    registration_type_name: 'CIB Chartered Member Pass',
    first_name: 'Francis',
    last_name: 'Appiah',
    email: 'admin@cibgh.org',
    phone: '+233 24 123 4567',
    organization: 'Chartered Institute of Bankers Ghana',
    job_title: 'Director of Programmes',
    country: 'Ghana',
    cib_member_id: 'FCIB-44910',
    membership_category: 'FCIB',
    attendance_type: 'PHYSICAL',
    total_amount: 2800,
    currency: 'GHS',
    payment_status: 'SUCCESSFUL',
    payment_reference: 'T_DEMO_REF_123',
    payment_method: 'PAYSTACK_MOMO',
    check_in_status: 'REGISTERED',
    created_at: new Date().toISOString(),
  },
];

for (const reg of INITIAL_REGISTRATIONS) {
  registrationsStore.set(reg.id, reg);
  registrationsStore.set(reg.registration_number, reg);
}

// Pre-initialize tickets for sample registrations
for (const reg of INITIAL_REGISTRATIONS) {
  const ev = eventsStore.get(reg.event_id) || INITIAL_EVENTS[0];
  TicketService.issueDigitalTicket(reg, ev).then((ticket) => {
    ticketsStore.set(ticket.registration_number, ticket);
    ticketsStore.set(ticket.registration_id, ticket);
  }).catch(() => {});
}

export class DataService {
  // 1. Events
  static async getAllEvents(filters?: {
    category?: string;
    search?: string;
    status?: string;
    isPast?: boolean;
  }): Promise<EventItem[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        let query = supabase.from('events').select('*, registration_types(*)').order('start_date', { ascending: true });
        if (filters?.status && filters.status !== 'ALL') query = query.eq('status', filters.status);
        const { data, error } = await query;
        if (!error && Array.isArray(data)) {
          let list = data as EventItem[];
          if (filters?.category && filters.category !== 'ALL') {
            list = list.filter((e) => e.category?.toLowerCase() === filters.category?.toLowerCase());
          }
          if (filters?.search) {
            const q = filters.search.toLowerCase().trim();
            list = list.filter(
              (e) => (e.title && e.title.toLowerCase().includes(q)) || (e.location && e.location.toLowerCase().includes(q))
            );
          }
          if (filters?.isPast !== undefined) {
            list = list.filter((e) => !!e.is_past === filters.isPast);
          }
          return list;
        }
      } catch (err) {
        console.warn('Supabase query failed, falling back to local store:', err);
      }
    }

    let list = Array.from(eventsStore.values());
    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((e) => e.status === filters.status);
    }
    if (filters?.category && filters.category !== 'ALL') {
      list = list.filter((e) => e.category.toLowerCase() === filters.category?.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (e) => e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q)
      );
    }
    if (filters?.isPast !== undefined) {
      list = list.filter((e) => !!e.is_past === filters.isPast);
    }
    return list;
  }

  static async getEventBySlugOrId(identifier: string): Promise<EventItem | null> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
        let query = supabase.from('events').select('*, registration_types(*)');
        if (isUuid) {
          query = query.eq('id', identifier);
        } else {
          query = query.or(`id.eq.${identifier},slug.eq.${identifier}`);
        }
        const { data } = await query.maybeSingle();
        if (data) return data as EventItem;
      } catch (err) {
        console.warn('Supabase getEvent notice:', err);
      }
    }

    const clean = identifier.toLowerCase().trim();
    for (const event of eventsStore.values()) {
      if (
        event.id.toLowerCase() === clean ||
        event.slug.toLowerCase() === clean ||
        event.title.toLowerCase().includes(clean)
      ) {
        return event;
      }
    }

    return null;
  }

  static async createEvent(input: Partial<EventItem>): Promise<EventItem> {
    const supabase = getSupabase();
    const slug = input.slug || (input.title ? input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : `event-${Date.now()}`);

    const newEvent: EventItem = {
      id: input.id || `evt-${Date.now()}`,
      title: input.title || 'Untitled Event',
      slug,
      tagline: input.tagline || '',
      description: input.description || '',
      short_description: input.short_description || '',
      category: input.category || 'Conferences',
      category_id: input.category_id || 'c1111111-1111-1111-1111-111111111111',
      featured_image: input.featured_image || '/aqua-safari-pool-promenade.png',
      banner_image: input.banner_image || '/aqua-safari-lawn-night.jpg',
      start_date: input.start_date || new Date().toISOString().split('T')[0],
      end_date: input.end_date || new Date().toISOString().split('T')[0],
      start_time: input.start_time || '08:30:00',
      end_time: input.end_time || '17:30:00',
      location: input.location || 'Accra, Ghana',
      venue: input.venue || 'CIB Ghana Convention Center',
      venue_address: input.venue_address || 'Accra, Ghana',
      event_type: input.event_type || 'HYBRID',
      registration_fee: input.registration_fee !== undefined ? Number(input.registration_fee) : 1200,
      currency: input.currency || 'GHS',
      capacity: input.capacity || 500,
      registered_count: 0,
      registration_deadline: input.registration_deadline || new Date(Date.now() + 30 * 86400000).toISOString(),
      status: input.status || 'OPEN_FOR_REGISTRATION',
      is_featured: !!input.is_featured,
      is_past: !!input.is_past,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      registration_types: input.registration_types || [],
      speakers: input.speakers || [],
      agenda: input.agenda || [],
      sponsors: input.sponsors || [],
      resources: input.resources || [],
    };

    eventsStore.set(newEvent.id, newEvent);
    eventsStore.set(newEvent.slug, newEvent);

    if (supabase) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(newEvent.id);
        const dbPayload: any = {
          title: newEvent.title,
          slug: newEvent.slug,
          tagline: newEvent.tagline,
          description: newEvent.description,
          short_description: newEvent.short_description,
          category_id: 'c1111111-1111-1111-1111-111111111111',
          featured_image: newEvent.featured_image,
          banner_image: newEvent.banner_image,
          start_date: newEvent.start_date,
          end_date: newEvent.end_date,
          start_time: newEvent.start_time?.length === 5 ? `${newEvent.start_time}:00` : newEvent.start_time,
          end_time: newEvent.end_time?.length === 5 ? `${newEvent.end_time}:00` : newEvent.end_time,
          location: newEvent.location,
          venue: newEvent.venue,
          venue_address: newEvent.venue_address,
          event_type: newEvent.event_type,
          registration_fee: newEvent.registration_fee,
          currency: newEvent.currency,
          capacity: newEvent.capacity,
          registered_count: 0,
          registration_deadline: newEvent.registration_deadline,
          status: newEvent.status,
          is_featured: newEvent.is_featured,
          is_past: newEvent.is_past,
        };
        if (isUuid) dbPayload.id = newEvent.id;

        const { data, error } = await supabase.from('events').insert(dbPayload).select().single();
        if (!error && data) {
          newEvent.id = data.id;
          eventsStore.set(data.id, newEvent);

          // Insert registration tiers if provided
          if (newEvent.registration_types && newEvent.registration_types.length > 0) {
            for (const tier of newEvent.registration_types) {
              await supabase.from('registration_types').insert({
                event_id: data.id,
                name: tier.name,
                code: tier.code || 'TIER-' + Date.now(),
                price: tier.price || 0,
                currency: tier.currency || 'GHS',
                description: tier.description || '',
                benefits: tier.benefits || [],
              });
            }
          }
        }
      } catch (err) {
        console.warn('Could not insert event into Supabase:', err);
      }
    }

    return newEvent;
  }

  static async updateEvent(idOrSlug: string, updates: Partial<EventItem>): Promise<EventItem | null> {
    const supabase = getSupabase();
    let event = await this.getEventBySlugOrId(idOrSlug);
    if (!event) return null;

    Object.assign(event, updates, { updated_at: new Date().toISOString() });
    eventsStore.set(event.id, event);

    if (supabase) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(event.id);
        const dbUpdates: any = { ...updates, updated_at: new Date().toISOString() };
        delete dbUpdates.registration_types;
        delete dbUpdates.speakers;
        delete dbUpdates.sponsors;
        delete dbUpdates.agenda;

        let query = supabase.from('events').update(dbUpdates);
        if (isUuid) {
          query = query.eq('id', event.id);
        } else {
          query = query.eq('slug', event.slug);
        }
        await query;
      } catch (err) {
        console.warn('Supabase event update notice:', err);
      }
    }

    return event;
  }

  static async deleteEvent(idOrSlug: string): Promise<boolean> {
    const supabase = getSupabase();
    let foundDbId: string | null = null;

    if (supabase) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
        let query = supabase.from('events').select('id, slug');
        if (isUuid) {
          query = query.eq('id', idOrSlug);
        } else {
          query = query.or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`);
        }
        const { data: dbEvent } = await query.maybeSingle();
        if (dbEvent?.id) {
          foundDbId = dbEvent.id;
        }
      } catch (err) {
        console.warn('Error querying event for deletion:', err);
      }

      if (foundDbId) {
        try {
          // 1. Delete associated registrations & their tickets and payments
          const { data: regs } = await supabase
            .from('registrations')
            .select('id')
            .eq('event_id', foundDbId);

          if (regs && regs.length > 0) {
            const regIds = regs.map((r: any) => r.id);
            await supabase.from('tickets').delete().in('registration_id', regIds);
            await supabase.from('payments').delete().in('registration_id', regIds);
            await supabase.from('registrations').delete().eq('event_id', foundDbId);
          }

          // 2. Delete child tables
          await supabase.from('registration_types').delete().eq('event_id', foundDbId);
          await supabase.from('agenda_sessions').delete().eq('event_id', foundDbId);
          await supabase.from('event_speakers').delete().eq('event_id', foundDbId);
          await supabase.from('event_sponsors').delete().eq('event_id', foundDbId);

          // 3. Delete the event from events table
          const { error: delErr } = await supabase.from('events').delete().eq('id', foundDbId);
          if (delErr) {
            console.error('Supabase failed to delete event:', delErr);
          } else {
            console.log(`Successfully deleted event ${foundDbId} from Supabase database`);
          }
        } catch (err) {
          console.error('Supabase error during event deletion:', err);
        }
      }
    }

    // Also remove from in-memory cache
    for (const [key, ev] of eventsStore.entries()) {
      if (ev.id === idOrSlug || ev.slug === idOrSlug || (foundDbId && ev.id === foundDbId)) {
        eventsStore.delete(key);
      }
    }

    // Remove registrations associated with this event from memory
    for (const [key, reg] of registrationsStore.entries()) {
      if (reg.event_id === idOrSlug || (foundDbId && reg.event_id === foundDbId)) {
        registrationsStore.delete(key);
      }
    }

    return true;
  }

  // 2. Registrations
  static async getAllRegistrations(filters?: {
    eventId?: string;
    status?: string;
    search?: string;
    paymentStatus?: string;
    membershipCategory?: string;
  }): Promise<Registration[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        let query = supabase
          .from('registrations')
          .select('*, registration_types(name), events(title)')
          .order('created_at', { ascending: false });

        if (filters?.eventId && filters.eventId !== 'ALL') {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(filters.eventId);
          if (isUuid) {
            query = query.eq('event_id', filters.eventId);
          }
        }
        if (filters?.status && filters.status !== 'ALL') query = query.eq('check_in_status', filters.status);
        if (filters?.paymentStatus && filters.paymentStatus !== 'ALL') query = query.eq('payment_status', filters.paymentStatus);

        const { data, error } = await query;
        if (!error && Array.isArray(data)) {
          let mapped: Registration[] = data.map((r: any) => {
            const typeName = r.registration_types?.name || 'Standard Delegate Pass';
            const eventTitle = r.events?.title || '30th National Banking & Ethics Conference 2026';
            const memId = (r.cib_member_id || '').toUpperCase();
            let cat = 'Non-Member';
            if (memId.startsWith('FCIB') || typeName.toLowerCase().includes('fellow')) cat = 'FCIB';
            else if (memId.startsWith('ACIB') || typeName.toLowerCase().includes('associate') || typeName.toLowerCase().includes('chartered') || typeName.toLowerCase().includes('member')) cat = 'ACIB';
            else if (memId.startsWith('STU') || typeName.toLowerCase().includes('student')) cat = 'Student';

            return {
              id: r.id,
              event_id: r.event_id,
              event_title: eventTitle,
              registration_number: r.registration_number,
              registration_type_id: r.registration_type_id,
              registration_type_name: typeName,
              first_name: r.first_name,
              last_name: r.last_name,
              email: r.email,
              phone: r.phone,
              organization: r.organization,
              job_title: r.job_title,
              country: r.country || 'Ghana',
              cib_member_id: r.cib_member_id,
              membership_category: cat,
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
            } as Registration;
          });

          if (filters?.membershipCategory && filters.membershipCategory !== 'ALL') {
            mapped = mapped.filter((r) => r.membership_category === filters.membershipCategory);
          }
          if (filters?.search) {
            const q = filters.search.toLowerCase().trim();
            mapped = mapped.filter(
              (r) =>
                r.registration_number.toLowerCase().includes(q) ||
                r.first_name.toLowerCase().includes(q) ||
                r.last_name.toLowerCase().includes(q) ||
                r.email.toLowerCase().includes(q) ||
                (r.cib_member_id && r.cib_member_id.toLowerCase().includes(q)) ||
                (r.organization && r.organization.toLowerCase().includes(q)) ||
                (r.payment_reference && r.payment_reference.toLowerCase().includes(q))
            );
          }

          // If Supabase returned live registrations, return them
          if (mapped.length > 0) {
            return mapped;
          }
        }
      } catch (err) {
        console.warn('Supabase query failed, falling back to local store:', err);
      }
    }

    // Deduplicate by registration_number
    const uniqueMap = new Map<string, Registration>();
    for (const reg of registrationsStore.values()) {
      uniqueMap.set(reg.registration_number, reg);
    }

    let list = Array.from(uniqueMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    if (filters?.eventId && filters.eventId !== 'ALL') {
      list = list.filter((r) => r.event_id === filters.eventId);
    }
    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((r) => r.check_in_status === filters.status);
    }
    if (filters?.paymentStatus && filters.paymentStatus !== 'ALL') {
      list = list.filter((r) => r.payment_status === filters.paymentStatus);
    }
    if (filters?.membershipCategory && filters.membershipCategory !== 'ALL') {
      list = list.filter((r) => r.membership_category === filters.membershipCategory);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.registration_number.toLowerCase().includes(q) ||
          r.first_name.toLowerCase().includes(q) ||
          r.last_name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          (r.cib_member_id && r.cib_member_id.toLowerCase().includes(q)) ||
          (r.membership_category && r.membership_category.toLowerCase().includes(q)) ||
          (r.organization && r.organization.toLowerCase().includes(q)) ||
          (r.payment_reference && r.payment_reference.toLowerCase().includes(q))
      );
    }

    return list;
  }

  static async createRegistration(input: CreateRegistrationRequest): Promise<{
    registration: Registration;
    ticket: DigitalTicket;
  }> {
    const event = (await this.getEventBySlugOrId(input.event_id)) || ({
      id: input.event_id,
      title: input.event_title || 'CIB Ghana Executive Event',
      slug: input.event_id,
      venue: 'CIB Ghana Secretariat, Accra',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      registration_types: [],
      registration_fee: input.total_amount !== undefined ? input.total_amount : 1200,
    } as any);

    const regType = event.registration_types?.find((t: any) => t.id === input.registration_type_id);
    const amount = input.total_amount !== undefined
      ? input.total_amount
      : (regType ? regType.price : event.registration_fee || 1200);
    const tierName = input.registration_type_name || (regType ? regType.name : 'Standard Delegate');

    const regNumber = input.registration_number || TicketService.generateRegistrationNumber();
    const id = input.id || `reg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const inferredCategory = input.membership_category || (
      input.cib_member_id?.toUpperCase().startsWith('FCIB') ? 'FCIB' :
      input.cib_member_id?.toUpperCase().startsWith('ACIB') ? 'ACIB' :
      input.cib_member_id?.toUpperCase().startsWith('STU') ? 'Student' :
      'Non-Member'
    );

    const registration: Registration = {
      id,
      event_id: event.id,
      event_title: input.event_title || event.title,
      registration_number: regNumber,
      registration_type_id: input.registration_type_id,
      registration_type_name: tierName,
      first_name: input.first_name,
      last_name: input.last_name,
      email: input.email,
      phone: input.phone,
      organization: input.organization,
      job_title: input.job_title,
      country: input.country || 'Ghana',
      cib_member_id: input.cib_member_id,
      membership_category: inferredCategory,
      attendance_type: input.attendance_type || 'PHYSICAL',
      dietary_requirements: input.dietary_requirements,
      special_assistance: input.special_assistance,
      total_amount: amount,
      currency: input.currency || 'GHS',
      payment_status: input.payment_status || (amount === 0 ? 'SUCCESSFUL' : 'PENDING'),
      payment_reference: input.payment_reference,
      payment_method: input.payment_method,
      check_in_status: input.check_in_status || 'REGISTERED',
      created_at: new Date().toISOString(),
    };

    // Save registration
    registrationsStore.set(registration.id, registration);
    registrationsStore.set(registration.registration_number, registration);

    // Save to Supabase if connected
    const supabase = getSupabase();
    if (supabase) {
      try {
        const isUuid = (val?: string) => Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));
        const dbId = isUuid(registration.id) ? registration.id : undefined;
        let dbEventId = isUuid(registration.event_id) ? registration.event_id : undefined;
        if (!dbEventId && (registration.event_id === 'evt-1' || registration.event_id?.includes('30th') || registration.event_id?.includes('national-banking'))) {
          dbEventId = 'e1111111-1111-1111-1111-111111111111';
        }

        let dbRegTypeId = isUuid(registration.registration_type_id) ? registration.registration_type_id : undefined;
        if (!dbRegTypeId) {
          if (registration.registration_type_id?.includes('single')) {
            dbRegTypeId = 'd1111111-1111-1111-1111-111111111111';
          } else if (registration.registration_type_id?.includes('double')) {
            dbRegTypeId = 'd2222222-2222-2222-2222-222222222222';
          } else if (registration.registration_type_id?.includes('member')) {
            dbRegTypeId = 'd3333333-3333-3333-3333-333333333333';
          } else {
            dbRegTypeId = 'd1111111-1111-1111-1111-111111111111';
          }
        }

        const insertPayload: any = {
          registration_number: registration.registration_number,
          first_name: registration.first_name,
          last_name: registration.last_name,
          email: registration.email,
          phone: registration.phone,
          organization: registration.organization,
          job_title: registration.job_title,
          country: registration.country,
          cib_member_id: registration.cib_member_id,
          attendance_type: registration.attendance_type,
          dietary_requirements: registration.dietary_requirements,
          special_assistance: registration.special_assistance,
          total_amount: registration.total_amount,
          currency: registration.currency,
          payment_status: registration.payment_status,
          payment_reference: registration.payment_reference,
          payment_method: registration.payment_method,
          check_in_status: registration.check_in_status,
          created_at: registration.created_at,
        };
        if (dbId) insertPayload.id = dbId;
        if (dbEventId) insertPayload.event_id = dbEventId;
        if (dbRegTypeId) insertPayload.registration_type_id = dbRegTypeId;

        const { data: dbReg, error: insErr } = await supabase.from('registrations').insert(insertPayload).select().maybeSingle();
        if (insErr) {
          console.warn('Supabase registration insert notice:', insErr);
        } else if (dbReg) {
          try {
            await supabase.from('tickets').insert({
              registration_id: dbReg.id,
              ticket_code: 'TCK-' + registration.registration_number,
              qr_code_data: JSON.stringify({ reg: registration.registration_number }),
              security_hash: 'hash_' + Date.now(),
              status: registration.check_in_status || 'REGISTERED',
            });
          } catch (tErr) {
            console.warn('Supabase ticket insert notice:', tErr);
          }
        }
      } catch (err) {
        console.warn('Supabase registration insert notice:', err);
      }
    }

    // Issue digital ticket
    const ticket = await TicketService.issueDigitalTicket(registration, event);
    ticketsStore.set(ticket.registration_number, ticket);
    ticketsStore.set(ticket.registration_id, ticket);

    // Update event registered count
    event.registered_count = (event.registered_count || 0) + 1;

    return { registration, ticket };
  }

  static async getRegistrationById(id: string): Promise<Registration | null> {
    return registrationsStore.get(id) || null;
  }

  static async getRegistrationByNumber(regNumber: string): Promise<Registration | null> {
    for (const reg of registrationsStore.values()) {
      if (reg.registration_number.toLowerCase() === regNumber.toLowerCase()) {
        return reg;
      }
    }
    return null;
  }

  static async getRegistrationByPaymentReference(reference: string): Promise<Registration | null> {
    for (const reg of registrationsStore.values()) {
      if (reg.payment_reference && reg.payment_reference.toLowerCase() === reference.toLowerCase()) {
        return reg;
      }
    }
    return null;
  }

  static async updatePaymentStatus(
    registrationId: string,
    status: PaymentStatus,
    reference?: string,
    method?: 'PAYSTACK_CARD' | 'PAYSTACK_MOMO' | 'BANK_TRANSFER'
  ): Promise<Registration | null> {
    let reg: Registration | null | undefined = registrationsStore.get(registrationId);
    if (!reg) {
      reg = await this.getRegistrationByNumber(registrationId);
    }
    if (!reg && reference) {
      reg = await this.getRegistrationByPaymentReference(reference);
    }
    if (!reg) return null;

    reg.payment_status = status;
    if (reference) reg.payment_reference = reference;
    if (method) reg.payment_method = method;

    const supabase = getSupabase();
    if (supabase) {
      try {
        const updatePayload: any = { payment_status: status };
        if (reference) updatePayload.payment_reference = reference;
        if (method) updatePayload.payment_method = method;
        await supabase
          .from('registrations')
          .update(updatePayload)
          .or(`registration_number.eq.${reg.registration_number},id.eq.${reg.id}`);
      } catch (err) {
        console.warn('Supabase payment status update notice:', err);
      }
    }

    return reg;
  }

  // 3. Tickets & Check-In
  static async getTicket(identifier: string): Promise<DigitalTicket | null> {
    // identifier could be registration_number or registration_id or payment_reference
    if (ticketsStore.has(identifier)) {
      return ticketsStore.get(identifier)!;
    }
    for (const t of ticketsStore.values()) {
      if (
        t.registration_number.toLowerCase() === identifier.toLowerCase() ||
        t.registration_id === identifier ||
        t.id === identifier
      ) {
        return t;
      }
    }
    // Also check if identifier matches a payment reference
    for (const reg of registrationsStore.values()) {
      if (reg.payment_reference && reg.payment_reference.toLowerCase() === identifier.toLowerCase()) {
        const ticket = ticketsStore.get(reg.registration_number) || ticketsStore.get(reg.id);
        if (ticket) return ticket;
      }
    }
    return null;
  }

  static async checkInAttendee(ticketIdentifier: string): Promise<{
    success: boolean;
    ticket?: DigitalTicket;
    message: string;
  }> {
    const ticket = await this.getTicket(ticketIdentifier);
    if (!ticket) {
      return { success: false, message: 'Ticket not found or invalid QR code.' };
    }

    if (ticket.check_in_status === 'CHECKED_IN') {
      return {
        success: false,
        ticket,
        message: 'Attendee has ALREADY checked in for this event.',
      };
    }

    ticket.check_in_status = 'CHECKED_IN';
    const reg = registrationsStore.get(ticket.registration_id);
    if (reg) {
      reg.check_in_status = 'CHECKED_IN';
      reg.check_in_time = new Date().toISOString();
    }

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase
          .from('registrations')
          .update({
            check_in_status: 'CHECKED_IN',
            check_in_time: new Date().toISOString(),
          })
          .or(`registration_number.eq.${ticketIdentifier},id.eq.${ticket.registration_id}`);
        await supabase
          .from('tickets')
          .update({ status: 'CHECKED_IN' })
          .or(`ticket_code.eq.TCK-${ticketIdentifier},registration_id.eq.${ticket.registration_id}`);
      } catch (err) {
        console.warn('Supabase check-in status update notice:', err);
      }
    }

    return {
      success: true,
      ticket,
      message: `Successfully checked in ${ticket.attendee_name} (${ticket.registration_tier})`,
    };
  }

  // 4. Admin stats
  static async getAdminStats() {
    const allEvents = await this.getAllEvents();
    const allRegistrations = await this.getAllRegistrations();

    const totalRegistrations = allRegistrations.length;
    const paidRegistrations = allRegistrations.filter((r) => r.payment_status === 'SUCCESSFUL');
    const totalRevenue = paidRegistrations.reduce((acc, r) => acc + (Number(r.total_amount) || 0), 0);
    const checkedInCount = allRegistrations.filter((r) => r.check_in_status === 'CHECKED_IN').length;

    const membershipCounts = {
      ACIB: allRegistrations.filter((r) => r.membership_category === 'ACIB').length,
      FCIB: allRegistrations.filter((r) => r.membership_category === 'FCIB').length,
      Student: allRegistrations.filter((r) => r.membership_category === 'Student').length,
      'Non-Member': allRegistrations.filter((r) => r.membership_category === 'Non-Member').length,
    };

    return {
      total_events: allEvents.length,
      active_events: allEvents.filter((e) => e.status === 'OPEN_FOR_REGISTRATION').length,
      total_registrations: totalRegistrations,
      paid_registrations: paidRegistrations.length,
      total_revenue_ghs: totalRevenue,
      checked_in_attendees: checkedInCount,
      membership_counts: membershipCounts,
    };
  }
}
