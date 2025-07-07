import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase, Student } from '../../lib/supabase'
import { Header } from '../layout/Header'
import { AddStudentModal } from './AddStudentModal'
import { StudentCard } from './StudentCard'
import { LeaderboardModal } from './LeaderboardModal'
import { FamilyReportsModal } from './FamilyReportsModal'
import { Users, Plus, BookOpen, Trophy, TrendingUp, Crown, Star, Sparkles, Heart, Zap, Target, AlertCircle } from 'lucide-react'
import { Button } from '../ui/Button'

// Memoized StatCard component to prevent unnecessary re-renders
const StatCard = React.memo(({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  gradient 
}: {
  icon: React.ComponentType<any>
  title: string
  value: string
  subtitle: string
  gradient: string
}) => (
  <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-3 sm:p-4 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-white/80 group">
    <div className="flex items-center">
      <div className={`${gradient} rounded-xl p-2 sm:p-2.5 mr-3 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110`}>
        <Icon className="w-5 h-5 sm:w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-600 mb-1">{title}</p>
        <div className="flex items-baseline">
          <p className="text-xl sm:text-2xl font-bold text-slate-800 mr-2">{value}</p>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
    </div>
  </div>
))

StatCard.displayName = 'StatCard'

// Memoized PlanCard component with enhanced styling
const PlanCard = React.memo(({ 
  subscriptionPlan, 
  maxStudents, 
  dailyExamLimit 
}: {
  subscriptionPlan: string | null
  maxStudents: number
  dailyExamLimit: number
}) => {
  const getPlanDisplayName = useCallback((plan: string | null) => {
    switch (plan) {
      case 'free': return 'Free Plan'
      case 'premium': return 'Premium Plan'
      default: return 'Unknown Plan'
    }
  }, [])

  const getPlanColor = useCallback((plan: string | null) => {
    switch (plan) {
      case 'free': return 'bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-blue-400'
      case 'premium': return 'bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-amber-400'
      default: return 'bg-gradient-to-r from-slate-50 to-slate-100 border-slate-300'
    }
  }, [])

  return (
    <div className={`bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 border-2 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] ${getPlanColor(subscriptionPlan)}`}>
      <div className="flex flex-col lg:flex-row items-center justify-between">
        <div className="flex items-center mb-3 lg:mb-0">
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-3 mr-4 border border-white/50 shadow-lg">
            <Crown className="w-6 h-6 sm:w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-1">Your Current Plan</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-800">{getPlanDisplayName(subscriptionPlan)}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          <div className="text-center bg-white/90 backdrop-blur-sm rounded-xl p-3 border border-white/50 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-center text-blue-600 mb-1">
              <Users className="w-4 h-4 mr-1" />
              <span className="font-semibold text-xs">Kids Limit</span>
            </div>
            <p className="text-xl font-bold text-slate-800">{maxStudents}</p>
          </div>
          
          <div className="text-center bg-white/90 backdrop-blur-sm rounded-xl p-3 border border-white/50 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-center text-indigo-600 mb-1">
              <BookOpen className="w-4 h-4 mr-1" />
              <span className="font-semibold text-xs">Daily Exams</span>
            </div>
            <p className="text-xl font-bold text-slate-800">
              {dailyExamLimit === 999 ? '∞' : dailyExamLimit}
            </p>
          </div>
          
          {subscriptionPlan === 'premium' && (
            <div className="text-center bg-white/90 backdrop-blur-sm rounded-xl p-3 border border-white/50 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-center text-amber-600 mb-1">
                <Star className="w-4 h-4 mr-1" />
                <span className="font-semibold text-xs">Access</span>
              </div>
              <p className="text-xl font-bold text-slate-800">Full</p>
            </div>
          )}
        </div>
      </div>
      
      {subscriptionPlan === 'premium' && (
        <div className="mt-4 p-3 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 rounded-xl text-sm shadow-sm">
          <div className="flex items-center text-green-800 font-semibold">
            <Crown className="w-4 h-4 mr-2" />
            <span>You're enjoying premium access for FREE during our launch period!</span>
          </div>
        </div>
      )}
    </div>
  )
})

PlanCard.displayName = 'PlanCard'

