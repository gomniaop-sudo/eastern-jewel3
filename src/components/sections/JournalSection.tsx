import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container, Section, SectionHeading, Button, Card } from '../ui';
import { journalEntries, journalConfig } from '../../content';

const JournalSection = () => {
  const { t } = useTranslation();

  return (
    <Section variant="dark">
      <Container>
        <SectionHeading titleKey="journal.title" subtitleKey="journal.subtitle" />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {journalEntries.slice(0, journalConfig.sectionDisplayLimit).map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full">
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
                    <p className="text-gray-400 text-sm line-clamp-2">{entry.excerpt}</p>
                  </div>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link to="/journal">
            <Button variant="outline" className="group">
              {t('journal.read_more')}
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>
      </Container>
    </Section>
  );
};

export default JournalSection;
