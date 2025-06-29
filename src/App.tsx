import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Lazy load components for better performance
const LandingPage = React.lazy(() => import('./components/landing/LandingPage').then(module => ({ default: module.LandingPage })))
const AuthPage = React.lazy(() => import('./components/auth/AuthPage').then(module => ({ default: module.AuthPage })))
const AdminLoginPage = React.lazy(() => import('./components/admin/AdminLoginPage').then(module => ({ default: module.AdminLoginPage })))
const ParentDashboard = React.lazy(() => import('./components/dashboard/ParentDashboard').then(module => ({ default: module.ParentDashboard })))
const AdminDashboard = React.lazy(() => import('./components/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })))

// Modern, minimalist loading component
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          {/* Main spinner */}
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto shadow-medium"></div>
        </div>
        
        <div className="glass rounded-2xl p-6 shadow-large max-w-sm mx-auto">
          <h2 className="text-xl font-semibold text-neutral-800 mb-2">
            Loading KitaScore
          </h2>
          <p className="text-neutral-600">
            Preparing your learning experience...
          </p>
          
          {/* Loading dots */}
          <div className="flex justify-center space-x-1 mt-4">
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AppContent() {
  const { user, isAdmin, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route 
          path="/" 
          element={
            user ? (
              // Redirect authenticated users based on their role
              isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />
            ) : (
              <LandingPage />
            )
          } 
        />
        <Route 
          path="/auth" 
          element={
            user ? (
              // Redirect authenticated users based on their role
              isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />
            ) : (
              <AuthPage />
            )
          } 
        />
        <Route 
          path="/admin-login" 
          element={
            user ? (
              // Redirect authenticated users based on their role
              isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />
            ) : (
              <AdminLoginPage />
            )
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            user ? (
              // Only non-admin users can access parent dashboard
              !isAdmin ? <ParentDashboard /> : <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route 
          path="/admin" 
          element={
            user ? (
              // Only admin users can access admin dashboard
              isAdmin ? <AdminDashboard /> : <Navigate to="/dashboard" replace />
            ) : (
              // Redirect unauthenticated users to admin login instead of home
              <Navigate to="/admin-login" replace />
            )
          } 
        />
      </Routes>
    </Suspense>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App