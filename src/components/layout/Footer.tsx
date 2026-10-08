import React from 'react';
import { ArrowUp, Terminal } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

export const Footer: React.FC = () => {

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full border-t border-[var(--color-border)] bg-[var(--color-bg)] py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Brand & Copyright */}
        <div className="flex items-center space-x-2 text-sm text-[var(--color-text-muted)]">
          <Terminal className="w-4 h-4 text-[var(--color-accent)]" />
          <span>
            © {CURRENT_YEAR} <span className="font-medium text-[var(--color-text)]">Phan Nhat Cuong</span>. All rights reserved.
          </span>
        </div>

        {/* Status / Note */}
        <div className="text-xs font-mono text-[var(--color-text-muted)] text-center sm:text-left">
          Crafted with React, TypeScript, Three.js & Tailwind CSS
        </div>

        {/* Back to Top */}
        <button
          type="button"
          onClick={scrollToTop}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] min-h-[36px]"
          aria-label="Scroll back to top"
        >
          <span>Back to Top</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>
    </footer>
  );
};
