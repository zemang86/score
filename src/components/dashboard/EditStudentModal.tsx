import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Student } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { X, User, School, Calendar, GraduationCap, Edit, Save, Sparkles } from 'lucide-react'
import { validateDateOfBirth } from '../../utils/dateUtils'

interface EditStudentModalProps {
  isOpen: boolean
  onClose: () => void
  student: Student | null
  onStudentUpdated: () => void
}

export function EditStudentModal({ isOpen, onClose, student, onStudentUpdated }: EditStudentModalProps) {
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

  // Populate form when student changes
  useEffect(() => {
    if (student && isOpen) {
      setFormData({
        name: student.name,
        school: student.school,
        level: student.level,
        dateOfBirth: student.date_of_birth
      })
      setError('')
    }
  }, [student, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!student) return

    setLoading(true)
    setError('')

    // Validate date of birth
    const dateValidation = validateDateOfBirth(formData.dateOfBirth)
    if (!dateValidation.isValid) {
      setError(dateValidation.error || 'Invalid date of birth')
      setLoading(false)
      return
    }

    try {
      // Update student in database
      const { error: updateError } = await supabase
        .from('students')
        .update({
          name: formData.name.trim(),
          school: formData.school.trim(),
          level: formData.level,
          date_of_birth: formData.dateOfBirth,
          updated_at: new Date().toISOString()
        })
        .eq('id', student.id)

      if (updateError) {
        throw updateError
      }

      // Notify parent component and close modal
      onStudentUpdated()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to update student')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('') // Clear error when user starts typing
  }

  const handleClose = () => {
    setError('')
    onClose()
  }

  if (!isOpen || !student) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6 border-b border-neutral-200 bg-gradient-to-r from-secondary-100 to-accent-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-secondary-500 rounded-full p-2 sm:p-3 mr-3 sm:mr-4 shadow-success">
                <Edit className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-secondary-600">Edit Student</h2>
                <p className="text-sm sm:text-base text-accent-600">Update {student.name}'s information</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-neutral-400 hover:text-neutral-600 transition-colors bg-white rounded-full p-1.5 sm:p-2 shadow-soft"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {error && (
            <div className="bg-error-50 border-2 border-error-200 rounded-xl p-3 sm:p-4">
              <p className="text-error-700 font-medium text-center text-sm sm:text-base">{error}</p>
            </div>
          )}

          <div className="bg-secondary-50 border-2 border-secondary-200 rounded-xl p-3 sm:p-4">
            <div className="flex items-center mb-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-600 mr-2" />
              <p className="text-secondary-800 font-medium text-sm sm:text-base">Editable Information</p>
            </div>
            <p className="text-secondary-700 text-xs sm:text-sm">
              You can update the name, school, education level, and date of birth. 
              This is useful as your child progresses to new levels each year or if there were any initial mistakes.
            </p>
          </div>

          <Input
            type="text"
            placeholder="Student's full name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            icon={<User className="w-4 h-4 sm:w-5 sm:h-5" />}
            label="Full Name"
            helper="Update if there was a spelling mistake or name change"
            required
          />

          <Input
            type="text"
            placeholder="School name"
            value={formData.school}
            onChange={(e) => handleInputChange('school', e.target.value)}
            icon={<School className="w-4 h-4 sm:w-5 sm:h-5" />}
            label="School"
            helper="Update if your child changed schools"
            required
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Education Level
            </label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4 sm:w-5 sm:h-5" />
              <select
                value={formData.level}
                onChange={(e) => handleInputChange('level', e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-4 py-2.5 sm:py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 bg-white text-sm sm:text-base"
                required
              >
                <option value="">Select education level</option>
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            <p className="text-sm text-neutral-500 mt-2">Update when your child advances to the next level</p>
          </div>

          <Input
            type="date"
            placeholder="Date of birth"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            icon={<Calendar className="w-4 h-4 sm:w-5 sm:h-5" />}
            label="Date of Birth"
            helper="Correct if there was an error in the original entry"
            required
          />

          <div className="bg-accent-50 border-2 border-accent-200 rounded-xl p-3 sm:p-4">
            <div className="flex items-center mb-2">
              <Edit className="w-4 h-4 sm:w-5 sm:h-5 text-accent-600 mr-2" />
              <p className="text-accent-800 font-medium text-sm sm:text-base">Future Features</p>
            </div>
            <p className="text-accent-700 text-xs sm:text-sm">
              Keep information up-to-date for future features like digital certificates and personalized learning paths!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 text-sm sm:text-base"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="success"
              className="flex-1 text-sm sm:text-base"
              disabled={loading || !formData.name || !formData.school || !formData.level || !formData.dateOfBirth}
              loading={loading}
              icon={!loading ? <Save className="w-4 h-4 sm:w-5 sm:h-5" /> : undefined}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}