import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  full_name: string
  subscription_plan: 'free' | 'premium'
  max_students: number
  daily_exam_limit: number
  created_at: string
  updated_at: string
}

export interface UserWithAdminStatus extends User {
  isAdmin: boolean
}

export interface Student {
  id: string
  user_id: string
  name: string
  school: string
  level: string
  age: number
  xp: number
  created_at: string
  updated_at: string
}

export interface Question {
  id: string
  level: string
  subject: string
  year: string
  type: 'MCQ' | 'ShortAnswer' | 'Subjective' | 'Matching'
  topic?: string
  question_text: string
  options: string[]
  correct_answer: string
  created_at: string
}

export interface Exam {
  id: string
  student_id: string
  date: string
  mode: 'Easy' | 'Medium' | 'Full'
  subject: string
  question_ids: string[]
  score?: number
  total_questions: number
  completed: boolean
  created_at: string
}

export interface Attempt {
  id: string
  exam_id: string
  question_id: string
  answer_given: string
  is_correct: boolean
  created_at: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  condition_type: string
  condition_value: number
  created_at: string
}

export interface StudentBadge {
  id: string
  student_id: string
  badge_id: string
  earned_at: string
}

export interface Admin {
  id: string
  created_at: string
}

// Helper function to fetch complete user profile including admin status
export const fetchUserProfile = async (userId: string): Promise<UserWithAdminStatus | null> => {
  console.log('🔍 fetchUserProfile: Starting profile fetch for user:', userId)
  
  if (!userId) {
    console.log('❌ fetchUserProfile: No userId provided')
    return null
  }
  
  try {
    console.log('📡 fetchUserProfile: Making database queries')
    
    // Add timeout to prevent hanging - Extended to 5 minutes
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout')), 300000)
    })
    
    // Fetch user profile and admin status in parallel
    const userPromise = supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    // Use maybeSingle() instead of single() for admin check
    // This prevents errors when user is not found in admins table
    const adminPromise = supabase
      .from('admins')
      .select('id')
      .eq('id', userId)
      .maybeSingle()
    
    try {
      const [userResult, adminResult] = await Promise.race([
        Promise.all([userPromise, adminPromise]),
        timeoutPromise
      ])

      console.log('📡 fetchUserProfile: Database queries completed')
      console.log('📊 fetchUserProfile: Raw userResult:', JSON.stringify(userResult, null, 2))
      console.log('📊 fetchUserProfile: Raw adminResult:', JSON.stringify(adminResult, null, 2))

      if (userResult.error) {
        console.error('❌ fetchUserProfile: User query error:', userResult.error)
        
        // If it's a "not found" error, the user might not have a profile yet
        if (userResult.error.code === 'PGRST116') {
          console.log('⚠️ fetchUserProfile: User profile not found')
          return null
        }
        
        return null
      }

      // Log the actual user data retrieved
      console.log('✅ fetchUserProfile: User data retrieved:', {
        id: userResult.data?.id,
        email: userResult.data?.email,
        full_name: userResult.data?.full_name,
        subscription_plan: userResult.data?.subscription_plan,
        max_students: userResult.data?.max_students,
        daily_exam_limit: userResult.data?.daily_exam_limit
      })

      // With maybeSingle(), adminResult.error should be null and adminResult.data should be null if not found
      // Only consider user as admin if data exists and no error occurred
      const isAdmin = !adminResult.error && !!adminResult.data
      
      console.log('✅ fetchUserProfile: Admin check details:', {
        adminError: adminResult.error,
        adminData: adminResult.data,
        isAdmin: isAdmin
      })
      
      const finalProfile = {
        ...userResult.data as User,
        isAdmin
      }
      
      console.log('✅ fetchUserProfile: Final profile object being returned:', JSON.stringify(finalProfile, null, 2))
      
      return finalProfile
    } catch (raceError) {
      if (raceError instanceof Error && raceError.message === 'Query timeout') {
        console.error('❌ fetchUserProfile: Query timed out')
        return null
      }
      throw raceError
    }
  } catch (error) {
    console.error('❌ fetchUserProfile: Unexpected error:', error)
    console.error('❌ fetchUserProfile: Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return null
  }
}

// Helper function to check if user is admin
export const checkIsAdmin = async (userId: string): Promise<boolean> => {
  console.log('🔍 checkIsAdmin: Starting admin check for user:', userId)
  
  if (!userId) {
    console.log('❌ checkIsAdmin: No userId provided')
    return false
  }
  
  try {
    console.log('📡 checkIsAdmin: Making database query to admins table')
    
    // Add timeout to prevent hanging - Extended to 5 minutes
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout')), 300000)
    })
    
    // Use maybeSingle() instead of single() to prevent errors when user is not admin
    const queryPromise = supabase
      .from('admins')
      .select('id')
      .eq('id', userId)
      .maybeSingle()
    
    try {
      const result = await Promise.race([queryPromise, timeoutPromise])
      const { data, error } = result

      console.log('📡 checkIsAdmin: Database query completed')
      console.log('📊 checkIsAdmin: Query result - data:', data)
      console.log('📊 checkIsAdmin: Query result - error:', error)

      // If no error and data exists, user is admin
      const isAdmin = !error && !!data
      console.log('✅ checkIsAdmin: Admin status determined:', isAdmin)
      return isAdmin
    } catch (raceError) {
      if (raceError instanceof Error && raceError.message === 'Query timeout') {
        console.error('❌ checkIsAdmin: Query timed out')
        return false
      }
      throw raceError
    }
  } catch (error) {
    console.error('❌ checkIsAdmin: Unexpected error:', error)
    console.error('❌ checkIsAdmin: Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return false
  }
}

// Helper function to make a user an admin
export const makeUserAdmin = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  console.log('👑 makeUserAdmin: Making user admin:', userId)
  
  if (!userId) {
    return { success: false, error: 'No userId provided' }
  }
  
  try {
    const { error } = await supabase
      .from('admins')
      .insert([{ id: userId }])
    
    if (error) {
      console.error('❌ makeUserAdmin: Error:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ makeUserAdmin: User successfully made admin')
    return { success: true }
  } catch (error) {
    console.error('❌ makeUserAdmin: Unexpected error:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

// Helper function to remove admin status from a user
export const removeUserAdmin = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  console.log('👑 removeUserAdmin: Removing admin status from user:', userId)
  
  if (!userId) {
    return { success: false, error: 'No userId provided' }
  }
  
  try {
    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('id', userId)
    
    if (error) {
      console.error('❌ removeUserAdmin: Error:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ removeUserAdmin: Admin status successfully removed')
    return { success: true }
  } catch (error) {
    console.error('❌ removeUserAdmin: Unexpected error:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}