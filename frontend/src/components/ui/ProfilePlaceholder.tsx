import React from 'react';

interface ProfilePlaceholderProps {
  className?: string;
  headColor?: string;
  bgColor?: string;
}

export const ProfilePlaceholder: React.FC<ProfilePlaceholderProps> = ({
  className = 'w-full h-full',
  headColor = '#7b8794',
  bgColor = '#f0f3f6',
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none overflow-hidden ${className}`}
      style={{ backgroundColor: bgColor }}
      aria-label="Profile placeholder"
    >
      {/* Head circle */}
      <circle cx="50" cy="40" r="20" fill={headColor} />
      {/* Torso/Shoulders curve */}
      <circle cx="50" cy="110" r="42" fill={headColor} />
    </svg>
  );
};
