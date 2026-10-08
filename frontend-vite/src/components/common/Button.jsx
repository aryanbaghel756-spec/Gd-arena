import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Standard GD Arena Button System
 * Enforces strict hierarchy:
 * - primary: 44-48px height, dark near-black base with subtle magenta/violet border & glow
 * - secondary: 40-44px height, dark transparent base, thin neutral border, soft white text
 * - tertiary: clean text button, no container, no borders
 * - danger: restrained muted red accent, thin border (used for End GD)
 */
export function Button({
  children,
  variant = 'primary',
  size = 'default',
  icon: Icon,
  iconPosition = 'right',
  isLoading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const isDisabled = disabled || isLoading;

  let baseStyles = 'inline-flex items-center justify-center font-heading transition-all select-none disabled:opacity-40 disabled:cursor-not-allowed';

  // Variant styles
  let variantStyles = '';
  if (variant === 'primary') {
    variantStyles = 'btn-primary';
  } else if (variant === 'secondary') {
    variantStyles = 'btn-secondary';
  } else if (variant === 'tertiary') {
    variantStyles = 'btn-tertiary';
  } else if (variant === 'danger') {
    variantStyles = 'btn-danger-restrained';
  }

  // Size overrides if specified
  let sizeStyles = '';
  if (size === 'compact') {
    sizeStyles = '!h-8 !px-3 !text-xs';
  } else if (size === 'large') {
    sizeStyles = '!h-12 !px-7 !text-base';
  }

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    >
      {isLoading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin text-pink-400" />
      )}
      {!isLoading && Icon && iconPosition === 'left' && (
        <Icon className="w-4 h-4 mr-2 opacity-90" />
      )}
      <span>{children}</span>
      {!isLoading && Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4 ml-2 opacity-90" />
      )}
    </button>
  );
}
