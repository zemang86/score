import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export interface SubscriptionData {
  status: string
  priceId: string | null
  currentPeriodEnd: number | null
  cancelAtPeriodEnd: boolean
  paymentMethodBrand: string | null
  paymentMethodLast4: string | null
  loading: boolean
  error: string | null
}

export function useSubscription() {
  const { user, refreshUserProfile } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionData>({
    status: 'not_started',
    priceId: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    paymentMethodBrand: null,
    paymentMethodLast4: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    if (!user) {
      setSubscription(prev => ({ ...prev, loading: false }))
      return
    }

    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from('stripe_user_subscriptions')
          .select('*')
          .maybeSingle()

        if (error) {
          throw error
        }

        if (data) {
          setSubscription({
            status: data.subscription_status,
            priceId: data.price_id,
            currentPeriodEnd: data.current_period_end,
            cancelAtPeriodEnd: data.cancel_at_period_end,
            paymentMethodBrand: data.payment_method_brand,
            paymentMethodLast4: data.payment_method_last4,
            loading: false,
            error: null
          })

          // If subscription is active, update user profile
          if (data.subscription_status === 'active') {
            await refreshUserProfile()
          }
        } else {
          setSubscription(prev => ({ ...prev, loading: false }))
        }
      } catch (error: any) {
        console.error('Error fetching subscription:', error)
        setSubscription(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to fetch subscription'
        }))
      }
    }

    fetchSubscription()
  }, [user, refreshUserProfile])

  const isActive = subscription.status === 'active'
  const isTrialing = subscription.status === 'trialing'
  const isPastDue = subscription.status === 'past_due'
  const isCanceled = subscription.status === 'canceled'
  const isSubscribed = isActive || isTrialing || isPastDue

  const formatNextBillingDate = () => {
    if (!subscription.currentPeriodEnd) return 'N/A'
    
    const date = new Date(subscription.currentPeriodEnd * 1000)
    return date.toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return {
    ...subscription,
    isActive,
    isTrialing,
    isPastDue,
    isCanceled,
    isSubscribed,
    formatNextBillingDate
  }
}