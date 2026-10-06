import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, Clock, ArrowRight, Ticket as TicketIcon, RefreshCw, ShieldCheck } from 'lucide-react';
import { ApiClient } from '../lib/api';
import { useApp } from '../context/AppContext';
import { Registration } from '../types';
import {
  readPendingWebpayCheckout,
  clearPendingWebpayCheckout,
} from '../lib/payments';

export const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshRegistrations, setRegisteredUserEmail, setRegisteredUserName } = useApp();

  const [state, setState] = useState<'verifying' | 'success' | 'failed' | 'pending' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [reference, setReference] = useState<string>('');

  const pending = readPendingWebpayCheckout();
  const codeFromUrl = searchParams.get('code');
  const messageFromUrl = searchParams.get('message');
  const txnIdFromUrl = searchParams.get('txnId') || searchParams.get('transaction_id') || '';
  const narrationFromUrl = searchParams.get('narration') || '';
  const refFromUrl =
    searchParams.get('referenceId') ||
    searchParams.get('reference') ||
    searchParams.get('ref') ||
    pending?.reference ||
    txnIdFromUrl ||
    '';

  const [transactionId, setTransactionId] = useState<string>(txnIdFromUrl);

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0A5C36', '#D4AF37', '#004A97'],
    });
  };

  const verifyPayment = async (ref: string) => {
    if (!ref) {
      setState('error');
      setErrorMessage('No payment reference found. Please return to the registration page.');
      return;
    }

    // If Access Bank returned a failure response code in URL
    if (codeFromUrl && codeFromUrl !== '000') {
      const codeMessages: Record<string, string> = {
        '001': 'Payment was cancelled or declined by your provider.',
        '002': 'Invalid merchant or service configuration.',
        '003': 'Invalid request parameters.',
        '004': 'Invalid authorization.',
        '005': 'Bank connection refused or insufficient permissions.',
      };
      setState('failed');
      setErrorMessage(messageFromUrl || codeMessages[codeFromUrl] || `Transaction returned code ${codeFromUrl}`);
      setReference(ref);
      return;
    }

    setState('verifying');
    setReference(ref);

    try {
      const res = await ApiClient.verifyWebpayPayment(ref);

      if (res.success && res.data) {
        if (res.data.status === 'SUCCESSFUL') {
          const reg = res.data.registration;
          setRegistration(reg);
          if (res.data.gateway?.transactionId) {
            setTransactionId(res.data.gateway.transactionId);
          }
          setState('success');
          clearPendingWebpayCheckout();

          if (reg?.email) {
            setRegisteredUserEmail(reg.email);
            setRegisteredUserName(reg.first_name);
          }

          // Trigger registration refresh in global context
          refreshRegistrations().catch(() => {});
          triggerConfetti();
        } else if (res.data.status === 'FAILED') {
          setState('failed');
          setErrorMessage(res.message || 'Payment was declined or cancelled by the gateway.');
        } else {
          // Status is PENDING
          setState('pending');
        }
      } else {
        setState('error');
        setErrorMessage(res.message || 'Unable to confirm payment status.');
      }
    } catch (err: any) {
      console.error('[WebPay Callback] Verification error:', err);
      setState('error');
      setErrorMessage(err?.message || 'Network connection failed while verifying payment with Access Bank WebPay.');
    }
  };

  useEffect(() => {
    if (refFromUrl) {
      verifyPayment(refFromUrl);
    } else {
      setState('error');
      setErrorMessage('Missing transaction reference. If you completed a payment, please check your email for your confirmation pass.');
    }
  }, [refFromUrl]);

  return (
    <div className="min-h-screen bg-[#0D3A21] py-16 sm:py-24 px-4 sm:px-6 lg:px-8 text-white relative">
      <div className="max-w-xl mx-auto">
        {/* Verification in Progress */}
        {state === 'verifying' && (
          <div className="bg-white text-slate-900 rounded-none p-8 sm:p-10 text-center space-y-6 shadow-2xl border-t-4 border-[#004A97]">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-[#004A97] flex items-center justify-center mx-auto animate-spin">
              <RefreshCw className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black font-display tracking-tight text-slate-900">
                Verifying Payment
              </h2>
              <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                Confirming settlement with <strong className="text-[#004A97]">Access Bank Ghana WebPay</strong>. Please do not close or refresh this window...
              </p>
            </div>
            {reference && (
              <div className="p-3 bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600">
                Reference: {reference}
              </div>
            )}
          </div>
        )}

        {/* Payment Succeeded */}
        {state === 'success' && registration && (
          <div className="bg-white text-slate-900 rounded-none p-8 sm:p-10 text-center space-y-6 shadow-2xl border-t-4 border-[#1B7E3E] animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-[#1B7E3E] border-2 border-emerald-200 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Access Bank WebPay &bull; Verified</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-slate-900">
                Payment & Accreditation Confirmed!
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{registration.first_name} {registration.last_name}</strong>. Your seat at the <strong>{registration.event_title || 'Conference'}</strong> has been secured.
              </p>
            </div>

            {/* Receipt Summary */}
            <div className="bg-slate-50 border border-slate-200 p-5 text-left space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Official Pass Number</span>
                <span className="text-base font-mono font-black text-[#1B7E3E]">
                  {registration.registration_number}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-500 font-medium">Amount Paid:</span>
                <span className="font-bold text-slate-900">
                  GHS {Number(registration.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-500 font-medium">Payment Reference:</span>
                <span className="font-mono text-xs text-slate-700">
                  {registration.payment_reference || reference}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-500 font-medium">Gateway:</span>
                <span className="font-bold text-[#004A97] text-xs">
                  Access Bank Ghana WebPay (Collections WEB_ACQ)
                </span>
              </div>
              {transactionId && (
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-500 font-medium">Bank Transaction ID:</span>
                  <span className="font-mono text-xs text-[#004A97] font-semibold">{transactionId}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500">
              An official payment receipt & QR badge pass have been dispatched to <strong>{registration.email}</strong>.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to={`/ticket/${registration.registration_number}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1B7E3E] hover:bg-[#166632] text-white font-bold text-sm uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                <TicketIcon className="w-4 h-4" />
                <span>View Digital Ticket Pass</span>
              </Link>

              <Link
                to="/my-portal"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-all border border-slate-300"
              >
                <span>Delegate Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Payment Failed */}
        {state === 'failed' && (
          <div className="bg-white text-slate-900 rounded-none p-8 sm:p-10 text-center space-y-6 shadow-2xl border-t-4 border-red-600">
            <div className="w-20 h-20 rounded-full bg-red-50 text-red-600 border-2 border-red-200 flex items-center justify-center mx-auto shadow-inner">
              <XCircle className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black font-display tracking-tight text-slate-900">
                Payment Not Completed
              </h2>
              <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                {errorMessage || 'Your transaction was not completed or was declined by the bank.'}
              </p>
            </div>

            {reference && (
              <div className="p-3 bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600">
                Reference: {reference}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1B7E3E] hover:bg-[#166632] text-white font-bold text-sm uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <span>Try Again</span>
              </button>
              <Link
                to="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-all border border-slate-300"
              >
                <span>Contact Support</span>
              </Link>
            </div>
          </div>
        )}

        {/* Payment Pending */}
        {state === 'pending' && (
          <div className="bg-white text-slate-900 rounded-none p-8 sm:p-10 text-center space-y-6 shadow-2xl border-t-4 border-amber-500">
            <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-600 border-2 border-amber-200 flex items-center justify-center mx-auto shadow-inner">
              <Clock className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black font-display tracking-tight text-slate-900">
                Payment Awaiting Confirmation
              </h2>
              <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                Access Bank WebPay is still finalizing this transaction with your financial provider. Please check again in a moment.
              </p>
            </div>

            {reference && (
              <div className="p-3 bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600">
                Reference: {reference}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => verifyPayment(reference)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#004A97] hover:bg-[#003875] text-white font-bold text-sm uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Re-Check Status</span>
              </button>
              <Link
                to="/my-portal"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-all border border-slate-300"
              >
                <span>Go to Portal</span>
              </Link>
            </div>
          </div>
        )}

        {/* Error / Invalid Reference */}
        {state === 'error' && (
          <div className="bg-white text-slate-900 rounded-none p-8 sm:p-10 text-center space-y-6 shadow-2xl border-t-4 border-red-600">
            <div className="w-20 h-20 rounded-full bg-red-50 text-red-600 border-2 border-red-200 flex items-center justify-center mx-auto shadow-inner">
              <XCircle className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black font-display tracking-tight text-slate-900">
                Transaction Error
              </h2>
              <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                {errorMessage}
              </p>
            </div>

            <div className="flex justify-center pt-2">
              <Link
                to="/events"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1B7E3E] hover:bg-[#166632] text-white font-bold text-sm uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                <span>Back to Events</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
