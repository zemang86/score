import React, { useEffect, useRef } from 'react'
import { Clock } from 'lucide-react'

interface ExamTimerProps {
  timeLeft: number
  onTimeUpdate: (newTime: number) => void
  onTimeUp: () => void
  isActive: boolean
}

export function ExamTimer({ timeLeft, onTimeUpdate, onTimeUp, isActive }: ExamTimerProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        onTimeUpdate(timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      onTimeUp()
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, timeLeft, onTimeUpdate, onTimeUp])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getTimerColor = () => {
    if (timeLeft <= 60) return 'bg-red-600' // Last minute - red
    if (timeLeft <= 300) return 'bg-orange-500' // Last 5 minutes - orange
    return 'bg-green-500' // Normal - green
  }

  return (
    <div className={`${getTimerColor()} text-white rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 shadow-md mx-3 flex-shrink-0 ${
      timeLeft <= 60 ? 'animate-pulse' : ''
    }`}>
      <Clock className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
      <span className="font-bold text-xs sm:text-sm">{formatTime(timeLeft)}</span>
    </div>
  )
}