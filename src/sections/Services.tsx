import React, { useState, useEffect, useRef } from 'react';
import { Layers, ChevronDown, CheckCircle2, Globe, Server, Smartphone } from 'lucide-react';
import { servicesData } from '../data/services';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { gsap } from '../utils/gsap';

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  Globe: <Globe className="w-5 h-5" />,
  Server: <Server className="w-5 h-5" />,
  Smartphone: <Smartphone className="w-5 h-5" />,
  Layers: <Layers className="w-5 h-5" />,
};

export const Services: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(servicesData[0]?.id || null);
  const containerRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          once: true,
        },
        defaults: { ease: 'power3.out' },
      });

      // 1. Tag badge reveal
      tl.fromTo(
        '[data-services-tag]',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 }
      );

      // 2. Heading text-mask reveal from below
      tl.fromTo(
        '[data-services-heading-title]',
        { yPercent: 100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.85, ease: 'power3.out' },
        '-=0.45'
      );

      // 3. Subtitle / description
      tl.fromTo(
        '[data-services-desc]',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7 },
        '-=0.55'
      );

      // 4. Expanding divider lines from left to right
      tl.fromTo(
        '[data-services-divider]',
        { scaleX: 0 },
        { scaleX: 1, duration: 0.85, stagger: 0.08, ease: 'power2.inOut' },
        '-=0.5'
      );

      // 5. Service rows sequential upward reveal
      tl.fromTo(
        '[data-services-row]',
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 0.75, stagger: 0.12, ease: 'power3.out' },
        '-=0.65'
      );
    }, containerRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={containerRef}
      id="services"
      className="py-20 lg:py-28 border-t border-[var(--color-border)] bg-[var(--color-bg)] transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Text Mask */}
        <div className="max-w-2xl mb-16 text-left">
          <div
            data-services-tag
            className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-[var(--color-accent)] mb-2"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Core Capabilities</span>
          </div>

          <div className="overflow-hidden py-1">
            <h2
              data-services-heading-title
              className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--color-text)]"
            >
              Services & Focus.
            </h2>
          </div>

          <p
            data-services-desc
            className="text-sm sm:text-base text-[var(--color-text-muted)] mt-3"
          >
            Core technical proficiencies and development services tailored for modern digital applications.
          </p>
        </div>

        {/* Vertical List of Services with Animated Expanding Dividers */}
        <div className="text-left">
          {/* Top Divider */}
          <div
            data-services-divider
            className="h-px bg-[var(--color-border)] w-full origin-left"
          />

          {servicesData.map((service, idx) => {
            const isExpanded = expandedId === service.id;
            return (
              <React.Fragment key={service.id}>
                <div
                  data-services-row
                  className="py-8 transition-colors duration-200 hover:bg-[var(--color-surface)]/50 px-3 sm:px-6 rounded-2xl my-1 group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Service Number & Title */}
                    <div className="flex items-start sm:items-center space-x-4">
                      <span className="text-xs font-mono text-[var(--color-text-muted)] pt-1 sm:pt-0 group-hover:text-[var(--color-accent)] transition-colors">
                        0{idx + 1}
                      </span>
                      <div className="p-2.5 rounded-xl bg-[var(--color-surface-raised)] text-[var(--color-accent)] border border-[var(--color-border)] transition-transform duration-200 group-hover:scale-105">
                        {SERVICE_ICONS[service.icon] || <Layers className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-2xl font-bold text-[var(--color-text)]">
                          {service.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-0.5">
                          {service.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Toggle button */}
                    <div className="flex items-center self-end md:self-center">
                      <button
                        type="button"
                        onClick={() => toggleExpand(service.id)}
                        aria-expanded={isExpanded}
                        aria-controls={`service-desc-${service.id}`}
                        className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-mono font-medium text-[var(--color-text)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-raised)] border border-[var(--color-border)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] cursor-pointer"
                      >
                        <span>{isExpanded ? 'Hide Details' : 'View Capabilities'}</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Expandable details panel */}
                  {isExpanded && (
                    <div
                      id={`service-desc-${service.id}`}
                      className="mt-6 pt-6 border-t border-[var(--color-border)]/60 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn"
                    >
                      <p className="lg:col-span-5 text-sm text-[var(--color-text-muted)] leading-relaxed">
                        {service.description}
                      </p>

                      <div className="lg:col-span-7">
                        <div className="text-xs font-mono uppercase text-[var(--color-text)] mb-3">
                          Technical Highlights
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {service.capabilities.map((cap) => (
                            <div
                              key={cap}
                              className="flex items-center space-x-2 text-xs text-[var(--color-text-muted)] p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/40 transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>{cap}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Divider Line between and after rows */}
                <div
                  data-services-divider
                  className="h-px bg-[var(--color-border)] w-full origin-left"
                />
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
};
