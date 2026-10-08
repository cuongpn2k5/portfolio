import type { ProfileData } from '../types';

export const profileData: ProfileData = {
  name: 'Phan Nhat Cuong',
  role: 'Full-stack Developer',
  subtitle: 'Software Engineering Student & Full-stack Developer passionate about building robust web applications, scalable backends, and intuitive user experiences.',
  bio: [
    'Hello! I am Phan Nhat Cuong, a Software Engineering student focused on modern full-stack web engineering and digital product craft.',
    'I enjoy engineering reliable backend architectures, responsive modern frontends, and dynamic interactive interfaces using React, TypeScript, and ecosystem tooling.',
    'Continuously expanding knowledge across scalable system design, clean API development, and fluid UI interactions.'
  ],
  education: {
    status: 'Software Engineering Student',
    major: 'Software Engineering',
    // institution: '', // Optional: Add institution name here in future
    // period: '',      // Optional: Add study period here
  },
  cvUrl: '', // Currently empty: UI will clearly state "CV chưa được cập nhật" as instructed
  portraitUrl: '/images/cuongpn.jpg', // Optional portrait placeholder
  location: 'Vietnam',
  availability: 'Open to Internship & Junior Opportunities'
};
