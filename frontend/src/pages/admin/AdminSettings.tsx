import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Database, Key, Mail, Shield, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { checkSupabaseConnection, isSupabaseConfigured } from '../../lib/supabase';
import { ACCESS_WEBPAY_MERCHANT_ID, ACCESS_WEBPAY_GATEWAY_URL } from '../../lib/payments';

export const AdminSettings: React.FC = () => {
  const [dbStatus, setDbStatus] = useState<{ loading: boolean; connected: boolean; message: string }>({
    loading: false,
    connected: false,
    message: '',
  });

  const testDb = async () => {
    setDbStatus({ loading: true, connected: false, message: 'Testing connection to PostgreSQL...' });
    const res = await checkSupabaseConnection();
    setDbStatus({ loading: false, connected: res.connected, message: res.message });
  };

  useEffect(() => {
    testDb();
  }, []);

  return (
    <AdminLayout
      title="System & Integration Settings"
      subtitle="Configure Supabase PostgreSQL, Access Bank Ghana WebPay gateway parameters, and transactional mail relays."
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Supabase PostgreSQL Configuration */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cib-green-50 text-cib-green-800">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-cib-charcoal-900 font-display">
                  Supabase Database Connection
                </h3>
                <p className="text-xs text-slate-500">PostgreSQL + Row Level Security (RLS) policies</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${dbStatus.loading ? 'animate-spin' : ''}`} />}
              onClick={testDb}
              disabled={dbStatus.loading}
            >
              Test Connection
            </Button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2">
              {dbStatus.connected ? (
                <CheckCircle2 className="w-5 h-5 text-cib-green-700 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              )}
              <span className="text-xs font-bold text-cib-charcoal-900">
                {dbStatus.connected ? 'Live PostgreSQL Connected' : 'Offline Reactive Store Active'}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {dbStatus.message}
            </p>
            <div className="text-[11px] text-slate-400 font-mono">
              Database schema file available at: <span className="text-cib-green-800 font-bold">supabase/schema.sql</span>
            </div>
          </div>
        </div>

        {/* Access Bank Ghana WebPay Payment Gateway */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cib-gold-50 text-cib-gold-700">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-cib-charcoal-900 font-display">
                Access Bank Ghana WebPay Gateway Configuration
              </h3>
              <p className="text-xs text-slate-500">Merchant settlement & callback credentials for Ghana cedis (GHS)</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Access Bank Merchant ID (VITE_ACCESS_WEBPAY_MERCHANT_ID)
              </label>
              <input
                type="text"
                readOnly
                value={ACCESS_WEBPAY_MERCHANT_ID}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50 text-slate-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Access Bank WebPay Gateway URL (VITE_ACCESS_WEBPAY_GATEWAY_URL)
              </label>
              <input
                type="text"
                readOnly
                value={ACCESS_WEBPAY_GATEWAY_URL}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50 text-slate-600 focus:outline-none"
              />
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
              <div>
                <span className="font-bold">Gateway Status:</span> Configured for Access Bank Ghana WebPay
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white uppercase">
                Active
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              Supports Ghana Mobile Money (MTN MoMo, Telecel Cash, AT Money) and Visa / Mastercard debit & credit cards through Access Bank Ghana PLC.
            </p>
          </div>
        </div>

        {/* Transactional Email Service */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-cib-charcoal-900 font-display">
                Transactional Email Service (Resend / SMTP)
              </h3>
              <p className="text-xs text-slate-500">Automated registration receipts, QR pass notifications, and reminders</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
            <p className="font-bold text-cib-charcoal-900">Configured Notification Triggers:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>Instant Registration Confirmation & Digital Badge Pass</li>
              <li>Access Bank Ghana WebPay Transaction Receipt & VAT breakdown</li>
              <li>7-Day & 24-Hour Event Agenda Reminders</li>
              <li>Emergency Rescheduling & Cancellation Circulars</li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
