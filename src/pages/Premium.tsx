import { motion } from 'framer-motion';
import { Check, Star, Zap, Shield, Headphones } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SEO, Container, Section, SectionHeading, Button } from '../components/ui';
import { pageSeoConfig } from '../config';
import { premiumFeatures, premiumTiers, popularBadge, whatsIncludedHeading } from '../content';

// Icon mapping for dynamic icon rendering
const iconMap: Record<string, React.ElementType> = {
  Star,
  Zap,
  Shield,
  Headphones,
};

const Premium = () => {
  const { t, i18n } = useTranslation();

  return (
    <>
      <SEO
        title={pageSeoConfig.premium.title}
        description={pageSeoConfig.premium.description}
      />

      <Section className="pt-24">
        <Container>
          <SectionHeading titleKey="premium.title" subtitleKey="premium.subtitle" />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gray-300 text-lg text-center max-w-3xl mx-auto mb-16"
          >
            {t('premium.description')}
          </motion.p>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {premiumTiers.map((tier, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-sm ${
                  tier.popular
                    ? 'bg-gradient-to-b from-gold-500/10 via-luxury-dark to-luxury-dark border-2 border-gold-500'
                    : 'bg-luxury-dark border border-luxury-border'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold-500 text-luxury-black px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current" />
                    {i18n.language === 'ar' ? popularBadge.ar : popularBadge.en}
                  </div>
                )}

                <div className="p-8">
                  <h3 className="text-2xl font-display text-white mb-2">
                    {i18n.language === 'ar' ? tier.name.ar : tier.name.en}
                  </h3>
                  <div className="text-4xl font-bold text-gold-500 mb-6">
                    {i18n.language === 'ar' ? tier.price.ar : tier.price.en}
                  </div>

                  <ul className="space-y-4 mb-8">
                    {tier.features.map((feature, findex) => (
                      <li key={findex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">
                          {i18n.language === 'ar' ? feature.ar : feature.en}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={tier.popular ? 'primary' : 'outline'}
                    className="w-full"
                  >
                    {t('premium.cta')}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20"
          >
            <h3 className="text-2xl font-display text-white text-center mb-12">
              {i18n.language === 'ar' ? whatsIncludedHeading.ar : whatsIncludedHeading.en}
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {premiumFeatures.map((feature, index) => {
                const IconComponent = iconMap[feature.icon];
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 bg-luxury-dark border border-luxury-border rounded-sm hover:border-gold-500/30 transition-all text-center"
                  >
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-luxury-light flex items-center justify-center">
                      {IconComponent && <IconComponent className="w-6 h-6 text-gold-500" />}
                    </div>
                    <h4 className="text-lg font-display text-white mb-2">
                      {i18n.language === 'ar' ? feature.title.ar : feature.title.en}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      {i18n.language === 'ar' ? feature.description.ar : feature.description.en}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </Container>
      </Section>
    </>
  );
};

export default Premium;
