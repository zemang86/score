import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'
import { LogOut, User, Crown, BarChart3, Home, Globe } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { EdventureLogo } from '../ui/EdventureLogo'
import { useTranslation } from 'react-i18next'

export function Header() {
  const { user, isAdmin, signOut, subscriptionPlan } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

  const isAdminPage = location.pathname.startsWith('/admin')

  const handleLogoClick = () => {
    if (user) {
      if (isAdmin) {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    } else {
      navigate('/')
    }
  }

  const handleDashboardClick = () => {
    navigate('/dashboard')
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language)
  }

  // Get user initials for mobile display
  const getUserInitials = () => {
    const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
  }

  const isPremium = subscriptionPlan === 'premium'
  const currentLanguage = i18n.language || 'en'

  return (
    <header className="bg-white/90 backdrop-blur-lg border-b border-slate-200/50 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <button onClick={handleLogoClick} className="hover:opacity-80 transition-opacity">
            <EdventureLogo size="sm" className="sm:scale-110" />
          </button>

          <div className="flex items-center space-x-2">
            {/* Language Switcher */}
            <div className="flex items-center space-x-1 mr-2">
              <Globe className="w-4 h-4 text-slate-500" />
              <button 
                onClick={() => changeLanguage('en')} 
                className={`px-2 py-1 text-xs font-medium rounded-md ${
                  currentLanguage === 'en' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                EN
              </button>
              <button 
                onClick={() => changeLanguage('ms')} 
                className={`px-2 py-1 text-xs font-medium rounded-md ${
                  currentLanguage === 'ms' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                MS
              </button>
            </div>

            {/* User Info */}
            <div className="hidden sm:flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-slate-200/50 shadow-sm">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg p-1.5">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <span className="font-medium text-slate-700 text-sm flex items-center">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                  {isPremium && <Crown className="w-3.5 h-3.5 text-amber-500 ml-1.5" />}
                </span>
                {isAdmin && (
                  <div className="flex items-center mt-0.5">
                    <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold text-[10px]">
                      ADMIN
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile User Info */}
            <div className="sm:hidden flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg w-7 h-7 relative">
              <span className="text-white text-xs font-bold">{getUserInitials()}</span>
              {isPremium && (
                <Crown className="w-3 h-3 text-amber-400 absolute -top-1 -right-1" />
              )}
            </div>

            {/* Navigation Buttons */}
            {user && !isAdminPage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDashboardClick}
                icon={<BarChart3 className="w-4 h-4" />}
                className="text-slate-600 hover:text-indigo-600 px-2 py-1.5"
              >
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
            )}
            
            {/* Sign Out Button */}
            <Button
              variant="error"
              size="sm"
              onClick={handleSignOut}
              icon={<LogOut className="w-4 h-4" />}
              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1.5"
            >
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}