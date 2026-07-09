import { motion } from 'framer-motion';
import { SEO, Container, Section } from '../components/ui';
import { siteConfig, pageSeoConfig } from '../config';

const Terms = () => {
  return (
    <>
      <SEO
        title={pageSeoConfig.terms.title}
        description={pageSeoConfig.terms.description}
      />

      <Section className="pt-24">
        <Container size="md" className="prose prose-invert prose-gold max-w-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-display text-white mb-8">Terms of Service</h1>
            <p className="text-gray-400 mb-8">Last updated: January 2026</p>

            <div className="space-y-8 text-gray-300">
              <section>
                <h2 className="text-2xl font-display text-white mb-4">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using {siteConfig.name}, you accept and agree to be bound by the terms and
                  provisions of this agreement. If you do not agree to abide by these terms, please do not use
                  this service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display text-white mb-4">2. Description of Service</h2>
                <p>
                  {siteConfig.name} provides access to curated photography and exclusive content through our
                  website. Some content may require a premium membership subscription.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display text-white mb-4">3. User Accounts</h2>
                <p>
                  You are responsible for maintaining the confidentiality of your account and password. You
                  agree to accept responsibility for all activities that occur under your account. You must be
                  at least 18 years old to use this service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display text-white mb-4">4. Intellectual Property</h2>
                <p>
                  All content on {siteConfig.name}, including but not limited to text, graphics, logos, images,
                  and software, is the property of {siteConfig.name} or its content suppliers and is protected
                  by international copyright laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display text-white mb-4">5. Prohibited Uses</h2>
                <p>You agree not to:</p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>Use the service for any unlawful purpose</li>
                  <li>Copy, reproduce, or distribute any content without permission</li>
                  <li>Attempt to gain unauthorized access to any part of the service</li>
                  <li>Interfere with or disrupt the service or servers</li>
                  <li>Use automated systems to access the service without permission</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-display text-white mb-4">6. Subscription and Payments</h2>
                <p>
                  Premium memberships are billed on a recurring basis. You may cancel your subscription at any
                  time. No refunds are provided for partial subscription periods.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display text-white mb-4">7. Limitation of Liability</h2>
                <p>
                  {siteConfig.name} shall not be liable for any indirect, incidental, special, consequential, or
                  punitive damages resulting from your use of or inability to use the service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display text-white mb-4">8. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these terms at any time. We will notify users of any material
                  changes by posting the new terms on this page with an updated date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display text-white mb-4">9. Contact</h2>
                <p>
                  For questions about these Terms, please contact us at{' '}
                  <a href={`mailto:${siteConfig.email.legal}`} className="text-gold-500 hover:text-gold-400">
                    {siteConfig.email.legal}
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

export default Terms;
