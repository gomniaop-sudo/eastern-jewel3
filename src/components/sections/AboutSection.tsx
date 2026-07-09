import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Container, Section, SectionHeading } from '../ui';
import { aboutStats, aboutImage } from '../../content';

const AboutSection = () => {
  const { t, i18n } = useTranslation();

  return (
    <Section variant="dark">
      <Container>
        <SectionHeading titleKey="about.title" subtitleKey="about.subtitle" />

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-gray-300 text-lg mb-6 leading-relaxed">
              {t('about.description')}
            </p>

            <h3 className="text-2xl font-display text-gold-500 mb-4">
              {t('about.philosophy_title')}
            </h3>

            <p className="text-gray-400 leading-relaxed">
              {t('about.philosophy')}
            </p>

            <div className="grid grid-cols-2 gap-4 mt-10">
              {aboutStats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="text-center p-4 bg-luxury-light/30 rounded-sm border border-luxury-border hover:border-gold-500/30 transition-all"
                >
                  <div className="text-3xl md:text-4xl font-bold text-gold-500 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400">
                    {i18n.language === 'ar' ? stat.label.ar : stat.label.en}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
              <img
                src={aboutImage.src}
                alt={aboutImage.alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-transparent to-transparent" />
            </div>

            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gold-500/10 border border-gold-500/30 rounded-sm" />
            <div className="absolute -top-6 -left-6 w-16 h-16 bg-gold-500/10 border border-gold-500/30 rounded-sm" />
          </motion.div>
        </div>
      </Container>
    </Section>
  );
};

export default AboutSection;
