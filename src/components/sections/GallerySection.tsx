import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container, Section, SectionHeading, Button } from '../ui';
import { galleryItems, galleryCategories, galleryConfig } from '../../content';

const GallerySection = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = galleryCategories.map((cat) => ({
    id: cat.id,
    label: t(cat.labelKey),
  }));

  const filteredItems = activeCategory === 'all'
    ? galleryItems.slice(0, galleryConfig.sectionDisplayLimit)
    : galleryItems.filter((item) => item.category === activeCategory).slice(0, galleryConfig.sectionDisplayLimit);

  return (
    <Section>
      <Container>
        <SectionHeading titleKey="gallery.title" subtitleKey="gallery.subtitle" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 text-sm font-medium rounded-sm transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-gold-500 text-luxury-black'
                  : 'bg-luxury-light text-gray-400 hover:text-white hover:bg-luxury-gray'
              }`}
            >
              {category.label}
            </button>
          ))}
        </motion.div>

        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group relative aspect-[3/4] overflow-hidden rounded-sm cursor-pointer"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {item.isPremium && (
                  <div className="absolute top-4 right-4 bg-luxury-black/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 text-gold-500 text-xs">
                    <Lock className="w-3 h-3" />
                    <span>Premium</span>
                  </div>
                )}

                <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                  <h3 className="text-white text-xl font-display mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </div>

                <div className="absolute inset-0 border border-gold-500/0 group-hover:border-gold-500/50 rounded-sm transition-all duration-500" />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link to="/gallery">
            <Button variant="outline" className="group">
              {t('gallery.view_more')}
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>
      </Container>
    </Section>
  );
};

export default GallerySection;
