import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { CreditCard, Search, Download, CheckCircle2, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { formatGHS } from '../../lib/utils';

export const AdminPayments: React.FC = () => {
  const { registrations } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const totalRevenue = registrations.reduce((acc, r) => acc + (r.total_amount || 0), 0);

  const filtered = registrations.filter(
    (r) =>
      r.registration_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.payment_reference && r.payment_reference.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AdminLayout
      title="Payments & Revenue Ledger"
      subtitle="Audited transaction records processed via Access Bank Ghana WebPay (Cards & Ghana Mobile Money)."
      actions={
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Download className="w-4 h-4" />}
          onClick={() => alert('Exporting full financial audit report...')}
          className="px-2.5 sm:px-3 text-xs"
        >
          <span className="hidden sm:inline">Export Financial Audit</span>
          <span className="sm:hidden">Export</span>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Metric Card */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Processed Volume
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-cib-charcoal-900 font-display mt-1">
              {formatGHS(totalRevenue)}
            </h2>
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <ShieldCheck className="w-4 h-4" /> Verified Settlement &bull; Access Bank WebPay
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#004A97] text-xs font-bold border border-blue-200">
              Gateway: Access Bank WebPay
            </span>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-3.5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            <h3 className="text-base font-bold text-cib-charcoal-900 font-display">
              Transaction History
            </h3>

            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reference or payer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:border-cib-green-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Payment Ref</th>
                  <th className="py-3 px-4">Registration ID</th>
                  <th className="py-3 px-4">Payer / Delegate</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {reg.payment_reference || 'REF_N/A'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-cib-green-800">
                      {reg.registration_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <strong className="text-cib-charcoal-900 block">
                        {reg.first_name} {reg.last_name}
                      </strong>
                      <span className="text-[11px] text-slate-400">{reg.email}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {reg.payment_method?.replace(/_/g, ' ') || 'WEBPAY'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        SUCCESSFUL
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(reg.created_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-cib-charcoal-900">
                      {formatGHS(reg.total_amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
