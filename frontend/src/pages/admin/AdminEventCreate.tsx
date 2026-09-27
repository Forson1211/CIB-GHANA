import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ProfilePlaceholder } from '../../components/ui/ProfilePlaceholder';
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Mic,
  Award,
  Image as ImageIcon,
  CheckCircle2,
  Save,
  FileText,
  Plus,
  Trash2,
  Upload,
  FileDown,
  ExternalLink,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { MOCK_CATEGORIES, MOCK_EVENTS } from '../../data/mockData';
import { AttendanceType, EventStatus, EventItem, EventResource } from '../../types';

export const AdminEventCreate: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id);

  const {
    events,
    addEvent,
    updateEvent,
    speakers: availableSpeakers,
    sponsors: availableSponsors,
  } = useApp();

  const existingEvent = isEditMode ? events.find((e) => e.id === id) : undefined;

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // 1. Basic Information
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState(MOCK_CATEGORIES[0]?.name || 'Conferences');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');

  // 2. Date & Location
  const [startDate, setStartDate] = useState('2026-12-10');
  const [endDate, setEndDate] = useState('2026-12-11');
  const [startTime, setStartTime] = useState('08:30');
  const [endTime, setEndTime] = useState('17:00');
  const [location, setLocation] = useState('Accra, Ghana');
  const [venue, setVenue] = useState('Kempinski Hotel Gold Coast City');
  const [venueAddress, setVenueAddress] = useState('Ministries, Accra');
  const [eventType, setEventType] = useState<AttendanceType>('HYBRID');

  // 3. Registration
  const [registrationFee, setRegistrationFee] = useState<number>(1200);
  const [capacity, setCapacity] = useState<number>(500);
  const [registrationDeadline, setRegistrationDeadline] = useState('2026-12-05T23:59:59Z');
  const [eventStatus, setEventStatus] = useState<EventStatus>('OPEN_FOR_REGISTRATION');

  // 4. Speakers (select from available)
  const [selectedSpeakerIds, setSelectedSpeakerIds] = useState<string[]>([]);

  // 5. Agenda (simple item draft)
  const [agendaTitle, setAgendaTitle] = useState('Opening Ceremony & Governor Keynote');

  // 6. Sponsors
  const [selectedSponsorIds, setSelectedSponsorIds] = useState<string[]>([]);

  // 7. Media
  const [featuredImage, setFeaturedImage] = useState(
    'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80'
  );
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // 8. Resources
  const [resources, setResources] = useState<EventResource[]>([]);
  // Resource inline form state
  const [newResTitle, setNewResTitle] = useState('');
  const [newResDesc, setNewResDesc] = useState('');
  const [newResCat, setNewResCat] = useState<'BROCHURE' | 'PRESENTATION' | 'REPORT' | 'PRESS'>('BROCHURE');
  const [newResType, setNewResType] = useState<'PDF' | 'PPT' | 'DOC' | 'ZIP'>('PDF');
  const [newResSize, setNewResSize] = useState('2.4 MB');
  const [newResUrl, setNewResUrl] = useState('');
  const [newResFileName, setNewResFileName] = useState('');
  const resourceFileInputRef = useRef<HTMLInputElement>(null);

  // Prefill state when existingEvent is loaded
  useEffect(() => {
    if (isEditMode && existingEvent) {
      setTitle(existingEvent.title || '');
      setTagline(existingEvent.tagline || '');
      setCategory(existingEvent.category || MOCK_CATEGORIES[0]?.name || 'Conferences');
      setShortDescription(existingEvent.short_description || '');
      setDescription(existingEvent.description || '');

      setStartDate(existingEvent.start_date || '2026-12-10');
      setEndDate(existingEvent.end_date || '2026-12-11');
      setStartTime(existingEvent.start_time?.slice(0, 5) || '08:30');
      setEndTime(existingEvent.end_time?.slice(0, 5) || '17:00');
      setLocation(existingEvent.location || 'Accra, Ghana');
      setVenue(existingEvent.venue || 'Kempinski Hotel Gold Coast City');
      setVenueAddress(existingEvent.venue_address || 'Ministries, Accra');
      setEventType(existingEvent.event_type || 'HYBRID');

      setRegistrationFee(existingEvent.registration_fee || 0);
      setCapacity(existingEvent.capacity || 500);
      setRegistrationDeadline(existingEvent.registration_deadline || '');
      setEventStatus(existingEvent.status || 'OPEN_FOR_REGISTRATION');

      setSelectedSpeakerIds((existingEvent.speakers || []).map((s) => s.id));
      if (existingEvent.agenda && existingEvent.agenda.length > 0) {
        setAgendaTitle(existingEvent.agenda[0].title || '');
      }
      setSelectedSponsorIds((existingEvent.sponsors || []).map((s) => s.id));
      setFeaturedImage(existingEvent.featured_image || '');
      setResources(existingEvent.resources || []);
    } else if (!isEditMode) {
      if (availableSpeakers.length > 0) {
        setSelectedSpeakerIds([availableSpeakers[0].id]);
      }
      if (availableSponsors.length > 0) {
        setSelectedSponsorIds([availableSponsors[0].id]);
      }
    }
  }, [isEditMode, existingEvent]);

  const steps = [
    'Basic Information',
    'Date & Location',
    'Registration & Fees',
    'Speakers',
    'Agenda',
    'Sponsors',
    'Media',
    'Event Resources',
    'Review & Save',
  ];

  // Upload featured image as Base64
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFeaturedImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Upload resource file as Base64
  const handleResourceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toUpperCase() || '';
    let detectedType: 'PDF' | 'PPT' | 'DOC' | 'ZIP' = 'PDF';
    if (ext === 'PPT' || ext === 'PPTX') detectedType = 'PPT';
    else if (ext === 'DOC' || ext === 'DOCX') detectedType = 'DOC';
    else if (ext === 'ZIP' || ext === 'RAR') detectedType = 'ZIP';

    const sizeInMB = file.size / (1024 * 1024);
    const formattedSize =
      sizeInMB >= 1 ? `${sizeInMB.toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`;

    setNewResFileName(file.name);
    setNewResType(detectedType);
    setNewResSize(formattedSize);
    if (!newResTitle) {
      setNewResTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewResUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Add resource to event's resource list
  const handleAddResourceItem = () => {
    if (!newResTitle.trim()) {
      alert('Please enter a title for the document.');
      return;
    }

    const item: EventResource = {
      id: `res-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      event_id: existingEvent?.id || 'pending',
      title: newResTitle.trim(),
      description: newResDesc.trim() || 'Official conference material and documentation.',
      category: newResCat,
      file_type: newResType,
      file_size: newResSize,
      file_url: newResUrl.trim() || '#',
    };

    setResources((prev) => [item, ...prev]);
    setNewResTitle('');
    setNewResDesc('');
    setNewResUrl('');
    setNewResFileName('');
    if (resourceFileInputRef.current) {
      resourceFileInputRef.current.value = '';
    }
  };

  // Remove resource
  const handleRemoveResource = (resId: string) => {
    setResources((prev) => prev.filter((r) => r.id !== resId));
  };

  // Save or Update handler
  const handleSave = async (targetStatus?: EventStatus) => {
    if (!title.trim()) {
      alert('Please provide an event title before saving.');
      setCurrentStep(1);
      return;
    }

    setIsSaving(true);
    const statusToApply = targetStatus || eventStatus;

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || `cib-event-${Date.now()}`;

    const chosenSpeakers = availableSpeakers.filter((s) => selectedSpeakerIds.includes(s.id));
    const chosenSponsors = availableSponsors.filter((s) => selectedSponsorIds.includes(s.id));

    try {
      if (isEditMode && existingEvent) {
        // Edit Mode
        const updatedFields: Partial<EventItem> = {
          title,
          slug: existingEvent.slug || slug,
          tagline,
          description,
          short_description: shortDescription,
          category,
          featured_image: featuredImage,
          start_date: startDate,
          end_date: endDate,
          start_time: startTime,
          end_time: endTime,
          location,
          venue,
          venue_address: venueAddress,
          event_type: eventType,
          registration_fee: registrationFee,
          capacity,
          registration_deadline: registrationDeadline,
          status: statusToApply,
          speakers: chosenSpeakers,
          sponsors: chosenSponsors,
          resources: resources.map((r) => ({ ...r, event_id: existingEvent.id })),
          agenda: existingEvent.agenda && existingEvent.agenda.length > 0
            ? existingEvent.agenda
            : (MOCK_EVENTS[0].agenda || []),
        };

        await updateEvent(existingEvent.id, updatedFields);
        setSaveFeedback('Event updated successfully! Redirecting...');
        setTimeout(() => navigate('/admin/events'), 800);
      } else {
        // Create Mode
        const newEvent: Omit<EventItem, 'id' | 'created_at' | 'updated_at'> = {
          title,
          slug,
          tagline,
          description,
          short_description: shortDescription,
          category,
          category_id: 'c1111111-1111-1111-1111-111111111111',
          featured_image: featuredImage,
          start_date: startDate,
          end_date: endDate,
          start_time: startTime,
          end_time: endTime,
          location,
          venue,
          venue_address: venueAddress,
          event_type: eventType,
          registration_fee: registrationFee,
          currency: 'GHS',
          capacity,
          registered_count: 0,
          registration_deadline: registrationDeadline,
          status: statusToApply,
          is_featured: false,
          themes: ['Banking Ethics', 'Financial Regulation', 'Digital Transformation'],
          why_attend: [
            { title: 'Industry Leadership', description: 'Hear from prominent banking governors and executives.' },
            { title: 'CPD Hours', description: 'Earn required continuous professional education units.' },
          ],
          speakers: chosenSpeakers,
          agenda: [
            {
              id: `ag-temp-1-${Date.now()}`,
              event_id: '',
              day_number: 1,
              date: startDate,
              start_time: startTime,
              end_time: '11:00',
              title: agendaTitle || 'Opening Keynote & Strategic Overview',
              session_type: 'KEYNOTE',
              room: 'Main Auditorium',
              speaker_ids: selectedSpeakerIds.slice(0, 2),
            },
            {
              id: `ag-temp-2-${Date.now()}`,
              event_id: '',
              day_number: 1,
              date: startDate,
              start_time: '11:30',
              end_time: '13:00',
              title: 'Executive Panel: Banking Resilience & Regulatory Compliance',
              session_type: 'PANEL',
              room: 'Main Auditorium',
              speaker_ids: selectedSpeakerIds.slice(1, 4),
            },
            {
              id: `ag-temp-3-${Date.now()}`,
              event_id: '',
              day_number: 2,
              date: endDate || startDate,
              start_time: '09:00',
              end_time: '11:00',
              title: 'Strategic Masterclass: Digital Risk & AI Infrastructure',
              session_type: 'MASTERCLASS',
              room: 'Executive Hall B',
              speaker_ids: selectedSpeakerIds.slice(0, 1),
            },
            {
              id: `ag-temp-4-${Date.now()}`,
              event_id: '',
              day_number: 2,
              date: endDate || startDate,
              start_time: '14:00',
              end_time: '16:00',
              title: 'Closing Executive Communiqué & Networking Reception',
              session_type: 'CEREMONY',
              room: 'Grand Ballroom',
              speaker_ids: selectedSpeakerIds.slice(0, 2),
            },
          ],
          sponsors: chosenSponsors,
          registration_types: [
            {
              id: `rt-std-${Date.now()}`,
              event_id: '',
              name: 'CIB Member Delegate',
              code: 'MBR',
              price: registrationFee,
              currency: 'GHS',
              description: 'Accredited admission for members in good standing.',
              benefits: ['Auditorium seat', 'Executive lunch', 'CPD credits'],
            },
          ],
          resources: resources,
          gallery: [],
        };

        await addEvent(newEvent);
        setSaveFeedback('Event created successfully! Redirecting...');
        setTimeout(() => navigate('/admin/events'), 800);
      }
    } catch (err) {
      console.error('Save event failed:', err);
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout
      title={isEditMode ? `Edit Event: ${title || existingEvent?.title || 'Event'}` : 'Create New Event'}
      subtitle={
        isEditMode
          ? 'Update event curriculum, faculty, dates, sessions, and attach downloadable resources for the public site.'
          : 'Follow the 9-step wizard to configure and publish an official CIB Ghana event programme.'
      }
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/events')}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Save className="w-4 h-4" />}
            disabled={isSaving}
            onClick={() => handleSave()}
          >
            {isSaving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Save as Draft'}
          </Button>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        {/* Feedback Alert */}
        {saveFeedback && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveFeedback}</span>
          </div>
        )}

        {/* Multi-step progress bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between min-w-[700px]">
            {steps.map((stepName, idx) => {
              const stepNumber = idx + 1;
              const isPassed = currentStep > stepNumber;
              const isCurrent = currentStep === stepNumber;

              return (
                <div
                  key={idx}
                  onClick={() => setCurrentStep(stepNumber)}
                  className="flex flex-col items-center flex-1 cursor-pointer"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isPassed
                        ? 'bg-cib-green-700 text-white'
                        : isCurrent
                        ? 'bg-cib-green-900 text-white ring-4 ring-cib-green-100'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isPassed ? <Check className="w-3.5 h-3.5" /> : stepNumber}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 mt-1 text-center truncate max-w-[75px]">
                    {stepName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          {/* STEP 1: BASIC INFORMATION */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-cib-charcoal-900 font-display">
                1. Basic Information
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 30th National Banking & Ethics Conference 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cib-green-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tagline / Theme
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Banking on the Future — Trust, Technology and Transformation"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cib-green-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cib-green-600 focus:outline-none bg-white font-medium"
                >
                  {MOCK_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="A concise 1-2 sentence executive overview for event cards"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cib-green-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Detailed Description
                </label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Comprehensive narrative detailing curriculum, policy rationale, and target attendees..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cib-green-600 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: DATE & LOCATION */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-cib-charcoal-900 font-display">
                2. Date & Location
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cib-green-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cib-green-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Daily Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cib-green-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Daily End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cib-green-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Venue Name
                  </label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. Kempinski Hotel Gold Coast City"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cib-green-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    City / Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Accra, Ghana"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cib-green-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Street / Venue Address
                </label>
                <input
                  type="text"
                  value={venueAddress}
                  onChange={(e) => setVenueAddress(e.target.value)}
                  placeholder="e.g. Aqua Safari Resort, Ada Foah, Greater Accra Region"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cib-green-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Attendance Mode
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['PHYSICAL', 'VIRTUAL', 'HYBRID'] as AttendanceType[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setEventType(mode)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        eventType === mode
                          ? 'border-cib-green-700 bg-cib-green-50 text-cib-green-900 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: REGISTRATION & FEES */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-cib-charcoal-900 font-display">
                3. Registration Fees & Capacity
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Standard Delegate Fee (GHS)
                  </label>
                  <input
                    type="number"
                    value={registrationFee}
                    onChange={(e) => setRegistrationFee(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cib-green-600 focus:outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Maximum Capacity (Seats)
                  </label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cib-green-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registration Deadline
                  </label>
                  <input
                    type="date"
                    value={registrationDeadline.slice(0, 10)}
                    onChange={(e) => setRegistrationDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cib-green-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Event Publishing Status
                  </label>
                  <select
                    value={eventStatus}
                    onChange={(e) => setEventStatus(e.target.value as EventStatus)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cib-green-600 focus:outline-none bg-white font-semibold"
                  >
                    <option value="OPEN_FOR_REGISTRATION">Open for Registration</option>
                    <option value="DRAFT">Draft (Unpublished)</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="REGISTRATION_CLOSED">Registration Closed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SPEAKERS */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-cib-charcoal-900 font-display">
                    4. Assign Faculty & Keynote Speakers
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select speakers to include in the official programme schedule.
                  </p>
                </div>
                <Link
                  to="/admin/speakers"
                  target="_blank"
                  className="text-xs font-bold text-cib-green-700 hover:underline flex items-center gap-1"
                >
                  Manage Speakers <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto p-1">
                {availableSpeakers.map((spk) => {
                  const isSelected = selectedSpeakerIds.includes(spk.id);
                  return (
                    <div
                      key={spk.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedSpeakerIds(selectedSpeakerIds.filter((id) => id !== spk.id));
                        } else {
                          setSelectedSpeakerIds([...selectedSpeakerIds, spk.id]);
                        }
                      }}
                      className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                        isSelected
                          ? 'border-cib-green-700 bg-cib-green-50/70 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {spk.photo_url ? (
                        <img
                          src={spk.photo_url}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-200">
                          <ProfilePlaceholder className="w-full h-full" />
                        </div>
                      )}
                      <div className="truncate flex-1">
                        <span className="text-xs font-bold text-cib-charcoal-900 block truncate">
                          {spk.name}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate block">
                          {spk.organization}
                        </span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-cib-green-700 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: AGENDA */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-cib-charcoal-900 font-display">
                5. Session Agenda Blueprint
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Plenary / Keynote Session Title
                </label>
                <input
                  type="text"
                  value={agendaTitle}
                  onChange={(e) => setAgendaTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cib-green-600 focus:outline-none"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <span className="font-bold text-cib-charcoal-900 block">Session Blueprint Summary:</span>
                <p>• Day 1 ({startDate}): {agendaTitle}</p>
                <p>• Room: Main Convention Auditorium</p>
                <p>• Assigned Faculty: {selectedSpeakerIds.length} speaker(s)</p>
              </div>
            </div>
          )}

          {/* STEP 6: SPONSORS */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-cib-charcoal-900 font-display">
                6. Attached Sponsors & Partners
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableSponsors.map((sp) => {
                  const isSelected = selectedSponsorIds.includes(sp.id);
                  return (
                    <div
                      key={sp.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedSponsorIds(selectedSponsorIds.filter((id) => id !== sp.id));
                        } else {
                          setSelectedSponsorIds([...selectedSponsorIds, sp.id]);
                        }
                      }}
                      className={`p-3.5 rounded-xl border text-center cursor-pointer transition-all ${
                        isSelected
                          ? 'border-cib-green-700 bg-cib-green-50 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <p className="text-xs font-bold text-cib-charcoal-900 truncate">{sp.name}</p>
                      <span className="text-[10px] text-cib-green-700 font-bold uppercase">{sp.type || 'SPONSOR'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 7: MEDIA */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-cib-charcoal-900 font-display">
                7. Featured Event Photography
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Featured Image URL
                  </label>
                  <input
                    type="url"
                    value={featuredImage.startsWith('data:') ? 'Custom Uploaded Image' : featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                    disabled={featuredImage.startsWith('data:')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cib-green-600 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                  />
                  <div className="mt-3">
                    <input
                      type="file"
                      ref={bannerInputRef}
                      onChange={handleBannerUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      leftIcon={<Upload className="w-4 h-4" />}
                      onClick={() => bannerInputRef.current?.click()}
                    >
                      Upload Image from Computer
                    </Button>
                  </div>
                </div>

                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                  <img
                    src={featuredImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80';
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: EVENT RESOURCES & DOCUMENTS */}
          {currentStep === 8 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-cib-charcoal-900 font-display">
                    8. Downloadable Resources & Documents
                  </h3>
                  <p className="text-xs text-slate-500">
                    Upload brochures, keynote slides, and official reports for this event. These will automatically appear on the public Resources page.
                  </p>
                </div>
                <Link
                  to="/admin/resources"
                  target="_blank"
                  className="text-xs font-bold text-cib-green-700 hover:underline flex items-center gap-1"
                >
                  Resource Hub <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              {/* Existing Resources List */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 block">
                  Attached Resources ({resources.length})
                </span>

                {resources.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                    <FileText className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-500">
                      No documents attached yet. Add one below to make it available for download.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {resources.map((res) => (
                      <div
                        key={res.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-xs hover:border-cib-green-300 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-cib-green-50 text-cib-green-800 shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-cib-charcoal-900">
                                {res.title}
                              </span>
                              <Badge variant="green" size="sm">
                                {res.category}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {res.file_type} &bull; {res.file_size} &bull; {res.description}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveResource(res.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors shrink-0"
                          title="Remove document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Resource Form Box */}
              <div className="p-5 rounded-2xl border border-cib-green-200 bg-cib-green-50/30 space-y-4">
                <span className="text-xs font-bold text-cib-green-900 block flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-cib-green-700" /> Attach New Document to Event
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Document Title *
                    </label>
                    <input
                      type="text"
                      value={newResTitle}
                      onChange={(e) => setNewResTitle(e.target.value)}
                      placeholder="e.g. Conference Brochure & Prospectus"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-cib-green-600 focus:outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={newResCat}
                      onChange={(e) => setNewResCat(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-cib-green-600 focus:outline-none bg-white font-medium"
                    >
                      <option value="BROCHURE">Brochure</option>
                      <option value="PRESENTATION">Presentation</option>
                      <option value="REPORT">Report</option>
                      <option value="PRESS">Press</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Summary / Description
                  </label>
                  <input
                    type="text"
                    value={newResDesc}
                    onChange={(e) => setNewResDesc(e.target.value)}
                    placeholder="Brief description of the document..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-cib-green-600 focus:outline-none bg-white"
                  />
                </div>

                {/* Upload File */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Upload Document (PDF, PPT, DOC, ZIP)
                  </label>
                  <input
                    type="file"
                    ref={resourceFileInputRef}
                    onChange={handleResourceFileUpload}
                    accept=".pdf,.ppt,.pptx,.doc,.docx,.zip,.rar"
                    className="hidden"
                  />
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      leftIcon={<Upload className="w-3.5 h-3.5" />}
                      onClick={() => resourceFileInputRef.current?.click()}
                    >
                      Browse Document File
                    </Button>
                    {newResFileName && (
                      <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {newResFileName} ({newResSize})
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={handleAddResourceItem}
                  >
                    Add Document to Event
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 9: REVIEW & SAVE */}
          {currentStep === 9 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-cib-charcoal-900 font-display">
                  9. Review & Finalize Programme
                </h3>
                <p className="text-xs text-slate-500">
                  Verify all details before publishing or saving changes.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-slate-700">
                <p><strong>Title:</strong> {title || 'Untitled Event'}</p>
                <p><strong>Category:</strong> {category}</p>
                <p><strong>Dates:</strong> {startDate} to {endDate} &bull; {venue} ({location})</p>
                <p><strong>Fee:</strong> GHS {registrationFee} &bull; <strong>Capacity:</strong> {capacity} seats</p>
                <p><strong>Speakers:</strong> {selectedSpeakerIds.length} faculty assigned</p>
                <p><strong>Resources:</strong> {resources.length} document(s) attached for public download</p>
                <p><strong>Mode:</strong> {eventType} &bull; <strong>Status:</strong> {eventStatus}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4">
                <Button
                  variant="primary"
                  size="lg"
                  disabled={isSaving}
                  onClick={() => handleSave('OPEN_FOR_REGISTRATION')}
                >
                  {isSaving ? 'Saving...' : isEditMode ? 'Save & Publish Event' : 'Publish & Open for Registration'}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  disabled={isSaving}
                  onClick={() => handleSave('DRAFT')}
                >
                  Save as Draft Only
                </Button>
              </div>
            </div>
          )}

          {/* Step Navigation Controls */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="md"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Previous Step
              </Button>
            ) : <div />}

            {currentStep < 9 && (
              <Button
                type="button"
                variant="primary"
                size="md"
                showArrow
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Next Step
              </Button>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
