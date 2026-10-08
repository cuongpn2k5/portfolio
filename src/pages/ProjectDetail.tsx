import React, { useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, CheckCircle2, AlertTriangle, Layers, Calendar } from 'lucide-react';
import { GithubIcon } from '../components/common/Icons';
import { projectsData } from '../data/projects';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

export const ProjectDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const headingRef = useRef<HTMLHeadingElement>(null);

  const project = projectsData.find((p) => p.slug === slug);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (headingRef.current) {
      headingRef.current.focus();
    }
    if (project) {
      document.title = `${project.title} | Phan Nhat Cuong`;
    } else {
      document.title = 'Project Not Found | Phan Nhat Cuong';
    }
  }, [project, slug]);

  if (!project) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-6">
        <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-accent)]">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl sm:text-4xl font-bold text-[var(--color-text)] outline-none"
        >
          Project Not Found
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] max-w-md">
          The requested project slug "{slug}" does not exist in the portfolio records.
        </p>
        <Button variant="primary" onClick={() => navigate('/#portfolio')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span>Return to Portfolio</span>
        </Button>
      </div>
    );
  }

  return (
    <article className="py-12 lg:py-20 text-left transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Navigation Breadcrumb / Back button */}
        <div>
          <Link
            to="/#portfolio"
            className="inline-flex items-center text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors p-1 rounded-lg focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>Back to Portfolio Showcase</span>
          </Link>
        </div>

        {/* Project Header */}
        <header className="space-y-4 border-b border-[var(--color-border)] pb-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-mono uppercase px-2.5 py-1 rounded bg-[var(--color-surface-raised)] text-[var(--color-accent)] border border-[var(--color-border)]">
              {project.category}
            </span>

            {project.isPlaceholder ? (
              <span className="text-xs font-mono font-medium px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                PLACEHOLDER SLOT
              </span>
            ) : (
              <Badge variant="status">{project.status}</Badge>
            )}

            <div className="flex items-center space-x-1.5 text-xs font-mono text-[var(--color-text-muted)] ml-auto">
              <Calendar className="w-3.5 h-3.5" />
              <span>Role: {project.role}</span>
            </div>
          </div>

          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--color-text)] outline-none"
          >
            {project.title}
          </h1>

          <p className="text-lg text-[var(--color-text-muted)] leading-relaxed">
            {project.tagline}
          </p>

          {/* Action links */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-[var(--color-button-bg)] text-[var(--color-button-text)] hover:opacity-90 transition-opacity"
              >
                <span>Live Demonstration</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-raised)] transition-colors"
              >
                <GithubIcon className="w-4 h-4" />
                <span>Source Code</span>
              </a>
            )}

            {project.isPlaceholder && (
              <div className="text-xs font-mono text-[var(--color-text-muted)] italic">
                (Real demo and repository links will be available when this project is published)
              </div>
            )}
          </div>
        </header>

        {/* Tech Stack List */}
        <section className="space-y-3">
          <h2 className="text-sm font-mono uppercase tracking-wider text-[var(--color-text)] flex items-center space-x-2">
            <Layers className="w-4 h-4 text-[var(--color-accent)]" />
            <span>Technologies & Tools</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-mono font-medium text-[var(--color-text)]"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* Overview & Detailed Description */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[var(--color-text)]">
            Project Overview
          </h2>
          <p className="text-base text-[var(--color-text-muted)] leading-relaxed">
            {project.fullDescription || project.description}
          </p>
        </section>

        {/* Key Features */}
        {project.features && project.features.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[var(--color-text)]">
              Core Architecture & Features
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {project.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-start space-x-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Challenges & Solutions */}
        {project.challenges && project.challenges.length > 0 && (
          <section className="space-y-6 pt-4 border-t border-[var(--color-border)]">
            <h2 className="text-xl font-bold text-[var(--color-text)]">
              Engineering Challenges & Solutions
            </h2>
            <div className="space-y-4">
              {project.challenges.map((challenge, idx) => {
                const solution = project.solutions?.[idx];
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3"
                  >
                    <div>
                      <div className="text-xs font-mono uppercase text-rose-400 mb-1">
                        Challenge
                      </div>
                      <p className="text-sm font-medium text-[var(--color-text)]">
                        {challenge}
                      </p>
                    </div>

                    {solution && (
                      <div className="pt-2 border-t border-[var(--color-border)]/50">
                        <div className="text-xs font-mono uppercase text-emerald-400 mb-1">
                          Applied Solution
                        </div>
                        <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
                          {solution}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Bottom Back Action */}
        <div className="pt-8 border-t border-[var(--color-border)] flex justify-between items-center">
          <Button variant="secondary" onClick={() => navigate('/#portfolio')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>Return to Portfolio</span>
          </Button>

          <Button variant="outline" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span>Top of Page</span>
          </Button>
        </div>
      </div>
    </article>
  );
};
