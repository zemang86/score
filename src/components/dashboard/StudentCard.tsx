import React, { useState } from 'react'
import { Student } from '../../lib/supabase'
import { User, School, GraduationCap, Calendar, Star, Edit, Zap, Trophy, ArrowUp } from 'lucide-react'
import { Button } from '../ui/Button'
import { calculateAgeInYearsAndMonths } from '../../utils/dateUtils'

interface StudentCardProps {
  student: Student
  onEdit?: (student: Student) => void
  onDelete?: (student: Student) => void
  onExamComplete?: () => void
  onStudentUpdated?: () => void
  onOpenExamModal?: (student: Student) => void
  onOpenEditModal?: (student: Student) => void
  onOpenProgressModal?: (student: Student) => void
}

export function StudentCard({ student, onEdit, onDelete, onExamComplete, onStudentUpdated, onOpenExamModal, onOpenEditModal, onOpenProgressModal }: StudentCardProps) {


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





  const xpInfo = getXPDisplay(student.xp)

  return (
    <>
      <div className="bg-white rounded-xl p-4 border-2 border-indigo-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-indigo-400">
        {/* Header with student info and edit button */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mr-3 shadow-md">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">{student.name}</h3>
              <p className="text-xs text-slate-500">{getAgeDisplay(student.date_of_birth)}</p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 p-1.5 rounded-lg" 
            icon={<Edit className="w-4 h-4" />}
            onClick={() => onOpenEditModal?.(student)}
            title="Edit student information"
          >
          </Button>
        </div>

        {/* Student details in compact format */}
        <div className="space-y-3">
          {/* School and Level in one row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-slate-600 text-sm">
              <School className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="font-medium truncate max-w-[140px]">{student.school}</span>
            </div>
            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium shadow-sm ${getLevelColor(student.level)}`}>
              {student.level}
            </span>
          </div>

          {/* XP Progress */}
          <div className="flex items-center bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-2 border border-indigo-200">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg p-1.5 mr-2 shadow-sm">
              <Star className="w-4 h-4 text-white" />
            </div>
            <span className={`font-medium text-sm ${xpInfo.color}`}>{xpInfo.emoji} {xpInfo.text}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-1">
            <Button 
              variant="gradient-primary"
              size="sm" 
              className="flex-1 text-sm py-2 shadow-md hover:shadow-lg"
              onClick={() => onOpenExamModal?.(student)}
              icon={<Zap className="w-4 h-4" />}
            >
              Start Exam
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-sm py-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400"
              onClick={() => onOpenProgressModal?.(student)}
              icon={<Trophy className="w-4 h-4" />}
            >
              Progress
            </Button>
          </div>
        </div>
      </div>


    </>
  )
}