export function OptimizedParentDashboard() {
  const { user, profile, subscriptionPlan, maxStudents, dailyExamLimit } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showFamilyReports, setShowFamilyReports] = useState(false)
  const [error, setError] = useState('')
  const [connectionError, setConnectionError] = useState(false)
  const [dashboardStats, setDashboardStats] = useState({
    totalExams: 0,
    totalBadges: 0,
    averageScore: 0,
    totalXP: 0
  })

  // Memoized computed values
  const isPremium = useMemo(() => subscriptionPlan === 'premium', [subscriptionPlan])
  const canAddMoreStudents = students.length < maxStudents

  // Optimized fetch function with parallel queries
  const fetchDashboardData = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      setError('')
      setConnectionError(false)

      console.log('🔍 Fetching dashboard data for user:', user.id)

      // Test connection first (with timeout)
      const connectionTest = Promise.race([
        supabase.from('users').select('count').limit(1),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 5000)
        )
      ])

      const { error: connectionError } = await connectionTest as any
      if (connectionError) {
        throw new Error('Database connection failed')
      }

      // Fetch students first
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (studentsError) throw studentsError

      const fetchedStudents = studentsData || []
      setStudents(fetchedStudents)

      // If no students, set empty stats and return early
      if (fetchedStudents.length === 0) {
        setDashboardStats({
          totalExams: 0,
          totalBadges: 0,
          averageScore: 0,
          totalXP: 0
        })
        return
      }

      // Parallel queries for statistics
      const studentIds = fetchedStudents.map(s => s.id)
      
      const [examsResult, badgesResult] = await Promise.all([
        supabase
          .from('exams')
          .select('score, completed')
          .in('student_id', studentIds)
          .eq('completed', true),
        supabase
          .from('student_badges')
          .select('id')
          .in('student_id', studentIds)
      ])

      if (examsResult.error) throw examsResult.error
      if (badgesResult.error) throw badgesResult.error

      // Calculate statistics
      const totalXP = fetchedStudents.reduce((sum, student) => sum + (student.xp || 0), 0)
      const completedExams = examsResult.data?.filter(e => e.completed) || []
      const scores = completedExams.map(e => e.score).filter(s => s !== null && s !== undefined)
      const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
      const totalBadges = badgesResult.data?.length || 0

      setDashboardStats({
        totalExams: completedExams.length,
        totalBadges,
        averageScore,
        totalXP
      })

      console.log('✅ Dashboard data fetched successfully')

    } catch (err: any) {
      console.error('❌ Error fetching dashboard data:', err)
      
      if (err.message === 'Failed to fetch' || err.name === 'TypeError' || err.message === 'Connection timeout') {
        setConnectionError(true)
        setError('Network connection failed. Please check your internet connection and ensure Supabase is accessible.')
      } else if (err.code === 'PGRST301') {
        setError('Database connection issue. Please try refreshing the page.')
      } else if (err.code === 'PGRST116') {
        setError('No data found. This might be a permissions issue.')
      } else {
        setError(err.message || 'Failed to load dashboard data. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [user])

  // Memoized event handlers
  const handleStudentAdded = useCallback(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const handleExamComplete = useCallback(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const handleStudentUpdated = useCallback(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const handleRetry = useCallback(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const handleAddModalOpen = useCallback(() => {
    if (canAddMoreStudents) {
      setShowAddModal(true)
    }
  }, [canAddMoreStudents])

  // Fetch data when user changes
  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user, fetchDashboardData])

  // Memoized stat cards data
  const statCards = useMemo(() => [
    {
      icon: Users,
      title: 'Kids',
      value: students.length.toString(),
      subtitle: `of ${maxStudents}`,
      gradient: 'bg-gradient-to-br from-indigo-500 to-purple-500'
    },
    {
      icon: BookOpen,
      title: 'Exams Done',
      value: dashboardStats.totalExams.toString(),
      subtitle: dailyExamLimit === 999 ? '∞/day' : `${dailyExamLimit}/day`,
      gradient: 'bg-gradient-to-br from-green-500 to-emerald-500'
    },
    {
      icon: Trophy,
      title: 'Badges',
      value: dashboardStats.totalBadges.toString(),
      subtitle: isPremium ? 'Full' : 'Limited',
      gradient: 'bg-gradient-to-br from-amber-500 to-orange-500'
    },
    {
      icon: TrendingUp,
      title: 'Avg Score',
      value: dashboardStats.averageScore > 0 ? `${dashboardStats.averageScore}%` : '-',
      subtitle: isPremium ? 'Detailed' : 'Basic',
      gradient: 'bg-gradient-to-br from-red-500 to-pink-500'
    }
  ], [students.length, maxStudents, dashboardStats, dailyExamLimit, isPremium])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <Header />
      
      {/* Enhanced floating decorative elements */}
      <div className="fixed top-20 right-10 animate-float z-10 opacity-30">
        <Star className="w-8 h-8 text-indigo-400" />
      </div>
      <div className="fixed top-40 right-32 animate-bounce-gentle z-10 opacity-25">
        <Sparkles className="w-6 h-6 text-purple-400" />
      </div>
      <div className="fixed bottom-20 left-10 animate-wiggle z-10 opacity-30">
        <Heart className="w-8 h-8 text-pink-400" />
      </div>
      <div className="fixed top-1/2 right-5 animate-pulse-soft z-10 opacity-25">
        <Zap className="w-7 h-7 text-amber-400" />
      </div>
      
      {/* Background gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse-soft"></div>
      <div className="absolute bottom-1/4 right-1/4 w-56 sm:w-80 h-56 sm:h-80 bg-gradient-to-r from-pink-400/20 to-rose-400/20 rounded-full blur-3xl animate-float"></div>
      
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-20">
        {/* Enhanced Welcome Section */}
        <div className="mb-4 sm:mb-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-2xl"></div>
            
            <div className="flex flex-col sm:flex-row items-center justify-between relative z-10">
              <div className="flex flex-col sm:flex-row items-center mb-3 sm:mb-0">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl p-3 sm:p-4 mb-2 sm:mb-0 sm:mr-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                  <Crown className="w-8 h-8 sm:w-9 h-9 text-white" />
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Welcome, {profile?.full_name || 'Parent'}!
                  </h1>
                  <p className="text-sm sm:text-lg text-slate-600 font-medium">Ready to level up your kids' learning adventure?</p>
                </div>
              </div>
              <div className="hidden lg:block">
                <Button
                  onClick={() => setShowLeaderboard(true)}
                  variant="gradient-primary"
                  size="md"
                  icon={<Trophy className="w-5 h-5" />}
                  className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Leaderboard
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Details Section */}
        <div className="mb-4 sm:mb-6">
          <PlanCard 
            subscriptionPlan={subscriptionPlan}
            maxStudents={maxStudents}
            dailyExamLimit={dailyExamLimit}
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {statCards.map((card, index) => (
            <StatCard key={index} {...card} />
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Children Management */}
          <div className="lg:col-span-2">
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
                    onClick={handleAddModalOpen}
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
                        {subscriptionPlan === 'free' 
                          ? `Free plan is limited to ${maxStudents} ${maxStudents === 1 ? 'kid' : 'kids'}. Upgrade to Premium to add more children.`
                          : `You've reached your limit of ${maxStudents} ${maxStudents === 1 ? 'kid' : 'kids'}. ${maxStudents === 1 ? 'Add more kids by upgrading your subscription.' : 'Purchase additional kids for RM10/month each.'}`}
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
                          <Button
                            onClick={handleRetry}
                            variant="outline"
                            size="sm"
                            className="mt-2 text-xs border-red-300 text-red-700 hover:bg-red-50"
                          >
                            Retry Connection
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {loading ? (
                  <div className="text-center py-6">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-500 mx-auto mb-3"></div>
                    </div>
                    <p className="text-indigo-600 font-medium text-sm sm:text-base">Loading your awesome kids...</p>
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
                    <Button 
                      onClick={handleAddModalOpen}
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
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Family Reports */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-md">
              <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-indigo-500" />
                Family Reports
              </h3>
              <p className="text-slate-600 text-sm mb-4">
                Track your family's learning progress with detailed analytics and insights.
              </p>
              <Button
                onClick={() => setShowFamilyReports(true)}
                variant="outline"
                size="sm"
                className="w-full"
                icon={<TrendingUp className="w-4 h-4" />}
              >
                View Reports
              </Button>
            </div>

            {/* Mobile Leaderboard */}
            <div className="lg:hidden bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-md">
              <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-amber-500" />
                Leaderboard
              </h3>
              <p className="text-slate-600 text-sm mb-4">
                See how your kids rank against others in their learning journey!
              </p>
              <Button
                onClick={() => setShowLeaderboard(true)}
                variant="gradient-primary"
                size="sm"
                className="w-full"
                icon={<Trophy className="w-4 h-4" />}
              >
                View Leaderboard
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showAddModal && (
        <AddStudentModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onStudentAdded={handleStudentAdded}
        />
      )}

      {showLeaderboard && (
        <LeaderboardModal
          isOpen={showLeaderboard}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {showFamilyReports && (
        <FamilyReportsModal
          isOpen={showFamilyReports}
          onClose={() => setShowFamilyReports(false)}
        />
      )}
    </div>
  )
}