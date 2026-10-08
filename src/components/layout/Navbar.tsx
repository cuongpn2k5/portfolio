import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useIntroTransition } from '../../hooks/useIntroTransition';

interface NavItem {
  name: string;
  href: string;
  id: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Home', href: '/#home', id: 'home' },
  { name: 'About', href: '/#about', id: 'about' },
  { name: 'Portfolio', href: '/#portfolio', id: 'portfolio' },
  { name: 'Services', href: '/#services', id: 'services' },
  { name: 'Contact', href: '/#contact', id: 'contact' },
];

export const Navbar: React.FC = () => {
  const { stage } = useIntroTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();

  // Scroll spy to detect current active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 180;
      const sectionIds = ['contact', 'services', 'portfolio', 'about', 'home'];

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPos >= top) {
            setActiveSection(id);
            return;
          }
        }
      }
      setActiveSection('home');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  const [prevLocationKey, setPrevLocationKey] = useState(location.key);
  if (location.key !== prevLocationKey) {
    setPrevLocationKey(location.key);
    if (isOpen) {
      setIsOpen(false);
    }
  }

  // Handle escape key to close menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLinkClick = (href: string, id: string) => {
    setIsOpen(false);
    setActiveSection(id);
    if (location.pathname === '/') {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.href = href;
    }
  };

  return (
    <header
      className={`fixed top-3 sm:top-4 inset-x-0 z-40 pointer-events-none flex justify-center px-3 sm:px-6 transition-all duration-700 ease-out ${
        stage === 'intro' ? 'opacity-0 -translate-y-6 pointer-events-none' : 'opacity-100 translate-y-0'
      }`}
    >
      {/* 
        Horizontally stretched, floating pill-shaped navigation container.
        Leaves dedicated right margin so ThemePullCord hangs freely without overlap.
      */}
      <div className="w-full max-w-6xl mx-auto pointer-events-auto pr-12 sm:pr-14 md:pr-0">
        <div className="h-12 sm:h-14 px-4 sm:px-6 md:px-8 rounded-full bg-[#121215]/90 dark:bg-[#121215]/90 backdrop-blur-xl border border-white/[0.08] shadow-xl shadow-black/25 flex items-center justify-between text-white transition-all duration-300">
          
          {/* LEFT: Portfolio Brand */}
          <Link
            to="/#home"
            onClick={(e) => {
              if (location.pathname === '/') {
                e.preventDefault();
                handleLinkClick('/#home', 'home');
              }
            }}
            className="text-xs sm:text-sm font-semibold tracking-tight text-white/95 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-white/60 rounded-full py-1"
            aria-label="PhanNhatCuong Portfolio Home"
          >
            PhanNhatCuong
          </Link>

          {/* RIGHT: Desktop Navigation Links */}
          <nav
            className="hidden md:flex items-center space-x-1 lg:space-x-3"
            aria-label="Main Navigation"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    if (location.pathname === '/') {
                      e.preventDefault();
                      handleLinkClick(item.href, item.id);
                    }
                  }}
                  className={`relative px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-white/60 rounded-full group ${
                    isActive
                      ? 'text-white'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span>{item.name}</span>
                  {/* Subtle, smooth active underline */}
                  <span
                    className={`absolute bottom-0.5 left-3 right-3 h-[2px] bg-white rounded-full transition-all duration-300 ease-out origin-center ${
                      isActive
                        ? 'opacity-100 scale-x-100'
                        : 'opacity-0 scale-x-0 group-hover:opacity-40 group-hover:scale-x-75'
                    }`}
                  />
                </a>
              );
            })}
          </nav>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 rounded-full text-neutral-300 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-white/60 min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-expanded={isOpen}
              aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-x-4 top-20 bg-[#121215]/95 backdrop-blur-2xl border border-white/[0.1] rounded-3xl p-6 shadow-2xl pointer-events-auto z-50 transition-all duration-200 text-white"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
        >
          <nav className="flex flex-col space-y-2">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    if (location.pathname === '/') {
                      e.preventDefault();
                    }
                    handleLinkClick(item.href, item.id);
                  }}
                  className={`flex items-center justify-between px-4 py-3 text-base font-medium rounded-2xl transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white font-semibold'
                      : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span>{item.name}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </a>
              );
            })}
          </nav>

          <div className="pt-5 mt-4 border-t border-white/[0.08] text-xs text-neutral-400 font-mono text-center">
            PhanNhatCuong • Full-stack Developer
          </div>
        </div>
      )}
    </header>
  );
};
