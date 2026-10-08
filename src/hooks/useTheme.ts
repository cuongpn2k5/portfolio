import { useContext } from 'react';
import { ThemeContext } from '../providers/ThemeContext';
import type { ThemeContextType, Theme } from '../providers/ThemeContext';

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export type { Theme };
