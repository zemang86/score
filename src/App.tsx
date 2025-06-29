import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Lazy load components for better performance
const LandingPage = React.lazy(() => import('./components/landing/LandingPage').then(module => ({ default: module.LandingPage })))
const AuthPage = React.lazy(() => import('./components/auth/AuthPage').then(module => ({ default: module.AuthPage })))
const AdminLoginPage = React.lazy(() => import('./components/admin/AdminLoginPage').then(module => ({ default: module.AdminLoginPage })))
const ParentDashboard = React.lazy(() => import('./components/dashboard/ParentDashboard').then(module => ({ default: module.ParentDashboard })))
const AdminDashboard = React.lazy(() => import('./components/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })))

// Enhanced loading component with kid-friendly design
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-roblox-blue-100 via-roblox-purple-50 to-roblox-yellow-100 flex items-center justify-center relative overflow-hidden">
      {/* Floating decorative elements */}
      <div className="absolute top-20 right-20 animate-float">
        <div className="w-8 h-8 bg-roblox-yellow-400 rounded-full shadow-neon-yellow"></div>
      </div>
      <div className="absolute bottom-20 left-20 animate-bounce-gentle">
        <div className="w-6 h-6 bg-roblox-purple-400 rounded-full shadow-neon-purple"></div>
      </div>
      <div className="absolute top-1/2 right-10 animate-pulse">
        <div className="w-10 h-10 bg-roblox-green-400 rounded-full shadow-neon-green"></div>
      </div>

      <div className="text-center relative z-10">
        <div className="relative mb-8">
          {/* Main spinner */}
          <div className="animate-spin rounded-full h-24 w-24 border-8 border-roblox-blue-200 border-t-roblox-blue-500 mx-auto shadow-roblox"></div>
          
          {/* Inner spinning element */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse">
            <div className="w-10 h-10 bg-roblox-yellow-400 rounded-full shadow-neon-yellow"></div>
          </div>
        </div>
        
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-roblox-hover border-4 border-roblox-blue-300 max-w-md mx-auto">
          <h2 className="text-3xl font-bold-game text-roblox-blue-600 mb-4 animate-bounce-gentle">
            🎮 Loading KitaScore... 🎮
          </h2>
          <p className="text-roblox-purple-600 font-game text-xl mb-6 animate-pulse">
            Get ready for an awesome learning adventure! 🚀
          </p>
          
          {/* Fun loading dots */}
          <div className="flex justify-center space-x-3">
            <div className="w-4 h-4 bg-roblox-red-400 rounded-full animate-bounce shadow-roblox" style={{ animationDelay: '0ms' }}></div>
            <div className="w-4 h-4 bg-roblox-green-400 rounded-full animate-bounce shadow-roblox" style={{ animationDelay: '150ms' }}></div>
            <div className="w-4 h-4 bg-roblox-yellow-400 rounded-full animate-bounce shadow-roblox" style={{ animationDelay: '300ms' }}></div>
            <div className="w-4 h-4 bg-roblox-purple-400 rounded-full animate-bounce shadow-roblox" style={{ animationDelay: '450ms' }}></div>
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