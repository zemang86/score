import React, { createContext, useContext, useEffect, useState } from 'react'
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
    console.log('🚀 AuthContext: useEffect started - setting up auth listener only')
    
    // Listen for auth changes - this handles both initial session and subsequent changes
    console.log('👂 AuthContext: Setting up auth state change listener')
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 AuthContext: Auth state changed:', event, session ? 'Session exists' : 'No session')
      console.log('🔔 AuthContext: Auth change session user:', session?.user ? {
        id: session.user.id,
        email: session.user.email,
        metadata: session.user.user_metadata
      } : 'No user')
      
      try {
        setSession(session)
        setUser(session?.user ?? null)
        
        console.log('📝 AuthContext: Auth change - Set user state to:', session?.user ? {
          id: session.user.id,
          email: session.user.email
        } : 'null')
        
        if (session?.user) {
          console.log('👤 AuthContext: Auth change - User found, fetching profile for:', session.user.id)
          await getUserProfile(session.user.id)
        } else {
          console.log('👤 AuthContext: Auth change - No user found, clearing profile')
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
        console.log('✅ AuthContext: Auth state change processed, setting loading to false')
        setLoading(false)
      }
    })

    return () => {
      console.log('🧹 AuthContext: Cleaning up auth listener')
      subscription.unsubscribe()
    }
  }, [])

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
    subscriptionPlan,
    maxStudents,
    dailyExamLimit,
    isAdmin,
    loading,
    profileExists: !!profile
  })

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}