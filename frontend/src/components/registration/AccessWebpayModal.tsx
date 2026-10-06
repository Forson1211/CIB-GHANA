import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { CreditCard, Smartphone, Lock } from 'lucide-react';
import { processAccessWebpayPayment, AccessWebpayTransaction } from '../../lib/payments';

export interface AccessWebpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  currency?: string;
  email: string;
  eventTitle: string;
  registrationId: string;
  onSuccess: (transaction: AccessWebpayTransaction) => void;
}

export const AccessWebpayModal: React.FC<AccessWebpayModalProps> = ({
  isOpen,
  onClose,
  amount,
  currency = 'GHS',
  email,
  eventTitle,
  registrationId,
  onSuccess,
}) => {
  const [tab, setTab] = useState<'card' | 'momo'>('momo');
  const [momoPhone, setMomoPhone] = useState('0244123456');
  const [momoNetwork, setMomoNetwork] = useState<'MTN' | 'VODAFONE' | 'AIRTELTIGO'>('MTN');
  const [cardNumber, setCardNumber] = useState('4084 0012 3456 7890');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('892');
  const [isProcessing, setIsProcessing] = useState(false);
  const [promptSent, setPromptSent] = useState(false);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (tab === 'momo') {
      setPromptSent(true);
    }

    try {
      const tx = await processAccessWebpayPayment({
        amount,
        email,
        registrationId,
        channel: tab === 'card' ? 'card' : 'mobile_money',
        phone: momoPhone,
        mobileNetwork: momoNetwork,
      });

      setIsProcessing(false);
      setPromptSent(false);
      onSuccess(tx);
    } catch (err) {
      setIsProcessing(false);
      setPromptSent(false);
      alert('Payment processing failed. Please try again.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Access Bank WebPay Secure Checkout" maxWidth="md">
      <div className="space-y-5">
        {/* Merchant Header */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Payment to
            </p>
            <p className="text-xs font-bold text-cib-charcoal-900">
              Chartered Institute of Bankers, Ghana
            </p>
            <p className="text-[11px] text-slate-500 truncate max-w-[200px]">{eventTitle}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block font-medium">Total</span>
            <span className="text-lg font-black text-cib-green-800">
              {currency} {amount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Channel Tabs: Card vs Mobile Money */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setTab('momo')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              tab === 'momo'
                ? 'bg-white text-cib-green-900 shadow-sm'
                : 'text-slate-600 hover:text-cib-charcoal'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-cib-gold-600" />
            Ghana Mobile Money
          </button>

          <button
            type="button"
            onClick={() => setTab('card')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              tab === 'card'
                ? 'bg-white text-cib-green-900 shadow-sm'
                : 'text-slate-600 hover:text-cib-charcoal'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-cib-green-700" />
            Debit / Credit Card
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handlePay} className="space-y-4">
          {tab === 'momo' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Mobile Network
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'MTN', name: 'MTN MoMo', color: 'border-yellow-400 bg-yellow-50/50' },
                    { id: 'VODAFONE', name: 'Telecel Cash', color: 'border-red-400 bg-red-50/50' },
                    { id: 'AIRTELTIGO', name: 'AT Money', color: 'border-blue-400 bg-blue-50/50' },
                  ].map((net) => (
                    <button
                      key={net.id}
                      type="button"
                      onClick={() => setMomoNetwork(net.id as any)}
                      className={`p-2 rounded-xl text-xs font-bold border text-center transition-all ${
                        momoNetwork === net.id
                          ? `${net.color} ring-2 ring-cib-green-600`
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      {net.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Money Number
                </label>
                <input
                  type="text"
                  required
                  value={momoPhone}
                  onChange={(e) => setMomoPhone(e.target.value)}
                  placeholder="e.g. 0244123456"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-base sm:text-sm focus:border-cib-green-600 focus:outline-none"
                />
              </div>

              {promptSent && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1 animate-pulse">
                  <p className="font-bold">Prompt Sent to Phone!</p>
                  <p>Please enter your Mobile Money PIN on your device to authorize {currency} {amount.toFixed(2)}.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4084 0012 3456 7890"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-base sm:text-sm font-mono focus:border-cib-green-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Expires
                  </label>
                  <input
                    type="text"
                    required
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-base sm:text-sm font-mono focus:border-cib-green-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="123"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-base sm:text-sm font-mono focus:border-cib-green-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 rounded-none font-bold text-sm sm:text-base transition-all shadow-md bg-[#1B7E3E] hover:bg-[#166632] text-white active:scale-95 cursor-pointer disabled:opacity-50"
            >
              Pay {currency} {amount.toFixed(2)}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>256-Bit SSL Encrypted &bull; Access Bank Ghana WebPay Gateway</span>
          </div>
        </form>
      </div>
    </Modal>
  );
};

// Backwards-compatible alias
export const PaystackModal = AccessWebpayModal;
