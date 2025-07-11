import React, { useState, useEffect } from 'react'
import { Student } from '../../lib/supabase'
import { User, School, Star, Edit, Zap, Trophy, Sparkles, Heart, Clock, Lock, Crown, AlertTriangle } from 'lucide-react'
import { Button } from '../ui/Button'
import { calculateAgeInYearsAndMonths } from '../../utils/dateUtils'
import { useAuth } from '../../contexts/OptimizedAuthContext'
import { supabase } from '../../lib/supabase'
import { canTakeExam } from '../../utils/accessControl'
import { getStudentDisplayStatus, canStudentTakeExam } from '../../utils/subscriptionEnforcement'
import { useTranslation } from 'react-i18next'

interface StudentCardProps {
  student: Student
  allStudents: Student[] // NEW: All students for subscription enforcement
  onEdit?: (student: Student) => void
  onDelete?: (student: Student) => void
  onExamComplete?: () => void
  onStudentUpdated?: () => void
  onOpenExamModal?: (student: Student) => void
  onOpenEditModal?: (student: Student) => void
  onOpenProgressModal?: (student: Student) => void
}

export function StudentCard({ student, allStudents, onEdit, onDelete, onExamComplete, onStudentUpdated, onOpenExamModal, onOpenEditModal, onOpenProgressModal }: StudentCardProps) {
  const { user, dailyExamLimit, subscriptionPlan, isBetaTester, effectiveAccess } = useAuth()
  const { t } = useTranslation()
  const [dailyExamCount, setDailyExamCount] = useState<number>(0)
  const [loadingExamCount, setLoadingExamCount] = useState(false)

  // Get subscription enforcement status
  const hasUnlimitedExams = effectiveAccess?.hasUnlimitedExams || isBetaTester || false
  const studentStatus = getStudentDisplayStatus(student.id, allStudents, hasUnlimitedExams)

  // Fetch daily exam count when component mounts
  useEffect(() => {
    if (student?.id) {
      fetchDailyExamCount()
    }
  }, [student?.id])

  // Function to fetch today's exam count for this student
  const fetchDailyExamCount = async () => {
    setLoadingExamCount(true)
    try {
      // First try the database function
      const { data, error } = await supabase.rpc('get_daily_exam_count', {
        input_student_id: student.id
      })
      
      if (error) {
        console.error('Error with get_daily_exam_count RPC:', error)
        console.log('🔄 Falling back to direct query method...')
        
        // Fallback: Direct query if RPC function doesn't exist
        const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
        const { count, error: fallbackError } = await supabase
          .from('exams')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', student.id)
          .eq('completed', true)
          .gte('created_at', `${today}T00:00:00.000Z`)
          .lt('created_at', `${today}T23:59:59.999Z`)
        
        if (fallbackError) {
          console.error('Fallback query also failed:', fallbackError)
          setDailyExamCount(0)
        } else {
          setDailyExamCount(count || 0)
          console.log(`📊 Student ${student.name} has taken ${count || 0} exams today (fallback method)`)
        }
      } else {
        setDailyExamCount(data || 0)
        console.log(`✅ Student ${student.name} has taken ${data || 0} exams today (RPC method)`)
      }
    } catch (err) {
      console.error('Failed to fetch daily exam count:', err)
      setDailyExamCount(0)
    } finally {
      setLoadingExamCount(false)
    }
  }

  // Check if user can take another exam (combines daily limit + subscription restrictions)
  const canUserTakeExam = () => {
    if (!user) return false
    
    // First check subscription restrictions (multi-student limits)
    if (!studentStatus.canTakeExams) {
      return false
    }
    
    // Then check daily exam limits using effective access
    return effectiveAccess?.hasUnlimitedExams || 
           isBetaTester || 
           user.isAdmin || 
           dailyExamLimit === 999 || 
           dailyExamCount < dailyExamLimit
  }

  // Handle exam button click with all limit checking
  const handleStartExam = () => {
    if (canUserTakeExam()) {
      onOpenExamModal?.(student)
    }
  }

  const getAgeDisplay = (dateOfBirth: string) => {
    return calculateAgeInYearsAndMonths(dateOfBirth, t)
  }

  const getLevelColor = (level: string) => {
    if (level.includes('Darjah')) {
      return 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg'
    } else if (level.includes('Tingkatan')) {
      return 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-lg'
    }
    return 'bg-gradient-to-r from-slate-400 to-slate-500 text-white shadow-lg'
  }

  const getXPDisplay = (xp: number) => {
    // Enhanced 99-level system calculation
    let currentLevel = 1
    const xpReq = [0, 50, 120, 200, 300, 420, 560, 720, 900, 1100, 1320]
    
    // Find current level
    for (let i = 0; i < xpReq.length; i++) {
      if (xp >= xpReq[i]) {
        currentLevel = i + 1
      } else {
        break
      }
    }
    
    // For levels beyond 10
    if (xp >= 1320) {
      currentLevel = Math.min(99, Math.floor(10 + (xp - 1320) / 200))
    }
    
    // Get level theme
    let theme = { name: t('dashboard.student.themes.rookieExplorer'), emoji: "🌱", color: "text-green-600", gradient: "from-green-400 to-emerald-500" }
    
    if (currentLevel > 85) {
      theme = { name: t('dashboard.student.themes.legend'), emoji: "👑", color: "text-amber-600", gradient: "from-amber-400 to-yellow-500" }
    } else if (currentLevel > 65) {
      theme = { name: t('dashboard.student.themes.learningMaster'), emoji: "🎓", color: "text-indigo-600", gradient: "from-indigo-400 to-purple-500" }
    } else if (currentLevel > 45) {
      theme = { name: t('dashboard.student.themes.brilliantScholar'), emoji: "📚", color: "text-orange-600", gradient: "from-orange-400 to-red-500" }
    } else if (currentLevel > 25) {
      theme = { name: t('dashboard.student.themes.knowledgeAdventurer'), emoji: "⚔️", color: "text-purple-600", gradient: "from-purple-400 to-pink-500" }
    } else if (currentLevel > 10) {
      theme = { name: t('dashboard.student.themes.learningExplorer'), emoji: "🧭", color: "text-blue-600", gradient: "from-blue-400 to-cyan-500" }
    }
    
    const milestones = [10, 20, 30, 40, 50, 60, 70, 80, 90, 99]
    const isMilestone = milestones.includes(currentLevel)
    
    return { 
      text: `Level ${currentLevel} - ${theme.name}`, 
      level: currentLevel,
      color: theme.color, 
      emoji: theme.emoji, 
      gradient: theme.gradient,
      isMilestone,
      totalXP: xp
    }
  }

  const xpInfo = getXPDisplay(student.xp)

  return (
    <>
      <div className={`relative bg-white/90 backdrop-blur-xl rounded-2xl p-4 border-2 shadow-xl transition-all duration-500 group overflow-hidden ${
        studentStatus.isRestricted 
          ? 'border-gray-300 opacity-75 hover:shadow-lg' 
          : 'border-indigo-200 hover:shadow-2xl hover:scale-[1.01] hover:border-indigo-300 hover:ring-2 hover:ring-indigo-100'
      }`}>
        {/* Restriction overlay for disabled students */}
        {studentStatus.isRestricted && (
          <div className="absolute top-2 right-2 z-20">
            <div className="bg-amber-100 border border-amber-300 rounded-lg px-2 py-1 flex items-center">
              <Lock className="w-3 h-3 text-amber-600 mr-1" />
              <span className="text-xs font-medium text-amber-700">{t('dashboard.student.status.restricted')}</span>
            </div>
          </div>
        )}
        
        {/* First student indicator */}
        {studentStatus.isFirstStudent && !effectiveAccess?.hasUnlimitedKids && allStudents.length > 1 && (
          <div className="absolute top-2 left-2 z-20">
            <div className="bg-green-100 border border-green-300 rounded-lg px-2 py-1 flex items-center">
              <Crown className="w-3 h-3 text-green-600 mr-1" />
              <span className="text-xs font-medium text-green-700">{t('dashboard.student.status.active')}</span>
            </div>
          </div>
        )}

        {/* Subtle background gradient */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-xl opacity-60"></div>

        {/* Compact Header */}
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mr-3 shadow-md">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-800 group-hover:text-indigo-700 transition-colors truncate">{student.name}</h3>
              <p className="text-xs text-slate-600 group-hover:text-indigo-600 transition-colors">{getAgeDisplay(student.date_of_birth)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold ${getLevelColor(student.level)}`}>
              {student.level}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 p-1.5 rounded-lg" 
              icon={<Edit className="w-3.5 h-3.5" />}
              onClick={() => onOpenEditModal?.(student)}
              title={t('dashboard.student.actions.edit')}
            />
          </div>
        </div>

        {/* School Info - Compact */}
        <div className="mb-3 relative z-10">
          <div className="flex items-center text-slate-600">
            <School className="w-3.5 h-3.5 text-slate-500 mr-2" />
            <p className="font-medium text-slate-800 text-sm truncate">{student.school}</p>
          </div>
        </div>

        {/* Compact XP Progress */}
        <div className={`bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-3 border shadow-sm transition-all duration-300 ${xpInfo.isMilestone ? 'border-yellow-400' : 'border-indigo-200/50'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className={`bg-gradient-to-r ${xpInfo.gradient} rounded-lg p-1.5 shadow-sm mr-2 relative`}>
                <Star className="w-4 h-4 text-white" />
                {xpInfo.isMilestone && (
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-xs">🏆</span>
                  </div>
                )}
              </div>
              <div>
                <span className={`font-bold text-sm ${xpInfo.color}`}>
                  Level {xpInfo.level} {xpInfo.isMilestone && '🏆'}
                </span>
                <p className="text-xs text-gray-600">{xpInfo.text.split(' - ')[1]}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-bold text-lg ${xpInfo.color}`}>{xpInfo.emoji}</p>
              <p className="text-xs text-gray-500">{xpInfo.level}/99</p>
            </div>
          </div>
          
          {/* Compact Progress */}
                      <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>{xpInfo.totalXP} {t('dashboard.student.xp')}</span>
              <span>{t('dashboard.student.nextLevel', { level: [10, 20, 30, 40, 50, 60, 70, 80, 90, 99].find((m) => m > xpInfo.level) || '99' })}</span>
            </div>
            <div className="w-full h-2 bg-white/70 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${xpInfo.gradient} rounded-full transition-all duration-1000`}
                style={{ width: `${Math.min((xpInfo.level / 99) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Subscription Restriction Notice */}
        {studentStatus.showUpgradePrompt && (
          <div className="mt-3 px-3 py-2 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <div className="flex items-center">
              <AlertTriangle className="w-3 h-3 mr-1" />
              <span>{t('dashboard.student.restrictions.freePlanFirstChild')}</span>
            </div>
            <div className="mt-1 text-xs text-amber-600">
              {t('dashboard.student.restrictions.upgradePremiumAllChildren')}
            </div>
          </div>
        )}

        {/* Daily Exam Status Bar */}
        {dailyExamLimit !== 999 && studentStatus.canTakeExams && (
          <div className={`mt-3 px-3 py-2 rounded-lg text-xs font-medium ${
            canUserTakeExam() 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              <span>{t('dashboard.student.dailyExams', { current: dailyExamCount, limit: dailyExamLimit })}</span>
            </div>
          </div>
        )}

        {/* Compact Action Buttons */}
        <div className="flex space-x-2 mt-3">
          <Button 
            variant={canUserTakeExam() ? "gradient-primary" : "outline"}
            size="sm" 
            className={`flex-1 text-sm py-2.5 shadow-md transition-all duration-300 ${
              canUserTakeExam() 
                ? 'hover:shadow-lg' 
                : 'opacity-60 cursor-not-allowed bg-gray-100 text-gray-500 border-gray-300'
            }`}
            onClick={handleStartExam}
            disabled={!canUserTakeExam() || loadingExamCount}
            icon={
              studentStatus.isRestricted ? <Lock className="w-4 h-4" /> :
              canUserTakeExam() ? <Zap className="w-4 h-4" /> : <Clock className="w-4 h-4" />
            }
          >
            {studentStatus.isRestricted 
              ? t('dashboard.student.status.upgradeNeeded')
              : !canUserTakeExam() 
                ? t('dashboard.student.status.limitReached')
                : t('dashboard.student.actions.startExam')
            }
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-sm py-2.5 border border-indigo-300 text-indigo-600 hover:bg-indigo-50 transition-all duration-300"
            onClick={() => onOpenProgressModal?.(student)}
            icon={<Trophy className="w-4 h-4" />}
          >
            {t('dashboard.student.actions.progress')}
          </Button>
        </div>
      </div>
    </>
  )
}