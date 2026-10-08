import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Intro } from '../sections/Intro';
import { Hero } from '../sections/Hero';
import { About } from '../sections/About';
import { PortfolioShowcase } from '../sections/PortfolioShowcase';
import { Services } from '../sections/Services';
import { Contact } from '../sections/Contact';
import { useIntroTransition } from '../hooks/useIntroTransition';

export const Home: React.FC = () => {
  const {
    stage,
    isIntroActive,
    triggerCardEntrance,
    triggerHeroEntrance,
    completeTransition,
  } = useIntroTransition();

  const transitionTrackRef = useRef<HTMLDivElement>(null);
  const introPanelRef = useRef<HTMLDivElement>(null);

  // Manage body scroll lock during Intro and Page Transition
  useEffect(() => {
    if (isIntroActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isIntroActive]);

  // Intro and Home live in one vertical track during the transition. Moving
  // this single element keeps both viewport panels physically connected.
  useLayoutEffect(() => {
    const track = transitionTrackRef.current;
    if (!track) return;

    if (stage === 'intro') {
      gsap.set(track, { y: 0 });
      return;
    }

    if (stage === 'entered') {
      gsap.set(track, { clearProps: 'transform' });
      return;
    }

    if (stage !== 'transitioning') return;

    const introHeight = introPanelRef.current?.getBoundingClientRect().height;
    const travel = introHeight && introHeight > 0 ? introHeight : window.innerHeight;
    gsap.set(track, { y: 0 });

    const timeline = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = '';
        completeTransition();
      },
    });

    timeline.to(
      track,
      {
        y: -travel,
        duration: 1.1,
        ease: 'power3.inOut',
      },
      0
    );

    timeline.call(triggerCardEntrance, [], 0.94);
    timeline.call(triggerHeroEntrance, [], 1.0);

    return () => {
      timeline.kill();
    };
  }, [stage, triggerCardEntrance, triggerHeroEntrance, completeTransition]);

  return (
    <>
      <div
        className={`relative z-30 w-full ${
          isIntroActive ? '-mt-[72px] h-[100dvh] overflow-hidden' : ''
        }`}
      >
        <div
          ref={transitionTrackRef}
          className={`w-full ${isIntroActive ? 'will-change-transform' : ''}`}
        >
          {isIntroActive && (
            <div ref={introPanelRef} className="h-[100dvh] w-full overflow-hidden">
              <Intro />
            </div>
          )}

          <div
            className={`min-h-screen bg-[var(--color-bg)] transition-colors duration-300 ${
              isIntroActive ? 'min-h-[100dvh] pt-[72px]' : ''
            }`}
          >
            <Hero />
            <About />
            <PortfolioShowcase />
            <Services />
            <Contact />
          </div>
        </div>
      </div>
    </>
  );
};
