import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ArrowRight, FolderGit2 } from 'lucide-react';
import { GithubIcon } from '../common/Icons';
import type { ProjectData } from '../../types';
import { Badge } from '../common/Badge';

interface ProjectCardProps {
  project: ProjectData;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <article className="group flex flex-col justify-between rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-control-border)] p-6 transition-all duration-200 hover:-translate-y-1 shadow-xs text-left">
      <div className="space-y-4">
        {/* Header & Badges */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-lg bg-[var(--color-surface-raised)] text-[var(--color-accent)] border border-[var(--color-border)]">
              <FolderGit2 className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono text-[var(--color-text-muted)]">
              {project.category}
            </span>
          </div>

          {project.isPlaceholder ? (
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              PLACEHOLDER
            </span>
          ) : (
            <Badge variant="status">{project.status}</Badge>
          )}
        </div>

        {/* Title & Tagline */}
        <div>
          <h3 className="text-xl font-bold text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
            {project.title}
          </h3>
          <p className="text-xs font-mono text-[var(--color-text-muted)] mt-1">
            {project.tagline}
          </p>
        </div>

        {/* Description */}
        <p className="text-sm text-[var(--color-text-muted)] line-clamp-3 leading-relaxed">
          {project.description}
        </p>

        {/* Tech Stack Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {project.technologies.slice(0, 4).map((tech) => (
            <Badge key={tech} variant="default">
              {tech}
            </Badge>
          ))}
          {project.technologies.length > 4 && (
            <Badge variant="outline">
              +{project.technologies.length - 4}
            </Badge>
          )}
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="pt-6 mt-6 border-t border-[var(--color-border)] flex items-center justify-between">
        <Link
          to={`/projects/${project.slug}`}
          className="inline-flex items-center text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors group-hover:translate-x-0.5 focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] rounded-md px-1 py-0.5"
          aria-label={`View details for ${project.title}`}
        >
          <span>View Details</span>
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Link>

        {/* External Links (only when provided) */}
        <div className="flex items-center space-x-2">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-raised)] border border-[var(--color-border)] transition-colors"
              aria-label={`GitHub repository for ${project.title}`}
            >
              <GithubIcon className="w-4 h-4" />
            </a>
          )}
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-raised)] border border-[var(--color-border)] transition-colors"
              aria-label={`Live demo for ${project.title}`}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
};
