import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Award, Heart, Eye, Sparkles, Users, Camera } from 'lucide-react';
import { SEO, Container, Section, SectionHeading } from '../components/ui';
import { pageSeoConfig } from '../config';
import { aboutValues, aboutTeam, aboutStats, aboutImage, teamSectionHeading, valuesSectionHeading } from '../content';

// Icon mapping for dynamic icon rendering
const iconMap: Record<string, React.ElementType> = {
  Eye,
  Heart,
  Award,
  Sparkles,
  Users,
  Camera,
};

const About = () => {
  const { t, i18n } = useTranslation();

  return (
    <>
      <SEO
        title={pageSeoConfig.about.title}
        description={pageSeoConfig.about.description}
      />

      <Section className="pt-24">
        <Container>
          <SectionHeading titleKey="about.title" subtitleKey="about.subtitle" />

          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
                <img
                  src={aboutImage.src}
                  alt={aboutImage.alt}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-transparent to-transparent opacity-60" />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gold-500/10 border border-gold-500/30 rounded-sm" />
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-gold-500/10 border border-gold-500/30 rounded-sm" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-display text-white mb-6">{t('about.philosophy_title')}</h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                {t('about.description')}
              </p>
              <p className="text-gray-400 leading-relaxed mb-8">
                {t('about.philosophy')}
              </p>

              <div className="grid grid-cols-2 gap-4">
                {aboutStats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 bg-luxury-dark border border-luxury-border rounded-sm hover:border-gold-500/30 transition-all"
                  >
                    <div className="text-3xl font-bold text-gold-500 mb-2">{stat.value}</div>
                    <div className="text-gray-400 text-sm">
                      {i18n.language === 'ar' ? stat.label.ar : stat.label.en}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="mb-20">
            <h3 className="text-2xl font-display text-white text-center mb-12">
              {i18n.language === 'ar' ? valuesSectionHeading.ar : valuesSectionHeading.en}
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {aboutValues.map((value, index) => {
                const IconComponent = iconMap[value.icon];
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 bg-luxury-dark border border-luxury-border rounded-sm hover:border-gold-500/30 transition-all text-center"
                  >
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-luxury-light flex items-center justify-center group-hover:bg-gold-500/10 transition-colors">
                      {IconComponent && <IconComponent className="w-7 h-7 text-gold-500" />}
                    </div>
                    <h4 className="text-lg font-display text-white mb-2">
                      {i18n.language === 'ar' ? value.title.ar : value.title.en}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      {i18n.language === 'ar' ? value.description.ar : value.description.en}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-display text-white text-center mb-4">Our Team</h3>
            <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
              {i18n.language === 'ar' ? teamSectionHeading.ar : teamSectionHeading.en}
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {aboutTeam.map((member, index) => {
                const IconComponent = iconMap[member.icon];
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-luxury-light flex items-center justify-center">
                      {IconComponent && <IconComponent className="w-8 h-8 text-gold-500" />}
                    </div>
                    <h4 className="text-lg font-display text-white mb-2">
                      {i18n.language === 'ar' ? member.role.ar : member.role.en}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      {i18n.language === 'ar' ? member.description.ar : member.description.en}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
};

export default About;
