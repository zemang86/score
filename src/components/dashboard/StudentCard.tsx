import React, { useState } from 'react'
import { Student } from '../../lib/supabase'
import { User, School, Star, Edit, Zap, Trophy, Sparkles, Heart } from 'lucide-react'
import { Button } from '../ui/Button'
import { calculateAgeInYearsAndMonths } from '../../utils/dateUtils'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()

  const getAgeDisplay = (dateOfBirth: string) => {
    return calculateAgeInYearsAndMonths(dateOfBirth)
  }

  const getLevelColor = (level: string) => {
    if (level.includes('Darjah')) {
      return 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg'
    } else if (level.includes('Tingkatan')) {
      return 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-lg'
    }
    return 'bg-gradient-to-r from-slate-400 to-slate-500 text-white shadow-lg'
  }

  const getXPDisplay = (xp: number) => {
    // Enhanced 99-level system calculation
    let currentLevel = 1
    const xpReq = [0, 50, 120, 200, 300, 420, 560, 720, 900, 1100, 1320]
    
    // Find current level
    for (let i = 0; i < xpReq.length; i++) {
      if (xp >= xpReq[i]) {
        currentLevel = i + 1
      } else {
        break
      }
    }
    
    // For levels beyond 10
    if (xp >= 1320) {
      currentLevel = Math.min(99, Math.floor(10 + (xp - 1320) / 200))
    }
    
    // Get level theme
    let theme = { name: t('dashboard.student.rookie'), emoji: "🌱", color: "text-green-600", gradient: "from-green-400 to-emerald-500" }
    
    if (currentLevel > 85) {
      theme = { name: t('dashboard.student.legend'), emoji: "👑", color: "text-amber-600", gradient: "from-amber-400 to-yellow-500" }
    } else if (currentLevel > 65) {
      theme = { name: t('dashboard.student.master'), emoji: "🎓", color: "text-indigo-600", gradient: "from-indigo-400 to-purple-500" }
    } else if (currentLevel > 45) {
      theme = { name: t('dashboard.student.scholar'), emoji: "📚", color: "text-orange-600", gradient: "from-orange-400 to-red-500" }
    } else if (currentLevel > 25) {
      theme = { name: t('dashboard.student.adventurer'), emoji: "⚔️", color: "text-purple-600", gradient: "from-purple-400 to-pink-500" }
    } else if (currentLevel > 10) {
      theme = { name: t('dashboard.student.explorer'), emoji: "🧭", color: "text-blue-600", gradient: "from-blue-400 to-cyan-500" }
    }
    
    const milestones = [10, 20, 30, 40, 50, 60, 70, 80, 90, 99]
    const isMilestone = milestones.includes(currentLevel)
    
    return { 
      text: `Level ${currentLevel} - ${theme.name}`, 
      level: currentLevel,
      color: theme.color, 
      emoji: theme.emoji, 
      gradient: theme.gradient,
      isMilestone,
      totalXP: xp
    }
  }

  const xpInfo = getXPDisplay(student.xp)

  return (
    <>
      <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl p-4 border-2 border-indigo-200 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] hover:border-indigo-300 hover:ring-2 hover:ring-indigo-100 group overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-xl opacity-60"></div>

        {/* Compact Header */}
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mr-3 shadow-md">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-800 group-hover:text-indigo-700 transition-colors truncate">{student.name}</h3>
              <p className="text-xs text-slate-600 group-hover:text-indigo-600 transition-colors">{getAgeDisplay(student.date_of_birth)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold ${getLevelColor(student.level)}`}>
              {student.level}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 p-1.5 rounded-lg" 
              icon={<Edit className="w-3.5 h-3.5" />}
              onClick={() => onOpenEditModal?.(student)}
              title="Edit"
            />
          </div>
        </div>

        {/* School Info - Compact */}
        <div className="mb-3 relative z-10">
          <div className="flex items-center text-slate-600">
            <School className="w-3.5 h-3.5 text-slate-500 mr-2" />
            <p className="font-medium text-slate-800 text-sm truncate">{student.school}</p>
          </div>
        </div>

        {/* Compact XP Progress */}
        <div className={`bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-3 border shadow-sm transition-all duration-300 ${xpInfo.isMilestone ? 'border-yellow-400' : 'border-indigo-200/50'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className={`bg-gradient-to-r ${xpInfo.gradient} rounded-lg p-1.5 shadow-sm mr-2 relative`}>
                <Star className="w-4 h-4 text-white" />
                {xpInfo.isMilestone && (
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-xs">🏆</span>
                  </div>
                )}
              </div>
                          <div>
              <span className={`font-bold text-sm ${xpInfo.color}`}>
                {t('dashboard.student.level')} {xpInfo.level} {xpInfo.isMilestone && '🏆'}
              </span>
              <p className="text-xs text-gray-600">{xpInfo.text.split(' - ')[1]}</p>
            </div>
            </div>
            <div className="text-right">
              <p className={`font-bold text-lg ${xpInfo.color}`}>{xpInfo.emoji}</p>
              <p className="text-xs text-gray-500">{xpInfo.level}/99</p>
            </div>
          </div>
          
          {/* Compact Progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>{xpInfo.totalXP} {t('dashboard.student.totalXP')}</span>
              <span>{t('dashboard.student.next')}: Lv{[10, 20, 30, 40, 50, 60, 70, 80, 90, 99].find((m) => m > xpInfo.level) || '99'}</span>
            </div>
            <div className="w-full h-2 bg-white/70 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${xpInfo.gradient} rounded-full transition-all duration-1000`}
                style={{ width: `${Math.min((xpInfo.level / 99) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Compact Action Buttons */}
        <div className="flex space-x-2 mt-3">
          <Button 
            variant="gradient-primary"
            size="sm" 
            className="flex-1 text-sm py-2.5 shadow-md hover:shadow-lg transition-all duration-300"
            onClick={() => onOpenExamModal?.(student)}
            icon={<Zap className="w-4 h-4" />}
          >
            {t('dashboard.buttons.startExam')}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-sm py-2.5 border border-indigo-300 text-indigo-600 hover:bg-indigo-50 transition-all duration-300"
            onClick={() => onOpenProgressModal?.(student)}
            icon={<Trophy className="w-4 h-4" />}
          >
            {t('dashboard.buttons.progress')}
          </Button>
        </div>
      </div>
    </>
  )
}