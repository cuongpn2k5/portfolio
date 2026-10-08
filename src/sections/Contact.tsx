import React, { useState } from 'react';
import { Mail, ExternalLink, Send, Check, Info } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../components/common/Icons';
import { contactInfo, socialLinksData } from '../data/socialLinks';

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  Github: <GithubIcon className="w-5 h-5" />,
  Linkedin: <LinkedinIcon className="w-5 h-5" />,
  Mail: <Mail className="w-5 h-5" />,
};

export const Contact: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const availableLinks = socialLinksData.filter(
    (link) => link.isAvailable && link.url && link.url.trim().length > 0
  );

  const hasDirectEmail = contactInfo.email && contactInfo.email.trim().length > 0;

  const handleCopyEmail = () => {
    if (contactInfo.email) {
      navigator.clipboard.writeText(contactInfo.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section
      id="contact"
      className="py-20 lg:py-28 relative overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: 'var(--color-contact-bg)',
        color: 'var(--color-contact-text)',
      }}
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06)_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Tag */}
          <div
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider uppercase"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--color-contact-border)',
              color: 'var(--color-contact-muted)',
            }}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Get in Touch</span>
          </div>

          {/* Heading */}
          <h2
            className="text-4xl sm:text-6xl font-bold tracking-tight"
            style={{ color: 'var(--color-contact-text)' }}
          >
            Let's Connect.
          </h2>

          {/* Note */}
          <p
            className="text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
            style={{ color: 'var(--color-contact-muted)' }}
          >
            {contactInfo.note}
          </p>

          {/* Email or Active Contact Channel */}
          {hasDirectEmail ? (
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={`mailto:${contactInfo.email}`}
                className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl font-medium bg-white text-neutral-900 hover:bg-neutral-100 transition-colors shadow-lg"
              >
                <Mail className="w-4 h-4" />
                <span>{contactInfo.email}</span>
              </a>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center space-x-2 px-4 py-3.5 rounded-xl text-sm font-medium border transition-colors cursor-pointer"
                style={{
                  borderColor: 'var(--color-contact-border)',
                  color: 'var(--color-contact-text)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                }}
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : null}
                <span>{copied ? 'Copied to Clipboard' : 'Copy Email'}</span>
              </button>
            </div>
          ) : (
            /* Clear notice when contact credentials are yet to be populated */
            <div
              className="p-6 rounded-2xl max-w-lg mx-auto border text-left space-y-2 backdrop-blur-sm"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                borderColor: 'var(--color-contact-border)',
              }}
            >
              <div className="flex items-center space-x-2 text-xs font-mono uppercase text-rose-200">
                <Info className="w-4 h-4" />
                <span>Contact Channels In Progress</span>
              </div>
              <p
                className="text-xs sm:text-sm leading-relaxed"
                style={{ color: 'var(--color-contact-muted)' }}
              >
                Direct contact links and social media accounts are currently updating. You can easily add your verified email and profiles in <code className="px-1.5 py-0.5 rounded bg-black/40 text-white font-mono text-xs">src/data/socialLinks.ts</code>.
              </p>
            </div>
          )}

          {/* Available Social Links */}
          {availableLinks.length > 0 && (
            <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
              {availableLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-mono border transition-all hover:scale-105"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.07)',
                    borderColor: 'var(--color-contact-border)',
                    color: 'var(--color-contact-text)',
                  }}
                  aria-label={link.label}
                >
                  {PLATFORM_ICONS[link.icon] || <ExternalLink className="w-4 h-4" />}
                  <span>{link.platform}</span>
                  <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
                </a>
              ))}
            </div>
          )}

          {/* Availability Status */}
          <div
            className="pt-8 text-xs font-mono"
            style={{ color: 'var(--color-contact-muted)' }}
          >
            Location: {contactInfo.location} • {contactInfo.availability}
          </div>
        </div>
      </div>
    </section>
  );
};
