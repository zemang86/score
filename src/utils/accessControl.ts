import { UserWithAdminStatus, AccessLevel, EffectiveAccess } from '../lib/supabase'

export const getUserAccessLevel = (user: UserWithAdminStatus): AccessLevel => {
  if (user.isAdmin) return 'admin'
  if (user.beta_tester) return 'beta_tester'
  return user.subscription_plan
}

export const getEffectiveAccess = (user: UserWithAdminStatus): EffectiveAccess => {
  if (user.beta_tester) {
    return {
      level: 'beta_tester',
      maxStudents: 999999,
      dailyExamLimit: 999,
      hasUnlimitedAccess: true
    }
  }
  
  return {
    level: user.subscription_plan,
    maxStudents: user.max_students,
    dailyExamLimit: user.daily_exam_limit,
    hasUnlimitedAccess: user.subscription_plan === 'premium'
  }
}

export const canAddStudent = (user: UserWithAdminStatus, currentStudentCount: number): boolean => {
  if (user.beta_tester || user.isAdmin) return true
  return currentStudentCount < user.max_students
}

export const canTakeExam = (user: UserWithAdminStatus, dailyExamCount: number): boolean => {
  if (user.beta_tester || user.isAdmin) return true
  if (user.daily_exam_limit === 999) return true
  return dailyExamCount < user.daily_exam_limit
}

export const hasFeatureAccess = (user: UserWithAdminStatus, feature: string): boolean => {
  if (user.isAdmin || user.beta_tester) return true
  
  // Define feature access based on subscription
  const premiumFeatures = ['unlimited_exams', 'advanced_analytics', 'priority_support']
  
  if (premiumFeatures.includes(feature)) {
    return user.subscription_plan === 'premium'
  }
  
  return true // Default to allowing free features
}

export const getAccessBadgeProps = (user: UserWithAdminStatus) => {
  if (user.beta_tester) {
    return {
      text: 'Beta Tester',
      className: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: 'Zap'
    }
  }
  if (user.subscription_plan === 'premium') {
    return {
      text: 'Premium',
      className: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: 'Crown'
    }
  }
  return {
    text: 'Free',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: 'User'
  }
}

// Helper to get effective limits for display purposes
export const getEffectiveLimits = (user: UserWithAdminStatus) => {
  if (user.beta_tester) {
    return {
      studentText: 'Unlimited students (beta)',
      examText: 'Unlimited exams/day (beta)',
      isUnlimited: true
    }
  }
  
  if (user.subscription_plan === 'premium') {
    return {
      studentText: `${user.max_students} students (purchased)`,
      examText: user.daily_exam_limit === 999 ? 'Unlimited exams/day' : `${user.daily_exam_limit} exams/day`,
      isUnlimited: user.daily_exam_limit === 999
    }
  }
  
  return {
    studentText: '1 student (free)',
    examText: '3 exams/day (free)',
    isUnlimited: false
  }
}

// Helper to check if user should see beta features
export const shouldShowBetaFeatures = (user: UserWithAdminStatus): boolean => {
  return user.beta_tester || user.isAdmin
}

// Helper to check if user has exceeded their limits
export const hasExceededLimits = (user: UserWithAdminStatus, currentStudents: number, dailyExams: number) => {
  if (user.beta_tester || user.isAdmin) {
    return {
      studentsExceeded: false,
      examsExceeded: false,
      withinLimits: true
    }
  }
  
  const studentsExceeded = currentStudents > user.max_students
  const examsExceeded = user.daily_exam_limit !== 999 && dailyExams >= user.daily_exam_limit
  
  return {
    studentsExceeded,
    examsExceeded,
    withinLimits: !studentsExceeded && !examsExceeded
  }
}