import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-luxury-black">
      <a href="#main-content" className="skip-link focus:top-0" aria-label={t('accessibility.skip')}>
        {t('accessibility.skip')}
      </a>
      <Navbar />
      <main id="main-content" className="flex-1" role="main" aria-label={t('accessibility.main_content', 'Main content')}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
