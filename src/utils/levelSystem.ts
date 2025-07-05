// Enhanced 99-Level Gaming System for Kids
// Designed to be realistic yet engaging with milestone rewards

export interface LevelInfo {
  level: number
  currentXP: number
  requiredXP: number
  progress: number
  nextLevelXP: number
  totalXPForLevel: number
  levelName: string
  levelTheme: string
  levelColor: string
  isMilestone: boolean
  milestoneReward?: string
  levelEmoji: string
}

export interface LevelTheme {
  name: string
  color: string
  gradient: string
  emoji: string
  description: string
}

// Level themes for different ranges
export const LEVEL_THEMES: Record<string, LevelTheme> = {
  rookie: {
    name: "Rookie Explorer",
    color: "text-green-600",
    gradient: "from-green-400 to-emerald-500",
    emoji: "🌱",
    description: "Starting your learning journey!"
  },
  explorer: {
    name: "Learning Explorer",
    color: "text-blue-600", 
    gradient: "from-blue-400 to-cyan-500",
    emoji: "🧭",
    description: "Discovering new knowledge!"
  },
  adventurer: {
    name: "Knowledge Adventurer",
    color: "text-purple-600",
    gradient: "from-purple-400 to-pink-500", 
    emoji: "⚔️",
    description: "Brave learner taking on challenges!"
  },
  scholar: {
    name: "Brilliant Scholar",
    color: "text-orange-600",
    gradient: "from-orange-400 to-red-500",
    emoji: "📚",
    description: "Mastering advanced concepts!"
  },
  master: {
    name: "Learning Master",
    color: "text-indigo-600",
    gradient: "from-indigo-400 to-purple-500",
    emoji: "🎓",
    description: "Exceptional learning mastery!"
  },
  legend: {
    name: "Legend",
    color: "text-amber-600",
    gradient: "from-amber-400 to-yellow-500",
    emoji: "👑",
    description: "Legendary learning achievement!"
  }
}

// XP requirements for each level (optimized for kids)
export const XP_REQUIREMENTS: number[] = [
  // Levels 1-10: Quick early progression (50-150 XP per level)
  0, 50, 120, 200, 300, 420, 560, 720, 900, 1100, 1320,
  
  // Levels 11-20: Steady progression (180-300 XP per level)
  1560, 1820, 2100, 2400, 2720, 3060, 3420, 3800, 4200, 4620,
  
  // Levels 21-30: Moderate progression (250-400 XP per level)
  5080, 5560, 6060, 6580, 7120, 7680, 8260, 8860, 9480, 10120,
  
  // Levels 31-40: Balanced progression (300-500 XP per level)
  10800, 11500, 12220, 12960, 13720, 14500, 15300, 16120, 16960, 17820,
  
  // Levels 41-50: Increasing challenge (400-600 XP per level)
  18720, 19640, 20580, 21540, 22520, 23520, 24540, 25580, 26640, 27720,
  
  // Levels 51-60: Higher challenge (500-700 XP per level)
  28840, 29980, 31140, 32320, 33520, 34740, 35980, 37240, 38520, 39820,
  
  // Levels 61-70: Advanced progression (600-800 XP per level)
  41160, 42520, 43900, 45300, 46720, 48160, 49620, 51100, 52600, 54120,
  
  // Levels 71-80: Expert progression (700-900 XP per level)
  55680, 57260, 58860, 60480, 62120, 63780, 65460, 67160, 68880, 70620,
  
  // Levels 81-90: Master progression (800-1000 XP per level)
  72400, 74200, 76020, 77860, 79720, 81600, 83500, 85420, 87360, 89320,
  
  // Levels 91-99: Legendary progression (900-1200 XP per level)
  91320, 93340, 95380, 97440, 99520, 101620, 103740, 105880, 108040
]

// Milestone levels with special rewards
export const MILESTONE_LEVELS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 99]

