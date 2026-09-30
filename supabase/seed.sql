-- =========================================================
-- CIB GHANA EVENTS PLATFORM: SEED SCRIPT
-- Populates the official 30th National Banking & Ethics Conference 2026,
-- Keynote Speakers, Registration Tiers, Agendas, and Partners.
-- =========================================================

-- 1. EVENT CATEGORIES
INSERT INTO public.event_categories (id, name, slug, description, icon, sort_order)
VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Conferences', 'conferences', 'National and pan-African banking conferences.', 'Award', 1),
  ('c2222222-2222-2222-2222-222222222222', 'Masterclasses', 'masterclasses', 'Executive risk, AI, and compliance masterclasses.', 'GraduationCap', 2),
  ('c3333333-3333-3333-3333-333333333333', 'Seminars', 'seminars', 'Continuous professional development webinars and seminars.', 'BookOpen', 3),
  ('c4444444-4444-4444-4444-444444444444', 'Annual General Meetings', 'agm', 'Statutory governance and general meetings.', 'Landmark', 4)
ON CONFLICT (id) DO NOTHING;

-- 2. FLAGSHIP EVENT: 30TH NATIONAL BANKING & ETHICS CONFERENCE 2026
INSERT INTO public.events (
  id,
  title,
  slug,
  tagline,
  description,
  short_description,
  category_id,
  featured_image,
  banner_image,
  start_date,
  end_date,
  start_time,
  end_time,
  location,
  venue,
  venue_address,
  event_type,
  registration_fee,
  currency,
  capacity,
  registered_count,
  registration_deadline,
  status,
  is_featured,
  is_past
) VALUES (
  'e1111111-1111-1111-1111-111111111111',
  '30th National Banking & Ethics Conference 2026',
  '30th-national-banking-ethics-conference-2026',
  'Banking on the Future — Trust, Technology and Transformation',
  'The premier gathering of Ghanaian bank executives, regulatory authorities, compliance officers, and fintech pioneers at Aqua Safari Resort, Ada Foah. Convened by the Chartered Institute of Bankers, Ghana, this 3-day milestone event addresses ethical governance, macroeconomic stability, cross-border interoperability under AfCFTA, and AI risk containment in modern banking.',
  'The premier gathering of Ghanaian bank executives, regulators, and financial professionals shaping ethical standards and sustainable growth.',
  'c1111111-1111-1111-1111-111111111111',
  '/aqua-safari-pool-promenade.png',
  '/aqua-safari-lawn-night.jpg',
  '2026-11-09',
  '2026-11-10',
  '08:30:00',
  '17:30:00',
  'Aqua Safari Resort, Ada Foah',
  'Aqua Safari Resort Convention Pavilion, Ada Foah',
  'Aqua Safari Resort, Ada Foah, Greater Accra Region, Ghana',
  'HYBRID',
  1200.00,
  'GHS',
  650,
  486,
  '2026-11-05 23:59:59+00',
  'OPEN_FOR_REGISTRATION',
  true,
  false
) ON CONFLICT (id) DO UPDATE SET
  featured_image = EXCLUDED.featured_image,
  banner_image = EXCLUDED.banner_image;

-- 3. REGISTRATION PACKAGES / TIERS
INSERT INTO public.registration_types (
  id, event_id, name, code, price, currency, description, capacity, spots_left, benefits
) VALUES
  (
    'd1111111-1111-1111-1111-111111111111',
    'e1111111-1111-1111-1111-111111111111',
    'Early Bird Single Occupancy Package',
    'PKG-SINGLE-EB',
    5600.00,
    'GHS',
    'Luxury Single Chalet accommodation for 2 nights at Aqua Safari, full conference access, Masterclass fee, dinner for 2 nights, and luxury boat cruise.',
    200,
    38,
    ARRAY['Private Luxury Chalet (2 Nights)', 'Full Conference & Masterclass Access', 'Gala Dinner & Boat Cruise', 'Accredited CPD Certificate']
  ),
  (
    'd2222222-2222-2222-2222-222222222222',
    'e1111111-1111-1111-1111-111111111111',
    'Early Bird Double Occupancy Package',
    'PKG-DOUBLE-EB',
    4000.00,
    'GHS',
    'Shared Double Chalet accommodation for 2 nights at Aqua Safari, conference & Masterclass entry, dinners, and all networking events.',
    250,
    42,
    ARRAY['Shared Chalet (2 Nights)', 'Full Conference & Masterclass Access', 'Networking Dinners', 'Accredited CPD Certificate']
  ),
  (
    'd3333333-3333-3333-3333-333333333333',
    'e1111111-1111-1111-1111-111111111111',
    'CIB Chartered Member Pass (Non-Residential)',
    'PASS-MEMBER',
    1200.00,
    'GHS',
    'Discounted pass for verified FCIB, ACIB, and Student Associates in good standing.',
    150,
    34,
    ARRAY['3-Day Conference Access', 'Executive Luncheons & Coffee Breaks', 'CPD Accreditation']
  ),
  (
    'd4444444-4444-4444-4444-444444444444',
    'e1111111-1111-1111-1111-111111111111',
    'Non-Member Corporate Delegate Pass',
    'PASS-NONMEM',
    1800.00,
    'GHS',
    'Delegate registration for financial sector professionals and non-members.',
    100,
    28,
    ARRAY['3-Day Conference Access', 'All Keynote Sessions', 'Luncheons & Official Materials']
  )
