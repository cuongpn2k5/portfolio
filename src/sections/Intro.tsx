import React, { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { Code2, Sparkles, Globe, FastForward } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useIntroTransition } from '../hooks/useIntroTransition';

export const Intro: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const { stage, startTransition, skipAll } = useIntroTransition();

  const containerRef = useRef<HTMLDivElement>(null);
  const iconsRef = useRef<HTMLDivElement>(null);
  const welcomeRef = useRef<HTMLSpanElement>(null);
  const toMyRef = useRef<HTMLSpanElement>(null);
  const portfolioTitleRef = useRef<HTMLHeadingElement>(null);
  const urlPillRef = useRef<HTMLDivElement>(null);

  const handleSkip = useCallback(() => {
    gsap.killTweensOf('*');
    skipAll();
  }, [skipAll]);

  useEffect(() => {
    if (stage !== 'intro' || prefersReducedMotion) {
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
      });

      // ── Step 1: 3 Circular Icons appear first ──
      tl.fromTo(
        '.intro-icon-item',
        { opacity: 0, y: 16, scale: 0.8 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.08,
          duration: 0.38,
          ease: 'back.out(1.2)',
        }
      );

      // ── Step 2: “Welcome” enters from right to left ──
      tl.fromTo(
        welcomeRef.current,
        { opacity: 0, x: 45 },
        {
          opacity: 1,
          x: 0,
          duration: 0.45,
        },
        '+=0.06'
      );

      // ── Step 3: “to my” enters from the left ──
      tl.fromTo(
        toMyRef.current,
        { opacity: 0, x: -35 },
        {
          opacity: 1,
          x: 0,
          duration: 0.45,
        },
        '+=0.04'
      );

      // ── Step 4: “Portfolio Website” rises from below ──
      tl.fromTo(
        portfolioTitleRef.current,
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
        },
        '+=0.06'
      );

      // ── Step 5: URL / small label appears last ──
      tl.fromTo(
        urlPillRef.current,
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: 'power2.out',
        },
        '+=0.06'
      );

      // Keep the hold and the page-transition signal in the same GSAP
      // timeline so there is no detached timeout or stale transition callback.
      tl.call(startTransition, [], '+=0.5');
    }, containerRef);

    return () => ctx.revert();
  }, [stage, prefersReducedMotion, startTransition]);

  if (stage === 'entered') return null;

  return (
    <div
      ref={containerRef}
      className="relative h-full min-h-[100dvh] w-full flex flex-col items-center justify-center bg-black text-white select-none overflow-hidden"
      role="dialog"
      aria-label="Welcome Intro Screen"
      aria-modal="true"
    >
      {/* Subtle radial ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,rgba(0,0,0,0.98)_70%)] pointer-events-none" />

      {/* Skip Button */}
      <div className="absolute top-6 right-6 z-20">
        <button
          type="button"
          onClick={handleSkip}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium text-neutral-400 hover:text-white bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800/80 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
          aria-label="Skip introductory animation"
        >
          <span>Skip</span>
          <FastForward className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Centered Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto">
        {/* Step 1: 3 Circular Icons Centered Near Top */}
        <div ref={iconsRef} className="flex items-center justify-center space-x-3.5 mb-6 sm:mb-8">
          <div className="intro-icon-item opacity-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#121214] border border-white/[0.08] flex items-center justify-center text-neutral-400 shadow-xl shadow-black/60">
            <Code2 className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-300" />
          </div>
          <div className="intro-icon-item opacity-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#121214] border border-white/[0.08] flex items-center justify-center text-white shadow-xl shadow-black/60">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="intro-icon-item opacity-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#121214] border border-white/[0.08] flex items-center justify-center text-neutral-400 shadow-xl shadow-black/60">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-300" />
          </div>
        </div>

        {/* Step 2 & 3: Top Line ("Welcome" from right, "to my" from left) */}
        <div className="py-1 px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal tracking-tight flex items-center justify-center gap-2.5 sm:gap-3">
            <span
              ref={welcomeRef}
              className="inline-block opacity-0 text-white font-semibold will-change-transform"
            >
              Welcome
            </span>
            <span
              ref={toMyRef}
              className="inline-block opacity-0 text-neutral-400 font-light will-change-transform"
            >
              to my
            </span>
          </h2>
        </div>

        {/* Step 4: Second Line ("Portfolio Website" rising from below) */}
        <div className="py-2 px-4 mt-1 sm:mt-2">
          <h1
            ref={portfolioTitleRef}
            className="opacity-0 text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-tight will-change-transform"
          >
            Portfolio Website
          </h1>
        </div>

        {/* Step 5: Small Rounded Pill-style URL Label Below the Main Title */}
        <div ref={urlPillRef} className="opacity-0 mt-6 sm:mt-8 will-change-transform">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#141416] border border-white/[0.08] text-xs font-mono text-neutral-300 shadow-lg shadow-black/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="tracking-wide">phannhatcuong.dev</span>
          </div>
        </div>
      </div>
    </div>
  );
};
