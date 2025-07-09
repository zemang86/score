import React, { useEffect } from 'react'
import { Button } from '../ui/Button'
import { X, CheckCircle, Crown, Zap, Users, BookOpen, Trophy } from 'lucide-react'
import { useAuth } from '../../contexts/OptimizedAuthContext'

interface CheckoutSuccessModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CheckoutSuccessModal({ isOpen, onClose }: CheckoutSuccessModalProps) {
  const { refreshUserProfile } = useAuth()

  useEffect(() => {
    if (isOpen) {
      // Refresh user profile to get updated subscription status
      refreshUserProfile()
    }
  }, [isOpen, refreshUserProfile])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center">
              <div className="bg-white/20 rounded-xl p-3 mr-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Payment Successful!</h2>
                <p className="text-green-100">Your premium subscription is now active</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="text-center mb-6">
            <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Crown className="w-10 h-10 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Welcome to Premium!</h3>
            <p className="text-gray-600">
              Thank you for subscribing to Edventure+ Premium. Your account has been upgraded with all premium features.
            </p>
          </div>

          <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200 mb-6">
            <h4 className="text-lg font-bold text-indigo-800 mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-indigo-600" />
              Your Premium Benefits
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="bg-white rounded-full p-1.5 mr-3 mt-0.5">
                  <Users className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h5 className="font-bold text-indigo-700 text-sm">Multiple Children</h5>
                  <p className="text-indigo-600 text-xs">Add all your children to one account</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-white rounded-full p-1.5 mr-3 mt-0.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h5 className="font-bold text-indigo-700 text-sm">Unlimited Exams</h5>
                  <p className="text-indigo-600 text-xs">No daily limits on practice exams</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-white rounded-full p-1.5 mr-3 mt-0.5">
                  <Trophy className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h5 className="font-bold text-indigo-700 text-sm">Advanced Reports</h5>
                  <p className="text-indigo-600 text-xs">Detailed analytics and performance tracking</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-600 text-sm mb-4">
              Your subscription will automatically renew each month. You can manage your subscription at any time from your dashboard.
            </p>
            
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
              icon={<Zap className="w-5 h-5" />}
            >
              Start Using Premium Features
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}