ON CONFLICT (id) DO NOTHING;

-- 4. KEYNOTE SPEAKERS
INSERT INTO public.speakers (
  id, name, slug, position, organization, country, photo_url, biography, expertise, is_keynote, linkedin_url
) VALUES
  (
    'b1111111-1111-1111-1111-111111111111',
    'Dr. Ernest Addison',
    'dr-ernest-addison',
    'Governor',
    'Bank of Ghana',
    'Ghana',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    'Governor of the Bank of Ghana with distinguished leadership in macroeconomic governance, financial stability, and monetary policy management across West Africa.',
    ARRAY['Monetary Policy', 'Banking Supervision', 'Central Banking', 'Macroeconomics'],
    true,
    'https://linkedin.com'
  ),
  (
    'b2222222-2222-2222-2222-222222222222',
    'John Awuah',
    'john-awuah',
    'Chief Executive Officer',
    'Ghana Association of Banks (GAB)',
    'Ghana',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    'CEO of the Ghana Association of Banks and respected finance strategist driving ethical compliance, sound risk benchmarks, and commercial banking advocacy.',
    ARRAY['Commercial Banking', 'Ethics & Compliance', 'Risk Governance', 'Public Policy'],
    true,
    'https://linkedin.com'
  ),
  (
    'b3333333-3333-3333-3333-333333333333',
    'Archie Hesse',
    'archie-hesse',
    'Chief Executive Officer',
    'GhIPSS (Ghana Interbank Payment & Settlement Systems)',
    'Ghana',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80',
    'CEO of GhIPSS and pioneer of Ghana national interoperable payments including GhQR, Mobile Money Interoperability, and real-time settlement rails.',
    ARRAY['Payment Infrastructure', 'Fintech', 'Financial Inclusion', 'Interoperability'],
    true,
    'https://linkedin.com'
  ),
  (
    'b4444444-4444-4444-4444-444444444444',
    'Abena Osei-Poku',
    'abena-osei-poku',
    'Managing Director',
    'Ecobank Ghana',
    'Ghana',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    'Managing Director of Ecobank Ghana and Regional Executive for Anglophone West Africa, with extensive leadership in corporate banking and digital transformation.',
    ARRAY['Corporate Banking', 'ESG Finance', 'Leadership', 'Digital Banking'],
    false,
    'https://linkedin.com'
  ),
  (
    'b5555555-5555-5555-5555-555555555555',
    'Mansa Nettey',
    'mansa-nettey',
    'Chief Executive Officer',
    'Standard Chartered Bank Ghana',
    'Ghana',
    'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=600&q=80',
    'First female CEO of Standard Chartered Bank Ghana and seasoned financial markets executive championing sustainable trade finance and ethical standards.',
    ARRAY['Financial Markets', 'Trade Finance', 'Corporate Governance', 'Diversity'],
    false,
    'https://linkedin.com'
  )
ON CONFLICT (id) DO UPDATE SET
  photo_url = EXCLUDED.photo_url;

-- 5. LINK SPEAKERS TO EVENT
INSERT INTO public.event_speakers (event_id, speaker_id, is_keynote, topic)
VALUES
  ('e1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', true, 'Principal Keynote: Monetary Policy & Ethical Banking Stability in Ghana'),
  ('e1111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222', true, 'Executive Address: The Charter of Banking Integrity & Regulatory Trust'),
  ('e1111111-1111-1111-1111-111111111111', 'b3333333-3333-3333-3333-333333333333', true, 'Infrastructure Keynote: Scaling National Payment Rails and Cross-Border Interoperability')
