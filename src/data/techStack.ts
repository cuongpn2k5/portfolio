import type { TechItem } from '../types';

export const techStackData: TechItem[] = [
  // Frontend
  {
    name: 'React',
    category: 'Frontend',
    status: 'In Use',
    description: 'Component architecture, hooks, state management, and modern SPA development.'
  },
  {
    name: 'TypeScript',
    category: 'Frontend',
    status: 'In Use',
    description: 'Strict type safety, generic interfaces, and scalable codebases.'
  },
  {
    name: 'Tailwind CSS',
    category: 'Frontend',
    status: 'In Use',
    description: 'Design system implementation, utility tokens, responsive layouts.'
  },
  {
    name: 'Three.js / React Three Fiber',
    category: 'Frontend',
    status: 'Learning',
    description: '3D scene rendering, custom shaders, and interactive WebGL experiences.'
  },
  {
    name: 'GSAP & Animation',
    category: 'Frontend',
    status: 'In Use',
    description: 'ScrollTrigger, timeline orchestrations, and micro-interactions.'
  },
  {
    name: 'Next.js',
    category: 'Frontend',
    status: 'Learning',
    description: 'Server components, SSR/SSG rendering, and hybrid architectures.'
  },

  // Backend
  {
    name: 'Node.js',
    category: 'Backend',
    status: 'In Use',
    description: 'Asynchronous event-driven server runtime and CLI scripts.'
  },
  {
    name: 'Express.js',
    category: 'Backend',
    status: 'In Use',
    description: 'RESTful API routing, middleware pipelines, and error handling.'
  },
  {
    name: 'REST API Design',
    category: 'Backend',
    status: 'In Use',
    description: 'Clean endpoint structures, HTTP status semantics, and schema validations.'
  },
  {
    name: 'Authentication (JWT / Sessions)',
    category: 'Backend',
    status: 'In Use',
    description: 'Token authorization, password hashing, and role-based access control.'
  },

  // Database
  {
    name: 'PostgreSQL',
    category: 'Database',
    status: 'In Use',
    description: 'Relational data modeling, foreign key integrity, and indexed SQL queries.'
  },
  {
    name: 'MongoDB',
    category: 'Database',
    status: 'In Use',
    description: 'Document database storage, aggregation pipelines, and schema modeling.'
  },
  {
    name: 'Prisma / ORM',
    category: 'Database',
    status: 'Learning',
    description: 'Type-safe database queries, automated migrations, and relations.'
  },

  // Tools & DevOps
  {
    name: 'Git & GitHub',
    category: 'Tools',
    status: 'In Use',
    description: 'Version control workflows, branching strategies, and collaboration.'
  },
  {
    name: 'Vite',
    category: 'Tools',
    status: 'In Use',
    description: 'Fast modern build tooling, dev server HMR, and bundle optimization.'
  },
  {
    name: 'Postman / REST Clients',
    category: 'Tools',
    status: 'In Use',
    description: 'API endpoint testing, parameter inspection, and automated requests.'
  },
  {
    name: 'Docker Basics',
    category: 'Tools',
    status: 'Learning',
    description: 'Containerization basics for local developer environments.'
  }
];
