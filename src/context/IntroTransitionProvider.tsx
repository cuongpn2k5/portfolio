import React, { useState, useCallback, useRef } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { IntroTransitionContext, type IntroStage } from './IntroTransitionContext';

export const IntroTransitionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const prefersReducedMotion = useReducedMotion();

  // Determine initial state: run intro only on first visit or when ?intro=true
  const [stage, setStage] = useState<IntroStage>(() => {
    if (typeof window === 'undefined') return 'entered';
    const forceIntro = new URLSearchParams(window.location.search).get('intro') === 'true';
    const seen = sessionStorage.getItem('pnc-portfolio-intro-seen');
    if ((forceIntro || !seen) && !prefersReducedMotion) {
      return 'intro';
    }
    return 'entered';
  });

  const [cardEntranceTrigger, setCardEntranceTrigger] = useState(stage === 'entered');
  const [heroEntranceTrigger, setHeroEntranceTrigger] = useState(stage === 'entered');
  const isSkippedRef = useRef(false);

  const startTransition = useCallback(() => {
    if (isSkippedRef.current) return;
    setStage('transitioning');
  }, []);

  const triggerCardEntrance = useCallback(() => {
    if (isSkippedRef.current) return;
    setCardEntranceTrigger(true);
  }, []);

  const triggerHeroEntrance = useCallback(() => {
    if (isSkippedRef.current) return;
    setHeroEntranceTrigger(true);
  }, []);

  const completeTransition = useCallback(() => {
    setStage('entered');
    setCardEntranceTrigger(true);
    setHeroEntranceTrigger(true);
    try {
      sessionStorage.setItem('pnc-portfolio-intro-seen', 'true');
    } catch {
      // Storage safety
    }
  }, []);

  const skipAll = useCallback(() => {
    isSkippedRef.current = true;
    setStage('entered');
    setCardEntranceTrigger(true);
    setHeroEntranceTrigger(true);
    try {
      sessionStorage.setItem('pnc-portfolio-intro-seen', 'true');
    } catch {
      // Storage safety
    }
  }, []);

  const isIntroActive = stage === 'intro' || stage === 'transitioning';

  return (
    <IntroTransitionContext.Provider
      value={{
        stage,
        isIntroActive,
        cardEntranceTrigger,
        heroEntranceTrigger,
        startTransition,
        triggerCardEntrance,
        triggerHeroEntrance,
        completeTransition,
        skipAll,
      }}
    >
      {children}
    </IntroTransitionContext.Provider>
  );
};
