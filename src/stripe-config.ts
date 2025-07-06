// Stripe product configuration
export const PRODUCTS = {
  premium: {
    priceId: 'price_1Rhw3SFmiwnPC9Y0rBg2BHtD',
    name: 'Edventure+ Monthly Subscription',
    description: 'Premium Plan for Edventure+ for unlimited past year papers',
    mode: 'subscription' as const,
    features: [
      'Unlimited exams per day',
      'Full access to all reports and analytics',
      'Access to all question banks',
      'One child included (add more for RM10/month each)',
      'Premium badge system',
      'Priority support'
    ],
    price: 'RM28.00/month'
  }
};

// Stripe API endpoints
export const STRIPE_API = {
  checkout: '/api/stripe/checkout',
  portal: '/api/stripe/portal',
  webhook: '/api/stripe/webhook'
};

// Stripe checkout configuration
export const CHECKOUT_CONFIG = {
  successUrl: `${window.location.origin}/dashboard?checkout=success`,
  cancelUrl: `${window.location.origin}/dashboard?checkout=canceled`
};