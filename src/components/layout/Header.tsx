import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'
import { GraduationCap, LogOut, User, Crown } from 'lucide-react'
import { useLocation } from 'react-router-dom'

export function Header() {
  const { user, isAdmin, signOut } = useAuth()
  const location = useLocation()

  const isAdminPage = location.pathname.startsWith('/admin')

  return (
    <header className="glass border-b border-white/20 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="bg-primary-500 rounded-2xl p-2 mr-3 shadow-fun">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary-700">KitaScore</h1>
              <p className="text-xs text-secondary-600">
                {isAdminPage ? 'Admin Panel' : 'We Score Together'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 glass rounded-xl px-4 py-2 border border-white/30">
              <div className="bg-primary-500 rounded-full p-2">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-medium text-primary-700">
                  {user?.user_metadata?.full_name || user?.email}
                </span>
                {isAdmin && (
                  <div className="flex items-center mt-1">
                    <Crown className="w-3 h-3 text-accent-500 mr-1" />
                    <span className="bg-error-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      ADMIN
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <Button
              variant="error"
              size="md"
              onClick={signOut}
              icon={<LogOut className="w-4 h-4" />}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}