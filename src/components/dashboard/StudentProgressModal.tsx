import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Student } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { X, TrendingUp, Trophy, Calendar, BookOpen, Target, Star, Award, BarChart3, ArrowLeft, Eye, CheckCircle, XCircle, Clock, Edit3, ArrowUpDown } from 'lucide-react'

interface StudentProgressModalProps {
  isOpen: boolean
  onClose: () => void
  student: Student
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
  }
}

interface SubjectStats {
  subject: string
  totalExams: number
  averageScore: number
  bestScore: number
  lastExamDate: string
}

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earned_at: string
}

export function StudentProgressModal({ isOpen, onClose, student }: StudentProgressModalProps) {
  const [examResults, setExamResults] = useState<ExamResult[]>([])
  const [subjectStats, setSubjectStats] = useState<SubjectStats[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'exams' | 'subjects' | 'badges'>('overview')
  const [reviewingExam, setReviewingExam] = useState<ExamResult | null>(null)
  const [reviewLoading, setReviewLoading] = useState(false)

  useEffect(() => {
    if (isOpen && student) {
      fetchStudentData()
    }
  }, [isOpen, student])

  const fetchStudentData = async () => {
    setLoading(true)
    
    try {
      // Fetch exam results
      const { data: exams, error: examsError } = await supabase
        .from('exams')
        .select('*')
        .eq('student_id', student.id)
        .eq('completed', true)
        .order('created_at', { ascending: false })

      if (examsError) throw examsError

      // Fetch student badges
      const { data: studentBadges, error: badgesError } = await supabase
        .from('student_badges')
        .select(`
          earned_at,
          badges (
            id,
            name,
            description,
            icon
          )
        `)
        .eq('student_id', student.id)
        .order('earned_at', { ascending: false })

      if (badgesError) throw badgesError

      setExamResults(exams || [])
      setBadges(studentBadges?.map(sb => ({
        id: sb.badges.id,
        name: sb.badges.name,
        description: sb.badges.description,
        icon: sb.badges.icon,
        earned_at: sb.earned_at
      })) || [])

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
      // Fetch attempts with question details
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
            topic
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
          topic: attempt.questions.topic
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
    if (xp < 100) return { level: 1, progress: xp, nextLevel: 100 }
    if (xp < 300) return { level: 2, progress: xp - 100, nextLevel: 200 }
    if (xp < 600) return { level: 3, progress: xp - 300, nextLevel: 300 }
    if (xp < 1000) return { level: 4, progress: xp - 600, nextLevel: 400 }
    return { level: 5, progress: xp - 1000, nextLevel: 0 }
  }

  const renderQuestionReview = (attempt: ExamAttempt, index: number) => {
    if (!attempt.question) return null

    const { question } = attempt
    const isCorrect = attempt.is_correct

    return (
      <div key={attempt.id} className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 shadow-soft ${isCorrect ? 'bg-success-50 border-success-300' : 'bg-error-50 border-error-300'}`}>
        {/* Question Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-white mr-3 sm:mr-4 ${isCorrect ? 'bg-success-500' : 'bg-error-500'}`}>
              {index + 1}
            </div>
            <div>
              <div className="flex items-center mb-1">
                {isCorrect ? (
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-success-600 mr-2" />
                ) : (
                  <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-error-600 mr-2" />
                )}
                <span className={`font-semibold text-sm sm:text-base ${isCorrect ? 'text-success-700' : 'text-error-700'}`}>
                  {isCorrect ? 'Correct' : 'Incorrect'}
                </span>
              </div>
              <div className="text-xs sm:text-sm text-neutral-500">
                {question.type} • {question.level}
                {question.topic && ` • ${question.topic}`}
              </div>
            </div>
          </div>
        </div>

        {/* Question Text */}
        <div className="mb-4">
          <h4 className="font-semibold text-neutral-800 mb-3 text-sm sm:text-base">Question:</h4>
          <p className="text-neutral-700 text-sm sm:text-base leading-relaxed">{question.question_text}</p>
        </div>

        {/* Question Content Based on Type */}
        {question.type === 'MCQ' && question.options.length > 0 && (
          <div className="mb-4">
            <h5 className="font-medium text-neutral-700 mb-2 text-sm sm:text-base">Options:</h5>
            <div className="space-y-2">
              {question.options.map((option, optIndex) => {
                const isUserAnswer = attempt.answer_given === option
                const isCorrectAnswer = question.correct_answer === option
                
                return (
                  <div
                    key={optIndex}
                    className={`p-2 sm:p-3 rounded-lg border text-sm sm:text-base ${
                      isCorrectAnswer
                        ? 'bg-success-100 border-success-400 text-success-800'
                        : isUserAnswer && !isCorrect
                        ? 'bg-error-100 border-error-400 text-error-800'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="font-bold mr-2 sm:mr-3">{String.fromCharCode(65 + optIndex)}.</span>
                      <span>{option}</span>
                      {isCorrectAnswer && (
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-success-600 ml-auto" />
                      )}
                      {isUserAnswer && !isCorrect && (
                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-error-600 ml-auto" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Answer Section */}
        <div className="space-y-3">
          <div>
            <h5 className="font-medium text-neutral-700 mb-2 text-sm sm:text-base">Your Answer:</h5>
            <div className={`p-2 sm:p-3 rounded-lg border text-sm sm:text-base ${isCorrect ? 'bg-success-100 border-success-300 text-success-800' : 'bg-error-100 border-error-300 text-error-800'}`}>
              {attempt.answer_given || 'No answer provided'}
            </div>
          </div>

          {!isCorrect && (
            <div>
              <h5 className="font-medium text-success-700 mb-2 text-sm sm:text-base">Correct Answer:</h5>
              <div className="p-2 sm:p-3 rounded-lg bg-success-100 border border-success-300 text-success-800 text-sm sm:text-base">
                {question.correct_answer}
              </div>
            </div>
          )}
        </div>

        {/* Special handling for different question types */}
        {question.type === 'Matching' && (
          <div className="mt-3 p-2 sm:p-3 bg-primary-50 border border-primary-200 rounded-lg">
            <div className="flex items-center text-primary-700 text-xs sm:text-sm">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <span>Matching question - answers shown as pairs</span>
            </div>
          </div>
        )}

        {question.type === 'Subjective' && (
          <div className="mt-3 p-2 sm:p-3 bg-accent-50 border border-accent-200 rounded-lg">
            <div className="flex items-center text-accent-700 text-xs sm:text-sm">
              <Edit3 className="w-4 h-4 mr-2" />
              <span>Subjective question - graded based on key concepts</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (!isOpen) return null

  const xpInfo = getXPLevel(student.xp)
  const totalExams = examResults.length
  const averageScore = examResults.length > 0 
    ? Math.round(examResults.reduce((sum, exam) => sum + (exam.score || 0), 0) / examResults.length)
    : 0

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-200 bg-gradient-to-r from-secondary-100 to-primary-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {reviewingExam ? (
                <button
                  onClick={handleBackToProgress}
                  className="bg-secondary-500 rounded-full p-2 sm:p-3 mr-3 sm:mr-4 shadow-success hover:bg-secondary-600 transition-colors"
                >
                  <ArrowLeft className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </button>
              ) : (
                <div className="bg-secondary-500 rounded-full p-2 sm:p-3 mr-3 sm:mr-4 shadow-success">
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
              )}
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-secondary-600">
                  {reviewingExam ? 'Exam Review' : `${student.name}'s Progress`}
                </h2>
                <p className="text-sm sm:text-base text-primary-600">
                  {reviewingExam 
                    ? `${reviewingExam.subject} - ${reviewingExam.mode} Mode - ${formatDate(reviewingExam.date)}`
                    : `${student.level} • ${student.school}`
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 transition-colors bg-white rounded-full p-1.5 sm:p-2 shadow-soft"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="text-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-secondary-200 border-t-secondary-500 mx-auto mb-4 sm:mb-6"></div>
              <p className="text-secondary-600 font-medium text-lg sm:text-xl">Loading progress data...</p>
            </div>
          ) : reviewingExam ? (
            /* Exam Review Content */
            <div className="space-y-4 sm:space-y-6">
              {reviewLoading ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-secondary-200 border-t-secondary-500 mx-auto mb-4 sm:mb-6"></div>
                  <p className="text-secondary-600 font-medium text-lg sm:text-xl">Loading exam details...</p>
                </div>
              ) : (
                <>
                  {/* Exam Summary */}
                  <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 shadow-large ${getScoreBgColor(reviewingExam.score || 0)}`}>
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
                      <div className="text-center sm:text-left mb-3 sm:mb-0">
                        <h3 className="text-xl sm:text-2xl font-bold text-neutral-800 mb-1">Exam Summary</h3>
                        <p className="text-sm sm:text-base text-neutral-600">
                          {reviewingExam.subject} • {reviewingExam.mode} Mode • {reviewingExam.total_questions} questions
                        </p>
                      </div>
                      <div className="text-center">
                        <div className={`text-3xl sm:text-4xl font-bold mb-1 ${getScoreColor(reviewingExam.score || 0)}`}>
                          {reviewingExam.score || 0}%
                        </div>
                        <div className="text-xs sm:text-sm text-neutral-600">
                          {reviewingExam.attempts?.filter(a => a.is_correct).length || 0} / {reviewingExam.total_questions} correct
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center text-sm sm:text-base text-neutral-600">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      <span>Completed on {formatDate(reviewingExam.date)}</span>
                    </div>
                  </div>

                  {/* Questions Review */}
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-neutral-800 mb-4">Question by Question Review</h3>
                    {reviewingExam.attempts && reviewingExam.attempts.length > 0 ? (
                      <div className="space-y-4 sm:space-y-6">
                        {reviewingExam.attempts.map((attempt, index) => 
                          renderQuestionReview(attempt, index)
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 sm:py-12">
                        <div className="bg-neutral-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                          <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-neutral-600" />
                        </div>
                        <p className="text-neutral-600 text-base sm:text-lg">No question details available for this exam.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Progress Tabs Content */
            <>
              {/* Tab Navigation */}
              <div className="border-b border-neutral-200 bg-neutral-50 rounded-t-xl mb-6">
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
                        className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 font-medium transition-all duration-300 text-sm sm:text-base ${
                          activeTab === tab.id
                            ? 'bg-secondary-500 text-white border-b-2 border-secondary-700'
                            : 'text-secondary-600 hover:bg-secondary-100'
                        }`}
                      >
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
                        {tab.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Tab Content */}
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-4 sm:space-y-6">
                  {/* XP and Level */}
                  <div className="bg-gradient-to-r from-accent-100 to-warning-100 border-2 border-accent-400 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-large">
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center mb-2 sm:mb-0">
                        <Star className="w-6 h-6 sm:w-8 sm:h-8 text-accent-600 mr-2 sm:mr-3" />
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-accent-700">Level {xpInfo.level}</h3>
                          <p className="text-sm sm:text-base text-warning-600">{student.xp} XP Total</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold text-accent-700">{student.xp}</div>
                        <div className="text-xs sm:text-sm text-warning-600">Experience Points</div>
                      </div>
                    </div>
                    {xpInfo.nextLevel > 0 && (
                      <div>
                        <div className="flex justify-between text-xs sm:text-sm text-accent-700 mb-2">
                          <span>Progress to Level {xpInfo.level + 1}</span>
                          <span>{xpInfo.progress}/{xpInfo.nextLevel} XP</span>
                        </div>
                        <div className="w-full bg-accent-200 rounded-full h-2.5 sm:h-3 border border-accent-500">
                          <div 
                            className="bg-accent-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${(xpInfo.progress / xpInfo.nextLevel) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                    <div className="card-fun p-3 sm:p-4">
                      <div className="flex items-center">
                        <div className="bg-primary-500 rounded-xl sm:rounded-2xl p-2 sm:p-3 mr-3 sm:mr-4 shadow-fun">
                          <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-primary-600">Total Exams</p>
                          <p className="text-2xl sm:text-3xl font-bold text-neutral-800">{totalExams}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`border-2 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center shadow-soft ${getScoreBgColor(averageScore)}`}>
                      <Target className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 ${getScoreColor(averageScore)}`} />
                      <div className={`text-xl sm:text-2xl font-bold ${getScoreColor(averageScore)}`}>{averageScore}%</div>
                      <div className={`text-xs sm:text-sm ${getScoreColor(averageScore)}`}>Average Score</div>
                    </div>
                    
                    <div className="card-fun p-3 sm:p-4">
                      <div className="flex items-center">
                        <div className="bg-secondary-500 rounded-xl sm:rounded-2xl p-2 sm:p-3 mr-3 sm:mr-4 shadow-success">
                          <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-secondary-600">Badges</p>
                          <p className="text-2xl sm:text-3xl font-bold text-neutral-800">{badges.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="card-fun p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-bold text-primary-700 mb-3 sm:mb-4">Recent Activity</h3>
                    {examResults.slice(0, 5).length > 0 ? (
                      <div className="space-y-2 sm:space-y-3">
                        {examResults.slice(0, 5).map((exam) => (
                          <div key={exam.id} className="flex items-center justify-between p-2.5 sm:p-3 bg-primary-50 rounded-xl border border-primary-200">
                            <div>
                              <div className="font-medium text-sm sm:text-base text-primary-700">{exam.subject}</div>
                              <div className="text-xs sm:text-sm text-primary-600">{exam.mode} Mode • {formatDate(exam.date)}</div>
                            </div>
                            <div className={`text-base sm:text-lg font-bold ${getScoreColor(exam.score || 0)}`}>
                              {exam.score || 0}%
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-primary-600 text-center py-3 sm:py-4 text-sm sm:text-base">No exams completed yet!</p>
                    )}
                  </div>
                </div>
              )}

              {/* Exams Tab */}
              {activeTab === 'exams' && (
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-lg sm:text-xl font-bold text-primary-700">All Exam Results</h3>
                  {examResults.length > 0 ? (
                    <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
                      {examResults.map((exam) => (
                        <div key={exam.id} className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 shadow-soft ${getScoreBgColor(exam.score || 0)}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-bold text-base sm:text-lg">{exam.subject}</div>
                              <div className="text-xs sm:text-sm opacity-80">
                                {exam.mode} Mode • {exam.total_questions} questions • {formatDate(exam.date)}
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 sm:space-x-4">
                              <div className={`text-xl sm:text-2xl font-bold ${getScoreColor(exam.score || 0)}`}>
                                {exam.score || 0}%
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReviewExam(exam)}
                                icon={<Eye className="w-4 h-4" />}
                                className="text-xs sm:text-sm"
                              >
                                Review
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12">
                      <div className="bg-primary-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600" />
                      </div>
                      <p className="text-primary-600 text-base sm:text-lg">No exams completed yet!</p>
                    </div>
                  )}
                </div>
              )}

              {/* Subjects Tab */}
              {activeTab === 'subjects' && (
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-lg sm:text-xl font-bold text-primary-700">Subject Performance</h3>
                  {subjectStats.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      {subjectStats.map((stat) => (
                        <div key={stat.subject} className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 shadow-soft ${getScoreBgColor(stat.averageScore)}`}>
                          <div className="text-center">
                            <h4 className="font-bold text-base sm:text-lg mb-1 sm:mb-2">{stat.subject}</h4>
                            <div className={`text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 ${getScoreColor(stat.averageScore)}`}>
                              {stat.averageScore}%
                            </div>
                            <div className="text-xs sm:text-sm opacity-80">
                              <div>Best: {stat.bestScore}%</div>
                              <div>{stat.totalExams} exams completed</div>
                              <div>Last: {formatDate(stat.lastExamDate)}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12">
                      <div className="bg-primary-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <Target className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600" />
                      </div>
                      <p className="text-primary-600 text-base sm:text-lg">No subject data available yet!</p>
                    </div>
                  )}
                </div>
              )}

              {/* Badges Tab */}
              {activeTab === 'badges' && (
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-lg sm:text-xl font-bold text-primary-700">Achievement Badges</h3>
                  {badges.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {badges.map((badge) => (
                        <div key={badge.id} className="bg-gradient-to-r from-accent-100 to-warning-100 border-2 border-accent-400 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center shadow-large">
                          <div className="text-2xl sm:text-4xl mb-1 sm:mb-2">{badge.icon}</div>
                          <h4 className="font-bold text-accent-700 mb-1 text-sm sm:text-base">{badge.name}</h4>
                          <p className="text-xs sm:text-sm text-warning-600 mb-1 sm:mb-2">{badge.description}</p>
                          <div className="text-xs text-accent-600">
                            Earned: {formatDate(badge.earned_at)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12">
                      <div className="bg-accent-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <Award className="w-6 h-6 sm:w-8 sm:h-8 text-accent-600" />
                      </div>
                      <p className="text-accent-600 text-base sm:text-lg">No badges earned yet!</p>
                      <p className="text-accent-500 text-sm sm:text-base">Complete exams to start earning awesome badges!</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-neutral-200 bg-neutral-50">
          <Button
            onClick={reviewingExam ? handleBackToProgress : onClose}
            className="w-full bg-gradient-to-r from-secondary-400 to-primary-500 text-sm sm:text-base lg:text-lg"
            size="lg"
            icon={reviewingExam ? <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" /> : <Star className="w-5 h-5 sm:w-6 sm:h-6" />}
          >
            {reviewingExam ? 'Back to Progress' : 'Continue Learning Journey!'}
          </Button>
        </div>
      </div>
    </div>
  )
}