import { copyFileSync } from 'node:fs';

// Pages serves this compiled entry point for direct BrowserRouter URLs.
// Vite's absolute base keeps assets valid even on nested project paths.
copyFileSync(new URL('../dist/index.html', import.meta.url), new URL('../dist/404.html', import.meta.url));
