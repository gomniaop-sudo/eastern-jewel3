import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Layout } from './components/layout';
import { AdminLayout } from './components/admin';
import { ProtectedRoute, UnauthorizedPage } from './components/auth';
import { AuthProvider } from './context/AuthContext';
import {
  Home,
  About,
  Gallery,
  Premium,
  Journal,
  Contact,
  Privacy,
  Terms,
  Cookies,
  DMCA,
  Compliance2257,
} from './pages';
import {
  Dashboard,
  GalleryManager,
  JournalManager,
  MessagesManager,
  NewsletterManager,
  SettingsManager,
  ProfileManager,
} from './pages/admin';
import './i18n';

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="premium" element={<Premium />} />
              <Route path="journal" element={<Journal />} />
              <Route path="contact" element={<Contact />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="terms" element={<Terms />} />
              <Route path="cookies" element={<Cookies />} />
              <Route path="dmca" element={<DMCA />} />
              <Route path="2257" element={<Compliance2257 />} />
              <Route path="unauthorized" element={<UnauthorizedPage />} />
            </Route>
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="gallery" element={<GalleryManager />} />
              <Route path="journal" element={<JournalManager />} />
              <Route path="messages" element={<MessagesManager />} />
              <Route path="newsletter" element={<NewsletterManager />} />
              <Route path="settings" element={<SettingsManager />} />
              <Route path="profile" element={<ProfileManager />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
