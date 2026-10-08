import { useContext } from 'react';
import { IntroTransitionContext } from '../context/IntroTransitionContext';
import type { IntroTransitionContextValue, IntroStage } from '../context/IntroTransitionContext';

export function useIntroTransition(): IntroTransitionContextValue {
  const context = useContext(IntroTransitionContext);
  if (!context) {
    throw new Error('useIntroTransition must be used within an IntroTransitionProvider');
  }
  return context;
}

export type { IntroStage, IntroTransitionContextValue };
