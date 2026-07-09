import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Clock, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SEO, Container, Section, SectionHeading, Input, Textarea, Button } from '../components/ui';
import { siteConfig, pageSeoConfig } from '../config';

const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setError(t('contact.form.error'));
      return;
    }
    setSubmitted(true);
    setError('');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  return (
    <>
      <SEO
        title={pageSeoConfig.contact.title}
        description={pageSeoConfig.contact.description}
      />

      <Section className="pt-24">
        <Container size="md">
          <SectionHeading titleKey="contact.title" subtitleKey="contact.subtitle" />

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-gray-300 text-lg mb-8">{t('contact.description')}</p>

              <div className="space-y-6 mb-8">
                <div className="flex items-center gap-4 p-4 bg-luxury-dark rounded-sm border border-luxury-border">
                  <div className="w-12 h-12 rounded-full bg-luxury-light flex items-center justify-center">
                    <Mail className="w-6 h-6 text-gold-500" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">{t('contact.info.email')}</p>
                    <p className="text-white">{siteConfig.email.contact}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-luxury-dark rounded-sm border border-luxury-border">
                  <div className="w-12 h-12 rounded-full bg-luxury-light flex items-center justify-center">
                    <Clock className="w-6 h-6 text-gold-500" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">{t('contact.info.response')}</p>
                    <p className="text-white">{siteConfig.responseTime}</p>
                  </div>
                </div>
              </div>

              <p className="text-gray-400 text-sm">
                For business inquiries, collaborations, or press requests, please contact us through the form. We typically respond within {siteConfig.responseTime} during business days.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {submitted ? (
                <div className="bg-luxury-dark border border-gold-500 rounded-sm p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Send className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-display text-white mb-2">Message Sent!</h3>
                  <p className="text-gray-400">{t('contact.form.success')}</p>
                  <Button
                    variant="ghost"
                    onClick={() => setSubmitted(false)}
                    className="mt-6"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-sm">
                      {error}
                    </div>
                  )}

                  <Input
                    id="name"
                    name="name"
                    placeholder={t('contact.form.name')}
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t('contact.form.email')}
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    id="subject"
                    name="subject"
                    placeholder={t('contact.form.subject')}
                    value={formData.subject}
                    onChange={handleChange}
                  />

                  <Textarea
                    id="message"
                    name="message"
                    placeholder={t('contact.form.message')}
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    required
                  />

                  <Button type="submit" variant="primary" className="w-full">
                    {t('contact.form.submit')}
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        </Container>
      </Section>
    </>
  );
};

export default Contact;
