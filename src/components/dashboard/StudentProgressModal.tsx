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
          <div>
            <h5 className="font-medium text-gray-700 mb-1 text-xs">Your Answer:</h5>
            <div className={`p-1.5 rounded-md border text-xs ${isCorrect ? 'bg-success-100 border-success-300 text-success-800' : 'bg-error-100 border-error-300 text-error-800'}`}>
              {attempt.answer_given || 'No answer provided'}
            </div>
          </div>

          {!isCorrect && (
            <div>
              <h5 className="font-medium text-success-700 mb-1 text-xs">Correct Answer:</h5>
              <div className="p-1.5 rounded-md bg-success-100 border border-success-300 text-success-800 text-xs">
                {question.correct_answer}
              </div>
            </div>
          )}
        </div>
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="p-3 sm:p-4 bg-gradient-to-r from-green-100 to-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {reviewingExam ? (
                  <button
                    onClick={handleBackToProgress}
                    className="bg-green-500 rounded-lg p-2 mr-3 shadow-md hover:bg-green-600 transition-colors text-white"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="bg-green-500 rounded-lg p-2 mr-3 shadow-md">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-bold text-green-700">
                    {reviewingExam ? 'Exam Review' : `${student.name}'s Progress`}
                  </h2>
                  <p className="text-xs text-blue-600">
                    {reviewingExam 
                      ? `${reviewingExam.subject} - ${reviewingExam.mode} Mode - ${formatDate(reviewingExam.date)}`
                      : `${student.level} • ${student.school}`
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="bg-red-500 text-white hover:bg-red-600 transition-colors rounded-lg p-2 shadow-md"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation (only show when not reviewing an exam) */}
        {!reviewingExam && (
          <div className="border-b border-gray-200 bg-gray-50">
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
                    className={`flex-1 px-2 py-2 font-medium transition-all duration-300 text-xs ${
                      activeTab === tab.id
                        ? 'bg-green-500 text-white border-b-2 border-green-700'
                        : 'text-green-600 hover:bg-green-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 inline mr-1" />
                    {tab.label}
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
                    {/* XP and Level - Compact */}
                    <div className="bg-gradient-to-r from-accent-100 to-warning-100 border border-accent-300 rounded-lg p-3 shadow-md">
                      <div className="flex flex-col sm:flex-row items-center justify-between mb-2">
                        <div className="flex items-center mb-2 sm:mb-0">
                          <Star className="w-5 h-5 text-accent-600 mr-2" />
                          <div>
                            <h3 className="text-base font-bold text-accent-700">Level {xpInfo.level}</h3>
                            <p className="text-xs text-warning-600">{student.xp} XP Total</p>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-accent-700">{student.xp}</div>
                          <div className="text-xs text-warning-600">Experience Points</div>
                        </div>
                      </div>
                      {xpInfo.nextLevel > 0 && (
                        <div>
                          <div className="flex justify-between text-xs text-accent-700 mb-1">
                            <span>Progress to Level {xpInfo.level + 1}</span>
                            <span>{xpInfo.progress}/{xpInfo.nextLevel} XP</span>
                          </div>
                          <div className="w-full bg-accent-200 rounded-full h-2 border border-accent-500">
                            <div 
                              className="bg-accent-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${(xpInfo.progress / xpInfo.nextLevel) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
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
                    <h3 className="text-base font-bold text-blue-700">All Exam Results</h3>
                    {examResults.length > 0 ? (
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
                    <h3 className="text-base font-bold text-blue-700">Subject Performance</h3>
                    {subjectStats.length > 0 ? (
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
                    <h3 className="text-base font-bold text-blue-700">Achievement Badges</h3>
                    {badges.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                        {badges.map((badge) => (
                          <div key={badge.id} className="bg-gradient-to-r from-accent-100 to-warning-100 border border-accent-300 rounded-lg p-3 text-center shadow-sm">
                            <div className="text-xl mb-1">{badge.icon}</div>
                            <h4 className="font-bold text-accent-700 mb-0.5 text-sm">{badge.name}</h4>
                            <p className="text-xs text-warning-600 mb-1">{badge.description}</p>
                            <div className="text-xs text-accent-600">
                              Earned: {formatDate(badge.earned_at)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <div className="bg-accent-100 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-3">
                          <Award className="w-5 h-5 text-accent-600" />
                        </div>
                        <p className="text-accent-600 text-sm">No badges earned yet!</p>
                        <p className="text-accent-500 text-xs">Complete exams to start earning awesome badges!</p>
                      </div>
                    )}
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
    </div>
  )
}