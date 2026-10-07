import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TicketCard } from '../components/registration/TicketCard';
import { DigitalTicket, Registration } from '../types';
import { ArrowLeft, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ApiClient } from '../lib/api';

export const Ticket: React.FC = () => {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const navigate = useNavigate();
  const { getRegistrationByNumber, getEventBySlug, registrations, refreshRegistrations } = useApp();
  const [fetchedReg, setFetchedReg] = useState<Registration | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const cleanId = (id || '').trim().toLowerCase();

  // Find registration either by registration_number, id, or payment_reference
  const registration =
    fetchedReg ||
    (id && getRegistrationByNumber(id)) ||
    registrations.find(
      (r) =>
        r.id?.toLowerCase() === cleanId ||
        r.registration_number?.toLowerCase() === cleanId ||
        (r.payment_reference && r.payment_reference.toLowerCase() === cleanId)
    );

  const event = slug ? getEventBySlug(slug) : undefined;

  useEffect(() => {
    if (!registration && id) {
      setLoading(true);
      ApiClient.getRegistration(id)
        .then((res) => {
          if (res.success && res.data?.registration) {
            setFetchedReg(res.data.registration);
          }
        })
        .catch(() => {
          refreshRegistrations().catch(() => {});
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, registration]);

  if (loading && !registration) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center space-y-4 px-4 text-slate-800">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#1B7E3E] flex items-center justify-center mx-auto animate-spin">
          <RefreshCw className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold font-display text-slate-900">Retrieving Delegate Pass...</h2>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center space-y-4 px-4">
        <h2 className="text-2xl font-bold text-cib-charcoal-900 font-display">
          Ticket Not Found
        </h2>
        <p className="text-sm text-slate-600">
          The requested delegate pass reference ({id}) could not be located in the CIB credential registry.
        </p>
        <Button variant="primary" size="md" onClick={() => navigate('/events')}>
          Browse Events
        </Button>
      </div>
    );
  }

  // Construct DigitalTicket object
  const ticket: DigitalTicket = {
    id: `tkt-${registration.id}`,
    registration_id: registration.id,
    registration_number: registration.registration_number,
    event_id: registration.event_id,
    event_title: registration.event_title,
    event_date: event?.start_date || 'Conference Dates',
    event_venue: event?.venue || 'Accra, Ghana',
    attendee_name: `${registration.first_name} ${registration.last_name}`,
    attendee_email: registration.email,
    organization: registration.organization,
    registration_tier: registration.registration_type_name,
    attendance_type: registration.attendance_type,
    qr_code_data: JSON.stringify({
      regNumber: registration.registration_number,
      name: `${registration.first_name} ${registration.last_name}`,
      event: registration.event_title,
      tier: registration.registration_type_name,
      status: registration.check_in_status,
    }),
    security_hash: `SHA256_${registration.registration_number}`,
    issue_date: registration.created_at,
    check_in_status: registration.check_in_status,
  };

  return (
    <div className="min-h-screen relative py-10 sm:py-16 pb-24">
      {/* Fixed Full-Viewport Background - Stays static while ticket pass and footer scroll over it */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#032616]">
        <img
          src="/aqua-safari-ticket-bg.jpg"
          alt="Aqua Safari Resort, Ada - Venue"
          fetchPriority="high"
          loading="eager"
          decoding="sync"
          className="w-full h-full object-cover object-center brightness-100 contrast-100"
        />
        {/* Soft light overlay so the resort photo colors show vividly */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 relative z-10 space-y-6">
        {/* Top Banner / Actions */}
        <div className="flex items-center justify-between no-print">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-md rounded-none text-xs font-bold text-slate-900 hover:bg-white shadow-md transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-[#008129]" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 bg-white/95 backdrop-blur-md px-4 py-2 rounded-none shadow-md">
            <ShieldCheck className="w-4 h-4 text-[#008129]" />
            <span>Accredited CIB Pass</span>
          </div>
        </div>

        {/* 2-Column Side-by-Side Arrangement (Left: Info Shape, Right: Ticket) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Shape on Left Side */}
          <div className="lg:col-span-5 space-y-6 no-print">
            <div className="bg-white rounded-none p-7 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.3)] space-y-4 text-left">
              <span className="text-[11px] font-black uppercase tracking-widest text-[#008129]">
                DELEGATE ACCREDITATION
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display leading-tight">
                Your Digital Event Ticket
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Please present this digital pass on your smartphone or bring a printed copy to the check-in desk at the venue.
              </p>

              <div className="pt-4 border-t border-slate-100 space-y-3 text-xs text-slate-700">
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Attendee</span>
                  <span className="font-bold text-slate-900">{ticket.attendee_name}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-t border-slate-100">
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Reference</span>
                  <span className="font-mono font-bold text-[#008129]">{ticket.registration_number}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-t border-slate-100">
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Access Tier</span>
                  <span className="font-bold text-slate-900">{ticket.registration_tier}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-t border-slate-100">
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Status</span>
                  <span className="inline-flex items-center gap-1 font-bold text-[#008129]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified & Confirmed
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Ticket Card on the Other Side */}
          <div className="lg:col-span-7 flex justify-center lg:justify-start">
            <div className="w-full max-w-md">
              <TicketCard ticket={ticket} showActions={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
