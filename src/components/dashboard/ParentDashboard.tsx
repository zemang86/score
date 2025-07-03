import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase, Student } from '../../lib/supabase'
import { Header } from '../layout/Header'
import { AddStudentModal } from './AddStudentModal'
import { StudentCard } from './StudentCard'
import { LeaderboardModal } from './LeaderboardModal'
import { FamilyReportsModal } from './FamilyReportsModal'
import { Users, Plus, BookOpen, Trophy, TrendingUp, Crown, Star, Sparkles, Heart, Zap, Target } from 'lucide-react'
import { Button } from '../ui/Button'

export function ParentDashboard() {
  const { user, profile, subscriptionPlan, maxStudents, dailyExamLimit } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showFamilyReports, setShowFamilyReports] = useState(false)
  const [error, setError] = useState('')
  const [dashboardStats, setDashboardStats] = useState({
    totalExams: 0,
    totalBadges: 0,
    averageScore: 0,
    totalXP: 0
  })

  useEffect(() => {
    if (user) {
      fetchStudents()
    }
  }, [user])

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
        .select('score, completed')
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

      setDashboardStats({
        totalExams: completedExams.length,
        totalBadges: badges?.length || 0,
        averageScore,
        totalXP
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
  }

  const handleStudentAdded = () => {
    fetchStudents() // Refresh the students list
  }

  const handleExamComplete = () => {
    fetchStudents() // Refresh to update XP and stats
  }

  const handleStudentUpdated = () => {
    fetchStudents() // Refresh the students list after edit
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
        {/* Welcome Section - Compact */}
        <div className="mb-4 sm:mb-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30 shadow-md">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex flex-col sm:flex-row items-center mb-3 sm:mb-0">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg p-2 sm:p-3 mb-2 sm:mb-0 sm:mr-3 shadow-md">
                  <Crown className="w-6 h-6 sm:w-7 text-white" />
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-0.5">
                    Welcome, {profile?.full_name || 'Parent'}!
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600">Ready to level up your kids' learning adventure?</p>
                </div>
              </div>
              <div className="hidden lg:block">
                <Button
                  onClick={() => setShowLeaderboard(true)}
                  variant="gradient-primary"
                  size="sm"
                  icon={<Trophy className="w-4 h-4" />}
                >
                  Leaderboard
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Details Section - Compact */}
        <div className="mb-4 sm:mb-6">
          <div className={`rounded-xl p-3 sm:p-4 border-2 shadow-md ${getPlanColor(subscriptionPlan)}`}>
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="flex items-center mb-3 lg:mb-0">
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2 mr-3 border border-white/30 shadow-sm">
                  <Crown className="w-5 h-5 sm:w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Your Current Plan</p>
                  <p className="text-lg sm:text-xl font-bold text-slate-800">{getPlanDisplayName(subscriptionPlan)}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                <div className="text-center bg-white/80 backdrop-blur-sm rounded-lg p-2 border border-white/30 shadow-sm">
                  <div className="flex items-center justify-center text-blue-600 mb-0.5">
                    <Users className="w-3.5 h-3.5 mr-1" />
                    <span className="font-medium text-xs">Kids Limit</span>
                  </div>
                  <p className="text-lg font-bold text-slate-800">{maxStudents}</p>
                </div>
                
                <div className="text-center bg-white/80 backdrop-blur-sm rounded-lg p-2 border border-white/30 shadow-sm">
                  <div className="flex items-center justify-center text-indigo-600 mb-0.5">
                    <BookOpen className="w-3.5 h-3.5 mr-1" />
                    <span className="font-medium text-xs">Daily Exams</span>
                  </div>
                  <p className="text-lg font-bold text-slate-800">
                    {dailyExamLimit === 999 ? '∞' : dailyExamLimit}
                  </p>
                </div>
                
                {subscriptionPlan === 'premium' && (
                  <div className="text-center bg-white/80 backdrop-blur-sm rounded-lg p-2 border border-white/30 shadow-sm">
                    <div className="flex items-center justify-center text-amber-600 mb-0.5">
                      <Star className="w-3.5 h-3.5 mr-1" />
                      <span className="font-medium text-xs">Access</span>
                    </div>
                    <p className="text-lg font-bold text-slate-800">Full</p>
                  </div>
                )}
              </div>
            </div>
            
            {subscriptionPlan === 'premium' && (
              <div className="mt-3 p-2 bg-green-100 border border-green-300 rounded-lg text-xs sm:text-sm">
                <div className="flex items-center text-green-800 font-medium">
                  <Crown className="w-3.5 h-3.5 mr-1.5" />
                  <span>You're enjoying premium access for FREE during our launch period!</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats - Compact Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg p-2.5 sm:p-3 shadow-sm border border-slate-200">
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

          <div className="bg-white rounded-lg p-2.5 sm:p-3 shadow-sm border border-slate-200">
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

          <div className="bg-white rounded-lg p-2.5 sm:p-3 shadow-sm border border-slate-200">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg p-1.5 sm:p-2 mr-2 shadow-sm">
                <Trophy className="w-4 h-4 sm:w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-600">Badges</p>
                <div className="flex items-baseline">
                  <p className="text-lg sm:text-xl font-bold text-slate-800 mr-1.5">{dashboardStats.totalBadges}</p>
                  <p className="text-xs text-slate-500">
                    {isPremium ? 'Full' : 'Limited'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-2.5 sm:p-3 shadow-sm border border-slate-200">
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
                  <p className="text-xs text-slate-500">
                    {isPremium ? 'Detailed' : 'Basic'}
                  </p>
                </div>
              </div>
            </div>
          </div>
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
                  <div className="mb-3 bg-red-50 border-2 border-red-200 rounded-lg p-2.5">
                    <p className="text-red-700 font-medium text-center text-xs sm:text-sm">{error}</p>
                  </div>
                )}

                {loading ? (
                  <div className="text-center py-6">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-500 mx-auto mb-3"></div>
                    </div>
                    <p className="text-indigo-600 font-medium text-sm sm:text-base">Loading your awesome kids...</p>
                  </div>
                ) : students.length === 0 ? (
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
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions & Info */}
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-white/30 p-3 sm:p-4 shadow-md">
              <div className="flex items-center mb-3">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg p-1.5 sm:p-2 mr-2 shadow-sm">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800">Quick Actions</h3>
              </div>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-xs sm:text-sm border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 py-2"
                  onClick={() => canAddMoreStudents && setShowAddModal(true)}
                  disabled={!canAddMoreStudents}
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add New Kid
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-xs sm:text-sm border border-slate-200 hover:border-amber-300 hover:bg-amber-50 py-2"
                  onClick={() => setShowLeaderboard(true)}
                  icon={<Trophy className="w-3.5 h-3.5" />}
                >
                  View Leaderboard
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-xs sm:text-sm border border-slate-200 hover:border-blue-300 hover:bg-blue-50 py-2"
                  onClick={() => setShowFamilyReports(true)}
                  icon={<TrendingUp className="w-3.5 h-3.5" />}
                >
                  View Reports
                </Button>
              </div>
            </div>

            {/* Family Stats - Compact */}
            <div className="bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl border-2 border-indigo-300 p-3 sm:p-4 shadow-md">
              <div className="flex items-center mb-2">
                <div className="bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg p-1.5 sm:p-2 mr-2 shadow-sm">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-indigo-800">Family Stats</h3>
              </div>
              <div className="space-y-1.5 text-xs sm:text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-indigo-700">Total XP Earned:</span>
                  <span className="font-bold text-indigo-800">{dashboardStats.totalXP}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-700">Exams Completed:</span>
                  <span className="font-bold text-blue-800">{dashboardStats.totalExams}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-700">Badges Earned:</span>
                  <span className="font-bold text-purple-800">{dashboardStats.totalBadges}</span>
                </div>
                {dashboardStats.averageScore > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-amber-700">Family Average:</span>
                    <span className="font-bold text-amber-800">{dashboardStats.averageScore}%</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl border-2 border-blue-300 p-3 sm:p-4 shadow-md">
              <div className="flex items-center mb-2">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg p-1.5 sm:p-2 mr-2 shadow-sm">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-blue-800">Getting Started</h3>
              </div>
              <p className="text-indigo-700 text-xs sm:text-sm mb-2">
                Welcome to Edventure+! Here's your learning quest:
              </p>
              <ol className="text-blue-700 space-y-1.5">
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">1</span>
                  <span className="text-xs sm:text-sm">Add your kids' profiles</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-indigo-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">2</span>
                  <span className="text-xs sm:text-sm">Choose levels & subjects</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">3</span>
                  <span className="text-xs sm:text-sm">Start the learning adventure!</span>
                </li>
              </ol>
            </div>

            {/* Plan Benefits - Compact */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-white/30 p-3 sm:p-4 shadow-md">
              <div className="flex items-center mb-2">
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg p-1.5 sm:p-2 mr-2 shadow-sm">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-amber-700">Your Plan Benefits</h3>
              </div>
              <div className="space-y-1.5 text-xs sm:text-sm">
                <div className="flex items-center text-green-600">
                  <Crown className="w-3.5 h-3.5 mr-1.5" />
                  <span className="font-bold">{subscriptionPlan === 'premium' ? 'Premium' : 'Free'} Plan Active</span>
                </div>
                <div className="flex items-center text-blue-600">
                  <Users className="w-3.5 h-3.5 mr-1.5" />
                  <span>Up to {maxStudents} {maxStudents === 1 ? 'kid' : 'kids'}</span>
                </div>
                <div className="flex items-center text-indigo-600">
                  <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                  <span>
                    {dailyExamLimit === 999 ? 'Unlimited' : dailyExamLimit} exam{dailyExamLimit !== 1 ? 's' : ''} per day
                  </span>
                </div>
                {subscriptionPlan === 'premium' && (
                  <>
                    <div className="flex items-center text-amber-600">
                      <Trophy className="w-3.5 h-3.5 mr-1.5" />
                      <span>All difficulty levels</span>
                    </div>
                    <div className="flex items-center text-red-600">
                      <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                      <span>Advanced analytics</span>
                    </div>
                  </>
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
    </div>
  )
}