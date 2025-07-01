import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

console.log('🔧 Supabase Configuration:')
console.log('URL:', supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'Missing')
console.log('Anon Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'Missing')

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Test connection on initialization
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Supabase connection error:', error)
  } else {
    console.log('✅ Supabase connected successfully')
    console.log('Session:', data.session ? 'Active session found' : 'No active session')
  }
}).catch(err => {
  console.error('❌ Failed to test Supabase connection:', err)
})

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
  date_of_birth: string
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
    
    // Add timeout to prevent hanging - 15 seconds
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout')), 15000)
    })
    
    // Fetch user profile and admin status in parallel
    const userPromise = supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
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

      if (userResult.error) {
        console.error('❌ fetchUserProfile: User query error:', userResult.error)
        
        if (userResult.error.code === 'PGRST116') {
          console.log('⚠️ fetchUserProfile: User profile not found')
          return null
        }
        
        return null
      }

      console.log('✅ fetchUserProfile: User data retrieved')

      const isAdmin = !adminResult.error && !!adminResult.data
      
      console.log('✅ fetchUserProfile: Admin check completed, isAdmin:', isAdmin)
      
      const finalProfile = {
        ...userResult.data as User,
        isAdmin
      }
      
      console.log('✅ fetchUserProfile: Final profile object being returned')
      
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
    
    // Add timeout - 15 seconds
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout')), 15000)
    })
    
    const queryPromise = supabase
      .from('admins')
      .select('id')
      .eq('id', userId)
      .maybeSingle()
    
    try {
      const result = await Promise.race([queryPromise, timeoutPromise])
      const { data, error } = result

      console.log('📡 checkIsAdmin: Database query completed')

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

// Test database connection
export const testDatabaseConnection = async (): Promise<{ success: boolean; error?: string }> => {
  console.log('🧪 Testing database connection...')
  
  try {
    // Test basic query
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Database connection test failed:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Database connection test successful')
    return { success: true }
  } catch (error) {
    console.error('❌ Database connection test error:', error)
    return { success: false, error: 'Connection test failed' }
  }
}

// Initialize connection test
testDatabaseConnection().then(result => {
  if (result.success) {
    console.log('🎉 Supabase database is ready!')
  } else {
    console.error('💥 Supabase database connection failed:', result.error)
  }
})