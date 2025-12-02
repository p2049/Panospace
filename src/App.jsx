import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import OrientationGuard from './components/OrientationGuard';
import MobileNavigation from './components/MobileNavigation';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserCacheProvider } from './context/UserCacheContext';
import { UIProvider } from './context/UIContext';

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
const PanoVerse = lazy(() => import('./pages/PanoVerse'));
const Debug = lazy(() => import('./pages/Debug'));
const CardDetailPage = lazy(() => import('./pages/CardDetailPage'));
const CardMarketplace = lazy(() => import('./pages/CardMarketplace'));
const PhotoDexPage = lazy(() => import('./pages/PhotoDexPage'));
const UltraPage = lazy(() => import('./pages/UltraPage'));
const MuseumPage = lazy(() => import('./pages/MuseumPage'));
const MagazineView = lazy(() => import('./pages/MagazineView'));
const CreateMagazineIssue = lazy(() => import('./pages/CreateMagazineIssue'));
const MagazineCuration = lazy(() => import('./pages/MagazineCuration'));
const CommissionsPage = lazy(() => import('./pages/CommissionsPage'));
const CreateMuseumPage = lazy(() => import('./pages/CreateMuseumPage'));
const Settings = lazy(() => import('./pages/Settings'));
const Notifications = lazy(() => import('./pages/Notifications'));
const AdminCleanup = lazy(() => import('./pages/AdminCleanup'));
const AdminModeration = lazy(() => import('./pages/AdminModeration'));
const CampusHub = lazy(() => import('./pages/CampusHub'));

const MigrateDates = lazy(() => import('./pages/MigrateDates'));
const ShopSetup = lazy(() => import('./pages/ShopSetup'));
const ShopDrafts = lazy(() => import('./pages/ShopDrafts'));

const NotFound = lazy(() => import('./pages/NotFound'));

const Loading = () => (
  <div style={{ height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000', color: '#fff' }}>
    <div className="spinner" style={{ width: '30px', height: '30px', border: '2px solid #333', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return currentUser ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <UserCacheProvider>
          <UIProvider>
            <HelmetProvider>
              <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <OrientationGuard>
                  <div className="app-container">
                    <Suspense fallback={<Loading />}>
                      <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/legal" element={<Legal />} />
                        <Route path="/" element={
                          <PrivateRoute>
                            <Feed />
                          </PrivateRoute>
                        } />
                        <Route path="/search" element={
                          <PrivateRoute>
                            <Search />
                          </PrivateRoute>
                        } />
                        <Route path="/create" element={
                          <PrivateRoute>
                            <CreatePost />
                          </PrivateRoute>
                        } />
                        <Route path="/profile/:id" element={
                          <PrivateRoute>
                            <Profile />
                          </PrivateRoute>
                        } />
                        <Route path="/profile" element={<Navigate to="/profile/me" replace />} />
                        <Route path="/edit-profile" element={
                          <PrivateRoute>
                            <EditProfile />
                          </PrivateRoute>
                        } />
                        <Route path="/edit-post/:id" element={
                          <PrivateRoute>
                            <EditPost />
                          </PrivateRoute>
                        } />
                        <Route path="/post/:id" element={
                          <PrivateRoute>
                            <PostDetail />
                          </PrivateRoute>
                        } />
                        <Route path="/success" element={
                          <PrivateRoute>
                            <CheckoutSuccess />
                          </PrivateRoute>
                        } />
                        <Route path="/shop" element={
                          <PrivateRoute>
                            <Shop />
                          </PrivateRoute>
                        } />
                        <Route path="/shop/setup" element={
                          <PrivateRoute>
                            <ShopSetup />
                          </PrivateRoute>
                        } />
                        <Route path="/shop/drafts" element={
                          <PrivateRoute>
                            <ShopDrafts />
                          </PrivateRoute>
                        } />
                        <Route path="/shop/:id" element={
                          <PrivateRoute>
                            <ShopItemDetail />
                          </PrivateRoute>
                        } />
                        <Route path="/contest" element={
                          <PrivateRoute>
                            <Contest />
                          </PrivateRoute>
                        } />
                        <Route path="/collection/:id" element={
                          <PrivateRoute>
                            <CollectionDetail />
                          </PrivateRoute>
                        } />
                        <Route path="/create-collection" element={
                          <PrivateRoute>
                            <CreateCollection />
                          </PrivateRoute>
                        } />
                        <Route path="/calendar" element={
                          <PrivateRoute>
                            <Calendar />
                          </PrivateRoute>
                        } />
                        <Route path="/event/create" element={
                          <PrivateRoute>
                            <EventCreator />
                          </PrivateRoute>
                        } />
                        <Route path="/gallery/:type/:tag" element={<AestheticGallery />} />
                        <Route path="/gallery/create" element={
                          <PrivateRoute>
                            <CreateGallery />
                          </PrivateRoute>
                        } />
                        <Route path="/gallery/:id" element={<GalleryDetail />} />
                        <Route path="/parks" element={
                          <PrivateRoute>
                            <Parks />
                          </PrivateRoute>
                        } />
                        <Route path="/park/:parkId" element={
                          <PrivateRoute>
                            <ParkGallery />
                          </PrivateRoute>
                        } />
                        <Route path="/debug" element={<Debug />} />
                        <Route path="/cards/:cardId" element={<CardDetailPage />} />
                        <Route path="/marketplace" element={<CardMarketplace />} />
                        <Route path="/photodex" element={<PhotoDexPage />} />
                        <Route path="/ultra" element={
                          <PrivateRoute>
                            <UltraPage />
                          </PrivateRoute>
                        } />
                        <Route path="/museums/:museumId" element={
                          <PrivateRoute>
                            <MuseumPage />
                          </PrivateRoute>
                        } />
                        <Route path="/magazine/:id" element={
                          <PrivateRoute>
                            <MagazineView />
                          </PrivateRoute>
                        } />
                        <Route path="/magazine/:id/create-issue" element={
                          <PrivateRoute>
                            <CreateMagazineIssue />
                          </PrivateRoute>
                        } />
                        <Route path="/magazine/:magazineId/issue/:issueId/curate" element={
                          <PrivateRoute>
                            <MagazineCuration />
                          </PrivateRoute>
                        } />
                        <Route path="/commissions" element={
                          <PrivateRoute>
                            <CommissionsPage />
                          </PrivateRoute>
                        } />
                        <Route path="/museum/create" element={
                          <PrivateRoute>
                            <CreateMuseumPage />
                          </PrivateRoute>
                        } />

                        <Route path="/settings" element={
                          <PrivateRoute>
                            <Settings />
                          </PrivateRoute>
                        } />
                        <Route path="/notifications" element={
                          <PrivateRoute>
                            <Notifications />
                          </PrivateRoute>
                        } />
                        <Route path="/admin/cleanup" element={<PrivateRoute><AdminCleanup /></PrivateRoute>} />
                        <Route path="/admin" element={<PrivateRoute><AdminModeration /></PrivateRoute>} />
                        <Route path="/campus" element={<PrivateRoute><CampusHub /></PrivateRoute>} />


                        <Route path="/migrate-dates" element={<PrivateRoute><MigrateDates /></PrivateRoute>} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>

                    <MobileNavigation />
                  </div>
                </OrientationGuard>
              </Router>
            </HelmetProvider>
          </UIProvider>
        </UserCacheProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
