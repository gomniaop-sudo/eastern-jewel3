import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container, Section, SectionHeading, Button } from '../ui';
import { premiumFeatures, premiumSectionImage } from '../../content';

const PremiumSection = () => {
  const { t, i18n } = useTranslation();

  return (
    <Section variant="gradient">
      <Container>
        <SectionHeading titleKey="premium.title" subtitleKey="premium.subtitle" />

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              {t('premium.description')}
            </p>

            <div className="space-y-4 mb-10">
              {premiumFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start gap-4 p-4 bg-luxury-light/30 rounded-sm border border-luxury-border hover:border-gold-500/30 transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-gold-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-luxury-black" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">
                      {i18n.language === 'ar' ? feature.title.ar : feature.title.en}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      {i18n.language === 'ar' ? feature.description.ar : feature.description.en}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/premium">
                <Button variant="primary" className="group">
                  {t('premium.cta')}
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="ghost">{t('premium.learn_more')}</Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-gold-500/20 to-transparent rounded-full blur-3xl" />
              <div className="relative bg-luxury-dark border border-gold-500/30 rounded-lg p-8 h-full flex flex-col justify-center"
                style={{
                  backgroundImage: `url('${premiumSectionImage.src}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-luxury-black/80 rounded-lg" />
                <div className="relative text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gold-500/20 border-2 border-gold-500 mb-6">
                    <span className="text-3xl font-display text-gold-500">EJ</span>
                  </div>
                  <h3 className="text-2xl font-display text-white mb-2">Premium Member</h3>
                  <p className="text-gold-500 text-sm">Exclusive Access</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
};

export default PremiumSection;
