import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase, Student } from '../lib/supabase'

interface DashboardStats {
  totalExams: number
  totalBadges: number
  averageScore: number
  totalXP: number
}

interface UseDashboardResult {
  students: Student[]
  dashboardStats: DashboardStats
  loading: boolean
  error: string
  connectionError: boolean
  refetch: () => Promise<void>
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const cache = new Map<string, { data: unknown; timestamp: number }>()

// Simple cache implementation
const getCachedData = (key: string) => {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  return null
}

const setCachedData = (key: string, data: unknown) => {
  cache.set(key, { data, timestamp: Date.now() })
}

export function useOptimizedDashboard(userId: string | undefined): UseDashboardResult {
  const [students, setStudents] = useState<Student[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalExams: 0,
    totalBadges: 0,
    averageScore: 0,
    totalXP: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [connectionError, setConnectionError] = useState(false)

  // Memoized cache key
  const cacheKey = useMemo(() => 
    userId ? `dashboard-${userId}` : '', 
    [userId]
  )

  // Test connection with memoization
  const testConnection = useCallback(async () => {
    const cachedResult = getCachedData('connection-test')
    if (cachedResult !== null) {
      return cachedResult
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      const result = !error
      setCachedData('connection-test', result)
      return result
    } catch (err) {
      return false
    }
  }, [])

  // Optimized fetch function with parallel queries
  const fetchDashboardData = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError('')
      setConnectionError(false)

      // Check cache first
      const cachedData = getCachedData(cacheKey)
      if (cachedData) {
        setStudents(cachedData.students)
        setDashboardStats(cachedData.stats)
        setLoading(false)
        return
      }

      // Test connection
      const connectionOk = await testConnection()
      if (!connectionOk) {
        setConnectionError(true)
        setError('Unable to connect to the database. Please check your internet connection and try again.')
        return
      }

      // Fetch students
      const studentsQuery = supabase
        .from('students')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      const { data: studentsData, error: studentsError } = await studentsQuery

      if (studentsError) throw studentsError

      const fetchedStudents = studentsData || []
      setStudents(fetchedStudents)

      if (fetchedStudents.length === 0) {
        const emptyStats = {
          totalExams: 0,
          totalBadges: 0,
          averageScore: 0,
          totalXP: 0
        }
        setDashboardStats(emptyStats)
        setCachedData(cacheKey, { students: fetchedStudents, stats: emptyStats })
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

      const stats = {
        totalExams: completedExams.length,
        totalBadges,
        averageScore,
        totalXP
      }

      setDashboardStats(stats)

      // Cache the results
      setCachedData(cacheKey, { students: fetchedStudents, stats })

    } catch (err: Error | unknown) {
      console.error('Error in fetchDashboardData:', err)
      
      // Enhanced error handling
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
  }, [userId, cacheKey, testConnection])

  // Refetch function for manual refresh
  const refetch = useCallback(async () => {
    // Clear cache for fresh data
    if (cacheKey) cache.delete(cacheKey)
    cache.delete('connection-test')
    await fetchDashboardData()
  }, [cacheKey, fetchDashboardData])

  // Effect to fetch data when userId changes
  useEffect(() => {
    if (userId) {
      fetchDashboardData()
    }
  }, [userId, fetchDashboardData])

  return {
    students,
    dashboardStats,
    loading,
    error,
    connectionError,
    refetch
  }
}