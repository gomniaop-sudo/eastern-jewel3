import { SEO } from '../components/ui';
import { HeroSection, AboutSection, GallerySection, PremiumSection, JournalSection } from '../components/sections';
import { seoConfig } from '../config';

const Home = () => {
  return (
    <>
      <SEO jsonLd={seoConfig.jsonLd.website} />
      <HeroSection />
      <AboutSection />
      <GallerySection />
      <PremiumSection />
      <JournalSection />
    </>
  );
};

export default Home;
