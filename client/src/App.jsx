import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLogin from './pages/auth/AdminLogin';

// Provider Pages
import ProviderDashboard from './pages/provider/ProviderDashboard';
import ProviderOnboarding from './pages/provider/ProviderOnboarding';
import ProviderStatus from './pages/provider/ProviderStatus';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProvidersList from './pages/admin/AdminProvidersList';
import AdminProviderDetail from './pages/admin/AdminProviderDetail';

// Intelligent Root Redirector
const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/provider/dashboard" replace />;
};

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-brand-500 selection:text-white">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Provider Routes */}
          <Route
            path="/provider/dashboard"
            element={
              <ProtectedRoute allowedRoles={['provider']}>
                <ProviderDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/onboarding"
            element={
              <ProtectedRoute allowedRoles={['provider']}>
                <ProviderOnboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/status"
            element={
              <ProtectedRoute allowedRoles={['provider']}>
                <ProviderStatus />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/providers"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminProvidersList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/providers/:id"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminProviderDetail />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} Trizen Ventures. Service Provider Onboarding Portal.
          </p>
          <div className="flex items-center gap-4">
            <span>MERN Production Architecture</span>
            <span>&bull;</span>
            <span className="text-brand-600 font-semibold">Urban Company / ExtraHand Pattern</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
