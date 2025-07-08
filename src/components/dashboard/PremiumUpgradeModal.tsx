import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { Switch } from '../ui/Switch'
import { Slider } from '../ui/Slider'
import { X, Crown, Check, Zap, Users, BookOpen, Trophy, BarChart3, Calendar, Shield, Clock, CreditCard, Percent, AlertCircle } from 'lucide-react'
import { PRODUCTS, CHECKOUT_CONFIG } from '../../stripe-config'

interface PremiumUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PremiumUpgradeModal({ isOpen, onClose }: PremiumUpgradeModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isAnnual, setIsAnnual] = useState(false)
  const [additionalKids, setAdditionalKids] = useState(0) 

  // Calculate total price
  const basePrice = isAnnual ? 280 : 28
  // For annual plan, we don't include additional kids in the checkout
  const additionalKidsPrice = isAnnual ? 0 : additionalKids * 10 // 10 per month per kid
  const totalPrice = basePrice + additionalKidsPrice
  const totalKids = 1 + additionalKids // 1 included + additional

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
          price_id: isAnnual ? PRODUCTS.premium.annual.priceId : PRODUCTS.premium.monthly.priceId,
          billing_cycle: isAnnual ? 'annual' : 'monthly',
          additional_kids: isAnnual ? 0 : additionalKids, // Don't include additional kids for annual plan
          success_url: CHECKOUT_CONFIG.successUrl,
          cancel_url: CHECKOUT_CONFIG.cancelUrl,
          mode: PRODUCTS.premium.monthly.mode
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-lg w-full max-h-[95vh] overflow-hidden flex flex-col">
        
        {/* Compact Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Crown className="w-6 h-6 text-amber-200 mr-3" />
              <div>
                <h2 className="text-lg sm:text-xl font-bold">Upgrade to Premium</h2>
                <p className="text-amber-100 text-sm hidden sm:block">Unlock the full learning experience</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
              <p className="text-red-700 font-medium text-center text-sm">{error}</p>
            </div>
          )}

          {/* Inline Pricing Toggle */}
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-indigo-800">
                  RM{isAnnual ? '280' : '28'}
                  <span className="text-base font-normal text-indigo-600">
                    /{isAnnual ? 'year' : 'month'}
                  </span>
                </div>
                {isAnnual && (
                  <div className="text-xs text-green-600 font-medium mt-1">
                    💡 Save 16% vs monthly
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <Switch
                  checked={isAnnual}
                  onCheckedChange={setIsAnnual}
                  id="billing-toggle"
                  label="Annual Billing"
                  className="text-sm"
                />
                <div className="text-xs text-indigo-600 text-center">
                  {isAnnual ? 'Billed annually' : 'Billed monthly'}
                </div>
              </div>
            </div>
          </div>

          {/* Compact Benefits */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-base font-bold text-blue-800 mb-3 flex items-center">
              <Zap className="w-4 h-4 mr-2 text-blue-600" />
              What You Get
            </h3>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm text-blue-700">
                <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                <span>Unlimited exams (vs 3/day free limit)</span>
              </div>
              <div className="flex items-center text-sm text-blue-700">
                <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                <span>Multiple children (vs 1 child free limit)</span>
              </div>
              <div className="flex items-center text-sm text-blue-700">
                <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                <span>Advanced reports & detailed analytics</span>
              </div>
              <div className="flex items-center text-sm text-blue-700">
                <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                <span>Priority support & new features first</span>
              </div>
            </div>
          </div>

          {/* Compact Additional Kids (only show for monthly or if kids > 0) */}
          {(!isAnnual || additionalKids > 0) && (
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-orange-800 flex items-center">
                  <Users className="w-4 h-4 mr-2 text-orange-600" />
                  Children
                </h3>
                <div className="text-sm text-orange-700">
                  <span className="font-medium">{totalKids} total</span>
                </div>
              </div>
              
              {isAnnual ? (
                <div className="text-sm text-orange-700">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="w-4 h-4 text-orange-600 mr-2" />
                    <span>1 child included with annual plan</span>
                  </div>
                  <p className="text-xs text-orange-600 bg-orange-100 rounded p-2">
                    💡 Add more children after checkout as separate monthly subscriptions (RM10/month each)
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-sm text-orange-700">
                    <span className="font-medium">1 child included</span> + RM10/month per additional child
                  </div>
                  
                  <Slider
                    value={[additionalKids]}
                    onValueChange={(value) => setAdditionalKids(value[0])}
                    min={0}
                    max={5}
                    step={1}
                    label="Additional Children"
                    valueDisplay={`+${additionalKids} additional`}
                    className="text-sm"
                  />
                </div>
              )}
            </div>
          )}

          {/* Integrated Total Price */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <div>Premium Plan ({isAnnual ? 'Annual' : 'Monthly'})</div>
                {additionalKids > 0 && !isAnnual && (
                  <div>+{additionalKids} additional children</div>
                )}
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-800">
                  RM{totalPrice.toFixed(2)}
                </div>
                <div className="text-xs text-gray-600">
                  {isAnnual ? 'per year' : 'per month'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Footer with CTA */}
        <div className="border-t border-gray-200 bg-gray-50 p-4 sm:p-5">
          <Button
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md py-3 text-base sm:text-lg font-medium"
            loading={loading}
            icon={!loading ? <Crown className="w-5 h-5" /> : undefined}
          >
            {loading ? 'Processing...' : `👑 Upgrade Now • RM${totalPrice.toFixed(2)}${isAnnual ? '/year' : '/month'}`}
          </Button>
          
          <p className="text-center text-gray-500 text-xs mt-2">
            🔒 Secure payment by Stripe • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  )
}