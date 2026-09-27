import React from 'react';
import { cn } from '../../lib/utils';
import { EventStatus, AttendanceType } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'gold' | 'red' | 'charcoal' | 'neutral' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'green',
  size = 'md',
  className,
}) => {
  const variantStyles = {
    green: 'bg-cib-green-50 text-cib-green-800 border-cib-green-200/60',
    gold: 'bg-cib-gold-50 text-cib-gold-700 border-cib-gold-200',
    red: 'bg-cib-red-50 text-cib-red-700 border-cib-red-200',
    charcoal: 'bg-cib-charcoal-100 text-cib-charcoal-800 border-cib-charcoal-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    outline: 'bg-transparent text-cib-charcoal-700 border-slate-300',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border transition-colors whitespace-nowrap shrink-0',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export const EventStatusBadge: React.FC<{ status: EventStatus; className?: string }> = ({ status, className }) => {
  switch (status) {
    case 'OPEN_FOR_REGISTRATION':
      return (
        <Badge variant="green" size="sm" className={className}>
          <span className="w-1.5 h-1.5 rounded-full bg-cib-green-600 animate-pulse"></span>
          Open
        </Badge>
      );
    case 'UPCOMING':
      return <Badge variant="gold" size="sm" className={className}>Upcoming</Badge>;
    case 'IN_PROGRESS':
      return (
        <Badge variant="gold" size="sm" className={className}>
          <span className="w-1.5 h-1.5 rounded-full bg-cib-gold-500 animate-ping"></span>
          In Progress
        </Badge>
      );
    case 'REGISTRATION_CLOSED':
      return <Badge variant="red" size="sm" className={className}>Closed</Badge>;
    case 'COMPLETED':
      return <Badge variant="neutral" size="sm" className={className}>Completed</Badge>;
    case 'DRAFT':
      return <Badge variant="outline" size="sm" className={cn("text-slate-500 bg-slate-50 border-slate-300", className)}>Draft</Badge>;
    case 'CANCELLED':
      return <Badge variant="red" size="sm" className={className}>Cancelled</Badge>;
    default:
      return <Badge variant="neutral" size="sm" className={className}>{status}</Badge>;
  }
};

export const AttendanceTypeBadge: React.FC<{ type: AttendanceType; className?: string }> = ({ type, className }) => {
  const labels: Record<string, string> = {
    PHYSICAL: 'In-Person',
    VIRTUAL: 'Virtual',
    HYBRID: 'Hybrid',
  };
  return (
    <Badge variant="outline" size="sm" className={cn("font-medium text-slate-600 bg-white whitespace-nowrap", className)}>
      {labels[type] || type}
    </Badge>
  );
};
