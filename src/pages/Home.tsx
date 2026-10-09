import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../utils/gsap';
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
    cardEntranceTrigger,
    triggerCardEntrance,
    triggerHeroEntrance,
    completeTransition,
  } = useIntroTransition();

  const transitionTrackRef = useRef<HTMLDivElement>(null);
  const introPanelRef = useRef<HTMLDivElement>(null);

  // Manage body scroll lock during Intro and Page Transition
  useEffect(() => {
    if (!isIntroActive) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
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
      // Layout has transitioned from 100dvh locked track to normal document flow.
      // Refresh all ScrollTrigger instances so section triggers calculate correct scroll offsets.
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
      return;
    }

    if (stage !== 'transitioning') return;

    const introHeight = introPanelRef.current?.getBoundingClientRect().height;
    const travel = introHeight && introHeight > 0 ? introHeight : window.innerHeight;
    gsap.set(track, { y: 0 });

    const timeline = gsap.timeline({
      onComplete: completeTransition,
    });

    timeline.to(
      track,
      {
        y: -travel,
        duration: 0.85,
        ease: 'power3.inOut',
      },
      0
    );

    // Release while Home is still rising; the physical drop overlaps the
    // shared track movement instead of waiting for a separate scene handoff.
    timeline.call(triggerCardEntrance, [], 0.18);
    timeline.call(triggerHeroEntrance, [], 0.5);

    // A resize ends the slide safely rather than leaving a stale viewport
    // offset. The watchdog also releases Home if the timeline is interrupted.
    const fallback = window.setTimeout(completeTransition, 1450);
    window.addEventListener('resize', completeTransition);

    return () => {
      timeline.kill();
      window.clearTimeout(fallback);
      window.removeEventListener('resize', completeTransition);
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
          data-intro-track
          data-stage={stage}
          data-card-entrance={cardEntranceTrigger ? 'released' : 'waiting'}
          className={`w-full ${isIntroActive ? 'will-change-transform' : ''}`}
        >
          {/* Keep the sibling stable so removing Intro never remounts Home/Canvas. */}
          <div
            ref={introPanelRef}
            data-intro-panel
            className={isIntroActive ? 'h-[100dvh] w-full overflow-hidden' : 'hidden'}
          >
            {isIntroActive && <Intro />}
          </div>

          <div
            data-home-panel
            inert={isIntroActive}
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
