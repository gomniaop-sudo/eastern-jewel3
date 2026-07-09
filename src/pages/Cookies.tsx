import { motion } from 'framer-motion';
import { SEO, Container, Section } from '../components/ui';
import { siteConfig, pageSeoConfig } from '../config';

const Cookies = () => {
  return (
    <>
      <SEO
        title={pageSeoConfig.cookies.title}
        description={pageSeoConfig.cookies.description}
      />

      <Section className="pt-24">
        <Container size="md" className="prose prose-invert prose-gold max-w-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-display text-white mb-8">Cookie Policy</h1>
            <p className="text-gray-400 mb-8">Last updated: January 2026</p>

            <div className="space-y-8 text-gray-300">
              <section>
                <h2 className="text-2xl font-display text-white mb-4">What Are Cookies?</h2>
                <p>
                  Cookies are small text files that are stored on your computer or mobile device when you visit
                  a website. They are widely used to make websites work more efficiently and provide information
                  to the website owners.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display text-white mb-4">Types of Cookies We Use</h2>

                <h3 className="text-xl font-display text-white mt-6 mb-3">Essential Cookies</h3>
                <p>
                  These cookies are necessary for the website to function and cannot be switched off. They are
                  usually set in response to actions you take, such as setting your privacy preferences or
                  logging in.
                </p>

                <h3 className="text-xl font-display text-white mt-6 mb-3">Analytics Cookies</h3>
                <p>
                  These cookies help us understand how visitors interact with our website by collecting and
                  reporting information anonymously. This helps us improve our website and services.
                </p>

                <h3 className="text-xl font-display text-white mt-6 mb-3">Marketing Cookies</h3>
                <p>
                  These cookies are used to track visitors across websites. The intention is to display ads
                  that are relevant and engaging for the individual user.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display text-white mb-4">How We Use Cookies</h2>
                <p>We use cookies for the following purposes:</p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>Authenticating users and remembering your preferences</li>
                  <li>Understanding how you use our website</li>
                  <li>Improving our website and services</li>
                  <li>Delivering relevant content and advertising</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-display text-white mb-4">Third-Party Cookies</h2>
                <p>
                  Some cookies are placed by third-party services that appear on our pages. We do not control
                  these cookies. The third-party services we may use include analytics providers and payment
                  processors.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display text-white mb-4">Managing Cookies</h2>
                <p>
                  You can control and manage cookies in various ways. Most browsers allow you to control cookies
                  through their settings. However, restricting cookies may impact the functionality of some
                  features on our website.
                </p>
                <p className="mt-4">
                  To manage cookies in your browser:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>Chrome: Settings → Privacy and security → Cookies</li>
                  <li>Firefox: Options → Privacy & Security → Cookies</li>
                  <li>Safari: Preferences → Privacy → Cookies</li>
                  <li>Edge: Settings → Privacy → Cookies</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-display text-white mb-4">Contact Us</h2>
                <p>
                  If you have any questions about our use of cookies, please contact us at{' '}
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

export default Cookies;
