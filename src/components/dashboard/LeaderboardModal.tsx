import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'
import { PremiumUpgradeModal } from './PremiumUpgradeModal'
import { X, Trophy, Crown, Star, Medal, Target, TrendingUp, Lock } from 'lucide-react'

interface LeaderboardModalProps {
  isOpen: boolean
  onClose: () => void
}

interface LeaderboardEntry {
  student_id: string
  student_name: string
  student_level: string
  student_school: string
  total_xp: number
  total_exams: number
  average_score: number
  best_score: number
  last_exam_date: string | null
  rank: number
}

type LeaderboardType = 'xp' | 'exams' | 'scores'

export function LeaderboardModal({ isOpen, onClose }: LeaderboardModalProps) {
  const { user, subscriptionPlan } = useAuth()
  const isPremium = subscriptionPlan === 'premium'
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState<LeaderboardType>('xp')
  const [userStudents, setUserStudents] = useState<string[]>([])
  const [error, setError] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('Global')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  useEffect(() => {
    if (isOpen && user) {
      fetchLeaderboard()
      fetchUserStudents()
    }
  }, [isOpen, user, activeType, levelFilter])

  const fetchUserStudents = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)

      if (error) throw error
      setUserStudents(data?.map(s => s.id) || [])
    } catch (error) {
      console.error('Error fetching user students:', error)
    }
  }

  const fetchLeaderboard = async () => {
    setLoading(true)
    setError('')

    try {
      console.log('Fetching leaderboard data from view...')
      
      let query = supabase
        .from('leaderboard_data')
        .select('*')
      
      if (levelFilter !== 'Global') {
        query = query.eq('student_level', levelFilter)
      }

      const { data: leaderboardData, error } = await query

      if (error) {
        console.error('Error fetching leaderboard:', error)
        throw error
      }

      console.log('Raw leaderboard data:', leaderboardData)

      if (!leaderboardData || leaderboardData.length === 0) {
        console.log('No leaderboard data found')
        setLeaderboard([])
        return
      }

      let processedData: LeaderboardEntry[] = leaderboardData.map(entry => ({
        student_id: entry.student_id,
        student_name: entry.student_name,
        student_level: entry.student_level,
        student_school: entry.student_school,
        total_xp: entry.total_xp || 0,
        total_exams: entry.total_exams || 0,
        average_score: entry.average_score || 0,
        best_score: entry.best_score || 0,
        last_exam_date: entry.last_exam_date,
        rank: 0
      }))

      switch (activeType) {
        case 'xp':
          processedData.sort((a, b) => b.total_xp - a.total_xp)
          break
        case 'exams':
          processedData.sort((a, b) => b.total_exams - a.total_exams)
          break
        case 'scores':
          processedData = processedData.filter(entry => entry.total_exams > 0 && entry.average_score > 0)
          processedData.sort((a, b) => b.average_score - a.average_score)
          break
      }

      processedData = processedData.map((entry, index) => ({
        ...entry,
        rank: index + 1
      }))

      console.log('Processed leaderboard data:', processedData)
      setLeaderboard(processedData)
    } catch (error: any) {
      console.error('Error fetching leaderboard:', error)
      setError(error.message || 'Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-4 h-4 text-yellow-500" />
      case 2:
        return <Medal className="w-4 h-4 text-gray-400" />
      case 3:
        return <Medal className="w-4 h-4 text-orange-500" />
      default:
        return <span className="w-4 h-4 flex items-center justify-center text-blue-600 font-bold text-xs">#{rank}</span>
    }
  }

  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-400'
      case 2:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-400'
      case 3:
        return 'bg-gradient-to-r from-orange-100 to-red-100 border-orange-400'
      default:
        return 'bg-white border-gray-200'
    }
  }

  const getTypeLabel = (type: LeaderboardType) => {
    switch (type) {
      case 'xp':
        return 'Experience Points'
      case 'exams':
        return 'Exams Completed'
      case 'scores':
        return 'Average Score'
    }
  }

  const getTypeValue = (entry: LeaderboardEntry, type: LeaderboardType) => {
    switch (type) {
      case 'xp':
        return `${entry.total_xp} XP`
      case 'exams':
        return `${entry.total_exams} exams`
      case 'scores':
        return `${entry.average_score}%`
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-hidden flex flex-col border border-white/50">
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
          <div className="p-4 sm:p-6 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-amber-500 rounded-xl p-3 mr-4 shadow-sm">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Global Leaderboard</h2>
                  <p className="text-sm text-slate-600 hidden sm:block">See how you rank among students worldwide</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="relative">
                  {isPremium ? (
                    <select
                      value={levelFilter}
                      onChange={(e) => setLevelFilter(e.target.value)}
                      className="bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-lg px-3 py-2 text-sm font-medium hover:bg-white/30 transition-all duration-200 appearance-none pr-8"
                    >
                      <option value="Global" className="bg-blue-600 text-white">Global</option>
                      <option value="Darjah 1" className="bg-blue-600 text-white">Darjah 1</option>
                      <option value="Darjah 2" className="bg-blue-600 text-white">Darjah 2</option>
                      <option value="Darjah 3" className="bg-blue-600 text-white">Darjah 3</option>
                      <option value="Darjah 4" className="bg-blue-600 text-white">Darjah 4</option>
                      <option value="Darjah 5" className="bg-blue-600 text-white">Darjah 5</option>
                      <option value="Darjah 6" className="bg-blue-600 text-white">Darjah 6</option>
                    </select>
                  ) : (
                    <div className="text-center py-8 bg-amber-50 border-2 border-amber-200 rounded-lg">
                      <div className="bg-amber-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-amber-600" />
                      </div>
                      <h3 className="text-xl font-bold text-amber-800 mb-2">Premium Feature</h3>
                      <p className="text-amber-700 text-base mb-2">
                        Upgrade to Premium to access advanced leaderboard features!
                      </p>
                      <p className="text-amber-600 text-sm mb-6">
                        View rankings by exams completed, scores, and filter by education level.
                      </p>
                      <Button
                        variant="warning"
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                        icon={<Crown className="w-5 h-5" />}
                        onClick={() => setShowUpgradeModal(true)}
                      >
                        Upgrade to Premium
                      </Button>
                    </div>
                  )}
                  {isPremium && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600 transition-colors rounded-lg p-2 hover:bg-slate-100"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-slate-200 bg-slate-50">
          <div className="flex">
            {[
              { id: 'xp', label: 'XP Points', icon: Star, premium: false },
              { id: 'exams', label: 'Exams', icon: Target, premium: true },
              { id: 'scores', label: 'Scores', icon: TrendingUp, premium: true }
            ].map((type) => {
              const Icon = type.icon
              const isLocked = type.premium && !isPremium
              
              return (
                <button
                  key={type.id}
                  onClick={() => !isLocked && setActiveType(type.id as LeaderboardType)}
                  className={`flex-1 px-3 py-3 font-medium transition-all duration-200 text-sm ${
                    activeType === type.id
                      ? 'bg-amber-500 text-white border-b-2 border-amber-600'
                      : isLocked
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    {isLocked ? (
                      <>
                        <Lock className="w-3 h-3 mr-1" />
                        <span>{type.label}</span>
                        <Crown className="w-3 h-3 ml-1 text-amber-500" />
                      </>
                    ) : (
                      <>
                        <Icon className="w-4 h-4 mr-2" />
                        {type.label}
                      </>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-4 overflow-visible">
            {loading ? (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-200 border-t-amber-500 mx-auto mb-3"></div>
                <p className="text-amber-600 font-medium text-sm">Loading global leaderboard...</p>
              </div>
            ) : error ? (
              <div className="text-center py-6">
                <div className="bg-red-100 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-3">
                  <X className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-base font-medium text-red-800 mb-1">Error Loading Leaderboard</h3>
                <p className="text-red-600 text-sm mb-3">{error}</p>
                <Button onClick={fetchLeaderboard} variant="error" size="sm">
                  Try Again
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-3">
                  <h3 className="text-base font-bold text-center bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                    Top Students by {getTypeLabel(activeType)}
                  </h3>
                  <p className="text-xs text-blue-600 text-center mt-1">
                    {leaderboard.length} students competing {levelFilter === 'Global' ? 'worldwide' : `in ${levelFilter}`}
                  </p>
                </div>

                {leaderboard.length > 0 ? (
                  <div className="space-y-1.5 sm:space-y-2 max-h-72 overflow-y-auto">
                    {leaderboard.slice(0, 50).map((entry) => {
                      const isUserStudent = userStudents.includes(entry.student_id)
                      
                      return (
                        <div
                          key={entry.student_id}
                          className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.01] sm:hover:scale-102 hover:shadow-md sm:hover:shadow-lg ${
                            entry.rank === 1
                              ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-400'
                              : entry.rank === 2
                              ? 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-400'
                              : entry.rank === 3
                              ? 'bg-gradient-to-r from-orange-100 to-orange-200 border-orange-400'
                              : isUserStudent 
                              ? 'bg-gradient-to-r from-indigo-100 to-blue-100 border-indigo-400 ring-1 sm:ring-2 ring-indigo-200'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`mr-2 sm:mr-3 flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full font-bold relative overflow-hidden ${
                                entry.rank === 1 
                                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' 
                                  : entry.rank === 2
                                  ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                                  : entry.rank === 3
                                  ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {entry.rank <= 3 && (
                                  <div className={`absolute inset-0 rounded-full animate-inner-pulse ${
                                    entry.rank === 1 ? 'bg-yellow-300/50' :
                                    entry.rank === 2 ? 'bg-gray-300/50' :
                                    'bg-orange-300/50'
                                  }`}></div>
                                )}
                                <span className="relative z-10 text-xs sm:text-sm font-bold">
                                  {entry.rank}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className={`font-bold text-xs sm:text-sm flex items-center ${
                                  entry.rank === 1 ? 'text-yellow-700' :
                                  entry.rank === 2 ? 'text-gray-700' :
                                  entry.rank === 3 ? 'text-orange-700' :
                                  isUserStudent ? 'text-indigo-700' : 'text-gray-800'
                                }`}>
                                  <span className="truncate">{entry.student_name}</span>
                                  {isUserStudent && <span className="ml-1 sm:ml-2 text-indigo-500 flex-shrink-0 text-xs">(Your Kid)</span>}
                                </div>
                                <div className={`text-[10px] sm:text-xs ${
                                  entry.rank === 1 ? 'text-yellow-600' :
                                  entry.rank === 2 ? 'text-gray-600' :
                                  entry.rank === 3 ? 'text-orange-600' :
                                  isUserStudent ? 'text-indigo-600' : 'text-gray-600'
                                } truncate`}>
                                  {entry.student_level} • {entry.student_school}
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className={`text-xs sm:text-sm font-bold ${
                                entry.rank === 1 ? 'text-yellow-700' : 
                                entry.rank === 2 ? 'text-gray-700' : 
                                entry.rank === 3 ? 'text-orange-700' : 
                                isUserStudent ? 'text-indigo-700' : 
                                'text-gray-800'
                              }`}>
                                {getTypeValue(entry, activeType)}
                              </div>
                              {activeType === 'xp' && entry.total_exams > 0 && (
                                <div className={`text-[9px] sm:text-xs ${
                                  entry.rank === 1 ? 'text-yellow-600' :
                                  entry.rank === 2 ? 'text-gray-600' :
                                  entry.rank === 3 ? 'text-orange-600' :
                                  isUserStudent ? 'text-indigo-600' : 'text-gray-500'
                                } hidden sm:block`}>
                                  {entry.total_exams} exams • {entry.average_score}% avg
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="bg-amber-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <Trophy className="w-6 h-6 text-amber-600" />
                    </div>
                    <p className="text-amber-600 text-base">No data available yet!</p>
                    <p className="text-amber-500 text-xs">Students need to complete exams to appear on the leaderboard!</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="border-t border-slate-200 bg-slate-50 p-3 sm:p-4">
          <Button
            onClick={onClose}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white text-sm py-3 font-medium transition-colors"
          >
            Close Leaderboard
          </Button>
        </div>
      </div>
      
      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  )
}