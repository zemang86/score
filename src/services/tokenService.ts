import { supabase } from '../lib/supabase'

// Token earning rules and multipliers
export const TOKEN_EARNING_RULES = {
  levelUp: {
    level1to2: 10,
    level2to3: 20,
    level3to4: 30,
    level4to5: 50
  },
  badgeEarned: {
    first_exam: 5,
    perfect_score: 15,
    score_range: 10,
    exams_completed: 8,
    streak_days: 12,
    xp_earned: 20,
    subject_mastery: 25
  },
  examScore: {
    scoreMultiplier: 0.1, // 1 token per 10% score
    perfectBonus: 5,
    streakBonus: 2,
    completionBonus: 3
  },
  dailyBonus: 5
}

export interface TokenTransaction {
  id: string
  student_id: string
  source_type: string
  source_id?: string
  tokens_earned: number
  earned_at: string
  created_at: string
}

export interface Reward {
  id: string
  name: string
  description: string
  token_cost: number
  category: 'digital' | 'physical' | 'experience'
  subcategory?: string
  image_url?: string
  is_active: boolean
  stock_count: number
  age_min: number
  age_max: number
  created_at: string
  updated_at: string
}

export interface RewardClaim {
  id: string
  student_id: string
  reward_id: string
  tokens_spent: number
  status: 'pending' | 'approved' | 'fulfilled' | 'rejected'
  claimed_at: string
  approved_by?: string
  approved_at?: string
  fulfilled_at?: string
  rejected_at?: string
  notes?: string
  fulfillment_details?: any
  created_at: string
  updated_at: string
  reward?: Reward
}

export interface ClaimResult {
  success: boolean
  error?: string
  claimId?: string
  newBalance?: number
}

export class TokenService {
  
  /**
   * Award tokens to a student for achievements
   */
  static async awardTokens(
    studentId: string,
    sourceType: string,
    amount: number,
    sourceId?: string
  ): Promise<{ success: boolean; error?: string; newBalance?: number }> {
    try {
      console.log(`🪙 Awarding ${amount} tokens to student ${studentId} for ${sourceType}`)
      
      if (amount <= 0) {
        return { success: false, error: 'Token amount must be positive' }
      }

      // Insert token earning record
      const { data: tokenData, error: tokenError } = await supabase
        .from('tokens_earned')
        .insert([{
          student_id: studentId,
          source_type: sourceType,
          source_id: sourceId,
          tokens_earned: amount
        }])
        .select()
        .single()

      if (tokenError) {
        console.error('❌ Error awarding tokens:', tokenError)
        return { success: false, error: tokenError.message }
      }

      // Get updated balance
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('token_balance')
        .eq('id', studentId)
        .single()

      if (studentError) {
        console.error('❌ Error fetching updated balance:', studentError)
        return { success: false, error: studentError.message }
      }

      console.log(`✅ Successfully awarded ${amount} tokens. New balance: ${student.token_balance}`)
      
      return { 
        success: true, 
        newBalance: student.token_balance 
      }
    } catch (error) {
      console.error('❌ Unexpected error awarding tokens:', error)
      return { success: false, error: 'Failed to award tokens' }
    }
  }

  /**
   * Award tokens based on exam performance
   */
  static async awardExamTokens(
    studentId: string,
    examId: string,
    score: number,
    correctAnswers: number,
    totalQuestions: number,
    isStreak: boolean = false
  ): Promise<{ success: boolean; error?: string; tokensEarned?: number }> {
    try {
      // Calculate tokens based on performance
      const baseTokens = Math.floor(score * TOKEN_EARNING_RULES.examScore.scoreMultiplier)
      const perfectBonus = score === 100 ? TOKEN_EARNING_RULES.examScore.perfectBonus : 0
      const streakBonus = isStreak ? TOKEN_EARNING_RULES.examScore.streakBonus : 0
      const completionBonus = TOKEN_EARNING_RULES.examScore.completionBonus
      
      const totalTokens = baseTokens + perfectBonus + streakBonus + completionBonus
      
      if (totalTokens <= 0) {
        return { success: true, tokensEarned: 0 }
      }

      const result = await this.awardTokens(studentId, 'exam_score', totalTokens, examId)
      
      if (result.success) {
        console.log(`🎯 Exam tokens breakdown for ${score}%:`)
        console.log(`  Base (${score}% × ${TOKEN_EARNING_RULES.examScore.scoreMultiplier}): ${baseTokens}`)
        console.log(`  Perfect bonus: ${perfectBonus}`)
        console.log(`  Streak bonus: ${streakBonus}`)
        console.log(`  Completion bonus: ${completionBonus}`)
        console.log(`  Total: ${totalTokens} tokens`)
        
        return { success: true, tokensEarned: totalTokens }
      }
      
      return { success: false, error: result.error }
    } catch (error) {
      console.error('❌ Error awarding exam tokens:', error)
      return { success: false, error: 'Failed to award exam tokens' }
    }
  }

