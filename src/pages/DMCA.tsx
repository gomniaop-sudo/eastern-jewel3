import { motion } from 'framer-motion';
import { SEO, Container, Section } from '../components/ui';
import { siteConfig, addressConfig, pageSeoConfig } from '../config';

const DMCA = () => {
  return (
    <>
      <SEO
        title={pageSeoConfig.dmca.title}
        description={pageSeoConfig.dmca.description}
      />

      <Section className="pt-24">
        <Container size="md" className="prose prose-invert prose-gold max-w-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-display text-white mb-8">DMCA Policy</h1>
            <p className="text-gray-400 mb-8">Digital Millennium Copyright Act Notice</p>

            <div className="space-y-8 text-gray-300">
              <section>
                <h2 className="text-2xl font-display text-white mb-4">Copyright Infringement Claims</h2>
                <p>
                  {siteConfig.name} respects the intellectual property rights of others and expects users of our
                  services to do the same. In accordance with the Digital Millennium Copyright Act (DMCA), we
                  will respond expeditiously to claims of copyright infringement on our website.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display text-white mb-4">Filing a DMCA Notice</h2>
                <p>
                  If you believe that your copyrighted work has been copied in a way that constitutes
                  copyright infringement, please provide our designated Copyright Agent with the following
                  information:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>Your physical or electronic signature</li>
                  <li>Identification of the copyrighted work claimed to have been infringed</li>
                  <li>Identification of the material that is claimed to be infringing and its location</li>
                  <li>Your contact information (address, telephone number, and email)</li>
                  <li>A statement that you have a good faith belief that use is not authorized</li>
                  <li>
                    A statement, under penalty of perjury, that the information is accurate and you are
                    authorized to act on behalf of the copyright owner
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-display text-white mb-4">Counter-Notification</h2>
                <p>
                  If you believe that your content was wrongly removed due to a mistake or misidentification,
                  you may file a counter-notification. To be effective, the counter-notification must include:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>Your physical or electronic signature</li>
                  <li>Identification of the material that was removed and its location before removal</li>
                  <li>
                    A statement under penalty of perjury that you have a good faith belief the material was
                    removed due to mistake or misidentification
                  </li>
                  <li>Your name, address, phone number, and email</li>
                  <li>
                    A statement that you consent to the jurisdiction of federal court for your district
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-display text-white mb-4">Copyright Agent Contact</h2>
                <p>
                  Please send all DMCA notices to our designated Copyright Agent:
                </p>
                <div className="bg-luxury-dark border border-luxury-border rounded-sm p-6 mt-4">
                  <p className="text-white font-medium">Copyright Agent</p>
                  <p>{siteConfig.name}</p>
                  <p>Email: <a href={`mailto:${siteConfig.email.dmca}`} className="text-gold-500 hover:text-gold-400">{siteConfig.email.dmca}</a></p>
                  <p>Address: {addressConfig.street}</p>
                  <p>{addressConfig.city}, {addressConfig.state} {addressConfig.zip}, {addressConfig.country}</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-display text-white mb-4">Repeat Infringers</h2>
                <p>
                  We will terminate the accounts of users who are repeat copyright infringers. We also reserve
                  the right to terminate access to our services for any user who violates these policies.
                </p>
              </section>
            </div>
          </motion.div>
        </Container>
      </Section>
    </>
  );
};

export default DMCA;
