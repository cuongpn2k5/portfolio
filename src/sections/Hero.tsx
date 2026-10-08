import React, { Suspense, lazy, useRef, useEffect } from 'react';
import { ArrowRight, User, Sparkles } from 'lucide-react';
import { gsap } from 'gsap';
import { profileData } from '../data/profile';
import { Button } from '../components/common/Button';
import { useIntroTransition } from '../hooks/useIntroTransition';

const HangingIDCard = lazy(() =>
  import('../components/three/HangingIDCard').then((module) => ({
    default: module.HangingIDCard,
  }))
);

export const Hero: React.FC = () => {
  const { heroEntranceTrigger, isIntroActive } = useIntroTransition();

  const introBadgeRef = useRef<HTMLDivElement>(null);
  const headingLine1Ref = useRef<HTMLSpanElement>(null);
  const headingLine2Ref = useRef<HTMLSpanElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const badgesContainerRef = useRef<HTMLDivElement>(null);
  const ctaContainerRef = useRef<HTMLDivElement>(null);
  const heroAnimationStartedRef = useRef(false);
  const heroAnimationContextRef = useRef<ReturnType<typeof gsap.context> | null>(null);

  useEffect(() => {
    const animatedElements = [
      introBadgeRef.current,
      headingLine1Ref.current,
      headingLine2Ref.current,
      descriptionRef.current,
      ...(badgesContainerRef.current ? Array.from(badgesContainerRef.current.children) : []),
      ...(ctaContainerRef.current ? Array.from(ctaContainerRef.current.children) : []),
    ].filter(Boolean);

    if (!heroEntranceTrigger) return;

    // Once started, the timeline owns its lifecycle even when the global stage
    // changes to `entered`. This prevents that state update from reverting it.
    if (heroAnimationStartedRef.current) return;

    // Direct visits, refreshes after Intro, reduced motion, and Skip Intro all
    // start in the safe visible state without relying on a timeline completing.
    if (!isIntroActive) {
      gsap.set(animatedElements, { clearProps: 'opacity,transform,filter' });
      return;
    }

    heroAnimationStartedRef.current = true;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => {
          gsap.set(animatedElements, { clearProps: 'opacity,transform,filter' });
        },
      });

      // A. Small introductory badge (0.0s relative = 1.0s after transition start)
      if (introBadgeRef.current) {
        tl.fromTo(
          introBadgeRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
          0.0
        );
      }

      // B. Main heading (0.15s relative = 1.15s after transition start)
      if (headingLine1Ref.current) {
        tl.fromTo(
          headingLine1Ref.current,
          { opacity: 0, yPercent: 110 },
          { opacity: 1, yPercent: 0, duration: 0.55 },
          0.15
        );
      }
      if (headingLine2Ref.current) {
        tl.fromTo(
          headingLine2Ref.current,
          { opacity: 0, yPercent: 110 },
          { opacity: 1, yPercent: 0, duration: 0.55 },
          0.28
        );
      }

      // C. Description paragraph (0.55s relative = 1.55s after transition start)
      if (descriptionRef.current) {
        tl.fromTo(
          descriptionRef.current,
          { opacity: 0, y: 25, filter: 'blur(6px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.55 },
          0.55
        );
      }

      // D. Availability and location badges (0.8s relative = 1.8s after transition start)
      if (badgesContainerRef.current) {
        tl.fromTo(
          badgesContainerRef.current.children,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, stagger: 0.1, duration: 0.4, ease: 'power2.out' },
          0.8
        );
      }

      // E. CTA buttons (1.0s relative = 2.0s after transition start)
      if (ctaContainerRef.current) {
        tl.fromTo(
          ctaContainerRef.current.children,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, stagger: 0.1, duration: 0.45 },
          1.0
        );
      }
    });
    heroAnimationContextRef.current = ctx;
  }, [heroEntranceTrigger, isIntroActive]);

  useEffect(() => {
    const animatedElements = [
      introBadgeRef.current,
      headingLine1Ref.current,
      headingLine2Ref.current,
      descriptionRef.current,
      ...(badgesContainerRef.current ? Array.from(badgesContainerRef.current.children) : []),
      ...(ctaContainerRef.current ? Array.from(ctaContainerRef.current.children) : []),
    ].filter(Boolean);

    return () => {
      heroAnimationContextRef.current?.revert();
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

  const isInitialHidden = isIntroActive && !heroEntranceTrigger;

  return (
    <section
      id="home"
      className="relative min-h-[calc(100vh-72px)] flex items-center justify-center py-12 lg:py-20 bg-subtle-grid"
    >
      {/* ── Viewport-Sized Interactive 3D Hanging ID Card Layer ── */}
      <div className="absolute inset-x-0 -top-[72px] bottom-0 z-20 pointer-events-none overflow-visible">
        <Suspense fallback={null}>
          <HangingIDCard profile={profileData} />
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
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[var(--color-text)] leading-[1.05]">
              <div className="overflow-hidden py-0.5">
                <span
                  ref={headingLine1Ref}
                  className={`block will-change-transform ${isInitialHidden ? 'opacity-0' : ''}`}
                >
                  Full-stack
                </span>
              </div>
              <div className="overflow-hidden py-0.5">
                <span
                  ref={headingLine2Ref}
                  className={`block text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-text)] via-[var(--color-text)] to-[var(--color-accent)] will-change-transform ${
                    isInitialHidden ? 'opacity-0' : ''
                  }`}
                >
                  Developer.
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

            {/* Call to action buttons */}
            <div
              ref={ctaContainerRef}
              className="pt-4 flex flex-wrap gap-4 items-center"
            >
              <div className={isInitialHidden ? 'opacity-0' : ''}>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => scrollTo('portfolio')}
                  aria-label="View Projects in Portfolio"
                >
                  <span>View Projects</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <div className={isInitialHidden ? 'opacity-0' : ''}>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => scrollTo('about')}
                  aria-label="Navigate to About Me section"
                >
                  <User className="w-4 h-4 mr-1" />
                  <span>About Me</span>
                </Button>
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
