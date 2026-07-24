import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './header.css';
import logoImage from '../images/logo-removebg-preview.webp';
import { useAuth } from '../context/AuthContext';
import ProfileAvatar from './ProfileAvatar';

const DarkToggle = ({ isDark, onToggle }) => (
  <button
    onClick={onToggle}
    className="dark-toggle-btn"
    aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
  >
    <svg className="dark-toggle-sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
    <svg className="dark-toggle-moon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  </button>
);

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('hefno-dark');
    if (stored !== null) return stored === 'true';
    return true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('hefno-dark', isDark);
  }, [isDark]);

  const toggleDark = () => setIsDark(prev => !prev);

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    if (window.matchMedia('(display-mode: standalone)').matches) setIsInstalled(true);
    window.addEventListener('appinstalled', () => setIsInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') setIsInstalled(true);
      setDeferredPrompt(null);
      return;
    }

    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (isIOS && navigator.share) {
      navigator.share({ url: 'https://hefnoplant.site' });
      return;
    }

    const content = `[InternetShortcut]\nURL=https://hefnoplant.site\nIDList=\nHotKey=0\nIconFile=https://hefnoplant.site/fav/favicon.ico\nIconIndex=1`;
    const blob = new Blob([content], { type: 'application/internet-shortcut' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'HefnoPlant.url';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [deferredPrompt]);

  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const { user, isAdmin, logout } = useAuth();

  const navLinks = user
    ? [
        { name: 'الرئيسية', path: '/', isInternal: false, sectionId: null },
        { name: 'قاعدة المعرفة', path: '/knowledge-base', isInternal: false, sectionId: null },
        { name: 'تشخيص النبات', path: '/diagnose', isInternal: false },
        { name: 'الطقس', path: '/weather', isInternal: false },
        { name: 'المقالات', path: '/blog', isInternal: false },
        ...(isAdmin ? [{ name: 'لوحة التحكم', path: '/admin-panel', isInternal: false }] : []),
      ]
    : [
        { name: 'الرئيسية', path: '/', isInternal: false, sectionId: null },
      ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (link) => {
    navigate(link.path);
    setIsMenuOpen(false);
  };

  const isLinkActive = (link) => currentPath === link.path;

  return (
    <>
      <header className={`hefno-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          <Link to="/" className="logo-link" onClick={() => setIsMenuOpen(false)}>
            <img src={logoImage} alt="HEFNOPLANT" className="header-logo" />
          </Link>

          <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Menu">
            <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
          </button>

          <nav className={`header-nav ${isMenuOpen ? 'open' : ''}`}>
            <ul className="nav-list">
              {navLinks.map((link) => (
                <li key={link.path} className="nav-item">
                  <button
                    onClick={() => handleLinkClick(link)}
                    className={`nav-link ${isLinkActive(link) ? 'active' : ''}`}
                  >
                    {link.name}
                  </button>
                </li>
              ))}
              {!isInstalled && (
                <li className="nav-item">
                  <button className="install-btn" onClick={handleInstallClick} aria-label="تثبيت التطبيق">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span className="install-text">تثبيت</span>
                  </button>
                </li>
              )}
              <li className="nav-item nav-item-toggle">
                <DarkToggle isDark={isDark} onToggle={toggleDark} />
              </li>
              {user
                ? (
                    <li key="auth-avatar" className="nav-item">
                      <ProfileAvatar size="sm" />
                    </li>
                  )
                : (
                    <>
                      <li key="auth-login" className="nav-item">
                        <Link to="/login" className="auth-btn" title="تسجيل الدخول">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                            <polyline points="10 17 15 12 10 7" />
                            <line x1="15" y1="12" x2="3" y2="12" />
                          </svg>
                        </Link>
                      </li>
                      <li key="auth-signup" className="nav-item">
                        <Link to="/signup" className="auth-btn auth-btn-signup" title="إنشاء حساب">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="8.5" cy="7" r="4" />
                            <line x1="20" y1="8" x2="20" y2="14" />
                            <line x1="23" y1="11" x2="17" y2="11" />
                          </svg>
                        </Link>
                      </li>
                    </>
                  )}
            </ul>
          </nav>
        </div>
      </header>
      {isMenuOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Header;
