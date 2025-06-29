import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase, Student } from '../../lib/supabase'
import { Header } from '../layout/Header'
import { AddStudentModal } from './AddStudentModal'
import { StudentCard } from './StudentCard'
import { LeaderboardModal } from './LeaderboardModal'
import { Users, Plus, BookOpen, Trophy, TrendingUp, Crown, Maximize2, Star, Sparkles, Gamepad2, Zap, Target } from 'lucide-react'
import { Button } from '../ui/Button'

export function ParentDashboard() {
  const { user, profile, subscriptionPlan, maxStudents, dailyExamLimit } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
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

  const getPlanDisplayName = (plan: string | null) => {
    switch (plan) {
      case 'free': return 'Free Plan'
      case 'premium': return 'Premium Plan'
      default: return 'Unknown Plan'
    }
  }

  const getPlanColor = (plan: string | null) => {
    switch (plan) {
      case 'free': return 'bg-gradient-to-r from-roblox-blue-100 to-roblox-purple-100 border-roblox-blue-300'
      case 'premium': return 'bg-gradient-to-r from-roblox-yellow-100 via-roblox-orange-100 to-roblox-red-100 border-roblox-yellow-400'
      default: return 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300'
    }
  }

  const canAddMoreStudents = students.length < maxStudents

  return (
    <div className="min-h-screen bg-gradient-to-br from-roblox-blue-50 via-roblox-purple-50 to-roblox-yellow-50">
      <Header />
      
      {/* Floating decorative elements */}
      <div className="fixed top-20 right-10 animate-bounce-slow z-10">
        <Star className="w-8 h-8 text-roblox-yellow-400 opacity-60" />
      </div>
      <div className="fixed top-40 right-32 animate-pulse z-10">
        <Sparkles className="w-6 h-6 text-roblox-purple-400 opacity-60" />
      </div>
      <div className="fixed bottom-20 left-10 animate-wiggle z-10">
        <Gamepad2 className="w-10 h-10 text-roblox-green-400 opacity-60" />
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-20">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-roblox border-4 border-roblox-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-roblox-blue-500 rounded-full p-4 mr-4 shadow-neon-blue">
                  <Crown className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold-game text-roblox-blue-600 mb-2">
                    🎮 Welcome back, {profile?.full_name || 'Parent'}! 🎮
                  </h1>
                  <p className="text-roblox-purple-600 font-game text-xl">Ready to level up your kids' learning adventure? 🚀</p>
                </div>
              </div>
              <div className="hidden lg:block">
                <Button
                  onClick={() => setShowLeaderboard(true)}
                  variant="fun"
                  size="lg"
                  className="font-bold-game"
                  glow={true}
                >
                  <Trophy className="w-6 h-6 mr-2" />
                  🏆 Leaderboard 🏆
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Details Section */}
        <div className="mb-8">
          <div className={`rounded-3xl p-8 border-4 shadow-roblox-hover ${getPlanColor(subscriptionPlan)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white/80 backdrop-blur-sm rounded-full p-4 mr-6 shadow-roblox">
                  <Crown className="w-12 h-12 text-roblox-yellow-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold-game text-roblox-blue-700 mb-2">🏆 Your Current Plan 🏆</h3>
                  <p className="text-4xl font-bold-game text-roblox-purple-700">{getPlanDisplayName(subscriptionPlan)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-8">
                <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-roblox-blue-300 shadow-roblox">
                  <div className="flex items-center justify-center text-roblox-blue-600 mb-2">
                    <Users className="w-6 h-6 mr-2" />
                    <span className="font-bold-game">Kids Limit</span>
                  </div>
                  <p className="text-3xl font-bold-game text-roblox-purple-700">{maxStudents}</p>
                </div>
                
                <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-roblox-green-300 shadow-roblox">
                  <div className="flex items-center justify-center text-roblox-green-600 mb-2">
                    <BookOpen className="w-6 h-6 mr-2" />
                    <span className="font-bold-game">Daily Exams</span>
                  </div>
                  <p className="text-3xl font-bold-game text-roblox-purple-700">
                    {dailyExamLimit === 999 ? '∞' : dailyExamLimit}
                  </p>
                </div>
                
                {subscriptionPlan === 'premium' && (
                  <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-roblox-yellow-300 shadow-roblox">
                    <div className="flex items-center justify-center text-roblox-yellow-600 mb-2">
                      <Maximize2 className="w-6 h-6 mr-2" />
                      <span className="font-bold-game">Access</span>
                    </div>
                    <p className="text-3xl font-bold-game text-roblox-purple-700">Full</p>
                  </div>
                )}
              </div>
            </div>
            
            {subscriptionPlan === 'premium' && (
              <div className="mt-6 p-4 bg-roblox-green-100 border-4 border-roblox-green-400 rounded-2xl shadow-roblox">
                <div className="flex items-center text-roblox-green-800 font-game font-bold">
                  <Crown className="w-6 h-6 mr-3" />
                  <span className="text-lg">
                    🎉 You're enjoying premium access for FREE during our launch period! 🎉
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-roblox p-6 border-4 border-roblox-blue-200 hover:shadow-roblox-hover transition-all duration-300">
            <div className="flex items-center">
              <div className="bg-roblox-blue-500 rounded-full p-3 mr-4 shadow-neon-blue">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold-game text-roblox-blue-600">👨‍👩‍👧‍👦 Kids</p>
                <p className="text-3xl font-bold-game text-roblox-purple-700">{students.length}</p>
                <p className="text-xs text-roblox-blue-500 font-game">of {maxStudents} allowed</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-roblox p-6 border-4 border-roblox-green-200 hover:shadow-roblox-hover transition-all duration-300">
            <div className="flex items-center">
              <div className="bg-roblox-green-500 rounded-full p-3 mr-4 shadow-neon-green">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold-game text-roblox-green-600">📚 Exams Done</p>
                <p className="text-3xl font-bold-game text-roblox-purple-700">{dashboardStats.totalExams}</p>
                <p className="text-xs text-roblox-green-500 font-game">
                  {dailyExamLimit === 999 ? 'Unlimited daily' : `${dailyExamLimit}/day limit`}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-roblox p-6 border-4 border-roblox-yellow-200 hover:shadow-roblox-hover transition-all duration-300">
            <div className="flex items-center">
              <div className="bg-roblox-yellow-500 rounded-full p-3 mr-4 shadow-neon-yellow">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold-game text-roblox-yellow-600">🏆 Badges</p>
                <p className="text-3xl font-bold-game text-roblox-purple-700">{dashboardStats.totalBadges}</p>
                <p className="text-xs text-roblox-yellow-500 font-game">
                  {subscriptionPlan === 'premium' ? 'Full badge system' : 'Limited badges'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-roblox p-6 border-4 border-roblox-purple-200 hover:shadow-roblox-hover transition-all duration-300">
            <div className="flex items-center">
              <div className="bg-roblox-purple-500 rounded-full p-3 mr-4 shadow-neon-purple">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold-game text-roblox-purple-600">📊 Avg Score</p>
                <p className="text-3xl font-bold-game text-roblox-purple-700">
                  {dashboardStats.averageScore > 0 ? `${dashboardStats.averageScore}%` : '-'}
                </p>
                <p className="text-xs text-roblox-purple-500 font-game">
                  {subscriptionPlan === 'premium' ? 'Detailed analytics' : 'Basic tracking'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Children Management */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-roblox border-4 border-roblox-blue-200">
              <div className="p-6 border-b-4 border-roblox-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-roblox-blue-500 rounded-full p-3 mr-4 shadow-neon-blue">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold-game text-roblox-blue-600">
                      👨‍👩‍👧‍👦 Your Amazing Kids ({students.length}) 👨‍👩‍👧‍👦
                    </h2>
                  </div>
                  <Button 
                    variant="fun"
                    size="lg" 
                    onClick={() => setShowAddModal(true)}
                    disabled={!canAddMoreStudents}
                    glow={canAddMoreStudents}
                    className="font-bold-game"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    🎯 Add Kid 🎯
                  </Button>
                </div>
                {!canAddMoreStudents && (
                  <div className="mt-4 p-3 bg-roblox-orange-100 border-2 border-roblox-orange-400 rounded-2xl">
                    <p className="text-roblox-orange-700 font-game font-bold text-center">
                      🎮 You've reached your plan limit of {maxStudents} {maxStudents === 1 ? 'kid' : 'kids'}! 🎮
                    </p>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                {error && (
                  <div className="mb-4 bg-roblox-red-100 border-4 border-roblox-red-400 rounded-2xl p-4 shadow-roblox">
                    <p className="text-roblox-red-700 font-game font-bold text-center">⚠️ {error}</p>
                  </div>
                )}

                {loading ? (
                  <div className="text-center py-12">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-8 border-roblox-blue-200 border-t-roblox-blue-500 mx-auto mb-6 shadow-roblox"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse">
                        <div className="w-6 h-6 bg-roblox-yellow-400 rounded-full shadow-neon-yellow"></div>
                      </div>
                    </div>
                    <p className="text-roblox-blue-600 font-game font-bold text-xl">🎮 Loading your awesome kids... 🎮</p>
                  </div>
                ) : students.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-roblox-blue-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-roblox">
                      <Users className="w-16 h-16 text-roblox-blue-500" />
                    </div>
                    <h3 className="text-2xl font-bold-game text-roblox-blue-600 mb-4">🎯 No kids added yet! 🎯</h3>
                    <p className="text-roblox-purple-600 font-game text-lg mb-4">
                      🚀 Start by adding your first kid to begin their epic learning adventure! 🚀
                    </p>
                    <p className="text-roblox-blue-500 font-game mb-6">
                      You can add up to {maxStudents} {maxStudents === 1 ? 'kid' : 'kids'} with your current plan! 🎮
                    </p>
                    <Button 
                      onClick={() => setShowAddModal(true)}
                      variant="fun"
                      size="xl"
                      glow={true}
                      bounce={true}
                      className="font-bold-game"
                    >
                      <Plus className="w-6 h-6 mr-3" />
                      🌟 Add Your First Kid! 🌟
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {students.map((student) => (
                      <StudentCard
                        key={student.id}
                        student={student}
                        onExamComplete={handleExamComplete}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions & Info */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-roblox border-4 border-roblox-purple-200 p-6">
              <div className="flex items-center mb-6">
                <div className="bg-roblox-purple-500 rounded-full p-3 mr-4 shadow-neon-purple">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold-game text-roblox-purple-600">⚡ Quick Actions ⚡</h3>
              </div>
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start font-game text-lg border-4 border-roblox-blue-300 hover:bg-roblox-blue-50"
                  onClick={() => setShowAddModal(true)}
                  disabled={!canAddMoreStudents}
                >
                  <Plus className="w-5 h-5 mr-3" />
                  🎯 Add New Kid
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start font-game text-lg border-4 border-roblox-yellow-300 hover:bg-roblox-yellow-50"
                  onClick={() => setShowLeaderboard(true)}
                >
                  <Trophy className="w-5 h-5 mr-3" />
                  🏆 View Leaderboard
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start font-game text-lg border-4 border-roblox-green-300 hover:bg-roblox-green-50"
                >
                  <TrendingUp className="w-5 h-5 mr-3" />
                  📊 View Reports
                </Button>
              </div>
            </div>

            {/* Family Stats */}
            <div className="bg-gradient-to-br from-roblox-green-100 to-roblox-blue-100 rounded-3xl border-4 border-roblox-green-300 p-6 shadow-roblox">
              <div className="flex items-center mb-4">
                <div className="bg-roblox-green-500 rounded-full p-3 mr-4 shadow-neon-green">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold-game text-roblox-green-700">📈 Family Stats 📈</h3>
              </div>
              <div className="space-y-3 font-game text-lg">
                <div className="flex items-center justify-between">
                  <span className="text-roblox-green-700">⭐ Total XP Earned:</span>
                  <span className="font-bold text-roblox-green-800">{dashboardStats.totalXP}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-roblox-blue-700">📝 Exams Completed:</span>
                  <span className="font-bold text-roblox-blue-800">{dashboardStats.totalExams}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-roblox-purple-700">🏆 Badges Earned:</span>
                  <span className="font-bold text-roblox-purple-800">{dashboardStats.totalBadges}</span>
                </div>
                {dashboardStats.averageScore > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-roblox-yellow-700">📊 Family Average:</span>
                    <span className="font-bold text-roblox-yellow-800">{dashboardStats.averageScore}%</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-roblox-blue-100 to-roblox-purple-100 rounded-3xl border-4 border-roblox-blue-300 p-6 shadow-roblox">
              <div className="flex items-center mb-4">
                <div className="bg-roblox-blue-500 rounded-full p-3 mr-4 shadow-neon-blue">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold-game text-roblox-blue-700">🎮 Getting Started 🎮</h3>
              </div>
              <p className="text-roblox-purple-600 font-game text-lg mb-4">
                Welcome to KitaScore! Here's your epic quest:
              </p>
              <ol className="font-game text-roblox-blue-700 space-y-3">
                <li className="flex items-start">
                  <span className="bg-roblox-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 mt-1 shadow-roblox">1</span>
                  <span className="text-lg">🎯 Add your kids' profiles</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-roblox-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 mt-1 shadow-roblox">2</span>
                  <span className="text-lg">📚 Choose levels & subjects</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-roblox-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 mt-1 shadow-roblox">3</span>
                  <span className="text-lg">🚀 Start the learning adventure!</span>
                </li>
              </ol>
            </div>

            {/* Plan Benefits */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-roblox border-4 border-roblox-yellow-200 p-6">
              <div className="flex items-center mb-4">
                <div className="bg-roblox-yellow-500 rounded-full p-3 mr-4 shadow-neon-yellow">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold-game text-roblox-yellow-600">🏆 Your Plan Benefits 🏆</h3>
              </div>
              <div className="space-y-3 font-game text-lg">
                <div className="flex items-center text-roblox-green-600">
                  <Crown className="w-5 h-5 mr-3" />
                  <span className="font-bold">{subscriptionPlan === 'premium' ? '👑 Premium' : '🆓 Free'} Plan Active</span>
                </div>
                <div className="flex items-center text-roblox-blue-600">
                  <Users className="w-5 h-5 mr-3" />
                  <span>👨‍👩‍👧‍👦 Up to {maxStudents} {maxStudents === 1 ? 'kid' : 'kids'}</span>
                </div>
                <div className="flex items-center text-roblox-purple-600">
                  <BookOpen className="w-5 h-5 mr-3" />
                  <span>
                    📚 {dailyExamLimit === 999 ? 'Unlimited' : dailyExamLimit} exam{dailyExamLimit !== 1 ? 's' : ''} per day
                  </span>
                </div>
                {subscriptionPlan === 'premium' && (
                  <>
                    <div className="flex items-center text-roblox-orange-600">
                      <Trophy className="w-5 h-5 mr-3" />
                      <span>🎯 All difficulty levels</span>
                    </div>
                    <div className="flex items-center text-roblox-red-600">
                      <TrendingUp className="w-5 h-5 mr-3" />
                      <span>📊 Advanced analytics</span>
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
    </div>
  )
}