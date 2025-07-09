import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/OptimizedAuthContext'
import { Navigate } from 'react-router-dom'
import { AdminSidebar } from './AdminSidebar'
import { UserManagement } from './UserManagement'
import { QuestionManagement } from './QuestionManagement'
import { SystemStats } from './SystemStats'
import { BadgeManagement } from './BadgeManagement'
import { Header } from '../layout/Header'

type AdminView = 'stats' | 'users' | 'questions' | 'badges' | 'settings'

export function AdminDashboard() {
  const { isAdmin, loading } = useAuth()
  const [activeView, setActiveView] = useState<AdminView>('stats')

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-4 border-primary-200 border-t-primary-600 mx-auto mb-3 sm:mb-4"></div>
          <p className="text-neutral-600 text-sm sm:text-base">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  // Redirect non-admin users
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  const renderContent = () => {
    switch (activeView) {
      case 'stats':
        return <SystemStats />
      case 'users':
        return <UserManagement />
      case 'questions':
        return <QuestionManagement />
      case 'badges':
        return <BadgeManagement />
      case 'settings':
        return (
          <div className="card-fun p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-800 mb-3 sm:mb-4">System Settings</h2>
            <p className="text-neutral-600 text-sm sm:text-base">System settings panel coming soon...</p>
          </div>
        )
      default:
        return <SystemStats />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50">
      <Header />
      
      <div className="flex">
        <AdminSidebar activeView={activeView} onViewChange={setActiveView} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}