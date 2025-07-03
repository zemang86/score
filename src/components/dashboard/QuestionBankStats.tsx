import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { BookOpen, Clock, Database } from 'lucide-react'

interface QuestionStats {
  level: string
  count: number
}

interface Question {
  level: string
  created_at: string
}

export function QuestionBankStats() {
  const [questionStats, setQuestionStats] = useState<QuestionStats[]>([])
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [loading, setLoading] = useState(true)

  // All Malaysian education levels
  const allLevels = [
    'Darjah 1', 'Darjah 2', 'Darjah 3', 'Darjah 4', 'Darjah 5', 'Darjah 6',
    'Tingkatan 1', 'Tingkatan 2', 'Tingkatan 3', 'Tingkatan 4', 'Tingkatan 5'
  ]

  useEffect(() => {
    fetchQuestionStats()
  }, [])

  const fetchQuestionStats = async () => {
    try {
      setLoading(true)

      // Fetch question counts per level
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('level, created_at')

      if (questionsError) throw questionsError

      // Group questions by level and count them
      const levelCounts = allLevels.map(level => {
        const count = questions?.filter((q: Question) => 
          q.level.toLowerCase().trim() === level.toLowerCase().trim()
        ).length || 0
        return { level, count }
      })

      setQuestionStats(levelCounts)

      // Get the most recent question update time
      if (questions && questions.length > 0) {
        const mostRecentDate = questions
          .map((q: Question) => new Date(q.created_at))
          .sort((a: Date, b: Date) => b.getTime() - a.getTime())[0]
        
        setLastUpdated(mostRecentDate.toLocaleDateString('en-MY', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }))
      }

    } catch (error) {
      console.error('Error fetching question stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalQuestions = questionStats.reduce((sum, stat) => sum + stat.count, 0)

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-white/30 shadow-md">
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg p-2 mr-3 shadow-sm">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Question Bank Overview</h3>
              <p className="text-sm text-slate-600">
                Total: {totalQuestions} questions across all levels
              </p>
            </div>
          </div>
          {lastUpdated && (
            <div className="flex items-center text-sm text-slate-500">
              <Clock className="w-4 h-4 mr-1" />
              <span>Updated: {lastUpdated}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-slate-600">Loading question statistics...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {questionStats.map((stat) => (
              <div 
                key={stat.level}
                className="bg-slate-50 rounded-lg p-3 border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    stat.count === 0 
                      ? 'bg-red-100 text-red-700' 
                      : stat.count < 10 
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {stat.count}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {stat.level}
                  </p>
                  <p className="text-xs text-slate-500">
                    {stat.count === 0 ? 'No questions' : 
                     stat.count === 1 ? '1 question' : 
                     `${stat.count} questions`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}