import React, { useRef } from 'react';

interface PremiumButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  href?: string;
  variant?: 'primary' | 'secondary' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  children,
  onClick,
  href,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    // Ripple effect
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.left = `${e.clientX - button.getBoundingClientRect().left - radius}px`;
    ripple.style.top = `${e.clientY - button.getBoundingClientRect().top - radius}px`;
    ripple.classList.add('ripple');

    const existingRipple = button.querySelector('.ripple');
    if (existingRipple) {
      existingRipple.remove();
    }

    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);

    if (onClick) {
      onClick(e);
    }
  };

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-[#E60032] via-[#E2007A] to-[#E60032]
      hover:from-[#E2007A] hover:via-[#E60032] hover:to-[#E2007A]
      shadow-2xl shadow-[#E60032]/50
      hover:shadow-[#E2007A]/70
    `,
    secondary: `
      bg-gradient-to-r from-[#00A9E0] via-[#0088CC] to-[#00A9E0]
      hover:from-[#0088CC] hover:via-[#00A9E0] hover:to-[#0088CC]
      shadow-2xl shadow-[#00A9E0]/50
      hover:shadow-[#0088CC]/70
    `,
    gold: `
      bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700]
      hover:from-[#FFA500] hover:via-[#FFD700] hover:to-[#FFA500]
      shadow-2xl shadow-[#FFD700]/50
      hover:shadow-[#FFA500]/70
      text-black
    `,
  };

  const sizeClasses = {
    sm: 'px-6 py-2 text-sm',
    md: 'px-8 py-2 text-base',
    lg: 'px-10 py-2.5 text-lg',
  };

  const baseClasses = `
    relative overflow-hidden
    rounded-md
    text-white font-semibold
    bg-size-200 bg-pos-0
    hover:bg-pos-100 hover:scale-[1.02]
    active:scale-95
    transition-all duration-200 ease-out
    border-0
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
  `;


  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `;


  if (href) {
    return (
      <a
        href={href}
        className={combinedClasses}
        onClick={(e) => {
          const button = e.currentTarget as any;
          const mouseEvent = e as any;
          handleClick({ ...mouseEvent, currentTarget: button });
        }}
      >
        <span className="relative z-10 flex items-center gap-2 justify-center">
          {children}
        </span>
      </a>
    );
  }

  return (
    <button
      ref={buttonRef}
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={combinedClasses}
    >
      <span className="relative z-10 flex items-center gap-2 justify-center">
        {children}
      </span>
    </button>
  );
// Ripple effect CSS (add to global styles if not present)
if (typeof window !== 'undefined' && !document.getElementById('premium-btn-style')) {
  const style = document.createElement('style');
  style.id = 'premium-btn-style';
  style.innerHTML = `
    .ripple {
      position: absolute;
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s linear;
      background: rgba(255,255,255,0.5);
      pointer-events: none;
      z-index: 1;
    }
    @keyframes ripple {
      to {
        transform: scale(2.5);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}
};
