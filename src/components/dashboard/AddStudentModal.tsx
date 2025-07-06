import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { X, User, School, Calendar, GraduationCap, Sparkles, Star, Zap } from 'lucide-react'
import { validateDateOfBirth } from '../../utils/dateUtils'

interface AddStudentModalProps {
  isOpen: boolean
  onClose: () => void
  onStudentAdded: () => void
}

export function AddStudentModal({ isOpen, onClose, onStudentAdded }: AddStudentModalProps) {
  const { user, maxStudents } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    school: '',
    level: '',
    dateOfBirth: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const levels = [
    'Darjah 1', 'Darjah 2', 'Darjah 3', 'Darjah 4', 'Darjah 5', 'Darjah 6',
    'Tingkatan 1', 'Tingkatan 2', 'Tingkatan 3', 'Tingkatan 4', 'Tingkatan 5'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!user) {
      setError('You must be logged in to add a student')
      setLoading(false)
      return
    }

    // Validate date of birth
    const dateValidation = validateDateOfBirth(formData.dateOfBirth)
    if (!dateValidation.isValid) {
      setError(dateValidation.error || 'Invalid date of birth')
      setLoading(false)
      return
    }

    try {
      // Check current student count
      const { data: existingStudents, error: countError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)

      if (countError) {
        throw countError
      }

      if (existingStudents && existingStudents.length >= maxStudents) {
        if (subscriptionPlan === 'premium') {
          setError(`You've reached your limit of ${maxStudents} ${maxStudents === 1 ? 'child' : 'children'}. Additional children cost RM10/month each. Please contact support to add more.`)
        } else {
          setError(`Free plan is limited to 1 child. Upgrade to Premium for more children.`)
        }
        setLoading(false)
        return
      }

      // Insert new student
      const { error: insertError } = await supabase
        .from('students')
        .insert([
          {
            user_id: user.id,
            name: formData.name.trim(),
            school: formData.school.trim(),
            level: formData.level,
            date_of_birth: formData.dateOfBirth,
            xp: 0
          }
        ])

      if (insertError) {
        throw insertError
      }

      // Reset form and close modal
      setFormData({ name: '', school: '', level: '', dateOfBirth: '' })
      onStudentAdded()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to add student')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('') // Clear error when user starts typing
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white/95 backdrop-blur-lg rounded-lg sm:rounded-xl shadow-xl max-w-md w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="p-3 sm:p-4 bg-gradient-to-r from-indigo-100 to-purple-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg p-2 mr-3 shadow-md">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Add New Kid</h2>
              </div>
              <button
                onClick={onClose}
                className="bg-red-500 text-white hover:bg-red-600 transition-colors rounded-lg p-2 shadow-md"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {subscriptionPlan === 'free' ? (
              <p className="text-indigo-700 text-xs">
                Free plan: Limited to <strong>1 kid</strong> and <strong>3 exams/day</strong>. <span className="font-semibold">Upgrade to Premium for more!</span>
              </p>
            ) : (
              <p className="text-indigo-700 text-xs">
                Premium plan: <strong>1 kid</strong> included. Additional kids cost <strong>RM10/month</strong> each.
              </p>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-3 sm:p-4 space-y-4">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                <p className="text-red-700 font-medium text-center text-sm">{error}</p>
              </div>
            )}

            <Input
              type="text"
              placeholder="Kid's full name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              icon={<User className="w-4 h-4" />}
              required
            />

            <Input
              type="text"
              placeholder="School name"
              value={formData.school}
              onChange={(e) => handleInputChange('school', e.target.value)}
              icon={<School className="w-4 h-4" />}
              required
            />

            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                value={formData.level}
                onChange={(e) => handleInputChange('level', e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
                required
              >
                <option value="">Select education level</option>
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <Input
              type="date"
              placeholder="Date of birth"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              icon={<Calendar className="w-4 h-4" />}
              helper="We'll calculate their age automatically"
              required
            />

            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 border border-indigo-300 rounded-lg p-2.5">
              <div className="flex items-center mb-1">
                <Sparkles className="w-4 h-4 text-indigo-600 mr-1.5" />
                <p className="text-indigo-800 font-medium text-xs">Plan Limit Info</p>
              </div>
              <p className="text-indigo-700 text-xs">
                You can add up to <strong>{maxStudents}</strong> {maxStudents === 1 ? 'kid' : 'kids'} with your current plan!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border border-slate-200 hover:border-slate-300 text-sm"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm"
                disabled={loading || !formData.name || !formData.school || !formData.level || !formData.dateOfBirth}
                loading={loading}
                icon={!loading ? <Zap className="w-4 h-4" /> : undefined}
              >
                {loading ? 'Adding...' : 'Add Kid!'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}