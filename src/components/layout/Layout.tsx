import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ThemePullCord } from '../common/ThemePullCord';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300 relative selection:bg-[var(--color-accent)] selection:text-white">
      {/* Global Theme PullCord */}
      <ThemePullCord />

      {/* Main Top Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 pt-[72px]" id="main-content">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
