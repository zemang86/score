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
    
    console.log(`📚 Subject breakdown for student:`, Object.fromEntries(subjectCounts))
    
    // Get the highest count of exams in any single subject
    const maxExamsInAnySubject = Array.from(subjectCounts.values()).length > 0 
      ? Math.max(...Array.from(subjectCounts.values()))
      : 0
    
    console.log(`🎯 Max exams in any subject: ${maxExamsInAnySubject} (calculated from ${Array.from(subjectCounts.values()).join(', ')})`)

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
        console.log(`🔍 Subject mastery check: student has ${stats.maxExamsInAnySubject} max exams in any subject, badge requires ${badge.condition_value}`)
        return stats.maxExamsInAnySubject >= badge.condition_value

      case 'score_range':
        console.log(`🔍 Score range check: student's best score is ${stats.bestScore}%, badge requires ${badge.condition_value}%+`)
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
      console.log(`🎯 Starting badge evaluation for student: ${studentId}`)
      
      // Get all available badges
      const allBadges = await this.getAllBadges()
      console.log(`📋 Found ${allBadges.length} available badges:`, allBadges.map(b => `${b.name} (${b.condition_type}: ${b.condition_value})`))
      
      // Get student's current badges
      const currentBadges = await this.getStudentBadges(studentId)
      const earnedBadgeIds = new Set(currentBadges.map(sb => sb.badge_id))
      console.log(`🏆 Student already has ${currentBadges.length} badges:`, currentBadges.map(b => b.badge.name))
      
      // Get student statistics
      const stats = await this.getStudentStats(studentId)
      if (!stats) {
        console.log(`❌ Could not get student stats for ${studentId}`)
        return { newBadges: [], allEarnedBadges: currentBadges }
      }

      console.log(`📊 Student stats:`, {
        totalExams: stats.totalExams,
        perfectScores: stats.perfectScores,
        bestScore: stats.bestScore,
        totalXP: stats.totalXP,
        maxExamsInAnySubject: stats.maxExamsInAnySubject,
        maxStreakDays: stats.maxStreakDays,
        hasCompletedFirstExam: stats.hasCompletedFirstExam
      })

      // Check each badge condition
      const newBadges: Badge[] = []
      
      for (const badge of allBadges) {
        // Skip if already earned
        if (earnedBadgeIds.has(badge.id)) {
          console.log(`⏭️ Skipping "${badge.name}" - already earned`)
          continue
        }

        // Check if condition is met
        const conditionMet = this.checkBadgeCondition(badge, stats)
        console.log(`🔍 Checking "${badge.name}" (${badge.condition_type}: ${badge.condition_value}) - ${conditionMet ? '✅ QUALIFIED' : '❌ Not qualified'}`)
        
        if (conditionMet) {
          // Award the badge
          const awarded = await this.awardBadge(studentId, badge.id)
          if (awarded) {
            newBadges.push(badge)
            console.log(`🎉 AWARDED badge "${badge.name}" to student ${studentId}`)
          } else {
            console.log(`⚠️ Failed to award "${badge.name}" - may already exist`)
          }
        }
      }

      console.log(`🏁 Badge evaluation complete. Awarded ${newBadges.length} new badges:`, newBadges.map(b => b.name))

      // Get updated student badges if new badges were awarded
      const updatedBadges = newBadges.length > 0 
        ? await this.getStudentBadges(studentId)
        : currentBadges

      return {
        newBadges,
        allEarnedBadges: updatedBadges
      }

    } catch (error) {
      console.error('❌ Error evaluating badges:', error)
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

// Debug function to trace badge evaluation
// @ts-ignore
window.debugBadgeEvaluationForStudent = async (studentId: string) => {
  console.log(`🔍 Debug: Evaluating badges for student ${studentId}`)
  
  // Get all badges
  const { data: badges } = await supabase
    .from('badges')
    .select('*')
    .eq('is_active', true)
  
  if (!badges) {
    console.log('❌ No badges found')
    return
  }
  
  console.log(`📋 Found ${badges.length} active badges:`)
  badges.forEach((badge: any) => {
    console.log(`  - ${badge.name}: ${badge.condition_type} >= ${badge.condition_value}`)
  })
  
  // Get student stats
  const stats = await BadgeEvaluator.getStudentStats(studentId)
  console.log(`📊 Student stats:`, stats)
  
  // Check each badge
  for (const badge of badges) {
    console.log(`\n🔍 Checking badge: ${badge.name}`)
    
    // Check if already earned
    const { data: existingAward } = await supabase
      .from('student_badges')
      .select('*')
      .eq('student_id', studentId)
      .eq('badge_id', badge.id)
      .single()
    
    if (existingAward) {
      console.log(`  ✅ Already earned on ${existingAward.earned_date}`)
      continue
    }
    
    // Check if qualifies
    const qualifies = BadgeEvaluator.checkBadgeCondition(badge, stats)
    console.log(`  ${qualifies ? '✅ QUALIFIES' : '❌ does not qualify'}`)
    
    if (qualifies) {
      console.log(`  🎉 Should award badge: ${badge.name}`)
    }
  }
}

// Complete debug function to check badge database and evaluation
// @ts-ignore
window.debugBadgeIssue = async () => {
  console.log('� Starting badge debug...')
  
  // 1. Check if badges exist in database
  const { data: badges, error: badgeError } = await supabase
    .from('badges')
    .select('*')
    .eq('is_active', true)
    .order('condition_type, condition_value')
  
  if (badgeError) {
    console.error('❌ Error fetching badges:', badgeError)
    return
  }
  
  console.log(`📋 Found ${badges?.length || 0} badges in database:`)
  badges?.forEach((badge: any) => {
    console.log(`  - ${badge.name}: ${badge.condition_type} >= ${badge.condition_value}`)
  })
  
  if (!badges || badges.length === 0) {
    console.log('❌ NO BADGES FOUND! You need to run the sample_badges.sql script first!')
    return
  }
  
  // 2. Get current student ID
  const studentId = localStorage.getItem('student_id') || sessionStorage.getItem('student_id')
  if (!studentId) {
    console.log('❌ No student ID found. Make sure you are logged in as a student.')
    return
  }
  
  console.log(`\n👤 Checking student: ${studentId}`)
  
  // 3. Check current student badges
  const { data: currentBadges, error: currentBadgeError } = await supabase
    .from('student_badges')
    .select(`
      id,
      earned_at,
      badges (
        name,
        description,
        icon,
        condition_type,
        condition_value
      )
    `)
    .eq('student_id', studentId)
  
  if (currentBadgeError) {
    console.error('❌ Error fetching current badges:', currentBadgeError)
    return
  }
  
  console.log(`\n🏅 Student currently has ${currentBadges?.length || 0} badges:`)
  currentBadges?.forEach((sb: any) => {
    console.log(`  - ${sb.badges.name} (${sb.badges.condition_type})`)
  })
  
  // 4. Get student stats
  const stats = await BadgeEvaluator.getStudentStats(studentId)
  console.log(`\n📊 Student stats:`, stats)
  
  // 5. Check which badges SHOULD be earned
  console.log(`\n🎯 Badges that SHOULD be earned:`)
  badges?.forEach((badge: any) => {
    let shouldEarn = false
    let reason = ''
    
    switch (badge.condition_type) {
      case 'first_exam':
        shouldEarn = stats?.hasCompletedFirstExam || false
        reason = `Has completed first exam: ${stats?.hasCompletedFirstExam}`
        break
      case 'exams_completed':
        shouldEarn = (stats?.totalExams || 0) >= badge.condition_value
        reason = `Has ${stats?.totalExams || 0} exams (needs ${badge.condition_value})`
        break
      case 'perfect_score':
        shouldEarn = (stats?.perfectScores || 0) >= badge.condition_value
        reason = `Has ${stats?.perfectScores || 0} perfect scores (needs ${badge.condition_value})`
        break
      case 'xp_earned':
        shouldEarn = (stats?.totalXP || 0) >= badge.condition_value
        reason = `Has ${stats?.totalXP || 0} XP (needs ${badge.condition_value})`
        break
      case 'subject_mastery':
        shouldEarn = (stats?.maxExamsInAnySubject || 0) >= badge.condition_value
        reason = `Max in subject: ${stats?.maxExamsInAnySubject || 0} (needs ${badge.condition_value})`
        break
      case 'score_range':
        shouldEarn = (stats?.bestScore || 0) >= badge.condition_value
        reason = `Best score: ${stats?.bestScore || 0}% (needs ${badge.condition_value}%+)`
        break
    }
    
    const hasEarned = currentBadges?.some((sb: any) => sb.badges.name === badge.name)
    const status = hasEarned ? '✅ EARNED' : shouldEarn ? '⚠️ MISSING' : '❌ NOT QUALIFIED'
    
    console.log(`  ${status} ${badge.name}: ${reason}`)
  })
  
  // 6. Suggest actions
  console.log(`\n🔧 Suggested actions:`)
  console.log(`1. If badges are missing, run: BadgeEvaluator.evaluateAndAwardBadges("${studentId}")`)
  console.log(`2. Check console logs during badge evaluation for errors`)
  console.log(`3. If no badges exist, run the sample_badges.sql script`)
}

console.log('🔧 Debug functions loaded:')
console.log('  - debugBadgeIssue() - Complete badge system analysis')
console.log('  - debugBadgeEvaluationForStudent("student_id") - Detailed evaluation trace')