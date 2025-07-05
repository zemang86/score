import { supabase } from '../lib/supabase'

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
  badge: Badge
}

export interface BadgeEvaluationResult {
  newBadges: Badge[]
  allEarnedBadges: StudentBadge[]
}

export class BadgeEvaluator {
  private static badgeCache: { badges: Badge[], timestamp: number } | null = null
  private static readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  private static async getAllBadges(): Promise<Badge[]> {
    // Use cache if available and not expired
    if (this.badgeCache && Date.now() - this.badgeCache.timestamp < this.CACHE_DURATION) {
      console.log('🔄 Using cached badges:', this.badgeCache.badges.length)
      return this.badgeCache.badges
    }
    
    console.log('🔍 Fetching badges from database...')
    const { data: badges, error } = await supabase
      .from('badges')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('❌ Error fetching badges:', error)
      return []
    }

    const badgeList = badges || []
    console.log(`📊 Found ${badgeList.length} badges in database`)
    
    // Update cache
    this.badgeCache = {
      badges: badgeList,
      timestamp: Date.now()
    }

    return badgeList
  }

  private static async getStudentBadges(studentId: string): Promise<StudentBadge[]> {
    const { data: studentBadges, error } = await supabase
      .from('student_badges')
      .select(`
        id,
        student_id,
        badge_id,
        earned_at,
        badges (
          id,
          name,
          description,
          icon,
          condition_type,
          condition_value,
          created_at
        )
      `)
      .eq('student_id', studentId)
      .order('earned_at', { ascending: false })

    if (error) {
      console.error('Error fetching student badges:', error)
      return []
    }

    return studentBadges?.map((sb: any) => ({
      id: sb.id,
      student_id: sb.student_id,
      badge_id: sb.badge_id,
      earned_at: sb.earned_at,
      badge: sb.badges as Badge
    })) || []
  }

  public static async getStudentStats(studentId: string) {
    // Get student basic info
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single()

    if (studentError) {
      console.error('Error fetching student:', studentError)
      return null
    }

    // Get completed exams
    const { data: exams, error: examsError } = await supabase
      .from('exams')
      .select('*')
      .eq('student_id', studentId)
      .eq('completed', true)
      .order('created_at', { ascending: true })

    if (examsError) {
      console.error('Error fetching exams:', examsError)
      return null
    }

    // Calculate statistics
    const totalExams = exams?.length || 0
    const perfectScores = exams?.filter((e: any) => e.score === 100).length || 0
    const totalXP = student.xp || 0
    const bestScore = exams && exams.length > 0 ? Math.max(...exams.map((e: any) => e.score || 0)) : 0
    
    // Calculate subject mastery - check if student has completed required exams in ANY subject
    const subjectCounts = new Map<string, number>()
    exams?.forEach((exam: any) => {
      const count = subjectCounts.get(exam.subject) || 0
      subjectCounts.set(exam.subject, count + 1)
    })
    
    // Get the highest count of exams in any single subject
    const maxExamsInAnySubject = Array.from(subjectCounts.values()).length > 0 
      ? Math.max(...Array.from(subjectCounts.values()))
      : 0

    // Calculate streak days (consecutive days with at least 1 exam)
    let currentStreak = 0
    let maxStreak = 0
    
    if (exams && exams.length > 0) {
      const examDates = exams.map((e: any) => new Date(e.date as string).toDateString())
      const uniqueDates = [...new Set(examDates)].sort()
      
      for (let i = 0; i < uniqueDates.length; i++) {
        const currentDate = new Date(uniqueDates[i])
        const prevDate = i > 0 ? new Date(uniqueDates[i - 1]) : null
        
        if (prevDate && (currentDate.getTime() - prevDate.getTime()) === 24 * 60 * 60 * 1000) {
          currentStreak++
        } else {
          currentStreak = 1
        }
        
        maxStreak = Math.max(maxStreak, currentStreak)
      }
    }

    return {
      student,
      totalExams,
      perfectScores,
      totalXP,
      bestScore,
      maxExamsInAnySubject,
      maxStreakDays: maxStreak,
      hasCompletedFirstExam: totalExams > 0
    }
  }

  public static checkBadgeCondition(badge: Badge, stats: any): boolean {
    switch (badge.condition_type) {
      case 'first_exam':
        return stats.hasCompletedFirstExam

      case 'exams_completed':
        return stats.totalExams >= badge.condition_value

      case 'perfect_score':
        return stats.perfectScores >= badge.condition_value

      case 'streak_days':
        return stats.maxStreakDays >= badge.condition_value

      case 'xp_earned':
        return stats.totalXP >= badge.condition_value

      case 'subject_mastery':
        return stats.maxExamsInAnySubject >= badge.condition_value

      case 'score_range':
        return stats.bestScore >= badge.condition_value

      default:
        console.warn(`Unknown badge condition type: ${badge.condition_type}`)
        return false
    }
  }

  private static async awardBadge(studentId: string, badgeId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('student_badges')
        .insert([
          {
            student_id: studentId,
            badge_id: badgeId,
            earned_at: new Date().toISOString()
          }
        ])

      if (error) {
        // Check if it's a duplicate key error (badge already earned)
        if (error.code === '23505') {
          console.log(`Badge ${badgeId} already earned by student ${studentId}`)
          return false
        }
        throw error
      }

      return true
    } catch (error) {
      console.error('Error awarding badge:', error)
      return false
    }
  }

  public static async evaluateAndAwardBadges(studentId: string): Promise<BadgeEvaluationResult> {
    try {
      console.log(`🏆 Starting badge evaluation for student: ${studentId}`)
      
      // Get all available badges (cache this in production)
      const allBadges = await this.getAllBadges()
      console.log(`📋 Available badges: ${allBadges.length}`)
      
      if (allBadges.length === 0) {
        console.warn('⚠️ No badges available in database')
        return { newBadges: [], allEarnedBadges: [] }
      }
      
      // Get student's current badges
      const currentBadges = await this.getStudentBadges(studentId)
      const earnedBadgeIds = new Set(currentBadges.map(sb => sb.badge_id))
      console.log(`🎯 Student has ${currentBadges.length} existing badges`)
      
      // Get student statistics
      const stats = await this.getStudentStats(studentId)
      if (!stats) {
        console.error(`❌ Could not get student stats for ${studentId}`)
        return { newBadges: [], allEarnedBadges: currentBadges }
      }
      
      console.log(`📊 Student stats:`, {
        totalExams: stats.totalExams,
        perfectScores: stats.perfectScores,
        totalXP: stats.totalXP,
        hasCompletedFirstExam: stats.hasCompletedFirstExam,
        maxExamsInAnySubject: stats.maxExamsInAnySubject
      })

      // Check each badge condition
      const newBadges: Badge[] = []
      
      for (const badge of allBadges) {
        // Skip if already earned
        if (earnedBadgeIds.has(badge.id)) {
          console.log(`⏭️ Badge "${badge.name}" already earned, skipping`)
          continue
        }

        // Check if condition is met
        const conditionMet = this.checkBadgeCondition(badge, stats)
        console.log(`🔍 Badge "${badge.name}" (${badge.condition_type}: ${badge.condition_value}): ${conditionMet ? '✅ ELIGIBLE' : '❌ NOT ELIGIBLE'}`)
        
        if (conditionMet) {
          // Award the badge
          const awarded = await this.awardBadge(studentId, badge.id)
          if (awarded) {
            newBadges.push(badge)
            console.log(`🎉 Successfully awarded badge: "${badge.name}"`)
          } else {
            console.warn(`⚠️ Failed to award badge: "${badge.name}"`)
          }
        }
      }

      console.log(`🏅 Badge evaluation complete: ${newBadges.length} new badges awarded`)

      // Get fresh badge data to ensure consistency
      const updatedBadges = await this.getStudentBadges(studentId)

      return {
        newBadges,
        allEarnedBadges: updatedBadges
      }

    } catch (error) {
      console.error('❌ Error evaluating badges:', error)
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        name: error instanceof Error ? error.name : 'Unknown error type'
      })
      return { newBadges: [], allEarnedBadges: [] }
    }
  }

  // Helper method to get display-friendly badges for UI animations
  public static getBadgeDisplayInfo(badges: Badge[]): Array<{name: string, icon: string, color: string}> {
    return badges.map(badge => ({
      name: badge.name,
      icon: badge.icon,
      color: this.getBadgeColor(badge.condition_type)
    }))
  }

  private static getBadgeColor(conditionType: string): string {
    switch (conditionType) {
      case 'first_exam':
        return 'bg-gradient-to-r from-green-400 to-emerald-400'
      case 'perfect_score':
        return 'bg-gradient-to-r from-yellow-400 to-orange-400'
      case 'score_range':
        return 'bg-gradient-to-r from-purple-400 to-pink-400'
      case 'exams_completed':
        return 'bg-gradient-to-r from-blue-400 to-cyan-400'
      case 'streak_days':
        return 'bg-gradient-to-r from-red-400 to-pink-400'
      case 'xp_earned':
        return 'bg-gradient-to-r from-purple-400 to-indigo-400'
      case 'subject_mastery':
        return 'bg-gradient-to-r from-amber-400 to-yellow-400'
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500'
    }
  }

}

// Minimal debug function for troubleshooting (production)
// @ts-ignore
window.debugBadgeIssue = async () => {
  const studentId = localStorage.getItem('student_id') || sessionStorage.getItem('student_id')
  if (!studentId) return console.log('No student ID found')
  
  const result = await BadgeEvaluator.evaluateAndAwardBadges(studentId)
  console.log(`Badge check: ${result.newBadges.length} new, ${result.allEarnedBadges.length} total`)
  if (result.allEarnedBadges.length > 0) {
    console.log('Current badges:', result.allEarnedBadges.map(b => b.badge.name))
    console.log('Badge order (newest first):')
    result.allEarnedBadges.forEach((sb, index) => {
      console.log(`  ${index + 1}. ${sb.badge.name} - earned: ${sb.earned_at}`)
    })
  }
}