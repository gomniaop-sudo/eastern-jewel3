import { lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Layout } from './components/layout';
import { AdminLayout } from './components/admin';
import { ProtectedRoute } from './components/auth';
import { AuthProvider } from './context/AuthContext';
import { SuspenseWrapper } from './components/common';
import './i18n';

// Eagerly loaded home page (critical for initial render)
import { Home, About } from './pages';

// Lazy loaded public pages
const Gallery = lazy(() => import('./pages/Gallery'));
const Premium = lazy(() => import('./pages/Premium'));
const Journal = lazy(() => import('./pages/Journal'));
const Contact = lazy(() => import('./pages/Contact'));

// Lazy loaded legal pages
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Cookies = lazy(() => import('./pages/Cookies'));
const DMCA = lazy(() => import('./pages/DMCA'));
const Compliance2257 = lazy(() => import('./pages/Compliance2257'));

// Lazy loaded admin pages
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const GalleryManager = lazy(() => import('./pages/admin/GalleryManager'));
const JournalManager = lazy(() => import('./pages/admin/JournalManager'));
const MessagesManager = lazy(() => import('./pages/admin/MessagesManager'));
const NewsletterManager = lazy(() => import('./pages/admin/NewsletterManager'));
const SettingsManager = lazy(() => import('./pages/admin/SettingsManager'));
const ProfileManager = lazy(() => import('./pages/admin/ProfileManager'));
const MediaLibrary = lazy(() => import('./pages/admin/MediaLibrary'));

// Lazy loaded auth pages
const UnauthorizedPage = lazy(() => import('./components/auth/UnauthorizedPage'));

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
            {/* Public routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route
                path="gallery"
                element={
                  <SuspenseWrapper type="gallery">
                    <Gallery />
                  </SuspenseWrapper>
                }
              />
              <Route
                path="premium"
                element={
                  <SuspenseWrapper type="page">
                    <Premium />
                  </SuspenseWrapper>
                }
              />
              <Route
                path="journal"
                element={
                  <SuspenseWrapper type="page">
                    <Journal />
                  </SuspenseWrapper>
                }
              />
              <Route
                path="contact"
                element={
                  <SuspenseWrapper type="page">
                    <Contact />
                  </SuspenseWrapper>
                }
              />
              {/* Legal pages */}
              <Route
                path="privacy"
                element={
                  <SuspenseWrapper type="content">
                    <Privacy />
                  </SuspenseWrapper>
                }
              />
              <Route
                path="terms"
                element={
                  <SuspenseWrapper type="content">
                    <Terms />
                  </SuspenseWrapper>
                }
              />
              <Route
                path="cookies"
                element={
                  <SuspenseWrapper type="content">
                    <Cookies />
                  </SuspenseWrapper>
                }
              />
              <Route
                path="dmca"
                element={
                  <SuspenseWrapper type="content">
                    <DMCA />
                  </SuspenseWrapper>
                }
              />
              <Route
                path="2257"
                element={
                  <SuspenseWrapper type="content">
                    <Compliance2257 />
                  </SuspenseWrapper>
                }
              />
              <Route
                path="unauthorized"
                element={
                  <SuspenseWrapper type="minimal">
                    <UnauthorizedPage />
                  </SuspenseWrapper>
                }
              />
            </Route>

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route
                index
                element={
                  <SuspenseWrapper type="dashboard">
                    <Dashboard />
                  </SuspenseWrapper>
                }
              />
              <Route
                path="gallery"
                element={
                  <SuspenseWrapper type="page">
                    <GalleryManager />
                  </SuspenseWrapper>
                }
              />
              <Route
                path="journal"
                element={
                  <SuspenseWrapper type="page">
                    <JournalManager />
                  </SuspenseWrapper>
                }
              />
              <Route
                path="messages"
                element={
                  <SuspenseWrapper type="page">
                    <MessagesManager />
                  </SuspenseWrapper>
                }
              />
              <Route
                path="newsletter"
                element={
                  <SuspenseWrapper type="page">
                    <NewsletterManager />
                  </SuspenseWrapper>
                }
              />
              <Route
                path="media"
                element={
                  <SuspenseWrapper type="page">
                    <MediaLibrary />
                  </SuspenseWrapper>
                }
              />
              <Route
                path="settings"
                element={
                  <SuspenseWrapper type="page">
                    <SettingsManager />
                  </SuspenseWrapper>
                }
              />
              <Route
                path="profile"
                element={
                  <SuspenseWrapper type="page">
                    <ProfileManager />
                  </SuspenseWrapper>
                }
              />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
