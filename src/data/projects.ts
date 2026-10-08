import type { ProjectData } from '../types';

export const projectsData: ProjectData[] = [
  {
    id: 'placeholder-project-1',
    slug: 'e-commerce-platform-placeholder',
    title: 'E-Commerce Platform (Placeholder)',
    tagline: 'Modern full-stack web storefront with modular checkout and API layer',
    description: 'A planned full-stack commerce application designed with reactive frontend architecture, decoupled REST services, and database persistence.',
    fullDescription: 'This is a project placeholder slot ready to be replaced with your actual completed project. It demonstrates how full-stack features, technical stack, architecture challenges, and solutions will be displayed across the portfolio showcase and dedicated detail view.',
    coverImage: '',
    gallery: [],
    role: 'Full-stack Developer',
    category: 'Full-stack Web',
    technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    features: [
      'Responsive catalog browsing with instant filtering and search',
      'Cart management with local state synchronization',
      'RESTful API architecture for orders and product catalog',
      'Secure authentication flow and schema validation'
    ],
    challenges: [
      'Managing transactional state consistency across client and backend cache',
      'Designing clean database schemas for polymorphic product variants'
    ],
    solutions: [
      'Implemented optimistic UI updates paired with strict backend validation',
      'Normalized relational tables with indexed foreign keys for rapid query response'
    ],
    githubUrl: '', // Intentionally empty placeholder: won't render broken link
    demoUrl: '',   // Intentionally empty placeholder
    status: 'Placeholder',
    isPlaceholder: true
  },
  {
    id: 'placeholder-project-2',
    slug: 'task-collaboration-suite-placeholder',
    title: 'Collaborative Workspace (Placeholder)',
    tagline: 'Real-time kanban and task tracking engine with role-based permissions',
    description: 'An interactive productivity platform focusing on responsive client interactions, live updates, and secure user data isolation.',
    fullDescription: 'A placeholder slot illustrating a collaborative web application with real-time UI synchronization, workflow automation, and custom dashboard metrics.',
    coverImage: '',
    gallery: [],
    role: 'Full-stack Developer',
    category: 'Web Application',
    technologies: ['React', 'TypeScript', 'Express', 'MongoDB', 'Tailwind CSS'],
    features: [
      'Interactive drag-and-drop workflow boards',
      'Granular project permissions and member roles',
      'Activity audit trail with automated notification hooks',
      'Accessible keyboard shortcuts for power-user navigation'
    ],
    challenges: [
      'Preventing concurrent state collisions during collaborative board updates',
      'Maintaining smooth 60fps rendering during complex drag interactions'
    ],
    solutions: [
      'Leveraged optimistic locking and lightweight client reconciliation',
      'Optimized DOM nodes and virtualized large column lists'
    ],
    githubUrl: '',
    demoUrl: '',
    status: 'Placeholder',
    isPlaceholder: true
  },
  {
    id: 'placeholder-project-3',
    slug: 'analytics-dashboard-api-placeholder',
    title: 'Metrics & API Hub (Placeholder)',
    tagline: 'Data visualization portal with aggregated telemetry and automated reports',
    description: 'A data dashboard exploring interactive charting, responsive layout density, and high-throughput data aggregation endpoints.',
    fullDescription: 'A placeholder slot designed for analytics, developer tooling, or API integration projects. Highlights data visualization techniques and backend caching patterns.',
    coverImage: '',
    gallery: [],
    role: 'Backend & UI Engineer',
    category: 'Analytics / Backend',
    technologies: ['TypeScript', 'React', 'Node.js', 'REST API', 'Tailwind CSS'],
    features: [
      'Custom metric widgets with dynamic time-range aggregation',
      'Rate-limited endpoints with secure token authorization',
      'Exportable reports in CSV and formatted PDF outputs',
      'Adaptive light/dark theme charts with accessible color contrast'
    ],
    challenges: [
      'Query latency when aggregating large time-series datasets',
      'Balancing high information density without cluttering UI readability'
    ],
    solutions: [
      'Utilized aggregated materialized views and Redis cache layers',
      'Structured dashboard grids using progressive disclosure principles'
    ],
    githubUrl: '',
    demoUrl: '',
    status: 'Placeholder',
    isPlaceholder: true
  }
];
