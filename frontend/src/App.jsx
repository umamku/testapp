import React from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RequireAuth } from './components/RequireAuth';
import { Navbar } from './components/Navbar';
import { AdminSidebar } from './components/AdminSidebar';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Public / Santri
import LandingPage from './pages/LandingPage';
import Programs from './pages/santri/Programs';
import SantriDashboard from './pages/santri/Dashboard';
import RegistrationForm from './pages/santri/RegistrationForm';
import RegistrationDetail from './pages/santri/RegistrationDetail';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminApplications from './pages/admin/Applications';
import AdminApplicationDetail from './pages/admin/ApplicationDetail';
import AdminPlacementTest from './pages/admin/PlacementTest';
import AdminClassManagement from './pages/admin/ClassManagement';
import AdminPrograms from './pages/admin/Programs';
import AdminSantri from './pages/admin/Santri';

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Standalone auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <RequireAuth role="ADMIN">
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="pendaftaran" element={<AdminApplications />} />
          <Route path="pendaftaran/:id" element={<AdminApplicationDetail />} />
          <Route path="placement-test" element={<AdminPlacementTest />} />
          <Route path="kelas" element={<AdminClassManagement />} />
          <Route path="program" element={<AdminPrograms />} />
          <Route path="santri" element={<AdminSantri />} />
        </Route>

        {/* Public + Santri routes */}
        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="program" element={<Programs />} />
          <Route
            path="dashboard"
            element={
              <RequireAuth>
                <SantriDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="daftar"
            element={
              <RequireAuth>
                <RegistrationForm />
              </RequireAuth>
            }
          />
          <Route
            path="pendaftaran/:id"
            element={
              <RequireAuth>
                <RegistrationDetail />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
