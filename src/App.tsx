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
      const element = document.getElementById(id);
      if (element) {
        // Small delay to ensure layout is ready
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      }
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
