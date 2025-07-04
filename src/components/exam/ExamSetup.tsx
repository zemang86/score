import React from 'react'
import { BookOpen, Target, Star, Clock, Lock, Zap, AlertCircle } from 'lucide-react'
import { Button } from '../ui/Button'
import { Student, ExamMode, Subject } from './types'

interface ExamSetupProps {
  student: Student
  selectedSubject: Subject
  selectedMode: ExamMode
  onSubjectChange: (subject: Subject) => void
  onModeChange: (mode: ExamMode) => void
  onStartExam: () => void
  onCancel: () => void
  loading: boolean
  error: string
}

export function ExamSetup({
  student,
  selectedSubject,
  selectedMode,
  onSubjectChange,
  onModeChange,
  onStartExam,
  onCancel,
  loading,
  error
}: ExamSetupProps) {
  const subjects: Subject[] = ['Bahasa Melayu', 'English', 'Mathematics', 'Science', 'History']

  const getSubjectIcon = (subject: Subject) => {
    switch (subject) {
      case 'Mathematics': return '🧮'
      case 'English': return '📚'
      case 'Science': return '🧪'
      case 'Bahasa Melayu': return '🗣️'
      case 'History': return '🏛️'
      default: return '📖'
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 animate-slide-in">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-700 font-medium text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Student Gaming Profile Card */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-3 text-white shadow-lg animate-slide-in">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-1.5 mr-3">
              <Star className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">{student.name}</h3>
              <p className="text-xs opacity-90">{student.level} • {student.school}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs opacity-90">Total XP</div>
            <div className="text-lg font-bold">{student.xp}</div>
          </div>
        </div>
        
        {/* XP Progress Bar */}
        <div>
          <div className="flex justify-between text-xs opacity-90 mb-1">
            <span>Level Progress</span>
            <span>{Math.min(student.xp % 100, 99)}/100 XP</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-1.5">
            <div 
              className="bg-yellow-300 h-1.5 rounded-full transition-all duration-1000 animate-pulse-glow"
              style={{ width: `${Math.min((student.xp % 100), 99)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Success Criteria */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Target className="w-4 h-4 text-white mr-2" />
            <h3 className="text-sm font-bold">Success Targets</h3>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <div className="text-center">
              <div className="font-bold">70%+</div>
              <div className="opacity-75">Good</div>
            </div>
            <div className="text-center">
              <div className="font-bold">90%+</div>
              <div className="opacity-75">Excellent</div>
            </div>
            <div className="text-center">
              <div className="font-bold">100%</div>
              <div className="opacity-75">Perfect</div>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Selection */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2.5 flex items-center">
          <BookOpen className="w-4 h-4 mr-2" />
          Choose Subject Domain
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
          {subjects.map((subject) => (
            <button
              key={subject}
              onClick={() => onSubjectChange(subject)}
              className={`group p-2 sm:p-3 rounded-xl border-2 font-medium transition-all duration-300 text-xs sm:text-sm transform hover:scale-105 hover:shadow-lg min-h-[70px] sm:min-h-[80px] touch-target ${
                selectedSubject === subject
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-700 shadow-lg animate-pulse-glow'
                  : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-400'
              }`}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full mb-1 flex items-center justify-center ${
                  selectedSubject === subject ? 'bg-white/20' : 'bg-blue-100'
                }`}>
                  <span className="text-sm sm:text-base">{getSubjectIcon(subject)}</span>
                </div>
                <span className="text-center leading-tight text-xs sm:text-sm">{subject}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty Selection */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2.5 flex items-center">
          <Target className="w-4 h-4 mr-2" />
          Choose Difficulty Level
        </label>
        <div className="space-y-2.5">
          {/* Easy Mode */}
          <button
            onClick={() => onModeChange('Easy')}
            className={`group w-full p-3 rounded-xl border-2 transition-all duration-300 text-left transform hover:scale-102 hover:shadow-lg min-h-[60px] sm:min-h-[70px] touch-target ${
              selectedMode === 'Easy'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-700 shadow-lg animate-pulse-glow'
                : 'bg-white text-green-600 border-green-300 hover:bg-green-50 hover:border-green-400'
            }`}
          >
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center flex-1">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 sm:mr-3 flex items-center justify-center flex-shrink-0 ${
                  selectedMode === 'Easy' ? 'bg-white/20' : 'bg-green-100'
                }`}>
                  <span className="text-lg sm:text-xl">🛡️</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm sm:text-base">Easy Mode</div>
                  <div className="text-xs sm:text-sm opacity-90 leading-tight">
                    10 questions • 15 minutes
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-1 flex-shrink-0 ml-2">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <div className="text-xs font-bold">+10-50 XP</div>
              </div>
            </div>
          </button>

          {/* Medium Mode - Disabled */}
          <div className="relative">
            <button
              disabled={true}
              className="group w-full p-3 rounded-xl border-2 transition-all duration-300 text-left bg-gray-100 text-gray-500 border-gray-300 opacity-60 min-h-[60px] sm:min-h-[70px]"
            >
              <div className="flex items-center justify-between h-full">
                <div className="flex items-center flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 sm:mr-3 flex items-center justify-center bg-gray-200 flex-shrink-0">
                    <span className="text-lg sm:text-xl opacity-50">⚔️</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm sm:text-base">Medium Mode</div>
                    <div className="text-xs sm:text-sm opacity-90 leading-tight">
                      20 questions • 30 minutes
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center space-y-1 flex-shrink-0 ml-2">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                  <div className="text-xs font-bold">+20-75 XP</div>
                </div>
              </div>
            </button>
            <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 sm:px-3 py-1 rounded-bl-lg rounded-tr-lg animate-pulse">
              Coming Soon
            </div>
          </div>

          {/* Full Mode - Disabled */}
          <div className="relative">
            <button
              disabled={true}
              className="group w-full p-3 rounded-xl border-2 transition-all duration-300 text-left bg-gray-100 text-gray-500 border-gray-300 opacity-60 min-h-[60px] sm:min-h-[70px]"
            >
              <div className="flex items-center justify-between h-full">
                <div className="flex items-center flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 sm:mr-3 flex items-center justify-center bg-gray-200 flex-shrink-0">
                    <span className="text-lg sm:text-xl opacity-50">👑</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm sm:text-base">Full Mode</div>
                    <div className="text-xs sm:text-sm opacity-90 leading-tight">
                      40+ questions • 60 minutes
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center space-y-1 flex-shrink-0 ml-2">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                  <div className="text-xs font-bold">+50-150 XP</div>
                </div>
              </div>
            </button>
            <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 sm:px-3 py-1 rounded-bl-lg rounded-tr-lg animate-pulse">
              Coming Soon
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-3">
        <Button
          variant="outline"
          onClick={onCancel}
          className="w-full sm:flex-1 py-2.5 sm:py-2 text-sm sm:text-base border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 min-h-[44px] touch-target"
          disabled={loading}
        >
          Cancel Mission
        </Button>
        <Button
          onClick={onStartExam}
          className="w-full sm:flex-1 py-2.5 sm:py-2 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white font-bold text-sm sm:text-base transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl animate-pulse-glow min-h-[44px] touch-target"
          disabled={loading}
          loading={loading}
          icon={!loading ? <Zap className="w-4 h-4 sm:w-5 sm:h-5" /> : undefined}
        >
          {loading ? '🚀 Loading...' : '🚀 Start Exam!'}
        </Button>
      </div>
    </div>
  )
}