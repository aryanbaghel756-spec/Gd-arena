'use client';

import React, { useState, useRef, ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { ButtonVariant, ButtonSize } from './HexButton';

export interface RectButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export function RectButton({
  variant = 'secondary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  children,
  className = '',
  onClick,
  ...props
}: RectButtonProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [isShocking, setIsShocking] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });
  };

  const handleMouseDown = () => {
    if (disabled || isLoading) return;
    setIsShocking(true);
    setTimeout(() => setIsShocking(false), 450);
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'min-h-[44px] px-4 py-2 text-xs font-semibold tracking-wider rounded-md',
    md: 'min-h-[48px] px-6 py-2.5 text-sm font-bold tracking-wider rounded-lg',
    lg: 'min-h-[56px] px-8 py-3.5 text-base font-bold tracking-widest rounded-lg',
    xl: 'min-h-[64px] px-10 py-4 text-lg font-extrabold tracking-widest rounded-xl',
  };

  const iconSizes: Record<ButtonSize, string> = {
    sm: 'w-11 h-11 p-2 text-xs rounded-md',
    md: 'w-12 h-12 min-h-[48px] p-2.5 text-sm rounded-lg',
    lg: 'w-14 h-14 min-h-[56px] p-3 text-base rounded-lg',
    xl: 'w-16 h-16 min-h-[64px] p-4 text-xl rounded-xl',
  };

  const variantStyles: Record<ButtonVariant, { bg: string; border: string; text: string; glow: string }> = {
    primary: {
      bg: 'bg-gradient-to-r from-[#b80010] via-[#ff1e2d] to-[#ffc400]',
      border: 'border-[#ffc400]/70',
      text: 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]',
      glow: 'shadow-[0_0_20px_rgba(255,30,45,0.45)] hover:shadow-[0_0_30px_rgba(255,196,0,0.6)]',
    },
    secondary: {
      bg: 'bg-[#120b12]/90 hover:bg-[#1b1019]/90',
      border: 'border-[#ff1e2d]/40 hover:border-[#ffc400]/60',
      text: 'text-amber-100 hover:text-white',
      glow: 'shadow-[0_4px_18px_rgba(0,0,0,0.6)] hover:shadow-[0_0_20px_rgba(255,30,45,0.35)]',
    },
    danger: {
      bg: 'bg-gradient-to-r from-[#6e030c] to-[#ff1e2d]',
      border: 'border-[#ff1e2d]',
      text: 'text-white',
      glow: 'shadow-[0_0_18px_rgba(255,30,45,0.4)] hover:shadow-[0_0_26px_rgba(255,30,45,0.7)]',
    },
    ghost: {
      bg: 'bg-transparent hover:bg-white/[0.05]',
      border: 'border-transparent hover:border-[#ffc400]/30',
      text: 'text-slate-300 hover:text-amber-200',
      glow: 'hover:shadow-[0_0_15px_rgba(255,196,0,0.2)]',
    },
    icon: {
      bg: 'bg-[#110b11]/95 hover:bg-[#1c111c]',
      border: 'border-[#ff1e2d]/35 hover:border-[#ffc400]/70',
      text: 'text-amber-200 hover:text-yellow-300',
      glow: 'shadow-[0_0_14px_rgba(0,0,0,0.7)] hover:shadow-[0_0_20px_rgba(255,196,0,0.4)]',
    },
  };

  const vConfig = variantStyles[variant];

  return (
    <button
      ref={buttonRef}
      disabled={disabled || isLoading}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleMouseDown}
      onClick={onClick}
      style={{
        ['--mx' as any]: `${coords.x}px`,
        ['--my' as any]: `${coords.y}px`,
      }}
      className={`
        relative inline-flex items-center justify-center select-none cursor-pointer overflow-hidden
        font-display uppercase border transition-all duration-200 ease-out
        hover:-translate-y-0.5 active:translate-y-0.5
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffc400] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07070a]
        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none
        ${variant === 'icon' ? iconSizes[size] : sizeStyles[size]}
        ${vConfig.bg}
        ${vConfig.border}
        ${vConfig.glow}
        ${className}
      `}
      {...props}
    >
      {/* Top Inner Highlight (Beveled metallic sheen) */}
      <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

      {/* Bottom Inner Shadow */}
      <div className="absolute inset-x-0 bottom-0 h-[2.5px] bg-black/60 pointer-events-none" />

      {/* Mouse-Follow Spotlight */}
      {isHovered && !disabled && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-150"
          style={{
            background: `radial-gradient(circle 85px at var(--mx) var(--my), rgba(255, 196, 0, 0.45) 0%, rgba(255, 30, 45, 0.2) 50%, transparent 80%)`,
          }}
        />
      )}

      {/* Subtle Noise Texture */}
      <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:6px_6px] pointer-events-none" />

      {/* Shockwave Ring */}
      {isShocking && (
        <span className="absolute inset-0 z-30 pointer-events-none rounded-lg animate-shockwave border-2 border-[#ffc400]" />
      )}

      {/* Button Content */}
      <span className={`relative z-20 inline-flex items-center gap-2 ${vConfig.text}`}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
            <span className="opacity-90">Processing...</span>
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
            {children}
            {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
          </>
        )}
      </span>
    </button>
  );
}
