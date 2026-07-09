import { motion } from 'framer-motion';
import { SEO, Container, Section } from '../components/ui';
import { siteConfig, pageSeoConfig } from '../config';

const Privacy = () => {
  return (
    <>
      <SEO
        title={pageSeoConfig.privacy.title}
        description={pageSeoConfig.privacy.description}
      />

      <Section className="pt-24">
        <Container size="md" className="prose prose-invert prose-gold max-w-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-display text-white mb-8">Privacy Policy</h1>
            <p className="text-gray-400 mb-8">Last updated: January 2026</p>

            <div className="space-y-8 text-gray-300">
              <section>
                <h2 className="text-2xl font-display text-white mb-4">1. Information We Collect</h2>
                <p>
                  {siteConfig.name} collects information you provide directly, such as when you create an account,
                  subscribe to newsletters, or contact us. This may include your name, email address, and payment
                  information for premium services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display text-white mb-4">2. How We Use Your Information</h2>
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send promotional communications (with your consent)</li>
                  <li>Respond to your comments, questions, and requests</li>
                  <li>Monitor and analyze trends, usage, and activities</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-display text-white mb-4">3. Information Sharing</h2>
                <p>
                  We do not sell, trade, or rent your personal information to third parties. We may share your
                  information with trusted service providers who assist us in operating our website, conducting
                  our business, or serving you, provided they agree to keep this information confidential.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display text-white mb-4">4. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational security measures to protect your personal
                  information against unauthorized access, alteration, disclosure, or destruction. However, no
                  method of transmission over the Internet is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display text-white mb-4">5. Cookies</h2>
                <p>
                  We use cookies and similar tracking technologies to track activity on our website and hold
                  certain information. For more details, please see our <a href="/cookies" className="text-gold-500 hover:text-gold-400">Cookie Policy</a>.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display text-white mb-4">6. Your Rights</h2>
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>Access the personal data we hold about you</li>
                  <li>Request deletion of your personal data</li>
                  <li>Correction of inaccurate personal data</li>
                  <li>Object to processing of your personal data</li>
                  <li>Data portability</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-display text-white mb-4">7. Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact us at{' '}
                  <a href={`mailto:${siteConfig.email.privacy}`} className="text-gold-500 hover:text-gold-400">
                    {siteConfig.email.privacy}
                  </a>
                </p>
              </section>
            </div>
          </motion.div>
        </Container>
      </Section>
    </>
  );
};

export default Privacy;
