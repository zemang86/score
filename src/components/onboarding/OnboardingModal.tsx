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
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mx-auto flex items-center justify-center shadow-2xl">
              <Crown className="w-16 h-16 text-amber-400" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center animate-bounce">
              <Star className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-3">
              Welcome, {userName}! 🎉
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              You've just joined Malaysia's most engaging learning platform! 
              Let's take a quick tour to help you get started with your children's educational journey.
            </p>
          </div>
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-xl p-4">
            <div className="flex items-center justify-center text-green-700 mb-2">
              <Gift className="w-6 h-6 mr-2" />
              <span className="font-bold">Special Launch Offer!</span>
            </div>
            <p className="text-green-600 text-sm">
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
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mx-auto flex items-center justify-center shadow-xl mb-4">
              <Users className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Step 1: Add Your Children</h3>
            <p className="text-slate-600 text-lg">
              Start by adding profiles for each of your children. We'll need some basic information to personalize their learning experience.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border-2 border-green-200 shadow-lg">
            <h4 className="font-bold text-green-700 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              What You'll Need:
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <strong>Child's Full Name:</strong> For personalized greetings and certificates
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <strong>School Name:</strong> To connect with their current education
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <strong>Education Level:</strong> From Darjah 1 to Tingkatan 5
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <strong>Date of Birth:</strong> For age-appropriate content
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-green-700 text-center font-medium">
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
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full mx-auto flex items-center justify-center shadow-xl mb-4">
              <Target className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Step 2: Choose Exam Modes</h3>
            <p className="text-slate-600 text-lg">
              We offer three difficulty levels to match your child's learning pace and confidence level.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-3">E</div>
                <h4 className="font-bold text-green-700">Easy Mode</h4>
              </div>
              <p className="text-green-600 text-sm mb-2">Perfect for beginners or building confidence</p>
              <ul className="text-xs text-green-600 space-y-1">
                <li>• 10 Multiple Choice Questions (MCQ)</li>
                <li>• 15 minutes to complete</li>
                <li>• Great for daily practice</li>
              </ul>
            </div>

            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold mr-3">M</div>
                <h4 className="font-bold text-amber-700">Medium Mode</h4>
              </div>
              <p className="text-amber-600 text-sm mb-2">Balanced challenge with mixed question types</p>
              <ul className="text-xs text-amber-600 space-y-1">
                <li>• 20-30 Mixed Questions (MCQ + Short Answer)</li>
                <li>• 30 minutes to complete</li>
                <li>• Builds problem-solving skills</li>
              </ul>
            </div>

            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold mr-3">F</div>
                <h4 className="font-bold text-red-700">Full Mode</h4>
              </div>
              <p className="text-red-600 text-sm mb-2">Complete exam experience for serious preparation</p>
              <ul className="text-xs text-red-600 space-y-1">
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
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full mx-auto flex items-center justify-center shadow-xl mb-4">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Step 3: Track Progress & Rewards</h3>
            <p className="text-slate-600 text-lg">
              Learning becomes an adventure with our gamified progress tracking and achievement system.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-4">
              <div className="flex items-center mb-3">
                <Zap className="w-6 h-6 text-purple-600 mr-2" />
                <h4 className="font-bold text-purple-700">XP Points System</h4>
              </div>
              <p className="text-purple-600 text-sm mb-2">Earn experience points for every correct answer!</p>
              <ul className="text-xs text-purple-600 space-y-1">
                <li>• 10 XP per correct answer</li>
                <li>• 50 XP bonus for perfect scores</li>
                <li>• Level up as you learn more</li>
              </ul>
            </div>

            <div className="bg-pink-50 border-2 border-pink-300 rounded-xl p-4">
              <div className="flex items-center mb-3">
                <Star className="w-6 h-6 text-pink-600 mr-2" />
                <h4 className="font-bold text-pink-700">Achievement Badges</h4>
              </div>
              <p className="text-pink-600 text-sm mb-2">Unlock special badges for milestones!</p>
              <ul className="text-xs text-pink-600 space-y-1">
                <li>• 🎯 First Steps (Complete first exam)</li>
                <li>• ⭐ Perfect Score (Get 100%)</li>
                <li>• 🔥 Streak Master (5 exams in a row)</li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 border-2 border-indigo-300 rounded-xl p-4">
            <div className="flex items-center mb-2">
              <BookOpen className="w-6 h-6 text-indigo-600 mr-2" />
              <h4 className="font-bold text-indigo-700">Detailed Analytics</h4>
            </div>
            <p className="text-indigo-600 text-sm">
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
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mx-auto flex items-center justify-center shadow-2xl">
              <Star className="w-16 h-16 text-amber-400" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center animate-bounce">
              <Zap className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-3">
              You're Ready to Go! 🚀
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-6">
              Your Edventure+ account is all set up! Now it's time to add your children and start their learning journey.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-300 rounded-xl p-6">
            <h3 className="font-bold text-blue-700 mb-4">Quick Start Checklist:</h3>
            <div className="space-y-3 text-left">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <span className="text-blue-700">Click "Add New Child" to create your first student profile</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <span className="text-blue-700">Choose a subject and start with Easy Mode</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <span className="text-blue-700">Watch your child earn XP and unlock achievements!</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-amber-700 text-center">
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className={`p-6 bg-gradient-to-r ${currentStepData.bgGradient} text-white relative overflow-hidden`}>
          <div className="absolute top-4 right-4">
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors bg-white/20 rounded-full p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 rounded-full p-3 mr-4">
                <currentStepData.icon className={`w-8 h-8 ${currentStepData.iconColor}`} />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">{currentStepData.title}</h1>
                <p className="text-white/90 text-lg">{currentStepData.description}</p>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-white/80 mb-2">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {currentStepData.content}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <div className="flex space-x-3">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  icon={<ArrowLeft className="w-5 h-5" />}
                  className="border-2 border-slate-300 hover:border-slate-400"
                >
                  Previous
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-slate-600 hover:text-slate-800"
              >
                Skip Tour
              </Button>
            </div>
            
            <Button
              onClick={handleNext}
              className={`bg-gradient-to-r ${currentStepData.bgGradient} hover:opacity-90 text-white px-8 py-3`}
              icon={currentStep === steps.length - 1 ? <Play className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
            >
              {currentStep === steps.length - 1 ? "Start Learning!" : "Next Step"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}