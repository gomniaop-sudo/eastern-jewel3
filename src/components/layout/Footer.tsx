import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Heart, ExternalLink, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container, Input, Button } from '../ui';
import { useState } from 'react';
import { siteConfig, navigationConfig, socialConfig } from '../../config';

const Footer = () => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const navLinks = navigationConfig.main.map((link) => ({
    path: link.path,
    label: t(link.labelKey),
  }));

  const legalLinks = navigationConfig.legal.map((link) => ({
    path: link.path,
    label: t(link.labelKey),
  }));

  const socialLinks = [
    { icon: Share2, href: socialConfig.external.instagram, label: 'Instagram' },
    { icon: ExternalLink, href: socialConfig.external.twitter, label: 'Twitter' },
    { icon: Mail, href: `mailto:${siteConfig.email.contact}`, label: 'Email' },
  ];

  const year = new Date().getFullYear();

  return (
    <footer className="bg-luxury-dark border-t border-luxury-border" role="contentinfo">
      <Container>
        <div className="py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-1"
            >
              <Link to="/" className="inline-block mb-6" aria-label={t('accessibility.home_link', 'Eastern Jewel Home')}>
                <span className="font-display text-2xl">
                  <span className="text-gold-500">{siteConfig.nameParts.first}</span>
                  <span className="text-white"> {siteConfig.nameParts.second}</span>
                </span>
              </Link>
              <p className="text-gray-400 mb-6">{t('footer.tagline')}</p>
              <nav aria-label={t('accessibility.social_links', 'Social links')}>
                <ul className="flex items-center gap-4" role="list">
                  {socialLinks.map((social) => (
                    <li key={social.label}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-luxury-light hover:bg-gold-500 text-gray-400 hover:text-luxury-black transition-all duration-300 focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-luxury-dark"
                        aria-label={t('accessibility.social_link', { site: social.label, defaultValue: `Visit our ${social.label} page` })}
                      >
                        <social.icon size={18} aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h4 className="text-white font-semibold mb-4" id="footer-nav-heading">{t('footer.navigation')}</h4>
              <nav aria-labelledby="footer-nav-heading">
                <ul className="space-y-3" role="list">
                  {navLinks.map((link) => (
                    <li key={link.path}>
                      <Link
                        to={link.path}
                        className="text-gray-400 hover:text-gold-500 transition-colors focus:outline-none focus:text-gold-500"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h4 className="text-white font-semibold mb-4" id="footer-legal-heading">{t('footer.legal')}</h4>
              <nav aria-labelledby="footer-legal-heading">
                <ul className="space-y-3" role="list">
                  {legalLinks.map((link) => (
                    <li key={link.path}>
                      <Link
                        to={link.path}
                        className="text-gray-400 hover:text-gold-500 transition-colors focus:outline-none focus:text-gold-500"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <h4 className="text-white font-semibold mb-4" id="newsletter-heading">{t('newsletter.title')}</h4>
              <p className="text-gray-400 text-sm mb-4">{t('newsletter.description')}</p>
              {subscribed ? (
                <div className="text-gold-500 text-sm" role="status" aria-live="polite">{t('newsletter.success')}</div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-3" aria-labelledby="newsletter-heading">
                  <Input
                    id="newsletter-email"
                    name="newsletter-email"
                    type="email"
                    placeholder={t('newsletter.placeholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-sm"
                    aria-required="true"
                    aria-label={t('newsletter.placeholder')}
                  />
                  <Button type="submit" variant="primary" size="sm" className="w-full">
                    {t('newsletter.submit')}
                  </Button>
                </form>
              )}
              <p className="text-gray-500 text-xs mt-3">{t('newsletter.privacy')}</p>
            </motion.div>
          </div>
        </div>

        <div className="py-6 border-t border-luxury-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              {t('footer.copyright', { year })}
            </p>
            <p className="text-gray-600 text-sm flex items-center gap-1" aria-hidden="true">
              {i18n.language === 'en' ? 'Made with' : 'صنع بـ'}
              <Heart size={14} className="text-gold-500 fill-gold-500" />
              {i18n.language === 'en' ? 'for the discerning eye' : 'للعين المميزة'}
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
