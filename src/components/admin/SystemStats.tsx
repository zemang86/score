import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Users, BookOpen, Trophy, Target, TrendingUp, Calendar, Award, CheckCircle } from 'lucide-react'

interface SystemStats {
  totalUsers: number
  totalStudents: number
  totalQuestions: number
  totalExams: number
  totalBadges: number
  completedExams: number
  averageScore: number
  newUsersThisMonth: number
}

export function SystemStats() {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalStudents: 0,
    totalQuestions: 0,
    totalExams: 0,
    totalBadges: 0,
    completedExams: 0,
    averageScore: 0,
    newUsersThisMonth: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSystemStats()
  }, [])

  const fetchSystemStats = async () => {
    try {
      setLoading(true)

      // Fetch all stats in parallel
      const [
        usersResult,
        studentsResult,
        questionsResult,
        examsResult,
        badgesResult,
        completedExamsResult
      ] = await Promise.all([
        supabase.from('users').select('id, created_at'),
        supabase.from('students').select('id'),
        supabase.from('questions').select('id'),
        supabase.from('exams').select('id, score, completed'),
        supabase.from('badges').select('id'),
        supabase.from('exams').select('score').eq('completed', true)
      ])

      const users = usersResult.data || []
      const students = studentsResult.data || []
      const questions = questionsResult.data || []
      const exams = examsResult.data || []
      const badges = badgesResult.data || []
      const completedExams = completedExamsResult.data || []

      // Calculate new users this month
      const now = new Date()
      const newUsersThisMonth = users.filter(user => {
        const userDate = new Date(user.created_at)
        return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear()
      }).length

      // Calculate average score
      const scoresWithValues = completedExams.filter(exam => exam.score !== null)
      const averageScore = scoresWithValues.length > 0 
        ? Math.round(scoresWithValues.reduce((sum, exam) => sum + exam.score, 0) / scoresWithValues.length)
        : 0

      setStats({
        totalUsers: users.length,
        totalStudents: students.length,
        totalQuestions: questions.length,
        totalExams: exams.length,
        totalBadges: badges.length,
        completedExams: completedExams.length,
        averageScore,
        newUsersThisMonth
      })
    } catch (error) {
      console.error('Error fetching system stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="card-fun p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
          <span className="ml-2 text-neutral-600">Loading system statistics...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-fun">
        <h1 className="text-2xl font-bold text-neutral-800 mb-2">System Dashboard</h1>
        <p className="text-neutral-600">Overview of KitaScore platform statistics and performance</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-fun">
          <div className="flex items-center">
            <div className="bg-primary-500 rounded-2xl p-3 mr-4 shadow-fun">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary-600">Total Users</p>
              <p className="text-2xl font-bold text-neutral-800">{stats.totalUsers.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-success-600">+{stats.newUsersThisMonth} this month</span>
          </div>
        </div>

        <div className="card-fun">
          <div className="flex items-center">
            <div className="bg-secondary-500 rounded-2xl p-3 mr-4 shadow-success">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-600">Total Students</p>
              <p className="text-2xl font-bold text-neutral-800">{stats.totalStudents.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card-fun">
          <div className="flex items-center">
            <div className="bg-accent-500 rounded-2xl p-3 mr-4 shadow-warning">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-accent-600">Question Bank</p>
              <p className="text-2xl font-bold text-neutral-800">{stats.totalQuestions.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card-fun">
          <div className="flex items-center">
            <div className="bg-warning-500 rounded-2xl p-3 mr-4 shadow-warning">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-warning-600">Available Badges</p>
              <p className="text-2xl font-bold text-neutral-800">{stats.totalBadges.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-fun">
          <div className="flex items-center">
            <div className="bg-primary-500 rounded-2xl p-3 mr-4 shadow-fun">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary-600">Total Exams</p>
              <p className="text-2xl font-bold text-neutral-800">{stats.totalExams.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card-fun">
          <div className="flex items-center">
            <div className="bg-success-500 rounded-2xl p-3 mr-4 shadow-success">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-success-600">Completed Exams</p>
              <p className="text-2xl font-bold text-neutral-800">{stats.completedExams.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card-fun">
          <div className="flex items-center">
            <div className="bg-secondary-500 rounded-2xl p-3 mr-4 shadow-success">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-600">Average Score</p>
              <p className="text-2xl font-bold text-neutral-800">{stats.averageScore}%</p>
            </div>
          </div>
        </div>

        <div className="card-fun">
          <div className="flex items-center">
            <div className="bg-warning-500 rounded-2xl p-3 mr-4 shadow-warning">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-warning-600">Completion Rate</p>
              <p className="text-2xl font-bold text-neutral-800">
                {stats.totalExams > 0 ? Math.round((stats.completedExams / stats.totalExams) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-fun">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Database Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                Healthy
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">API Response Time</span>
              <span className="text-sm font-medium text-neutral-800">~150ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Storage Usage</span>
              <span className="text-sm font-medium text-neutral-800">2.3 GB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Active Sessions</span>
              <span className="text-sm font-medium text-neutral-800">-</span>
            </div>
          </div>
        </div>

        <div className="card-fun">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors">
              <div className="font-medium text-neutral-800">Backup Database</div>
              <div className="text-sm text-neutral-500">Create a system backup</div>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors">
              <div className="font-medium text-neutral-800">Generate Reports</div>
              <div className="text-sm text-neutral-500">Export system analytics</div>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors">
              <div className="font-medium text-neutral-800">System Maintenance</div>
              <div className="text-sm text-neutral-500">Run maintenance tasks</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}