import { createContext } from 'react';

export type IntroStage = 'idle' | 'intro' | 'transitioning' | 'entered';

export interface IntroTransitionContextValue {
  stage: IntroStage;
  isIntroActive: boolean;
  cardEntranceTrigger: boolean;
  heroEntranceTrigger: boolean;
  startTransition: () => void;
  triggerCardEntrance: () => void;
  triggerHeroEntrance: () => void;
  completeTransition: () => void;
  skipAll: () => void;
}

export const IntroTransitionContext = createContext<IntroTransitionContextValue | null>(null);
