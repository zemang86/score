import React, { useState } from 'react'
import { Student } from '../../lib/supabase'
import { User, School, GraduationCap, Calendar, Star, Edit, Zap, Trophy, ArrowUp, MoreHorizontal } from 'lucide-react'
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
      return 'from-green-400 to-emerald-500'
    } else if (level.includes('Tingkatan')) {
      return 'from-blue-400 to-indigo-500'
    }
    return 'from-slate-400 to-slate-500'
  }

  const getXPDisplay = (xp: number) => {
    if (xp === 0) return { text: 'Just started!', color: 'text-slate-600', progress: 0 }
    if (xp < 100) return { text: `${xp} XP`, color: 'text-green-600', progress: xp }
    if (xp < 500) return { text: `${xp} XP`, color: 'text-blue-600', progress: (xp % 100) }
    if (xp < 1000) return { text: `${xp} XP`, color: 'text-purple-600', progress: (xp % 100) }
    return { text: `${xp} XP`, color: 'text-amber-600', progress: (xp % 100) }
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
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 group">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className={`w-14 h-14 bg-gradient-to-br ${getLevelColor(student.level)} rounded-2xl flex items-center justify-center mr-4 shadow-lg`}>
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{student.name}</h3>
              <p className="text-slate-500">{student.level} • {getAgeDisplay(student.date_of_birth)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleEditClick}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* School Info */}
        <div className="flex items-center mb-4 p-3 bg-slate-50 rounded-2xl">
          <School className="w-5 h-5 mr-3 text-slate-500" />
          <span className="text-slate-700 font-medium">{student.school}</span>
        </div>

        {/* XP Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600 font-medium">XP Progress</span>
            <div className="flex items-center">
              <span className={`font-bold ${xpInfo.color}`}>{xpInfo.text}</span>
              <ArrowUp className="w-4 h-4 text-green-500 ml-1" />
            </div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div 
              className={`bg-gradient-to-r ${getLevelColor(student.level)} h-3 rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(xpInfo.progress, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button 
            onClick={() => setShowExamModal(true)}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl py-3"
            icon={<Zap className="w-5 h-5" />}
          >
            Start Exam
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowProgressModal(true)}
            className="flex-1 border-2 border-slate-200 hover:border-slate-300 rounded-2xl py-3"
            icon={<Trophy className="w-5 h-5" />}
          >
            Progress
          </Button>
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