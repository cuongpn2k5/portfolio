# Phan Nhat Cuong — Full-stack Developer Portfolio

A modern, high-performance developer portfolio crafted with **React**, **TypeScript**, **Vite**, **Tailwind CSS v4**, **Three.js / React Three Fiber**, **FeralUI PullCord**, and **React Router**.

Featuring a physically simulated **3D Hanging ID Card**, an interactive **FeralUI ceiling PullCord** for seamless Dark/Light theme toggling, and clean, type-safe content management.

---

## 🌟 Key Features

1. **Interactive 3D Hanging ID Card**:
   - Physically simulated hanging badge with tension, gravity, and harmonic pendulum swinging.
   - Draggable with mouse and touch, natural release oscillation, dynamic flexing lanyard strap ribbon.
   - Crisp double-sided textures (verified credentials, QR code, magnetic strip, and developer specs).
   - Graceful fallback for non-WebGL environments or users requesting `prefers-reduced-motion`.

2. **FeralUI Ceiling PullCord**:
   - Real interactive rope pullcord powered by [`pullcord`](https://feralui.dev/pullcord).
   - Physically pull down past the actuation threshold to toggle Dark/Light theme.
   - Dark mode by default, functional Light mode with CSS variables.
   - Theme persistence via `localStorage` with cross-tab synchronization.
   - Accompanied by an accessible keyboard alternative toggle button in the navigation bar.

3. **Complete Portfolio Sections**:
   - **Intro**: Welcome screen with subtle typography reveal, fast auto-dismiss, and **Skip Intro** (plays once per session via `sessionStorage`).
   - **Hero**: Full-stack developer presentation, status badges, and dual primary CTAs.
   - **About Me**: Biography, academic status, developer focus cards, and safe CV status indicator.
   - **Portfolio Showcase**: Accessible WAI-ARIA tabs (keyboard navigable via arrow keys):
     - **Projects**: Modular project cards with tech tags, status indicators, and detail links.
     - **Certificates**: Clean, honest empty state with no simulated fake achievements.
     - **Tech Stack**: Categorized filters (Frontend, Backend, Database, Tools) with real learning statuses.
   - **Project Details**: Dynamic `/projects/:slug` pages with architecture breakdown, challenges, solutions, and fallback 404 state.
   - **Services & Focus**: Interactive expandable capability categories.
   - **Contact**: Burgundy-themed contact hub with email copy-to-clipboard and social link support.
   - **Footer**: Minimalist footer with dynamic copyright year and back-to-top shortcut.

4. **Zero Hardcoded Content**:
   - All portfolio content is managed in strictly-typed TypeScript files in `src/data/`.

---

## 🛠️ Technology Stack

- **Framework**: [React](https://react.dev/) + [Vite](https://vite.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode & verbatim module syntax)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom Design Tokens
- **3D Graphics & Physics**: [Three.js](https://threejs.org/) + [@react-three/fiber](https://r3f.docs.pmnd.rs/) + [@react-three/drei](https://github.com/pmndrs/drei)
- **Interactive Rope**: [FeralUI PullCord](https://feralui.dev/pullcord) (`pullcord`) + `motion`
- **Routing**: [React Router](https://reactrouter.com/) (Single Page Application architecture)
- **Icons**: [Lucide React](https://lucide.dev/) + Custom SVG Icons

---

## 🚀 Getting Started

### Prerequisites

- Node.js `v18.0.0` or later (tested on Node `v24.x`)
- npm `v9.0.0` or later

### Installation

```bash
# Clone or navigate to the repository
cd portfolio

# Install dependencies
npm install
```

### Running Locally (Development Mode)

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
# Run TypeScript compilation and Vite production bundle
npm run build
```

The optimized production artifacts will be generated in the `dist/` directory with code splitting for Three.js.

### Production Preview

```bash
# Preview the production build locally
npm run preview
```

### Linting & Code Verification

```bash
npm run lint
```

---

## 📂 Project Structure

```
src/
├── assets/                  # Static assets and icons
├── components/
│   ├── common/              # Button, Badge, ThemeToggle, ThemePullCord, Icons
│   ├── layout/              # Navbar, Footer, Layout wrapper
│   ├── portfolio/           # ProjectCard, CertificateCard, TechGrid
│   └── three/               # HangingIDCard, IDCard3D, IDCardFallback, cardTextures
├── data/                    # Editable TypeScript content files
│   ├── profile.ts           # Bio, role, education, CV link
│   ├── projects.ts          # Project list, features, challenges, solutions
│   ├── certificates.ts      # Credentials & verification links
│   ├── techStack.ts         # Categorized skills & learning statuses
│   ├── services.ts          # Capability categories & descriptions
│   └── socialLinks.ts       # Social accounts, contact email, availability
├── hooks/                   # useTheme, useReducedMotion
├── pages/                   # Home, ProjectDetail, NotFound
├── providers/               # ThemeProvider, ThemeContext
├── sections/                # Intro, Hero, About, PortfolioShowcase, Services, Contact
├── styles/                  # theme.css (CSS variables for dark/light modes)
├── types/                   # TypeScript interfaces and entity types
├── App.tsx                  # Router configuration & hash scroll anchor
├── index.css                # Base Tailwind v4 styles & custom utilities
└── main.tsx                 # App mount & global stylesheet imports
```

---

## 📖 Updating Content

To update projects, personal info, education, skills, CV, or contact details, see the complete guide in [CONTENT_GUIDE.md](./CONTENT_GUIDE.md).

---

## ♿ Accessibility & Performance

- **WCAG AA Compliance**: High-contrast ratios across both Dark (`#090909`) and Light (`#F7F5F2`) themes, and on Burgundy Contact (`#300F19` / `#4A1625`).
- **Focus Rings**: Distinct `:focus-visible` outlines on all interactive elements.
- **WAI-ARIA**: Semantic tabs with keyboard arrow support, modal roles, and `aria-expanded` toggles.
- **Motion Ergonomics**: Respects `prefers-reduced-motion` across animations, transitions, and 3D canvas.
- **Code Splitting**: Three.js and heavy WebGL modules are lazy-loaded on demand to ensure near-instant first paint.

---

## 📄 License

MIT License. Designed and engineered for **Phan Nhat Cuong**.

## GitHub Pages deployment

In repository **Settings → Pages → Build and deployment**, set **Source** to
**GitHub Actions**. Push these changes to `main`, or run **Deploy portfolio to
GitHub Pages** manually from the Actions tab once the workflow is on `main`.
The workflow installs locked dependencies with `npm ci`, builds the app, and
deploys only `dist` to https://cuongpn2k5.github.io/portfolio/.

Vite and BrowserRouter share the `/portfolio/` base. For files in `public`, use
`${import.meta.env.BASE_URL}images/example.jpg` (or `documents/example.pdf`)
in TypeScript. Imported assets in `src` are handled by Vite. The CV is currently
unconfigured; add the PDF to `public/documents` before setting `cvUrl`.

The build also creates `dist/404.html` from the compiled entry point so direct
project links and refreshes render the app on Pages. GitHub returns HTTP 404
for these nested URLs even though React renders the matching project page.

Verify locally with `npm run build` and `npm run preview`, then visit
http://localhost:4173/portfolio/. `node tests/pages-deployment.mjs` tests the
compiled assets and nested routes against a Pages-style static server; set
`BROWSER_PATH` if Microsoft Edge is installed elsewhere.
