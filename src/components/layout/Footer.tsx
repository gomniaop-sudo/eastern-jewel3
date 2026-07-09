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
    <footer className="bg-luxury-dark border-t border-luxury-border">
      <Container>
        <div className="py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-1"
            >
              <Link to="/" className="inline-block mb-6">
                <span className="font-display text-2xl">
                  <span className="text-gold-500">{siteConfig.nameParts.first}</span>
                  <span className="text-white"> {siteConfig.nameParts.second}</span>
                </span>
              </Link>
              <p className="text-gray-400 mb-6">{t('footer.tagline')}</p>
              <div className="flex items-center gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-luxury-light hover:bg-gold-500 text-gray-400 hover:text-luxury-black transition-all duration-300"
                    aria-label={social.label}
                  >
                    <social.icon size={18} />
                  </a>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h4 className="text-white font-semibold mb-4">{t('footer.navigation')}</h4>
              <ul className="space-y-3">
                {navLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-gold-500 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h4 className="text-white font-semibold mb-4">{t('footer.legal')}</h4>
              <ul className="space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-gold-500 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <h4 className="text-white font-semibold mb-4">{t('newsletter.title')}</h4>
              <p className="text-gray-400 text-sm mb-4">{t('newsletter.description')}</p>
              {subscribed ? (
                <div className="text-gold-500 text-sm">{t('newsletter.success')}</div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <Input
                    type="email"
                    placeholder={t('newsletter.placeholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-sm"
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
            <p className="text-gray-600 text-sm flex items-center gap-1">
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
