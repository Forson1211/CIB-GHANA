import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { AttendanceType, RegistrationType, Registration } from '../types';
import { formatGHS } from '../lib/utils';
import {
  Check,
  CheckCircle2,
  CreditCard,
  User,
  Building,
  Mail,
  Phone,
  Globe,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Download,
  Ticket as TicketIcon,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PaystackModal } from '../components/registration/PaystackModal';
import { sendEmailNotification } from '../lib/email';

export const Register: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { getEventBySlug, addRegistration, setRegisteredUserEmail, setRegisteredUserName } = useApp();

  const event = slug ? getEventBySlug(slug) : undefined;

  const STORAGE_KEY_FORM = `cib_reg_draft_${slug || 'event'}`;

  const savedDraft = React.useMemo(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY_FORM);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [slug]);

  const [currentStep, setCurrentStep] = useState<number>(() => {
    const params = new URLSearchParams(window.location.search);
    const stepParam = parseInt(params.get('step') || '', 10);
    if (stepParam >= 1 && stepParam <= 5) return stepParam;
    return savedDraft?.currentStep || 1;
  });

  const [membershipCategory, setMembershipCategory] = useState<string>(
    () => savedDraft?.membershipCategory || 'ACIB'
  );
  const [privacyAgreed, setPrivacyAgreed] = useState<boolean>(
    () => savedDraft?.privacyAgreed || false
  );
  const [selectedTier, setSelectedTier] = useState<RegistrationType | null>(() => {
    if (savedDraft?.selectedTierId && event?.registration_types) {
      const match = event.registration_types.find((t) => t.id === savedDraft.selectedTierId);
      if (match) return match;
    }
    return event?.registration_types?.[0] || null;
  });

  // Step 2: Personal Info
  const [firstName, setFirstName] = useState(() => savedDraft?.firstName || '');
  const [lastName, setLastName] = useState(() => savedDraft?.lastName || '');
  const [email, setEmail] = useState(() => savedDraft?.email || '');
  const [phone, setPhone] = useState(() => savedDraft?.phone || '');
  const [organization, setOrganization] = useState(() => savedDraft?.organization || '');
  const [jobTitle, setJobTitle] = useState(() => savedDraft?.jobTitle || '');
  const [country, setCountry] = useState(() => savedDraft?.country || 'Ghana');
  const [cibMemberId, setCibMemberId] = useState(() => savedDraft?.cibMemberId || '');

  // Field interaction tracking
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const markTouched = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }));

  // Validation functions
  const validateFirstName = (val: string): { isValid: boolean; error?: string } => {
    const trimmed = val.trim();
    if (!trimmed) return { isValid: false, error: 'First name is required' };
    if (trimmed.length < 2) return { isValid: false, error: 'First name must be at least 2 characters' };
    if (/[0-9]/.test(val)) return { isValid: false, error: 'First name cannot contain numbers' };
    return { isValid: true };
  };

  const validateLastName = (val: string): { isValid: boolean; error?: string } => {
    const trimmed = val.trim();
    if (!trimmed) return { isValid: false, error: 'Last name is required' };
    if (trimmed.length < 2) return { isValid: false, error: 'Last name must be at least 2 characters' };
    if (/[0-9]/.test(val)) return { isValid: false, error: 'Last name cannot contain numbers' };
    return { isValid: true };
  };

  const validateEmail = (val: string): { isValid: boolean; error?: string } => {
    const trimmed = val.trim();
    if (!trimmed) return { isValid: false, error: 'Email address is required' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
      return { isValid: false, error: 'Please enter a valid email address (e.g. name@bank.com)' };
    }
    return { isValid: true };
  };

  const validatePhone = (val: string): { isValid: boolean; error?: string } => {
    const trimmed = val.trim();
    if (!trimmed) return { isValid: false, error: 'Telephone number is required' };
    if (/[a-zA-Z]/.test(val)) {
      return { isValid: false, error: 'Telephone number cannot contain letters' };
    }
    const digits = trimmed.replace(/\D/g, '');
    if (trimmed.startsWith('0')) {
      if (digits.length < 10) {
        return {
          isValid: false,
          error: `Please enter all 10 digits (${digits.length}/10 entered). Incomplete numbers like 0550 are not allowed.`,
        };
      }
      if (digits.length > 10) {
        return {
          isValid: false,
          error: 'Ghana telephone numbers should have exactly 10 digits (e.g. 055 123 4567)',
        };
      }
      return { isValid: true };
    }
    if (trimmed.startsWith('+233') || trimmed.startsWith('233')) {
      if (digits.length < 12) {
        return {
          isValid: false,
          error: `Please complete the phone number (${digits.length}/12 digits for +233)`,
        };
      }
      if (digits.length > 12) {
        return {
          isValid: false,
          error: 'Please enter a valid Ghana international number (+233 24 000 0000)',
        };
      }
      return { isValid: true };
    }
    if (digits.length < 10) {
      return {
        isValid: false,
        error: `Please enter a complete telephone number (at least 10 digits, currently: ${digits.length})`,
      };
    }
    if (digits.length > 15) {
      return { isValid: false, error: 'Telephone number cannot exceed 15 digits' };
    }
    return { isValid: true };
  };

  const validateOrg = (val: string): { isValid: boolean; error?: string } => {
    const trimmed = val.trim();
    if (!trimmed) return { isValid: false, error: 'Bank or organization is required' };
    if (trimmed.length < 2) return { isValid: false, error: 'Please enter your bank or organization' };
    return { isValid: true };
  };

  // Phone input restrictions: block alphabets and disallowed characters
  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Home', 'End'].includes(e.key) ||
      (e.ctrlKey || e.metaKey)
    ) {
      return;
    }
    if (!/[\d+ ]/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    let sanitized = raw.replace(/[^\d+ ]/g, '');
    if (sanitized.includes('+')) {
      sanitized = (sanitized.startsWith('+') ? '+' : '') + sanitized.slice(sanitized.startsWith('+') ? 1 : 0).replace(/\+/g, '');
    }
    setPhone(sanitized);
  };

  const handleNameChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(/[0-9]/g, '');
    setter(sanitized);
  };

  // Step 3: Event Preferences
  const [attendanceType, setAttendanceType] = useState<AttendanceType>(
    () => savedDraft?.attendanceType || 'PHYSICAL'
  );
  const [dietaryRequirements, setDietaryRequirements] = useState(
    () => savedDraft?.dietaryRequirements || ''
  );
  const [specialAssistance, setSpecialAssistance] = useState(
    () => savedDraft?.specialAssistance || ''
  );

  // Payment & Success
  const [occupancy, setOccupancy] = useState<'SINGLE' | 'DOUBLE'>(
    () => savedDraft?.occupancy || 'SINGLE'
  );
  const [selectedMasterclass, setSelectedMasterclass] = useState<string>(
    () => savedDraft?.selectedMasterclass || 'Deploying AI to Combat Modern Fraud in International Trade Finance'
  );
  const [isPaystackOpen, setIsPaystackOpen] = useState(false);
  const [completedRegistration, setCompletedRegistration] = useState<Registration | null>(null);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [emailResentSuccess, setEmailResentSuccess] = useState(false);

  const handleResendEmail = async () => {
    if (!completedRegistration) return;
    setIsResendingEmail(true);
    try {
      await sendEmailNotification({
        to: completedRegistration.email,
        template: 'PAYMENT_CONFIRMATION',
        data: {
          attendeeName: `${completedRegistration.first_name} ${completedRegistration.last_name}`,
          eventTitle: event?.title || completedRegistration.event_title,
          eventDate: event?.start_date,
          eventVenue: event?.venue,
          registrationNumber: completedRegistration.registration_number,
          attendanceType: completedRegistration.attendance_type,
          amount: completedRegistration.total_amount,
          reference: completedRegistration.payment_reference,
          paymentMethod: completedRegistration.payment_method,
          ticketUrl: `${window.location.origin}/events/${event?.slug || '30th-national-banking-ethics-conference-2026'}/ticket/${completedRegistration.registration_number}`,
        },
      });
      setEmailResentSuccess(true);
      setTimeout(() => setEmailResentSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to resend confirmation email:', err);
    } finally {
      setIsResendingEmail(false);
    }
  };

  // Computed step validations
  const firstNameValidation = validateFirstName(firstName);
  const lastNameValidation = validateLastName(lastName);
  const emailValidation = validateEmail(email);
  const phoneValidation = validatePhone(phone);
  const orgValidation = validateOrg(organization);

  const isStep1Valid = Boolean(membershipCategory && privacyAgreed);
  const isStep2Valid =
    firstNameValidation.isValid &&
    lastNameValidation.isValid &&
    emailValidation.isValid &&
    phoneValidation.isValid &&
    orgValidation.isValid;
  const isStep3Valid = Boolean(attendanceType);
  const isStep4Valid = Boolean(occupancy);

  // Ensure the page stays at the top without scrolling the form up under the navbar
  const scrollToFormTop = React.useCallback(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  useEffect(() => {
    scrollToFormTop();
  }, [currentStep, scrollToFormTop]);

  // Persist form state so browser refresh retains the active step and inputs
  useEffect(() => {
    if (currentStep < 5) {
      sessionStorage.setItem(
        STORAGE_KEY_FORM,
        JSON.stringify({
          currentStep,
          selectedTierId: selectedTier?.id,
          membershipCategory,
          privacyAgreed,
          firstName,
          lastName,
          email,
          phone,
          organization,
          jobTitle,
          country,
          cibMemberId,
          attendanceType,
          dietaryRequirements,
          specialAssistance,
          occupancy,
          selectedMasterclass,
        })
      );
      const url = new URL(window.location.href);
      url.searchParams.set('step', currentStep.toString());
      window.history.replaceState({}, '', url.toString());
    } else {
      sessionStorage.removeItem(STORAGE_KEY_FORM);
      const url = new URL(window.location.href);
      url.searchParams.delete('step');
      window.history.replaceState({}, '', url.toString());
    }
  }, [
    currentStep,
    membershipCategory,
    privacyAgreed,
    firstName,
    lastName,
    email,
    phone,
    organization,
    jobTitle,
    country,
    cibMemberId,
    attendanceType,
    dietaryRequirements,
    specialAssistance,
    occupancy,
    selectedMasterclass,
    STORAGE_KEY_FORM,
  ]);

  if (!event) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-cib-charcoal-900">Event Not Found</h2>
        <Button variant="primary" size="md" onClick={() => navigate('/events')}>
          Browse Events
        </Button>
      </div>
    );
  }

  const packagePrice = occupancy === 'SINGLE' ? 5600 : 4000;
  const finalPayable = packagePrice;

  // Trigger celebration on step 5
  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0A5C36', '#D4AF37', '#C41230'],
    });
  };

  const handlePersonalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      organization: true,
    });
    if (!isStep2Valid) {
      return;
    }
    setCurrentStep(3);
  };

  const handlePreferencesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(4);
  };

  const handleFinalizeRegistration = (paymentMethod: 'PAYSTACK_CARD' | 'PAYSTACK_MOMO' | 'COMPLIMENTARY', ref?: string) => {
    const newReg = addRegistration({
      event_id: event.id,
      event_title: event.title,
      registration_type_id: occupancy === 'SINGLE' ? 'early-bird-single' : 'early-bird-double',
      registration_type_name: `${occupancy === 'SINGLE' ? 'Single' : 'Double'} Occupancy Package`,
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      organization,
      job_title: jobTitle || 'Delegate',
      country: country || 'Ghana',
      cib_member_id: cibMemberId || undefined,
      membership_category: membershipCategory,
      attendance_type: attendanceType,
      dietary_requirements: dietaryRequirements,
      special_assistance: `Masterclass: ${selectedMasterclass}`,
      total_amount: finalPayable,
      currency: 'GHS',
      payment_status: 'SUCCESSFUL',
      payment_reference: ref || `PAY_${Date.now()}`,
      payment_method: paymentMethod,
      check_in_status: 'REGISTERED',
    });

    // Send official payment receipt and digital ticket pass confirmation email
    sendEmailNotification({
      to: email,
      subject: `Payment Confirmed & Pass Issued: ${event.title} (Ref: ${newReg.registration_number})`,
      template: 'PAYMENT_CONFIRMATION',
      data: {
        attendeeName: `${firstName} ${lastName}`,
        eventTitle: event.title,
        eventDate: event.start_date,
        eventVenue: event.venue,
        registrationNumber: newReg.registration_number,
        attendanceType,
        amount: finalPayable,
        reference: ref || newReg.payment_reference,
        paymentMethod:
          paymentMethod === 'PAYSTACK_CARD'
            ? 'Debit/Credit Card (Paystack Gateway)'
            : paymentMethod === 'PAYSTACK_MOMO'
            ? 'Mobile Money (MTN / Telecel / AT)'
            : 'Complimentary VIP Pass',
        ticketUrl: `${window.location.origin}/events/${event.slug}/ticket/${newReg.registration_number}`,
      },
    });

    setCompletedRegistration(newReg);
    setRegisteredUserEmail(email);
    setRegisteredUserName(firstName);
    triggerConfetti();
    setCurrentStep(5);
  };

  const stepTitles = [
    'Category',
    'Your Details',
    'Attendance',
    'Payment',
    'Confirmation',
  ];

  return (
    <div className="min-h-screen relative py-10 sm:py-16 pb-20">
      {/* Fixed Full-Viewport Background - Stays static while form and footer scroll over it */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#032616]">
        <img
          src="/aqua-safari-register-banner.jpg"
          alt="Aqua Safari Resort, Ada - Venue"
          fetchPriority="high"
          loading="eager"
          decoding="sync"
          className="w-full h-full object-cover object-center brightness-100 contrast-100"
        />
        {/* Soft light overlay so the resort photo colors (pool, lights, chalets) show vividly */}
        <div className="absolute inset-0 bg-black/15" />
      </div>

      {/* Centered Main White Form Card (Solid White, No Round Edges) */}
      <div id="registration-container" className="max-w-4xl mx-auto px-3 sm:px-6 relative z-10 scroll-mt-24">
        <div className="bg-white rounded-none shadow-[0_20px_60px_rgba(0,0,0,0.35)] border border-slate-200 p-4 sm:p-8 md:p-10 space-y-6 sm:space-y-8">
          {/* Header Title Section inside the White Card */}
          <div className="space-y-2 text-center border-b border-slate-100 pb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-cib-charcoal-900 font-display">
              {event.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {event.venue} &bull; {event.start_date}
            </p>
          </div>

          {/* 5-Step Progress Indicator with Connecting Line Navigation */}
          {currentStep < 5 && (
            <div className="bg-slate-50/80 p-3 sm:p-5 border border-slate-200 relative">
              <div className="relative flex items-center justify-between">
                {/* Connecting Line Behind Circles */}
                <div className="absolute top-[18px] left-[10%] right-[10%] -translate-y-1/2 h-[2px] bg-slate-200 z-0">
                  <div
                    className="h-full bg-[#1B7E3E] transition-all duration-300 ease-out"
                    style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
                  />
                </div>

                {[1, 2, 3, 4, 5].map((step) => {
                  const isCompleted = currentStep > step;
                  const isCurrent = currentStep === step;

                  return (
                    <button
                      key={step}
                      type="button"
                      onClick={() => {
                        if (step === currentStep) return;
                        if (step < currentStep) {
                          setCurrentStep(step);
                        } else if (step === 2 && isStep1Valid) {
                          setCurrentStep(2);
                        } else if (step === 3 && isStep1Valid && isStep2Valid) {
                          setCurrentStep(3);
                        } else if (step === 4 && isStep1Valid && isStep2Valid && isStep3Valid) {
                          setCurrentStep(4);
                        }
                      }}
                      className="flex flex-col items-center flex-1 relative z-10 group focus:outline-none"
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 ${
                          isCompleted
                            ? 'bg-[#1B7E3E] text-white hover:bg-[#166632] ring-2 ring-white shadow-sm cursor-pointer'
                            : isCurrent
                            ? 'bg-[#1B7E3E] text-white ring-4 ring-[#1B7E3E]/20 ring-offset-1 shadow-sm'
                            : 'bg-white border-2 border-slate-300 text-slate-400 group-hover:border-slate-400'
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : step}
                      </div>
                      <span
                        className={`hidden sm:block text-[11px] font-semibold mt-2 text-center truncate max-w-[110px] transition-colors ${
                          isCurrent
                            ? 'text-[#1B7E3E] font-bold'
                            : isCompleted
                            ? 'text-slate-700 group-hover:text-[#1B7E3E]'
                            : 'text-slate-400'
                        }`}
                      >
                        {stepTitles[step - 1]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 1: MEMBERSHIP CATEGORY & PRIVACY NOTICE */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Question Heading */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800">
                  Which membership category best describes you?
                </h3>
              </div>

              {/* 4 Category Cards (2x2 Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                {[
                  { id: 'ACIB', title: 'ACIB', subtitle: 'Associate Member' },
                  { id: 'FCIB', title: 'FCIB', subtitle: 'Fellow' },
                  { id: 'Student', title: 'Student', subtitle: 'Student Member' },
                  { id: 'Non-Member', title: 'Non-Member', subtitle: 'Not yet a member' },
                ].map((item) => {
                  const isSelected = membershipCategory === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setMembershipCategory(item.id)}
                      className={`p-4 sm:p-6 rounded-none cursor-pointer transition-all duration-200 text-center border-0 outline-none ${
                        isSelected
                          ? 'bg-[#1B7E3E] text-white shadow-sm'
                          : 'bg-[#F1F3F5] text-slate-900 hover:bg-[#E8EAED]'
                      }`}
                    >
                      <div className={`text-base sm:text-lg font-black ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {item.title}
                      </div>
                      <div className={`text-xs sm:text-sm font-medium mt-1 ${isSelected ? 'text-white/85' : 'text-slate-500'}`}>
                        {item.subtitle}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PRIVACY NOTICE Box */}
              <div className="rounded-none border-0 bg-[#F1F3F5] p-5 sm:p-6 space-y-4">
                <div className="space-y-2">
                  <div className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    PRIVACY NOTICE
                  </div>
                  <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                    The information you provide is collected by the Chartered Institute of Bankers, Ghana (CIB Ghana) to process your registration and communicate with you about the 30th National Banking &amp; Ethics Conference. It is used solely for registration, communication and administration relating to the conference.
                  </p>
                </div>

                {/* Checkbox */}
                <label className="flex items-start gap-3 cursor-pointer select-none group pt-1">
                  <input
                    type="checkbox"
                    checked={privacyAgreed}
                    onChange={(e) => setPrivacyAgreed(e.target.checked)}
                    className="mt-0.5 sm:mt-1 w-4 h-4 rounded-none text-[#1B7E3E] focus:ring-0 border-0 cursor-pointer accent-[#1B7E3E]"
                  />
                  <span className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                    <strong className="font-bold text-slate-800">I acknowledge and agree</strong> that I have read the privacy notice above and understand that CIB Ghana will collect and process the information I provide for registration, communication and administration relating to the 30th National Banking &amp; Ethics Conference.
                  </span>
                </label>
              </div>

              {/* Continue CTA */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={!membershipCategory || !privacyAgreed}
                  onClick={() => setCurrentStep(2)}
                  className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 py-2.5 sm:px-7 sm:py-3.5 rounded-none font-bold text-xs sm:text-sm md:text-base transition-all shadow-md ${
                    membershipCategory && privacyAgreed
                      ? 'bg-[#1B7E3E] hover:bg-[#166632] text-white active:scale-95 cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span className="whitespace-nowrap">Continue<span className="hidden sm:inline"> to Your Details</span></span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] shrink-0" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PERSONAL INFORMATION (Filled, borderless inputs with icons matching user screenshot) */}
          {currentStep === 2 && (
            <form onSubmit={handlePersonalSubmit} className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-cib-charcoal-900 font-display">
                  Your Details
                </h2>
                <p className="text-xs text-slate-500">
                  Please provide your contact information for the event pass.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    First Name *
                  </label>
                  <div
                    className={`relative flex items-center bg-[#F1F3F5] rounded-none px-3.5 py-3 transition-all ${
                      touched.firstName && !firstNameValidation.isValid
                        ? 'ring-2 ring-rose-500 bg-rose-50/40'
                        : 'focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1B7E3E]'
                    }`}
                  >
                    <User className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
                    <input
                      type="text"
                      required
                      value={firstName}
                      onBlur={() => markTouched('firstName')}
                      onChange={handleNameChange(setFirstName)}
                      placeholder="Kwesi"
                      className="w-full bg-transparent border-none outline-none text-base sm:text-sm text-slate-800 placeholder:text-slate-400 p-0 focus:ring-0"
                    />
                    {firstNameValidation.isValid && (
                      <CheckCircle2 className="w-4 h-4 text-[#1B7E3E] shrink-0 ml-1.5" />
                    )}
                  </div>
                  {touched.firstName && !firstNameValidation.isValid && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{firstNameValidation.error}</span>
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Last Name *
                  </label>
                  <div
                    className={`relative flex items-center bg-[#F1F3F5] rounded-none px-3.5 py-3 transition-all ${
                      touched.lastName && !lastNameValidation.isValid
                        ? 'ring-2 ring-rose-500 bg-rose-50/40'
                        : 'focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1B7E3E]'
                    }`}
                  >
                    <User className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
                    <input
                      type="text"
                      required
                      value={lastName}
                      onBlur={() => markTouched('lastName')}
                      onChange={handleNameChange(setLastName)}
                      placeholder="Mensah"
                      className="w-full bg-transparent border-none outline-none text-base sm:text-sm text-slate-800 placeholder:text-slate-400 p-0 focus:ring-0"
                    />
                    {lastNameValidation.isValid && (
                      <CheckCircle2 className="w-4 h-4 text-[#1B7E3E] shrink-0 ml-1.5" />
                    )}
                  </div>
                  {touched.lastName && !lastNameValidation.isValid && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{lastNameValidation.error}</span>
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Email Address *
                  </label>
                  <div
                    className={`relative flex items-center bg-[#F1F3F5] rounded-none px-3.5 py-3 transition-all ${
                      touched.email && !emailValidation.isValid
                        ? 'ring-2 ring-rose-500 bg-rose-50/40'
                        : 'focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1B7E3E]'
                    }`}
                  >
                    <Mail className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onBlur={() => markTouched('email')}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="kwesi.mensah@bank.com"
                      className="w-full bg-transparent border-none outline-none text-base sm:text-sm text-slate-800 placeholder:text-slate-400 p-0 focus:ring-0"
                    />
                    {emailValidation.isValid && (
                      <CheckCircle2 className="w-4 h-4 text-[#1B7E3E] shrink-0 ml-1.5" />
                    )}
                  </div>
                  {touched.email && !emailValidation.isValid && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{emailValidation.error}</span>
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Phone Number (Digits only) *
                  </label>
                  <div
                    className={`relative flex items-center bg-[#F1F3F5] rounded-none px-3.5 py-3 transition-all ${
                      (touched.phone || phone.length > 0) && !phoneValidation.isValid
                        ? 'ring-2 ring-rose-500 bg-rose-50/40'
                        : 'focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1B7E3E]'
                    }`}
                  >
                    <Phone className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
                    <input
                      type="tel"
                      inputMode="numeric"
                      required
                      value={phone}
                      onKeyDown={handlePhoneKeyDown}
                      onBlur={() => markTouched('phone')}
                      onChange={handlePhoneChange}
                      placeholder="055 000 0000 or +233 24 000 0000"
                      className="w-full bg-transparent border-none outline-none text-base sm:text-sm text-slate-800 placeholder:text-slate-400 p-0 focus:ring-0"
                    />
                    {phoneValidation.isValid && (
                      <CheckCircle2 className="w-4 h-4 text-[#1B7E3E] shrink-0 ml-1.5" />
                    )}
                  </div>
                  {((touched.phone || phone.length > 0) && !phoneValidation.isValid) && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{phoneValidation.error}</span>
                    </p>
                  )}
                  {phoneValidation.isValid && (
                    <p className="text-[11px] font-semibold text-[#1B7E3E] mt-1 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>Complete valid telephone number</span>
                    </p>
                  )}
                </div>

                {/* Bank / Organization */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Bank / Organization *
                  </label>
                  <div
                    className={`relative flex items-center bg-[#F1F3F5] rounded-none px-3.5 py-3 transition-all ${
                      touched.organization && !orgValidation.isValid
                        ? 'ring-2 ring-rose-500 bg-rose-50/40'
                        : 'focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1B7E3E]'
                    }`}
                  >
                    <Building className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
                    <input
                      type="text"
                      required
                      value={organization}
                      onBlur={() => markTouched('organization')}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="e.g. Standard Chartered Bank Ghana"
                      className="w-full bg-transparent border-none outline-none text-base sm:text-sm text-slate-800 placeholder:text-slate-400 p-0 focus:ring-0"
                    />
                    {orgValidation.isValid && (
                      <CheckCircle2 className="w-4 h-4 text-[#1B7E3E] shrink-0 ml-1.5" />
                    )}
                  </div>
                  {touched.organization && !orgValidation.isValid && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{orgValidation.error}</span>
                    </p>
                  )}
                </div>

                {selectedTier?.name?.toLowerCase().includes('member') && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">
                      CIB Ghana Membership PIN (Optional)
                    </label>
                    <div className="relative flex items-center bg-[#F1F3F5] rounded-none px-3.5 py-3 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-cib-green-600">
                      <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
                      <input
                        type="text"
                        value={cibMemberId}
                        onChange={(e) => setCibMemberId(e.target.value)}
                        placeholder="e.g. ACIB-2021-0492"
                        className="w-full bg-transparent border-none outline-none text-base sm:text-sm text-slate-800 placeholder:text-slate-400 p-0 focus:ring-0"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-5 sm:py-2.5 rounded-none text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={!isStep2Valid}
                  className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 py-2.5 sm:px-7 sm:py-3.5 rounded-none font-bold text-xs sm:text-sm md:text-base transition-all shadow-md ${
                    isStep2Valid
                      ? 'bg-[#1B7E3E] hover:bg-[#166632] text-white active:scale-95 cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span className="whitespace-nowrap">Continue<span className="hidden sm:inline"> to Preferences</span></span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] shrink-0" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: EVENT INFORMATION & ATTENDANCE MODE (Borderless filled cards) */}
          {currentStep === 3 && (
            <form onSubmit={handlePreferencesSubmit} className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-cib-charcoal-900 font-display">
                  Attendance Mode
                </h2>
                <p className="text-xs text-slate-500">
                  Select how you will participate in the sessions.
                </p>
              </div>

              {/* Attendance Type Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'PHYSICAL', title: 'In-Person Attendance', desc: 'Join onsite at the conference venue in Accra.' },
                  { id: 'VIRTUAL', title: 'Virtual Livestream', desc: 'Access high-definition livestream broadcast & Q&A.' },
                ].map((item) => {
                  const isSelected = attendanceType === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setAttendanceType(item.id as AttendanceType)}
                      className={`p-4 rounded-none cursor-pointer transition-all flex items-start gap-3 border-none outline-none ${
                        isSelected
                          ? 'bg-[#E5F5EB] shadow-sm'
                          : 'bg-[#F1F3F5] hover:bg-[#E8EAED]'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                          isSelected ? 'bg-cib-green-700 text-white' : 'bg-slate-300'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div className="space-y-1">
                        <h4 className={`text-sm font-bold ${isSelected ? 'text-cib-green-950' : 'text-slate-900'}`}>
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-500">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-5 sm:py-2.5 rounded-none text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 py-2.5 sm:px-7 sm:py-3.5 rounded-none font-bold text-xs sm:text-sm md:text-base transition-all shadow-md bg-[#1B7E3E] hover:bg-[#166632] text-white active:scale-95 cursor-pointer"
                >
                  <span className="whitespace-nowrap">Continue<span className="hidden sm:inline"> to Payment</span></span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] shrink-0" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: ACCOMMODATION & EVENT PACKAGES (PAYMENT STAGE) */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Header Title & Subtitle */}
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-[26px] font-black text-slate-900 font-display">
                  Accommodation &amp; Event Packages
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Accommodation for two nights, conference and Masterclass fee, dinner for 2 nights and other complimentary activities.
                </p>
              </div>

              {/* Early Bird Package Yellow Highlight Box */}
              <div className="rounded-none border-0 bg-[#FFFDF0] p-4 sm:p-5 space-y-1">
                <div className="text-xs sm:text-sm font-black text-[#A16207] uppercase tracking-wide">
                  EARLY BIRD PACKAGE &mdash; DEADLINE 20TH OCTOBER 2026
                </div>
                <div className="text-xs sm:text-[13px] text-slate-600 font-medium">
                  Book before the deadline to lock in the discounted rate.
                </div>
              </div>

              {/* Choose your occupancy */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-800">
                  Choose your occupancy
                </h3>
                <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
                  {/* Single Occupancy */}
                  <div
                    onClick={() => setOccupancy('SINGLE')}
                    className={`p-5 rounded-none cursor-pointer transition-all duration-200 text-center border-0 outline-none ${
                      occupancy === 'SINGLE'
                        ? 'bg-[#1B7E3E] text-white shadow-sm'
                        : 'bg-[#F1F3F5] text-slate-900 hover:bg-[#E8EAED]'
                    }`}
                  >
                    <div className={`text-sm sm:text-base font-black ${occupancy === 'SINGLE' ? 'text-white' : 'text-slate-900'}`}>
                      Single Occupancy
                    </div>
                    <div className={`text-xs sm:text-sm font-semibold mt-1 ${occupancy === 'SINGLE' ? 'text-white/85' : 'text-slate-500'}`}>
                      GHS 5,600
                    </div>
                  </div>

                  {/* Double Occupancy */}
                  <div
                    onClick={() => setOccupancy('DOUBLE')}
                    className={`p-5 rounded-none cursor-pointer transition-all duration-200 text-center border-0 outline-none ${
                      occupancy === 'DOUBLE'
                        ? 'bg-[#1B7E3E] text-white shadow-sm'
                        : 'bg-[#F1F3F5] text-slate-900 hover:bg-[#E8EAED]'
                    }`}
                  >
                    <div className={`text-sm sm:text-base font-black ${occupancy === 'DOUBLE' ? 'text-white' : 'text-slate-900'}`}>
                      Double Occupancy
                    </div>
                    <div className={`text-xs sm:text-sm font-semibold mt-1 ${occupancy === 'DOUBLE' ? 'text-white/85' : 'text-slate-500'}`}>
                      GHS 4,000
                    </div>
                  </div>
                </div>
              </div>

              {/* Kindly select your preferred Masterclass */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-800">
                  Kindly select your preferred Masterclass
                </h3>
                <div className="space-y-2.5">
                  {[
                    'Deploying AI to Combat Modern Fraud in International Trade Finance',
                    'Cybersecurity and Fraud Detection',
                    'Virtual Assets and Impact',
                  ].map((option) => {
                    const isSelected = selectedMasterclass === option;
                    return (
                      <div
                        key={option}
                        onClick={() => setSelectedMasterclass(option)}
                        className={`flex items-center gap-3.5 p-4 rounded-none cursor-pointer transition-all border-0 outline-none ${
                          isSelected
                            ? 'bg-[#E5F5EB] shadow-sm'
                            : 'bg-[#F1F3F5] hover:bg-[#E8EAED]'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? 'bg-[#1B7E3E] text-white' : 'bg-slate-300'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className={`text-xs sm:text-sm font-semibold leading-snug ${isSelected ? 'text-[#1B7E3E] font-bold' : 'text-slate-800'}`}>
                          {option}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total Bar */}
              <div className="flex items-center justify-between p-4 sm:p-5 rounded-none bg-[#F1F3F5] border-0">
                <span className="text-sm font-bold text-slate-700">Total</span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  GHS {finalPayable.toLocaleString()}
                </span>
              </div>

              {/* Proceed to Payment CTA */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPaystackOpen(true)}
                  className="w-full py-2.5 sm:py-3.5 rounded-none bg-[#1B7E3E] hover:bg-[#166632] active:scale-[0.99] text-white font-bold text-xs sm:text-sm md:text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                </button>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors inline-flex items-center gap-1 py-1"
                  >
                    <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>Back to Attendance</span>
                  </button>
                </div>
              </div>
            </div>
          )}


          {/* STEP 5: REGISTRATION SUCCESSFUL */}
          {currentStep === 5 && completedRegistration && (
            <div className="text-center space-y-6 py-4 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 rounded-full bg-emerald-50 text-[#1B7E3E] border-2 border-emerald-200 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-cib-gold-600">
                  PAYMENT & ACCREDITATION CONFIRMED
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-cib-charcoal-900 font-display">
                  Thank You for Registering!
                </h2>
                <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
                  Your seat at the <strong>{event.title}</strong> is secured. An official payment confirmation receipt and digital QR badge pass have been dispatched to <strong>{completedRegistration.email}</strong>.
                </p>
              </div>

              {/* Payment Receipt Summary Card */}
              <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Official Pass Number</span>
                  <span className="text-base font-mono font-black text-[#1B7E3E] tracking-wider">
                    {completedRegistration.registration_number}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-500 font-medium">Amount Paid:</span>
                  <span className="font-bold text-slate-900">
                    GHS {Number(completedRegistration.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-500 font-medium">Payment Reference:</span>
                  <span className="font-mono font-semibold text-slate-700 text-xs">
                    {completedRegistration.payment_reference || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-500 font-medium">Payment Status:</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    PAID / SETTLED
                  </span>
                </div>
              </div>

              {/* Email Delivery Banner & Resend Action */}
              <div className="max-w-md mx-auto bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-xs sm:text-sm text-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-left">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold block">Confirmation Email Sent</span>
                    <span className="text-slate-600 text-xs">Please check your inbox or spam folder</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isResendingEmail}
                  onClick={handleResendEmail}
                  className="px-3 py-1.5 rounded-lg bg-white border border-emerald-300 hover:bg-emerald-100/50 text-emerald-900 text-xs font-bold transition-all disabled:opacity-50 shrink-0 cursor-pointer"
                >
                  {isResendingEmail ? 'Sending...' : emailResentSuccess ? 'Sent ✓' : 'Resend Email'}
                </button>
              </div>

              {/* Ticket Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/events/${event.slug}/ticket/${completedRegistration.registration_number}`)
                  }
                  className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 py-2.5 sm:px-6 sm:py-3 rounded-none font-bold text-xs sm:text-sm md:text-base transition-all shadow-md bg-[#1B7E3E] hover:bg-[#166632] text-white active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <TicketIcon className="w-4 h-4 shrink-0" />
                  <span>View Digital Ticket Pass</span>
                </button>

                <a
                  href={`/api/emails/preview/${completedRegistration.registration_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-none border border-blue-200 text-blue-700 bg-blue-50/60 hover:bg-blue-100 font-bold text-xs sm:text-sm transition-colors whitespace-nowrap"
                  title="Open the exact HTML email dispatched to your inbox"
                >
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span>Preview Dispatched Email</span>
                </a>

                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-none border border-slate-200 hover:border-slate-300 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
                >
                  Go to Delegate Portal
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Paystack Checkout Simulator Modal */}
      {isPaystackOpen && (
        <PaystackModal
          isOpen={isPaystackOpen}
          onClose={() => setIsPaystackOpen(false)}
          amount={finalPayable}
          currency="GHS"
          email={email}
          eventTitle={event.title}
          registrationId={`reg-${Date.now()}`}
          onSuccess={(tx) => {
            setIsPaystackOpen(false);
            handleFinalizeRegistration(
              tx.channel === 'card' ? 'PAYSTACK_CARD' : 'PAYSTACK_MOMO',
              tx.reference
            );
          }}
        />
      )}
    </div>
  );
};

