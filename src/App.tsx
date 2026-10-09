import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './providers/ThemeProvider';
import { IntroTransitionProvider } from './context/IntroTransitionProvider';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { ProjectDetail } from './pages/ProjectDetail';
import { NotFound } from './pages/NotFound';

function ScrollToAnchor() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          const navOffset = id === 'home' ? 0 : 76;
          const targetY = id === 'home' ? 0 : Math.max(0, element.getBoundingClientRect().top + window.scrollY - navOffset);
          window.scrollTo({ top: targetY, behavior: 'smooth' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.hash]);

  return null;
}

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <IntroTransitionProvider>
        <BrowserRouter>
          <ScrollToAnchor />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="projects/:slug" element={<ProjectDetail />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </IntroTransitionProvider>
    </ThemeProvider>
  );
};

export default App;
