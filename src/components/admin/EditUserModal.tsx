import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { X, Save, User, Crown, Zap, Users } from 'lucide-react'

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  onUserUpdated: () => void
}

interface UserFormData {
  full_name: string
  email: string
  subscription_plan: 'free' | 'premium'
  max_students: number
  daily_exam_limit: number
}

export function EditUserModal({ isOpen, onClose, userId, onUserUpdated }: EditUserModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    full_name: '',
    email: '',
    subscription_plan: 'free',
    max_students: 0,
    daily_exam_limit: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [currentStudentCount, setCurrentStudentCount] = useState(0)

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserData()
    }
  }, [isOpen, userId])

  const fetchUserData = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Fetch user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError) throw userError

      // Fetch student count
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', userId)

      if (studentsError) throw studentsError

      setCurrentStudentCount(students?.length || 0)
      
      setFormData({
        full_name: userData.full_name || '',
        email: userData.email || '',
        subscription_plan: userData.subscription_plan || 'free',
        max_students: userData.max_students || 0,
        daily_exam_limit: userData.daily_exam_limit || 0,
      })
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user data')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof UserFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-adjust limits based on subscription plan
    if (field === 'subscription_plan') {
      if (value === 'free') {
        setFormData(prev => ({
          ...prev,
          [field]: value,
          max_students: 1,
          daily_exam_limit: 3
        }))
      } else if (value === 'premium') {
        // For premium, keep existing values or set defaults
        setFormData(prev => ({
          ...prev,
          [field]: value,
          max_students: prev.max_students < 1 ? 1 : prev.max_students,
          daily_exam_limit: prev.daily_exam_limit < 1 ? 999 : prev.daily_exam_limit
        }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Validate form data
      if (formData.max_students < 1) {
        throw new Error('Maximum students must be at least 1')
      }

      if (formData.daily_exam_limit < 1) {
        throw new Error('Daily exam limit must be at least 1')
      }

      // Update user in database
      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          subscription_plan: formData.subscription_plan,
          max_students: formData.max_students,
          daily_exam_limit: formData.daily_exam_limit
        })
        .eq('id', userId)

      if (updateError) throw updateError

      setSuccess(true)
      onUserUpdated()
      
      // Close modal after a short delay to show success state
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to update user')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 rounded-lg p-2 mr-3">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Edit User Access</h2>
                <p className="text-sm text-blue-100">Manage subscription and limits</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                <p className="text-red-700 font-medium text-center">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3">
                <p className="text-green-700 font-medium text-center">User updated successfully!</p>
              </div>
            )}

            <Input
              label="Full Name"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              icon={<User className="w-4 h-4" />}
              required
            />

            <Input
              label="Email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              icon={<User className="w-4 h-4" />}
              disabled
              helper="Email cannot be changed"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subscription Plan
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange('subscription_plan', 'free')}
                  className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all ${
                    formData.subscription_plan === 'free'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <User className="w-5 h-5 mr-2" />
                  <span className="font-medium">Free</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('subscription_plan', 'premium')}
                  className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all ${
                    formData.subscription_plan === 'premium'
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <Crown className="w-5 h-5 mr-2" />
                  <span className="font-medium">Premium</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formData.subscription_plan === 'free' 
                  ? 'Free plan: 1 kid, 3 exams/day'
                  : 'Premium plan: 1 kid included + paid additional kids, unlimited exams'}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center mb-2">
                <Users className="w-4 h-4 text-blue-600 mr-2" />
                <h3 className="font-medium text-blue-700">Current Subscription Limits</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-blue-700 mb-1">
                    Max Students
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.max_students}
                    onChange={(e) => handleInputChange('max_students', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-blue-700 mb-1">
                    Daily Exam Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.daily_exam_limit}
                    onChange={(e) => handleInputChange('daily_exam_limit', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                    required
                  />
                </div>
              </div>
              <div className="mt-2 text-xs text-blue-600">
                <div className="flex items-center">
                  <Zap className="w-3 h-3 mr-1" />
                  <span>Current student count: <strong>{currentStudentCount}</strong></span>
                </div>
                {formData.subscription_plan === 'premium' && (
                  <p className="mt-1">
                    Premium: 1 kid included. Each additional kid costs RM10/month.
                  </p>
                )}
                {formData.subscription_plan === 'free' && (
                  <p className="mt-1">
                    Free: Limited to 1 kid. Upgrade to Premium for more.
                  </p>
                )}
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                disabled={loading}
                loading={loading}
                success={success}
                icon={!loading && !success ? <Save className="w-4 h-4" /> : undefined}
              >
                {loading ? 'Saving...' : success ? 'Saved!' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}