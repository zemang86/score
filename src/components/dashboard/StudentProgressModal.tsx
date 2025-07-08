import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Student } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { X, TrendingUp, Trophy, Calendar, BookOpen, Target, Star, Award, BarChart3, ArrowLeft, Eye, CheckCircle, XCircle, Clock, Edit3, ArrowUpDown, BookOpenCheck, Lock, Crown } from 'lucide-react'
import { BadgeEvaluator, type StudentBadge } from '../../utils/badgeEvaluator'
import { useAuth } from '../../contexts/AuthContext'
import { PremiumUpgradeModal } from './PremiumUpgradeModal'

interface StudentProgressModalProps {
  isOpen: boolean
  onClose: () => void
  student: Student
  isPremium?: boolean
}

interface ExamResult {
  id: string
  date: string
  mode: string
  subject: string
  score: number
  total_questions: number
  completed: boolean
  question_ids: string[]
  attempts?: ExamAttempt[]
}

interface ExamAttempt {
  id: string
  question_id: string
  answer_given: string
  is_correct: boolean
  question?: {
    id: string
    question_text: string
    type: 'MCQ' | 'ShortAnswer' | 'Subjective' | 'Matching'
    options: string[]
    correct_answer: string
    level: string
    topic?: string
    explanation?: string
  }
}

interface SubjectStats {
  subject: string
  totalExams: number
  averageScore: number
  bestScore: number
  lastExamDate: string
}

// Using StudentBadge from badgeEvaluator instead of local interface

