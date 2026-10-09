import React, { Suspense, lazy, useRef, useEffect, useLayoutEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { profileData } from '../data/profile';
import { useIntroTransition } from '../hooks/useIntroTransition';
import { useReducedMotion } from '../hooks/useReducedMotion';

gsap.registerPlugin(SplitText);

const HangingIDCard = lazy(() =>
  import('../components/three/HangingIDCard').then((module) => ({
    default: module.HangingIDCard,
  }))
);

export const Hero: React.FC = () => {
  const { heroEntranceTrigger, isIntroActive } = useIntroTransition();
  const prefersReducedMotion = useReducedMotion();
  // Preserve the pending drop even if the lazy scene finishes loading later.
  const [cardEntrancePending] = useState(isIntroActive);

  const introBadgeRef = useRef<HTMLDivElement>(null);
  const headingLine1Ref = useRef<HTMLSpanElement>(null);
  const headingLine2Ref = useRef<HTMLSpanElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const badgesContainerRef = useRef<HTMLDivElement>(null);
  const ctaContainerRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const scrollArrowRef = useRef<HTMLSpanElement>(null);
  const heroAnimationStartedRef = useRef(false);
  const heroAnimationContextRef = useRef<ReturnType<typeof gsap.context> | null>(null);
  const heroFallbackRef = useRef<number | null>(null);
  const splitsRef = useRef<SplitText[]>([]);
  const arrowTweenRef = useRef<gsap.core.Tween | null>(null);

  useLayoutEffect(() => {
    const animatedElements = [
      introBadgeRef.current,
      headingLine1Ref.current,
      headingLine2Ref.current,
      descriptionRef.current,
      ...(badgesContainerRef.current ? Array.from(badgesContainerRef.current.children) : []),
      ...(ctaContainerRef.current ? Array.from(ctaContainerRef.current.querySelectorAll(':scope > div:first-child > button')) : []),
      scrollIndicatorRef.current,
    ].filter(Boolean);

    const showContent = () => {
      splitsRef.current.forEach(split => split.revert());
      splitsRef.current = [];
      gsap.set(animatedElements, { clearProps: 'opacity,transform,filter' });
    };

    if (prefersReducedMotion) {
      heroAnimationContextRef.current?.kill();
      arrowTweenRef.current?.kill();
      gsap.set(scrollArrowRef.current, { clearProps: 'transform' });
      showContent();
      return;
    }
    if (!heroEntranceTrigger) return;

    // Once started, the timeline owns its lifecycle even when the global stage
    // changes to `entered`. This prevents that state update from reverting it.
    if (heroAnimationStartedRef.current) return;

    // Direct visits, refreshes after Intro, reduced motion, and Skip Intro all
    // start in the safe visible state without relying on a timeline completing.
    if (!isIntroActive) {
      showContent();
      if (!arrowTweenRef.current && scrollArrowRef.current) {
        arrowTweenRef.current = gsap.to(scrollArrowRef.current, {
          y: 5, duration: 1.8, repeat: -1, yoyo: true, ease: 'sine.inOut',
        });
      }
      return;
    }

    heroAnimationStartedRef.current = true;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => {
          if (heroFallbackRef.current !== null) window.clearTimeout(heroFallbackRef.current);
          showContent();
        },
      });

      // A. Small introductory badge
      if (introBadgeRef.current) {
        tl.fromTo(
          introBadgeRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7 },
          0.0
        );
      }

      // B. Main heading
      const revealHeading = (element: HTMLSpanElement | null, start: number) => {
        if (!element) return;
        const originalBackground = element.style.backgroundImage;
        const split = SplitText.create(element, {
          type: 'chars', mask: 'chars', aria: 'auto', charsClass: 'hero-character',
          onRevert: () => { element.style.backgroundImage = originalBackground; },
        });
        // Give descenders and Vietnamese marks room in both the mask and the
        // background-clipped glyph box, without changing the line's spacing.
        gsap.set(split.masks, { overflowClipMargin: '0.2em' });
        gsap.set(split.chars, {
          paddingTop: '0.2em', paddingBottom: '0.2em',
          marginTop: '-0.2em', marginBottom: '-0.2em',
        });
        // Background-clipped text needs its paint on the moving characters.
        // Align every character to the original full-line gradient.
        const background = getComputedStyle(element).backgroundImage;
        if (background !== 'none') {
          const bounds = element.getBoundingClientRect();
          split.chars.forEach(character => {
            const offset = character.getBoundingClientRect().left - bounds.left;
            gsap.set(character, {
              backgroundImage: background,
              backgroundSize: `${bounds.width}px 100%`,
              backgroundPosition: `${-offset}px 0`,
              backgroundClip: 'text',
            });
          });
          // Paint the gradient only once while characters move, then restore
          // the original full-line background when the split is reverted.
          element.style.backgroundImage = 'none';
        }
        splitsRef.current.push(split);
        tl.fromTo(
          split.chars,
          { opacity: 0, yPercent: 110 },
          { opacity: 1, yPercent: 0, duration: 0.9, stagger: 0.055 },
          start
        );
      };
      revealHeading(headingLine1Ref.current, 0.18);
      revealHeading(headingLine2Ref.current, 0.48);

      // C. Description paragraph
      if (descriptionRef.current) {
        const split = SplitText.create(descriptionRef.current, {
          type: 'lines', autoSplit: true, aria: 'auto', linesClass: 'hero-description-line',
          onSplit(self) {
            const tween = gsap.fromTo(self.lines,
              { opacity: 0, y: 25 },
              { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out' }
            );
            tl.add(tween, 1.05);
            return tween;
          },
        });
        splitsRef.current.push(split);
      }

      // D. Availability and location badges
      if (badgesContainerRef.current) {
        tl.fromTo(
          badgesContainerRef.current.children,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, stagger: 0.12, duration: 0.55 },
          1.75
        );
      }

      // E. CTA buttons
      if (ctaContainerRef.current) {
        tl.fromTo(
          ctaContainerRef.current.querySelectorAll(':scope > div:first-child > button'),
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, stagger: 0.14, duration: 0.65 },
          2.05
        );
      }
      if (scrollIndicatorRef.current) {
        tl.fromTo(scrollIndicatorRef.current,
          { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6 }, 2.48);
      }
      tl.call(() => {
        if (scrollArrowRef.current) {
          arrowTweenRef.current = gsap.to(scrollArrowRef.current, {
            y: 5, duration: 1.8, repeat: -1, yoyo: true, ease: 'sine.inOut',
          });
        }
      }, [], 3.08);
    });
    heroAnimationContextRef.current = ctx;
    // Interrupted timelines must never leave the landing content invisible.
    heroFallbackRef.current = window.setTimeout(() => {
      ctx.kill();
      showContent();
    }, 4500);
  }, [heroEntranceTrigger, isIntroActive, prefersReducedMotion]);

  useEffect(() => {
    const animatedElements = [
      introBadgeRef.current,
      headingLine1Ref.current,
      headingLine2Ref.current,
      descriptionRef.current,
      ...(badgesContainerRef.current ? Array.from(badgesContainerRef.current.children) : []),
      ...(ctaContainerRef.current ? Array.from(ctaContainerRef.current.querySelectorAll(':scope > div:first-child > button')) : []),
      scrollIndicatorRef.current,
    ].filter(Boolean);

    return () => {
      if (heroFallbackRef.current !== null) window.clearTimeout(heroFallbackRef.current);
      heroAnimationContextRef.current?.revert();
      arrowTweenRef.current?.kill();
      arrowTweenRef.current = null;
      splitsRef.current.forEach(split => split.revert());
      splitsRef.current = [];
      heroAnimationContextRef.current = null;
      heroAnimationStartedRef.current = false;
      gsap.set(animatedElements, { clearProps: 'opacity,transform,filter' });
    };
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isInitialHidden = isIntroActive && !heroEntranceTrigger && !prefersReducedMotion;

  return (
    <section
      id="home"
      className="relative min-h-[calc(100vh-72px)] flex items-center justify-center py-12 lg:py-20 bg-subtle-grid"
    >
      {/* ── Viewport-Sized Interactive 3D Hanging ID Card Layer ── */}
      <div className="absolute inset-x-0 -top-[72px] bottom-0 z-20 pointer-events-none overflow-visible">
        <Suspense fallback={null}>
          <HangingIDCard profile={profileData} entrancePending={cardEntrancePending} />
        </Suspense>
      </div>

      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--color-accent)]/8 rounded-full blur-3xl pointer-events-none" />

      {/* ── Hero Content Layer ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 pointer-events-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Hero Typography & CTAs */}
          <div className="lg:col-span-7 flex flex-col space-y-6 text-left">
            {/* Developer Tag */}
            <div
              ref={introBadgeRef}
              className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-mono text-[var(--color-accent)] w-fit shadow-xs will-change-transform ${
                isInitialHidden ? 'opacity-0' : ''
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{profileData.education.status}</span>
              <span className="text-[var(--color-border)]">•</span>
              <span className="text-[var(--color-text-muted)]">Portfolio 2026</span>
            </div>

            {/* Main Heading with overflow-hidden text masks */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[var(--color-text)] leading-[1.12] sm:leading-[1.1]">
              <div className="overflow-hidden pt-2 pb-2.5 sm:pt-3 sm:pb-3.5 -my-2 sm:-my-3">
                <span
                  ref={headingLine1Ref}
                  className={`block will-change-transform ${isInitialHidden ? 'opacity-0' : ''}`}
                >
                  Phan Nhật
                </span>
              </div>
              <div className="overflow-hidden pt-1 pb-4 sm:pb-5 -mt-1 -mb-4 sm:-mb-5">
                <span
                  ref={headingLine2Ref}
                  className={`block text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-text)] via-[var(--color-text)] to-[var(--color-accent)] will-change-transform pb-1 sm:pb-1.5 ${
                    isInitialHidden ? 'opacity-0' : ''
                  }`}
                >
                  Cường.
                </span>
              </div>
            </h1>

            {/* Subtitle / Intro Description */}
            <p
              ref={descriptionRef}
              className={`text-base sm:text-lg text-[var(--color-text-muted)] max-w-2xl leading-relaxed will-change-transform ${
                isInitialHidden ? 'opacity-0' : ''
              }`}
            >
              {profileData.subtitle}
            </p>

            {/* Highlights list */}
            <div
              ref={badgesContainerRef}
              className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-[var(--color-text-muted)]"
            >
              <div
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[var(--color-surface-raised)] border border-[var(--color-border)] will-change-transform ${
                  isInitialHidden ? 'opacity-0' : ''
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{profileData.availability}</span>
              </div>
              <div
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[var(--color-surface-raised)] border border-[var(--color-border)] will-change-transform ${
                  isInitialHidden ? 'opacity-0' : ''
                }`}
              >
                <span>Location: {profileData.location}</span>
              </div>
            </div>

            {/* Interactive Explorer Links & Scroll Indicator */}
            <div
              ref={ctaContainerRef}
              className="pt-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6"
            >
              {/* Left: Quick exploration links */}
              <div
                className="flex flex-col space-y-2 text-xs sm:text-sm font-mono text-[var(--color-text-muted)]"
              >
                <button
                  type="button"
                  onClick={() => scrollTo('portfolio')}
                  className={`inline-flex items-center space-x-2.5 text-left hover:text-[var(--color-text)] transition-colors cursor-pointer group w-fit focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] rounded py-0.5 ${isInitialHidden ? 'opacity-0' : ''}`}
                >
                  <span className="text-[var(--color-accent)] group-hover:translate-y-0.5 transition-transform duration-200 select-none">↓</span>
                  <span>explore my work below</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo('contact')}
                  className={`inline-flex items-center space-x-2.5 text-left hover:text-[var(--color-text)] transition-colors cursor-pointer group w-fit focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] rounded py-0.5 ${isInitialHidden ? 'opacity-0' : ''}`}
                >
                  <span className="text-[var(--color-accent)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200 select-none">↗</span>
                  <span>open to full-time & freelance opportunities</span>
                </button>
              </div>

              {/* Right: SCROLL ↓ indicator */}
              <div
                ref={scrollIndicatorRef}
                className={`will-change-transform self-start sm:self-end ${
                  isInitialHidden ? 'opacity-0' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => scrollTo('about')}
                  className="inline-flex items-center space-x-2 text-xs font-mono tracking-widest uppercase text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer group focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] rounded py-1"
                  aria-label="Scroll down to About section"
                >
                  <span>SCROLL</span>
                  <span className="text-[var(--color-accent)] group-hover:translate-y-0.5 transition-transform duration-200 select-none"><span ref={scrollArrowRef} className="inline-block">↓</span></span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Visual spacer reserving space for the hanging ID card */}
          <div
            className="hidden lg:block lg:col-span-5 min-h-[500px] pointer-events-none"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
};
