import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  asLink?: boolean;
  href?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 min-h-[36px] gap-1.5',
    md: 'text-sm px-5 py-2.5 min-h-[44px] gap-2',
    lg: 'text-base px-7 py-3 min-h-[50px] gap-2.5',
  }[size];

  const variantStyles = {
    primary: 'bg-[var(--color-button-bg)] text-[var(--color-button-text)] hover:opacity-90 shadow-sm active:scale-[0.98]',
    secondary: 'bg-[var(--color-surface-raised)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-control-border)] active:scale-[0.98]',
    outline: 'bg-transparent text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-surface-raised)] hover:border-[var(--color-control-border)] active:scale-[0.98]',
    ghost: 'bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface-raised)] active:scale-[0.98]',
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
