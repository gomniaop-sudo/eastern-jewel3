import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SEO, Container, Section, SectionHeading, Card } from '../components/ui';
import { journalEntries } from '../content';
import { useState } from 'react';
import { pageSeoConfig } from '../config';

const Journal = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'Photography', 'Art Direction', 'Editorial'];

  const filteredEntries = selectedCategory === 'all'
    ? journalEntries
    : journalEntries.filter((entry) => entry.category === selectedCategory);

  return (
    <>
      <SEO
        title={pageSeoConfig.journal.title}
        description={pageSeoConfig.journal.description}
      />

      <Section className="pt-24">
        <Container>
          <SectionHeading titleKey="journal.title" subtitleKey="journal.subtitle" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap justify-center gap-2 mb-12"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 text-sm font-medium rounded-sm transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-gold-500 text-luxury-black'
                    : 'bg-luxury-light text-gray-400 hover:text-white hover:bg-luxury-gray'
                }`}
              >
                {category === 'all' ? t('journal.latest') : category}
              </button>
            ))}
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEntries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full overflow-hidden">
                  <Link to={`/journal/${entry.slug}`} className="block">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={entry.image}
                        alt={entry.title}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute top-4 left-4 bg-luxury-black/80 backdrop-blur-sm px-3 py-1 rounded-full text-gold-500 text-xs">
                        {entry.category}
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(entry.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <h3 className="text-xl font-display text-white mb-3 group-hover:text-gold-500 transition-colors">
                        {entry.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4">{entry.excerpt}</p>
                      <div className="flex items-center text-gold-500 text-sm font-medium group-hover:text-gold-400 transition-colors">
                        {t('journal.read_more')}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    </div>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
};

export default Journal;
