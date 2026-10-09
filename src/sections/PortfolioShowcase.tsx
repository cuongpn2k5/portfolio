import React, { useState, useRef, useEffect } from 'react';
import { FolderGit2, Award, Cpu, AlertCircle } from 'lucide-react';
import { projectsData } from '../data/projects';
import { certificatesData } from '../data/certificates';
import { ProjectCard } from '../components/portfolio/ProjectCard';
import { CertificateCard } from '../components/portfolio/CertificateCard';
import { TechGrid } from '../components/portfolio/TechGrid';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { gsap } from '../utils/gsap';

type TabKey = 'projects' | 'certificates' | 'tech';

interface TabItem {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

export const PortfolioShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('projects');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const tabListRef = useRef<HTMLDivElement>(null);
  const activePanelRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const hasRevealedRef = useRef(false);

  const tabs: TabItem[] = [
    {
      key: 'projects',
      label: 'Projects',
      icon: <FolderGit2 className="w-4 h-4" />,
      count: projectsData.length,
    },
    {
      key: 'certificates',
      label: 'Certificates',
      icon: <Award className="w-4 h-4" />,
      count: certificatesData.length,
    },
    {
      key: 'tech',
      label: 'Tech Stack',
      icon: <Cpu className="w-4 h-4" />,
    },
  ];

  // Initial Section Entrance Animation with ScrollTrigger
  useEffect(() => {
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          once: true,
        },
        onComplete: () => {
          hasRevealedRef.current = true;
        },
        defaults: { ease: 'power3.out' },
      });

      // 1. Main Title & Subtitle upward reveal
      tl.fromTo(
        '[data-portfolio-heading] > *',
        { opacity: 0, y: 38 },
        { opacity: 1, y: 0, duration: 0.75, stagger: 0.1 }
      );

      // 2. Tabs sequential appearance
      tl.fromTo(
        '[data-portfolio-tab]',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 },
        '-=0.45'
      );

      // 3. Project Cards staggered upward reveal
      tl.fromTo(
        '[data-portfolio-card]',
        { opacity: 0, y: 42 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.09, ease: 'power3.out' },
        '-=0.35'
      );
    }, containerRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  // Smooth Tab Switching Handler
  const handleTabChange = (newTab: TabKey) => {
    if (newTab === activeTab || isTransitioning) return;

    if (prefersReducedMotion) {
      setActiveTab(newTab);
      return;
    }

    const currentPanel = activePanelRef.current;
    if (currentPanel) {
      setIsTransitioning(true);
      gsap.to(currentPanel, {
        opacity: 0,
        y: -10,
        duration: 0.18,
        ease: 'power2.in',
        onComplete: () => {
          setActiveTab(newTab);
          setIsTransitioning(false);
        },
      });
    } else {
      setActiveTab(newTab);
    }
  };

  // Animate incoming tab panel after tab state updates
  useEffect(() => {
    if (prefersReducedMotion || !hasRevealedRef.current || !activePanelRef.current) return;

    const panel = activePanelRef.current;
    gsap.fromTo(
      panel,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.38, ease: 'power3.out' }
    );

    const cards = panel.querySelectorAll('[data-portfolio-card]');
    if (cards.length > 0) {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: 'power3.out' }
      );
    }
  }, [activeTab, prefersReducedMotion]);

  // Accessible keyboard navigation across tabs
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index;
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    handleTabChange(tabs[nextIndex].key);
    const buttons = tabListRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    if (buttons && buttons[nextIndex]) {
      buttons[nextIndex].focus();
    }
  };

  return (
    <section
      ref={containerRef}
      id="portfolio"
      className="py-20 lg:py-28 border-t border-[var(--color-border)] bg-[var(--color-bg)] transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div data-portfolio-heading className="max-w-2xl mb-12 text-left">
          <div className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-[var(--color-accent)] mb-2">
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Showcase & Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--color-text)]">
            Portfolio Showcase.
          </h2>
          <p className="text-sm sm:text-base text-[var(--color-text-muted)] mt-3">
            Explore web applications, verified credentials, and active technical toolsets.
          </p>
        </div>

        {/* Tab Navigation List */}
        <div
          ref={tabListRef}
          role="tablist"
          aria-label="Portfolio Showcase Tabs"
          className="flex space-x-2 border-b border-[var(--color-border)] mb-10 overflow-x-auto pb-1"
        >
          {tabs.map((tab, idx) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                role="tab"
                data-portfolio-tab
                id={`tab-${tab.key}`}
                aria-selected={isActive}
                aria-controls={`panel-${tab.key}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => handleTabChange(tab.key)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className={`flex items-center space-x-2 px-5 py-3 text-sm font-medium border-b-2 -mb-[2px] transition-all cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] rounded-t-lg ${
                  isActive
                    ? 'border-[var(--color-accent)] text-[var(--color-text)] bg-[var(--color-surface)]/50'
                    : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span
                    className={`ml-1.5 text-xs font-mono px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
                        : 'bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Panels with ref on the active panel */}
        {/* Projects Tab */}
        <div
          ref={activeTab === 'projects' ? activePanelRef : undefined}
          role="tabpanel"
          id="panel-projects"
          aria-labelledby="tab-projects"
          hidden={activeTab !== 'projects'}
          className={activeTab === 'projects' ? 'block' : 'hidden'}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectsData.map((project) => (
              <div key={project.id} data-portfolio-card>
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        </div>

        {/* Certificates Tab */}
        <div
          ref={activeTab === 'certificates' ? activePanelRef : undefined}
          role="tabpanel"
          id="panel-certificates"
          aria-labelledby="tab-certificates"
          hidden={activeTab !== 'certificates'}
          className={activeTab === 'certificates' ? 'block' : 'hidden'}
        >
          {certificatesData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificatesData.map((cert) => (
                <div key={cert.id} data-portfolio-card>
                  <CertificateCard certificate={cert} />
                </div>
              ))}
            </div>
          ) : (
            /* Clear, elegant empty state */
            <div className="max-w-md mx-auto py-16 px-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-[var(--color-surface-raised)] flex items-center justify-center text-[var(--color-text-muted)]">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--color-text)]">
                Certificates Updating Soon
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                Official certificates and course credentials are currently being verified and will be published once completed.
              </p>
              <div className="text-[11px] font-mono text-[var(--color-accent)]">
                No simulated certificates displayed
              </div>
            </div>
          )}
        </div>

        {/* Tech Stack Tab */}
        <div
          ref={activeTab === 'tech' ? activePanelRef : undefined}
          role="tabpanel"
          id="panel-tech"
          aria-labelledby="tab-tech"
          hidden={activeTab !== 'tech'}
          className={activeTab === 'tech' ? 'block' : 'hidden'}
        >
          <TechGrid />
        </div>
      </div>
    </section>
  );
};
