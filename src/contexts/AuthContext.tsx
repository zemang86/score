import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserWithAdminStatus | null>(null)
  const [subscriptionPlan, setSubscriptionPlan] = useState<'free' | 'premium' | null>('premium') // Default to premium
  const [maxStudents, setMaxStudents] = useState<number>(3) // Default to premium limits
  const [dailyExamLimit, setDailyExamLimit] = useState<number>(999) // Default to premium limits
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [loading, setLoading] = useState(true) // Auth loading
  const [profileLoading, setProfileLoading] = useState(false) // Separate profile loading state
  
  // Quick timeout for auth check only
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const clearLoadingTimeout = () => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
      loadingTimeoutRef.current = null
    }
  }

  const startLoadingTimeout = () => {
    clearLoadingTimeout()
    
    // Set 3-second timeout for auth check only
    loadingTimeoutRef.current = setTimeout(() => {
      setLoading(false)
    }, 3000) // 3 seconds for auth only
    
  }

  const getUserProfile = async (userId: string): Promise<void> => {
    
    // Don't block the UI - set profile loading state
    setProfileLoading(true)
    
    try {
      
      // Use a shorter timeout for profile fetch
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 8000) // 8 seconds
      })
      
      const profilePromise = fetchUserProfile(userId)
      
      const userProfile = await Promise.race([profilePromise, timeoutPromise])
      
      if (userProfile) {
        setProfile(userProfile)
        setSubscriptionPlan(userProfile.subscription_plan)
        setMaxStudents(userProfile.max_students)
        setDailyExamLimit(userProfile.daily_exam_limit)
        setIsAdmin(userProfile.isAdmin)
      } else {
        setProfile(null)
        // Keep existing premium defaults
      }
    } catch (error) {
      console.error('❌ AuthContext: Error in getUserProfile:', error)
      // Keep defaults on error - don't change existing state
    } finally {
      setProfileLoading(false)
    }
  }

  const refreshUserProfile = async () => {
    if (user) {
      await getUserProfile(user.id)
    } else {
      setProfile(null)
      setSubscriptionPlan('premium') // Keep premium as default
      setMaxStudents(3)
      setDailyExamLimit(999)
      setIsAdmin(false)
    }
  }

  useEffect(() => {
    
    // Test database connection first
    testDatabaseConnection().then(result => {
      if (!result.success) {
        console.error('💥 Database connection failed:', result.error)
      }
    })
    
    // Start the loading timeout for auth only
    startLoadingTimeout()
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ AuthContext: Error getting initial session:', error)
          setLoading(false)
          return
        }
        
        
        if (session?.user) {
          setSession(session)
          setUser(session.user)
          
          // Load profile in background - don't block UI
          getUserProfile(session.user.id).catch(error => {
            console.error('❌ AuthContext: Background profile fetch failed:', error)
          })
        } else {
          setSession(null)
          setUser(null)
          setProfile(null)
          setSubscriptionPlan('premium') // Keep premium as default for new users
          setMaxStudents(3)
          setDailyExamLimit(999)
          setIsAdmin(false)
        }
      } catch (error) {
        console.error('❌ AuthContext: Error in getInitialSession:', error)
      } finally {
        clearLoadingTimeout()
        setLoading(false)
      }
    }

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      
      // Skip processing if this is the initial session event
      if (event === 'INITIAL_SESSION') {
        return
      }
      
      try {
        setSession(session)
        
        if (session?.user) {
          
          // Only update user state if the user ID actually changed
          if (!user || user.id !== session.user.id) {
            setUser(session.user)
            
            // Load profile in background - don't block UI
            getUserProfile(session.user.id).catch(error => {
              console.error('❌ AuthContext: Background profile fetch failed during auth change:', error)
            })
          } else {
          }
        } else {
          
          // Check if this is an implicit session invalidation (e.g., failed token refresh)
          if (event !== 'SIGNED_OUT' && event !== 'INITIAL_SESSION') {
            // Force a clean logout to clear all local session data
            await signOut()
            return
          }
          
          setUser(null)
          setProfile(null)
          setSubscriptionPlan('premium') // Keep premium as default
          setMaxStudents(3)
          setDailyExamLimit(999)
          setIsAdmin(false)
        }
      } catch (error) {
        console.error('❌ AuthContext: Error processing auth state change:', error)
      } finally {
        clearLoadingTimeout()
        setLoading(false)
      }
    })

    // Get initial session
    getInitialSession()

    return () => {
      subscription.unsubscribe()
      clearLoadingTimeout()
    }
  }, []) // Empty dependency array

  const signUp = async (email: string, password: string, fullName: string) => {
    
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
      
      // Create user profile in our users table with premium defaults
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

      if (profileError) {
        console.error('❌ AuthContext: Error creating user profile:', profileError)
      } else {
        setSubscriptionPlan('premium')
        setMaxStudents(3)
        setDailyExamLimit(999)
        setIsAdmin(false)
      }
    } else if (error) {
      console.error('❌ AuthContext: Error during signUp:', error)
    }

    return { error }
  }

  const signIn = async (email: string, password: string) => {
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      console.error('❌ AuthContext: Error during signIn:', error)
    } else {
    }
    
    return { error }
  }

  const signOut = async () => {
    
    clearLoadingTimeout()
    
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        const isExpectedError = 
          (error.message && error.message.includes('Session from session_id claim in JWT does not exist')) ||
          (error.message && error.message.includes('Auth session missing!')) ||
          (error.code && error.code === 'session_not_found')
        
        if (!isExpectedError) {
          console.error('❌ AuthContext: Error during signOut:', error)
        }
      } else {
      }
    } catch (error) {
      console.error('❌ AuthContext: Unexpected error during signOut:', error)
    }
    
    // Always clear local state
    setProfile(null)
    setSubscriptionPlan('premium') // Keep premium as default
    setMaxStudents(3)
    setDailyExamLimit(999)
    setIsAdmin(false)
    setLoading(false)
    setProfileLoading(false)
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    
    if (error) {
      console.error('❌ AuthContext: Error during resetPassword:', error)
    } else {
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
    profileLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    refreshUserProfile,
  }

    hasUser: !!user,
    userEmail: user?.email,
    userId: user?.id,
    subscriptionPlan,
    maxStudents,
    dailyExamLimit,
    isAdmin,
    loading,
    profileLoading,
    profileExists: !!profile
  })

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}