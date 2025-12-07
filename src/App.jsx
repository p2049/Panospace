import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AnimatePresence } from 'framer-motion';
import OrientationGuard from './components/OrientationGuard';
import MobileNavigation from './components/MobileNavigation';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';
import MotionWrapper from './components/MotionWrapper';
import AppLoading from './components/AppLoading';
import OfflineBanner from './components/OfflineBanner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserCacheProvider } from './context/UserCacheContext';
import { UIProvider } from './context/UIContext';
import { ToastProvider } from './context/ToastContext';
import ToastManager from './components/ToastManager';
import './styles/tap-targets.css';

// Lazy load pages for performance optimization
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Feed = lazy(() => import('./pages/Feed'));
const CreatePost = lazy(() => import('./pages/CreatePost'));
const Profile = lazy(() => import('./pages/Profile'));
const EditProfile = lazy(() => import('./pages/EditProfile'));
const Search = lazy(() => import('./pages/Search'));
const Legal = lazy(() => import('./pages/Legal'));
const EditPost = lazy(() => import('./pages/EditPost'));
const PostDetail = lazy(() => import('./pages/PostDetail'));

const CheckoutSuccess = lazy(() => import('./pages/CheckoutSuccess'));
const ShopItemDetail = lazy(() => import('./pages/ShopItemDetail'));
const Shop = lazy(() => import('./pages/Shop'));
const Contest = lazy(() => import('./pages/Contest'));
const CollectionDetail = lazy(() => import('./pages/CollectionDetail'));
const CreateCollection = lazy(() => import('./pages/CreateCollection'));
const Calendar = lazy(() => import('./pages/Calendar'));
const EventCreator = lazy(() => import('./pages/EventCreator'));
const AestheticGallery = lazy(() => import('./pages/AestheticGallery'));
const CreateGallery = lazy(() => import('./pages/CreateGallery'));
const GalleryDetail = lazy(() => import('./pages/GalleryDetail'));
const Parks = lazy(() => import('./pages/Parks'));
const ParkGallery = lazy(() => import('./pages/ParkGallery'));
const Debug = lazy(() => import('./pages/Debug'));
const CardDetailPage = lazy(() => import('./pages/CardDetailPage'));
const CardMarketplace = lazy(() => import('./pages/CardMarketplace'));
const UltraPage = lazy(() => import('./pages/UltraPage'));
const MuseumPage = lazy(() => import('./pages/MuseumPage'));
const MagazineView = lazy(() => import('./pages/MagazineView'));
const CreateMagazineIssue = lazy(() => import('./pages/CreateMagazineIssue'));
const MagazineCuration = lazy(() => import('./pages/MagazineCuration'));
const CommissionsPage = lazy(() => import('./pages/CommissionsPage'));
const CreateMuseumPage = lazy(() => import('./pages/CreateMuseumPage'));
const ProjectPage = lazy(() => import('./pages/ProjectPage'));
const Settings = lazy(() => import('./pages/Settings'));
const Credits = lazy(() => import('./pages/Credits'));
const Notifications = lazy(() => import('./pages/Notifications'));
const AdminCleanup = lazy(() => import('./pages/AdminCleanup'));
const AdminModeration = lazy(() => import('./pages/AdminModeration'));
const CampusHub = lazy(() => import('./pages/CampusHub'));

const MigrateDates = lazy(() => import('./pages/MigrateDates'));
const ShopSetup = lazy(() => import('./pages/ShopSetup'));
const ShopDrafts = lazy(() => import('./pages/ShopDrafts'));
const ColorBackfillPage = lazy(() => import('./pages/ColorBackfillPage'));

const NotFound = lazy(() => import('./pages/NotFound'));

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <AppLoading />;
  }

  return currentUser ? children : <Navigate to="/login" />;
};

