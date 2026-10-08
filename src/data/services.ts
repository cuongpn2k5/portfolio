import type { ServiceData } from '../types';

export const servicesData: ServiceData[] = [
  {
    id: 'fullstack-web',
    title: 'Full-stack Web Development',
    subtitle: 'End-to-end web applications with clean architecture',
    description: 'Developing complete web applications integrating responsive frontend views with reliable backend servers, structured databases, and deployment setups.',
    capabilities: [
      'Single Page Applications (React, TypeScript)',
      'Responsive UI design across desktop, tablet, and mobile',
      'Integration with external third-party APIs and services',
      'State management and performance optimization'
    ],
    icon: 'Globe'
  },
  {
    id: 'backend-apis',
    title: 'Backend & REST API Development',
    subtitle: 'Scalable services and structured data pipelines',
    description: 'Architecting robust server applications, secure authentication layers, business logic controllers, and relational/document databases.',
    capabilities: [
      'RESTful API design and comprehensive endpoint specifications',
      'Data modeling and query optimization (PostgreSQL, MongoDB)',
      'Token-based authentication, validation, and middleware security',
      'Error logging, request throttling, and payload serialization'
    ],
    icon: 'Server'
  },
  {
    id: 'mobile-dev',
    title: 'Mobile Application Development',
    subtitle: 'Cross-platform app fundamentals and exploration',
    description: 'Building foundational cross-platform mobile views and progressive web interfaces focused on touch ergonomics, device responsiveness, and native capabilities.',
    capabilities: [
      'Cross-platform UI design with React Native principles',
      'Progressive Web App (PWA) configuration and offline capability',
      'Touch-friendly interface ergonomics and gestures',
      'Mobile-first responsive optimization'
    ],
    icon: 'Smartphone'
  },
  {
    id: 'ui-implementation',
    title: 'UI Implementation & Interactive Experience',
    subtitle: 'High-fidelity visual craft with micro-interactions',
    description: 'Translating design specifications and prototypes into pixel-accurate, accessible, and performant web interfaces with subtle motion and 3D accents.',
    capabilities: [
      'Design token systems with dark & light theme synchronization',
      'Interactive 3D canvas integration via Three.js / React Three Fiber',
      'Smooth GSAP timeline animations and scroll-triggered reveals',
      'Semantic HTML5 structure and WCAG accessibility standards'
    ],
    icon: 'Layers'
  }
];
