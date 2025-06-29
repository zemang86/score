import React, { useState } from 'react'
import { Student } from '../../lib/supabase'
import { User, School, GraduationCap, Calendar, Star, MoreHorizontal, Zap, Trophy } from 'lucide-react'
import { Button } from '../ui/Button'
import { ExamModal } from './ExamModal'
import { StudentProgressModal } from './StudentProgressModal'

interface StudentCardProps {
  student: Student
  onEdit?: (student: Student) => void
  onDelete?: (student: Student) => void
  onExamComplete?: () => void
}

export function StudentCard({ student, onEdit, onDelete, onExamComplete }: StudentCardProps) {
  const [showExamModal, setShowExamModal] = useState(false)
  const [showProgressModal, setShowProgressModal] = useState(false)

  const getAgeDisplay = (age: number) => {
    return `${age} years old`
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
      <div className="card-fun hover-lift">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-400 to-secondary-500 rounded-2xl flex items-center justify-center mr-4 shadow-fun">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-neutral-800">{student.name}</h3>
              <p className="text-neutral-600 text-lg">{getAgeDisplay(student.age)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-neutral-500 hover:bg-neutral-100" icon={<MoreHorizontal className="w-5 h-5" />} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center bg-primary-50 rounded-xl p-3 border border-primary-200">
            <School className="w-5 h-5 mr-3 text-primary-600" />
            <span className="font-medium text-primary-700">{student.school}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-neutral-600">
              <GraduationCap className="w-5 h-5 mr-3" />
              <span className="font-medium">{student.level}</span>
            </div>
            <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium shadow-soft ${getLevelColor(student.level)}`}>
              {student.level}
            </span>
          </div>

          <div className="flex items-center bg-accent-50 rounded-xl p-3 border border-accent-200">
            <div className="bg-accent-400 rounded-full p-2 mr-3 shadow-warning">
              <Star className="w-5 h-5 text-white" />
            </div>
            <span className={`font-medium ${xpInfo.color}`}>{xpInfo.emoji} {xpInfo.text}</span>
          </div>

          <div className="flex items-center text-xs text-neutral-500 bg-neutral-50 rounded-xl p-2 border border-neutral-200">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Added {new Date(student.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-200">
          <div className="flex space-x-3">
            <Button 
              variant="fun"
              size="md" 
              className="flex-1"
              onClick={() => setShowExamModal(true)}
              icon={<Zap className="w-5 h-5" />}
            >
              Start Exam
            </Button>
            <Button 
              variant="outline" 
              size="md" 
              className="flex-1"
              onClick={() => setShowProgressModal(true)}
              icon={<Trophy className="w-5 h-5" />}
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