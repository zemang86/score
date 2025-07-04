import React, { useState, useEffect } from 'react'
import { Star, Trophy, Target, Award, RefreshCw, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react'
import { Button } from '../ui/Button'
import { ExamQuestion, Student } from './types'

interface ExamResultsProps {
  student: Student
  questions: ExamQuestion[]
  examScore: number
  selectedSubject: string
  selectedMode: string
  onClose: () => void
  onTryAgain?: () => void
}

interface Achievement {
  name: string
  icon: string
  color: string
  description: string
}

export function ExamResults({ 
  student, 
  questions, 
  examScore, 
  selectedSubject, 
  selectedMode, 
  onClose, 
  onTryAgain 
}: ExamResultsProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const [showStars, setShowStars] = useState(false)
  const [showBadges, setShowBadges] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [showQuestionReview, setShowQuestionReview] = useState(false)
  const [earnedBadges, setEarnedBadges] = useState<Achievement[]>([])
  const [xpGained, setXpGained] = useState(0)

  const correctAnswers = questions.filter(q => q.isCorrect).length
  const totalQuestions = questions.length

  // Animation and calculation effects
  useEffect(() => {
    const xp = calculateXPGained(correctAnswers, examScore)
    setXpGained(xp)
    
    const badges = calculateAchievements(examScore, correctAnswers, totalQuestions)
    setEarnedBadges(badges)
    
    // Start animations
    setTimeout(() => animateScore(examScore), 500)
  }, [examScore, correctAnswers, totalQuestions])

  const animateScore = (targetScore: number) => {
    const duration = 2000
    const steps = 60
    const increment = targetScore / steps
    let currentScore = 0
    
    const timer = setInterval(() => {
      currentScore += increment
      if (currentScore >= targetScore) {
        currentScore = targetScore
        clearInterval(timer)
        
        // Trigger subsequent animations
        setTimeout(() => setShowStars(true), 200)
        setTimeout(() => setShowBadges(true), 1000)
        
        if (targetScore >= 80) {
          setTimeout(() => setShowCelebration(true), 1500)
        }
      }
      setAnimatedScore(Math.floor(currentScore))
    }, duration / steps)
  }

  const calculateXPGained = (correctAnswers: number, score: number): number => {
    let xp = correctAnswers * 10
    
    // Bonus XP for performance
    if (score === 100) xp += 100
    else if (score >= 90) xp += 50
    else if (score >= 80) xp += 25
    
    return xp
  }

  const calculateAchievements = (score: number, correctAnswers: number, totalQuestions: number): Achievement[] => {
    const badges: Achievement[] = []
    
    if (score === 100) {
      badges.push({ 
        name: 'Perfect Score', 
        icon: '🎯', 
        color: 'bg-gradient-to-r from-yellow-400 to-orange-400',
        description: 'Flawless performance!'
      })
    }
    
    if (score >= 90) {
      badges.push({ 
        name: 'Top Performer', 
        icon: '🏆', 
        color: 'bg-gradient-to-r from-purple-400 to-pink-400',
        description: 'Outstanding achievement!'
      })
    }
    
    if (correctAnswers >= Math.floor(totalQuestions * 0.8)) {
      badges.push({ 
        name: 'Answer Master', 
        icon: '🧠', 
        color: 'bg-gradient-to-r from-blue-400 to-cyan-400',
        description: 'Excellent knowledge!'
      })
    }
    
    if (score >= 80) {
      badges.push({ 
        name: 'Smart Cookie', 
        icon: '🍪', 
        color: 'bg-gradient-to-r from-green-400 to-emerald-400',
        description: 'Great job!'
      })
    }
    
    if (score >= 70) {
      badges.push({ 
        name: 'Rising Star', 
        icon: '⭐', 
        color: 'bg-gradient-to-r from-indigo-400 to-purple-400',
        description: 'Keep up the good work!'
      })
    }
    
    return badges
  }

  const getStarRating = (score: number): number => {
    if (score === 100) return 5
    if (score >= 90) return 4
    if (score >= 80) return 3
    if (score >= 70) return 2
    if (score >= 60) return 1
    return 0
  }

  const getGamingMessage = (score: number): string => {
    if (score === 100) return '🎊 LEGENDARY PERFORMANCE! 🎊'
    if (score >= 90) return '🏆 EPIC ACHIEVEMENT! 🏆'
    if (score >= 80) return '⚡ AWESOME WORK! ⚡'
    if (score >= 70) return '🎯 GREAT JOB! 🎯'
    if (score >= 60) return '💫 NICE EFFORT! 💫'
    return '🚀 KEEP GOING! 🚀'
  }

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceMessage = (score: number): string => {
    if (score === 100) return 'Perfect! You\'ve mastered this topic!'
    if (score >= 90) return 'Excellent work! You\'re doing great!'
    if (score >= 80) return 'Good job! You\'re on the right track!'
    if (score >= 70) return 'Nice effort! Keep practicing!'
    if (score >= 60) return 'Good start! Review and try again!'
    return 'Don\'t give up! Learning takes time!'
  }

  const stars = getStarRating(examScore)

  return (
    <div className="space-y-6">
      {/* Main Results Card */}
      <div className={`relative rounded-2xl p-8 shadow-lg ${
        examScore >= 80 ? 'bg-gradient-to-br from-green-50 to-emerald-50' :
        examScore >= 60 ? 'bg-gradient-to-br from-blue-50 to-sky-50' :
        'bg-gradient-to-br from-orange-50 to-red-50'
      } ${showCelebration ? 'animate-pulse' : ''}`}>
        
        {/* Gaming Message */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {getGamingMessage(animatedScore)}
          </h2>
          <p className="text-gray-600">{getPerformanceMessage(animatedScore)}</p>
        </div>

        {/* Score Display */}
        <div className="text-center mb-6">
          <div className={`text-6xl font-bold mb-2 ${getScoreColor(animatedScore)}`}>
            {animatedScore}%
          </div>
          <div className="text-lg text-gray-600">
            {correctAnswers} out of {totalQuestions} correct
          </div>
        </div>

        {/* Star Rating */}
        <div className={`flex justify-center mb-6 transition-all duration-1000 ${
          showStars ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        }`}>
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-8 h-8 mx-1 transition-all duration-300 ${
                i < stars 
                  ? 'text-yellow-400 fill-yellow-400' 
                  : 'text-gray-300'
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            />
          ))}
        </div>

        {/* XP Gained */}
        <div className="text-center mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="text-lg font-bold text-gray-800">+{xpGained} XP</span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              New Total: {student.xp + xpGained} XP
            </div>
          </div>
        </div>

        {/* Achievement Badges */}
        <div className={`transition-all duration-1000 ${
          showBadges ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
        }`}>
          {earnedBadges.length > 0 && (
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">🏆 Achievements Unlocked!</h3>
              <div className="grid grid-cols-2 gap-3">
                {earnedBadges.map((badge, index) => (
                  <div
                    key={index}
                    className={`${badge.color} text-white rounded-lg p-3 shadow-md transform hover:scale-105 transition-all duration-200`}
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    <div className="text-2xl mb-1">{badge.icon}</div>
                    <div className="font-bold text-sm">{badge.name}</div>
                    <div className="text-xs opacity-90">{badge.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Question Review Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => setShowQuestionReview(!showQuestionReview)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-800">Question Review</h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {correctAnswers}/{totalQuestions} correct
              </span>
              {showQuestionReview ? 
                <EyeOff className="w-5 h-5 text-gray-400" /> : 
                <Eye className="w-5 h-5 text-gray-400" />
              }
            </div>
          </button>
        </div>

        {showQuestionReview && (
          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {questions.map((question, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  question.isCorrect 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-800">
                    Question {index + 1}
                  </h4>
                  <div className="flex items-center space-x-2">
                    {question.isCorrect ? 
                      <CheckCircle className="w-5 h-5 text-green-600" /> :
                      <XCircle className="w-5 h-5 text-red-600" />
                    }
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                      {question.type}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-3">{question.question_text}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-start space-x-2">
                    <span className="font-medium text-gray-600">Your answer:</span>
                    <span className={question.isCorrect ? 'text-green-700' : 'text-red-700'}>
                      {Array.isArray(question.userAnswer) 
                        ? question.userAnswer.join(', ') 
                        : question.userAnswer || 'No answer'}
                    </span>
                  </div>
                  
                  {!question.isCorrect && (
                    <div className="flex items-start space-x-2">
                      <span className="font-medium text-gray-600">Correct answer:</span>
                      <span className="text-green-700">{question.correct_answer}</span>
                    </div>
                  )}
                  
                  {question.explanation && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-blue-800">
                      <span className="font-medium">Explanation: </span>
                      {question.explanation}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button 
          onClick={onClose} 
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg flex items-center space-x-2"
        >
          <Trophy className="w-5 h-5" />
          <span>Continue Learning</span>
        </Button>
        
        {onTryAgain && (
          <Button 
            onClick={onTryAgain} 
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-3 px-6 rounded-lg flex items-center space-x-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Try Again</span>
          </Button>
        )}
      </div>
    </div>
  )
}