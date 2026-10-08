import React from 'react';
import { Award, ExternalLink, Calendar } from 'lucide-react';
import type { CertificateData } from '../../types';
import { Badge } from '../common/Badge';

interface CertificateCardProps {
  certificate: CertificateData;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({ certificate }) => {
  return (
    <article className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6 space-y-4 text-left transition-all hover:border-[var(--color-control-border)]">
      <div className="flex items-start justify-between">
        <div className="p-2 rounded-xl bg-[var(--color-surface-raised)] text-[var(--color-accent)] border border-[var(--color-border)]">
          <Award className="w-5 h-5" />
        </div>
        {certificate.issueDate && (
          <div className="flex items-center space-x-1 text-xs font-mono text-[var(--color-text-muted)]">
            <Calendar className="w-3.5 h-3.5" />
            <span>{certificate.issueDate}</span>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-bold text-[var(--color-text)]">
          {certificate.title}
        </h3>
        <p className="text-sm text-[var(--color-accent)] font-medium mt-0.5">
          {certificate.issuer}
        </p>
      </div>

      {certificate.description && (
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
          {certificate.description}
        </p>
      )}

      {certificate.tags && certificate.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {certificate.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {certificate.credentialUrl && (
        <div className="pt-4 border-t border-[var(--color-border)]">
          <a
            href={certificate.credentialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs font-mono text-[var(--color-accent)] hover:underline"
          >
            <span>Verify Credential</span>
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
      )}
    </article>
  );
};
