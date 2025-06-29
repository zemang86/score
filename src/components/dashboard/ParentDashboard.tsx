import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase, Student } from '../../lib/supabase'
import { Header } from '../layout/Header'
import { AddStudentModal } from './AddStudentModal'
import { StudentCard } from './StudentCard'
import { LeaderboardModal } from './LeaderboardModal'
import { Users, Plus, BookOpen, Trophy, TrendingUp, Crown, Star, Sparkles, Heart, Zap, Target } from 'lucide-react'
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
      case 'free': return 'bg-gradient-to-r from-primary-100 to-secondary-100 border-primary-300'
      case 'premium': return 'bg-gradient-to-r from-accent-100 via-warning-100 to-accent-100 border-accent-400'
      default: return 'bg-gradient-to-r from-neutral-100 to-neutral-200 border-neutral-300'
    }
  }

  const canAddMoreStudents = students.length < maxStudents

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50">
      <Header />
      
      {/* Floating decorative elements */}
      <div className="fixed top-20 right-10 animate-bounce-gentle z-10 opacity-40">
        <Star className="w-6 h-6 text-accent-400" />
      </div>
      <div className="fixed top-40 right-32 animate-pulse-soft z-10 opacity-40">
        <Sparkles className="w-5 h-5 text-primary-400" />
      </div>
      <div className="fixed bottom-20 left-10 animate-wiggle z-10 opacity-40">
        <Heart className="w-7 h-7 text-secondary-400" />
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-20">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="glass rounded-3xl p-8 border border-white/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-primary-500 rounded-full p-4 mr-4 shadow-fun">
                  <Crown className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-primary-700 mb-2">
                    Welcome back, {profile?.full_name || 'Parent'}!
                  </h1>
                  <p className="text-secondary-600 text-xl">Ready to level up your kids' learning adventure?</p>
                </div>
              </div>
              <div className="hidden lg:block">
                <Button
                  onClick={() => setShowLeaderboard(true)}
                  variant="fun"
                  size="lg"
                  icon={<Trophy className="w-5 h-5" />}
                >
                  Leaderboard
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Details Section */}
        <div className="mb-8">
          <div className={`rounded-3xl p-8 border-2 shadow-large ${getPlanColor(subscriptionPlan)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="glass rounded-full p-4 mr-6 border border-white/30">
                  <Crown className="w-12 h-12 text-accent-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-primary-700 mb-2">Your Current Plan</h3>
                  <p className="text-4xl font-bold text-secondary-700">{getPlanDisplayName(subscriptionPlan)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-8">
                <div className="text-center glass rounded-2xl p-4 border border-white/30">
                  <div className="flex items-center justify-center text-primary-600 mb-2">
                    <Users className="w-6 h-6 mr-2" />
                    <span className="font-semibold">Kids Limit</span>
                  </div>
                  <p className="text-3xl font-bold text-secondary-700">{maxStudents}</p>
                </div>
                
                <div className="text-center glass rounded-2xl p-4 border border-white/30">
                  <div className="flex items-center justify-center text-secondary-600 mb-2">
                    <BookOpen className="w-6 h-6 mr-2" />
                    <span className="font-semibold">Daily Exams</span>
                  </div>
                  <p className="text-3xl font-bold text-secondary-700">
                    {dailyExamLimit === 999 ? '∞' : dailyExamLimit}
                  </p>
                </div>
                
                {subscriptionPlan === 'premium' && (
                  <div className="text-center glass rounded-2xl p-4 border border-white/30">
                    <div className="flex items-center justify-center text-accent-600 mb-2">
                      <Star className="w-6 h-6 mr-2" />
                      <span className="font-semibold">Access</span>
                    </div>
                    <p className="text-3xl font-bold text-secondary-700">Full</p>
                  </div>
                )}
              </div>
            </div>
            
            {subscriptionPlan === 'premium' && (
              <div className="mt-6 p-4 bg-success-100 border-2 border-success-300 rounded-2xl">
                <div className="flex items-center text-success-800 font-medium">
                  <Crown className="w-6 h-6 mr-3" />
                  <span className="text-lg">
                    You're enjoying premium access for FREE during our launch period!
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card-fun">
            <div className="flex items-center">
              <div className="bg-primary-500 rounded-full p-3 mr-4 shadow-fun">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-600">Kids</p>
                <p className="text-3xl font-bold text-neutral-800">{students.length}</p>
                <p className="text-xs text-neutral-500">of {maxStudents} allowed</p>
              </div>
            </div>
          </div>

          <div className="card-fun">
            <div className="flex items-center">
              <div className="bg-secondary-500 rounded-full p-3 mr-4 shadow-success">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-600">Exams Done</p>
                <p className="text-3xl font-bold text-neutral-800">{dashboardStats.totalExams}</p>
                <p className="text-xs text-neutral-500">
                  {dailyExamLimit === 999 ? 'Unlimited daily' : `${dailyExamLimit}/day limit`}
                </p>
              </div>
            </div>
          </div>

          <div className="card-fun">
            <div className="flex items-center">
              <div className="bg-accent-500 rounded-full p-3 mr-4 shadow-warning">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-accent-600">Badges</p>
                <p className="text-3xl font-bold text-neutral-800">{dashboardStats.totalBadges}</p>
                <p className="text-xs text-neutral-500">
                  {subscriptionPlan === 'premium' ? 'Full badge system' : 'Limited badges'}
                </p>
              </div>
            </div>
          </div>

          <div className="card-fun">
            <div className="flex items-center">
              <div className="bg-warning-500 rounded-full p-3 mr-4 shadow-warning">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-warning-600">Avg Score</p>
                <p className="text-3xl font-bold text-neutral-800">
                  {dashboardStats.averageScore > 0 ? `${dashboardStats.averageScore}%` : '-'}
                </p>
                <p className="text-xs text-neutral-500">
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
            <div className="glass rounded-3xl border border-white/30">
              <div className="p-6 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-primary-500 rounded-full p-3 mr-4 shadow-fun">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-primary-600">
                      Your Amazing Kids ({students.length})
                    </h2>
                  </div>
                  <Button 
                    variant="fun"
                    size="lg" 
                    onClick={() => setShowAddModal(true)}
                    disabled={!canAddMoreStudents}
                    icon={<Plus className="w-5 h-5" />}
                  >
                    Add Kid
                  </Button>
                </div>
                {!canAddMoreStudents && (
                  <div className="mt-4 p-3 bg-warning-100 border border-warning-300 rounded-xl">
                    <p className="text-warning-700 font-medium text-center">
                      You've reached your plan limit of {maxStudents} {maxStudents === 1 ? 'kid' : 'kids'}!
                    </p>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                {error && (
                  <div className="mb-4 bg-error-50 border-2 border-error-200 rounded-xl p-4">
                    <p className="text-error-700 font-medium text-center">{error}</p>
                  </div>
                )}

                {loading ? (
                  <div className="text-center py-12">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-500 mx-auto mb-6"></div>
                    </div>
                    <p className="text-primary-600 font-medium text-xl">Loading your awesome kids...</p>
                  </div>
                ) : students.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-primary-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                      <Users className="w-16 h-16 text-primary-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-primary-600 mb-4">No kids added yet!</h3>
                    <p className="text-secondary-600 text-lg mb-4">
                      Start by adding your first kid to begin their epic learning adventure!
                    </p>
                    <p className="text-primary-500 mb-6">
                      You can add up to {maxStudents} {maxStudents === 1 ? 'kid' : 'kids'} with your current plan!
                    </p>
                    <Button 
                      onClick={() => setShowAddModal(true)}
                      variant="fun"
                      size="xl"
                      icon={<Plus className="w-6 h-6" />}
                    >
                      Add Your First Kid!
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
            <div className="glass rounded-3xl border border-white/30 p-6">
              <div className="flex items-center mb-6">
                <div className="bg-secondary-500 rounded-full p-3 mr-4 shadow-success">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-secondary-600">Quick Actions</h3>
              </div>
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-lg"
                  onClick={() => setShowAddModal(true)}
                  disabled={!canAddMoreStudents}
                  icon={<Plus className="w-5 h-5" />}
                >
                  Add New Kid
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-lg"
                  onClick={() => setShowLeaderboard(true)}
                  icon={<Trophy className="w-5 h-5" />}
                >
                  View Leaderboard
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-lg"
                  icon={<TrendingUp className="w-5 h-5" />}
                >
                  View Reports
                </Button>
              </div>
            </div>

            {/* Family Stats */}
            <div className="bg-gradient-to-br from-secondary-100 to-primary-100 rounded-3xl border-2 border-secondary-300 p-6">
              <div className="flex items-center mb-4">
                <div className="bg-secondary-500 rounded-full p-3 mr-4 shadow-success">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-secondary-700">Family Stats</h3>
              </div>
              <div className="space-y-3 text-lg">
                <div className="flex items-center justify-between">
                  <span className="text-secondary-700">Total XP Earned:</span>
                  <span className="font-bold text-secondary-800">{dashboardStats.totalXP}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-primary-700">Exams Completed:</span>
                  <span className="font-bold text-primary-800">{dashboardStats.totalExams}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-accent-700">Badges Earned:</span>
                  <span className="font-bold text-accent-800">{dashboardStats.totalBadges}</span>
                </div>
                {dashboardStats.averageScore > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-warning-700">Family Average:</span>
                    <span className="font-bold text-warning-800">{dashboardStats.averageScore}%</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-100 to-secondary-100 rounded-3xl border-2 border-primary-300 p-6">
              <div className="flex items-center mb-4">
                <div className="bg-primary-500 rounded-full p-3 mr-4 shadow-fun">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-primary-700">Getting Started</h3>
              </div>
              <p className="text-secondary-600 text-lg mb-4">
                Welcome to KitaScore! Here's your learning quest:
              </p>
              <ol className="text-primary-700 space-y-3">
                <li className="flex items-start">
                  <span className="bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 mt-1">1</span>
                  <span className="text-lg">Add your kids' profiles</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-secondary-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 mt-1">2</span>
                  <span className="text-lg">Choose levels & subjects</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-accent-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 mt-1">3</span>
                  <span className="text-lg">Start the learning adventure!</span>
                </li>
              </ol>
            </div>

            {/* Plan Benefits */}
            <div className="glass rounded-3xl border border-white/30 p-6">
              <div className="flex items-center mb-4">
                <div className="bg-accent-500 rounded-full p-3 mr-4 shadow-warning">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-accent-600">Your Plan Benefits</h3>
              </div>
              <div className="space-y-3 text-lg">
                <div className="flex items-center text-success-600">
                  <Crown className="w-5 h-5 mr-3" />
                  <span className="font-bold">{subscriptionPlan === 'premium' ? 'Premium' : 'Free'} Plan Active</span>
                </div>
                <div className="flex items-center text-primary-600">
                  <Users className="w-5 h-5 mr-3" />
                  <span>Up to {maxStudents} {maxStudents === 1 ? 'kid' : 'kids'}</span>
                </div>
                <div className="flex items-center text-secondary-600">
                  <BookOpen className="w-5 h-5 mr-3" />
                  <span>
                    {dailyExamLimit === 999 ? 'Unlimited' : dailyExamLimit} exam{dailyExamLimit !== 1 ? 's' : ''} per day
                  </span>
                </div>
                {subscriptionPlan === 'premium' && (
                  <>
                    <div className="flex items-center text-warning-600">
                      <Trophy className="w-5 h-5 mr-3" />
                      <span>All difficulty levels</span>
                    </div>
                    <div className="flex items-center text-error-600">
                      <TrendingUp className="w-5 h-5 mr-3" />
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
    </div>
  )
}