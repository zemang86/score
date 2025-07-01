import React, { useState, useEffect } from 'react'
import { X, Lightbulb, ArrowRight } from 'lucide-react'
import { Button } from '../ui/Button'

interface WelcomeTooltipProps {
  isVisible: boolean
  onClose: () => void
  title: string
  description: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function WelcomeTooltip({ 
  isVisible, 
  onClose, 
  title, 
  description, 
  position = 'bottom',
  className = '' 
}: WelcomeTooltipProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShow(true), 500)
      return () => clearTimeout(timer)
    } else {
      setShow(false)
    }
  }, [isVisible])

  if (!show) return null

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2'
  }

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-indigo-500',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-indigo-500',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-indigo-500',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-indigo-500'
  }

  return (
    <div className={`absolute z-50 ${positionClasses[position]} ${className}`}>
      <div className="bg-indigo-500 text-white rounded-2xl p-4 shadow-2xl max-w-sm animate-scale-in border-2 border-indigo-600">
        {/* Arrow */}
        <div className={`absolute w-0 h-0 border-8 ${arrowClasses[position]}`}></div>
        
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <Lightbulb className="w-5 h-5 text-amber-300 mr-2 flex-shrink-0" />
            <h3 className="font-bold text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-indigo-100 text-sm leading-relaxed mb-4">
          {description}
        </p>
        
        <Button
          onClick={onClose}
          size="sm"
          className="bg-white text-indigo-600 hover:bg-indigo-50 w-full"
          icon={<ArrowRight className="w-4 h-4" />}
        >
          Got it!
        </Button>
      </div>
    </div>
  )
}