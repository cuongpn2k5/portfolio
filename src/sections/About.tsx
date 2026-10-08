import React from 'react';
import { User, GraduationCap, FileText, ArrowRight, Code, Layers, Compass } from 'lucide-react';
import { profileData } from '../data/profile';
import { Button } from '../components/common/Button';

export const About: React.FC = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="about"
      className="py-20 lg:py-28 border-t border-[var(--color-border)] bg-[var(--color-bg)] transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-16 text-left">
          <div className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-[var(--color-accent)] mb-2">
            <User className="w-3.5 h-3.5" />
            <span>Profile & Background</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--color-text)]">
            About Me.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Developer Card & Education */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs space-y-6">
              {/* Portrait / Avatar Placeholder */}
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-2xl bg-[var(--color-surface-raised)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-accent)] shadow-inner">
                  <User className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--color-text)]">
                    {profileData.name}
                  </h3>
                  <p className="text-sm font-medium text-[var(--color-accent)]">
                    {profileData.role}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] font-mono mt-1">
                    {profileData.location}
                  </p>
                </div>
              </div>

              {/* Education Box */}
              <div className="p-4 rounded-xl bg-[var(--color-surface-raised)] border border-[var(--color-border)] space-y-2">
                <div className="flex items-center space-x-2 text-xs font-mono text-[var(--color-accent)]">
                  <GraduationCap className="w-4 h-4" />
                  <span>Academic Status</span>
                </div>
                <div className="text-sm font-semibold text-[var(--color-text)]">
                  {profileData.education.status}
                </div>
                <div className="text-xs text-[var(--color-text-muted)]">
                  Major: {profileData.education.major}
                </div>
              </div>

              {/* CV Action */}
              <div className="pt-2">
                {profileData.cvUrl ? (
                  <a
                    href={profileData.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium bg-[var(--color-surface-raised)] hover:bg-[var(--color-border)] border border-[var(--color-border)] text-[var(--color-text)] transition-colors"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    <span>Download CV</span>
                  </a>
                ) : (
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium bg-[var(--color-surface-raised)]/60 border border-[var(--color-border)] text-[var(--color-text-muted)] cursor-not-allowed opacity-75"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      <span>CV chưa được cập nhật</span>
                    </button>
                    <p className="text-[11px] font-mono text-[var(--color-text-muted)] text-center">
                      Curriculum vitae will be available soon
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                <Code className="w-5 h-5 text-[var(--color-accent)] mb-2" />
                <div className="text-sm font-bold text-[var(--color-text)]">Full-stack</div>
                <div className="text-xs text-[var(--color-text-muted)] mt-1">End-to-end web apps</div>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                <Compass className="w-5 h-5 text-[var(--color-accent)] mb-2" />
                <div className="text-sm font-bold text-[var(--color-text)]">Continuous</div>
                <div className="text-xs text-[var(--color-text-muted)] mt-1">Exploring new tech</div>
              </div>
            </div>
          </div>

          {/* Right Column: Bio Narrative & Mindset */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="prose prose-invert max-w-none space-y-4">
              {profileData.bio.map((paragraph, idx) => (
                <p
                  key={idx}
                  className="text-base sm:text-lg text-[var(--color-text-muted)] leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Core Values / Engineering Focus */}
            <div className="pt-6 border-t border-[var(--color-border)] space-y-4">
              <h3 className="text-sm font-mono uppercase tracking-wider text-[var(--color-text)]">
                Key Engineering Focus
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-1">
                  <div className="flex items-center space-x-2 text-sm font-semibold text-[var(--color-text)]">
                    <Layers className="w-4 h-4 text-[var(--color-accent)]" />
                    <span>Modular Architecture</span>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Structuring components and server routes for clean separation of concerns and maintainability.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-1">
                  <div className="flex items-center space-x-2 text-sm font-semibold text-[var(--color-text)]">
                    <Code className="w-4 h-4 text-[var(--color-accent)]" />
                    <span>Type-Safe Reliability</span>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Embracing TypeScript across client and backend to prevent runtime errors and ensure contracts.
                  </p>
                </div>
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-4 flex items-center">
              <Button
                variant="primary"
                onClick={() => scrollTo('portfolio')}
                aria-label="Proceed to Portfolio Showcase"
              >
                <span>View My Work</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