export const MILESTONE_REWARDS: Record<number, string> = {
  10: "🏆 First Champion Badge & Special Certificate",
  20: "🌟 Explorer's Compass & Progress Tracker",
  30: "⚔️ Adventure Shield & Skill Boost",
  40: "📖 Scholar's Tome & Knowledge Bonus",
  50: "🎯 Halfway Hero Badge & XP Multiplier",
  60: "🚀 Advanced Achiever Award & Special Powers",
  70: "💎 Expert Diamond Badge & Rare Rewards",
  80: "🔥 Elite Master Status & Exclusive Benefits",
  90: "⭐ Legendary Status & Ultimate Recognition",
  99: "👑 ULTIMATE LEGEND - Hall of Fame Entry!"
}

/**
 * Calculate detailed level information from XP
 */
export function calculateLevelInfo(xp: number): LevelInfo {
  let currentLevel = 1
  
  // Find current level
  for (let i = 0; i < XP_REQUIREMENTS.length; i++) {
    if (xp >= XP_REQUIREMENTS[i]) {
      currentLevel = i + 1
    } else {
      break
    }
  }
  
  // Handle max level (99)
  if (currentLevel > 99) {
    currentLevel = 99
  }
  
  const currentLevelXP = XP_REQUIREMENTS[currentLevel - 1] || 0
  const nextLevelXP = XP_REQUIREMENTS[currentLevel] || XP_REQUIREMENTS[98] // Level 99 XP
  
  const progress = currentLevel === 99 ? 100 : xp - currentLevelXP
  const requiredXP = currentLevel === 99 ? 0 : nextLevelXP - currentLevelXP
  const progressPercentage = currentLevel === 99 ? 100 : (progress / requiredXP) * 100
  
  const theme = getLevelTheme(currentLevel)
  const levelName = getLevelName(currentLevel)
  const isMilestone = MILESTONE_LEVELS.includes(currentLevel)
  
  return {
    level: currentLevel,
    currentXP: xp,
    requiredXP: requiredXP,
    progress: Math.round(progressPercentage),
    nextLevelXP: nextLevelXP,
    totalXPForLevel: nextLevelXP,
    levelName: levelName,
    levelTheme: theme.name,
    levelColor: theme.color,
    isMilestone: isMilestone,
    milestoneReward: isMilestone ? MILESTONE_REWARDS[currentLevel] : undefined,
    levelEmoji: theme.emoji
  }
}

/**
 * Get level theme based on level number
 */
function getLevelTheme(level: number): LevelTheme {
  if (level <= 10) return LEVEL_THEMES.rookie
  if (level <= 25) return LEVEL_THEMES.explorer
  if (level <= 45) return LEVEL_THEMES.adventurer
  if (level <= 65) return LEVEL_THEMES.scholar
  if (level <= 85) return LEVEL_THEMES.master
  return LEVEL_THEMES.legend
}

/**
 * Get descriptive level name
 */
function getLevelName(level: number): string {
  const theme = getLevelTheme(level)
  
  // Special names for milestone levels
  if (level === 99) return "Ultimate Legend"
  if (level === 90) return "Legendary Master"
  if (level === 80) return "Elite Champion"
  if (level === 70) return "Expert Scholar"
  if (level === 60) return "Advanced Achiever"
  if (level === 50) return "Halfway Hero"
  if (level === 40) return "Brilliant Student"
  if (level === 30) return "Skilled Adventurer"
  if (level === 20) return "Experienced Explorer"
  if (level === 10) return "First Champion"
  
  return `${theme.name} ${level}`
}

/**
 * Calculate XP needed for next level
 */
export function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel >= 99) return 0
  return XP_REQUIREMENTS[currentLevel] || 0
}

/**
 * Calculate total XP needed for a specific level
 */
export function getTotalXPForLevel(level: number): number {
  if (level <= 1) return 0
  if (level > 99) return XP_REQUIREMENTS[98]
  return XP_REQUIREMENTS[level - 1]
}

/**
 * Get level progress statistics
 */
