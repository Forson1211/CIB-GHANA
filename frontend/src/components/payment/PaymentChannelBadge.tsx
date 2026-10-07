import React from 'react';
import { Smartphone, CreditCard, Building2, Award } from 'lucide-react';

/**
 * Intelligent Ghanaian telecom network detector based on official NCA prefixes
 * - MTN: 024, 054, 055, 059, 053
 * - Telecel (formerly Vodafone): 020, 050
 * - AT (formerly AirtelTigo): 027, 057, 026, 056
 */
export function detectGhanaNetwork(phoneOrInput?: string): 'MTN' | 'TELECEL' | 'AT' | null {
  if (!phoneOrInput) return null;
  const clean = phoneOrInput.replace(/[^0-9]/g, '');

  let prefix = '';
  if (clean.startsWith('233') && clean.length >= 5) {
    prefix = '0' + clean.slice(3, 5);
  } else if (clean.startsWith('0') && clean.length >= 3) {
    prefix = clean.slice(0, 3);
  }

  if (['024', '054', '055', '059', '053'].includes(prefix)) return 'MTN';
  if (['020', '050'].includes(prefix)) return 'TELECEL';
  if (['027', '057', '026', '056'].includes(prefix)) return 'AT';

  return null;
}

export interface PaymentChannelInfo {
  type: 'MOMO' | 'CARD' | 'BANK_TRANSFER' | 'COMPLIMENTARY' | 'UNKNOWN';
  network: 'MTN' | 'TELECEL' | 'AT' | 'VISA_MASTERCARD' | 'BANK' | 'UNKNOWN';
  label: string;
  subLabel?: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
  icon: 'phone' | 'card' | 'bank' | 'award';
}

