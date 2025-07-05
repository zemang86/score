import { BadgeEvaluator } from './badgeEvaluator'
import { supabase } from '../lib/supabase'

// Test utilities for badge system debugging
export class BadgeTestUtils {
  
  // Test badge evaluation for a specific student
  static async testBadgeEvaluation(studentId: string) {
    console.log(`🧪 Testing badge evaluation for student: ${studentId}`)
    
    try {
      const result = await BadgeEvaluator.evaluateAndAwardBadges(studentId)
      console.log(`✅ Test complete. Results:`, {
        newBadges: result.newBadges.map(b => ({ name: b.name, condition: `${b.condition_type}: ${b.condition_value}` })),
        totalBadges: result.allEarnedBadges.length
      })
      return result
    } catch (error) {
      console.error(`❌ Test failed:`, error)
      return null
    }
  }

  // Get all students for testing
  static async getAllStudents() {
    try {
      const { data: students, error } = await supabase
        .from('students')
        .select('id, name, level, xp')
        .order('name')

      if (error) throw error

      console.log(`👥 Found ${students?.length || 0} students:`)
      students?.forEach((s: any) => {
        console.log(`  - ${s.name} (${s.level}) - ${s.xp} XP - ID: ${s.id}`)
      })

      return students || []
    } catch (error) {
      console.error(`❌ Error fetching students:`, error)
      return []
    }
  }

  // Check badge system health
  static async checkBadgeSystemHealth() {
    console.log(`🏥 Checking badge system health...`)
    
    try {
      // Check if badges exist
      const { data: badges, error: badgesError } = await supabase
        .from('badges')
        .select('id, name, condition_type, condition_value')
        .order('name')

      if (badgesError) throw badgesError

      console.log(`📋 Available badges (${badges?.length || 0}):`)
      badges?.forEach((b: any) => {
        console.log(`  - ${b.name} (${b.condition_type}: ${b.condition_value})`)
      })

      // Check student badges
      const { data: studentBadges, error: studentBadgesError } = await supabase
        .from('student_badges')
        .select('id, student_id, badge_id, earned_at')

      if (studentBadgesError) throw studentBadgesError

      console.log(`🎖️ Total student badges awarded: ${studentBadges?.length || 0}`)

      return {
        totalBadges: badges?.length || 0,
        totalStudentBadges: studentBadges?.length || 0,
        badges: badges || [],
        healthy: true
      }
    } catch (error) {
      console.error(`❌ Badge system health check failed:`, error)
      return {
        totalBadges: 0,
        totalStudentBadges: 0,
        badges: [],
        healthy: false,
        error
      }
    }
  }

  // Force create a test badge
  static async createTestBadge() {
    console.log(`🧪 Creating test badge...`)
    
    try {
      const { data, error } = await supabase
        .from('badges')
        .insert([
          {
            name: 'Test Badge',
            description: 'A test badge for debugging',
            icon: '🧪',
            condition_type: 'first_exam',
            condition_value: 1
          }
        ])
        .select()

      if (error) {
        if (error.code === '23505') {
          console.log(`ℹ️ Test badge already exists`)
          return { exists: true }
        }
        throw error
      }

      console.log(`✅ Test badge created:`, data)
      return data
    } catch (error) {
      console.error(`❌ Failed to create test badge:`, error)
      return null
    }
  }

  // Manual badge award (for testing)
  static async manualAwardBadge(studentId: string, badgeId: string) {
    console.log(`🎯 Manually awarding badge ${badgeId} to student ${studentId}`)
    
    try {
      const { data, error } = await supabase
        .from('student_badges')
        .insert([
          {
            student_id: studentId,
            badge_id: badgeId,
            earned_at: new Date().toISOString()
          }
        ])
        .select()

      if (error) {
        if (error.code === '23505') {
          console.log(`ℹ️ Badge already awarded to this student`)
          return { alreadyAwarded: true }
        }
        throw error
      }

      console.log(`✅ Badge manually awarded:`, data)
      return data
    } catch (error) {
      console.error(`❌ Failed to award badge:`, error)
      return null
    }
  }
}

// Make available globally for console testing
declare global {
  interface Window {
    BadgeTestUtils: typeof BadgeTestUtils
  }
}

if (typeof window !== 'undefined') {
  window.BadgeTestUtils = BadgeTestUtils
}