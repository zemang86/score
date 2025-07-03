import React, { useState } from 'react'
import { Button } from '../ui/Button'
import { X, Users, BookOpen, Trophy, Play, CheckCircle, ArrowRight, Sparkles } from 'lucide-react'

interface QuickStartGuideProps {
  isOpen: boolean
  onClose: () => void
  onAddStudent: () => void
  hasStudents: boolean
}

export function QuickStartGuide({ isOpen, onClose, onAddStudent, hasStudents }: QuickStartGuideProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const steps = [
    {
      id: 1,
      title: "Add Your First Child",
      description: "Create a student profile to get started",
      icon: Users,
      action: "Add Student",
      onAction: onAddStudent,
      completed: hasStudents,
      color: "from-green-500 to-emerald-500"
    },
    {
      id: 2,
      title: "Start First Exam",
      description: "Choose Easy Mode for a gentle introduction",
      icon: BookOpen,
      action: "Start Exam",
      onAction: () => {},
      completed: false,
      color: "from-blue-500 to-indigo-500"
    },
    {
      id: 3,
      title: "Track Progress",
      description: "Watch XP grow and badges unlock",
      icon: Trophy,
      action: "View Progress",
      onAction: () => {},
      completed: false,
      color: "from-amber-500 to-orange-500"
    }
  ]

  const handleStepComplete = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId])
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-xl max-w-md w-full max-h-[95vh] overflow-hidden flex flex-col">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="p-3 sm:p-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white/20 rounded-lg p-2 mr-3">
                  <Play className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">Quick Start Guide</h1>
                  <p className="text-indigo-100 text-xs">Get up and running in 3 easy steps</p>
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-4 space-y-2">
            {steps.map((step, index) => {
              const isCompleted = step.completed || completedSteps.includes(step.id)
              const isActive = !isCompleted && (index === 0 || steps[index - 1].completed || completedSteps.includes(steps[index - 1].id))
              
              return (
                <div
                  key={step.id}
                  className={`relative p-3 rounded-lg border transition-all duration-300 ${
                    isCompleted
                      ? 'bg-green-50 border-green-300'
                      : isActive
                      ? 'bg-white border-indigo-300 shadow-sm'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                        isCompleted
                          ? 'bg-green-500'
                          : isActive
                          ? `bg-gradient-to-r ${step.color}`
                          : 'bg-gray-300'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-white" />
                        ) : (
                          <step.icon className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className={`font-bold text-sm ${
                          isCompleted ? 'text-green-700' : isActive ? 'text-gray-800' : 'text-gray-500'
                        }`}>
                          {step.title}
                        </h3>
                        <p className={`text-xs ${
                          isCompleted ? 'text-green-600' : isActive ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                    
                    {isActive && !isCompleted && (
                      <Button
                        onClick={() => {
                          step.onAction()
                          handleStepComplete(step.id)
                        }}
                        className={`bg-gradient-to-r ${step.color} text-white text-xs py-1 px-2`}
                        icon={<ArrowRight className="w-3.5 h-3.5" />}
                      >
                        {step.action}
                      </Button>
                    )}
                    
                    {isCompleted && (
                      <div className="text-green-600 font-medium text-xs">
                        ✅ Completed
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <Sparkles className="w-4 h-4 mr-1.5" />
              <span className="text-xs">Complete all steps to unlock the full experience!</span>
            </div>
            <Button
              onClick={onClose}
              variant="outline"
              className="text-sm py-1.5 px-3 border border-gray-300"
            >
              Close Guide
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}