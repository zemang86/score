import React from 'react'
import { Target, CheckCircle } from 'lucide-react'
import { ExamQuestion } from './types'

interface ExamProgressTrackerProps {
  questions: ExamQuestion[]
  currentQuestionIndex: number
  onJumpToQuestion: (questionIndex: number) => void
  isQuestionAnswered: (questionIndex: number) => boolean
}

export function ExamProgressTracker({ 
  questions, 
  currentQuestionIndex, 
  onJumpToQuestion, 
  isQuestionAnswered 
}: ExamProgressTrackerProps) {
  if (questions.length === 0) return null

  return (
    <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
      <div className="flex items-center mb-3">
        <Target className="w-5 h-5 text-blue-600 mr-2" />
        <h4 className="text-sm font-bold text-gray-800">Question Progress</h4>
        <div className="ml-auto text-xs text-gray-600 bg-white px-2 py-1 rounded-full">
          {questions.filter((_, index) => isQuestionAnswered(index)).length}/{questions.length} completed
        </div>
      </div>
      
      {/* Progress Grid with Gaming Animations */}
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 mb-4">
        {questions.map((_, index) => {
          const isAnswered = isQuestionAnswered(index)
          const isCurrent = index === currentQuestionIndex
          
          return (
            <button
              key={index}
              onClick={() => onJumpToQuestion(index)}
              className={`
                relative w-10 h-10 rounded-xl text-xs font-bold transition-all duration-500 
                flex items-center justify-center transform hover:scale-110 active:scale-95
                ${isCurrent 
                  ? 'border-2 border-blue-400 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg animate-pulse-glow ring-4 ring-blue-200' 
                  : isAnswered 
                    ? 'border-2 border-green-400 bg-gradient-to-br from-green-400 to-green-500 text-white shadow-md hover:shadow-lg animate-success-bounce' 
                    : 'border-2 border-yellow-400 bg-gradient-to-br from-yellow-300 to-yellow-400 text-yellow-800 shadow-sm hover:shadow-md animate-gentle-pulse'
                }
              `}
              title={`Question ${index + 1} - ${isAnswered ? 'Answered' : 'Unanswered'}`}
            >
              {/* Gaming-style inner glow */}
              <div className={`absolute inset-0 rounded-xl ${
                isCurrent ? 'bg-gradient-to-br from-blue-300/20 to-blue-600/20 animate-rotate-border' : ''
              }`}></div>
              
              {/* Question number */}
              <span className="relative z-10">{index + 1}</span>
              
              {/* Success sparkle for answered questions */}
              {isAnswered && !isCurrent && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                  <CheckCircle className="w-2 h-2 text-green-500" />
                </div>
              )}
            </button>
          )
        })}
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        ></div>
      </div>
    </div>
  )
}