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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-xl max-w-md w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="p-3 sm:p-4 bg-gradient-to-r from-green-100 to-teal-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-green-500 rounded-lg p-2 mr-3 shadow-md">
                  <Edit className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-green-700">Edit Student</h2>
                  <p className="text-xs text-green-600">Update {student.name}'s information</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="bg-red-500 text-white hover:bg-red-600 transition-colors rounded-lg p-2 shadow-md"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
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

            <div className="bg-green-50 border border-green-200 rounded-lg p-2.5">
              <div className="flex items-center mb-1">
                <Sparkles className="w-4 h-4 text-green-600 mr-1.5" />
                <p className="text-green-800 font-medium text-xs">Editable Information</p>
              </div>
              <p className="text-green-700 text-xs">
                You can update the name, school, education level, and date of birth. 
                This is useful as your child progresses to new levels each year.
              </p>
            </div>

            <Input
              type="text"
              placeholder="Student's full name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              icon={<User className="w-4 h-4" />}
              label="Full Name"
              helper="Update if there was a spelling mistake or name change"
              required
            />

            <Input
              type="text"
              placeholder="School name"
              value={formData.school}
              onChange={(e) => handleInputChange('school', e.target.value)}
              icon={<School className="w-4 h-4" />}
              label="School"
              helper="Update if your child changed schools"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Education Level
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={formData.level}
                  onChange={(e) => handleInputChange('level', e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-sm"
                  required
                >
                  <option value="">Select education level</option>
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-1">Update when your child advances to the next level</p>
            </div>

            <Input
              type="date"
              placeholder="Date of birth"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              icon={<Calendar className="w-4 h-4" />}
              label="Date of Birth"
              helper="Correct if there was an error in the original entry"
              required
            />

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 text-sm border border-gray-200"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="success"
                className="flex-1 text-sm"
                disabled={loading || !formData.name || !formData.school || !formData.level || !formData.dateOfBirth}
                loading={loading}
                icon={!loading ? <Save className="w-4 h-4" /> : undefined}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}