import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'status' | 'outline';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center text-xs font-mono font-medium px-2.5 py-1 rounded-md transition-colors';

  const variantStyles = {
    default: 'bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] border border-[var(--color-border)]',
    accent: 'bg-[var(--color-accent)]/15 text-[var(--color-accent)] border border-[var(--color-accent)]/30',
    status: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    outline: 'bg-transparent text-[var(--color-text-muted)] border border-[var(--color-border)]',
  }[variant];

  return (
    <span className={`${baseStyles} ${variantStyles} ${className}`}>
      {children}
    </span>
  );
};
