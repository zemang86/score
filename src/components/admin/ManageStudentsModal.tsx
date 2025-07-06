import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { X, User, School, Calendar, GraduationCap, Plus, Trash2, Save, Users, AlertCircle } from 'lucide-react'

interface ManageStudentsModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  userName: string
  maxStudents: number
  isPremium: boolean
  onStudentsUpdated: () => void
}

interface Student {
  id: string
  name: string
  school: string
  level: string
  date_of_birth: string
  xp: number
}

interface NewStudentData {
  name: string
  school: string
  level: string
  date_of_birth: string
}

export function ManageStudentsModal({ 
  isOpen, 
  onClose, 
  userId, 
  userName, 
  maxStudents,
  isPremium,
  onStudentsUpdated 
}: ManageStudentsModalProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newStudent, setNewStudent] = useState<NewStudentData>({
    name: '',
    school: '',
    level: '',
    date_of_birth: ''
  })
  const [addingStudent, setAddingStudent] = useState(false)
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null)

  const levels = [
    'Darjah 1', 'Darjah 2', 'Darjah 3', 'Darjah 4', 'Darjah 5', 'Darjah 6',
    'Tingkatan 1', 'Tingkatan 2', 'Tingkatan 3', 'Tingkatan 4', 'Tingkatan 5'
  ]

  useEffect(() => {
    if (isOpen && userId) {
      fetchStudents()
    }
  }, [isOpen, userId])

  const fetchStudents = async () => {
    setLoading(true)
    setError('')
    
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      setStudents(data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof NewStudentData, value: string) => {
    setNewStudent(prev => ({ ...prev, [field]: value }))
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddingStudent(true)
    setError('')

    try {
      // Validate form data
      if (!newStudent.name.trim()) throw new Error('Name is required')
      if (!newStudent.school.trim()) throw new Error('School is required')
      if (!newStudent.level) throw new Error('Education level is required')
      if (!newStudent.date_of_birth) throw new Error('Date of birth is required')

      // Check if user can add more students
      if (!isPremium && students.length >= maxStudents) {
        throw new Error(`This user can only have ${maxStudents} student(s) with their current plan`)
      }

      // Insert new student
      const { error: insertError } = await supabase
        .from('students')
        .insert([
          {
            user_id: userId,
            name: newStudent.name.trim(),
            school: newStudent.school.trim(),
            level: newStudent.level,
            date_of_birth: newStudent.date_of_birth,
            xp: 0
          }
        ])

      if (insertError) throw insertError

      // Reset form and refresh students
      setNewStudent({
        name: '',
        school: '',
        level: '',
        date_of_birth: ''
      })
      setShowAddForm(false)
      fetchStudents()
      onStudentsUpdated()
    } catch (err: any) {
      setError(err.message || 'Failed to add student')
    } finally {
      setAddingStudent(false)
    }
  }

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      return
    }

    setDeletingStudentId(studentId)
    setError('')

    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId)

      if (error) throw error

      // Refresh students list
      fetchStudents()
      onStudentsUpdated()
    } catch (err: any) {
      setError(err.message || 'Failed to delete student')
    } finally {
      setDeletingStudentId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 rounded-lg p-2 mr-3">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Manage Students</h2>
                <p className="text-sm text-indigo-100">
                  {userName} • {students.length} student{students.length !== 1 ? 's' : ''}
                  {isPremium ? ' • Premium Plan' : ' • Free Plan'}
                </p>
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
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Plan Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center mb-2">
              <User className="w-4 h-4 text-blue-600 mr-2" />
              <h3 className="font-medium text-blue-700">Account Limits</h3>
            </div>
            <p className="text-sm text-blue-600 mb-2">
              {isPremium 
                ? `This user has a Premium plan with ${maxStudents} student(s) included. Additional students cost RM10/month each.`
                : `This user has a Free plan limited to ${maxStudents} student(s). Upgrade to Premium for more.`}
            </p>
            <div className="flex items-center text-xs text-blue-700">
              <div className="bg-blue-100 rounded-full px-2 py-1">
                Current: {students.length} / {isPremium ? `${maxStudents}+` : maxStudents} students
              </div>
            </div>
          </div>

          {/* Student List */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800">Student Profiles</h3>
              <Button
                onClick={() => setShowAddForm(true)}
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                disabled={showAddForm}
              >
                Add Student
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-2"></div>
                <p className="text-indigo-600">Loading students...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-gray-500" />
                </div>
                <h4 className="text-lg font-medium text-gray-700 mb-2">No Students Found</h4>
                <p className="text-gray-500 mb-4">This user hasn't added any students yet.</p>
                <Button
                  onClick={() => setShowAddForm(true)}
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add First Student
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {students.map((student) => (
                  <div key={student.id} className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-indigo-100 rounded-lg p-2 mr-3">
                          <User className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">{student.name}</h4>
                          <div className="text-xs text-gray-500">
                            {student.level} • {student.school}
                          </div>
                          <div className="text-xs text-gray-500">
                            DOB: {formatDate(student.date_of_birth)} • XP: {student.xp}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDeleteStudent(student.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        icon={deletingStudentId === student.id ? 
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div> : 
                          <Trash2 className="w-4 h-4" />
                        }
                        disabled={deletingStudentId === student.id}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Student Form */}
          {showAddForm && (
            <div className="bg-indigo-50 rounded-lg border-2 border-indigo-200 p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-indigo-700">Add New Student</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-indigo-600 hover:bg-indigo-100 rounded-full p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddStudent} className="space-y-3">
                <Input
                  type="text"
                  placeholder="Student's full name"
                  value={newStudent.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  icon={<User className="w-4 h-4" />}
                  required
                />

                <Input
                  type="text"
                  placeholder="School name"
                  value={newStudent.school}
                  onChange={(e) => handleInputChange('school', e.target.value)}
                  icon={<School className="w-4 h-4" />}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Education Level
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      value={newStudent.level}
                      onChange={(e) => handleInputChange('level', e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
                      required
                    >
                      <option value="">Select education level</option>
                      {levels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Input
                  type="date"
                  placeholder="Date of birth"
                  value={newStudent.date_of_birth}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  icon={<Calendar className="w-4 h-4" />}
                  required
                />

                <div className="flex space-x-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1"
                    disabled={addingStudent}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                    disabled={addingStudent}
                    loading={addingStudent}
                    icon={!addingStudent ? <Save className="w-4 h-4" /> : undefined}
                  >
                    {addingStudent ? 'Adding...' : 'Add Student'}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <Button
            onClick={onClose}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}