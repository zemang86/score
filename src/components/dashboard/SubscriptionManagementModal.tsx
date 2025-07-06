import React, { useState } from 'react'
import { Button } from '../ui/Button'
import { X, CreditCard, Calendar, AlertCircle, Crown, CheckCircle, Clock, Zap } from 'lucide-react'
import { useSubscription } from '../../hooks/useSubscription'
import { supabase } from '../../lib/supabase'

interface SubscriptionManagementModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SubscriptionManagementModal({ isOpen, onClose }: SubscriptionManagementModalProps) {
  const subscription = useSubscription()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleManageSubscription = async () => {
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Get the current user's session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('You must be logged in to manage your subscription')
      }

      // Create a portal session
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          return_url: window.location.href
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create portal session')
      }

      const { url } = await response.json()
      
      // Redirect to Stripe Customer Portal
      window.location.href = url
    } catch (err: any) {
      console.error('Error creating portal session:', err)
      setError(err.message || 'Failed to open subscription management portal')
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 rounded-lg p-2 mr-3">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Subscription Management</h2>
                <p className="text-sm text-indigo-100">Manage your Premium plan</p>
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
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {subscription.loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
              <p className="text-indigo-600 font-medium">Loading subscription details...</p>
            </div>
          ) : subscription.isSubscribed ? (
            <div className="space-y-4">
              {/* Subscription Status */}
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <div className="flex items-center mb-2">
                  <div className={`rounded-full p-2 mr-3 ${
                    subscription.isActive ? 'bg-green-100 text-green-600' : 
                    subscription.isTrialing ? 'bg-blue-100 text-blue-600' : 
                    'bg-amber-100 text-amber-600'
                  }`}>
                    {subscription.isActive ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : subscription.isTrialing ? (
                      <Clock className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-indigo-800">Premium Subscription</h3>
                    <p className={`text-sm ${
                      subscription.isActive ? 'text-green-600' : 
                      subscription.isTrialing ? 'text-blue-600' : 
                      'text-amber-600'
                    }`}>
                      Status: {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                    </p>
                  </div>
                </div>
                
                {subscription.cancelAtPeriodEnd && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                    <div className="flex items-center">
                      <AlertCircle className="w-4 h-4 text-amber-600 mr-2 flex-shrink-0" />
                      <p className="text-amber-700 text-sm">
                        Your subscription is set to cancel at the end of the current billing period.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Billing Details */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                  <Calendar className="w-5 h-5 text-indigo-600 mr-2" />
                  Billing Information
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Next billing date:</span>
                    <span className="font-medium text-gray-800">{subscription.formatNextBillingDate()}</span>
                  </div>
                  
                  {subscription.paymentMethodBrand && subscription.paymentMethodLast4 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment method:</span>
                      <span className="font-medium text-gray-800 flex items-center">
                        <CreditCard className="w-4 h-4 mr-1 text-indigo-500" />
                        {subscription.paymentMethodBrand.charAt(0).toUpperCase() + subscription.paymentMethodBrand.slice(1)} •••• {subscription.paymentMethodLast4}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan:</span>
                    <span className="font-medium text-gray-800">Premium (RM28.00/month)</span>
                  </div>
                </div>
              </div>

              {/* Manage Subscription */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                  <Zap className="w-5 h-5 text-indigo-600 mr-2" />
                  Manage Your Subscription
                </h3>
                
                <p className="text-gray-600 text-sm mb-4">
                  You can update your payment method, change your billing cycle, or cancel your subscription through the Stripe Customer Portal.
                </p>
                
                <Button
                  onClick={handleManageSubscription}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  loading={loading}
                  icon={!loading ? <CreditCard className="w-5 h-5" /> : undefined}
                >
                  {loading ? 'Opening Portal...' : 'Manage Subscription'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="bg-amber-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-amber-800 mb-2">No Active Subscription</h3>
              <p className="text-amber-700 text-base mb-6">
                You don't have an active Premium subscription.
              </p>
              <Button
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                icon={<Crown className="w-5 h-5" />}
              >
                Upgrade to Premium
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full border-gray-300 text-gray-700"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}