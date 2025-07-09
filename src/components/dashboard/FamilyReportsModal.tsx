import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/OptimizedAuthContext'
import { Button } from '../ui/Button'
import { PremiumUpgradeModal } from './PremiumUpgradeModal'
import { X, BarChart3, Users, BookOpen, Trophy, TrendingUp, Calendar, Target, Star, Award, Crown, Zap, Lock } from 'lucide-react'

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
  const { user, subscriptionPlan, isBetaTester, effectiveAccess } = useAuth()
  const isPremium = effectiveAccess?.hasUnlimitedAccess || subscriptionPlan === 'premium'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'subjects' | 'modes' | 'students'>('overview')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  
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
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-amber-600'
    if (score >= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 border-green-300'
    if (score >= 70) return 'bg-amber-100 border-amber-300'
    if (score >= 50) return 'bg-orange-100 border-orange-300'
    return 'bg-red-100 border-red-300'
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-4 h-4 text-amber-500" />
      case 2:
        return <Award className="w-4 h-4 text-gray-400" />
      case 3:
        return <Award className="w-4 h-4 text-amber-500" />
      default:
        return <span className="w-4 h-4 flex items-center justify-center text-indigo-600 font-bold text-xs">#{rank}</span>
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col border border-white/50">
        
                 {/* Clean Professional Header */}
         <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
           <div className="p-4 sm:p-6 bg-slate-50">
             <div className="flex items-center justify-between">
               <div className="flex items-center">
                 <div className="bg-blue-500 rounded-xl p-3 mr-4 shadow-sm">
                   <BarChart3 className="w-6 h-6 text-white" />
                 </div>
                 <div>
                   <h2 className="text-xl font-bold text-slate-800">Family Learning Reports</h2>
                   <p className="text-sm text-slate-600">Comprehensive insights into your family's progress</p>
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

        {/* Clean Tab Navigation */}
        <div className="border-b border-slate-200 bg-slate-50">
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
                  className={`flex-1 px-3 py-3 font-medium transition-all duration-200 text-sm ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white border-b-2 border-blue-600'
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-4">
            {loading ? (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-500 mx-auto mb-3"></div>
                <p className="text-indigo-600 font-medium text-sm">Loading family reports...</p>
              </div>
            ) : error ? (
              <div className="text-center py-6">
                <div className="bg-red-100 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-3">
                  <X className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-base font-medium text-red-800 mb-1">Error Loading Reports</h3>
                <p className="text-red-600 text-sm mb-3">{error}</p>
                <Button onClick={fetchFamilyReports} variant="error" size="sm">
                  Try Again
                </Button>
              </div>
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-3 sm:space-y-4">
                    {/* Family Summary */}
                    <div className="bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300 rounded-lg p-3 sm:p-4 shadow-md">
                      <div className="text-center mb-2">
                        <h3 className="text-base sm:text-lg font-bold text-amber-800 mb-1">Family Learning Summary</h3>
                        <p className="text-amber-700 text-xs">Collective achievements across all your children</p>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="text-center">
                          <div className="text-lg sm:text-xl font-bold text-amber-800">{familyStats.totalXP.toLocaleString()}</div>
                          <div className="text-xs text-amber-700">Total XP</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg sm:text-xl font-bold text-amber-800">{familyStats.totalExams}</div>
                          <div className="text-xs text-amber-700">Exams Completed</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg sm:text-xl font-bold ${getScoreColor(familyStats.averageScore)}`}>
                            {familyStats.averageScore}%
                          </div>
                          <div className="text-xs text-amber-700">Family Average</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg sm:text-xl font-bold text-amber-800">{familyStats.totalBadges}</div>
                          <div className="text-xs text-amber-700">Badges Earned</div>
                        </div>
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3">
                      <div className="bg-white p-2.5 sm:p-3 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                          <div className="bg-indigo-500 rounded-lg p-1.5 sm:p-2 mr-2 shadow-sm">
                            <Users className="w-4 h-4 sm:w-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-indigo-700 text-xs">Active Learners</h4>
                            <p className="text-lg font-bold text-gray-800">{familyStats.totalStudents}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Children in your family</p>
                      </div>

                      <div className="bg-white p-2.5 sm:p-3 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                          <div className="bg-green-500 rounded-lg p-1.5 sm:p-2 mr-2 shadow-sm">
                            <TrendingUp className="w-4 h-4 sm:w-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-green-700 text-xs">Completion Rate</h4>
                            <p className="text-lg font-bold text-gray-800">{familyStats.completionRate}%</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Exams finished vs started</p>
                      </div>

                      <div className="bg-white p-2.5 sm:p-3 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                          <div className="bg-amber-500 rounded-lg p-1.5 sm:p-2 mr-2 shadow-sm">
                            <Calendar className="w-4 h-4 sm:w-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-amber-700 text-xs">Avg per Child</h4>
                            <p className="text-lg font-bold text-gray-800">
                              {familyStats.totalStudents > 0 ? Math.round(familyStats.totalExams / familyStats.totalStudents) : 0}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Exams per child</p>
                      </div>
                    </div>

                    {/* Quick Insights */}
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                      <h3 className="text-base font-bold text-indigo-700 mb-2">Quick Insights</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2">
                          <div className="flex items-center mb-1">
                            <Star className="w-4 h-4 text-indigo-600 mr-1" />
                            <span className="font-medium text-indigo-800 text-xs">Top Subject</span>
                          </div>
                          <p className="text-indigo-700 text-xs">
                            {subjectBreakdown.length > 0 ? subjectBreakdown[0].subject : 'No data yet'}
                            {subjectBreakdown.length > 0 && (
                              <span className="text-indigo-600 ml-1">
                                ({subjectBreakdown[0].totalExams} exams)
                              </span>
                            )}
                          </p>
                        </div>
                        
                        <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                          <div className="flex items-center mb-1">
                            <Trophy className="w-4 h-4 text-green-600 mr-1" />
                            <span className="font-medium text-green-800 text-xs">Best Performance</span>
                          </div>
                          <p className="text-green-700 text-xs">
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
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-indigo-700">Performance by Subject</h3>
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
                    ) : subjectBreakdown.length > 0 ? (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {subjectBreakdown.map((subject, index) => (
                          <div key={subject.subject} className={`p-3 rounded-lg border shadow-sm ${getScoreBgColor(subject.averageScore)}`}>
                            <div className="flex flex-col sm:flex-row items-center justify-between">
                              <div className="flex items-center mb-2 sm:mb-0">
                                <div className="bg-indigo-500 rounded-full w-6 h-6 flex items-center justify-center text-white font-bold mr-2">
                                  {index + 1}
                                </div>
                                <div>
                                  <h4 className="font-bold text-sm text-gray-800">{subject.subject}</h4>
                                  <p className="text-xs text-gray-600">
                                    {subject.participatingStudents} of {familyStats.totalStudents} children
                                  </p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                  <div className="text-sm font-bold text-gray-800">{subject.totalExams}</div>
                                  <div className="text-xs text-gray-600">Exams</div>
                                </div>
                                <div>
                                  <div className={`text-sm font-bold ${getScoreColor(subject.averageScore)}`}>
                                    {subject.averageScore}%
                                  </div>
                                  <div className="text-xs text-gray-600">Average</div>
                                </div>
                                <div>
                                  <div className={`text-sm font-bold ${getScoreColor(subject.bestScore)}`}>
                                    {subject.bestScore}%
                                  </div>
                                  <div className="text-xs text-gray-600">Best</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <div className="bg-indigo-100 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-3">
                          <BookOpen className="w-5 h-5 text-indigo-600" />
                        </div>
                        <p className="text-indigo-600 text-sm">No subject data available yet!</p>
                        <p className="text-indigo-500 text-xs">Complete some exams to see subject breakdowns.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Modes Tab */}
                {activeTab === 'modes' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-indigo-700">Performance by Difficulty Level</h3>
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
                          Upgrade to Premium to unlock detailed difficulty level analytics!
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
                    ) : modeBreakdown.length > 0 ? (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {modeBreakdown.map((mode) => (
                          <div key={mode.mode} className={`p-3 rounded-lg border shadow-sm ${getScoreBgColor(mode.averageScore)}`}>
                            <div className="flex flex-col sm:flex-row items-center justify-between">
                              <div className="flex items-center mb-2 sm:mb-0">
                                <div className={`rounded-full w-6 h-6 flex items-center justify-center text-white font-bold mr-2 ${
                                  mode.mode === 'Easy' ? 'bg-green-500' :
                                  mode.mode === 'Medium' ? 'bg-amber-500' : 'bg-red-500'
                                }`}>
                                  {mode.mode === 'Easy' ? 'E' : mode.mode === 'Medium' ? 'M' : 'F'}
                                </div>
                                <div>
                                  <h4 className="font-bold text-sm text-gray-800">{mode.mode} Mode</h4>
                                  <p className="text-xs text-gray-600">
                                    {mode.participatingStudents} of {familyStats.totalStudents} children
                                  </p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                  <div className="text-sm font-bold text-gray-800">{mode.totalExams}</div>
                                  <div className="text-xs text-gray-600">Exams</div>
                                </div>
                                <div>
                                  <div className={`text-sm font-bold ${getScoreColor(mode.averageScore)}`}>
                                    {mode.averageScore}%
                                  </div>
                                  <div className="text-xs text-gray-600">Average</div>
                                </div>
                                <div>
                                  <div className={`text-sm font-bold ${getScoreColor(mode.bestScore)}`}>
                                    {mode.bestScore}%
                                  </div>
                                  <div className="text-xs text-gray-600">Best</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <div className="bg-indigo-100 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-3">
                          <Target className="w-5 h-5 text-indigo-600" />
                        </div>
                        <p className="text-indigo-600 text-sm">No difficulty data available yet!</p>
                        <p className="text-indigo-500 text-xs">Complete some exams to see difficulty breakdowns.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Students Tab */}
                {activeTab === 'students' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-indigo-700">Student Comparison</h3>
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
                          Upgrade to Premium to unlock detailed student comparison analytics!
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
                    ) : studentComparison.length > 0 ? (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {studentComparison.map((student) => (
                          <div key={student.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                            <div className="flex flex-col sm:flex-row items-center justify-between">
                              <div className="flex items-center mb-2 sm:mb-0">
                                <div className="mr-2 flex items-center justify-center w-6 h-6">
                                  {getRankIcon(student.rank)}
                                </div>
                                <div>
                                  <h4 className="font-bold text-sm text-gray-800">{student.name}</h4>
                                  <p className="text-xs text-gray-600">{student.level}</p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                                <div>
                                  <div className="text-sm font-bold text-amber-700">{student.totalXP}</div>
                                  <div className="text-xs text-gray-600">XP</div>
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-indigo-700">{student.totalExams}</div>
                                  <div className="text-xs text-gray-600">Exams</div>
                                </div>
                                <div>
                                  <div className={`text-sm font-bold ${getScoreColor(student.averageScore)}`}>
                                    {student.averageScore}%
                                  </div>
                                  <div className="text-xs text-gray-600">Average</div>
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-green-700">{student.badges}</div>
                                  <div className="text-xs text-gray-600">Badges</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <div className="bg-indigo-100 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-3">
                          <Users className="w-5 h-5 text-indigo-600" />
                        </div>
                        <p className="text-indigo-600 text-sm">No students found!</p>
                        <p className="text-indigo-500 text-xs">Add some children to see their comparison.</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Clean Footer */}
        <div className="border-t border-slate-200 bg-slate-50 p-3 sm:p-4">
          <Button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 font-medium transition-colors"
          >
            Close Reports
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