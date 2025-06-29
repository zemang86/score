import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Trophy, Plus, Edit, Trash2, Award, Star } from 'lucide-react'
import { Button } from '../ui/Button'

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  condition_type: string
  condition_value: number
  created_at: string
}

export function BadgeManagement() {
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchBadges()
  }, [])

  const fetchBadges = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setBadges(data || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching badges:', err)
    } finally {
      setLoading(false)
    }
  }

  const getConditionText = (type: string, value: number) => {
    switch (type) {
      case 'exams_completed':
        return `Complete ${value} exam${value > 1 ? 's' : ''}`
      case 'perfect_score':
        return `Get ${value} perfect score${value > 1 ? 's' : ''}`
      case 'streak_days':
        return `${value} day learning streak`
      case 'xp_earned':
        return `Earn ${value} XP points`
      default:
        return `${type}: ${value}`
    }
  }

  if (loading) {
    return (
      <div className="card-fun p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
          <span className="ml-2 text-neutral-600">Loading badges...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-fun">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">Badge System Management</h1>
            <p className="text-neutral-600">Create and manage achievement badges for students</p>
          </div>
          <Button icon={<Plus className="w-4 h-4" />}>
            Create Badge
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-fun">
          <div className="flex items-center">
            <div className="bg-accent-500 rounded-2xl p-3 mr-4 shadow-warning">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-accent-600">Total Badges</p>
              <p className="text-2xl font-bold text-neutral-800">{badges.length}</p>
            </div>
          </div>
        </div>

        <div className="card-fun">
          <div className="flex items-center">
            <div className="bg-secondary-500 rounded-2xl p-3 mr-4 shadow-success">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-600">Active Badges</p>
              <p className="text-2xl font-bold text-neutral-800">{badges.length}</p>
            </div>
          </div>
        </div>

        <div className="card-fun">
          <div className="flex items-center">
            <div className="bg-primary-500 rounded-2xl p-3 mr-4 shadow-fun">
              <Star className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary-600">Times Earned</p>
              <p className="text-2xl font-bold text-neutral-800">-</p>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="card-fun">
        <div className="p-6 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-800">All Badges</h2>
        </div>

        {error && (
          <div className="p-4 bg-error-50 border-b border-error-200">
            <p className="text-error-600 text-sm">{error}</p>
          </div>
        )}

        <div className="p-6">
          {badges.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-accent-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-accent-600" />
              </div>
              <h3 className="text-lg font-medium text-neutral-800 mb-2">No badges created yet</h3>
              <p className="text-neutral-600 mb-4">
                Create your first achievement badge to motivate students.
              </p>
              <Button icon={<Plus className="w-4 h-4" />}>
                Create First Badge
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {badges.map((badge) => (
                <div key={badge.id} className="border border-neutral-200 rounded-2xl p-6 hover-lift">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-accent-100 rounded-2xl flex items-center justify-center mr-3">
                        <span className="text-2xl">{badge.icon}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-800">{badge.name}</h3>
                        <p className="text-sm text-neutral-500">
                          {getConditionText(badge.condition_type, badge.condition_value)}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" icon={<Edit className="w-4 h-4" />} />
                      <Button variant="ghost" size="sm" className="text-error-600 hover:text-error-700" icon={<Trash2 className="w-4 h-4" />} />
                    </div>
                  </div>
                  
                  <p className="text-neutral-600 text-sm mb-4">{badge.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>Created: {new Date(badge.created_at).toLocaleDateString()}</span>
                    <span className="bg-success-100 text-success-800 px-2 py-1 rounded-full">Active</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}