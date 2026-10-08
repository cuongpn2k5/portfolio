import React, { useId } from 'react';
import { PullCord } from 'pullcord';
import { useTheme } from '../../hooks/useTheme';
import { useIntroTransition } from '../../hooks/useIntroTransition';

export const ThemePullCord: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { stage } = useIntroTransition();
  const labelId = useId();

  return (
    <div
      className={`fixed top-0 right-4 sm:right-6 md:right-8 z-50 pointer-events-auto transition-opacity duration-700 ease-out ${
        stage === 'intro' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        // Match pullcord variables
        ['--pullcord-top' as string]: '0px',
        ['--pullcord-right' as string]: '0px',
        ['--pullcord-z' as string]: '50',
        ['--pullcord-ink' as string]: theme === 'dark' ? '#d4d0c8' : '#222222'
      }}
    >
      <PullCord
        onPull={toggleTheme}
        pulled={theme === 'light'}
        ariaLabel={`Toggle theme (currently ${theme} mode)`}
        className="pullcord-theme-trigger"
      />
      <span id={labelId} className="sr-only">
        Pull string to switch between dark and light themes
      </span>
    </div>
  );
};
