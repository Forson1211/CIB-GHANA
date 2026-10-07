import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { CreditCard, Search, Download, ShieldCheck, Smartphone, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { formatGHS } from '../../lib/utils';
import { PaymentChannelBadge, getPaymentChannelInfo } from '../../components/payment/PaymentChannelBadge';

export const AdminPayments: React.FC = () => {
  const { registrations } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<'ALL' | 'MTN' | 'TELECEL' | 'AT' | 'CARD'>('ALL');

  const successfulRegistrations = registrations.filter((r) => r.payment_status === 'SUCCESSFUL');
  const totalRevenue = successfulRegistrations.reduce((acc, r) => acc + (r.total_amount || 0), 0);

  // Breakdown statistics by payment channel & network for confirmed settlements
  const mtnTransactions = successfulRegistrations.filter((r) => {
    const info = getPaymentChannelInfo(r.payment_method, r.phone);
    return info.network === 'MTN';
  });
  const mtnRevenue = mtnTransactions.reduce((acc, r) => acc + (r.total_amount || 0), 0);

  const telecelTransactions = successfulRegistrations.filter((r) => {
    const info = getPaymentChannelInfo(r.payment_method, r.phone);
    return info.network === 'TELECEL';
  });
  const telecelRevenue = telecelTransactions.reduce((acc, r) => acc + (r.total_amount || 0), 0);

  const atTransactions = successfulRegistrations.filter((r) => {
    const info = getPaymentChannelInfo(r.payment_method, r.phone);
    return info.network === 'AT';
  });
  const atRevenue = atTransactions.reduce((acc, r) => acc + (r.total_amount || 0), 0);

  const cardTransactions = successfulRegistrations.filter((r) => {
    const info = getPaymentChannelInfo(r.payment_method, r.phone);
    return info.type === 'CARD';
  });
  const cardRevenue = cardTransactions.reduce((acc, r) => acc + (r.total_amount || 0), 0);

  const filtered = registrations.filter((r) => {
    const info = getPaymentChannelInfo(r.payment_method, r.phone);
    const matchesChannel =
      channelFilter === 'ALL' ||
      (channelFilter === 'MTN' && info.network === 'MTN') ||
      (channelFilter === 'TELECEL' && info.network === 'TELECEL') ||
      (channelFilter === 'AT' && info.network === 'AT') ||
      (channelFilter === 'CARD' && info.type === 'CARD');

    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      q === '' ||
      r.registration_number.toLowerCase().includes(q) ||
      r.first_name.toLowerCase().includes(q) ||
      r.last_name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      (r.phone && r.phone.toLowerCase().includes(q)) ||
      (r.payment_reference && r.payment_reference.toLowerCase().includes(q)) ||
      info.label.toLowerCase().includes(q);

    return matchesChannel && matchesQuery;
  });

  const exportCSV = () => {
    const headers = [
      'Payment Reference',
      'Registration ID',
      'Payer Name',
      'Email',
      'Phone / Wallet',
      'Payment Channel',
      'Network',
      'Amount (GHS)',
      'Status',
      'Date & Time',
    ];

    const rows = filtered.map((r) => {
      const info = getPaymentChannelInfo(r.payment_method, r.phone);
      return [
        r.payment_reference || 'N/A',
        r.registration_number,
        `"${r.first_name} ${r.last_name}"`,
        r.email,
        r.phone || 'N/A',
        info.type,
        info.label,
        r.total_amount,
        r.payment_status,
        new Date(r.created_at).toLocaleString(),
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CIB_Ghana_Payments_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout
      title="Payments & Revenue Ledger"
      subtitle="Audited transaction records processed via Access Bank Ghana WebPay (Cards & Ghana Mobile Money: MTN, Telecel, AT)."
      actions={
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Download className="w-4 h-4" />}
          onClick={exportCSV}
          className="px-2.5 sm:px-3 text-xs cursor-pointer"
        >
          <span className="hidden sm:inline">Export Financial Audit</span>
          <span className="sm:hidden">Export</span>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* 1. Total Volume */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Processed
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display mt-1">
                {formatGHS(totalRevenue)}
              </h2>
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{registrations.length} Total Txns</span>
            </p>
          </div>

          {/* 2. MTN MoMo */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                MTN MoMo
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFCC00]" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 font-display mt-1">
              {formatGHS(mtnRevenue)}
            </h2>
            <span className="text-[11px] text-slate-500 font-medium mt-1">
              {mtnTransactions.length} Settlements
            </span>
          </div>

          {/* 3. Telecel Cash */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
                Telecel Cash
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#E60000]" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 font-display mt-1">
              {formatGHS(telecelRevenue)}
            </h2>
            <span className="text-[11px] text-slate-500 font-medium mt-1">
              {telecelTransactions.length} Settlements
            </span>
          </div>

          {/* 4. AT Money */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 block">
                AT Money
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#0055A5]" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 font-display mt-1">
              {formatGHS(atRevenue)}
            </h2>
            <span className="text-[11px] text-slate-500 font-medium mt-1">
              {atTransactions.length} Settlements
            </span>
          </div>

          {/* 5. Bank Cards */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                Visa &bull; Mastercard
              </span>
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 font-display mt-1">
              {formatGHS(cardRevenue)}
            </h2>
            <span className="text-[11px] text-slate-500 font-medium mt-1">
              {cardTransactions.length} Settlements
            </span>
          </div>
        </div>

        {/* Transactions Table & Filters */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-3.5 sm:p-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              {[
                { id: 'ALL', label: 'All Channels' },
                { id: 'MTN', label: 'MTN MoMo' },
                { id: 'TELECEL', label: 'Telecel Cash' },
                { id: 'AT', label: 'AT Money' },
                { id: 'CARD', label: 'Cards (Visa/MC)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setChannelFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    channelFilter === tab.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ref, delegate, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:border-cib-green-600 focus:outline-none bg-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Payment Ref</th>
                  <th className="py-3 px-4">Pass Number</th>
                  <th className="py-3 px-4">Payer / Delegate</th>
                  <th className="py-3 px-4">Channel &amp; Network</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No transactions found for the selected channel or query.
                    </td>
                  </tr>
                ) : (
                  filtered.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {reg.payment_reference || 'REF_N/A'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#1B7E3E]">
                        {reg.registration_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <strong className="text-slate-900 block font-bold">
                          {reg.first_name} {reg.last_name}
                        </strong>
                        <span className="text-[11px] text-slate-400 block truncate max-w-[180px]">
                          {reg.email}
                        </span>
                        {reg.phone && (
                          <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                            <Smartphone className="w-2.5 h-2.5" />
                            {reg.phone}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <PaymentChannelBadge
                          paymentMethod={reg.payment_method}
                          phone={reg.phone}
                          paymentStatus={reg.payment_status}
                          showDetails={true}
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                            reg.payment_status === 'SUCCESSFUL'
                              ? 'bg-emerald-100 text-emerald-800'
                              : reg.payment_status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {reg.payment_status === 'SUCCESSFUL' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          ) : reg.payment_status === 'PENDING' ? (
                            <Clock className="w-3 h-3 text-amber-700" />
                          ) : (
                            <XCircle className="w-3 h-3 text-rose-700" />
                          )}
                          <span>{reg.payment_status || 'PENDING'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(reg.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900 whitespace-nowrap">
                        {formatGHS(reg.total_amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
