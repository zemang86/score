import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, fetchUserProfile } from '../lib/supabase'
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserWithAdminStatus | null>(null)
  const [subscriptionPlan, setSubscriptionPlan] = useState<'free' | 'premium' | null>(null)
  const [maxStudents, setMaxStudents] = useState<number>(1)
  const [dailyExamLimit, setDailyExamLimit] = useState<number>(1)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)
  
  // Timeout management
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasTimedOutRef = useRef<boolean>(false)

  const clearLoadingTimeout = () => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
      loadingTimeoutRef.current = null
    }
  }

  const startLoadingTimeout = () => {
    clearLoadingTimeout()
    hasTimedOutRef.current = false
    
    // Set 10-minute timeout (600,000 milliseconds)
    loadingTimeoutRef.current = setTimeout(async () => {
      console.log('⏰ AuthContext: Loading timeout reached (10 minutes), auto-logging out...')
      hasTimedOutRef.current = true
      
      try {
        // Force sign out due to timeout
        await signOut()
        console.log('✅ AuthContext: Auto-logout completed due to timeout')
      } catch (error) {
        console.error('❌ AuthContext: Error during timeout logout:', error)
        // Force clear state even if signOut fails
        setUser(null)
        setSession(null)
        setProfile(null)
        setSubscriptionPlan(null)
        setMaxStudents(1)
        setDailyExamLimit(1)
        setIsAdmin(false)
        setLoading(false)
      }
    }, 600000) // 10 minutes
    
    console.log('⏰ AuthContext: Started 10-minute loading timeout')
  }

  const getUserProfile = async (userId: string): Promise<void> => {
    console.log('🔄 AuthContext: getUserProfile called for:', userId)
    
    try {
      console.log('📡 AuthContext: About to call fetchUserProfile...')
      const userProfile = await fetchUserProfile(userId)
      console.log('✅ AuthContext: Profile fetched from fetchUserProfile:', JSON.stringify(userProfile, null, 2))
      
      if (userProfile) {
        console.log('📝 AuthContext: Setting profile state with:', {
          subscription_plan: userProfile.subscription_plan,
          max_students: userProfile.max_students,
          daily_exam_limit: userProfile.daily_exam_limit,
          isAdmin: userProfile.isAdmin
        })
        
        setProfile(userProfile)
        setSubscriptionPlan(userProfile.subscription_plan)
        setMaxStudents(userProfile.max_students)
        setDailyExamLimit(userProfile.daily_exam_limit)
        setIsAdmin(userProfile.isAdmin)
        
        console.log('✅ AuthContext: State updated. Current values:', {
          subscriptionPlan: userProfile.subscription_plan,
          maxStudents: userProfile.max_students,
          dailyExamLimit: userProfile.daily_exam_limit,
          isAdmin: userProfile.isAdmin
        })
      } else {
        console.log('⚠️ AuthContext: No profile found, setting defaults')
        setProfile(null)
        setSubscriptionPlan('premium') // Default to premium as requested
        setMaxStudents(3)
        setDailyExamLimit(999)
        setIsAdmin(false)
        
        console.log('✅ AuthContext: Default values set:', {
          subscriptionPlan: 'premium',
          maxStudents: 3,
          dailyExamLimit: 999,
          isAdmin: false
        })
      }
    } catch (error) {
      console.error('❌ AuthContext: Error in getUserProfile:', error)
      // Set defaults on error
      setProfile(null)
      setSubscriptionPlan('premium')
      setMaxStudents(3)
      setDailyExamLimit(999)
      setIsAdmin(false)
      
      console.log('✅ AuthContext: Error fallback values set:', {
        subscriptionPlan: 'premium',
        maxStudents: 3,
        dailyExamLimit: 999,
        isAdmin: false
      })
    }
  }

  const refreshUserProfile = async () => {
    console.log('🔄 AuthContext: refreshUserProfile called')
    if (user) {
      console.log('🔄 AuthContext: Refreshing profile for user:', user.id)
      await getUserProfile(user.id)
    } else {
      console.log('🔄 AuthContext: No user, clearing profile')
      setProfile(null)
      setSubscriptionPlan(null)
      setMaxStudents(1)
      setDailyExamLimit(1)
      setIsAdmin(false)
    }
  }

  useEffect(() => {
    console.log('🚀 AuthContext: useEffect started - setting up auth listener')
    
    // Start the loading timeout
    startLoadingTimeout()
    
    // Get initial session
    const getInitialSession = async () => {
      console.log('🔍 AuthContext: Getting initial session...')
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ AuthContext: Error getting initial session:', error)
          return
        }
        
        console.log('📡 AuthContext: Initial session retrieved:', session ? 'Session exists' : 'No session')
        
        if (session?.user) {
          console.log('👤 AuthContext: Initial session - User found, setting state and fetching profile')
          setSession(session)
          setUser(session.user)
          await getUserProfile(session.user.id)
        } else {
          console.log('👤 AuthContext: Initial session - No user found, clearing state')
          setSession(null)
          setUser(null)
          setProfile(null)
          setSubscriptionPlan(null)
          setMaxStudents(1)
          setDailyExamLimit(1)
          setIsAdmin(false)
        }
      } catch (error) {
        console.error('❌ AuthContext: Error in getInitialSession:', error)
      } finally {
        // Clear timeout and set loading to false only if we haven't timed out
        if (!hasTimedOutRef.current) {
          clearLoadingTimeout()
          console.log('✅ AuthContext: Initial session processing complete, setting loading to false')
          setLoading(false)
        }
      }
    }

    // Set up auth state change listener
    console.log('👂 AuthContext: Setting up auth state change listener')
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 AuthContext: Auth state changed:', event, session ? 'Session exists' : 'No session')
      
      // Skip processing if this is the initial session event
      // as it's already handled by getInitialSession
      if (event === 'INITIAL_SESSION') {
        console.log('🔄 AuthContext: Skipping INITIAL_SESSION event - handled by getInitialSession')
        return
      }
      
      // Skip processing if we've already timed out
      if (hasTimedOutRef.current) {
        console.log('🔄 AuthContext: Skipping auth state change - already timed out')
        return
      }
      
      try {
        setSession(session)
        
        if (session?.user) {
          console.log('👤 AuthContext: Auth change - User found, setting state and fetching profile')
          setUser(session.user)
          await getUserProfile(session.user.id)
        } else {
          console.log('👤 AuthContext: Auth change - No user found, clearing state')
          setUser(null)
          setProfile(null)
          setSubscriptionPlan(null)
          setMaxStudents(1)
          setDailyExamLimit(1)
          setIsAdmin(false)
        }
      } catch (error) {
        console.error('❌ AuthContext: Error processing auth state change:', error)
        setProfile(null)
        setSubscriptionPlan(null)
        setMaxStudents(1)
        setDailyExamLimit(1)
        setIsAdmin(false)
      } finally {
        // Always ensure loading is false after processing auth changes (if not timed out)
        if (!hasTimedOutRef.current) {
          clearLoadingTimeout()
          console.log('✅ AuthContext: Auth state change processed, ensuring loading is false')
          setLoading(false)
        }
      }
    })

    // Get initial session
    getInitialSession()

    return () => {
      console.log('🧹 AuthContext: Cleaning up auth listener and timeout')
      subscription.unsubscribe()
      clearLoadingTimeout()
    }
  }, []) // Empty dependency array - listener should only be set up once

  const signUp = async (email: string, password: string, fullName: string) => {
    console.log('📝 AuthContext: signUp called for:', email)
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (!error && data.user) {
      console.log('✅ AuthContext: User created, creating profile for:', data.user.id)
      
      // Create user profile in our users table with premium defaults
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            full_name: fullName,
            subscription_plan: 'premium', // Default to premium as requested
            max_students: 3,
            daily_exam_limit: 999,
          },
        ])

      if (profileError) {
        console.error('❌ AuthContext: Error creating user profile:', profileError)
      } else {
        console.log('✅ AuthContext: User profile created successfully')
        setSubscriptionPlan('premium')
        setMaxStudents(3)
        setDailyExamLimit(999)
        setIsAdmin(false) // New users are not admin by default
      }
    } else if (error) {
      console.error('❌ AuthContext: Error during signUp:', error)
    }

    return { error }
  }

  const signIn = async (email: string, password: string) => {
    console.log('🔐 AuthContext: signIn called for:', email)
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      console.error('❌ AuthContext: Error during signIn:', error)
    } else {
      console.log('✅ AuthContext: signIn successful')
    }
    
    return { error }
  }

  const signOut = async () => {
    console.log('🚪 AuthContext: signOut called')
    
    // Clear timeout immediately when signing out
    clearLoadingTimeout()
    
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        // Check for expected errors that are normal during sign-out
        const isExpectedError = 
          (error.message && error.message.includes('Session from session_id claim in JWT does not exist')) ||
          (error.message && error.message.includes('Auth session missing!')) ||
          (error.code && error.code === 'session_not_found')
        
        if (!isExpectedError) {
          console.error('❌ AuthContext: Error during signOut:', error)
        }
        // For expected errors, we don't log anything as they're normal sign-out scenarios
      } else {
        console.log('✅ AuthContext: signOut successful')
      }
    } catch (error) {
      console.error('❌ AuthContext: Unexpected error during signOut:', error)
    }
    
    // Always clear local state regardless of server response
    setProfile(null)
    setSubscriptionPlan(null)
    setMaxStudents(1)
    setDailyExamLimit(1)
    setIsAdmin(false)
    setLoading(false) // Ensure loading is false after sign out
    console.log('✅ AuthContext: Local signOut state cleared')
  }

  const resetPassword = async (email: string) => {
    console.log('🔑 AuthContext: resetPassword called for:', email)
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    
    if (error) {
      console.error('❌ AuthContext: Error during resetPassword:', error)
    } else {
      console.log('✅ AuthContext: resetPassword email sent')
    }
    
    return { error }
  }

  const value = {
    user,
    session,
    profile,
    subscriptionPlan,
    maxStudents,
    dailyExamLimit,
    isAdmin,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    refreshUserProfile,
  }

  console.log('🔍 AuthContext: Current state:', {
    hasUser: !!user,
    userEmail: user?.email,
    userId: user?.id,
    subscriptionPlan,
    maxStudents,
    dailyExamLimit,
    isAdmin,
    loading,
    profileExists: !!profile,
    hasTimeout: !!loadingTimeoutRef.current,
    hasTimedOut: hasTimedOutRef.current
  })

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}