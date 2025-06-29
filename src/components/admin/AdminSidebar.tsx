import React from 'react'
import { Users, BookOpen, Trophy, BarChart3, Settings, Shield } from 'lucide-react'

type AdminView = 'stats' | 'users' | 'questions' | 'badges' | 'settings'

interface AdminSidebarProps {
  activeView: AdminView
  onViewChange: (view: AdminView) => void
}

export function AdminSidebar({ activeView, onViewChange }: AdminSidebarProps) {
  const menuItems = [
    { id: 'stats' as AdminView, label: 'Dashboard', icon: BarChart3 },
    { id: 'users' as AdminView, label: 'User Management', icon: Users },
    { id: 'questions' as AdminView, label: 'Question Bank', icon: BookOpen },
    { id: 'badges' as AdminView, label: 'Badge System', icon: Trophy },
    { id: 'settings' as AdminView, label: 'Settings', icon: Settings },
  ]

  return (
    <aside className="w-64 glass border-r border-white/20 min-h-screen">
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center">
          <div className="bg-error-600 rounded-2xl p-2 mr-3 shadow-error">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-800">Admin Panel</h2>
            <p className="text-xs text-neutral-500">System Management</p>
          </div>
        </div>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-smooth ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 border border-primary-200 shadow-soft'
                      : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-primary-600' : 'text-neutral-400'}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}