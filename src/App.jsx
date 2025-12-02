import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import OrientationGuard from './components/OrientationGuard';
import MobileNavigation from './components/MobileNavigation';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './context/AuthContext';

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
const SearchTest = lazy(() => import('./pages/SearchTest'));
const CheckoutSuccess = lazy(() => import('./pages/CheckoutSuccess'));
const ShopItemDetail = lazy(() => import('./pages/ShopItemDetail'));
const Shop = lazy(() => import('./pages/Shop'));
const Contest = lazy(() => import('./pages/Contest'));
const CollectionDetail = lazy(() => import('./pages/CollectionDetail'));
const CreateCollection = lazy(() => import('./pages/CreateCollection'));
const Calendar = lazy(() => import('./pages/Calendar'));

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
        <Router>
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
                  <Route path="/test-search" element={<SearchTest />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>

              <MobileNavigation />
            </div>
          </OrientationGuard>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
