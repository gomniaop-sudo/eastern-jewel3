import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SEO, Container, Section, SectionHeading } from '../components/ui';
import { galleryItems, galleryCategories } from '../content';
import { pageSeoConfig } from '../config';

const Gallery = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState<typeof galleryItems[0] | null>(null);

  const categories = galleryCategories.map((cat) => ({
    id: cat.id,
    label: t(cat.labelKey),
  }));

  const filteredItems = activeCategory === 'all'
    ? galleryItems
    : galleryItems.filter((item) => item.category === activeCategory);

  const currentIndex = selectedImage
    ? filteredItems.findIndex((item) => item.id === selectedImage.id)
    : -1;

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setSelectedImage(filteredItems[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredItems.length - 1) {
      setSelectedImage(filteredItems[currentIndex + 1]);
    }
  };

  return (
    <>
      <SEO
        title={pageSeoConfig.gallery.title}
        description={pageSeoConfig.gallery.description}
      />

      <Section className="pt-24">
        <Container>
          <SectionHeading titleKey="gallery.title" subtitleKey="gallery.subtitle" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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

          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  onClick={() => setSelectedImage(item)}
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
                    <h3 className="text-white text-lg font-display mb-1">{item.title}</h3>
                    <p className="text-gray-400 text-sm">{item.description}</p>
                  </div>

                  <div className="absolute inset-0 border border-gold-500/0 group-hover:border-gold-500/50 rounded-sm transition-all duration-500" />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </Container>
      </Section>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-luxury-black/95 backdrop-blur-lg p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 md:top-8 md:right-8 w-12 h-12 rounded-full bg-luxury-light hover:bg-gold-500 text-white hover:text-luxury-black flex items-center justify-center transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            {currentIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                className="absolute left-4 md:left-8 w-12 h-12 rounded-full bg-luxury-light hover:bg-gold-500 text-white hover:text-luxury-black flex items-center justify-center transition-colors z-10"
                aria-label="Previous"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {currentIndex < filteredItems.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-4 md:right-8 w-12 h-12 rounded-full bg-luxury-light hover:bg-gold-500 text-white hover:text-luxury-black flex items-center justify-center transition-colors z-10"
                aria-label="Next"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.image}
                alt={selectedImage.title}
                className="w-full h-auto max-h-[80vh] object-contain rounded-sm"
              />

              {selectedImage.isPremium && (
                <div className="absolute top-4 right-4 bg-luxury-black/80 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 text-gold-500">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm">Premium Content</span>
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-luxury-black to-transparent">
                <h3 className="text-white text-2xl font-display mb-2">{selectedImage.title}</h3>
                <p className="text-gray-300">{selectedImage.description}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Gallery;
