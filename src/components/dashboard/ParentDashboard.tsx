import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase, Student } from '../../lib/supabase'
import { Header } from '../layout/Header'
import { AddStudentModal } from './AddStudentModal'
import { StudentCard } from './StudentCard'
import { LeaderboardModal } from './LeaderboardModal'
import { FamilyReportsModal } from './FamilyReportsModal'
import { ExamModal } from './ExamModal'
import { EditStudentModal } from './EditStudentModal'
import { StudentProgressModal } from './StudentProgressModal'
import { Users, Plus, BookOpen, Trophy, TrendingUp, Crown, Star, Sparkles, Heart, Zap, Target, AlertCircle } from 'lucide-react'
import { Button } from '../ui/Button'
import { StudentCardSkeleton, DashboardStatsSkeleton, QuickActionsSkeleton } from '../ui/SkeletonLoader'
import { QuestionBankStats } from './QuestionBankStats'

export function ParentDashboard() {
  const { user, profile, subscriptionPlan, maxStudents, dailyExamLimit } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showFamilyReports, setShowFamilyReports] = useState(false)
  const [showExamModal, setShowExamModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [error, setError] = useState('')
  const [connectionError, setConnectionError] = useState(false)
  const [dashboardStats, setDashboardStats] = useState({
    totalExams: 0,
    totalBadges: 0,
    averageScore: 0,
    totalXP: 0
  })

  // Define isPremium based on subscriptionPlan
  const isPremium = subscriptionPlan === 'premium'

  useEffect(() => {
    if (user) {
      fetchStudents()
    }
  }, [user])

  // Check for any active exam sessions on mount
  useEffect(() => {
    if (students.length > 0) {
      // Check if any student has an active exam session
      for (const student of students) {
        const savedState = sessionStorage.getItem(`exam-state-${student.id}`)
        if (savedState) {
          try {
            const parsedState = JSON.parse(savedState)
            // Only restore modal if there's an active exam (not in setup or completed)
            if (parsedState.step === 'exam' && parsedState.examStarted === true) {
              setSelectedStudent(student)
              setShowExamModal(true)
              break // Only show one exam modal at a time
            }
          } catch {
            // Invalid session data, remove it
            sessionStorage.removeItem(`exam-state-${student.id}`)
          }
        }
      }
    }
  }, [students])

  const testConnection = async () => {
    try {
      console.log('🧪 Testing Supabase connection...')
      
      // Test basic connection
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      if (error) {
        console.error('❌ Connection test failed:', error)
        return false
      }
      
      console.log('✅ Connection test successful')
      return true
    } catch (err) {
      console.error('❌ Connection test error:', err)
      return false
    }
  }

  const fetchStudents = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError('')
      setConnectionError(false)

      console.log('🔍 Starting to fetch students for user:', user.id)

      // First test the connection
      const connectionOk = await testConnection()
      if (!connectionOk) {
        setConnectionError(true)
        setError('Unable to connect to the database. Please check your internet connection and try again.')
        return
      }

      console.log('📡 Making request to fetch students...')

      const { data, error: fetchError } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      console.log('📡 Students fetch response:', { data, error: fetchError })

      if (fetchError) {
        console.error('❌ Fetch error details:', fetchError)
        throw fetchError
      }

      console.log('✅ Students fetched successfully:', data?.length || 0, 'students')
      setStudents(data || [])
      
      // Fetch dashboard statistics using the fetched student data
      if (data && data.length > 0) {
        await fetchDashboardStats(data) // Pass the fetched data directly
      } else {
        // Reset stats if no students
        setDashboardStats({
          totalExams: 0,
          totalBadges: 0,
          averageScore: 0,
          totalXP: 0
        })
      }
    } catch (err: any) {
      console.error('❌ Error in fetchStudents:', err)
      
      // Check if it's a network error
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setConnectionError(true)
        setError('Network connection failed. Please check your internet connection and ensure Supabase is accessible.')
      } else if (err.code === 'PGRST301') {
        setError('Database connection issue. Please try refreshing the page.')
      } else if (err.code === 'PGRST116') {
        setError('No data found. This might be a permissions issue.')
      } else {
        setError(err.message || 'Failed to load students. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchDashboardStats = async (studentsData: Student[]) => {
    try {
      console.log('📊 Fetching dashboard stats for students:', studentsData.map(s => s.id))

      const studentIds = studentsData.map(s => s.id)

      // Fetch exam statistics
      const { data: exams, error: examsError } = await supabase
        .from('exams')
        .select('score, completed')
        .in('student_id', studentIds)
        .eq('completed', true)

      if (examsError) {
        console.error('❌ Error fetching exams:', examsError)
        throw examsError
      }

      // Fetch badge statistics
      const { data: badges, error: badgesError } = await supabase
        .from('student_badges')
        .select('id')
        .in('student_id', studentIds)

      if (badgesError) {
        console.error('❌ Error fetching badges:', badgesError)
        throw badgesError
      }

      // Calculate statistics using the passed studentsData parameter
      const totalXP = studentsData.reduce((sum, student) => sum + (student.xp || 0), 0)
      const totalExams = exams?.length || 0
      const completedExams = exams?.filter(e => e.completed) || []
      const scores = completedExams.map(e => e.score).filter(s => s !== null && s !== undefined)
      const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
      const totalBadges = badges?.length || 0

      console.log('✅ Dashboard stats calculated:', {
        totalExams: completedExams.length,
        totalBadges,
        averageScore,
        totalXP
      })

      setDashboardStats({
        totalExams: completedExams.length,
        totalBadges,
        averageScore,
        totalXP
      })
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error)
      // Don't show error for stats, just log it
    }
  }

  const handleStudentAdded = () => {
    fetchStudents() // Refresh the students list
  }

  const handleExamComplete = () => {
    // ✅ Delay refresh to allow modal to close naturally and prevent tab switching issues
    setTimeout(() => {
      fetchStudents() // Refresh to update XP and stats
    }, 1000) // 1 second delay
  }

  const handleStudentUpdated = () => {
    fetchStudents() // Refresh the students list after edit
  }

  const handleOpenExamModal = (student: Student) => {
    setSelectedStudent(student)
    setShowExamModal(true)
  }

  const handleCloseExamModal = () => {
    setShowExamModal(false)
    setSelectedStudent(null)
    // Clear any saved exam state when modal is closed
    if (selectedStudent) {
      sessionStorage.removeItem(`exam-state-${selectedStudent.id}`)
    }
  }

  const handleOpenEditModal = (student: Student) => {
    setSelectedStudent(student)
    setShowEditModal(true)
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setSelectedStudent(null)
  }

  const handleOpenProgressModal = (student: Student) => {
    setSelectedStudent(student)
    setShowProgressModal(true)
  }

  const handleCloseProgressModal = () => {
    setShowProgressModal(false)
    setSelectedStudent(null)
  }

  const handleStudentUpdatedFromModal = () => {
    setShowEditModal(false)
    setSelectedStudent(null)
    fetchStudents() // Refresh the students list after edit
  }

  const handleRetry = () => {
    fetchStudents()
  }

  const getPlanDisplayName = (plan: string | null) => {
    switch (plan) {
      case 'free': return 'Free Plan'
      case 'premium': return 'Premium Plan'
      default: return 'Unknown Plan'
    }
  }

  const getPlanColor = (plan: string | null) => {
    switch (plan) {
      case 'free': return 'bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-300'
      case 'premium': return 'bg-gradient-to-r from-amber-100 via-orange-100 to-amber-100 border-amber-400'
      default: return 'bg-gradient-to-r from-slate-100 to-slate-200 border-slate-300'
    }
  }

  const canAddMoreStudents = students.length < maxStudents

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      {/* Floating decorative elements */}
      <div className="fixed top-20 right-10 animate-bounce-gentle z-10 opacity-40">
        <Star className="w-6 h-6 text-indigo-400" />
      </div>
      <div className="fixed top-40 right-32 animate-pulse-soft z-10 opacity-40">
        <Sparkles className="w-5 h-5 text-purple-400" />
      </div>
      <div className="fixed bottom-20 left-10 animate-wiggle z-10 opacity-40">
        <Heart className="w-7 h-7 text-pink-400" />
      </div>
      
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-20">
        {/* Welcome Section with Plan Info */}
        <div className="mb-4 sm:mb-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30 shadow-md">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="flex flex-col sm:flex-row items-center mb-3 lg:mb-0">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg p-2 sm:p-3 mb-2 sm:mb-0 sm:mr-3 shadow-md">
                  <Crown className="w-6 h-6 sm:w-7 text-white" />
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-0.5">
                    Welcome, {profile?.full_name || 'Parent'}!
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600 mb-1">
                    Ready to level up your kids' learning adventure?
                  </p>
                  <div className="flex items-center justify-center sm:justify-start">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                      <Crown className="w-3 h-3 mr-1" />
                      {getPlanDisplayName(subscriptionPlan)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowLeaderboard(true)}
                  variant="gradient-primary"
                  size="sm"
                  icon={<Trophy className="w-4 h-4" />}
                >
                  Leaderboard
                </Button>
                <Button
                  onClick={() => setShowFamilyReports(true)}
                  variant="outline"
                  size="sm"
                  icon={<TrendingUp className="w-4 h-4" />}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  Reports
                </Button>
              </div>
            </div>
          </div>
        </div>



        {/* Enhanced Stats Grid - 6 Cards */}
        {loading ? (
          <DashboardStatsSkeleton />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white rounded-lg p-2.5 sm:p-3 shadow-sm border border-slate-200 hover-lift">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg p-1.5 sm:p-2 mr-2 shadow-sm">
                  <Users className="w-4 h-4 sm:w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600">Kids</p>
                  <div className="flex items-baseline">
                    <p className="text-lg sm:text-xl font-bold text-slate-800 mr-1.5">{students.length}</p>
                    <p className="text-xs text-slate-500">of {maxStudents}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-2.5 sm:p-3 shadow-sm border border-slate-200 hover-lift">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg p-1.5 sm:p-2 mr-2 shadow-sm">
                  <BookOpen className="w-4 h-4 sm:w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600">Exams Done</p>
                  <div className="flex items-baseline">
                    <p className="text-lg sm:text-xl font-bold text-slate-800 mr-1.5">{dashboardStats.totalExams}</p>
                    <p className="text-xs text-slate-500">
                      {dailyExamLimit === 999 ? '∞/day' : `${dailyExamLimit}/day`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-2.5 sm:p-3 shadow-sm border border-slate-200 hover-lift">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg p-1.5 sm:p-2 mr-2 shadow-sm">
                  <Trophy className="w-4 h-4 sm:w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600">Badges</p>
                  <div className="flex items-baseline">
                    <p className="text-lg sm:text-xl font-bold text-slate-800 mr-1.5">{dashboardStats.totalBadges}</p>
                    <p className="text-xs text-slate-500">earned</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-2.5 sm:p-3 shadow-sm border border-slate-200 hover-lift">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-lg p-1.5 sm:p-2 mr-2 shadow-sm">
                  <TrendingUp className="w-4 h-4 sm:w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600">Avg Score</p>
                  <div className="flex items-baseline">
                    <p className="text-lg sm:text-xl font-bold text-slate-800 mr-1.5">
                      {dashboardStats.averageScore > 0 ? `${dashboardStats.averageScore}%` : '-'}
                    </p>
                    <p className="text-xs text-slate-500">family</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-2.5 sm:p-3 shadow-sm border border-slate-200 hover-lift">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg p-1.5 sm:p-2 mr-2 shadow-sm">
                  <Zap className="w-4 h-4 sm:w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600">Total XP</p>
                  <div className="flex items-baseline">
                    <p className="text-lg sm:text-xl font-bold text-slate-800 mr-1.5">{dashboardStats.totalXP}</p>
                    <p className="text-xs text-slate-500">points</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-2.5 sm:p-3 shadow-sm border border-slate-200 hover-lift">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg p-1.5 sm:p-2 mr-2 shadow-sm">
                  <BookOpen className="w-4 h-4 sm:w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600">Questions</p>
                  <div className="flex items-baseline">
                    <p className="text-lg sm:text-xl font-bold text-slate-800 mr-1.5">1000+</p>
                    <p className="text-xs text-slate-500">available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Children Management - Full Width */}
        <div className="mb-4 sm:mb-6">
          <div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-white/30 shadow-md">
              <div className="p-3 sm:p-4 border-b border-slate-200">
                <div className="flex flex-col sm:flex-row items-center justify-between">
                  <div className="flex items-center mb-2 sm:mb-0">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg p-1.5 sm:p-2 mr-2 sm:mr-3 shadow-sm">
                      <Users className="w-5 h-5 sm:w-6 text-white" />
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-800">
                      Your Amazing Kids ({students.length})
                    </h2>
                  </div>
                  <Button 
                    variant="gradient-primary"
                    size="sm" 
                    onClick={() => canAddMoreStudents && setShowAddModal(true)}
                    disabled={!canAddMoreStudents}
                    icon={<Plus className="w-3.5 h-3.5" />}
                    className={`w-full sm:w-auto text-xs ${!canAddMoreStudents ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Add Kid
                  </Button>
                </div>
                {!canAddMoreStudents && (
                  <div className="mt-2 p-2 bg-amber-100 border border-amber-300 rounded-lg">
                    <p className="text-amber-700 font-medium text-center text-xs">
                      You've reached your plan limit of {maxStudents} {maxStudents === 1 ? 'kid' : 'kids'}!
                    </p>
                  </div>
                )}
              </div>
              
              <div className="p-3 sm:p-4">
                {error && (
                  <div className="mb-3 bg-red-50 border-2 border-red-200 rounded-lg p-3">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-red-700 font-medium text-sm mb-2">{error}</p>
                        {connectionError && (
                          <div className="space-y-2">
                            <p className="text-red-600 text-xs">
                              Troubleshooting steps:
                            </p>
                            <ul className="text-red-600 text-xs space-y-1 ml-4">
                              <li>• Check your internet connection</li>
                              <li>• Verify Supabase configuration in .env file</li>
                              <li>• Ensure your Supabase project is active</li>
                              <li>• Try refreshing the page</li>
                            </ul>
                            <Button
                              onClick={handleRetry}
                              variant="outline"
                              size="sm"
                              className="mt-2 text-xs border-red-300 text-red-700 hover:bg-red-50"
                            >
                              Retry Connection
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <StudentCardSkeleton />
                    <StudentCardSkeleton />
                  </div>
                ) : students.length === 0 && !error ? (
                  <div className="text-center py-6">
                    <div className="bg-indigo-100 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-3">
                      <Users className="w-8 h-8 text-indigo-500" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-indigo-600 mb-2">No kids added yet!</h3>
                    <p className="text-slate-600 text-sm mb-3">
                      Start by adding your first kid to begin their epic learning adventure!
                    </p>
                    <p className="text-indigo-500 mb-3 text-xs">
                      You can add up to {maxStudents} {maxStudents === 1 ? 'kid' : 'kids'} with your current plan!
                    </p>
                    <Button 
                      onClick={() => setShowAddModal(true)}
                      variant="gradient-primary"
                      size="sm"
                      icon={<Plus className="w-4 h-4" />}
                      className="w-full sm:w-auto"
                    >
                      Add Your First Kid!
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {students.map((student) => (
                      <StudentCard
                        key={student.id}
                        student={student}
                        onExamComplete={handleExamComplete}
                        onStudentUpdated={handleStudentUpdated}
                        onOpenExamModal={handleOpenExamModal}
                        onOpenEditModal={handleOpenEditModal}
                        onOpenProgressModal={handleOpenProgressModal}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Question Bank Statistics */}
        <QuestionBankStats />
      </main>

      {/* Modals */}
      <AddStudentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onStudentAdded={handleStudentAdded}
      />

      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />

      <FamilyReportsModal
        isOpen={showFamilyReports}
        onClose={() => setShowFamilyReports(false)}
      />

      {selectedStudent && (
        <ExamModal
          isOpen={showExamModal}
          onClose={handleCloseExamModal}
          student={selectedStudent}
          onExamComplete={handleExamComplete}
        />
      )}

      {selectedStudent && (
        <EditStudentModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          student={selectedStudent}
          onStudentUpdated={handleStudentUpdatedFromModal}
        />
      )}

      {selectedStudent && (
        <StudentProgressModal
          isOpen={showProgressModal}
          onClose={handleCloseProgressModal}
          student={selectedStudent}
        />
      )}
    </div>
  )
}