  /**
   * Award tokens for level progression
   */
  static async awardLevelUpTokens(
    studentId: string,
    fromLevel: number,
    toLevel: number
  ): Promise<{ success: boolean; error?: string; tokensEarned?: number }> {
    try {
      const levelKey = `level${fromLevel}to${toLevel}` as keyof typeof TOKEN_EARNING_RULES.levelUp
      const tokens = TOKEN_EARNING_RULES.levelUp[levelKey] || 0
      
      if (tokens <= 0) {
        return { success: true, tokensEarned: 0 }
      }

      const result = await this.awardTokens(studentId, 'level_up', tokens, `${fromLevel}-${toLevel}`)
      
      if (result.success) {
        console.log(`🚀 Level up tokens: ${tokens} for ${fromLevel} → ${toLevel}`)
        return { success: true, tokensEarned: tokens }
      }
      
      return { success: false, error: result.error }
    } catch (error) {
      console.error('❌ Error awarding level up tokens:', error)
      return { success: false, error: 'Failed to award level up tokens' }
    }
  }

  /**
   * Award tokens for badge achievements
   */
  static async awardBadgeTokens(
    studentId: string,
    badgeId: string,
    badgeConditionType: string
  ): Promise<{ success: boolean; error?: string; tokensEarned?: number }> {
    try {
      const tokens = TOKEN_EARNING_RULES.badgeEarned[badgeConditionType as keyof typeof TOKEN_EARNING_RULES.badgeEarned] || 0
      
      if (tokens <= 0) {
        return { success: true, tokensEarned: 0 }
      }

      const result = await this.awardTokens(studentId, 'badge_earned', tokens, badgeId)
      
      if (result.success) {
        console.log(`🏆 Badge tokens: ${tokens} for ${badgeConditionType}`)
        return { success: true, tokensEarned: tokens }
      }
      
      return { success: false, error: result.error }
    } catch (error) {
      console.error('❌ Error awarding badge tokens:', error)
      return { success: false, error: 'Failed to award badge tokens' }
    }
  }

  /**
   * Award daily bonus tokens
   */
  static async awardDailyBonus(studentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if daily bonus already awarded today
      const today = new Date().toISOString().split('T')[0]
      const { data: existingBonus, error: checkError } = await supabase
        .from('tokens_earned')
        .select('id')
        .eq('student_id', studentId)
        .eq('source_type', 'daily_bonus')
        .gte('earned_at', `${today}T00:00:00`)
        .lt('earned_at', `${today}T23:59:59`)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Error checking daily bonus:', checkError)
        return { success: false, error: checkError.message }
      }

      if (existingBonus) {
        console.log('ℹ️ Daily bonus already awarded today')
        return { success: true }
      }

      const result = await this.awardTokens(studentId, 'daily_bonus', TOKEN_EARNING_RULES.dailyBonus)
      
      if (result.success) {
        console.log(`🌟 Daily bonus: ${TOKEN_EARNING_RULES.dailyBonus} tokens`)
      }
      
