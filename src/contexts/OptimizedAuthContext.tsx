import React, { createContext, useContext, useEffect, useState, useRef, useMemo, useCallback } from 'react'
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

export function OptimizedAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserWithAdminStatus | null>(null)
  const [subscriptionPlan, setSubscriptionPlan] = useState<'free' | 'premium' | null>('free')
  const [maxStudents, setMaxStudents] = useState<number>(1)
  const [dailyExamLimit, setDailyExamLimit] = useState<number>(3)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [isBetaTester, setIsBetaTester] = useState<boolean>(false)
  const [effectiveAccess, setEffectiveAccess] = useState<EffectiveAccess>({
    level: 'free',
    maxStudents: 1,
    dailyExamLimit: 3,
    hasUnlimitedAccess: false,
    hasUnlimitedExams: false,
    hasUnlimitedKids: false
  })
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
      setIsAdmin(cached.profile.isAdmin)
      setIsBetaTester(cached.profile.beta_tester || false)
      
      // Calculate effective access first
      const access = await getEffectiveAccess(cached.profile)
      setEffectiveAccess(access)
      
      // Use effective access values instead of raw database values
      setMaxStudents(access.maxStudents)
      setDailyExamLimit(access.dailyExamLimit)
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
        setIsAdmin(userProfile.isAdmin)
        setIsBetaTester(userProfile.beta_tester || false)
        
        // Calculate effective access first
        console.log('🔄 Calculating effective access for user profile:', userProfile.email)
        const access = await getEffectiveAccess(userProfile)
        console.log('📊 Effective access calculated:', access)
        setEffectiveAccess(access)
        
        // Use effective access values instead of raw database values
        setMaxStudents(access.maxStudents)
        setDailyExamLimit(access.dailyExamLimit)
        console.log('✅ AuthContext updated - dailyExamLimit set to:', access.dailyExamLimit)
      } else {
        setProfile(null)
        setIsBetaTester(false)
        setEffectiveAccess({
          level: 'free',
          maxStudents: 1,
          dailyExamLimit: 3,
          hasUnlimitedAccess: false,
          hasUnlimitedExams: false,
          hasUnlimitedKids: false
        })
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
      setSubscriptionPlan('free')
      setMaxStudents(1)
      setDailyExamLimit(3)
      setIsAdmin(false)
      setIsBetaTester(false)
      setEffectiveAccess({
        level: 'free',
        maxStudents: 1,
        dailyExamLimit: 3,
        hasUnlimitedAccess: false,
        hasUnlimitedExams: false,
        hasUnlimitedKids: false
      })
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
            subscription_plan: 'free',
            max_students: 1,
            daily_exam_limit: 3,
          },
        ])

      if (!profileError) {
        setSubscriptionPlan('free')
        setMaxStudents(1)
        setDailyExamLimit(3)
        setIsAdmin(false)
        setIsBetaTester(false)
        setEffectiveAccess({
          level: 'free',
          maxStudents: 1,
          dailyExamLimit: 3,
          hasUnlimitedAccess: false,
          hasUnlimitedExams: false,
          hasUnlimitedKids: false
        })
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
    setSubscriptionPlan('free')
    setMaxStudents(1)
    setDailyExamLimit(3)
    setIsAdmin(false)
    setIsBetaTester(false)
    setEffectiveAccess({
      level: 'free',
      maxStudents: 1,
      dailyExamLimit: 3,
      hasUnlimitedAccess: false,
      hasUnlimitedExams: false,
      hasUnlimitedKids: false
    })
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
          setSubscriptionPlan('free')
          setMaxStudents(1)
          setDailyExamLimit(3)
          setIsAdmin(false)
          setIsBetaTester(false)
          setEffectiveAccess({
            level: 'free',
            maxStudents: 1,
            dailyExamLimit: 3,
            hasUnlimitedAccess: false,
            hasUnlimitedExams: false,
            hasUnlimitedKids: false
          })
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}