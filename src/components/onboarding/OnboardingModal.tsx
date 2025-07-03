import React, { useState } from 'react'
import { Button } from '../ui/Button'
import { X, Users, BookOpen, Trophy, Target, ArrowRight, ArrowLeft, Star, Zap, Crown, Gift, CheckCircle, Play } from 'lucide-react'

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  userName: string
}

interface OnboardingStep {
  id: number
  title: string
  description: string
  icon: React.ComponentType<any>
  content: React.ReactNode
  bgGradient: string
  iconColor: string
}

export function OnboardingModal({ isOpen, onClose, onComplete, userName }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: "Welcome to Edventure+!",
      description: "Your family's learning adventure starts here",
      icon: Crown,
      bgGradient: "from-indigo-500 to-purple-500",
      iconColor: "text-amber-400",
      content: (
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mx-auto flex items-center justify-center shadow-lg">
              <Crown className="w-10 h-10 text-amber-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center animate-bounce">
              <Star className="w-4 h-4 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Welcome, {userName}! 🎉
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              You've just joined Malaysia's most engaging learning platform! 
              Let's take a quick tour to help you get started with your children's educational journey.
            </p>
          </div>
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 rounded-lg p-3">
            <div className="flex items-center justify-center text-green-700 mb-1">
              <Gift className="w-4 h-4 mr-1.5" />
              <span className="font-bold text-sm">Special Launch Offer!</span>
            </div>
            <p className="text-green-600 text-xs">
              You currently have <strong>Premium Access</strong> with unlimited exams and up to 3 children!
            </p>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Add Your Children",
      description: "Create profiles for your kids to start their learning journey",
      icon: Users,
      bgGradient: "from-green-500 to-emerald-500",
      iconColor: "text-white",
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mx-auto flex items-center justify-center shadow-md mb-3">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Step 1: Add Your Children</h3>
            <p className="text-gray-600 text-sm">
              Start by adding profiles for each of your children. We'll need some basic information to personalize their learning experience.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-green-200 shadow-sm">
            <h4 className="font-bold text-green-700 mb-2 flex items-center text-sm">
              <CheckCircle className="w-4 h-4 mr-1.5" />
              What You'll Need:
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                <div>
                  <strong>Child's Full Name:</strong> For personalized greetings and certificates
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                <div>
                  <strong>School Name:</strong> To connect with their current education
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                <div>
                  <strong>Education Level:</strong> From Darjah 1 to Tingkatan 5
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                <div>
                  <strong>Date of Birth:</strong> For age-appropriate content
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-2.5">
            <p className="text-green-700 text-center font-medium text-xs">
              💡 <strong>Pro Tip:</strong> You can add up to 3 children with your Premium account!
            </p>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Choose Exam Modes",
      description: "Pick the right difficulty level for your child's learning pace",
      icon: Target,
      bgGradient: "from-blue-500 to-indigo-500",
      iconColor: "text-white",
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full mx-auto flex items-center justify-center shadow-md mb-3">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Step 2: Choose Exam Modes</h3>
            <p className="text-gray-600 text-sm">
              We offer three difficulty levels to match your child's learning pace and confidence level.
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="bg-green-50 border border-green-300 rounded-lg p-2.5">
              <div className="flex items-center mb-1">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-2">E</div>
                <h4 className="font-bold text-green-700 text-sm">Easy Mode</h4>
              </div>
              <p className="text-green-600 text-xs mb-1">Perfect for beginners or building confidence</p>
              <ul className="text-xs text-green-600 space-y-0.5">
                <li>• 10 Multiple Choice Questions (MCQ)</li>
                <li>• 15 minutes to complete</li>
                <li>• Great for daily practice</li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-300 rounded-lg p-2.5">
              <div className="flex items-center mb-1">
                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold mr-2">M</div>
                <h4 className="font-bold text-amber-700 text-sm">Medium Mode</h4>
              </div>
              <p className="text-amber-600 text-xs mb-1">Balanced challenge with mixed question types</p>
              <ul className="text-xs text-amber-600 space-y-0.5">
                <li>• 20-30 Mixed Questions (MCQ + Short Answer)</li>
                <li>• 30 minutes to complete</li>
                <li>• Builds problem-solving skills</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-300 rounded-lg p-2.5">
              <div className="flex items-center mb-1">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold mr-2">F</div>
                <h4 className="font-bold text-red-700 text-sm">Full Mode</h4>
              </div>
              <p className="text-red-600 text-xs mb-1">Complete exam experience for serious preparation</p>
              <ul className="text-xs text-red-600 space-y-0.5">
                <li>• 40+ All Question Types (MCQ, Short, Essay, Matching)</li>
                <li>• 60 minutes to complete</li>
                <li>• Real exam simulation</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "Track Progress & Earn Rewards",
      description: "Watch your children grow and celebrate their achievements",
      icon: Trophy,
      bgGradient: "from-amber-500 to-orange-500",
      iconColor: "text-white",
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full mx-auto flex items-center justify-center shadow-md mb-3">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Step 3: Track Progress & Rewards</h3>
            <p className="text-gray-600 text-sm">
              Learning becomes an adventure with our gamified progress tracking and achievement system.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="bg-purple-50 border border-purple-300 rounded-lg p-2.5">
              <div className="flex items-center mb-1.5">
                <Zap className="w-4 h-4 text-purple-600 mr-1.5" />
                <h4 className="font-bold text-purple-700 text-sm">XP Points System</h4>
              </div>
              <p className="text-purple-600 text-xs mb-1">Earn experience points for every correct answer!</p>
              <ul className="text-xs text-purple-600 space-y-0.5">
                <li>• 10 XP per correct answer</li>
                <li>• 50 XP bonus for perfect scores</li>
                <li>• Level up as you learn more</li>
              </ul>
            </div>

            <div className="bg-pink-50 border border-pink-300 rounded-lg p-2.5">
              <div className="flex items-center mb-1.5">
                <Star className="w-4 h-4 text-pink-600 mr-1.5" />
                <h4 className="font-bold text-pink-700 text-sm">Achievement Badges</h4>
              </div>
              <p className="text-pink-600 text-xs mb-1">Unlock special badges for milestones!</p>
              <ul className="text-xs text-pink-600 space-y-0.5">
                <li>• 🎯 First Steps (Complete first exam)</li>
                <li>• ⭐ Perfect Score (Get 100%)</li>
                <li>• 🔥 Streak Master (5 exams in a row)</li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 border border-indigo-300 rounded-lg p-2.5">
            <div className="flex items-center mb-1">
              <BookOpen className="w-4 h-4 text-indigo-600 mr-1.5" />
              <h4 className="font-bold text-indigo-700 text-sm">Detailed Analytics</h4>
            </div>
            <p className="text-indigo-600 text-xs">
              Get comprehensive reports on your children's performance, including subject-wise breakdowns, 
              improvement trends, and areas that need more focus.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: "You're All Set!",
      description: "Ready to start your family's learning adventure",
      icon: Star,
      bgGradient: "from-green-500 to-emerald-500",
      iconColor: "text-amber-400",
      content: (
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mx-auto flex items-center justify-center shadow-lg">
              <Star className="w-10 h-10 text-amber-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center animate-bounce">
              <Zap className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              You're Ready to Go! 🚀
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Your Edventure+ account is all set up! Now it's time to add your children and start their learning journey.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-300 rounded-lg p-3">
            <h3 className="font-bold text-blue-700 mb-2 text-sm">Quick Start Checklist:</h3>
            <div className="space-y-2 text-left">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <span className="text-blue-700 text-xs">Click "Add New Child" to create your first student profile</span>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <span className="text-blue-700 text-xs">Choose a subject and start with Easy Mode</span>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <span className="text-blue-700 text-xs">Watch your child earn XP and unlock achievements!</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
            <p className="text-amber-700 text-center text-xs">
              <strong>Need Help?</strong> Look for the helpful tooltips throughout the dashboard, 
              or contact our support team anytime!
            </p>
          </div>
        </div>
      )
    }
  ]

  const currentStepData = steps[currentStep]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-xl max-w-2xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className={`p-3 sm:p-4 bg-gradient-to-r ${currentStepData.bgGradient} text-white relative overflow-hidden`}>
            <div className="absolute top-3 right-3">
              <button
                onClick={onClose}
                className="bg-red-500 text-white hover:bg-red-600 transition-colors rounded-lg p-2 shadow-md"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center">
              <div className="bg-white/20 rounded-lg p-2 mr-3">
                <currentStepData.icon className={`w-5 h-5 ${currentStepData.iconColor}`} />
              </div>
              <div>
                <h1 className="text-lg font-bold">{currentStepData.title}</h1>
                <p className="text-white/90 text-xs">{currentStepData.description}</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-white/80 mb-1">
                <span>Step {currentStep + 1} of {steps.length}</span>
                <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1.5">
                <div 
                  className="bg-white h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-4">
            {currentStepData.content}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <div className="flex space-x-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  icon={<ArrowLeft className="w-4 h-4" />}
                  className="text-sm py-1.5 px-3 border border-gray-300"
                >
                  Previous
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-gray-600 hover:text-gray-800 text-sm py-1.5 px-3"
              >
                Skip Tour
              </Button>
            </div>
            
            <Button
              onClick={handleNext}
              className={`bg-gradient-to-r ${currentStepData.bgGradient} hover:opacity-90 text-white text-sm py-1.5 px-4`}
              icon={currentStep === steps.length - 1 ? <Play className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            >
              {currentStep === steps.length - 1 ? "Start Learning!" : "Next Step"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}