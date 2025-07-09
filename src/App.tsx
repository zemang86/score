import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { OptimizedAuthProvider as AuthProvider, useAuth } from './contexts/OptimizedAuthContext'

// Regular imports instead of lazy loading to prevent tab switching issues
import { LandingPage } from './components/landing/LandingPage'
import { AuthPage } from './components/auth/AuthPage'
import { AdminLoginPage } from './components/admin/AdminLoginPage'
import { ParentDashboard } from './components/dashboard/ParentDashboard'
import { AdminDashboard } from './components/admin/AdminDashboard'

// Simplified loading component
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto shadow-lg">
            <div className="absolute inset-2 bg-white rounded-full"></div>
          </div>
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-amber-400 rounded-full animate-bounce"></div>
          <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-pink-400 rounded-full animate-pulse"></div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl max-w-md mx-auto border border-white/30">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Loading Edventure+
          </h2>
          <p className="text-slate-600 text-lg mb-4">
            Setting up your learning adventure...
          </p>
          
          <div className="flex justify-center space-x-2 mt-6">
            <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AppContent() {
  const { user, isAdmin, loading } = useAuth()

  // console.log('🔍 AppContent: Current state:', { 
  //   hasUser: !!user, 
  //   userEmail: user?.email,
  //   isAdmin, 
  //   loading 
  // })

  if (loading) {
    // console.log('⏳ AppContent: Still loading, showing spinner')
    return <LoadingSpinner />
  }

  // console.log('✅ AppContent: Loading complete, rendering routes')

  return (
    <Routes>
        <Route 
          path="/" 
          element={<LandingPage />}
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