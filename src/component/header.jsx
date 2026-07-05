import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './header.css';
import logoImage from '../images/logo-removebg-preview.webp';

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

  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const navLinks = [
    { name: 'الرئيسية', path: '/', isInternal: false, sectionId: null },
    { name: 'قاعدة المعرفة', path: '/knowledge-base', isInternal: false, sectionId: null },
    { name: 'تشخيص النبات', path: '/diagnose', isInternal: false },
    { name: 'الطقس', path: '/weather', isInternal: false },
    { name: 'الذكاء الاصطناعي', path: '/ai-chat', isInternal: false },
    { name: 'المقالات', path: '/blog', isInternal: false },
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
            <li className="nav-item nav-item-toggle">
              <DarkToggle isDark={isDark} onToggle={toggleDark} />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
