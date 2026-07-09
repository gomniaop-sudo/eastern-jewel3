import { motion } from 'framer-motion';
import { SEO, Container, Section } from '../components/ui';
import { siteConfig, addressConfig, pageSeoConfig } from '../config';

const Compliance2257 = () => {
  return (
    <>
      <SEO
        title={pageSeoConfig['2257'].title}
        description={pageSeoConfig['2257'].description}
      />

      <Section className="pt-24">
        <Container size="md" className="prose prose-invert prose-gold max-w-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-display text-white mb-8">2257 Record Keeping Compliance</h1>
            <p className="text-gray-400 mb-8">In compliance with 18 U.S.C. 2257 and 28 CFR Part 75</p>

            <div className="space-y-8 text-gray-300">
              <section>
                <h2 className="text-2xl font-display text-white mb-4">Compliance Statement</h2>
                <p>
                  All models, actors, and other persons that appear in any visual depiction of actual or
                  simulated sexually explicit conduct appearing or otherwise contained in {siteConfig.name} were
                  over the age of eighteen years at the time of creation of such depictions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display text-white mb-4">Record Keeping Requirements</h2>
                <p>
                  The records required by 18 U.S.C. 2257 and 28 CFR Part 75 regarding records of the age and
                  identity of performers are kept by the Custodian of Records at the following location:
                </p>
                <div className="bg-luxury-dark border border-luxury-border rounded-sm p-6 mt-4">
                  <p className="text-white font-medium mb-2">Custodian of Records</p>
                  <p>{siteConfig.name}</p>
                  <p>Attn: Compliance Officer</p>
                  <p>{addressConfig.street}</p>
                  <p>{addressConfig.city}, {addressConfig.state} {addressConfig.zip}, {addressConfig.country}</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-display text-white mb-4">Third-Party Content</h2>
                <p>
                  For content licensed from third-party producers, the original records of age and identity
                  required by 18 U.S.C. 2257 and 28 CFR Part 75 are maintained by the respective producers.
                  {siteConfig.name} relies on the assurances and representations of such producers that all models
                  are over the age of 18.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display text-white mb-4">Contact Information</h2>
                <p>
                  For questions regarding 2257 compliance or to request access to records, please contact:
                </p>
                <div className="bg-luxury-dark border border-luxury-border rounded-sm p-6 mt-4">
                  <p>Email: <a href={`mailto:${siteConfig.email.compliance}`} className="text-gold-500 hover:text-gold-400">{siteConfig.email.compliance}</a></p>
                  <p>Phone: +1 (555) 123-4567</p>
                  <p>Office Hours: Monday - Friday, 9:00 AM - 5:00 PM EST</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-display text-white mb-4">Additional Information</h2>
                <p>
                  The site operators assert that to the best of their knowledge and belief, the content being
                  made available contains no depiction involving a minor. All performers are adults engaged in
                  simulated or actual conduct with their full, free, and informed consent.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-display text-white mb-4">Exemption Notice</h2>
                <p>
                  Visual depictions of certain content, including but not limited to images depicting mere
                  nudity, may be exempt from 18 U.S.C. 2257 and 28 CFR Part 75 record-keeping requirements.
                  Such content is marked accordingly. The site operators maintain appropriate records for all
                  content requiring compliance.
                </p>
              </section>
            </div>
          </motion.div>
        </Container>
      </Section>
    </>
  );
};

export default Compliance2257;