// Animated Routes Component
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<MotionWrapper><Login /></MotionWrapper>} />
        <Route path="/signup" element={<MotionWrapper><Signup /></MotionWrapper>} />
        <Route path="/legal" element={<MotionWrapper><Legal /></MotionWrapper>} />
        <Route path="/" element={
          <PrivateRoute>
            <MotionWrapper><Feed /></MotionWrapper>
          </PrivateRoute>
        } />
        <Route path="/search" element={
          <PrivateRoute>
            <MotionWrapper><Search /></MotionWrapper>
          </PrivateRoute>
        } />
        <Route path="/create" element={
          <PrivateRoute>
            <MotionWrapper><CreatePost /></MotionWrapper>
          </PrivateRoute>
        } />
        <Route path="/profile/:id" element={
          <PrivateRoute>
            <MotionWrapper><Profile /></MotionWrapper>
          </PrivateRoute>
        } />
        <Route path="/profile" element={<Navigate to="/profile/me" replace />} />
        <Route path="/edit-profile" element={
          <PrivateRoute>
            <MotionWrapper><EditProfile /></MotionWrapper>
          </PrivateRoute>
        } />
        <Route path="/edit-post/:id" element={
          <PrivateRoute>
            <MotionWrapper><EditPost /></MotionWrapper>
          </PrivateRoute>
        } />
        <Route path="/post/:id" element={
          <PrivateRoute>
            <MotionWrapper><PostDetail /></MotionWrapper>
          </PrivateRoute>
        } />
        <Route path="/success" element={
          <PrivateRoute>
            <MotionWrapper><CheckoutSuccess /></MotionWrapper>
          </PrivateRoute>
        } />
        <Route path="/shop" element={
          <PrivateRoute>
            <MotionWrapper><Shop /></MotionWrapper>
          </PrivateRoute>
        } />
        <Route path="/shop/setup" element={
          <PrivateRoute>
            <MotionWrapper><ShopSetup /></MotionWrapper>
          </PrivateRoute>
        } />
        <Route path="/shop/drafts" element={
          <PrivateRoute>
            <MotionWrapper><ShopDrafts /></MotionWrapper>
          </PrivateRoute>
        } />
        <Route path="/shop/:id" element={
          <PrivateRoute>
            <MotionWrapper><ShopItemDetail /></MotionWrapper>
          </PrivateRoute>
        } />
        <Route path="/contest" element={
          <PrivateRoute>
            <MotionWrapper><Contest /></MotionWrapper>
          </PrivateRoute>
        } />
        <Route path="/collection/:id" element={
          <PrivateRoute>
            <MotionWrapper><CollectionDetail /></MotionWrapper>
          </PrivateRoute>
        } />
        <Route path="/create-collection" element={
          <PrivateRoute>
            <MotionWrapper><CreateCollection /></MotionWrapper>
          </PrivateRoute>
        } />
        <Route path="/calendar" element={
          <PrivateRoute>
            <MotionWrapper><Calendar /></MotionWrapper>
          </PrivateRoute>
        } />
        <Route path="/event/create" element={
          <PrivateRoute>
            <MotionWrapper><EventCreator /></MotionWrapper>
          </PrivateRoute>
        } />
        <Route path="/gallery/:type/:tag" element={<MotionWrapper><AestheticGallery /></MotionWrapper>} />
        <Route path="/tag/:tag" element={<MotionWrapper><AestheticGallery /></MotionWrapper>} />
        <Route path="/gallery/create" element={
          <PrivateRoute>
            <MotionWrapper><CreateGallery /></MotionWrapper>
          </PrivateRoute>
        } />
        <Route path="/gallery/:id" element={<MotionWrapper><GalleryDetail /></MotionWrapper>} />
        <Route path="/parks" element={
          <PrivateRoute>
            <MotionWrapper><Parks /></MotionWrapper>
          </PrivateRoute>
        } />
        <Route path="/park/:parkId" element={
          <PrivateRoute>
            <MotionWrapper><ParkGallery /></MotionWrapper>
          </PrivateRoute>
        } />
        {/* <Route path="/debug" element={<MotionWrapper><Debug /></MotionWrapper>} /> */}
        <Route path="/cards/:cardId" element={<MotionWrapper><CardDetailPage /></MotionWrapper>} />
        <Route path="/marketplace" element={<MotionWrapper><CardMarketplace /></MotionWrapper>} />
        <Route path="/ultra" element={
          <PrivateRoute>
            <MotionWrapper><UltraPage /></MotionWrapper>
          </PrivateRoute>
        } />
        <Route path="/museums/:museumId" element={
          <PrivateRoute>
            <MotionWrapper><MuseumPage /></MotionWrapper>
          </PrivateRoute>
        } />
        <Route path="/magazine/:id" element={
          <PrivateRoute>
            <MotionWrapper><MagazineView /></MotionWrapper>
          </PrivateRoute>
        } />
        <Route path="/magazine/:id/create-issue" element={
          <PrivateRoute>
            <MotionWrapper><CreateMagazineIssue /></MotionWrapper>
          </PrivateRoute>
        } />
        <Route path="/magazine/:magazineId/issue/:issueId/curate" element={
          <PrivateRoute>
            <MotionWrapper><MagazineCuration /></MotionWrapper>
          </PrivateRoute>
        } />
        <Route path="/commissions" element={
          <PrivateRoute>
            <MotionWrapper><CommissionsPage /></MotionWrapper>
          </PrivateRoute>
        } />
        <Route path="/museum/create" element={
          <PrivateRoute>
            <MotionWrapper><CreateMuseumPage /></MotionWrapper>
          </PrivateRoute>
        } />
        <Route path="/project/:studioId/:projectId" element={
          <PrivateRoute>
            <MotionWrapper><ProjectPage /></MotionWrapper>
          </PrivateRoute>
        } />

        <Route path="/settings" element={
          <PrivateRoute>
            <MotionWrapper><Settings /></MotionWrapper>
          </PrivateRoute>
        } />
        <Route path="/credits" element={
          <PrivateRoute>
            <MotionWrapper><Credits /></MotionWrapper>
          </PrivateRoute>
        } />
        <Route path="/notifications" element={
          <PrivateRoute>
            <MotionWrapper><Notifications /></MotionWrapper>
          </PrivateRoute>
        } />
        <Route path="/admin/cleanup" element={<PrivateRoute><MotionWrapper><AdminCleanup /></MotionWrapper></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><MotionWrapper><AdminModeration /></MotionWrapper></PrivateRoute>} />
        <Route path="/admin/color-backfill" element={<PrivateRoute><MotionWrapper><ColorBackfillPage /></MotionWrapper></PrivateRoute>} />
        <Route path="/campus" element={<PrivateRoute><MotionWrapper><CampusHub /></MotionWrapper></PrivateRoute>} />


        <Route path="/migrate-dates" element={<PrivateRoute><MotionWrapper><MigrateDates /></MotionWrapper></PrivateRoute>} />
        <Route path="*" element={<MotionWrapper><NotFound /></MotionWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <GlobalErrorBoundary>
      <AuthProvider>
        <UserCacheProvider>
          <UIProvider>
            <ToastProvider>
              <HelmetProvider>
                <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                  <OrientationGuard>
                    {/* Offline Banner - Global */}
                    <OfflineBanner />

                    <div className="app-container">
                      <Suspense fallback={<AppLoading />}>
                        <AnimatedRoutes />
                      </Suspense>

                      <MobileNavigation />
                    </div>
                  </OrientationGuard>
                </Router>
                <ToastManager />
              </HelmetProvider>
            </ToastProvider>
          </UIProvider>
        </UserCacheProvider>
      </AuthProvider>
    </GlobalErrorBoundary>
  );
}


export default App;
