/**
 * Subscription Enforcement Utilities
 * 
 * Controls access restrictions for free users with multiple students.
 * Contains feature flags for easy rollback of the free user multi-student restrictions.
 */

import { Student } from '../lib/supabase'

// 🚨 FEATURE FLAGS - Change these to rollback quickly
export const SUBSCRIPTION_ENFORCEMENT = {
  // Set to false to disable free user multi-student restrictions (ROLLBACK)
  ENFORCE_FREE_USER_SINGLE_STUDENT: true,
  
  // Set to true to show warning messages instead of hard blocks (SOFT ROLLBACK)
  SOFT_ENFORCEMENT_MODE: false,
  
  // Set to false to disable all subscription-based restrictions (EMERGENCY ROLLBACK)
  ENABLE_ALL_RESTRICTIONS: true
}

/**
 * Determines which students a user can access for exams
 * @param students - Array of students ordered by preference
 * @param hasUnlimitedAccess - Whether user has unlimited access (premium/beta)
 * @returns Array of student IDs that can take exams
 */
export const getAccessibleStudentsForExams = (
  students: Student[], 
  hasUnlimitedAccess: boolean
): string[] => {
  // Emergency rollback - allow all students
  if (!SUBSCRIPTION_ENFORCEMENT.ENABLE_ALL_RESTRICTIONS) {
    return students.map(s => s.id)
  }

  // Feature disabled - allow all students
  if (!SUBSCRIPTION_ENFORCEMENT.ENFORCE_FREE_USER_SINGLE_STUDENT) {
    return students.map(s => s.id)
  }

  // Premium users OR beta testers - allow all students
  if (hasUnlimitedAccess) {
    return students.map(s => s.id)
  }

  // Free users - only allow the FIRST student (oldest by created_at)
  if (students.length === 0) {
    return []
  }

  // Sort by created_at ASC to get the first (oldest) student
  const sortedStudents = [...students].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  // Return only the first student's ID
  return [sortedStudents[0].id]
}

/**
 * Checks if a specific student can take exams
 * @param studentId - The student ID to check
 * @param students - All user's students
 * @param hasUnlimitedAccess - Whether user has unlimited access (premium/beta)
 * @returns Whether this student can take exams
 */
export const canStudentTakeExam = (
  studentId: string,
  students: Student[],
  hasUnlimitedAccess: boolean
): boolean => {
  const accessibleStudentIds = getAccessibleStudentsForExams(students, hasUnlimitedAccess)
  return accessibleStudentIds.includes(studentId)
}

/**
 * Gets the restriction reason for a student
 * @param studentId - The student ID to check
 * @param students - All user's students
 * @param hasUnlimitedAccess - Whether user has unlimited access (premium/beta)
 * @returns Restriction reason or null if accessible
 */
export const getStudentRestrictionReason = (
  studentId: string,
  students: Student[],
  hasUnlimitedAccess: boolean
): string | null => {
  // No restrictions if feature is disabled
  if (!SUBSCRIPTION_ENFORCEMENT.ENABLE_ALL_RESTRICTIONS || 
      !SUBSCRIPTION_ENFORCEMENT.ENFORCE_FREE_USER_SINGLE_STUDENT) {
    return null
  }

  // No restrictions for premium users or beta testers
  if (hasUnlimitedAccess) {
    return null
  }

  // Check if this student is accessible
  if (canStudentTakeExam(studentId, students, hasUnlimitedAccess)) {
    return null
  }

  // This student is restricted
  const firstStudent = [...students]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0]
  
  return `Free plan allows exams for your first child only (${firstStudent?.name}). Upgrade to Premium for unlimited access to all your children.`
}

/**
 * Gets display status for a student card
 * @param studentId - The student ID
 * @param students - All user's students  
 * @param hasUnlimitedAccess - Whether user has unlimited access (premium/beta)
 * @returns Status object with UI indicators
 */
export const getStudentDisplayStatus = (
  studentId: string,
  students: Student[],
  hasUnlimitedAccess: boolean
) => {
  const canTakeExams = canStudentTakeExam(studentId, students, hasUnlimitedAccess)
  const restrictionReason = getStudentRestrictionReason(studentId, students, hasUnlimitedAccess)
  
  const isFirstStudent = students.length > 0 && 
    [...students].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0]?.id === studentId

  return {
    canTakeExams,
    restrictionReason,
    isFirstStudent,
    isRestricted: !canTakeExams && !hasUnlimitedAccess,
    showUpgradePrompt: !canTakeExams && !hasUnlimitedAccess,
    displayMode: SUBSCRIPTION_ENFORCEMENT.SOFT_ENFORCEMENT_MODE ? 'warning' : 'disabled'
  }
}

/**
 * Rollback functions for quick fixes
 */
export const rollbackFunctions = {
  // Complete rollback - disable all restrictions
  disableAllRestrictions: () => {
    console.warn('🚨 ROLLBACK: Disabling all subscription restrictions')
    // In production, this would update a config file or database flag
    return { 
      ENFORCE_FREE_USER_SINGLE_STUDENT: false,
      SOFT_ENFORCEMENT_MODE: false,
      ENABLE_ALL_RESTRICTIONS: false 
    }
  },
  
  // Soft rollback - show warnings instead of blocking
  enableSoftMode: () => {
    console.warn('🚨 SOFT ROLLBACK: Enabling soft enforcement mode')
    return {
      ENFORCE_FREE_USER_SINGLE_STUDENT: true,
      SOFT_ENFORCEMENT_MODE: true,
      ENABLE_ALL_RESTRICTIONS: true
    }
  },
  
  // Partial rollback - disable student restrictions but keep other limits
  disableStudentRestrictions: () => {
    console.warn('🚨 PARTIAL ROLLBACK: Disabling student restrictions only')
    return {
      ENFORCE_FREE_USER_SINGLE_STUDENT: false,
      SOFT_ENFORCEMENT_MODE: false,
      ENABLE_ALL_RESTRICTIONS: true
    }
  }
}

// Export for easy debugging/monitoring
export const getEnforcementStatus = () => ({
  ...SUBSCRIPTION_ENFORCEMENT,
  isActive: SUBSCRIPTION_ENFORCEMENT.ENABLE_ALL_RESTRICTIONS && 
            SUBSCRIPTION_ENFORCEMENT.ENFORCE_FREE_USER_SINGLE_STUDENT,
  mode: SUBSCRIPTION_ENFORCEMENT.SOFT_ENFORCEMENT_MODE ? 'soft' : 'hard'
})