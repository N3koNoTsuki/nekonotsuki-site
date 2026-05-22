import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Navbar.module.css';

const LANGS = ['fr', 'en', 'jp'];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const switchLang = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('neko-lang', lang);
  };

  const navLinks = [
    { to: '/', label: t('nav.home'), exact: true },
    { to: '/timeline', label: t('nav.timeline') },
    { to: '/about', label: t('nav.about') },
    { to: '/favorites', label: t('nav.favorites') },
    { to: '/projects', label: t('nav.projects') }
  ];

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        {/* Logo */}
        <NavLink to="/" className={styles.logo} onClick={() => setMenuOpen(false)}>
          <span className={styles.logoKanji}>猫</span>
          <span className={styles.logoText}>NekoNoTsuki</span>
        </NavLink>

        {/* Desktop links */}
        <ul className={styles.links}>
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Language toggle + hamburger */}
        <div className={styles.right}>
          <div className={styles.langToggle}>
            {LANGS.map((lang, i) => (
              <span key={lang}>
                <button
                  className={`${styles.langBtn} ${i18n.language === lang ? styles.langActive : ''}`}
                  onClick={() => switchLang(lang)}
                >
                  {lang.toUpperCase()}
                </button>
                {i < LANGS.length - 1 && <span className={styles.langSep}>|</span>}
              </span>
            ))}
          </div>

          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Menu"
          >
            <span className={menuOpen ? styles.barOpen : styles.bar} />
            <span className={menuOpen ? styles.barHide : styles.bar} />
            <span className={menuOpen ? styles.barOpenAlt : styles.bar} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => isActive ? `${styles.mobileLink} ${styles.active}` : styles.mobileLink}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </NavLink>
            ))}
            <div className={styles.mobileLang}>
              {LANGS.map((lang, i) => (
                <span key={lang}>
                  <button
                    className={`${styles.langBtn} ${i18n.language === lang ? styles.langActive : ''}`}
                    onClick={() => { switchLang(lang); setMenuOpen(false); }}
                  >
                    {lang.toUpperCase()}
                  </button>
                  {i < LANGS.length - 1 && <span className={styles.langSep}>|</span>}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
