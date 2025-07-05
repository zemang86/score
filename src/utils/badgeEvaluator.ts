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
  private static async getAllBadges(): Promise<Badge[]> {
    const { data: badges, error } = await supabase
      .from('badges')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching badges:', error)
      return []
    }

    return badges || []
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

  private static async getStudentStats(studentId: string) {
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
    
    // Calculate subject mastery (5+ exams in same subject)
    const subjectCounts = new Map<string, number>()
    exams?.forEach((exam: any) => {
      const count = subjectCounts.get(exam.subject) || 0
      subjectCounts.set(exam.subject, count + 1)
    })
    const subjectMasteryCount = Array.from(subjectCounts.values()).filter(count => count >= 5).length

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
      subjectMasteryCount,
      maxStreakDays: maxStreak,
      hasCompletedFirstExam: totalExams > 0
    }
  }

  private static checkBadgeCondition(badge: Badge, stats: any): boolean {
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
        return stats.subjectMasteryCount >= badge.condition_value

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
      // Get all available badges
      const allBadges = await this.getAllBadges()
      
      // Get student's current badges
      const currentBadges = await this.getStudentBadges(studentId)
      const earnedBadgeIds = new Set(currentBadges.map(sb => sb.badge_id))
      
      // Get student statistics
      const stats = await this.getStudentStats(studentId)
      if (!stats) {
        return { newBadges: [], allEarnedBadges: currentBadges }
      }

      // Check each badge condition
      const newBadges: Badge[] = []
      
      for (const badge of allBadges) {
        // Skip if already earned
        if (earnedBadgeIds.has(badge.id)) {
          continue
        }

        // Check if condition is met
        if (this.checkBadgeCondition(badge, stats)) {
          // Award the badge
          const awarded = await this.awardBadge(studentId, badge.id)
          if (awarded) {
            newBadges.push(badge)
            console.log(`Awarded badge "${badge.name}" to student ${studentId}`)
          }
        }
      }

      // Get updated student badges if new badges were awarded
      const updatedBadges = newBadges.length > 0 
        ? await this.getStudentBadges(studentId)
        : currentBadges

      return {
        newBadges,
        allEarnedBadges: updatedBadges
      }

    } catch (error) {
      console.error('Error evaluating badges:', error)
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