ON CONFLICT (event_id, speaker_id) DO NOTHING;

-- 6. AGENDA SESSIONS
INSERT INTO public.agenda_sessions (
  id, event_id, day_number, date, start_time, end_time, title, description, session_type, room, track
) VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    'e1111111-1111-1111-1111-111111111111',
    1,
    '2026-11-09',
    '09:00:00',
    '10:30:00',
    'Opening Ceremony & Principal Regulatory Keynote',
    'Official opening by the President of CIB Ghana, followed by Governor of Bank of Ghana delivering the principal address.',
    'Keynote',
    'Grand Volta Ballroom',
    'Policy & Regulation'
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    'e1111111-1111-1111-1111-111111111111',
    1,
    '2026-11-09',
    '11:00:00',
    '12:30:00',
    'CEOs Executive Roundtable: Navigating Risk & Compliance',
    'Commercial bank chief executives debate liquidity risk, ethical culture, and non-performing loan management.',
    'Panel',
    'Grand Volta Ballroom',
    'Executive Leadership'
  ),
  (
    'a3333333-3333-3333-3333-333333333333',
    'e1111111-1111-1111-1111-111111111111',
    2,
    '2026-11-09',
    '09:00:00',
    '11:00:00',
    'Masterclass: Deploying AI to Combat Modern Fraud in International Trade Finance',
    'Hands-on technical workshop on detecting synthetic identities, trade-based money laundering, and deepfake verification.',
    'Masterclass',
    'Executive Pavilion A',
    'Technology & AI'
  ),
  (
    'a4444444-4444-4444-4444-444444444444',
    'e1111111-1111-1111-1111-111111111111',
    3,
    '2026-11-10',
    '18:30:00',
    '22:00:00',
    'Grand Bankers Gala Dinner & Excellence Awards',
    'Annual black-tie celebratory evening recognizing institutional excellence, ethical leadership, and new fellow inductions.',
    'Gala',
    'Waterfront Lawn Pavilion',
    'Networking'
  )
ON CONFLICT (id) DO NOTHING;

-- 7. INSTITUTIONAL SPONSORS
INSERT INTO public.sponsors (id, name, logo_url, website_url, tier, description)
VALUES
  ('f1111111-1111-1111-1111-111111111111', 'Bank of Ghana', 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=300&q=80', 'https://bog.gov.gh', 'PARTNER', 'Central Bank & Statutory Banking Regulator'),
  ('f2222222-2222-2222-2222-222222222222', 'GhIPSS', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=300&q=80', 'https://ghipss.net', 'PARTNER', 'National Payment Switch Infrastructure'),
  ('f3333333-3333-3333-3333-333333333333', 'Standard Chartered Bank', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=300&q=80', 'https://sc.com/gh', 'PLATINUM', 'Lead Platinum Sponsor & Trade Finance Partner'),
  ('f4444444-4444-4444-4444-444444444444', 'Ecobank Ghana', 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=300&q=80', 'https://ecobank.com', 'GOLD', 'Gold Sponsor & Regional Payments Partner'),
  ('f5555555-5555-5555-5555-555555555555', 'GCB Bank PLC', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=300&q=80', 'https://gcbbank.com.gh', 'GOLD', 'Gold Sponsor & National Banking Partner'),
  ('f6666666-6666-6666-6666-666666666666', 'Absa Bank Ghana', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=80', 'https://absa.com.gh', 'SILVER', 'Silver Sponsor & Wealth Management Partner')
ON CONFLICT (id) DO UPDATE SET
  logo_url = EXCLUDED.logo_url;

-- 8. LINK SPONSORS TO EVENT
INSERT INTO public.event_sponsors (event_id, sponsor_id, custom_tier)
VALUES
  ('e1111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 'PARTNER'),
  ('e1111111-1111-1111-1111-111111111111', 'f2222222-2222-2222-2222-222222222222', 'PARTNER'),
  ('e1111111-1111-1111-1111-111111111111', 'f3333333-3333-3333-3333-333333333333', 'PLATINUM'),
  ('e1111111-1111-1111-1111-111111111111', 'f4444444-4444-4444-4444-444444444444', 'GOLD'),
  ('e1111111-1111-1111-1111-111111111111', 'f5555555-5555-5555-5555-555555555555', 'GOLD'),
  ('e1111111-1111-1111-1111-111111111111', 'f6666666-6666-6666-6666-666666666666', 'SILVER')
ON CONFLICT (event_id, sponsor_id) DO NOTHING;
