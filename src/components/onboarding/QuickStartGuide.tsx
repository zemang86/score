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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 rounded-full p-3 mr-4">
                <Play className="w-8 h-8 text-amber-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Quick Start Guide</h1>
                <p className="text-indigo-100">Get up and running in 3 easy steps</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors bg-white/20 rounded-full p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {steps.map((step, index) => {
            const isCompleted = step.completed || completedSteps.includes(step.id)
            const isActive = !isCompleted && (index === 0 || steps[index - 1].completed || completedSteps.includes(steps[index - 1].id))
            
            return (
              <div
                key={step.id}
                className={`relative p-4 rounded-2xl border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-green-50 border-green-300'
                    : isActive
                    ? 'bg-white border-indigo-300 shadow-lg'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 ${
                      isCompleted
                        ? 'bg-green-500'
                        : isActive
                        ? `bg-gradient-to-r ${step.color}`
                        : 'bg-slate-300'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : (
                        <step.icon className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className={`font-bold text-lg ${
                        isCompleted ? 'text-green-700' : isActive ? 'text-slate-800' : 'text-slate-500'
                      }`}>
                        {step.title}
                      </h3>
                      <p className={`text-sm ${
                        isCompleted ? 'text-green-600' : isActive ? 'text-slate-600' : 'text-slate-400'
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
                      className={`bg-gradient-to-r ${step.color} text-white`}
                      icon={<ArrowRight className="w-4 h-4" />}
                    >
                      {step.action}
                    </Button>
                  )}
                  
                  {isCompleted && (
                    <div className="text-green-600 font-medium text-sm">
                      ✅ Completed
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 rounded-b-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-slate-600">
              <Sparkles className="w-5 h-5 mr-2" />
              <span className="text-sm">Complete all steps to unlock the full experience!</span>
            </div>
            <Button
              onClick={onClose}
              variant="outline"
              className="border-2 border-slate-300 hover:border-slate-400"
            >
              Close Guide
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}