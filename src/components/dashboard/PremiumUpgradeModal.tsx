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

          {/* Billing Cycle Toggle */}
          <div className="mb-8">
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
              <h3 className="text-lg font-bold text-indigo-800 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-indigo-600" />
                Choose Your Billing Cycle
              </h3>
              
              <div className="flex flex-col space-y-4">
                <Switch
                  checked={isAnnual}
                  onCheckedChange={setIsAnnual}
                  id="billing-cycle"
                  label="Annual Billing"
                  description={isAnnual ? "Save 16% compared to monthly" : "Switch to annual for savings"}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className={`rounded-lg p-4 border-2 transition-all ${
                    !isAnnual 
                      ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                      : 'border-gray-200 bg-white'
                  }`}>
                    <div className="flex items-center mb-2">
                      <CreditCard className={`w-5 h-5 mr-2 ${!isAnnual ? 'text-indigo-600' : 'text-gray-500'}`} />
                      <h4 className={`font-bold ${!isAnnual ? 'text-indigo-800' : 'text-gray-700'}`}>Monthly</h4>
                    </div>
                    <div className={`text-xl font-bold mb-1 ${!isAnnual ? 'text-indigo-800' : 'text-gray-700'}`}>
                      RM28<span className="text-sm font-normal">/month</span>
                    </div>
                    <p className={`text-xs ${!isAnnual ? 'text-indigo-600' : 'text-gray-500'}`}>
                      Billed monthly
                    </p>
                  </div>
                  
                  <div className={`rounded-lg p-4 border-2 transition-all relative overflow-hidden ${
                    isAnnual 
                      ? 'border-amber-500 bg-amber-50 shadow-md' 
                      : 'border-gray-200 bg-white'
                  }`}>
                    {isAnnual && (
                      <div className="absolute top-0 right-0 bg-amber-500 text-white px-2 py-0.5 text-xs font-bold transform translate-x-2 -translate-y-0 rotate-0">
                        SAVE 16%
                      </div>
                    )}
                    <div className="flex items-center mb-2">
                      <Calendar className={`w-5 h-5 mr-2 ${isAnnual ? 'text-amber-600' : 'text-gray-500'}`} />
                      <h4 className={`font-bold ${isAnnual ? 'text-amber-800' : 'text-gray-700'}`}>Annual</h4>
                    </div>
                    <div className={`text-xl font-bold mb-1 ${isAnnual ? 'text-amber-800' : 'text-gray-700'}`}>
                      RM280<span className="text-sm font-normal">/year</span>
                    </div>
                    <p className={`text-xs ${isAnnual ? 'text-amber-600' : 'text-gray-500'}`}>
                      Billed annually (RM23.33/month)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Kids Slider */}
          <div className="mb-8">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" /> 
                How Many Children?
              </h3>
              
              <div className="space-y-4">
                <p className="text-blue-700 text-sm">
                  Your Premium subscription includes <strong>1 child</strong>. Add more children for RM10/month each.
                </p>
                
                {isAnnual && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center">
                      <AlertCircle className="w-4 h-4 text-amber-600 mr-2 flex-shrink-0" />
                      <p className="text-amber-700 text-sm">
                        <strong>Note:</strong> For annual plans, please complete your subscription first, then add additional children as separate monthly subscriptions.
                      </p>
                    </div>
                  </div>
                )}
                
                <Slider
                  value={[additionalKids]}
                  onValueChange={(value) => setAdditionalKids(value[0])}
                  min={0}
                  max={5}
                  step={1}
                  label="Additional Children"
                  valueDisplay={`+${additionalKids} additional (${totalKids} total)`}
                  disabled={isAnnual}
                />
                
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-blue-800 font-medium">Total Children:</span>
                      <span className="ml-2 text-blue-700">{totalKids}</span>
                    </div>
                    <div>
                      <span className="text-blue-800 font-medium">Additional Cost:</span>
                      <span className="ml-2 text-blue-700">
                        {additionalKids > 0 && !isAnnual
                          ? isAnnual 
                            ? `+RM${additionalKids * 100}/year` 
                            : `+RM${additionalKids * 10}/month`
                          : 'No extra cost'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mb-8">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-gray-700" />
                Order Summary
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Premium Plan ({isAnnual ? 'Annual' : 'Monthly'})</span>
                  <span className="font-medium text-gray-800">
                    RM{isAnnual ? '280.00' : '28.00'}{isAnnual ? '/year' : '/month'}
                  </span>
                </div>
                
                {additionalKids > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center">
                      {isAnnual ? (
                        <>
                          <AlertCircle className="w-4 h-4 text-amber-500 mr-1" />
                          Additional Children ({additionalKids})
                        </>
                      ) : (
                        <>Additional Children ({additionalKids})</>
                      )}
                    </span>
                    {!isAnnual && (
                      <span className="font-medium text-gray-800">
                        RM{additionalKids * 10}/month
                      </span>
                    )}
                    {isAnnual && (
                      <span className="text-xs text-amber-600">Add after checkout</span>
                    )}
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-bold text-gray-800">Total</span>
                  <span className="font-bold text-gray-800">
                    RM{totalPrice.toFixed(2)}{isAnnual ? '/year' : '/month'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Benefits */}
          <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200 mb-6">
            <h3 className="text-lg font-bold text-indigo-800 mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-indigo-600" />
              Premium Benefits
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
            </div>
          </div>

          {/* Checkout Button */}
          <Button
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md py-3 text-lg"
            loading={loading}
            icon={!loading ? <Crown className="w-6 h-6" /> : undefined}
          >
            {loading ? 'Processing...' : `Upgrade Now • RM${totalPrice.toFixed(2)}${isAnnual ? '/year' : '/month'}`}
          </Button>
          
          <p className="text-center text-gray-500 text-xs mt-3">
            Secure payment processing by Stripe. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  )
}