import React, { useState } from 'react'
import { Student } from '../../lib/supabase'
import { User, School, GraduationCap, Calendar, Star, Edit, Zap, Trophy, ArrowUp } from 'lucide-react'
import { Button } from '../ui/Button'
import { ExamModal } from './ExamModal'
import { StudentProgressModal } from './StudentProgressModal'
import { EditStudentModal } from './EditStudentModal'
import { calculateAgeInYearsAndMonths } from '../../utils/dateUtils'

interface StudentCardProps {
  student: Student
  onEdit?: (student: Student) => void
  onDelete?: (student: Student) => void
  onExamComplete?: () => void
  onStudentUpdated?: () => void
}

export function StudentCard({ student, onEdit, onDelete, onExamComplete, onStudentUpdated }: StudentCardProps) {
  const [showExamModal, setShowExamModal] = useState(false)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const getAgeDisplay = (dateOfBirth: string) => {
    return calculateAgeInYearsAndMonths(dateOfBirth)
  }

  const getLevelColor = (level: string) => {
    if (level.includes('Darjah')) {
      return 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
    } else if (level.includes('Tingkatan')) {
      return 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white'
    }
    return 'bg-gradient-to-r from-slate-400 to-slate-500 text-white'
  }

  const getXPDisplay = (xp: number) => {
    if (xp === 0) return { text: 'Just started!', color: 'text-slate-600', emoji: '🌟' }
    if (xp < 100) return { text: `${xp} XP - Beginner`, color: 'text-green-600', emoji: '🎮' }
    if (xp < 500) return { text: `${xp} XP - Learning`, color: 'text-blue-600', emoji: '📚' }
    if (xp < 1000) return { text: `${xp} XP - Improving`, color: 'text-purple-600', emoji: '🚀' }
    return { text: `${xp} XP - Expert`, color: 'text-amber-600', emoji: '👑' }
  }

  const handleExamComplete = (score: number, totalQuestions: number) => {
    setShowExamModal(false)
    if (onExamComplete) {
      onExamComplete()
    }
  }

  const handleStudentUpdated = () => {
    setShowEditModal(false)
    if (onStudentUpdated) {
      onStudentUpdated()
    }
  }

  const handleEditClick = () => {
    setShowEditModal(true)
  }

  const xpInfo = getXPDisplay(student.xp)

  return (
    <>
      <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300">
        {/* Header with student info and edit button */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mr-2 shadow-sm">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">{student.name}</h3>
              <p className="text-xs text-slate-500">{getAgeDisplay(student.date_of_birth)}</p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-500 hover:bg-slate-100 hover:text-indigo-600 p-1" 
            icon={<Edit className="w-3.5 h-3.5" />}
            onClick={handleEditClick}
            title="Edit student information"
          />
        </div>

        {/* Student details in compact format */}
        <div className="space-y-2">
          {/* School and Level in one row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-slate-600 text-xs">
              <School className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="font-medium truncate max-w-[120px]">{student.school}</span>
            </div>
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium shadow-sm ${getLevelColor(student.level)}`}>
              {student.level}
            </span>
          </div>

          {/* XP Progress */}
          <div className="flex items-center bg-indigo-50 rounded-md p-1.5 border border-indigo-100">
            <div className="bg-indigo-500 rounded-md p-1 mr-1.5 shadow-sm">
              <Star className="w-3 h-3 text-white" />
            </div>
            <span className={`font-medium text-xs ${xpInfo.color}`}>{xpInfo.emoji} {xpInfo.text}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-1">
            <Button 
              variant="gradient-primary"
              size="sm" 
              className="flex-1 text-xs py-1.5"
              onClick={() => setShowExamModal(true)}
              icon={<Zap className="w-3 h-3" />}
            >
              Start Exam
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-xs py-1.5 border-slate-300"
              onClick={() => setShowProgressModal(true)}
              icon={<Trophy className="w-3 h-3" />}
            >
              Progress
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ExamModal
        isOpen={showExamModal}
        onClose={() => setShowExamModal(false)}
        student={student}
        onExamComplete={handleExamComplete}
      />

      <StudentProgressModal
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        student={student}
      />

      <EditStudentModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        student={student}
        onStudentUpdated={handleStudentUpdated}
      />
    </>
  )
}