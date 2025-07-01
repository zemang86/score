import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'
import { X, Trophy, Crown, Star, Medal, Target, TrendingUp } from 'lucide-react'

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
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState<LeaderboardType>('xp')
  const [userStudents, setUserStudents] = useState<string[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && user) {
      fetchLeaderboard()
      fetchUserStudents()
    }
  }, [isOpen, user, activeType])

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
      
      // Fetch data from the leaderboard_data view
      const { data: leaderboardData, error } = await supabase
        .from('leaderboard_data')
        .select('*')

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

      // Process the data and sort based on active type
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
        rank: 0 // Will be set after sorting
      }))

      // Sort based on active type
      switch (activeType) {
        case 'xp':
          processedData.sort((a, b) => b.total_xp - a.total_xp)
          break
        case 'exams':
          processedData.sort((a, b) => b.total_exams - a.total_exams)
          break
        case 'scores':
          processedData.sort((a, b) => b.average_score - a.average_score)
          break
      }

      // Assign ranks after sorting
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
        return <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
      case 2:
        return <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-400" />
      case 3:
        return <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
      default:
        return <span className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-indigo-600 font-bold text-xs sm:text-sm">#{rank}</span>
    }
  }

  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-amber-100 to-amber-200 border-amber-400'
      case 2:
        return 'bg-gradient-to-r from-neutral-100 to-neutral-200 border-neutral-400'
      case 3:
        return 'bg-gradient-to-r from-amber-100 to-orange-100 border-amber-400'
      default:
        return 'bg-white border-slate-200'
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-200 bg-gradient-to-r from-amber-100 to-amber-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-amber-500 rounded-full p-2 sm:p-3 mr-3 sm:mr-4 shadow-lg">
                <Trophy className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-amber-800">Global Leaderboard</h2>
                <p className="text-amber-700 text-xs sm:text-base">See how students are performing worldwide!</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 transition-colors bg-white rounded-full p-1.5 sm:p-2 shadow-sm"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Type Selection */}
        <div className="border-b border-neutral-200 bg-neutral-50">
          <div className="flex">
            {[
              { id: 'xp', label: 'XP Points', icon: Star },
              { id: 'exams', label: 'Exams', icon: Target },
              { id: 'scores', label: 'Scores', icon: TrendingUp }
            ].map((type) => {
              const Icon = type.icon
              return (
                <button
                  key={type.id}
                  onClick={() => setActiveType(type.id as LeaderboardType)}
                  className={`flex-1 px-3 py-2 sm:px-4 sm:py-3 font-medium transition-all duration-300 text-xs sm:text-base ${
                    activeType === type.id
                      ? 'bg-amber-500 text-white border-b-2 border-amber-700'
                      : 'text-amber-600 hover:bg-amber-100'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
                  {type.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="text-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-16 sm:w-16 border-4 border-amber-200 border-t-amber-500 mx-auto mb-4 sm:mb-6"></div>
              <p className="text-amber-600 font-medium text-base sm:text-xl">Loading global leaderboard...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 sm:py-12">
              <div className="bg-red-100 rounded-full w-10 h-10 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <X className="w-5 h-5 sm:w-8 sm:h-8 text-red-600" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-red-800 mb-1 sm:mb-2">Error Loading Leaderboard</h3>
              <p className="text-red-600 text-sm sm:text-base mb-3 sm:mb-4">{error}</p>
              <Button onClick={fetchLeaderboard} variant="error" size="sm">
                Try Again
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-bold text-amber-700 text-center">
                  Top Students by {getTypeLabel(activeType)}
                </h3>
                <p className="text-xs sm:text-sm text-amber-600 text-center mt-1">
                  Showing {leaderboard.length} students from around the world
                </p>
              </div>

              {leaderboard.length > 0 ? (
                <div className="space-y-2 sm:space-y-3 max-h-72 sm:max-h-96 overflow-y-auto">
                  {leaderboard.slice(0, 50).map((entry) => {
                    const isUserStudent = userStudents.includes(entry.student_id)
                    
                    return (
                      <div
                        key={entry.student_id}
                        className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-300 ${
                          isUserStudent 
                            ? 'bg-gradient-to-r from-indigo-100 to-blue-100 border-indigo-400 ring-2 ring-indigo-200' 
                            : getRankBgColor(entry.rank)
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="mr-3 sm:mr-4 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10">
                              {getRankIcon(entry.rank)}
                            </div>
                            <div>
                              <div className={`font-bold text-sm sm:text-lg ${isUserStudent ? 'text-indigo-700' : 'text-slate-800'}`}>
                                {entry.student_name}
                                {isUserStudent && <span className="ml-2 text-indigo-500">👨‍👩‍👧‍👦</span>}
                              </div>
                              <div className={`text-xs ${isUserStudent ? 'text-indigo-600' : 'text-slate-600'}`}>
                                {entry.student_level} • {entry.student_school}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-base sm:text-xl font-bold ${isUserStudent ? 'text-indigo-700' : 'text-slate-800'}`}>
                              {getTypeValue(entry, activeType)}
                            </div>
                            {activeType === 'xp' && entry.total_exams > 0 && (
                              <div className={`text-xs ${isUserStudent ? 'text-indigo-600' : 'text-slate-500'}`}>
                                {entry.total_exams} exams • {entry.average_score}% avg
                              </div>
                            )}
                            {activeType === 'exams' && entry.total_xp > 0 && (
                              <div className={`text-xs ${isUserStudent ? 'text-indigo-600' : 'text-slate-500'}`}>
                                {entry.total_xp} XP • {entry.average_score}% avg
                              </div>
                            )}
                            {activeType === 'scores' && entry.total_exams > 0 && (
                              <div className={`text-xs ${isUserStudent ? 'text-indigo-600' : 'text-slate-500'}`}>
                                {entry.total_exams} exams • {entry.total_xp} XP
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <div className="bg-amber-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" />
                  </div>
                  <p className="text-amber-600 text-base sm:text-lg">No data available yet!</p>
                  <p className="text-amber-500 text-xs sm:text-sm">Students need to complete exams to appear on the leaderboard!</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-neutral-200 bg-neutral-50">
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white text-sm sm:text-base py-2.5 sm:py-3"
            icon={<Trophy className="w-5 h-5 sm:w-6 sm:h-6" />}
          >
            Keep Learning!
          </Button>
        </div>
      </div>
    </div>
  )
}