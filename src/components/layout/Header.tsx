import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'
import { LogOut, User, Crown, Settings, BarChart3 } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { EdventureLogo } from '../ui/EdventureLogo'

export function Header() {
  const { user, isAdmin, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const isAdminPage = location.pathname.startsWith('/admin')

  const handleLogoClick = () => {
    if (isAdmin) {
      navigate('/admin')
    } else {
      navigate('/dashboard')
    }
  }

  const handleSignOut = async () => {
    console.log('🚪 Signing out user...')
    await signOut()
    navigate('/')
  }

  return (
    <header className="bg-white/90 backdrop-blur-lg border-b border-slate-200/50 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button onClick={handleLogoClick} className="hover:opacity-80 transition-opacity">
            <EdventureLogo size="md" />
          </button>

          <div className="flex items-center space-x-4">
            {/* User Info */}
            <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-slate-200/50 shadow-sm">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full p-2">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-medium text-slate-700 text-sm">
                  {user?.user_metadata?.full_name || user?.email}
                </span>
                {isAdmin && (
                  <div className="flex items-center mt-1">
                    <Crown className="w-3 h-3 text-amber-500 mr-1" />
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      ADMIN
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Buttons */}
            {isAdmin ? (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/admin')}
                  icon={<Settings className="w-4 h-4" />}
                  className="text-slate-600 hover:text-indigo-600"
                >
                  Admin Panel
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                  icon={<BarChart3 className="w-4 h-4" />}
                  className="text-slate-600 hover:text-indigo-600"
                >
                  Dashboard
                </Button>
              </div>
            )}
            
            {/* Sign Out Button */}
            <Button
              variant="error"
              size="md"
              onClick={handleSignOut}
              icon={<LogOut className="w-4 h-4" />}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}