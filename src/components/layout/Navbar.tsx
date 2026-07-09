import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/about', label: t('nav.about') },
    { path: '/gallery', label: t('nav.gallery') },
    { path: '/premium', label: t('nav.premium') },
    { path: '/journal', label: t('nav.journal') },
    { path: '/contact', label: t('nav.contact') },
  ];

  return (
    <header
      role="banner"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-luxury-black/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8" aria-label={t('accessibility.main_navigation', 'Main navigation')}>
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2" aria-label={t('accessibility.home_link', 'Eastern Jewel Home')}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-display text-2xl md:text-3xl text-white"
            >
              <span className="text-gold-500">Eastern</span>
              <span className="text-white"> Jewel</span>
            </motion.div>
          </Link>

          <ul className="hidden md:flex items-center gap-8" role="list">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`relative text-sm font-medium transition-colors duration-300 ${
                    location.pathname === link.path
                      ? 'text-gold-500'
                      : 'text-gray-300 hover:text-white'
                  }`}
                  aria-current={location.pathname === link.path ? 'page' : undefined}
                >
                  {link.label}
                  {location.pathname === link.path && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gold-500"
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 text-gray-300 hover:text-gold-500 transition-colors"
              aria-label={t('accessibility.switch_language', 'Switch language')}
              aria-pressed={i18n.language === 'ar'}
            >
              <Globe size={18} aria-hidden="true" />
              <span className="text-sm font-medium">
                {i18n.language === 'en' ? 'العربية' : 'English'}
              </span>
            </button>
            <Link to="/premium">
              <Button variant="primary" size="sm">
                {t('nav.premium')}
              </Button>
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2"
            aria-label={t('accessibility.toggle_menu')}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            {isOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-luxury-dark border-t border-luxury-border"
            role="navigation"
            aria-label={t('accessibility.mobile_menu', 'Mobile menu')}
          >
            <ul className="container mx-auto px-4 py-4" role="list">
              {navLinks.map((link, index) => (
                <motion.li
                  key={link.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={link.path}
                    className={`block py-3 text-lg font-medium transition-colors ${
                      location.pathname === link.path
                        ? 'text-gold-500'
                        : 'text-gray-300 hover:text-white'
                    }`}
                    aria-current={location.pathname === link.path ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
              <li className="flex items-center gap-4 mt-4 pt-4 border-t border-luxury-border">
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 text-gray-300 hover:text-gold-500 transition-colors"
                  aria-label={t('accessibility.switch_language', 'Switch language')}
                >
                  <Globe size={18} aria-hidden="true" />
                  <span>{i18n.language === 'en' ? 'العربية' : 'English'}</span>
                </button>
                <Link to="/premium" className="flex-1">
                  <Button variant="primary" size="sm" className="w-full">
                    {t('nav.premium')}
                  </Button>
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
