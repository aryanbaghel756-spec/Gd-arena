'use client';

import React, { useState, useRef, ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface HexButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  shockwave?: boolean;
}

export function HexButton({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  children,
  className = '',
  onClick,
  ...props
}: HexButtonProps) {
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

  // Dimensions & sizes (ensuring min-h >= 44px for accessibility touch target)
  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'min-h-[44px] px-5 py-2 text-xs font-semibold tracking-wider',
    md: 'min-h-[48px] px-7 py-2.5 text-sm font-bold tracking-wider',
    lg: 'min-h-[56px] px-9 py-3.5 text-base font-bold tracking-widest',
    xl: 'min-h-[64px] px-12 py-4 text-lg font-extrabold tracking-widest',
  };

  const iconSizes: Record<ButtonSize, string> = {
    sm: 'w-11 h-11 p-2 text-xs',
    md: 'w-13 h-13 min-h-[48px] p-2.5 text-sm',
    lg: 'w-16 h-16 min-h-[56px] p-3 text-base',
    xl: 'w-20 h-20 min-h-[64px] p-4 text-xl',
  };

  // Base variant background & border styling
  const variantStyles: Record<ButtonVariant, { bg: string; text: string; stroke: string; glow: string }> = {
    primary: {
      bg: 'bg-gradient-to-r from-[#b80010] via-[#ff1e2d] to-[#ffc400]',
      text: 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]',
      stroke: 'rgba(255, 196, 0, 0.9)',
      glow: 'shadow-[0_0_24px_rgba(255,30,45,0.45)] hover:shadow-[0_0_34px_rgba(255,196,0,0.65)]',
    },
    secondary: {
      bg: 'bg-[#100a0e]/90 hover:bg-[#191016]/90',
      text: 'text-amber-100 hover:text-white',
      stroke: 'rgba(255, 30, 45, 0.65)',
      glow: 'shadow-[0_0_16px_rgba(0,0,0,0.8)] hover:shadow-[0_0_24px_rgba(255,30,45,0.4)]',
    },
    danger: {
      bg: 'bg-gradient-to-r from-[#6b020a] to-[#ff1e2d]',
      text: 'text-white',
      stroke: 'rgba(255, 30, 45, 0.9)',
      glow: 'shadow-[0_0_20px_rgba(255,30,45,0.4)] hover:shadow-[0_0_30px_rgba(255,30,45,0.7)]',
    },
    ghost: {
      bg: 'bg-transparent hover:bg-white/[0.04]',
      text: 'text-slate-300 hover:text-amber-300',
      stroke: 'rgba(255, 196, 0, 0.25)',
      glow: 'hover:shadow-[0_0_18px_rgba(255,196,0,0.25)]',
    },
    icon: {
      bg: 'bg-[#120b10]/95 hover:bg-[#1e111a]',
      text: 'text-amber-200 hover:text-yellow-300',
      stroke: 'rgba(255, 196, 0, 0.55)',
      glow: 'shadow-[0_0_16px_rgba(0,0,0,0.7)] hover:shadow-[0_0_22px_rgba(255,196,0,0.45)]',
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
        // CSS variables for mouse spotlight
        ['--mx' as any]: `${coords.x}px`,
        ['--my' as any]: `${coords.y}px`,
      }}
      className={`
        relative inline-flex items-center justify-center select-none cursor-pointer
        font-display uppercase transition-all duration-200 ease-out
        hover:-translate-y-0.5 active:translate-y-0.5
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffc400] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07070a]
        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none
        ${variant === 'icon' ? iconSizes[size] : sizeStyles[size]}
        ${vConfig.glow}
        ${className}
      `}
      {...props}
    >
      {/* SVG Outline for mathematically exact beveled border that follows hex polygon without clipping */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <defs>
          <linearGradient id={`hexGrad-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffc400" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#ff1e2d" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#ffe066" stopOpacity="0.75" />
          </linearGradient>
        </defs>
        <polygon
          points="10,2 90,2 98,50 90,98 10,98 2,50"
          fill="none"
          stroke={isHovered ? `url(#hexGrad-${variant})` : vConfig.stroke}
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
          className="transition-colors duration-200"
        />
      </svg>

      {/* Hexagon Body with Polygon Clip Path */}
      <div
        className={`
          absolute inset-[1px] z-10 clip-hex-flat
          ${vConfig.bg}
          transition-colors duration-200 overflow-hidden
        `}
      >
        {/* Top Metallic Bevel Highlight */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

        {/* Bottom Inner Shadow */}
        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-black/60 pointer-events-none" />

        {/* Mouse-Follow Spotlight (Yellow core, red falloff) */}
        {isHovered && !disabled && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-150"
            style={{
              background: `radial-gradient(circle 90px at var(--mx) var(--my), rgba(255, 196, 0, 0.45) 0%, rgba(255, 30, 45, 0.22) 55%, transparent 80%)`,
            }}
          />
        )}

        {/* Subtle Noise Texture */}
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px] pointer-events-none" />
      </div>

      {/* Shockwave Ripple Ring on Click */}
      {isShocking && (
        <span
          className="absolute inset-0 z-30 pointer-events-none rounded-lg animate-shockwave border-2 border-[#ffc400] shadow-[0_0_15px_#ff1e2d]"
        />
      )}

      {/* Button Content */}
      <span className={`relative z-20 inline-flex items-center gap-2.5 ${vConfig.text}`}>
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
