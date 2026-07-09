import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface SectionHeadingProps {
  titleKey: string;
  subtitleKey: string;
  centered?: boolean;
  className?: string;
}

const SectionHeading = ({ titleKey, subtitleKey, centered = true, className = '' }: SectionHeadingProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`${centered ? 'text-center' : ''} mb-12 ${className}`}
    >
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-display text-white mb-4">
        {t(titleKey)}
      </h2>
      <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent mx-auto mb-4" />
      <p className="text-gray-400 text-lg max-w-2xl mx-auto">
        {t(subtitleKey)}
      </p>
    </motion.div>
  );
};

export default SectionHeading;
