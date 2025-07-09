import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/OptimizedAuthContext'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { X, User, MapPin, Languages, Save } from 'lucide-react'

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

interface FormData {
  full_name: string
  state: string
  language: string
}

const MALAYSIAN_STATES = [
  'Johor',
  'Kedah',
  'Kelantan',
  'Malacca',
  'Negeri Sembilan',
  'Pahang',
  'Penang',
  'Perak',
  'Perlis',
  'Sabah',
  'Sarawak',
  'Selangor',
  'Terengganu',
  'Federal Territory of Kuala Lumpur',
  'Federal Territory of Labuan',
  'Federal Territory of Putrajaya'
]

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ms', name: 'Bahasa Malaysia' }
]

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { user, profile, refreshUserProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    state: '',
    language: 'en'
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        state: (profile as any).state || '',
        language: (profile as any).language || 'en'
      })
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          state: formData.state,
          language: formData.language
        })
        .eq('id', user.id)

      if (error) throw error

      // Refresh the user profile in the auth context
      await refreshUserProfile()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev: FormData) => ({ ...prev, [field]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl p-2.5 mr-3">
              <User className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Edit Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Full Name
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              State
            </label>
            <select
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              required
            >
              <option value="">Select your state</option>
              {MALAYSIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <Languages className="w-4 h-4 inline mr-1" />
              Preferred Language
            </label>
            <select
              value={formData.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              required
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient-primary"
              className="flex-1"
              disabled={loading}
              icon={loading ? undefined : <Save className="w-4 h-4" />}
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}