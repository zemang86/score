import React, { createContext, useContext, useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, fetchUserProfile, testDatabaseConnection } from '../lib/supabase'
import type { UserWithAdminStatus } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserWithAdminStatus | null
  subscriptionPlan: 'free' | 'premium' | null
  maxStudents: number
  dailyExamLimit: number
  isAdmin: boolean
  loading: boolean
  profileLoading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
  refreshUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function OptimizedAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserWithAdminStatus | null>(null)
  const [subscriptionPlan, setSubscriptionPlan] = useState<'free' | 'premium' | null>('premium')
  const [maxStudents, setMaxStudents] = useState<number>(3)
  const [dailyExamLimit, setDailyExamLimit] = useState<number>(999)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const profileCache = useRef<Map<string, { profile: UserWithAdminStatus; timestamp: number }>>(new Map())

  // Memoized helper functions
  const clearLoadingTimeout = useCallback(() => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
      loadingTimeoutRef.current = null
    }
  }, [])

  const startLoadingTimeout = useCallback(() => {
    clearLoadingTimeout()
    loadingTimeoutRef.current = setTimeout(() => {
      console.log('⏰ AuthContext: Auth loading timeout reached (3 seconds)')
      setLoading(false)
    }, 3000)
  }, [clearLoadingTimeout])

  // Optimized profile fetching with caching
  const getUserProfile = useCallback(async (userId: string): Promise<void> => {
    console.log('🔄 OptimizedAuthContext: getUserProfile called for:', userId)
    
    // Check cache first (cache for 5 minutes)
    const cached = profileCache.current.get(userId)
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      console.log('✅ Using cached profile for user:', userId)
      setProfile(cached.profile)
      setSubscriptionPlan(cached.profile.subscription_plan)
      setMaxStudents(cached.profile.max_students)
      setDailyExamLimit(cached.profile.daily_exam_limit)
      setIsAdmin(cached.profile.isAdmin)
      return
    }

    setProfileLoading(true)
    
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 8000)
      })
      
      const profilePromise = fetchUserProfile(userId)
      const userProfile = await Promise.race([profilePromise, timeoutPromise])
      
      if (userProfile) {
        // Cache the profile
        profileCache.current.set(userId, {
          profile: userProfile,
          timestamp: Date.now()
        })

        setProfile(userProfile)
        setSubscriptionPlan(userProfile.subscription_plan)
        setMaxStudents(userProfile.max_students)
        setDailyExamLimit(userProfile.daily_exam_limit)
        setIsAdmin(userProfile.isAdmin)
      } else {
        setProfile(null)
      }
    } catch (error) {
      console.error('❌ OptimizedAuthContext: Error in getUserProfile:', error)
    } finally {
      setProfileLoading(false)
    }
  }, [])

  const refreshUserProfile = useCallback(async () => {
    if (user) {
      // Clear cache for this user
      profileCache.current.delete(user.id)
      await getUserProfile(user.id)
    } else {
      setProfile(null)
      setSubscriptionPlan('premium')
      setMaxStudents(3)
      setDailyExamLimit(999)
      setIsAdmin(false)
    }
  }, [user, getUserProfile])

  // Memoized auth functions
  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    console.log('📝 OptimizedAuthContext: signUp called for:', email)
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })

    if (!error && data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            full_name: fullName,
            subscription_plan: 'premium',
            max_students: 3,
            daily_exam_limit: 999,
          },
        ])

      if (!profileError) {
        setSubscriptionPlan('premium')
        setMaxStudents(3)
        setDailyExamLimit(999)
        setIsAdmin(false)
      }
    }

    return { error }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    console.log('🔐 OptimizedAuthContext: signIn called for:', email)
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    return { error }
  }, [])

  const signOut = useCallback(async () => {
    console.log('🚪 OptimizedAuthContext: signOut called')
    
    clearLoadingTimeout()
    
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        const isExpectedError = 
          (error.message && error.message.includes('Session from session_id claim in JWT does not exist')) ||
          (error.message && error.message.includes('Auth session missing!')) ||
          (error.code && error.code === 'session_not_found')
        
        if (!isExpectedError) {
          console.error('❌ OptimizedAuthContext: Error during signOut:', error)
        }
      }
    } catch (error) {
      console.error('❌ OptimizedAuthContext: Unexpected error during signOut:', error)
    }
    
    // Clear cache
    profileCache.current.clear()
    
    // Reset state
    setProfile(null)
    setSubscriptionPlan('premium')
    setMaxStudents(3)
    setDailyExamLimit(999)
    setIsAdmin(false)
    setLoading(false)
    setProfileLoading(false)
  }, [clearLoadingTimeout])

  const resetPassword = useCallback(async (email: string) => {
    console.log('🔑 OptimizedAuthContext: resetPassword called for:', email)
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    return { error }
  }, [])

  // Main auth effect
  useEffect(() => {
    console.log('🚀 OptimizedAuthContext: Setting up auth listener')
    
    // Test database connection
    testDatabaseConnection().then(result => {
      if (!result.success) {
        console.error('💥 Database connection failed:', result.error)
      }
    })
    
    startLoadingTimeout()
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ OptimizedAuthContext: Error getting initial session:', error)
          setLoading(false)
          return
        }
        
        if (session?.user) {
          setSession(session)
          setUser(session.user)
          getUserProfile(session.user.id).catch(console.error)
        } else {
          setSession(null)
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error('❌ OptimizedAuthContext: Error in getInitialSession:', error)
      } finally {
        clearLoadingTimeout()
        setLoading(false)
      }
    }

    // Auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 OptimizedAuthContext: Auth state changed:', event)
      
      if (event === 'INITIAL_SESSION') {
        return
      }
      
      try {
        setSession(session)
        
        if (session?.user) {
          if (!user || user.id !== session.user.id) {
            setUser(session.user)
            getUserProfile(session.user.id).catch(console.error)
          }
        } else {
          if (event !== 'SIGNED_OUT' && event !== 'INITIAL_SESSION') {
            await signOut()
            return
          }
          
          setUser(null)
          setProfile(null)
          setSubscriptionPlan('premium')
          setMaxStudents(3)
          setDailyExamLimit(999)
          setIsAdmin(false)
        }
      } catch (error) {
        console.error('❌ OptimizedAuthContext: Error processing auth state change:', error)
      } finally {
        clearLoadingTimeout()
        setLoading(false)
      }
    })

    getInitialSession()

    return () => {
      subscription.unsubscribe()
      clearLoadingTimeout()
      profileCache.current.clear()
    }
  }, []) // Empty dependency array is intentional

  // Memoized context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    session,
    profile,
    subscriptionPlan,
    maxStudents,
    dailyExamLimit,
    isAdmin,
    loading,
    profileLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    refreshUserProfile,
  }), [
    user,
    session,
    profile,
    subscriptionPlan,
    maxStudents,
    dailyExamLimit,
    isAdmin,
    loading,
    profileLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    refreshUserProfile,
  ])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}