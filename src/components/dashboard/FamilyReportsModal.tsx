import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'
import { X, BarChart3, Users, BookOpen, Trophy, TrendingUp, Calendar, Target, Star, Award, Crown, Zap } from 'lucide-react'

interface FamilyReportsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface FamilyStats {
  totalXP: number
  totalExams: number
  averageScore: number
  totalBadges: number
  totalStudents: number
  completionRate: number
}

interface SubjectBreakdown {
  subject: string
  totalExams: number
  averageScore: number
  bestScore: number
  participatingStudents: number
}

interface ModeBreakdown {
  mode: string
  totalExams: number
  averageScore: number
  bestScore: number
  participatingStudents: number
}

interface StudentComparison {
  id: string
  name: string
  level: string
  totalXP: number
  totalExams: number
  averageScore: number
  badges: number
  rank: number
}

export function FamilyReportsModal({ isOpen, onClose }: FamilyReportsModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'subjects' | 'modes' | 'students'>('overview')
  
  // Data states
  const [familyStats, setFamilyStats] = useState<FamilyStats>({
    totalXP: 0,
    totalExams: 0,
    averageScore: 0,
    totalBadges: 0,
    totalStudents: 0,
    completionRate: 0
  })
  const [subjectBreakdown, setSubjectBreakdown] = useState<SubjectBreakdown[]>([])
  const [modeBreakdown, setModeBreakdown] = useState<ModeBreakdown[]>([])
  const [studentComparison, setStudentComparison] = useState<StudentComparison[]>([])

  useEffect(() => {
    if (isOpen && user) {
      fetchFamilyReports()
    }
  }, [isOpen, user])

  const fetchFamilyReports = async () => {
    if (!user) return

    setLoading(true)
    setError('')

    try {
      // Fetch all students for this user
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)

      if (studentsError) throw studentsError

      if (!students || students.length === 0) {
        setFamilyStats({
          totalXP: 0,
          totalExams: 0,
          averageScore: 0,
          totalBadges: 0,
          totalStudents: 0,
          completionRate: 0
        })
        setSubjectBreakdown([])
        setModeBreakdown([])
        setStudentComparison([])
        return
      }

      const studentIds = students.map(s => s.id)

      // Fetch all completed exams for these students
      const { data: exams, error: examsError } = await supabase
        .from('exams')
        .select('*')
        .in('student_id', studentIds)
        .eq('completed', true)

      if (examsError) throw examsError

      // Fetch all badges for these students
      const { data: badges, error: badgesError } = await supabase
        .from('student_badges')
        .select('student_id, badge_id')
        .in('student_id', studentIds)

      if (badgesError) throw badgesError

      // Calculate family stats
      const totalXP = students.reduce((sum, student) => sum + (student.xp || 0), 0)
      const totalExams = exams?.length || 0
      const completedExams = exams?.filter(e => e.completed) || []
      const scores = completedExams.map(e => e.score).filter(s => s !== null && s !== undefined)
      const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
      const totalBadges = badges?.length || 0
      const totalStudents = students.length

      // Calculate completion rate (completed vs total exams including incomplete)
      const { data: allExams, error: allExamsError } = await supabase
        .from('exams')
        .select('completed')
        .in('student_id', studentIds)

      if (allExamsError) throw allExamsError

      const completionRate = allExams && allExams.length > 0 
        ? Math.round((completedExams.length / allExams.length) * 100)
        : 0

      setFamilyStats({
        totalXP,
        totalExams,
        averageScore,
        totalBadges,
        totalStudents,
        completionRate
      })

      // Calculate subject breakdown
      const subjectMap = new Map<string, { exams: any[], students: Set<string> }>()
      
      completedExams.forEach(exam => {
        if (!subjectMap.has(exam.subject)) {
          subjectMap.set(exam.subject, { exams: [], students: new Set() })
        }
        subjectMap.get(exam.subject)!.exams.push(exam)
        subjectMap.get(exam.subject)!.students.add(exam.student_id)
      })

      const subjectStats: SubjectBreakdown[] = Array.from(subjectMap.entries()).map(([subject, data]) => {
        const scores = data.exams.map(e => e.score).filter(s => s !== null && s !== undefined)
        const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
        const bestScore = scores.length > 0 ? Math.max(...scores) : 0

        return {
          subject,
          totalExams: data.exams.length,
          averageScore,
          bestScore,
          participatingStudents: data.students.size
        }
      }).sort((a, b) => b.totalExams - a.totalExams)

      setSubjectBreakdown(subjectStats)

      // Calculate mode breakdown
      const modeMap = new Map<string, { exams: any[], students: Set<string> }>()
      
      completedExams.forEach(exam => {
        if (!modeMap.has(exam.mode)) {
          modeMap.set(exam.mode, { exams: [], students: new Set() })
        }
        modeMap.get(exam.mode)!.exams.push(exam)
        modeMap.get(exam.mode)!.students.add(exam.student_id)
      })

      const modeStats: ModeBreakdown[] = Array.from(modeMap.entries()).map(([mode, data]) => {
        const scores = data.exams.map(e => e.score).filter(s => s !== null && s !== undefined)
        const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
        const bestScore = scores.length > 0 ? Math.max(...scores) : 0

        return {
          mode,
          totalExams: data.exams.length,
          averageScore,
          bestScore,
          participatingStudents: data.students.size
        }
      }).sort((a, b) => {
        const modeOrder = { 'Easy': 1, 'Medium': 2, 'Full': 3 }
        return (modeOrder[a.mode as keyof typeof modeOrder] || 4) - (modeOrder[b.mode as keyof typeof modeOrder] || 4)
      })

      setModeBreakdown(modeStats)

      // Calculate student comparison
      const studentStats: StudentComparison[] = students.map(student => {
        const studentExams = completedExams.filter(e => e.student_id === student.id)
        const studentScores = studentExams.map(e => e.score).filter(s => s !== null && s !== undefined)
        const studentAverageScore = studentScores.length > 0 
          ? Math.round(studentScores.reduce((a, b) => a + b, 0) / studentScores.length) 
          : 0
        const studentBadges = badges?.filter(b => b.student_id === student.id).length || 0

        return {
          id: student.id,
          name: student.name,
          level: student.level,
          totalXP: student.xp || 0,
          totalExams: studentExams.length,
          averageScore: studentAverageScore,
          badges: studentBadges,
          rank: 0 // Will be set after sorting
        }
      })

      // Sort by total XP and assign ranks
      studentStats.sort((a, b) => b.totalXP - a.totalXP)
      studentStats.forEach((student, index) => {
        student.rank = index + 1
      })

      setStudentComparison(studentStats)

    } catch (err: any) {
      console.error('Error fetching family reports:', err)
      setError(err.message || 'Failed to load family reports')
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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-accent-500" />
      case 2:
        return <Trophy className="w-5 h-5 text-neutral-400" />
      case 3:
        return <Award className="w-5 h-5 text-warning-500" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-primary-600 font-bold text-sm">#{rank}</span>
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-200 bg-gradient-to-r from-primary-100 to-secondary-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-primary-500 rounded-full p-2 sm:p-3 mr-3 sm:mr-4 shadow-fun">
                <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-600">Family Learning Reports</h2>
                <p className="text-sm sm:text-base text-secondary-600">Comprehensive insights into your family's progress</p>
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
              { id: 'subjects', label: 'Subjects', icon: BookOpen },
              { id: 'modes', label: 'Difficulty', icon: Target },
              { id: 'students', label: 'Students', icon: Users }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 font-medium transition-all duration-300 text-sm sm:text-base ${
                    activeTab === tab.id
                      ? 'bg-primary-500 text-white border-b-2 border-primary-700'
                      : 'text-primary-600 hover:bg-primary-100'
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
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-primary-200 border-t-primary-500 mx-auto mb-4 sm:mb-6"></div>
              <p className="text-primary-600 font-medium text-lg sm:text-xl">Loading family reports...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 sm:py-12">
              <div className="bg-error-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <X className="w-6 h-6 sm:w-8 sm:h-8 text-error-600" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-error-800 mb-1 sm:mb-2">Error Loading Reports</h3>
              <p className="text-error-600 text-sm sm:text-base mb-3 sm:mb-4">{error}</p>
              <Button onClick={fetchFamilyReports} variant="error">
                Try Again
              </Button>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-4 sm:space-y-6">
                  {/* Family Summary */}
                  <div className="bg-gradient-to-r from-accent-100 to-warning-100 border-2 border-accent-400 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-large">
                    <div className="text-center mb-4 sm:mb-6">
                      <h3 className="text-xl sm:text-2xl font-bold text-accent-700 mb-2">Family Learning Summary</h3>
                      <p className="text-accent-600 text-sm sm:text-base">Collective achievements across all your children</p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                      <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold text-accent-700">{familyStats.totalXP.toLocaleString()}</div>
                        <div className="text-xs sm:text-sm text-warning-600">Total XP</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold text-accent-700">{familyStats.totalExams}</div>
                        <div className="text-xs sm:text-sm text-warning-600">Exams Completed</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl sm:text-3xl font-bold ${getScoreColor(familyStats.averageScore)}`}>
                          {familyStats.averageScore}%
                        </div>
                        <div className="text-xs sm:text-sm text-warning-600">Family Average</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold text-accent-700">{familyStats.totalBadges}</div>
                        <div className="text-xs sm:text-sm text-warning-600">Badges Earned</div>
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    <div className="card-fun p-4 sm:p-6">
                      <div className="flex items-center mb-3 sm:mb-4">
                        <div className="bg-primary-500 rounded-xl sm:rounded-2xl p-2 sm:p-3 mr-3 sm:mr-4 shadow-fun">
                          <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-primary-700 text-sm sm:text-base">Active Learners</h4>
                          <p className="text-2xl sm:text-3xl font-bold text-neutral-800">{familyStats.totalStudents}</p>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-neutral-600">Children in your family</p>
                    </div>

                    <div className="card-fun p-4 sm:p-6">
                      <div className="flex items-center mb-3 sm:mb-4">
                        <div className="bg-secondary-500 rounded-xl sm:rounded-2xl p-2 sm:p-3 mr-3 sm:mr-4 shadow-success">
                          <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-secondary-700 text-sm sm:text-base">Completion Rate</h4>
                          <p className="text-2xl sm:text-3xl font-bold text-neutral-800">{familyStats.completionRate}%</p>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-neutral-600">Exams finished vs started</p>
                    </div>

                    <div className="card-fun p-4 sm:p-6">
                      <div className="flex items-center mb-3 sm:mb-4">
                        <div className="bg-accent-500 rounded-xl sm:rounded-2xl p-2 sm:p-3 mr-3 sm:mr-4 shadow-warning">
                          <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-accent-700 text-sm sm:text-base">Avg per Child</h4>
                          <p className="text-2xl sm:text-3xl font-bold text-neutral-800">
                            {familyStats.totalStudents > 0 ? Math.round(familyStats.totalExams / familyStats.totalStudents) : 0}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-neutral-600">Exams per child</p>
                    </div>
                  </div>

                  {/* Quick Insights */}
                  <div className="card-fun p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-bold text-primary-700 mb-3 sm:mb-4">Quick Insights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 sm:p-4">
                        <div className="flex items-center mb-2">
                          <Star className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 mr-2" />
                          <span className="font-medium text-primary-800 text-sm sm:text-base">Top Subject</span>
                        </div>
                        <p className="text-primary-700 text-sm sm:text-base">
                          {subjectBreakdown.length > 0 ? subjectBreakdown[0].subject : 'No data yet'}
                          {subjectBreakdown.length > 0 && (
                            <span className="text-primary-600 ml-2">
                              ({subjectBreakdown[0].totalExams} exams)
                            </span>
                          )}
                        </p>
                      </div>
                      
                      <div className="bg-secondary-50 border border-secondary-200 rounded-xl p-3 sm:p-4">
                        <div className="flex items-center mb-2">
                          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-600 mr-2" />
                          <span className="font-medium text-secondary-800 text-sm sm:text-base">Best Performance</span>
                        </div>
                        <p className="text-secondary-700 text-sm sm:text-base">
                          {subjectBreakdown.length > 0 
                            ? `${Math.max(...subjectBreakdown.map(s => s.bestScore))}% in ${subjectBreakdown.find(s => s.bestScore === Math.max(...subjectBreakdown.map(sb => sb.bestScore)))?.subject}`
                            : 'No data yet'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Subjects Tab */}
              {activeTab === 'subjects' && (
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-lg sm:text-xl font-bold text-primary-700">Performance by Subject</h3>
                  {subjectBreakdown.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {subjectBreakdown.map((subject, index) => (
                        <div key={subject.subject} className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 shadow-soft ${getScoreBgColor(subject.averageScore)}`}>
                          <div className="flex flex-col sm:flex-row items-center justify-between">
                            <div className="flex items-center mb-3 sm:mb-0">
                              <div className="bg-primary-500 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-white font-bold mr-3 sm:mr-4">
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="font-bold text-lg sm:text-xl text-neutral-800">{subject.subject}</h4>
                                <p className="text-xs sm:text-sm text-neutral-600">
                                  {subject.participatingStudents} of {familyStats.totalStudents} children participating
                                </p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 sm:gap-6 text-center">
                              <div>
                                <div className="text-lg sm:text-xl font-bold text-neutral-800">{subject.totalExams}</div>
                                <div className="text-xs sm:text-sm text-neutral-600">Exams</div>
                              </div>
                              <div>
                                <div className={`text-lg sm:text-xl font-bold ${getScoreColor(subject.averageScore)}`}>
                                  {subject.averageScore}%
                                </div>
                                <div className="text-xs sm:text-sm text-neutral-600">Average</div>
                              </div>
                              <div>
                                <div className={`text-lg sm:text-xl font-bold ${getScoreColor(subject.bestScore)}`}>
                                  {subject.bestScore}%
                                </div>
                                <div className="text-xs sm:text-sm text-neutral-600">Best</div>
                              </div>
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
                      <p className="text-primary-600 text-base sm:text-lg">No subject data available yet!</p>
                      <p className="text-primary-500 text-sm sm:text-base">Complete some exams to see subject breakdowns.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Modes Tab */}
              {activeTab === 'modes' && (
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-lg sm:text-xl font-bold text-primary-700">Performance by Difficulty Level</h3>
                  {modeBreakdown.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {modeBreakdown.map((mode) => (
                        <div key={mode.mode} className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 shadow-soft ${getScoreBgColor(mode.averageScore)}`}>
                          <div className="flex flex-col sm:flex-row items-center justify-between">
                            <div className="flex items-center mb-3 sm:mb-0">
                              <div className={`rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-white font-bold mr-3 sm:mr-4 ${
                                mode.mode === 'Easy' ? 'bg-secondary-500' :
                                mode.mode === 'Medium' ? 'bg-accent-500' : 'bg-error-500'
                              }`}>
                                {mode.mode === 'Easy' ? 'E' : mode.mode === 'Medium' ? 'M' : 'F'}
                              </div>
                              <div>
                                <h4 className="font-bold text-lg sm:text-xl text-neutral-800">{mode.mode} Mode</h4>
                                <p className="text-xs sm:text-sm text-neutral-600">
                                  {mode.participatingStudents} of {familyStats.totalStudents} children participating
                                </p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 sm:gap-6 text-center">
                              <div>
                                <div className="text-lg sm:text-xl font-bold text-neutral-800">{mode.totalExams}</div>
                                <div className="text-xs sm:text-sm text-neutral-600">Exams</div>
                              </div>
                              <div>
                                <div className={`text-lg sm:text-xl font-bold ${getScoreColor(mode.averageScore)}`}>
                                  {mode.averageScore}%
                                </div>
                                <div className="text-xs sm:text-sm text-neutral-600">Average</div>
                              </div>
                              <div>
                                <div className={`text-lg sm:text-xl font-bold ${getScoreColor(mode.bestScore)}`}>
                                  {mode.bestScore}%
                                </div>
                                <div className="text-xs sm:text-sm text-neutral-600">Best</div>
                              </div>
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
                      <p className="text-primary-600 text-base sm:text-lg">No difficulty data available yet!</p>
                      <p className="text-primary-500 text-sm sm:text-base">Complete some exams to see difficulty breakdowns.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Students Tab */}
              {activeTab === 'students' && (
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-lg sm:text-xl font-bold text-primary-700">Student Comparison</h3>
                  {studentComparison.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {studentComparison.map((student) => (
                        <div key={student.id} className="card-fun p-4 sm:p-6 hover-lift">
                          <div className="flex flex-col sm:flex-row items-center justify-between">
                            <div className="flex items-center mb-3 sm:mb-0">
                              <div className="mr-3 sm:mr-4 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10">
                                {getRankIcon(student.rank)}
                              </div>
                              <div>
                                <h4 className="font-bold text-lg sm:text-xl text-neutral-800">{student.name}</h4>
                                <p className="text-xs sm:text-sm text-neutral-600">{student.level}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
                              <div>
                                <div className="text-base sm:text-lg font-bold text-accent-700">{student.totalXP}</div>
                                <div className="text-xs sm:text-sm text-neutral-600">XP</div>
                              </div>
                              <div>
                                <div className="text-base sm:text-lg font-bold text-primary-700">{student.totalExams}</div>
                                <div className="text-xs sm:text-sm text-neutral-600">Exams</div>
                              </div>
                              <div>
                                <div className={`text-base sm:text-lg font-bold ${getScoreColor(student.averageScore)}`}>
                                  {student.averageScore}%
                                </div>
                                <div className="text-xs sm:text-sm text-neutral-600">Average</div>
                              </div>
                              <div>
                                <div className="text-base sm:text-lg font-bold text-secondary-700">{student.badges}</div>
                                <div className="text-xs sm:text-sm text-neutral-600">Badges</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12">
                      <div className="bg-primary-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600" />
                      </div>
                      <p className="text-primary-600 text-base sm:text-lg">No students found!</p>
                      <p className="text-primary-500 text-sm sm:text-base">Add some children to see their comparison.</p>
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
            className="w-full bg-gradient-to-r from-primary-400 to-secondary-500 text-sm sm:text-base lg:text-lg"
            size="lg"
            icon={<Zap className="w-5 h-5 sm:w-6 sm:h-6" />}
          >
            Continue Learning Journey!
          </Button>
        </div>
      </div>
    </div>
  )
}