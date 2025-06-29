import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Student } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { X, TrendingUp, Trophy, Calendar, BookOpen, Target, Star, Award, BarChart3 } from 'lucide-react'

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
              <div className="bg-secondary-500 rounded-full p-2 sm:p-3 mr-3 sm:mr-4 shadow-success">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-secondary-600">{student.name}'s Progress</h2>
                <p className="text-sm sm:text-base text-primary-600">{student.level} • {student.school}</p>
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

        {/* Tab Navigation */}
        <div className="border-b border-neutral-200 bg-neutral-50">
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

        {/* Content */}
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="text-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-secondary-200 border-t-secondary-500 mx-auto mb-4 sm:mb-6"></div>
              <p className="text-secondary-600 font-medium text-lg sm:text-xl">Loading progress data...</p>
            </div>
          ) : (
            <>
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
                            <div>
                              <div className="font-bold text-base sm:text-lg">{exam.subject}</div>
                              <div className="text-xs sm:text-sm opacity-80">
                                {exam.mode} Mode • {exam.total_questions} questions • {formatDate(exam.date)}
                              </div>
                            </div>
                            <div className={`text-xl sm:text-2xl font-bold ${getScoreColor(exam.score || 0)}`}>
                              {exam.score || 0}%
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
            onClick={onClose}
            className="w-full bg-gradient-to-r from-secondary-400 to-primary-500 text-sm sm:text-base lg:text-lg"
            size="lg"
            icon={<Star className="w-5 h-5 sm:w-6 sm:h-6" />}
          >
            Continue Learning Journey!
          </Button>
        </div>
      </div>
    </div>
  )
}