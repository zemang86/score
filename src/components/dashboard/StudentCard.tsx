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
      return 'bg-gradient-to-r from-roblox-green-400 to-roblox-green-600 text-white border-roblox-green-700'
    } else if (level.includes('Tingkatan')) {
      return 'bg-gradient-to-r from-roblox-blue-400 to-roblox-blue-600 text-white border-roblox-blue-700'
    }
    return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white border-gray-700'
  }

  const getXPDisplay = (xp: number) => {
    if (xp === 0) return { text: 'Just started! 🎯', color: 'text-roblox-blue-600', emoji: '🌟' }
    if (xp < 100) return { text: `${xp} XP - Beginner 🎮`, color: 'text-roblox-green-600', emoji: '🎮' }
    if (xp < 500) return { text: `${xp} XP - Learning 📚`, color: 'text-roblox-yellow-600', emoji: '📚' }
    if (xp < 1000) return { text: `${xp} XP - Improving 🚀`, color: 'text-roblox-orange-600', emoji: '🚀' }
    return { text: `${xp} XP - Expert 👑`, color: 'text-roblox-purple-600', emoji: '👑' }
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
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-roblox border-4 border-roblox-blue-200 p-6 hover:shadow-roblox-hover transition-all duration-300 transform hover:scale-105">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-gradient-to-r from-roblox-blue-400 to-roblox-purple-500 rounded-full flex items-center justify-center mr-4 shadow-roblox border-4 border-white">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold-game text-roblox-blue-600">{student.name}</h3>
              <p className="text-roblox-purple-500 font-game text-lg">{getAgeDisplay(student.age)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-roblox-blue-500 hover:bg-roblox-blue-100">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center font-game text-roblox-blue-600 bg-roblox-blue-50 rounded-2xl p-3 border-2 border-roblox-blue-200">
            <School className="w-5 h-5 mr-3" />
            <span className="font-bold">{student.school}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center font-game text-roblox-purple-600">
              <GraduationCap className="w-5 h-5 mr-3" />
              <span className="font-bold">{student.level}</span>
            </div>
            <span className={`inline-flex items-center px-4 py-2 rounded-2xl text-sm font-bold-game border-2 shadow-roblox ${getLevelColor(student.level)}`}>
              {student.level}
            </span>
          </div>

          <div className="flex items-center font-game bg-roblox-yellow-50 rounded-2xl p-3 border-2 border-roblox-yellow-200">
            <div className="bg-roblox-yellow-400 rounded-full p-2 mr-3 shadow-roblox">
              <Star className="w-5 h-5 text-white" />
            </div>
            <span className={`font-bold ${xpInfo.color}`}>{xpInfo.text}</span>
          </div>

          <div className="flex items-center text-xs text-roblox-blue-500 font-game bg-roblox-blue-50 rounded-xl p-2 border border-roblox-blue-200">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Added {new Date(student.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t-4 border-roblox-blue-200">
          <div className="flex space-x-3">
            <Button 
              variant="primary"
              size="md" 
              className="flex-1 font-bold-game"
              glow={true}
              onClick={() => setShowExamModal(true)}
            >
              <Zap className="w-5 h-5 mr-2" />
              🚀 Start Exam 🚀
            </Button>
            <Button 
              variant="outline" 
              size="md" 
              className="flex-1 font-game border-4 border-roblox-purple-300 text-roblox-purple-600 hover:bg-roblox-purple-50"
              onClick={() => setShowProgressModal(true)}
            >
              <Trophy className="w-5 h-5 mr-2" />
              📊 Progress
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