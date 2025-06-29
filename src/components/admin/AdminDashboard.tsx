import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin access...</p>
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">System Settings</h2>
            <p className="text-gray-600">System settings panel coming soon...</p>
          </div>
        )
      default:
        return <SystemStats />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        <AdminSidebar activeView={activeView} onViewChange={setActiveView} />
        
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}