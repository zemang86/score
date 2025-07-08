import React, { createContext, useContext, useEffect, useState, useRef, useMemo } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, fetchUserProfile, testDatabaseConnection, getEffectiveAccess } from '../lib/supabase'
import type { UserWithAdminStatus, EffectiveAccess } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserWithAdminStatus | null
  subscriptionPlan: 'free' | 'premium' | null
  maxStudents: number
  dailyExamLimit: number
  isAdmin: boolean
  isBetaTester: boolean
  effectiveAccess: EffectiveAccess
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
  const [subscriptionPlan, setSubscriptionPlan] = useState<'free' | 'premium' | null>('free') // Default to free
  const [maxStudents, setMaxStudents] = useState<number>(1) // Default to free limits
  const [dailyExamLimit, setDailyExamLimit] = useState<number>(3) // Default to free limits
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [isBetaTester, setIsBetaTester] = useState<boolean>(false)
  const [effectiveAccess, setEffectiveAccess] = useState<EffectiveAccess>({
    level: 'free',
    maxStudents: 1,
    dailyExamLimit: 3,
    hasUnlimitedAccess: false
  })
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
      console.log('⏰ AuthContext: Auth loading timeout reached (3 seconds), setting loading to false')
      setLoading(false)
    }, 3000) // 3 seconds for auth only
    
    console.log('⏰ AuthContext: Started 3-second auth loading timeout')
  }

  const getUserProfile = async (userId: string): Promise<void> => {
    console.log('🔄 AuthContext: getUserProfile called for:', userId)
    
    // Don't block the UI - set profile loading state
    setProfileLoading(true)
    
    try {
      console.log('📡 AuthContext: About to call fetchUserProfile...')
      
      // Use a shorter timeout for profile fetch
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 8000) // 8 seconds
      })
      
      const profilePromise = fetchUserProfile(userId)
      
      const userProfile = await Promise.race([profilePromise, timeoutPromise])
      console.log('✅ AuthContext: Profile fetched:', userProfile ? 'Profile found' : 'No profile')
      
      if (userProfile) {
        console.log('📝 AuthContext: Setting profile state')
        setProfile(userProfile)
        setSubscriptionPlan(userProfile.subscription_plan)
        setIsAdmin(userProfile.isAdmin)
        setIsBetaTester(userProfile.beta_tester || false)
        
        // Calculate effective access first
        const access = getEffectiveAccess(userProfile)
        setEffectiveAccess(access)
        
        // Use effective access values instead of raw database values
        setMaxStudents(access.maxStudents)
        setDailyExamLimit(access.dailyExamLimit)
      } else {
        console.log('⚠️ AuthContext: No profile found, keeping defaults')
        setProfile(null)
        setIsBetaTester(false)
        setEffectiveAccess({
          level: 'free',
          maxStudents: 1,
          dailyExamLimit: 3,
          hasUnlimitedAccess: false
        })
        // Keep existing free defaults
      }
    } catch (error) {
      console.error('❌ AuthContext: Error in getUserProfile:', error)
      // Keep free defaults on error - don't change existing state
      console.log('✅ AuthContext: Keeping default free values due to profile fetch error')
    } finally {
      setProfileLoading(false)
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
      setSubscriptionPlan('free') // Keep free as default
      setMaxStudents(1)
      setDailyExamLimit(3)
      setIsAdmin(false)
      setIsBetaTester(false)
      setEffectiveAccess({
        level: 'free',
        maxStudents: 1,
        dailyExamLimit: 3,
        hasUnlimitedAccess: false
      })
    }
  }

  useEffect(() => {
    console.log('🚀 AuthContext: useEffect started - setting up auth listener')
    
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
      console.log('🔍 AuthContext: Getting initial session...')
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ AuthContext: Error getting initial session:', error)
          setLoading(false)
          return
        }
        
        console.log('📡 AuthContext: Initial session retrieved:', session ? 'Session exists' : 'No session')
        
        if (session?.user) {
          console.log('👤 AuthContext: Initial session - User found, setting state')
          setSession(session)
          setUser(session.user)
          
          // Load profile in background - don't block UI
          getUserProfile(session.user.id).catch(error => {
            console.error('❌ AuthContext: Background profile fetch failed:', error)
          })
        } else {
          console.log('👤 AuthContext: Initial session - No user found, clearing state')
          setSession(null)
          setUser(null)
          setProfile(null)
          setSubscriptionPlan('free') // Keep free as default for new users
          setMaxStudents(1)
          setDailyExamLimit(3)
          setIsAdmin(false)
          setIsBetaTester(false)
          setEffectiveAccess({
            level: 'free',
            maxStudents: 1,
            dailyExamLimit: 3,
            hasUnlimitedAccess: false
          })
        }
      } catch (error) {
        console.error('❌ AuthContext: Error in getInitialSession:', error)
      } finally {
        clearLoadingTimeout()
        console.log('✅ AuthContext: Initial session processing complete, setting loading to false')
        setLoading(false)
      }
    }

    // Set up auth state change listener
    console.log('👂 AuthContext: Setting up auth state change listener')
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 AuthContext: Auth state changed:', event, session ? 'Session exists' : 'No session')
      
      // Skip processing if this is the initial session event
      if (event === 'INITIAL_SESSION') {
        console.log('🔄 AuthContext: Skipping INITIAL_SESSION event - handled by getInitialSession')
        return
      }
      
      try {
        setSession(session)
        
        if (session?.user) {
          console.log('👤 AuthContext: Auth change - User found')
          
          // Only update user state if the user ID actually changed
          if (!user || user.id !== session.user.id) {
            console.log('👤 AuthContext: User ID changed or new user, updating state')
            setUser(session.user)
            
            // Load profile in background - don't block UI
            getUserProfile(session.user.id).catch(error => {
              console.error('❌ AuthContext: Background profile fetch failed during auth change:', error)
            })
          } else {
            console.log('👤 AuthContext: Same user ID, skipping user state update')
          }
        } else {
          console.log('👤 AuthContext: Auth change - No user found, clearing state')
          
          // Check if this is an implicit session invalidation (e.g., failed token refresh)
          if (event !== 'SIGNED_OUT' && event !== 'INITIAL_SESSION') {
            console.log('🔄 AuthContext: Implicit session invalidation detected, forcing clean logout')
            // Force a clean logout to clear all local session data
            await signOut()
            return
          }
          
          setUser(null)
          setProfile(null)
          setSubscriptionPlan('free') // Keep free as default
          setMaxStudents(1)
          setDailyExamLimit(3)
          setIsAdmin(false)
          setIsBetaTester(false)
          setEffectiveAccess({
            level: 'free',
            maxStudents: 1,
            dailyExamLimit: 3,
            hasUnlimitedAccess: false
          })
        }
      } catch (error) {
        console.error('❌ AuthContext: Error processing auth state change:', error)
      } finally {
        clearLoadingTimeout()
        console.log('✅ AuthContext: Auth state change processed, setting loading to false')
        setLoading(false)
      }
    })

    // Get initial session
    getInitialSession()

    return () => {
      console.log('🧹 AuthContext: Cleaning up auth listener and timeout')
      subscription.unsubscribe()
      clearLoadingTimeout()
    }
  }, []) // Empty dependency array

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
      
      // Create user profile in our users table with free defaults
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            full_name: fullName,
            subscription_plan: 'free',
            max_students: 1,
            daily_exam_limit: 3,
            beta_tester: false,
          },
        ])

      if (profileError) {
        console.error('❌ AuthContext: Error creating user profile:', profileError)
      } else {
        console.log('✅ AuthContext: User profile created successfully')
        setSubscriptionPlan('free')
        setMaxStudents(1)
        setDailyExamLimit(3)
        setIsAdmin(false)
        setIsBetaTester(false)
        setEffectiveAccess({
          level: 'free',
          maxStudents: 1,
          dailyExamLimit: 3,
          hasUnlimitedAccess: false
        })
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
        console.log('✅ AuthContext: signOut successful')
      }
    } catch (error) {
      console.error('❌ AuthContext: Unexpected error during signOut:', error)
    }
    
    // Always clear local state
    setProfile(null)
    setSubscriptionPlan('free') // Keep free as default
    setMaxStudents(1)
    setDailyExamLimit(3)
    setIsAdmin(false)
    setIsBetaTester(false)
    setEffectiveAccess({
      level: 'free',
      maxStudents: 1,
      dailyExamLimit: 3,
      hasUnlimitedAccess: false
    })
    setLoading(false)
    setProfileLoading(false)
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

  const value = useMemo(() => ({
    user,
    session,
    profile,
    subscriptionPlan,
    maxStudents,
    dailyExamLimit,
    isAdmin,
    isBetaTester,
    effectiveAccess,
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
    isBetaTester,
    effectiveAccess,
    loading,
    profileLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    refreshUserProfile,
  ])

  console.log('🔍 AuthContext: Current state:', {
    hasUser: !!user,
    userEmail: user?.email,
    userId: user?.id,
    subscriptionPlan,
    maxStudents,
    dailyExamLimit,
    isAdmin,
    isBetaTester,
    effectiveAccess,
    loading,
    profileLoading,
    profileExists: !!profile
  })

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}