import { useQuery, useQueries } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

// Query functions - these run in PARALLEL instead of sequential
const fetchStudents = async (userId: string) => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

const fetchExams = async (studentIds: string[]) => {
  if (studentIds.length === 0) return []
  
  const { data, error } = await supabase
    .from('exams')
    .select('score, completed, student_id')
    .in('student_id', studentIds)
    .eq('completed', true)

  if (error) throw error
  return data || []
}

const fetchBadges = async (studentIds: string[]) => {
  if (studentIds.length === 0) return []
  
  const { data, error } = await supabase
    .from('student_badges')
    .select('id, student_id')
    .in('student_id', studentIds)

  if (error) throw error
  return data || []
}

const fetchTotalQuestions = async () => {
  const { count, error } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })

  if (error) throw error
  return count || 0
}

// Main hook - uses parallel queries for maximum speed
export function useDashboardData(userId: string | undefined) {
  // Step 1: Fetch students first
  const studentsQuery = useQuery({
    queryKey: ['students', userId],
    queryFn: () => fetchStudents(userId!),
    enabled: !!userId,
  })

  const students = studentsQuery.data || []
  const studentIds = students.map(s => s.id)

  // Step 2: Fetch ALL other data in PARALLEL (not sequential!)
  const parallelQueries = useQueries({
    queries: [
      {
        queryKey: ['exams', studentIds],
        queryFn: () => fetchExams(studentIds),
        enabled: studentIds.length > 0,
      },
      {
        queryKey: ['badges', studentIds],
        queryFn: () => fetchBadges(studentIds),
        enabled: studentIds.length > 0,
      },
      {
        queryKey: ['totalQuestions'],
        queryFn: fetchTotalQuestions,
      },
    ],
  })

  const [examsQuery, badgesQuery, questionsQuery] = parallelQueries

  // Calculate dashboard stats from the parallel query results
  const dashboardStats = {
    totalExams: examsQuery.data?.length || 0,
    totalBadges: badgesQuery.data?.length || 0,
    averageScore: (() => {
      const scores = examsQuery.data?.map(e => e.score).filter(s => s != null) || []
      return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
    })(),
    totalXP: students.reduce((sum, student) => sum + (student.xp || 0), 0),
  }

  return {
    // Data
    students,
    dashboardStats,
    totalQuestions: questionsQuery.data || 0,
    
    // Loading states
    loading: studentsQuery.isLoading,
    statsLoading: parallelQueries.some(q => q.isLoading),
    
    // Error states  
    error: studentsQuery.error?.message || 
           parallelQueries.find(q => q.error)?.error?.message || 
           null,
    
    // Utilities
    refetch: () => {
      studentsQuery.refetch()
      parallelQueries.forEach(q => q.refetch())
    },
  }
}

// Individual query hooks for specific components
export function useStudents(userId: string | undefined) {
  return useQuery({
    queryKey: ['students', userId],
    queryFn: () => fetchStudents(userId!),
    enabled: !!userId,
  })
}

export function useQuestionCount() {
  return useQuery({
    queryKey: ['totalQuestions'],
    queryFn: fetchTotalQuestions,
    staleTime: 10 * 60 * 1000, // Questions don't change often - 10 min cache
  })
}