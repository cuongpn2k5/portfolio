import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFound: React.FC = () => {
  useEffect(() => {
    document.title = 'Page Not Found | Phan Nhat Cuong';
  }, []);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-6">
      <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-accent)]">
        <Compass className="w-12 h-12 animate-spin-slow" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-[var(--color-surface-raised)] text-[var(--color-accent)] border border-[var(--color-border)]">
          404 ERROR
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold text-[var(--color-text)]">
          Page Not Found
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto">
          The page or route you are looking for does not exist or has been moved.
        </p>
      </div>

      <Link to="/">
        <Button variant="primary">
          <Home className="w-4 h-4 mr-2" />
          <span>Return to Homepage</span>
        </Button>
      </Link>
    </div>
  );
};
