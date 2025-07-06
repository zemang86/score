import React, { useState } from 'react'
import { Button } from '../ui/Button'
import { Crown, X, Zap, Users, BookOpen } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { PremiumUpgradeModal } from './PremiumUpgradeModal'

interface SubscriptionBannerProps {
  className?: string
}

export function SubscriptionBanner({ className = '' }: SubscriptionBannerProps) {
  const { subscriptionPlan, maxStudents, dailyExamLimit } = useAuth()
  const [dismissed, setDismissed] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  
  const isPremium = subscriptionPlan === 'premium'

  if (dismissed || isPremium) return null

  return (
    <>
      <div className={`bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl border border-amber-300 p-3 sm:p-4 shadow-md ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg p-2 mr-3 shadow-sm hidden sm:flex">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-800 flex items-center">
                <Crown className="w-4 h-4 mr-1 sm:hidden" />
                Upgrade to Premium
              </h3>
              <p className="text-xs text-amber-700 hidden sm:block">
                Unlock unlimited exams, multiple children, and advanced reports
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowUpgradeModal(true)}
              size="sm"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs py-1.5 px-3"
              icon={<Zap className="w-3 h-3" />}
            >
              <span className="hidden sm:inline">Upgrade Now</span>
              <span className="sm:hidden">Upgrade</span>
            </Button>
            
            <button
              onClick={() => setDismissed(true)}
              className="text-amber-700 hover:bg-amber-200/50 rounded-lg p-1.5"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Free Plan Limits */}
        <div className="mt-2 grid grid-cols-2 gap-2 sm:flex sm:space-x-4 sm:mt-3">
          <div className="flex items-center bg-white/50 rounded-lg px-2 py-1">
            <Users className="w-3 h-3 text-amber-700 mr-1" />
            <span className="text-xs text-amber-800">{maxStudents} child only</span>
          </div>
          <div className="flex items-center bg-white/50 rounded-lg px-2 py-1">
            <BookOpen className="w-3 h-3 text-amber-700 mr-1" />
            <span className="text-xs text-amber-800">{dailyExamLimit} exams/day</span>
          </div>
        </div>
      </div>
      
      <PremiumUpgradeModal 
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </>
  )
}