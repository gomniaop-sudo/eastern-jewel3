import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Loader2, AlertCircle, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SEO, Container, Section, SectionHeading, Card } from '../components/ui';
import { journalEntries, type JournalEntry } from '../content';
import { journalService, type JournalEntryRow } from '../services';
import { isSupabaseConfigured } from '../lib';
import { pageSeoConfig } from '../config';

type JournalDataItem = JournalEntryRow | JournalEntry;

const Journal = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [entries, setEntries] = useState<JournalDataItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['all', 'Photography', 'Art Direction', 'Editorial']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!isSupabaseConfigured()) {
        setEntries(journalEntries as unknown as JournalDataItem[]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [entriesData, categoriesData] = await Promise.all([
          journalService.getAll(),
          journalService.getCategories(),
        ]);

        if (categoriesData.length > 0) {
          setCategories(['all', ...categoriesData]);
        }

        const mappedEntries = entriesData.map((entry: JournalEntryRow) => ({
          ...entry,
          id: entry.id,
          title: entry.title,
          excerpt: entry.excerpt || '',
          date: entry.published_at || entry.created_at,
          image: entry.image_url || '',
          slug: entry.slug,
          category: entry.category || 'Editorial',
        }));

        setEntries(mappedEntries.length > 0 ? mappedEntries : journalEntries as unknown as JournalDataItem[]);
      } catch (err) {
        console.error('Error loading journal data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load journal');
        setEntries(journalEntries as unknown as JournalDataItem[]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredEntries = selectedCategory === 'all'
    ? entries
    : entries.filter((entry) => {
        const category = 'category' in entry ? entry.category : '';
        return category === selectedCategory;
      });

  const getEntryId = (entry: JournalDataItem): string => entry.id;
  const getEntryTitle = (entry: JournalDataItem): string => entry.title;
  const getEntryExcerpt = (entry: JournalDataItem): string => ('excerpt' in entry && entry.excerpt) || '';
  const getEntryDate = (entry: JournalDataItem): string => {
    if ('date' in entry && entry.date) return entry.date as string;
    if ('published_at' in entry && entry.published_at) return entry.published_at;
    if ('created_at' in entry && entry.created_at) return entry.created_at;
    return new Date().toISOString();
  };
  const getEntryImage = (entry: JournalDataItem): string => {
    if ('image' in entry && entry.image) return entry.image as string;
    if ('image_url' in entry && entry.image_url) return entry.image_url;
    return '';
  };
  const getEntrySlug = (entry: JournalDataItem): string => {
    if ('slug' in entry && entry.slug) return entry.slug;
    return entry.id;
  };
  const getEntryCategory = (entry: JournalDataItem): string => {
    if ('category' in entry && entry.category) return entry.category;
    return '';
  };

  return (
    <>
      <SEO
        title={pageSeoConfig.journal.title}
        description={pageSeoConfig.journal.description}
      />

      <Section className="pt-24">
        <Container>
          <SectionHeading titleKey="journal.title" subtitleKey="journal.subtitle" />

          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-gold-500 animate-spin mb-4" />
              <p className="text-gray-400">{t('common.loading')}</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-20">
              <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
              <p className="text-red-400 mb-2">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-gold-500 hover:text-gold-400 underline"
              >
                {t('common.retry')}
              </button>
            </div>
          )}

          {!loading && !error && entries.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <FileText className="w-10 h-10 text-gray-500 mb-4" />
              <p className="text-gray-400">{t('journal.empty')}</p>
            </div>
          )}

          {!loading && !error && entries.length > 0 && (
            <>
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
                    key={getEntryId(entry)}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="h-full overflow-hidden group">
                      <Link to={`/journal/${getEntrySlug(entry)}`} className="block">
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <img
                            src={getEntryImage(entry)}
                            alt={getEntryTitle(entry)}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            loading="lazy"
                          />
                          <div className="absolute top-4 left-4 bg-luxury-black/80 backdrop-blur-sm px-3 py-1 rounded-full text-gold-500 text-xs">
                            {getEntryCategory(entry)}
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(getEntryDate(entry)).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          </div>
                          <h3 className="text-xl font-display text-white mb-3 group-hover:text-gold-500 transition-colors">
                            {getEntryTitle(entry)}
                          </h3>
                          <p className="text-gray-400 text-sm mb-4">{getEntryExcerpt(entry)}</p>
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
            </>
          )}
        </Container>
      </Section>
    </>
  );
};

export default Journal;