export function getLevelStats(xp: number): {
  currentLevel: number
  totalLevels: number
  progressToMax: number
  levelRank: string
  estimatedExamsToNext: number
} {
  const levelInfo = calculateLevelInfo(xp)
  const progressToMax = (xp / XP_REQUIREMENTS[98]) * 100
  
  // Estimate exams needed (assuming average 15 XP per exam)
  const avgXPPerExam = 15
  const estimatedExamsToNext = levelInfo.requiredXP > 0 
    ? Math.ceil((levelInfo.requiredXP - levelInfo.progress) / avgXPPerExam)
    : 0
  
  let levelRank = "Beginner"
  if (levelInfo.level >= 80) levelRank = "Legendary"
  else if (levelInfo.level >= 60) levelRank = "Master"
  else if (levelInfo.level >= 40) levelRank = "Expert"
  else if (levelInfo.level >= 20) levelRank = "Advanced"
  else if (levelInfo.level >= 10) levelRank = "Experienced"
  
  return {
    currentLevel: levelInfo.level,
    totalLevels: 99,
    progressToMax: Math.round(progressToMax),
    levelRank,
    estimatedExamsToNext
  }
}

/**
 * Check if level up occurred
 */
export function checkLevelUp(oldXP: number, newXP: number): {
  leveledUp: boolean
  oldLevel: number
  newLevel: number
  levelsGained: number
  milestoneReached: boolean
  milestoneReward?: string
} {
  const oldLevelInfo = calculateLevelInfo(oldXP)
  const newLevelInfo = calculateLevelInfo(newXP)
  
  const leveledUp = newLevelInfo.level > oldLevelInfo.level
  const levelsGained = newLevelInfo.level - oldLevelInfo.level
  const milestoneReached = leveledUp && MILESTONE_LEVELS.includes(newLevelInfo.level)
  
  return {
    leveledUp,
    oldLevel: oldLevelInfo.level,
    newLevel: newLevelInfo.level,
    levelsGained,
    milestoneReached,
    milestoneReward: milestoneReached ? MILESTONE_REWARDS[newLevelInfo.level] : undefined
  }
}

/**
 * Get upcoming milestones
 */
export function getUpcomingMilestones(currentLevel: number): Array<{
  level: number
  xpNeeded: number
  reward: string
}> {
  return MILESTONE_LEVELS
    .filter(level => level > currentLevel)
    .slice(0, 3) // Show next 3 milestones
    .map(level => ({
      level,
      xpNeeded: XP_REQUIREMENTS[level - 1],
      reward: MILESTONE_REWARDS[level]
    }))
}

/**
 * Get level leaderboard position simulation
 */
export function getLevelRanking(level: number): {
  rank: string
  percentile: number
  description: string
} {
  let rank = "Beginner"
  let percentile = 0
  let description = "Just starting the journey!"
  
  if (level >= 99) {
    rank = "Ultimate Legend"
    percentile = 100
    description = "Highest achievement possible!"
  } else if (level >= 90) {
    rank = "Legendary"
    percentile = 95
    description = "Among the elite learners!"
  } else if (level >= 80) {
    rank = "Master"
    percentile = 90
    description = "Exceptional dedication!"
  } else if (level >= 70) {
    rank = "Expert"
    percentile = 80
    description = "Advanced learning skills!"
  } else if (level >= 60) {
    rank = "Advanced"
    percentile = 70
    description = "Impressive progress!"
  } else if (level >= 50) {
    rank = "Skilled"
    percentile = 60
    description = "Halfway to mastery!"
  } else if (level >= 40) {
    rank = "Developing"
    percentile = 50
    description = "Strong foundation building!"
  } else if (level >= 30) {
    rank = "Growing"
    percentile = 40
    description = "Consistent improvement!"
  } else if (level >= 20) {
    rank = "Learning"
    percentile = 30
    description = "Building momentum!"
  } else if (level >= 10) {
    rank = "Emerging"
    percentile = 20
    description = "Good early progress!"
  }
  
  return { rank, percentile, description }
}

/**
 * Calculate daily XP target for level goals
 */
export function calculateDailyXPTarget(currentXP: number, targetLevel: number, days: number): {
  dailyXP: number
  isAchievable: boolean
  recommendedExams: number
} {
  const targetXP = getTotalXPForLevel(targetLevel)
  const neededXP = Math.max(0, targetXP - currentXP)
  const dailyXP = Math.ceil(neededXP / days)
  
  // Average XP per exam is about 15
  const avgXPPerExam = 15
  const recommendedExams = Math.ceil(dailyXP / avgXPPerExam)
  
  // Consider achievable if requires 3 or fewer exams per day
  const isAchievable = recommendedExams <= 3
  
  return {
    dailyXP,
    isAchievable,
    recommendedExams
  }
}