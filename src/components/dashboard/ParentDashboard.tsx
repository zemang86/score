import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase, Student } from '../../lib/supabase'
import { Header } from '../layout/Header'
import { AddStudentModal } from './AddStudentModal'
import { StudentCard } from './StudentCard'
import { LeaderboardModal } from './LeaderboardModal'
import { FamilyReportsModal } from './FamilyReportsModal'
import { OnboardingModal } from '../onboarding/OnboardingModal'
import { QuickStartGuide } from '../onboarding/QuickStartGuide'
import { WelcomeTooltip } from '../onboarding/WelcomeTooltip'
import { Users, Plus, BookOpen, Trophy, TrendingUp, Crown, Star, Sparkles, Heart, Zap, Target, Calendar, Award, BarChart3, ArrowUp, ArrowDown, MoreHorizontal, Search, Filter, HelpCircle, Gift } from 'lucide-react'
import { Button } from '../ui/Button'

export function ParentDashboard() {
  const { user, profile, subscriptionPlan, maxStudents, dailyExamLimit } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showFamilyReports, setShowFamilyReports] = useState(false)
  const [error, setError] = useState('')
  
  // Onboarding states
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showQuickStart, setShowQuickStart] = useState(false)
  const [showWelcomeTooltips, setShowWelcomeTooltips] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)
  
  const [dashboardStats, setDashboardStats] = useState({
    totalExams: 0,
    totalBadges: 0,
    averageScore: 0,
    totalXP: 0,
    weeklyProgress: 0,
    monthlyGrowth: 0
  })

  useEffect(() => {
    if (user) {
      fetchStudents()
      checkIfNewUser()
    }
  }, [user])

  const checkIfNewUser = async () => {
    if (!user) return

    try {
      // Check if user has any students
      const { data: students } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      // Check if user has completed any exams
      const { data: exams } = await supabase
        .from('exams')
        .select('id')
        .in('student_id', students?.map(s => s.id) || [])
        .limit(1)

      // Check if user was created recently (within last 24 hours)
      const userCreatedAt = new Date(user.created_at)
      const now = new Date()
      const hoursSinceCreation = (now.getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60)

      const isNewUser = hoursSinceCreation < 24 && (!students || students.length === 0) && (!exams || exams.length === 0)
      
      setIsNewUser(isNewUser)
      
      if (isNewUser) {
        // Show onboarding for new users
        setTimeout(() => setShowOnboarding(true), 1000)
      } else if (students && students.length === 0) {
        // Show quick start for users without students
        setTimeout(() => setShowQuickStart(true), 500)
      }
    } catch (error) {
      console.error('Error checking new user status:', error)
    }
  }

  const fetchStudents = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError('')

      const { data, error: fetchError } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setStudents(data || [])
      
      // Fetch dashboard statistics
      if (data && data.length > 0) {
        await fetchDashboardStats(data.map(s => s.id))
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load students')
      console.error('Error fetching students:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchDashboardStats = async (studentIds: string[]) => {
    try {
      // Fetch exam statistics
      const { data: exams, error: examsError } = await supabase
        .from('exams')
        .select('score, completed, created_at')
        .in('student_id', studentIds)
        .eq('completed', true)

      if (examsError) throw examsError

      // Fetch badge statistics
      const { data: badges, error: badgesError } = await supabase
        .from('student_badges')
        .select('id')
        .in('student_id', studentIds)

      if (badgesError) throw badgesError

      // Calculate statistics
      const completedExams = exams || []
      const scores = completedExams.map(e => e.score).filter(s => s !== null)
      const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
      const totalXP = students.reduce((sum, student) => sum + (student.xp || 0), 0)

      // Calculate weekly progress (last 7 days vs previous 7 days)
      const now = new Date()
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

      const thisWeekExams = completedExams.filter(e => new Date(e.created_at) >= lastWeek).length
      const lastWeekExams = completedExams.filter(e => {
        const date = new Date(e.created_at)
        return date >= twoWeeksAgo && date < lastWeek
      }).length

      const weeklyProgress = lastWeekExams > 0 ? Math.round(((thisWeekExams - lastWeekExams) / lastWeekExams) * 100) : 0

      setDashboardStats({
        totalExams: completedExams.length,
        totalBadges: badges?.length || 0,
        averageScore,
        totalXP,
        weeklyProgress,
        monthlyGrowth: 15 // Mock data for now
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
  }

  const handleStudentAdded = () => {
    fetchStudents() // Refresh the students list
    setShowQuickStart(false) // Close quick start guide
    setShowWelcomeTooltips(true) // Show welcome tooltips
  }

  const handleExamComplete = () => {
    fetchStudents() // Refresh to update XP and stats
  }

  const handleStudentUpdated = () => {
    fetchStudents() // Refresh the students list after edit
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    setShowWelcomeTooltips(true)
  }

  const canAddMoreStudents = students.length < maxStudents

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-transparent bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mb-4 sm:mb-6">
            <div className="absolute inset-2 bg-white rounded-full"></div>
          </div>
          <p className="text-indigo-600 font-medium text-lg sm:text-xl">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      {/* Welcome Banner for New Users */}
      {isNewUser && (
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center mb-2 sm:mb-0">
                <Gift className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-amber-300" />
                <div>
                  <h2 className="text-base sm:text-lg font-bold">Welcome to Edventure+! 🎉</h2>
                  <p className="text-xs sm:text-sm text-purple-100">You have Premium access with unlimited exams and up to 3 children!</p>
                </div>
              </div>
              <Button
                onClick={() => setShowOnboarding(true)}
                className="bg-white text-purple-600 hover:bg-purple-50 text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4"
                icon={<HelpCircle className="w-4 h-4" />}
              >
                Take Tour
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-1 sm:mb-2">
                Monitor progress of your children
              </h1>
              <p className="text-slate-600 text-sm sm:text-lg">
                Track and analyze their learning journey in the easiest way
              </p>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 bg-white rounded-xl sm:rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm text-sm"
                />
              </div>
              <button className="p-2 sm:p-3 bg-slate-900 text-white rounded-xl sm:rounded-2xl hover:bg-slate-800 transition-colors shadow-sm">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Time Period Selector */}
        <div className="flex items-center space-x-1 mb-6 sm:mb-8">
          <button className="px-4 sm:px-6 py-1.5 sm:py-2 bg-white text-slate-600 rounded-lg sm:rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-xs sm:text-sm">
            Week
          </button>
          <button className="px-4 sm:px-6 py-1.5 sm:py-2 bg-slate-900 text-white rounded-lg sm:rounded-xl shadow-sm text-xs sm:text-sm">
            Month
          </button>
          <button className="px-4 sm:px-6 py-1.5 sm:py-2 bg-white text-slate-600 rounded-lg sm:rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-xs sm:text-sm">
            Year
          </button>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {/* Students Card */}
          <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl sm:rounded-3xl p-4 sm:p-6 relative overflow-hidden">
            <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
              <Users className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <div className="mb-3 sm:mb-4">
              <p className="text-purple-700 font-medium mb-1 text-xs sm:text-sm">Students</p>
              <div className="flex items-baseline">
                <span className="text-xl sm:text-4xl font-bold text-purple-900">{students.length}</span>
                <span className="text-purple-600 text-xs sm:text-sm ml-1 sm:ml-2">+{students.length} total</span>
              </div>
            </div>
            <div className="w-full bg-purple-200 rounded-full h-1.5 sm:h-2">
              <div 
                className="bg-purple-600 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                style={{ width: `${(students.length / maxStudents) * 100}%` }}
              ></div>
            </div>
            {showWelcomeTooltips && students.length === 0 && (
              <WelcomeTooltip
                isVisible={true}
                onClose={() => setShowWelcomeTooltips(false)}
                title="Add Your First Child"
                description="Click the 'Add Student' card below to create your first child's profile and start their learning journey!"
                position="bottom"
              />
            )}
          </div>

          {/* Exams Card */}
          <div className="bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-xl sm:rounded-3xl p-4 sm:p-6 relative overflow-hidden">
            <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
              <BookOpen className="w-4 h-4 sm:w-6 sm:h-6 text-cyan-600" />
            </div>
            <div className="mb-3 sm:mb-4">
              <p className="text-cyan-700 font-medium mb-1 text-xs sm:text-sm">Exams</p>
              <div className="flex items-baseline">
                <span className="text-xl sm:text-4xl font-bold text-cyan-900">{dashboardStats.totalExams}</span>
                <span className="text-cyan-600 text-xs sm:text-sm ml-1 sm:ml-2">+1 last day</span>
              </div>
            </div>
            <div className="w-full bg-cyan-200 rounded-full h-1.5 sm:h-2">
              <div className="bg-cyan-600 h-1.5 sm:h-2 rounded-full w-3/4 transition-all duration-500"></div>
            </div>
          </div>

          {/* Average Score Card */}
          <div className="bg-white rounded-xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 relative">
            <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
              <div className="w-4 h-4 sm:w-6 sm:h-6 flex items-center justify-center">
                <div className="w-1 h-1 sm:w-2 sm:h-2 bg-slate-400 rounded-full"></div>
                <div className="w-1 h-1 sm:w-2 sm:h-2 bg-slate-400 rounded-full ml-0.5 sm:ml-1"></div>
                <div className="w-1 h-1 sm:w-2 sm:h-2 bg-slate-400 rounded-full ml-0.5 sm:ml-1"></div>
              </div>
            </div>
            <div className="mb-3 sm:mb-4">
              <p className="text-slate-600 font-medium mb-1 text-xs sm:text-sm">Average Score</p>
              <div className="flex items-baseline">
                <span className="text-xl sm:text-4xl font-bold text-slate-900">{dashboardStats.averageScore}</span>
                <span className="text-slate-500 text-xs sm:text-sm ml-1 sm:ml-2">+1 last day</span>
              </div>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 sm:h-2">
              <div 
                className="bg-slate-600 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                style={{ width: `${dashboardStats.averageScore}%` }}
              ></div>
            </div>
          </div>

          {/* Add Student Card */}
          <div className="bg-white rounded-xl sm:rounded-3xl p-4 sm:p-6 border-2 border-dashed border-slate-300 hover:border-indigo-400 transition-colors cursor-pointer group relative" onClick={() => setShowAddModal(true)}>
            <div className="text-center">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-slate-100 group-hover:bg-indigo-100 rounded-lg sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-4 transition-colors">
                <Plus className="w-4 h-4 sm:w-6 sm:h-6 text-slate-400 group-hover:text-indigo-600" />
              </div>
              <p className="text-slate-600 group-hover:text-indigo-600 font-medium text-xs sm:text-sm">Add Student</p>
              <p className="text-slate-400 text-xs mt-1">Click to add new child</p>
            </div>
            {showWelcomeTooltips && students.length > 0 && (
              <WelcomeTooltip
                isVisible={true}
                onClose={() => setShowWelcomeTooltips(false)}
                title="Start an Exam"
                description="Click 'Start Exam' on any student card to begin their first learning adventure!"
                position="left"
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Chart Area */}
          <div className="lg:col-span-2">
            {/* Total Progress Chart */}
            <div className="bg-white rounded-xl sm:rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-200 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
                <div>
                  <h3 className="text-lg sm:text-2xl font-bold text-slate-900 mb-1 sm:mb-2">Total progress</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-cyan-400 rounded-full mr-1 sm:mr-2"></div>
                      <span className="text-slate-600 text-xs sm:text-sm">learning</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-slate-300 rounded-full mr-1 sm:mr-2"></div>
                      <span className="text-slate-600 text-xs sm:text-sm">target</span>
                    </div>
                  </div>
                </div>
                <div className="text-right mt-2 sm:mt-0">
                  <div className="text-xl sm:text-3xl font-bold text-slate-900">
                    ${dashboardStats.totalXP}.00
                  </div>
                </div>
              </div>

              {/* Mock Chart Area */}
              <div className="h-40 sm:h-64 relative">
                <svg className="w-full h-full" viewBox="0 0 800 200">
                  {/* Grid lines */}
                  <defs>
                    <pattern id="grid" width="80" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 80 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  
                  {/* Chart lines */}
                  <path
                    d="M 50 150 Q 150 120 250 100 T 450 80 T 650 90 T 750 70"
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="3"
                    className="drop-shadow-sm"
                  />
                  <path
                    d="M 50 180 Q 150 160 250 140 T 450 120 T 650 130 T 750 110"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="3"
                  />
                  
                  {/* Data point */}
                  <circle cx="450" cy="80" r="6" fill="#0891b2" className="drop-shadow-sm" />
                </svg>
                
                {/* Month labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs sm:text-sm text-slate-500 px-4">
                  <span>Jun</span>
                  <span>Jul</span>
                  <span>Aug</span>
                  <span>Sep</span>
                  <span className="bg-slate-900 text-white px-2 py-0.5 rounded-full text-xs">Oct</span>
                  <span>Nov</span>
                  <span>Dec</span>
                  <span>Jan</span>
                </div>
              </div>
            </div>

            {/* Students Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {students.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onExamComplete={handleExamComplete}
                  onStudentUpdated={handleStudentUpdated}
                />
              ))}
              
              {students.length === 0 && (
                <div className="md:col-span-2 text-center py-8 sm:py-12">
                  <div className="bg-indigo-100 rounded-full w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <Users className="w-8 h-8 sm:w-12 sm:h-12 text-indigo-500" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3 sm:mb-4">No students added yet!</h3>
                  <p className="text-slate-600 text-sm sm:text-lg mb-4 sm:mb-6">
                    Start by adding your first child to begin their learning adventure!
                  </p>
                  <Button 
                    onClick={() => setShowAddModal(true)}
                    size="lg"
                    icon={<Plus className="w-5 h-5 sm:w-6 sm:h-6" />}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                  >
                    Add Your First Child!
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Performance Image Card */}
            <div className="bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl sm:rounded-3xl p-4 sm:p-6 text-white relative overflow-hidden">
              <div className="absolute top-2 sm:top-4 right-2 sm:right-4 w-20 sm:w-32 h-20 sm:h-32 opacity-20">
                <div className="w-full h-full bg-white rounded-xl sm:rounded-2xl transform rotate-12"></div>
                <div className="absolute top-1 sm:top-2 left-1 sm:left-2 w-full h-full bg-white rounded-xl sm:rounded-2xl transform rotate-6"></div>
                <div className="absolute top-2 sm:top-4 left-2 sm:left-4 w-full h-full bg-white rounded-xl sm:rounded-2xl"></div>
              </div>
              <div className="relative z-10">
                <h3 className="text-base sm:text-xl font-bold mb-1 sm:mb-2">Learning Progress</h3>
                <p className="text-cyan-100 mb-3 sm:mb-4 text-xs sm:text-sm">Track your children's educational journey</p>
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-cyan-600 text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4"
                  onClick={() => setShowFamilyReports(true)}
                >
                  View Reports
                </Button>
              </div>
            </div>

            {/* Performance List */}
            <div className="bg-white rounded-xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Performance</h3>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button className="px-2 sm:px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs">Students</button>
                  <button className="px-2 sm:px-3 py-1 text-slate-600 rounded-lg text-xs hover:bg-slate-100">Subjects</button>
                  <button className="p-1 text-slate-400 hover:text-slate-600">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {students.slice(0, 3).map((student, index) => (
                  <div key={student.id} className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl flex items-center justify-center mr-3 sm:mr-4 ${
                        index === 0 ? 'bg-slate-900' : index === 1 ? 'bg-purple-100' : 'bg-cyan-100'
                      }`}>
                        <div className={`w-4 h-4 sm:w-6 sm:h-6 rounded-md sm:rounded-lg ${
                          index === 0 ? 'bg-cyan-400' : index === 1 ? 'bg-purple-400' : 'bg-cyan-400'
                        }`}></div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-xs sm:text-base">{student.name}</h4>
                        <p className="text-slate-500 text-xs">{student.level}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-1" />
                      <span className="text-green-600 font-medium text-xs sm:text-sm">{25 + index * 5}%</span>
                    </div>
                  </div>
                ))}

                {students.length === 0 && (
                  <div className="text-center py-6 sm:py-8">
                    <Trophy className="w-8 h-8 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-2 sm:mb-3" />
                    <p className="text-slate-500 text-xs sm:text-sm">No performance data yet</p>
                    <p className="text-slate-400 text-xs mt-1">Add students to see their progress</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4">Quick Actions</h3>
              <div className="space-y-2 sm:space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-xs sm:text-sm py-2 sm:py-3"
                  onClick={() => setShowLeaderboard(true)}
                  icon={<Trophy className="w-4 h-4 sm:w-5 sm:h-5" />}
                >
                  View Leaderboard
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left border-2 border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-xs sm:text-sm py-2 sm:py-3"
                  onClick={() => setShowFamilyReports(true)}
                  icon={<BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />}
                >
                  Family Reports
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left border-2 border-slate-200 hover:border-green-300 hover:bg-green-50 text-xs sm:text-sm py-2 sm:py-3"
                  onClick={() => setShowAddModal(true)}
                  disabled={!canAddMoreStudents}
                  icon={<Plus className="w-4 h-4 sm:w-5 sm:h-5" />}
                >
                  Add New Child
                </Button>
                {isNewUser && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left border-2 border-amber-300 hover:border-amber-400 hover:bg-amber-50 text-amber-700 text-xs sm:text-sm py-2 sm:py-3"
                    onClick={() => setShowOnboarding(true)}
                    icon={<HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
                  >
                    Take Platform Tour
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
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

      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
        userName={user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there'}
      />

      <QuickStartGuide
        isOpen={showQuickStart}
        onClose={() => setShowQuickStart(false)}
        onAddStudent={() => setShowAddModal(true)}
        hasStudents={students.length > 0}
      />
    </div>
  )
}