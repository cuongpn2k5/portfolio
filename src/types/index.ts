export interface ProfileData {
  name: string;
  role: string;
  subtitle: string;
  bio: string[];
  education: {
    status: string;
    major: string;
    institution?: string; // Optional - only if provided
    period?: string;
  };
  cvUrl?: string; // Optional - if not provided, UI reflects 'CV updating soon'
  portraitUrl?: string;
  location?: string;
  availability?: string;
}

export type ProjectStatus = 'Completed' | 'In Progress' | 'Placeholder';

export interface ProjectData {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  fullDescription?: string;
  coverImage?: string;
  gallery?: string[];
  role: string;
  category: string;
  technologies: string[];
  features: string[];
  challenges?: string[];
  solutions?: string[];
  githubUrl?: string; // Only render if provided
  demoUrl?: string;   // Only render if provided
  status: ProjectStatus;
  isPlaceholder?: boolean;
}

export interface CertificateData {
  id: string;
  title: string;
  issuer: string;
  issueDate?: string;
  credentialUrl?: string;
  image?: string;
  description?: string;
  tags?: string[];
}

export type TechCategory = 'Frontend' | 'Backend' | 'Database' | 'Tools';
export type TechStatus = 'In Use' | 'Learning' | 'Exploring';

export interface TechItem {
  name: string;
  category: TechCategory;
  status: TechStatus;
  description?: string;
  icon?: string;
}

export interface ServiceData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  capabilities: string[];
  icon: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url?: string; // Only render if valid URL provided
  username?: string;
  icon: string;
  isAvailable: boolean;
}