      return result
    } catch (error) {
      console.error('❌ Error awarding daily bonus:', error)
      return { success: false, error: 'Failed to award daily bonus' }
    }
  }

  /**
   * Get student's current token balance
   */
  static async getTokenBalance(studentId: string): Promise<number> {
    try {
      const { data: student, error } = await supabase
        .from('students')
        .select('token_balance')
        .eq('id', studentId)
        .single()

      if (error) {
        console.error('❌ Error fetching token balance:', error)
        return 0
      }

      return student.token_balance || 0
    } catch (error) {
      console.error('❌ Unexpected error fetching token balance:', error)
      return 0
    }
  }

  /**
   * Get student's token earning history
   */
  static async getTokenHistory(studentId: string): Promise<TokenTransaction[]> {
    try {
      const { data: transactions, error } = await supabase
        .from('tokens_earned')
        .select('*')
        .eq('student_id', studentId)
        .order('earned_at', { ascending: false })
        .limit(100)

      if (error) {
        console.error('❌ Error fetching token history:', error)
        return []
      }

      return transactions || []
    } catch (error) {
      console.error('❌ Unexpected error fetching token history:', error)
      return []
    }
  }

  /**
   * Get available rewards for a student
   */
  static async getAvailableRewards(studentAge?: number): Promise<Reward[]> {
    try {
      let query = supabase
        .from('rewards')
        .select('*')
        .eq('is_active', true)
        .order('token_cost', { ascending: true })

      if (studentAge) {
        query = query
          .lte('age_min', studentAge)
          .gte('age_max', studentAge)
      }

      const { data: rewards, error } = await query

      if (error) {
        console.error('❌ Error fetching rewards:', error)
        return []
      }

      return rewards || []
    } catch (error) {
      console.error('❌ Unexpected error fetching rewards:', error)
      return []
    }
  }

  /**
   * Claim a reward
   */
  static async claimReward(studentId: string, rewardId: string): Promise<ClaimResult> {
    try {
      // Get student's current balance
      const balance = await this.getTokenBalance(studentId)
      
      // Get reward details
      const { data: reward, error: rewardError } = await supabase
        .from('rewards')
        .select('*')
        .eq('id', rewardId)
        .eq('is_active', true)
        .single()

      if (rewardError) {
        console.error('❌ Error fetching reward:', rewardError)
        return { success: false, error: 'Reward not found' }
      }

      if (!reward) {
        return { success: false, error: 'Reward not found' }
      }

      // Check if student has enough tokens
      if (balance < reward.token_cost) {
        return { 
          success: false, 
          error: `Insufficient tokens. Need ${reward.token_cost}, have ${balance}` 
        }
      }

      // Check stock availability
      if (reward.stock_count === 0) {
        return { success: false, error: 'Reward is out of stock' }
      }

      // Create claim record
      const { data: claim, error: claimError } = await supabase
        .from('reward_claims')
        .insert([{
          student_id: studentId,
          reward_id: rewardId,
          tokens_spent: reward.token_cost,
          status: 'pending'
        }])
        .select()
        .single()

      if (claimError) {
        console.error('❌ Error creating claim:', claimError)
        return { success: false, error: claimError.message }
      }

      // Update stock count if limited
      if (reward.stock_count > 0) {
        await supabase
          .from('rewards')
          .update({ stock_count: reward.stock_count - 1 })
          .eq('id', rewardId)
      }

      // Get updated balance
      const newBalance = await this.getTokenBalance(studentId)

      console.log(`🎁 Reward claimed: ${reward.name} for ${reward.token_cost} tokens`)
      
      return { 
        success: true, 
        claimId: claim.id, 
        newBalance 
      }
    } catch (error) {
      console.error('❌ Error claiming reward:', error)
      return { success: false, error: 'Failed to claim reward' }
    }
  }

  /**
   * Get student's reward claims
   */
  static async getRewardClaims(studentId: string): Promise<RewardClaim[]> {
    try {
      const { data: claims, error } = await supabase
        .from('reward_claims')
        .select(`
          *,
          reward:rewards(*)
        `)
        .eq('student_id', studentId)
        .order('claimed_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching reward claims:', error)
        return []
      }

      return claims || []
    } catch (error) {
      console.error('❌ Unexpected error fetching reward claims:', error)
      return []
    }
  }

  /**
   * Get token statistics for a student
   */
  static async getTokenStats(studentId: string): Promise<{
    totalEarned: number
    totalSpent: number
    currentBalance: number
    tokensThisWeek: number
    tokensThisMonth: number
  }> {
    try {
      const [balance, history, claims] = await Promise.all([
        this.getTokenBalance(studentId),
        this.getTokenHistory(studentId),
        this.getRewardClaims(studentId)
      ])

      const totalEarned = history.reduce((sum, t) => sum + t.tokens_earned, 0)
      const totalSpent = claims.reduce((sum, c) => sum + c.tokens_spent, 0)

      // Calculate tokens earned this week
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const tokensThisWeek = history
        .filter(t => new Date(t.earned_at) >= weekAgo)
        .reduce((sum, t) => sum + t.tokens_earned, 0)

      // Calculate tokens earned this month
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      const tokensThisMonth = history
        .filter(t => new Date(t.earned_at) >= monthAgo)
        .reduce((sum, t) => sum + t.tokens_earned, 0)

      return {
        totalEarned,
        totalSpent,
        currentBalance: balance,
        tokensThisWeek,
        tokensThisMonth
      }
    } catch (error) {
      console.error('❌ Error calculating token stats:', error)
      return {
        totalEarned: 0,
        totalSpent: 0,
        currentBalance: 0,
        tokensThisWeek: 0,
        tokensThisMonth: 0
      }
    }
  }

  /**
   * Calculate XP level from current XP (matching existing system)
   */
  static getXPLevel(xp: number): { level: number; progress: number; nextLevel: number } {
    if (xp < 100) return { level: 1, progress: xp, nextLevel: 100 }
    if (xp < 300) return { level: 2, progress: xp - 100, nextLevel: 200 }
    if (xp < 600) return { level: 3, progress: xp - 300, nextLevel: 300 }
    if (xp < 1000) return { level: 4, progress: xp - 600, nextLevel: 400 }
    return { level: 5, progress: xp - 1000, nextLevel: 0 }
  }

  /**
   * Check if student leveled up and award tokens
   */
  static async checkAndAwardLevelUpTokens(
    studentId: string,
    oldXP: number,
    newXP: number
  ): Promise<{ success: boolean; tokensEarned?: number }> {
    try {
      const oldLevel = this.getXPLevel(oldXP).level
      const newLevel = this.getXPLevel(newXP).level

      if (newLevel > oldLevel) {
        const result = await this.awardLevelUpTokens(studentId, oldLevel, newLevel)
        return result
      }

      return { success: true, tokensEarned: 0 }
    } catch (error) {
      console.error('❌ Error checking level up tokens:', error)
      return { success: false }
    }
  }
}