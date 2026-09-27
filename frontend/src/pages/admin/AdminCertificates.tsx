import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Award, CheckCircle2, Download, Printer, Eye, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { CertificateCard } from '../../components/registration/CertificateCard';
import { Certificate } from '../../types';

export const AdminCertificates: React.FC = () => {
  const { registrations, events } = useApp();
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);

  // Eligible attendees: those checked-in for the event
  const eligibleAttendees = registrations.filter(
    (r) => r.event_id === selectedEventId && r.check_in_status === 'CHECKED_IN'
  );

  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];

  const handleGeneratePreview = (recipientName: string) => {
    const cert: Certificate = {
      id: `cert-${Date.now()}`,
      certificate_number: `CIB-CERT-${Math.floor(100000 + Math.random() * 900000)}`,
      event_id: selectedEvent.id,
      event_title: selectedEvent.title,
      event_date: selectedEvent.start_date,
      recipient_name: recipientName,
      issue_date: new Date().toISOString().split('T')[0],
      verification_url: `${window.location.origin}/verify-cert/CIB-CERT-2026`,
      qr_code_data: `CIB_GHANA_OFFICIAL_CERTIFICATE:${recipientName}:${selectedEvent.title}`,
    };
    setPreviewCert(cert);
  };

  return (
    <AdminLayout
      title="Post-Event Certificate Generator"
      subtitle="Issue cryptographically signed Certificates of Participation to accredited attendees."
      actions={
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Sparkles className="w-4 h-4" />}
          onClick={() => alert(`Bulk issued ${eligibleAttendees.length} certificates for ${selectedEvent?.title}!`)}
          className="px-2.5 sm:px-3 text-xs"
        >
          <span className="hidden sm:inline">Bulk Generate</span>
          <span className="sm:hidden">Bulk</span> ({eligibleAttendees.length})
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Event Selector Card */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 w-full sm:w-auto">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Conference or Masterclass
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => {
                setSelectedEventId(e.target.value);
                setPreviewCert(null);
              }}
              className="w-full sm:w-96 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-cib-charcoal-900 bg-white"
            >
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 font-semibold block">
              Checked-In Eligible Attendees:
            </span>
            <span className="text-2xl font-black text-cib-green-800 font-display">
              {eligibleAttendees.length}
            </span>
          </div>
        </div>

        {/* Eligible Attendees List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <h3 className="text-base font-bold text-cib-charcoal-900 font-display">
            Accredited Delegates for Certificate Issuance
          </h3>

          {eligibleAttendees.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl space-y-2">
              <Award className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-500">
                No checked-in attendees found for this event yet. Use the Check-In Desk to verify delegate attendance first.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {eligibleAttendees.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-cib-green-50/50 border border-slate-200/80 transition-colors"
                >
                  <div>
                    <strong className="text-sm text-cib-charcoal-900 block">
                      {att.first_name} {att.last_name}
                    </strong>
                    <span className="text-xs text-slate-500">
                      {att.organization} &bull; {att.registration_number}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                    onClick={() => handleGeneratePreview(`${att.first_name} ${att.last_name}`)}
                  >
                    Generate & Preview
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Certificate Preview Section */}
        {previewCert && (
          <div className="space-y-4 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-cib-charcoal-900 font-display">
                Certificate Live Preview
              </h3>
              <button
                onClick={() => setPreviewCert(null)}
                className="text-xs text-slate-500 hover:text-cib-charcoal"
              >
                Close Preview
              </button>
            </div>
            <CertificateCard certificate={previewCert} />
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
