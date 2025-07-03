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
        return <Crown className="w-4 h-4 text-amber-500" />
      case 2:
        return <Medal className="w-4 h-4 text-gray-400" />
      case 3:
        return <Medal className="w-4 h-4 text-amber-500" />
      default:
        return <span className="w-4 h-4 flex items-center justify-center text-indigo-600 font-bold text-xs">#{rank}</span>
    }
  }

  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-amber-100 to-amber-200 border-amber-400'
      case 2:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-400'
      case 3:
        return 'bg-gradient-to-r from-amber-100 to-orange-100 border-amber-400'
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
      <div className="bg-white rounded-lg sm:rounded-xl shadow-xl max-w-2xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="p-3 sm:p-4 bg-gradient-to-r from-amber-100 to-amber-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-amber-500 rounded-lg p-2 mr-3 shadow-md">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-amber-800">Global Leaderboard</h2>
                  <p className="text-xs text-amber-700">See how students are performing worldwide!</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="bg-red-500 text-white hover:bg-red-600 transition-colors rounded-lg p-2 shadow-md"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Type Selection */}
        <div className="border-b border-gray-200 bg-gray-50">
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
                  className={`flex-1 px-3 py-2 font-medium transition-all duration-300 text-xs ${
                    activeType === type.id
                      ? 'bg-amber-500 text-white border-b-2 border-amber-700'
                      : 'text-amber-600 hover:bg-amber-100'
                  }`}
                >
                  <Icon className="w-4 h-4 inline mr-1" />
                  {type.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-4">
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
                  <h3 className="text-base font-bold text-amber-700 text-center">
                    Top Students by {getTypeLabel(activeType)}
                  </h3>
                  <p className="text-xs text-amber-600 text-center mt-1">
                    Showing {leaderboard.length} students from around the world
                  </p>
                </div>

                {leaderboard.length > 0 ? (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {leaderboard.slice(0, 50).map((entry) => {
                      const isUserStudent = userStudents.includes(entry.student_id)
                      
                      return (
                        <div
                          key={entry.student_id}
                          className={`p-2.5 rounded-lg border transition-all duration-300 ${
                            isUserStudent 
                              ? 'bg-gradient-to-r from-indigo-100 to-blue-100 border-indigo-400 ring-1 ring-indigo-200' 
                              : getRankBgColor(entry.rank)
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="mr-2 flex items-center justify-center w-6 h-6">
                                {getRankIcon(entry.rank)}
                              </div>
                              <div>
                                <div className={`font-bold text-sm ${isUserStudent ? 'text-indigo-700' : 'text-gray-800'}`}>
                                  {entry.student_name}
                                  {isUserStudent && <span className="ml-1 text-indigo-500">👨‍👩‍👧‍👦</span>}
                                </div>
                                <div className={`text-xs ${isUserStudent ? 'text-indigo-600' : 'text-gray-600'}`}>
                                  {entry.student_level} • {entry.student_school}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-sm font-bold ${isUserStudent ? 'text-indigo-700' : 'text-gray-800'}`}>
                                {getTypeValue(entry, activeType)}
                              </div>
                              {activeType === 'xp' && entry.total_exams > 0 && (
                                <div className={`text-xs ${isUserStudent ? 'text-indigo-600' : 'text-gray-500'}`}>
                                  {entry.total_exams} exams • {entry.average_score}% avg
                                </div>
                              )}
                              {activeType === 'exams' && entry.total_xp > 0 && (
                                <div className={`text-xs ${isUserStudent ? 'text-indigo-600' : 'text-gray-500'}`}>
                                  {entry.total_xp} XP • {entry.average_score}% avg
                                </div>
                              )}
                              {activeType === 'scores' && entry.total_exams > 0 && (
                                <div className={`text-xs ${isUserStudent ? 'text-indigo-600' : 'text-gray-500'}`}>
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

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-3 sm:p-4">
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white text-sm py-2"
            icon={<Trophy className="w-4 h-4" />}
          >
            Keep Learning!
          </Button>
        </div>
      </div>
    </div>
  )
}