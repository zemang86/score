import React, { useState } from 'react'
import { Student } from '../../lib/supabase'
import { User, School, GraduationCap, Calendar, Star, MoreHorizontal, Zap, Trophy } from 'lucide-react'
import { Button } from '../ui/Button'
import { ExamModal } from './ExamModal'
import { StudentProgressModal } from './StudentProgressModal'
import { calculateAgeInYearsAndMonths } from '../../utils/dateUtils'

interface StudentCardProps {
  student: Student
  onEdit?: (student: Student) => void
  onDelete?: (student: Student) => void
  onExamComplete?: () => void
}

export function StudentCard({ student, onEdit, onDelete, onExamComplete }: StudentCardProps) {
  const [showExamModal, setShowExamModal] = useState(false)
  const [showProgressModal, setShowProgressModal] = useState(false)

  const getAgeDisplay = (dateOfBirth: string) => {
    return calculateAgeInYearsAndMonths(dateOfBirth)
  }

  const getLevelColor = (level: string) => {
    if (level.includes('Darjah')) {
      return 'bg-gradient-to-r from-secondary-400 to-secondary-600 text-white'
    } else if (level.includes('Tingkatan')) {
      return 'bg-gradient-to-r from-primary-400 to-primary-600 text-white'
    }
    return 'bg-gradient-to-r from-neutral-400 to-neutral-600 text-white'
  }

  const getXPDisplay = (xp: number) => {
    if (xp === 0) return { text: 'Just started!', color: 'text-primary-600', emoji: '🌟' }
    if (xp < 100) return { text: `${xp} XP - Beginner`, color: 'text-secondary-600', emoji: '🎮' }
    if (xp < 500) return { text: `${xp} XP - Learning`, color: 'text-accent-600', emoji: '📚' }
    if (xp < 1000) return { text: `${xp} XP - Improving`, color: 'text-warning-600', emoji: '🚀' }
    return { text: `${xp} XP - Expert`, color: 'text-success-600', emoji: '👑' }
  }

  const handleExamComplete = (score: number, totalQuestions: number) => {
    setShowExamModal(false)
    if (onExamComplete) {
      onExamComplete()
    }
  }

  const xpInfo = getXPDisplay(student.xp)

  return (
    <>
      <div className="card-fun hover-lift p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-center">
            <div className="w-12 h-12 sm:w-14 lg:w-16 bg-gradient-to-r from-primary-400 to-secondary-500 rounded-2xl flex items-center justify-center mb-2 sm:mb-0 sm:mr-3 lg:mr-4 shadow-fun">
              <User className="w-6 h-6 sm:w-7 lg:w-8 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-800">{student.name}</h3>
              <p className="text-neutral-600 text-sm sm:text-base lg:text-lg">{getAgeDisplay(student.date_of_birth)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button variant="ghost" size="sm" className="text-neutral-500 hover:bg-neutral-100 p-1 sm:p-2" icon={<MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />} />
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center bg-primary-50 rounded-xl p-2.5 sm:p-3 border border-primary-200">
            <School className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-primary-600" />
            <span className="font-medium text-primary-700 text-sm sm:text-base">{student.school}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-neutral-600">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
              <span className="font-medium text-sm sm:text-base">{student.level}</span>
            </div>
            <span className={`inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium shadow-soft ${getLevelColor(student.level)}`}>
              {student.level}
            </span>
          </div>

          <div className="flex items-center bg-accent-50 rounded-xl p-2.5 sm:p-3 border border-accent-200">
            <div className="bg-accent-400 rounded-full p-1.5 sm:p-2 mr-2 sm:mr-3 shadow-warning">
              <Star className="w-3 h-3 sm:w-4 lg:w-5 text-white" />
            </div>
            <span className={`font-medium text-sm sm:text-base ${xpInfo.color}`}>{xpInfo.emoji} {xpInfo.text}</span>
          </div>

          <div className="flex items-center text-xs sm:text-sm text-neutral-500 bg-neutral-50 rounded-xl p-2 sm:p-2.5 border border-neutral-200">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span>Added {new Date(student.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-neutral-200">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Button 
              variant="fun"
              size="md" 
              className="flex-1 text-sm sm:text-base"
              onClick={() => setShowExamModal(true)}
              icon={<Zap className="w-4 h-4 sm:w-5 sm:h-5" />}
            >
              Start Exam
            </Button>
            <Button 
              variant="outline" 
              size="md" 
              className="flex-1 text-sm sm:text-base"
              onClick={() => setShowProgressModal(true)}
              icon={<Trophy className="w-4 h-4 sm:w-5 sm:h-5" />}
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
    </>
  )
}