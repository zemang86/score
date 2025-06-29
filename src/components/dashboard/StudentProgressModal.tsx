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
    if (score >= 90) return 'text-roblox-green-600'
    if (score >= 70) return 'text-roblox-yellow-600'
    if (score >= 50) return 'text-roblox-orange-600'
    return 'text-roblox-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-roblox-green-100 border-roblox-green-300'
    if (score >= 70) return 'bg-roblox-yellow-100 border-roblox-yellow-300'
    if (score >= 50) return 'bg-roblox-orange-100 border-roblox-orange-300'
    return 'bg-roblox-red-100 border-roblox-red-300'
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
      <div className="bg-white rounded-3xl shadow-roblox-hover max-w-4xl w-full max-h-[90vh] overflow-y-auto border-4 border-roblox-purple-300">
        
        {/* Header */}
        <div className="p-6 border-b-4 border-roblox-purple-200 bg-gradient-to-r from-roblox-purple-100 to-roblox-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-roblox-purple-500 rounded-full p-3 mr-4 shadow-neon-purple">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold-game text-roblox-purple-600">📊 {student.name}'s Progress 📊</h2>
                <p className="text-roblox-blue-600 font-game">{student.level} • {student.school}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-roblox-purple-500 hover:text-roblox-purple-700 transition-colors bg-white rounded-full p-2 shadow-roblox"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b-4 border-roblox-purple-200 bg-roblox-purple-50">
          <div className="flex">
            {[
              { id: 'overview', label: '📈 Overview', icon: BarChart3 },
              { id: 'exams', label: '📝 Exams', icon: BookOpen },
              { id: 'subjects', label: '📚 Subjects', icon: Target },
              { id: 'badges', label: '🏆 Badges', icon: Trophy }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 px-4 py-3 font-game font-bold transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-roblox-purple-500 text-white border-b-4 border-roblox-purple-700'
                      : 'text-roblox-purple-600 hover:bg-roblox-purple-100'
                  }`}
                >
                  <Icon className="w-5 h-5 inline mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-8 border-roblox-purple-200 border-t-roblox-purple-500 mx-auto mb-6 shadow-roblox"></div>
              <p className="text-roblox-purple-600 font-game font-bold text-xl">🎮 Loading progress data... 🎮</p>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* XP and Level */}
                  <div className="bg-gradient-to-r from-roblox-yellow-100 to-roblox-orange-100 border-4 border-roblox-yellow-400 rounded-2xl p-6 shadow-roblox">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Star className="w-8 h-8 text-roblox-yellow-600 mr-3" />
                        <div>
                          <h3 className="text-xl font-bold-game text-roblox-yellow-700">Level {xpInfo.level}</h3>
                          <p className="text-roblox-orange-600 font-game">{student.xp} XP Total</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold-game text-roblox-yellow-700">{student.xp}</div>
                        <div className="text-sm font-game text-roblox-orange-600">Experience Points</div>
                      </div>
                    </div>
                    {xpInfo.nextLevel > 0 && (
                      <div>
                        <div className="flex justify-between text-sm font-game text-roblox-yellow-700 mb-2">
                          <span>Progress to Level {xpInfo.level + 1}</span>
                          <span>{xpInfo.progress}/{xpInfo.nextLevel} XP</span>
                        </div>
                        <div className="w-full bg-roblox-yellow-200 rounded-full h-3 border-2 border-roblox-yellow-500">
                          <div 
                            className="bg-roblox-yellow-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${(xpInfo.progress / xpInfo.nextLevel) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-roblox-blue-50 border-4 border-roblox-blue-200 rounded-2xl p-4 text-center shadow-roblox">
                      <BookOpen className="w-8 h-8 text-roblox-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold-game text-roblox-blue-700">{totalExams}</div>
                      <div className="text-sm font-game text-roblox-blue-600">Total Exams</div>
                    </div>
                    
                    <div className={`border-4 rounded-2xl p-4 text-center shadow-roblox ${getScoreBgColor(averageScore)}`}>
                      <Target className={`w-8 h-8 mx-auto mb-2 ${getScoreColor(averageScore)}`} />
                      <div className={`text-2xl font-bold-game ${getScoreColor(averageScore)}`}>{averageScore}%</div>
                      <div className={`text-sm font-game ${getScoreColor(averageScore)}`}>Average Score</div>
                    </div>
                    
                    <div className="bg-roblox-purple-50 border-4 border-roblox-purple-200 rounded-2xl p-4 text-center shadow-roblox">
                      <Trophy className="w-8 h-8 text-roblox-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold-game text-roblox-purple-700">{badges.length}</div>
                      <div className="text-sm font-game text-roblox-purple-600">Badges Earned</div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white border-4 border-roblox-blue-200 rounded-2xl p-6 shadow-roblox">
                    <h3 className="text-lg font-bold-game text-roblox-blue-700 mb-4">📅 Recent Activity</h3>
                    {examResults.slice(0, 5).length > 0 ? (
                      <div className="space-y-3">
                        {examResults.slice(0, 5).map((exam) => (
                          <div key={exam.id} className="flex items-center justify-between p-3 bg-roblox-blue-50 rounded-xl border-2 border-roblox-blue-200">
                            <div>
                              <div className="font-game font-bold text-roblox-blue-700">{exam.subject}</div>
                              <div className="text-sm text-roblox-blue-600">{exam.mode} Mode • {formatDate(exam.date)}</div>
                            </div>
                            <div className={`text-lg font-bold-game ${getScoreColor(exam.score || 0)}`}>
                              {exam.score || 0}%
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-roblox-blue-600 font-game text-center py-4">No exams completed yet! 🎯</p>
                    )}
                  </div>
                </div>
              )}

              {/* Exams Tab */}
              {activeTab === 'exams' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold-game text-roblox-blue-700">📝 All Exam Results 📝</h3>
                  {examResults.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {examResults.map((exam) => (
                        <div key={exam.id} className={`p-4 rounded-2xl border-4 shadow-roblox ${getScoreBgColor(exam.score || 0)}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-bold-game text-lg">{exam.subject}</div>
                              <div className="font-game text-sm opacity-80">
                                {exam.mode} Mode • {exam.total_questions} questions • {formatDate(exam.date)}
                              </div>
                            </div>
                            <div className={`text-2xl font-bold-game ${getScoreColor(exam.score || 0)}`}>
                              {exam.score || 0}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 text-roblox-blue-300 mx-auto mb-4" />
                      <p className="text-roblox-blue-600 font-game text-lg">No exams completed yet! 🎯</p>
                    </div>
                  )}
                </div>
              )}

              {/* Subjects Tab */}
              {activeTab === 'subjects' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold-game text-roblox-blue-700">📚 Subject Performance 📚</h3>
                  {subjectStats.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {subjectStats.map((stat) => (
                        <div key={stat.subject} className={`p-4 rounded-2xl border-4 shadow-roblox ${getScoreBgColor(stat.averageScore)}`}>
                          <div className="text-center">
                            <h4 className="font-bold-game text-lg mb-2">{stat.subject}</h4>
                            <div className={`text-3xl font-bold-game mb-2 ${getScoreColor(stat.averageScore)}`}>
                              {stat.averageScore}%
                            </div>
                            <div className="text-sm font-game opacity-80">
                              <div>Best: {stat.bestScore}%</div>
                              <div>{stat.totalExams} exams completed</div>
                              <div>Last: {formatDate(stat.lastExamDate)}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Target className="w-16 h-16 text-roblox-blue-300 mx-auto mb-4" />
                      <p className="text-roblox-blue-600 font-game text-lg">No subject data available yet! 📚</p>
                    </div>
                  )}
                </div>
              )}

              {/* Badges Tab */}
              {activeTab === 'badges' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold-game text-roblox-blue-700">🏆 Achievement Badges 🏆</h3>
                  {badges.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {badges.map((badge) => (
                        <div key={badge.id} className="bg-gradient-to-r from-roblox-yellow-100 to-roblox-orange-100 border-4 border-roblox-yellow-400 rounded-2xl p-4 text-center shadow-roblox">
                          <div className="text-4xl mb-2">{badge.icon}</div>
                          <h4 className="font-bold-game text-roblox-yellow-700 mb-1">{badge.name}</h4>
                          <p className="text-sm font-game text-roblox-orange-600 mb-2">{badge.description}</p>
                          <div className="text-xs font-game text-roblox-yellow-600">
                            Earned: {formatDate(badge.earned_at)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Award className="w-16 h-16 text-roblox-yellow-300 mx-auto mb-4" />
                      <p className="text-roblox-yellow-600 font-game text-lg">No badges earned yet! 🎯</p>
                      <p className="text-roblox-yellow-500 font-game">Complete exams to start earning awesome badges! 🏆</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t-4 border-roblox-purple-200 bg-roblox-purple-50">
          <Button
            onClick={onClose}
            className="w-full font-bold-game bg-gradient-to-r from-roblox-purple-400 to-roblox-blue-500"
            size="lg"
            glow={true}
          >
            <Star className="w-6 h-6 mr-2" />
            🎯 Continue Learning Journey! 🎯
          </Button>
        </div>
      </div>
    </div>
  )
}