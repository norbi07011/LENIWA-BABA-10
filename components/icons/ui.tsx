import React from 'react';

type P = { className?: string; size?: number };
const base = (size = 20) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
});

export const IconTable: React.FC<P> = ({ className, size }) => (
  <svg {...base(size)} className={className}>
    <ellipse cx="12" cy="8" rx="9" ry="3" />
    <path d="M12 11v9M8 20h8M5 9.5 4 17M19 9.5l1 7.5" />
  </svg>
);
export const IconArrow: React.FC<P> = ({ className, size }) => (
  <svg {...base(size)} className={className}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const IconArrowLeft: React.FC<P> = ({ className, size }) => (
  <svg {...base(size)} className={className}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);
export const IconClose: React.FC<P> = ({ className, size }) => (
  <svg {...base(size)} className={className}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const IconMenu: React.FC<P> = ({ className, size }) => (
  <svg {...base(size)} className={className}>
    <path d="M4 8h16M4 16h10" />
  </svg>
);
export const IconPlus: React.FC<P> = ({ className, size }) => (
  <svg {...base(size)} className={className}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const IconCheck: React.FC<P> = ({ className, size }) => (
  <svg {...base(size)} className={className}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </svg>
);
export const IconGlobe: React.FC<P> = ({ className, size }) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
  </svg>
);
export const IconPhone: React.FC<P> = ({ className, size }) => (
  <svg {...base(size)} className={className}>
    <path d="M5 4h3.5l1.7 4.3-2.2 1.4a11 11 0 0 0 6.3 6.3l1.4-2.2L20 15.5V19a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z" />
  </svg>
);
export const IconPin: React.FC<P> = ({ className, size }) => (
  <svg {...base(size)} className={className}>
    <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
);
export const IconStar: React.FC<P & { filled?: number }> = ({ className, size = 16, filled = 1 }) => {
  const id = React.useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id}>
          <stop offset={`${filled * 100}%`} stopColor="currentColor" />
          <stop offset={`${filled * 100}%`} stopColor="currentColor" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <path fill={`url(#${id})`} d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" />
    </svg>
  );
};
export const IconPlay: React.FC<P> = ({ className, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M8 5.5v13l11-6.5z" />
  </svg>
);
export const IconWhatsApp: React.FC<P> = ({ className, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M.06 24l1.69-6.16A11.87 11.87 0 0 1 .16 11.9C.16 5.34 5.5 0 12.05 0a11.82 11.82 0 0 1 8.41 3.49 11.82 11.82 0 0 1 3.48 8.41c0 6.56-5.34 11.9-11.89 11.9a11.9 11.9 0 0 1-5.69-1.45zm6.6-3.8a9.87 9.87 0 0 0 5.39 1.59c5.45 0 9.89-4.43 9.89-9.89A9.88 9.88 0 0 0 12.05 2C6.6 2 2.16 6.44 2.16 11.89c0 2.23.65 3.89 1.75 5.63l-1 3.65zm11.39-5.46c-.08-.13-.28-.2-.57-.35s-1.76-.87-2.03-.97-.47-.15-.67.15-.77.97-.94 1.16-.35.22-.65.08a8.15 8.15 0 0 1-2.39-1.48 8.94 8.94 0 0 1-1.65-2.06c-.17-.3 0-.46.13-.6l.45-.53c.15-.17.2-.3.3-.5s.05-.37-.03-.52-.67-1.61-.91-2.2c-.24-.58-.49-.5-.67-.51h-.57a1.09 1.09 0 0 0-.79.37 3.33 3.33 0 0 0-1.04 2.48 5.79 5.79 0 0 0 1.21 3.07c.15.2 2.1 3.2 5.08 4.49a17 17 0 0 0 1.7.63 4.08 4.08 0 0 0 1.87.12 3.06 3.06 0 0 0 2-1.41 2.49 2.49 0 0 0 .18-1.42z" />
  </svg>
);
export const IconFacebook: React.FC<P> = ({ className, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M9.2 22v-9.2H6V9.2h3.2V6.4c0-3.2 1.9-4.9 4.8-4.9 1.4 0 2.9.3 2.9.3v3.1H15c-1.5 0-2 .9-2 2v2.3h3.6l-.6 3.6h-3V22z" />
  </svg>
);
export const IconInstagram: React.FC<P> = ({ className, size = 20 }) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r=".8" fill="currentColor" />
  </svg>
);
export const IconExternal: React.FC<P> = ({ className, size = 16 }) => (
  <svg {...base(size)} className={className}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </svg>
);

export const Stars: React.FC<{ rating: number; size?: number }> = ({ rating, size = 16 }) => (
  <span className="stars" aria-label={`${rating} / 5`}>
    {Array.from({ length: 5 }, (_, i) => (
      <IconStar key={i} size={size} filled={Math.max(0, Math.min(1, rating - i))} />
    ))}
  </span>
);
