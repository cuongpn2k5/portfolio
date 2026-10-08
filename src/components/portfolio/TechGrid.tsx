import React, { useState } from 'react';
import type { TechCategory, TechItem } from '../../types';
import { techStackData } from '../../data/techStack';
import { Badge } from '../common/Badge';

const CATEGORIES: ('All' | TechCategory)[] = ['All', 'Frontend', 'Backend', 'Database', 'Tools'];

export const TechGrid: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | TechCategory>('All');

  const filteredItems = selectedCategory === 'All'
    ? techStackData
    : techStackData.filter((item) => item.category === selectedCategory);

  const getStatusBadge = (status: TechItem['status']) => {
    switch (status) {
      case 'In Use':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>In Use</span>
          </span>
        );
      case 'Learning':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span>Learning</span>
          </span>
        );
      case 'Exploring':
      default:
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Exploring</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 text-left">
      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] ${
              selectedCategory === category
                ? 'bg-[var(--color-text)] text-[var(--color-bg)]'
                : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)]'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Grid of Technologies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((tech) => (
          <div
            key={tech.name}
            className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-control-border)] transition-all space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-base font-bold text-[var(--color-text)]">
                {tech.name}
              </h4>
              {getStatusBadge(tech.status)}
            </div>

            <Badge variant="outline" className="text-[10px]">
              {tech.category}
            </Badge>

            {tech.description && (
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed pt-1">
                {tech.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