export function getPaymentChannelInfo(paymentMethod?: string, phone?: string): PaymentChannelInfo {
  const methodUpper = (paymentMethod || '').toUpperCase().trim();
  const detectedNet = detectGhanaNetwork(phone);

  // 1. Explicit MTN Mobile Money
  if (
    methodUpper.includes('MTN') ||
    methodUpper === 'MOMO_MTN' ||
    methodUpper === 'WEBPAY_MOMO_MTN' ||
    ((methodUpper.includes('MOMO') || methodUpper === 'ACCESS_WEBPAY' || methodUpper === 'WEBPAY') && detectedNet === 'MTN')
  ) {
    return {
      type: 'MOMO',
      network: 'MTN',
      label: 'MTN MoMo',
      subLabel: phone ? `MTN • ${phone}` : 'MTN Mobile Money',
      badgeBg: 'bg-[#FFCC00]/15',
      badgeText: 'text-[#856404]',
      badgeBorder: 'border-[#FFCC00]/40',
      dotColor: 'bg-[#E5B800]',
      icon: 'phone',
    };
  }

  // 2. Explicit Telecel Cash (Vodafone)
  if (
    methodUpper.includes('TELECEL') ||
    methodUpper.includes('VODAFONE') ||
    methodUpper === 'MOMO_TELECEL' ||
    methodUpper === 'WEBPAY_MOMO_TELECEL' ||
    ((methodUpper.includes('MOMO') || methodUpper === 'ACCESS_WEBPAY' || methodUpper === 'WEBPAY') && detectedNet === 'TELECEL')
  ) {
    return {
      type: 'MOMO',
      network: 'TELECEL',
      label: 'Telecel Cash',
      subLabel: phone ? `Telecel • ${phone}` : 'Telecel Mobile Money',
      badgeBg: 'bg-rose-50',
      badgeText: 'text-rose-700',
      badgeBorder: 'border-rose-200',
      dotColor: 'bg-rose-600',
      icon: 'phone',
    };
  }

  // 3. Explicit AT Money (AirtelTigo)
  if (
    methodUpper.includes('AT') ||
    methodUpper.includes('AIRTEL') ||
    methodUpper.includes('TIGO') ||
    methodUpper === 'MOMO_AT' ||
    methodUpper === 'WEBPAY_MOMO_AT' ||
    ((methodUpper.includes('MOMO') || methodUpper === 'ACCESS_WEBPAY' || methodUpper === 'WEBPAY') && detectedNet === 'AT')
  ) {
    return {
      type: 'MOMO',
      network: 'AT',
      label: 'AT Money',
      subLabel: phone ? `AT • ${phone}` : 'AirtelTigo Money',
      badgeBg: 'bg-sky-50',
      badgeText: 'text-sky-800',
      badgeBorder: 'border-sky-200',
      dotColor: 'bg-sky-600',
      icon: 'phone',
    };
  }

  // 4. Generic Mobile Money
  if (methodUpper.includes('MOMO') || methodUpper.includes('MOBILE_MONEY')) {
    return {
      type: 'MOMO',
      network: 'UNKNOWN',
      label: 'Mobile Money',
      subLabel: phone ? `MoMo • ${phone}` : 'Ghana MoMo',
      badgeBg: 'bg-amber-50',
      badgeText: 'text-amber-800',
      badgeBorder: 'border-amber-200',
      dotColor: 'bg-amber-600',
      icon: 'phone',
    };
  }

  // 5. Card (Visa / Mastercard)
  if (
    methodUpper.includes('CARD') ||
    methodUpper.includes('VISA') ||
    methodUpper.includes('MASTER')
  ) {
    return {
      type: 'CARD',
      network: 'VISA_MASTERCARD',
      label: 'Card (Visa / Mastercard)',
      subLabel: 'Debit / Credit Card',
      badgeBg: 'bg-blue-50',
      badgeText: 'text-blue-800',
      badgeBorder: 'border-blue-200',
      dotColor: 'bg-blue-600',
      icon: 'card',
    };
  }

  // 6. Bank Transfer
  if (methodUpper.includes('BANK')) {
    return {
      type: 'BANK_TRANSFER',
      network: 'BANK',
      label: 'Bank Transfer',
      subLabel: 'Direct Bank Settlement',
      badgeBg: 'bg-purple-50',
      badgeText: 'text-purple-800',
      badgeBorder: 'border-purple-200',
      dotColor: 'bg-purple-600',
      icon: 'bank',
    };
  }

  // 7. Complimentary
  if (methodUpper.includes('COMPLIMENTARY')) {
    return {
      type: 'COMPLIMENTARY',
      network: 'UNKNOWN',
      label: 'Complimentary Pass',
      subLabel: 'VIP Accredited',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-800',
      badgeBorder: 'border-emerald-200',
      dotColor: 'bg-emerald-600',
      icon: 'award',
    };
  }

  // Fallback: If phone has a detected Ghana MoMo network, attribute to that network
  if (detectedNet === 'MTN') {
    return {
      type: 'MOMO',
      network: 'MTN',
      label: 'MTN MoMo',
      subLabel: phone ? `MTN • ${phone}` : 'MTN Ghana',
      badgeBg: 'bg-[#FFCC00]/15',
      badgeText: 'text-[#856404]',
      badgeBorder: 'border-[#FFCC00]/40',
      dotColor: 'bg-[#E5B800]',
      icon: 'phone',
    };
  }

  if (detectedNet === 'TELECEL') {
    return {
      type: 'MOMO',
      network: 'TELECEL',
      label: 'Telecel Cash',
      subLabel: phone ? `Telecel • ${phone}` : 'Telecel Ghana',
      badgeBg: 'bg-rose-50',
      badgeText: 'text-rose-700',
      badgeBorder: 'border-rose-200',
      dotColor: 'bg-rose-600',
      icon: 'phone',
    };
  }

  if (detectedNet === 'AT') {
    return {
      type: 'MOMO',
      network: 'AT',
      label: 'AT Money',
      subLabel: phone ? `AT • ${phone}` : 'AirtelTigo Ghana',
      badgeBg: 'bg-sky-50',
      badgeText: 'text-sky-800',
      badgeBorder: 'border-sky-200',
      dotColor: 'bg-sky-600',
      icon: 'phone',
    };
  }

  // If payment status is pending or method has not been selected yet
  return {
    type: 'UNKNOWN',
    network: 'UNKNOWN',
    label: 'Not Selected',
    subLabel: 'Awaiting Payment Selection',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-600',
    badgeBorder: 'border-slate-200',
    dotColor: 'bg-slate-400',
    icon: 'card',
  };
}

interface PaymentChannelBadgeProps {
  paymentMethod?: string;
  phone?: string;
  paymentStatus?: string;
  showDetails?: boolean;
  className?: string;
}

export const PaymentChannelBadge: React.FC<PaymentChannelBadgeProps> = ({
  paymentMethod,
  phone,
  paymentStatus,
  showDetails = false,
  className = '',
}) => {
  const info = getPaymentChannelInfo(paymentMethod, phone);
  const isPending = (paymentStatus || '').toUpperCase() === 'PENDING';

  return (
    <div className={`inline-flex flex-col items-start gap-0.5 ${className}`}>
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${info.badgeBg} ${info.badgeText} ${info.badgeBorder} shadow-none`}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${info.dotColor}`} />
        {info.icon === 'phone' ? (
          <Smartphone className="w-3 h-3 shrink-0 opacity-80" />
        ) : info.icon === 'card' ? (
          <CreditCard className="w-3 h-3 shrink-0 opacity-80" />
        ) : info.icon === 'bank' ? (
          <Building2 className="w-3 h-3 shrink-0 opacity-80" />
        ) : (
          <Award className="w-3 h-3 shrink-0 opacity-80" />
        )}
        <span>{info.type === 'UNKNOWN' && isPending ? 'Not Selected Yet' : info.label}</span>
      </span>

      {showDetails && (
        <span className="text-[10px] font-mono text-slate-500 pl-1 block">
          {info.type === 'UNKNOWN' && isPending ? 'Awaiting Payment' : info.subLabel}
        </span>
      )}
    </div>
  );
};
