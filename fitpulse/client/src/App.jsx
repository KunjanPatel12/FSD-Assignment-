import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Navbar } from './components/layout/Navbar';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { OnboardingPage } from './pages/member/OnboardingPage';
import { MemberProfilePage } from './pages/member/MemberProfilePage';
import { MemberDashboard } from './pages/member/MemberDashboard';
import { WorkoutPlanView } from './pages/member/WorkoutPlanView';
import { ExerciseLibraryPage } from './pages/member/ExerciseLibraryPage';
import { AttendanceHistoryPage } from './pages/member/AttendanceHistoryPage';
import { SupplementGuidePage } from './pages/member/SupplementGuidePage';
import { MembershipPage } from './pages/member/MembershipPage';
import { ConsistencyReportPage } from './pages/member/ConsistencyReportPage';
import { TrainerDashboard } from './pages/trainer/TrainerDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';

export function AppContent() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-800 selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />

      <main className="flex-1 pb-10">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/exercises" element={<ExerciseLibraryPage />} />
          <Route path="/supplements" element={<SupplementGuidePage />} />

          {/* Member Protected Routes */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute allowedRoles={['member']}>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['member']}>
                <MemberProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['member']}>
                <MemberDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts"
            element={
              <ProtectedRoute allowedRoles={['member']}>
                <WorkoutPlanView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute allowedRoles={['member']}>
                <AttendanceHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/membership"
            element={
              <ProtectedRoute allowedRoles={['member']}>
                <MembershipPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consistency"
            element={
              <ProtectedRoute allowedRoles={['member']}>
                <ConsistencyReportPage />
              </ProtectedRoute>
            }
          />

          {/* Trainer Protected Routes */}
          <Route
            path="/trainer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['trainer', 'admin']}>
                <TrainerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback 404 */}
          <Route
            path="*"
            element={
              <div className="max-w-md mx-auto py-24 text-center space-y-4">
                <h2 className="text-3xl font-extrabold text-slate-900">404 - Not Found</h2>
                <p className="text-sm text-slate-500">The requested FitPulse page does not exist.</p>
                <a
                  href="/"
                  className="inline-block px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium text-sm"
                >
                  Return Home
                </a>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}