export function StudentProgressModal({ isOpen, onClose, student, isPremium = false }: StudentProgressModalProps) {
  const { user } = useAuth()
  const [examResults, setExamResults] = useState<ExamResult[]>([])
  const [subjectStats, setSubjectStats] = useState<SubjectStats[]>([])
  const [badges, setBadges] = useState<StudentBadge[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'exams' | 'subjects' | 'badges'>('overview')
  const [reviewingExam, setReviewingExam] = useState<ExamResult | null>(null)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [currentStudent, setCurrentStudent] = useState<Student>(student)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  useEffect(() => {
    if (isOpen && student) {
      setCurrentStudent(student) // Update current student when prop changes
      fetchStudentData()
    }
  }, [isOpen, student])

  const fetchStudentData = async () => {
    setLoading(true)
    
    try {
      // Fetch fresh student data to get updated XP and stats
      const { data: freshStudentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', student.id)
        .single()

      if (studentError) throw studentError

      // Update current student with fresh data
      setCurrentStudent(freshStudentData)

      // Fetch exam results
      const { data: exams, error: examsError } = await supabase
        .from('exams')
        .select('*')
        .eq('student_id', student.id)
        .eq('completed', true)
        .order('created_at', { ascending: false })

      if (examsError) throw examsError

      // Fetch student badges using the badge evaluator
      const badgeResult = await BadgeEvaluator.evaluateAndAwardBadges(student.id)

      setExamResults(exams || [])
      setBadges(badgeResult.allEarnedBadges || [])

      // Calculate subject statistics
      if (exams && exams.length > 0) {
        const subjectMap = new Map<string, ExamResult[]>()
        
        exams.forEach(exam => {
          if (!subjectMap.has(exam.subject)) {
            subjectMap.set(exam.subject, [])
          }
          subjectMap.get(exam.subject)!.push(exam)
        })

        const stats: SubjectStats[] = Array.from(subjectMap.entries()).map(([subject, subjectExams]) => {
          const scores = subjectExams.map(e => e.score).filter(s => s !== null)
          const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
          const bestScore = scores.length > 0 ? Math.max(...scores) : 0
          const lastExam = subjectExams[0] // Already sorted by date desc

          return {
            subject,
            totalExams: subjectExams.length,
            averageScore: Math.round(averageScore),
            bestScore,
            lastExamDate: lastExam.date
          }
        })

        setSubjectStats(stats)
      }
    } catch (error) {
      console.error('Error fetching student data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchExamDetails = async (exam: ExamResult) => {
    setReviewLoading(true)
    
    try {
      // Fetch attempts with question details including explanation field
      const { data: attempts, error: attemptsError } = await supabase
        .from('attempts')
        .select(`
          id,
          question_id,
          answer_given,
          is_correct,
          questions (
            id,
            question_text,
            type,
            options,
            correct_answer,
            level,
            topic,
            explanation
          )
        `)
        .eq('exam_id', exam.id)
        .order('created_at', { ascending: true })

      if (attemptsError) throw attemptsError

      // Transform the data to match our interface
      const transformedAttempts: ExamAttempt[] = (attempts || []).map(attempt => ({
        id: attempt.id,
        question_id: attempt.question_id,
        answer_given: attempt.answer_given,
        is_correct: attempt.is_correct,
        question: attempt.questions ? {
          id: attempt.questions.id,
          question_text: attempt.questions.question_text,
          type: attempt.questions.type,
          options: attempt.questions.options || [],
          correct_answer: attempt.questions.correct_answer,
          level: attempt.questions.level,
          topic: attempt.questions.topic,
          explanation: attempt.questions.explanation
        } : undefined
      }))

      const examWithAttempts = {
        ...exam,
        attempts: transformedAttempts
      }

      setReviewingExam(examWithAttempts)
    } catch (error) {
      console.error('Error fetching exam details:', error)
    } finally {
      setReviewLoading(false)
    }
  }

  const handleReviewExam = (exam: ExamResult) => {
    fetchExamDetails(exam)
  }

  const handleBackToProgress = () => {
    setReviewingExam(null)
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success-600'
    if (score >= 70) return 'text-accent-600'
    if (score >= 50) return 'text-warning-600'
    return 'text-error-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-success-100 border-success-300'
    if (score >= 70) return 'bg-accent-100 border-accent-300'
    if (score >= 50) return 'bg-warning-100 border-warning-300'
    return 'bg-error-100 border-error-300'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getXPLevel = (xp: number) => {
    // Use the enhanced 99-level system
    let currentLevel = 1
    
    // XP requirements array (first 10 levels for quick reference)
    const xpReq = [0, 50, 120, 200, 300, 420, 560, 720, 900, 1100, 1320]
    
    // Find current level (simplified for now)
    for (let i = 0; i < xpReq.length; i++) {
      if (xp >= xpReq[i]) {
        currentLevel = i + 1
      } else {
        break
      }
    }
    
    // For levels beyond 10, use a reasonable progression
    if (xp >= 1320) {
      // Rough calculation for higher levels
      currentLevel = Math.min(99, Math.floor(10 + (xp - 1320) / 200))
    }
    
    const currentLevelXP = currentLevel <= 10 ? (xpReq[currentLevel - 1] || 0) : ((currentLevel - 10) * 200) + 1320
    const nextLevelXP = currentLevel >= 99 ? 0 : (currentLevel <= 9 ? xpReq[currentLevel] : ((currentLevel - 9) * 200) + 1320)
    
    const progress = currentLevel >= 99 ? 100 : xp - currentLevelXP
    const requiredXP = currentLevel >= 99 ? 0 : nextLevelXP - currentLevelXP
    const progressPercentage = currentLevel >= 99 ? 100 : Math.round((progress / requiredXP) * 100)
    
    // Get level theme and name
    let levelTheme = "Rookie Explorer"
    let levelEmoji = "🌱"
    let levelColor = "text-green-600"
    
    if (currentLevel > 85) {
      levelTheme = "Legend"
      levelEmoji = "👑"
      levelColor = "text-amber-600"
    } else if (currentLevel > 65) {
      levelTheme = "Learning Master"
      levelEmoji = "🎓"
      levelColor = "text-indigo-600"
    } else if (currentLevel > 45) {
      levelTheme = "Brilliant Scholar"
      levelEmoji = "📚"
      levelColor = "text-orange-600"
    } else if (currentLevel > 25) {
      levelTheme = "Knowledge Adventurer"
      levelEmoji = "⚔️"
      levelColor = "text-purple-600"
    } else if (currentLevel > 10) {
      levelTheme = "Learning Explorer"
      levelEmoji = "🧭"
      levelColor = "text-blue-600"
    }
    
    const milestones = [10, 20, 30, 40, 50, 60, 70, 80, 90, 99]
    const isMilestone = milestones.includes(currentLevel)
    
    return {
      level: currentLevel,
      progress: progressPercentage,
      nextLevel: requiredXP,
      levelName: `${levelTheme} ${currentLevel}`,
      levelTheme,
      levelColor,
      isMilestone,
      milestoneReward: isMilestone ? `🏆 Level ${currentLevel} Milestone Achieved!` : undefined,
      levelEmoji
    }
  }

  const getBadgeColor = (conditionType: string) => {
    switch (conditionType) {
      case 'first_exam':
        return 'bg-gradient-to-br from-green-400 to-emerald-500 border-green-300'
      case 'perfect_score':
        return 'bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-300'
      case 'score_range':
        return 'bg-gradient-to-br from-purple-400 to-pink-500 border-purple-300'
      case 'exams_completed':
        return 'bg-gradient-to-br from-blue-400 to-cyan-500 border-blue-300'
      case 'streak_days':
        return 'bg-gradient-to-br from-red-400 to-pink-500 border-red-300'
      case 'xp_earned':
        return 'bg-gradient-to-br from-indigo-400 to-purple-500 border-indigo-300'
      case 'subject_mastery':
        return 'bg-gradient-to-br from-amber-400 to-yellow-500 border-amber-300'
      default:
        return 'bg-gradient-to-br from-gray-400 to-gray-500 border-gray-300'
    }
  }

  const renderQuestionReview = (attempt: ExamAttempt, index: number) => {
    if (!attempt.question) return null

    const { question } = attempt
    const isCorrect = attempt.is_correct

    return (
      <div key={attempt.id} className={`p-3 rounded-lg border shadow-sm ${isCorrect ? 'bg-success-50 border-success-300' : 'bg-error-50 border-error-300'}`}>
        {/* Question Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-white mr-2 ${isCorrect ? 'bg-success-500' : 'bg-error-500'}`}>
              {index + 1}
            </div>
            <div>
              <div className="flex items-center mb-0.5">
                {isCorrect ? (
                  <CheckCircle className="w-4 h-4 text-success-600 mr-1" />
                ) : (
                  <XCircle className="w-4 h-4 text-error-600 mr-1" />
                )}
                <span className={`font-semibold text-xs ${isCorrect ? 'text-success-700' : 'text-error-700'}`}>
                  {isCorrect ? 'Correct' : 'Incorrect'}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {question.type} • {question.level}
                {question.topic && ` • ${question.topic}`}
              </div>
            </div>
          </div>
        </div>

        {/* Question Text */}
        <div className="mb-2">
          <h4 className="font-semibold text-gray-800 mb-1 text-xs">Question:</h4>
          <p className="text-gray-700 text-xs leading-relaxed">{question.question_text}</p>
        </div>

        {/* Answer Section */}
        <div className="space-y-1.5">
          {/* Your Answer - Always shown */}
          <div>
            <h5 className="font-medium text-gray-700 mb-1 text-xs">Your Answer:</h5>
            <div className={`p-1.5 rounded-md border text-xs ${isCorrect ? 'bg-success-100 border-success-300 text-success-800' : 'bg-error-100 border-error-300 text-error-800'}`}>
              {attempt.answer_given || 'No answer provided'}
            </div>
          </div>

          {/* Correct Answer - Always shown */}
          <div>
            <h5 className="font-medium text-success-700 mb-1 text-xs">Correct Answer:</h5>
            <div className="p-1.5 rounded-md bg-success-100 border border-success-300 text-success-800 text-xs">
              {question.correct_answer}
            </div>
          </div>

          {/* Explanation - Show if available */}
          {question.explanation && (
            <div>
              <h5 className="font-medium text-blue-700 mb-1 text-xs flex items-center">
                <BookOpenCheck className="w-3.5 h-3.5 mr-1" />
                Explanation:
              </h5>
              <div className="p-1.5 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-xs">
                {question.explanation}
              </div>
            </div>
          )}
        </div>

        {/* Special handling for different question types */}
        {question.type === 'Matching' && (
          <div className="mt-1.5 p-1.5 bg-primary-50 border border-primary-200 rounded-md">
            <div className="flex items-center text-primary-700 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 mr-1" />
              <span>Matching question - answers shown as pairs</span>
            </div>
          </div>
        )}

        {question.type === 'Subjective' && (
          <div className="mt-1.5 p-1.5 bg-accent-50 border border-accent-200 rounded-md">
            <div className="flex items-center text-accent-700 text-xs">
              <Edit3 className="w-3.5 h-3.5 mr-1" />
              <span>Subjective question - graded based on key concepts</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (!isOpen) return null

  const xpInfo = getXPLevel(currentStudent.xp)
  const totalExams = examResults.length
  const averageScore = examResults.length > 0 
    ? Math.round(examResults.reduce((sum, exam) => sum + (exam.score || 0), 0) / examResults.length)
    : 0

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col border border-white/50">
        
                 {/* Clean Professional Header */}
         <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
           <div className="p-4 sm:p-6 bg-slate-50">
             <div className="flex items-center justify-between">
               <div className="flex items-center">
                 {reviewingExam ? (
                   <button
                     onClick={handleBackToProgress}
                     className="bg-slate-500 hover:bg-slate-600 rounded-xl p-3 mr-4 shadow-sm transition-colors text-white"
                   >
                     <ArrowLeft className="w-5 h-5" />
                   </button>
                 ) : (
                   <div className="bg-green-500 rounded-xl p-3 mr-4 shadow-sm">
                     <TrendingUp className="w-6 h-6 text-white" />
                   </div>
                 )}
                 <div>
                   <h2 className="text-xl font-bold text-slate-800">
                     {reviewingExam ? 'Exam Review' : `${currentStudent.name}'s Progress`}
                   </h2>
                   <p className="text-sm text-slate-600">
                     {reviewingExam 
                       ? `${reviewingExam.subject} - ${reviewingExam.mode} Mode - ${formatDate(reviewingExam.date)}`
                       : `${currentStudent.level} • ${currentStudent.school}`
                     }
                   </p>
                 </div>
               </div>
               <button
                 onClick={onClose}
                 className="text-slate-400 hover:text-slate-600 transition-colors rounded-lg p-2 hover:bg-slate-100"
                 title="Close"
               >
                 <X className="w-5 h-5" />
               </button>
             </div>
           </div>
         </div>

                 {/* Clean Tab Navigation (only show when not reviewing an exam) */}
         {!reviewingExam && (
           <div className="border-b border-slate-200 bg-slate-50">
             <div className="flex">
               {[
                 { id: 'overview', label: 'Overview', icon: BarChart3 },
                 { id: 'exams', label: 'Exams', icon: BookOpen },
                 { id: 'subjects', label: 'Subjects', icon: Target },
                 { id: 'badges', label: 'Badges', icon: Trophy }
               ].map((tab) => {
                 const Icon = tab.icon
                 return (
                   <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id as any)}
                     className={`flex-1 px-3 py-3 font-medium transition-all duration-200 text-sm ${
                       activeTab === tab.id
                         ? 'bg-green-500 text-white border-b-2 border-green-600'
                         : 'text-slate-600 hover:bg-slate-100 hover:text-slate-700'
                     }`}
                   >
                     <div className="flex items-center justify-center">
                       <Icon className="w-4 h-4 mr-2" />
                       {tab.label}
                     </div>
                   </button>
                 )
               })}
             </div>
           </div>
         )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-4">
            {loading ? (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-200 border-t-green-500 mx-auto mb-3"></div>
                <p className="text-green-600 font-medium text-sm">Loading progress data...</p>
              </div>
            ) : reviewingExam ? (
              /* Exam Review Content */
              <div className="space-y-3 sm:space-y-4">
                {reviewLoading ? (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-200 border-t-green-500 mx-auto mb-3"></div>
                    <p className="text-green-600 font-medium text-sm">Loading exam details...</p>
                  </div>
                ) : (
                  <>
                    {/* Exam Summary - Compact */}
                    <div className={`rounded-lg p-3 border shadow-md ${getScoreBgColor(reviewingExam.score || 0)}`}>
                      <div className="flex flex-col sm:flex-row items-center justify-between mb-2">
                        <div className="text-center sm:text-left mb-2 sm:mb-0">
                          <h3 className="text-base font-bold text-gray-800 mb-0.5">Exam Summary</h3>
                          <p className="text-xs text-gray-600">
                            {reviewingExam.subject} • {reviewingExam.mode} Mode • {reviewingExam.total_questions} questions
                          </p>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold mb-0.5 ${getScoreColor(reviewingExam.score || 0)}`}>
                            {reviewingExam.score || 0}%
                          </div>
                          <div className="text-xs text-gray-600">
                            {reviewingExam.attempts?.filter(a => a.is_correct).length || 0} / {reviewingExam.total_questions} correct
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center text-xs text-gray-600">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        <span>Completed on {formatDate(reviewingExam.date)}</span>
                      </div>
                    </div>

                    {/* Questions Review - Compact */}
                    <div>
                      <h3 className="text-base font-bold text-gray-800 mb-2">Question by Question Review</h3>
                      {reviewingExam.attempts && reviewingExam.attempts.length > 0 ? (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {reviewingExam.attempts.map((attempt, index) => 
                            renderQuestionReview(attempt, index)
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <div className="bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-3">
                            <BookOpen className="w-5 h-5 text-gray-600" />
                          </div>
                          <p className="text-gray-600 text-sm">No question details available for this exam.</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Progress Tabs Content */
              <>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-3 sm:space-y-4">
                    {/* Enhanced XP and Level Display */}
                    <div className={`bg-gradient-to-r from-accent-100 to-warning-100 border-2 rounded-xl p-4 shadow-lg ${xpInfo.isMilestone ? 'border-yellow-400 animate-pulse-glow' : 'border-accent-300'}`}>
                      {/* Level Header with Theme */}
                      <div className="flex flex-col sm:flex-row items-center justify-between mb-3">
                        <div className="flex items-center mb-2 sm:mb-0">
                          <div className="bg-gradient-to-r from-accent-500 to-warning-500 rounded-xl p-2 mr-3 shadow-md">
                            <span className="text-xl">{xpInfo.levelEmoji}</span>
                          </div>
                          <div>
                            <h3 className={`text-lg font-bold ${xpInfo.levelColor} flex items-center`}>
                              Level {xpInfo.level}
                              {xpInfo.isMilestone && <span className="ml-2 text-yellow-500">🏆</span>}
                            </h3>
                            <p className="text-xs text-accent-600 font-medium">{xpInfo.levelTheme}</p>
                            <p className="text-xs text-warning-600">{currentStudent.xp} XP Total</p>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${xpInfo.levelColor}`}>{xpInfo.level}</div>
                          <div className="text-xs text-accent-600">/ 99 Levels</div>
                        </div>
                      </div>

                      {/* Milestone Reward Banner */}
                      {xpInfo.isMilestone && xpInfo.milestoneReward && (
                        <div className="bg-gradient-to-r from-yellow-200 to-orange-200 border border-yellow-400 rounded-lg p-2 mb-3">
                          <div className="text-center">
                            <p className="text-xs font-bold text-yellow-800 mb-1">🎉 MILESTONE ACHIEVED! 🎉</p>
                            <p className="text-xs text-yellow-700">{xpInfo.milestoneReward}</p>
                          </div>
                        </div>
                      )}

                      {/* Progress Bar */}
                      {xpInfo.nextLevel > 0 ? (
                        <div>
                          <div className="flex justify-between text-xs text-accent-700 mb-2">
                            <span>Progress to Level {xpInfo.level + 1}</span>
                            <span>{xpInfo.progress}% Complete</span>
                          </div>
                          <div className="w-full bg-accent-200 rounded-full h-3 border border-accent-500 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${xpInfo.isMilestone ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-accent-500 to-warning-500'}`}
                              style={{ width: `${xpInfo.progress}%` }}
                            >
                              <div className="h-full bg-white/20 animate-pulse"></div>
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-accent-600 mt-1">
                            <span>Current: {currentStudent.xp} XP</span>
                            <span>Next: {xpInfo.nextLevel + currentStudent.xp} XP</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-2">
                          <div className="text-amber-600 font-bold text-sm mb-1">🏆 MAXIMUM LEVEL REACHED! 🏆</div>
                          <div className="text-xs text-amber-500">Ultimate Legend Status</div>
                        </div>
                      )}

                      {/* Level Stats */}
                      <div className="flex justify-between mt-3 pt-3 border-t border-accent-300">
                        <div className="text-center">
                          <div className="text-xs text-accent-600">Rank</div>
                          <div className="text-sm font-bold text-accent-700">
                            {xpInfo.level >= 80 ? 'Legendary' : 
                             xpInfo.level >= 60 ? 'Master' : 
                             xpInfo.level >= 40 ? 'Expert' : 
                             xpInfo.level >= 20 ? 'Advanced' : 
                             xpInfo.level >= 10 ? 'Skilled' : 'Learning'}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-accent-600">Progress</div>
                          <div className="text-sm font-bold text-accent-700">
                            {Math.round((xpInfo.level / 99) * 100)}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-accent-600">Next Milestone</div>
                          <div className="text-sm font-bold text-accent-700">
                            {[10, 20, 30, 40, 50, 60, 70, 80, 90, 99].find(m => m > xpInfo.level) || 'Complete!'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats - Compact Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                          <div className="bg-blue-500 rounded-lg p-1.5 mr-2 shadow-sm">
                            <BookOpen className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-blue-600">Total Exams</p>
                            <p className="text-lg font-bold text-gray-800">{totalExams}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`border rounded-lg p-3 text-center shadow-sm ${getScoreBgColor(averageScore)}`}>
                        <Target className={`w-4 h-4 mx-auto mb-1 ${getScoreColor(averageScore)}`} />
                        <div className={`text-lg font-bold mb-0.5 ${getScoreColor(averageScore)}`}>{averageScore}%</div>
                        <div className={`text-xs ${getScoreColor(averageScore)}`}>Average Score</div>
                      </div>
                      
                      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                          <div className="bg-green-500 rounded-lg p-1.5 mr-2 shadow-sm">
                            <Trophy className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-green-600">Badges</p>
                            <p className="text-lg font-bold text-gray-800">{badges.length}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity - Compact */}
                    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                      <h3 className="text-base font-bold text-blue-700 mb-2">Recent Activity</h3>
                      {examResults.slice(0, 5).length > 0 ? (
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {examResults.slice(0, 5).map((exam) => (
                            <div
                              key={exam.id}
                              className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-200"
                            >
                              <div>
                                <div className="font-medium text-xs text-blue-700">{exam.subject}</div>
                                <div className="text-xs text-blue-600">{exam.mode} Mode • {formatDate(exam.date)}</div>
                              </div>
                              <div className={`text-sm font-bold ${getScoreColor(exam.score || 0)}`}>
                                {exam.score || 0}%
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-blue-600 text-center py-3 text-xs">No exams completed yet!</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Exams Tab */}
                {activeTab === 'exams' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-blue-700">All Exam Results</h3>
                      {!isPremium && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                          <Lock className="w-3 h-3 mr-1" />
                          Limited View
                        </span>
                      )}
                    </div>
                    {examResults.length > 0 ? isPremium ? (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {examResults.map((exam) => (
                          <div key={exam.id} className={`p-3 rounded-lg border shadow-sm ${getScoreBgColor(exam.score || 0)}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-bold text-sm">{exam.subject}</div>
                                <div className="text-xs opacity-80">
                                  {exam.mode} Mode • {exam.total_questions} questions • {formatDate(exam.date)}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className={`text-lg font-bold ${getScoreColor(exam.score || 0)}`}>
                                  {exam.score || 0}%
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleReviewExam(exam)}
                                  icon={<Eye className="w-3.5 h-3.5" />}
                                  className="text-xs py-1 px-2"
                                >
                                  Review
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {/* Show only the 3 most recent exams for free users */}
                        {examResults.slice(0, 3).map((exam) => (
                          <div key={exam.id} className={`p-3 rounded-lg border shadow-sm ${getScoreBgColor(exam.score || 0)}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-bold text-sm">{exam.subject}</div>
                                <div className="text-xs opacity-80">
                                  {exam.mode} Mode • {exam.total_questions} questions • {formatDate(exam.date)}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className={`text-lg font-bold ${getScoreColor(exam.score || 0)}`}>
                                  {exam.score || 0}%
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {examResults.length > 3 && (
                          <div className="text-center py-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                            <div className="bg-amber-100 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-3">
                              <Lock className="w-5 h-5 text-amber-600" />
                            </div>
                            <p className="text-amber-700 text-sm font-medium mb-1">
                              {examResults.length - 3} more exam results hidden
                            </p>
                            <p className="text-amber-600 text-xs mb-3">
                              Upgrade to Premium to see all exam history and detailed reviews!
                            </p>
                            <Button
                              variant="warning"
                              size="sm"
                              icon={<Crown className="w-4 h-4" />}
                              className="bg-gradient-to-r from-amber-500 to-orange-500"
                              onClick={() => setShowUpgradeModal(true)}
                            >
                              Upgrade to Premium
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-3">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-blue-600 text-sm">No exams completed yet!</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Subjects Tab */}
                {activeTab === 'subjects' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-blue-700">Subject Performance</h3>
                      {!isPremium && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                          <Lock className="w-3 h-3 mr-1" />
                          Premium Feature
                        </span>
                      )}
                    </div>
                    {!isPremium ? (
                      <div className="text-center py-6 bg-amber-50 border-2 border-amber-200 rounded-lg">
                        <div className="bg-amber-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                          <Lock className="w-6 h-6 text-amber-600" />
                        </div>
                        <h4 className="text-lg font-bold text-amber-700 mb-2">Premium Feature</h4>
                        <p className="text-amber-600 text-sm mb-4">
                          Upgrade to Premium to unlock detailed subject performance analytics!
                        </p>
                        <Button
                          variant="warning"
                          size="sm"
                          icon={<Crown className="w-4 h-4" />}
                          className="bg-gradient-to-r from-amber-500 to-orange-500"
                          onClick={() => setShowUpgradeModal(true)}
                        >
                          Upgrade to Premium
                        </Button>
                      </div>
                    ) : subjectStats.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                        {subjectStats.map((stat) => (
                          <div key={stat.subject} className={`p-3 rounded-lg border shadow-sm ${getScoreBgColor(stat.averageScore)}`}>
                            <div className="text-center">
                              <h4 className="font-bold text-sm mb-1">{stat.subject}</h4>
                              <div className={`text-lg font-bold mb-1 ${getScoreColor(stat.averageScore)}`}>
                                {stat.averageScore}%
                              </div>
                              <div className="text-xs opacity-80">
                                <div>Best: {stat.bestScore}%</div>
                                <div>{stat.totalExams} exams completed</div>
                                <div>Last: {formatDate(stat.lastExamDate)}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-3">
                          <Target className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-blue-600 text-sm">No subject data available yet!</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Badges Tab */}
                {activeTab === 'badges' && (
                  <div className="space-y-3">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-blue-700">Achievement Badges</h3>
                        {!isPremium && badges.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                            <Lock className="w-3 h-3 mr-1" />
                            Limited View
                          </span>
                        )}
                      </div>
                      
                      {badges.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                          {/* Show all badges for premium users, but only 3 for free users */}
                          {(isPremium ? badges : badges.slice(0, 3)).map((studentBadge) => (
                            <div 
                              key={studentBadge.id} 
                              className={`${getBadgeColor(studentBadge.badge.condition_type)} border-2 rounded-lg p-2 text-center shadow-sm hover:shadow-md transition-all duration-200 text-white relative group cursor-pointer`}
                              title={`${studentBadge.badge.name}: ${studentBadge.badge.description}`}
                            >
                              <div className="text-lg mb-1">{studentBadge.badge.icon}</div>
                              <h4 className="font-bold text-xs leading-tight mb-1 text-white drop-shadow-sm">
                                {studentBadge.badge.name}
                              </h4>
                              <div className="text-xs opacity-90 text-white">
                                {formatDate(studentBadge.earned_at)}
                              </div>
                              
                              {/* Hover tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-gray-800 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                <div className="font-semibold mb-1">{studentBadge.badge.name}</div>
                                <div className="text-gray-300">{studentBadge.badge.description}</div>
                                <div className="text-gray-400 mt-1">Earned: {formatDate(studentBadge.earned_at)}</div>
                                {/* Arrow */}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                            <Award className="w-6 h-6 text-blue-600" />
                          </div>
                          <p className="text-blue-600 text-sm font-medium">No badges earned yet!</p>
                          <p className="text-blue-500 text-xs mt-1">Complete exams to start earning awesome badges!</p>
                        </div>
                      )}
                      
                      {/* Premium upgrade prompt for free users with more than 3 badges */}
                      {!isPremium && badges.length > 3 && (
                        <div className="text-center py-4 bg-amber-50 border-2 border-amber-200 rounded-lg mt-3">
                          <div className="bg-amber-100 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-3">
                            <Lock className="w-5 h-5 text-amber-600" />
                          </div>
                          <p className="text-amber-700 text-sm font-medium mb-1">
                            {badges.length - 3} more badges hidden
                          </p>
                          <p className="text-amber-600 text-xs mb-3">
                            Upgrade to Premium to see all earned badges and detailed information!
                          </p>
                          <Button
                            variant="warning"
                            size="sm"
                            icon={<Crown className="w-4 h-4" />}
                            className="bg-gradient-to-r from-amber-500 to-orange-500"
                            onClick={() => setShowUpgradeModal(true)}
                          >
                            Upgrade to Premium
                          </Button>
                        </div>
                      )}
                      
                      {/* Badge Categories Legend */}
                      {badges.length > 0 && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                          <h4 className="text-xs font-semibold text-gray-700 mb-2">Badge Categories</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded mr-2"></div>
                              <span className="text-gray-600">First Steps</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-gradient-to-br from-blue-400 to-cyan-500 rounded mr-2"></div>
                              <span className="text-gray-600">Progress</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded mr-2"></div>
                              <span className="text-gray-600">Performance</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded mr-2"></div>
                              <span className="text-gray-600">Perfect Scores</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-3 sm:p-4">
          <Button
            onClick={reviewingExam ? handleBackToProgress : onClose}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white text-sm py-2"
            icon={reviewingExam ? <ArrowLeft className="w-4 h-4" /> : <Star className="w-4 h-4" />}
          >
            {reviewingExam ? 'Back to Progress' : 'Continue Learning Journey!'}
          </Button>
        </div>
      </div>
      
      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  )
}