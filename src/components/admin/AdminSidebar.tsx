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
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <Shield className="w-8 h-8 text-red-600 mr-2" />
          <div>
            <h2 className="text-lg font-bold text-gray-900">Admin Panel</h2>
            <p className="text-xs text-gray-500">System Management</p>
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
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
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