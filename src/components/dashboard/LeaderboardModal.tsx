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
  total_xp: number
  total_exams: number
  average_score: number
  rank: number
}

type LeaderboardType = 'xp' | 'exams' | 'scores'

export function LeaderboardModal({ isOpen, onClose }: LeaderboardModalProps) {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState<LeaderboardType>('xp')
  const [userStudents, setUserStudents] = useState<string[]>([])

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

    try {
      let query = `
        students!inner (
          id,
          name,
          level,
          xp
        ),
        exams!left (
          score,
          completed
        )
      `

      const { data: studentsData, error } = await supabase
        .from('students')
        .select(`
          id,
          name,
          level,
          xp,
          exams!students_id_fkey (
            score,
            completed
          )
        `)
        .order('xp', { ascending: false })

      if (error) throw error

      // Process the data to calculate leaderboard metrics
      const processedData: LeaderboardEntry[] = (studentsData || []).map((student, index) => {
        const completedExams = student.exams?.filter(exam => exam.completed) || []
        const scores = completedExams.map(exam => exam.score).filter(score => score !== null)
        const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0

        return {
          student_id: student.id,
          student_name: student.name,
          student_level: student.level,
          total_xp: student.xp || 0,
          total_exams: completedExams.length,
          average_score: averageScore,
          rank: index + 1
        }
      })

      // Sort based on active type
      let sortedData = [...processedData]
      switch (activeType) {
        case 'xp':
          sortedData.sort((a, b) => b.total_xp - a.total_xp)
          break
        case 'exams':
          sortedData.sort((a, b) => b.total_exams - a.total_exams)
          break
        case 'scores':
          sortedData.sort((a, b) => b.average_score - a.average_score)
          break
      }

      // Update ranks after sorting
      sortedData = sortedData.map((entry, index) => ({
        ...entry,
        rank: index + 1
      }))

      setLeaderboard(sortedData)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-roblox-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Medal className="w-6 h-6 text-orange-500" />
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-roblox-blue-600 font-bold-game">#{rank}</span>
    }
  }

  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-roblox-yellow-100 to-roblox-orange-100 border-roblox-yellow-400'
      case 2:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-400'
      case 3:
        return 'bg-gradient-to-r from-orange-100 to-red-100 border-orange-400'
      default:
        return 'bg-white border-roblox-blue-200'
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
      <div className="bg-white rounded-3xl shadow-roblox-hover max-w-2xl w-full max-h-[90vh] overflow-y-auto border-4 border-roblox-yellow-300">
        
        {/* Header */}
        <div className="p-6 border-b-4 border-roblox-yellow-200 bg-gradient-to-r from-roblox-yellow-100 to-roblox-orange-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-roblox-yellow-500 rounded-full p-3 mr-4 shadow-neon-yellow">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold-game text-roblox-yellow-600">🏆 Leaderboard 🏆</h2>
                <p className="text-roblox-orange-600 font-game">See how students are performing!</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-roblox-yellow-500 hover:text-roblox-yellow-700 transition-colors bg-white rounded-full p-2 shadow-roblox"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Type Selection */}
        <div className="border-b-4 border-roblox-yellow-200 bg-roblox-yellow-50">
          <div className="flex">
            {[
              { id: 'xp', label: '⭐ XP Points', icon: Star },
              { id: 'exams', label: '📝 Exams', icon: Target },
              { id: 'scores', label: '📊 Scores', icon: TrendingUp }
            ].map((type) => {
              const Icon = type.icon
              return (
                <button
                  key={type.id}
                  onClick={() => setActiveType(type.id as LeaderboardType)}
                  className={`flex-1 px-4 py-3 font-game font-bold transition-all duration-300 ${
                    activeType === type.id
                      ? 'bg-roblox-yellow-500 text-white border-b-4 border-roblox-yellow-700'
                      : 'text-roblox-yellow-600 hover:bg-roblox-yellow-100'
                  }`}
                >
                  <Icon className="w-5 h-5 inline mr-2" />
                  {type.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-8 border-roblox-yellow-200 border-t-roblox-yellow-500 mx-auto mb-6 shadow-roblox"></div>
              <p className="text-roblox-yellow-600 font-game font-bold text-xl">🎮 Loading leaderboard... 🎮</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-bold-game text-roblox-yellow-700 text-center">
                  🏅 Top Students by {getTypeLabel(activeType)} 🏅
                </h3>
              </div>

              {leaderboard.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {leaderboard.slice(0, 20).map((entry) => {
                    const isUserStudent = userStudents.includes(entry.student_id)
                    
                    return (
                      <div
                        key={entry.student_id}
                        className={`p-4 rounded-2xl border-4 shadow-roblox transition-all duration-300 ${
                          isUserStudent 
                            ? 'bg-gradient-to-r from-roblox-blue-100 to-roblox-purple-100 border-roblox-blue-400 ring-4 ring-roblox-blue-200' 
                            : getRankBgColor(entry.rank)
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="mr-4 flex items-center justify-center w-10 h-10">
                              {getRankIcon(entry.rank)}
                            </div>
                            <div>
                              <div className={`font-bold-game text-lg ${isUserStudent ? 'text-roblox-blue-700' : 'text-gray-800'}`}>
                                {entry.student_name}
                                {isUserStudent && <span className="ml-2 text-roblox-blue-500">👨‍👩‍👧‍👦</span>}
                              </div>
                              <div className={`text-sm font-game ${isUserStudent ? 'text-roblox-purple-600' : 'text-gray-600'}`}>
                                {entry.student_level}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-xl font-bold-game ${isUserStudent ? 'text-roblox-blue-700' : 'text-gray-800'}`}>
                              {getTypeValue(entry, activeType)}
                            </div>
                            {activeType === 'xp' && entry.total_exams > 0 && (
                              <div className={`text-xs font-game ${isUserStudent ? 'text-roblox-purple-600' : 'text-gray-500'}`}>
                                {entry.total_exams} exams • {entry.average_score}% avg
                              </div>
                            )}
                            {activeType === 'exams' && entry.total_xp > 0 && (
                              <div className={`text-xs font-game ${isUserStudent ? 'text-roblox-purple-600' : 'text-gray-500'}`}>
                                {entry.total_xp} XP • {entry.average_score}% avg
                              </div>
                            )}
                            {activeType === 'scores' && entry.total_exams > 0 && (
                              <div className={`text-xs font-game ${isUserStudent ? 'text-roblox-purple-600' : 'text-gray-500'}`}>
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
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-roblox-yellow-300 mx-auto mb-4" />
                  <p className="text-roblox-yellow-600 font-game text-lg">No data available yet! 🎯</p>
                  <p className="text-roblox-yellow-500 font-game">Students need to complete exams to appear on the leaderboard! 🏆</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t-4 border-roblox-yellow-200 bg-roblox-yellow-50">
          <Button
            onClick={onClose}
            className="w-full font-bold-game bg-gradient-to-r from-roblox-yellow-400 to-roblox-orange-500"
            size="lg"
            glow={true}
          >
            <Trophy className="w-6 h-6 mr-2" />
            🎯 Keep Learning! 🎯
          </Button>
        </div>
      </div>
    </div>
  )
}