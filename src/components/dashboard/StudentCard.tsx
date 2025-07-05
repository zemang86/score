import React, { useState } from 'react'
import { Student } from '../../lib/supabase'
import { User, School, Star, Edit, Zap, Trophy, Sparkles, Heart } from 'lucide-react'
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
    let theme = { name: "Rookie Explorer", emoji: "🌱", color: "text-green-600", gradient: "from-green-400 to-emerald-500" }
    
    if (currentLevel > 85) {
      theme = { name: "Legend", emoji: "👑", color: "text-amber-600", gradient: "from-amber-400 to-yellow-500" }
    } else if (currentLevel > 65) {
      theme = { name: "Learning Master", emoji: "🎓", color: "text-indigo-600", gradient: "from-indigo-400 to-purple-500" }
    } else if (currentLevel > 45) {
      theme = { name: "Brilliant Scholar", emoji: "📚", color: "text-orange-600", gradient: "from-orange-400 to-red-500" }
    } else if (currentLevel > 25) {
      theme = { name: "Knowledge Adventurer", emoji: "⚔️", color: "text-purple-600", gradient: "from-purple-400 to-pink-500" }
    } else if (currentLevel > 10) {
      theme = { name: "Learning Explorer", emoji: "🧭", color: "text-blue-600", gradient: "from-blue-400 to-cyan-500" }
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
      <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-indigo-200 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] hover:border-indigo-300 hover:ring-4 hover:ring-indigo-100 group overflow-hidden">
        {/* Background gradient orb */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
        
        {/* Floating decorative elements */}
        <div className="absolute top-2 right-2 animate-float opacity-30 group-hover:opacity-50 transition-opacity duration-300">
          <Sparkles className="w-4 h-4 text-purple-400" />
        </div>
        <div className="absolute bottom-2 left-2 animate-pulse-soft opacity-30 group-hover:opacity-50 transition-opacity duration-300">
          <Heart className="w-3 h-3 text-pink-400" />
        </div>

        {/* Header with student info and edit button */}
        <div className="flex items-start justify-between mb-4 relative z-10">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mr-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ring-2 ring-indigo-200">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-indigo-700 transition-colors">{student.name}</h3>
              <p className="text-sm text-slate-600 group-hover:text-indigo-600 transition-colors">{getAgeDisplay(student.date_of_birth)}</p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 p-2 rounded-xl hover:scale-110 transition-all duration-300" 
            icon={<Edit className="w-4 h-4" />}
            onClick={() => onOpenEditModal?.(student)}
            title="Edit student information"
          >
          </Button>
        </div>

        {/* Student details in enhanced format */}
        <div className="space-y-4 relative z-10">
          {/* School and Level in one row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-slate-600 text-sm">
              <div className="bg-gradient-to-r from-slate-100 to-blue-100 rounded-xl p-2 mr-3 shadow-sm">
                <School className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="font-medium text-slate-800 text-sm">{student.school}</p>
                <p className="text-xs text-slate-500">School</p>
              </div>
            </div>
            <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-bold ${getLevelColor(student.level)}`}>
              {student.level}
            </span>
          </div>

          {/* Enhanced XP Progress with 99-Level System */}
          <div className={`bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-4 border-2 shadow-sm hover:shadow-md transition-all duration-300 ${xpInfo.isMilestone ? 'border-yellow-400 animate-pulse-glow' : 'border-indigo-200/50'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className={`bg-gradient-to-r ${xpInfo.gradient} rounded-xl p-2 shadow-md relative`}>
                <Star className="w-5 h-5 text-white" />
                {xpInfo.isMilestone && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-xs">🏆</span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className={`font-bold text-2xl ${xpInfo.color} flex items-center justify-end`}>
                  {xpInfo.emoji}
                  {xpInfo.isMilestone && <span className="text-xs ml-1 text-yellow-500">✨</span>}
                </p>
                <p className="text-xs text-gray-500">Level {xpInfo.level}/99</p>
              </div>
            </div>
            
            {/* Level Name and XP */}
            <div className="mb-3">
              <span className={`font-bold text-sm ${xpInfo.color} block`}>
                Level {xpInfo.level} {xpInfo.isMilestone && '🏆'}
              </span>
              <span className="text-xs text-gray-600">{xpInfo.text.split(' - ')[1]}</span>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{xpInfo.totalXP} XP</span>
                <span>{Math.round((xpInfo.level / 99) * 100)}% to Max</span>
              </div>
              <div className="w-full h-2.5 bg-white/70 rounded-full overflow-hidden border border-gray-200">
                <div 
                  className={`h-full bg-gradient-to-r ${xpInfo.gradient} rounded-full transition-all duration-1000 relative`}
                  style={{ width: `${Math.min((xpInfo.level / 99) * 100, 100)}%` }}
                >
                  <div className="h-full bg-white/20 animate-pulse"></div>
                </div>
              </div>
              
              {/* Next Milestone */}
              <div className="text-center">
                <span className="text-xs text-gray-500">
                  Next Milestone: Level {[10, 20, 30, 40, 50, 60, 70, 80, 90, 99].find(m => m > xpInfo.level) || 'Complete!'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons with enhanced styling */}
          <div className="flex space-x-3 pt-2">
            <Button 
              variant="gradient-primary"
              size="sm" 
              className="flex-1 text-sm py-3 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 ring-2 ring-indigo-200 hover:ring-indigo-300"
              onClick={() => onOpenExamModal?.(student)}
              icon={<Zap className="w-4 h-4" />}
            >
              Start Exam
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-sm py-3 border-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-500 hover:scale-105 transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg"
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