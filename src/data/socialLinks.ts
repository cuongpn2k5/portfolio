import type { SocialLink } from '../types';

export interface ContactInfo {
  email?: string;
  location: string;
  availability: string;
  note: string;
}

export const contactInfo: ContactInfo = {
  email: '', // Intentionally left empty: UI displays clear "Contact info updating soon" notice
  location: 'Vietnam',
  availability: 'Available for internship, collaboration & freelance opportunities',
  note: 'Feel free to reach out for software development discussions, collaborative projects, or engineering roles.'
};

export const socialLinksData: SocialLink[] = [
  {
    id: 'github',
    platform: 'GitHub',
    label: 'GitHub Profile',
    url: '', // Empty until owner provides actual profile URL
    username: '',
    icon: 'Github',
    isAvailable: false
  },
  {
    id: 'linkedin',
    platform: 'LinkedIn',
    label: 'LinkedIn Profile',
    url: '', // Empty until owner provides actual profile URL
    username: '',
    icon: 'Linkedin',
    isAvailable: false
  },
  {
    id: 'email',
    platform: 'Email',
    label: 'Send Email',
    url: '', // Empty until owner provides actual email
    username: '',
    icon: 'Mail',
    isAvailable: false
  }
];
