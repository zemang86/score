import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { X, Crown, Check, Zap, Users, BookOpen, Trophy, BarChart3, Calendar, Shield } from 'lucide-react'
import { PRODUCTS, CHECKOUT_CONFIG } from '../../stripe-config'

interface PremiumUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PremiumUpgradeModal({ isOpen, onClose }: PremiumUpgradeModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleUpgrade = async () => {
    setLoading(true)
    setError('')

    try {
      // Get the current user's session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('You must be logged in to upgrade')
      }

      // Create a checkout session
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          price_id: PRODUCTS.premium.priceId,
          success_url: CHECKOUT_CONFIG.successUrl,
          cancel_url: CHECKOUT_CONFIG.cancelUrl,
          mode: PRODUCTS.premium.mode
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const { url } = await response.json()
      
      // Redirect to Stripe Checkout
      window.location.href = url
    } catch (err: any) {
      console.error('Error creating checkout session:', err)
      setError(err.message || 'Failed to start checkout process')
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center">
              <div className="bg-white/20 rounded-xl p-3 mr-4">
                <Crown className="w-8 h-8 text-amber-200" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Upgrade to Premium</h2>
                <p className="text-amber-100">Unlock the full learning experience</p>
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
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 font-medium text-center">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Free Plan */}
            <div className="bg-white rounded-xl border-2 border-slate-200 p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="bg-slate-100 rounded-lg p-2 mr-3">
                  <Users className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Free Plan</h3>
                  <p className="text-slate-500 text-sm">Your current plan</p>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="text-2xl font-bold text-slate-800 mb-1">RM0</div>
                <p className="text-slate-500 text-sm">Limited features</p>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <div className="bg-slate-100 rounded-full p-1 mr-2 mt-0.5">
                    <Check className="w-3 h-3 text-slate-600" />
                  </div>
                  <span className="text-slate-700 text-sm">1 child only</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-slate-100 rounded-full p-1 mr-2 mt-0.5">
                    <Check className="w-3 h-3 text-slate-600" />
                  </div>
                  <span className="text-slate-700 text-sm">3 exams per day</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-slate-100 rounded-full p-1 mr-2 mt-0.5">
                    <Check className="w-3 h-3 text-slate-600" />
                  </div>
                  <span className="text-slate-700 text-sm">Basic reports</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-slate-100 rounded-full p-1 mr-2 mt-0.5">
                    <Check className="w-3 h-3 text-slate-600" />
                  </div>
                  <span className="text-slate-700 text-sm">Limited exam history</span>
                </li>
              </ul>
              
              <Button
                variant="outline"
                className="w-full border-slate-300 text-slate-700"
                disabled
              >
                Current Plan
              </Button>
            </div>
            
            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-300 p-6 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-400 text-white px-4 py-1 text-xs font-bold transform translate-x-8 translate-y-4 rotate-45">
                BEST VALUE
              </div>
              
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg p-2 mr-3 shadow-md">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-800">Premium Plan</h3>
                  <p className="text-amber-700 text-sm">Recommended</p>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="text-2xl font-bold text-amber-800 mb-1">RM28<span className="text-base font-normal text-amber-700">/month</span></div>
                <p className="text-amber-700 text-sm">Unlimited access</p>
              </div>
              
              <ul className="space-y-3 mb-6">
                {PRODUCTS.premium.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className="bg-amber-200 rounded-full p-1 mr-2 mt-0.5">
                      <Check className="w-3 h-3 text-amber-700" />
                    </div>
                    <span className="text-amber-800 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                onClick={handleUpgrade}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md"
                loading={loading}
                icon={!loading ? <Crown className="w-5 h-5" /> : undefined}
              >
                {loading ? 'Processing...' : 'Upgrade Now'}
              </Button>
            </div>
          </div>

          {/* Premium Benefits */}
          <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
            <h3 className="text-lg font-bold text-indigo-800 mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-indigo-600" />
              Why Upgrade to Premium?
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-indigo-100">
                <div className="flex items-center mb-2">
                  <BookOpen className="w-5 h-5 text-indigo-600 mr-2" />
                  <h4 className="font-bold text-indigo-800">Unlimited Exams</h4>
                </div>
                <p className="text-indigo-700 text-sm">Practice as much as needed without daily limits</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm border border-indigo-100">
                <div className="flex items-center mb-2">
                  <Users className="w-5 h-5 text-indigo-600 mr-2" />
                  <h4 className="font-bold text-indigo-800">Multiple Children</h4>
                </div>
                <p className="text-indigo-700 text-sm">Add all your children to one account</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm border border-indigo-100">
                <div className="flex items-center mb-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600 mr-2" />
                  <h4 className="font-bold text-indigo-800">Advanced Reports</h4>
                </div>
                <p className="text-indigo-700 text-sm">Detailed analytics and performance tracking</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm border border-indigo-100">
                <div className="flex items-center mb-2">
                  <Trophy className="w-5 h-5 text-indigo-600 mr-2" />
                  <h4 className="font-bold text-indigo-800">Full Badge System</h4>
                </div>
                <p className="text-indigo-700 text-sm">Unlock all achievement badges and rewards</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm border border-indigo-100">
                <div className="flex items-center mb-2">
                  <Calendar className="w-5 h-5 text-indigo-600 mr-2" />
                  <h4 className="font-bold text-indigo-800">Complete History</h4>
                </div>
                <p className="text-indigo-700 text-sm">Access full exam history and reviews</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm border border-indigo-100">
                <div className="flex items-center mb-2">
                  <Shield className="w-5 h-5 text-indigo-600 mr-2" />
                  <h4 className="font-bold text-indigo-800">Priority Support</h4>
                </div>
                <p className="text-indigo-700 text-sm">Get help faster when you need it</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-gray-500 text-sm">Secure payment processing by Stripe</p>
            <Button
              onClick={onClose}
              variant="outline"
              className="border-gray-300 text-gray-700"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}