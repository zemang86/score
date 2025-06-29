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
    <header className="bg-white/90 backdrop-blur-sm shadow-roblox border-b-4 border-roblox-blue-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <div className="bg-roblox-blue-500 rounded-full p-3 mr-4 shadow-neon-blue">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold-game text-roblox-blue-600">KitaScore</h1>
              <p className="text-sm font-game text-roblox-purple-600">
                {isAdminPage ? '🛡️ Admin Panel' : '🎮 We Score Together!'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-roblox-blue-50 rounded-2xl px-4 py-2 border-2 border-roblox-blue-200 shadow-roblox">
              <div className="bg-roblox-blue-500 rounded-full p-2">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-game font-bold text-roblox-blue-700">
                  {user?.user_metadata?.full_name || user?.email}
                </span>
                {isAdmin && (
                  <div className="flex items-center mt-1">
                    <Crown className="w-4 h-4 text-roblox-yellow-500 mr-1" />
                    <span className="bg-roblox-red-500 text-white text-xs px-2 py-1 rounded-full font-bold-game shadow-roblox">
                      ADMIN
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <Button
              variant="danger"
              size="md"
              onClick={signOut}
              className="font-game"
            >
              <LogOut className="w-5 h-5 mr-2" />
              🚪 Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}