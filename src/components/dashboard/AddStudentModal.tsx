import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { X, User, School, Calendar, GraduationCap, Sparkles, Star, Zap } from 'lucide-react'

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
    age: ''
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

    // Validate age
    const age = parseInt(formData.age)
    if (isNaN(age) || age < 5 || age > 18) {
      setError('Please enter a valid age between 5 and 18')
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
        setError(`You can only add up to ${maxStudents} ${maxStudents === 1 ? 'child' : 'children'} with your current plan`)
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
            age: age,
            xp: 0
          }
        ])

      if (insertError) {
        throw insertError
      }

      // Reset form and close modal
      setFormData({ name: '', school: '', level: '', age: '' })
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-neutral-200 bg-gradient-to-r from-primary-100 to-secondary-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-primary-500 rounded-full p-3 mr-4 shadow-fun">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-primary-600">Add New Kid</h2>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 transition-colors bg-white rounded-full p-2 shadow-soft"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-error-50 border-2 border-error-200 rounded-xl p-4">
              <p className="text-error-700 font-medium text-center">{error}</p>
            </div>
          )}

          <Input
            type="text"
            placeholder="Kid's full name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            icon={<User className="w-5 h-5" />}
            required
          />

          <Input
            type="text"
            placeholder="School name"
            value={formData.school}
            onChange={(e) => handleInputChange('school', e.target.value)}
            icon={<School className="w-5 h-5" />}
            required
          />

          <div className="relative">
            <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <select
              value={formData.level}
              onChange={(e) => handleInputChange('level', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              required
            >
              <option value="">Select education level</option>
              {levels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <Input
            type="number"
            placeholder="Age (5-18)"
            value={formData.age}
            onChange={(e) => handleInputChange('age', e.target.value)}
            min="5"
            max="18"
            icon={<Calendar className="w-5 h-5" />}
            required
          />

          <div className="bg-gradient-to-r from-primary-100 to-secondary-100 border-2 border-primary-300 rounded-xl p-4">
            <div className="flex items-center mb-2">
              <Sparkles className="w-5 h-5 text-primary-600 mr-2" />
              <p className="text-primary-800 font-medium">Plan Limit Info</p>
            </div>
            <p className="text-primary-700">
              You can add up to <strong>{maxStudents}</strong> {maxStudents === 1 ? 'kid' : 'kids'} with your current plan!
            </p>
          </div>

          <div className="flex space-x-3">
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
              variant="fun"
              className="flex-1"
              disabled={loading || !formData.name || !formData.school || !formData.level || !formData.age}
              loading={loading}
              icon={!loading ? <Zap className="w-5 h-5" /> : undefined}
            >
              {loading ? 'Adding...' : 'Add Kid!'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}