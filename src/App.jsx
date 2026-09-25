import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

// Route-level code splitting
const HomePage                 = lazy(() => import('./pages/HomePage'));
const DashboardPage            = lazy(() => import('./pages/DashboardPage'));
const LoginPage                = lazy(() => import('./pages/LoginPage'));
const RegisterPage             = lazy(() => import('./pages/RegisterPage'));
const ProfilePage              = lazy(() => import('./pages/ProfilePage'));
const AnalyticsPage            = lazy(() => import('./pages/AnalyticsPage'));
const AdminPage                = lazy(() => import('./pages/AdminPage'));
const CollectionsPage          = lazy(() => import('./pages/CollectionsPage'));
const PreviewPage              = lazy(() => import('./pages/PreviewPage'));

function PageFallback() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: '3px solid rgba(34,211,238,0.2)',
        borderTopColor: '#22d3ee',
        animation: 'spin 0.8s linear infinite'
      }} />
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="dashboard"    element={<DashboardPage />} />
          <Route path="collections"  element={<CollectionsPage />} />
          <Route path="login"        element={<LoginPage />} />
          <Route path="register"     element={<RegisterPage />} />
          <Route path="settings"     element={<ProfilePage />} />
          <Route path="profile"      element={<Navigate to="/settings" replace />} />
          <Route path="analytics/:id" element={<AnalyticsPage />} />
          <Route path="admin"        element={<AdminPage />} />
          <Route path=":shortCode"   element={<PreviewPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
