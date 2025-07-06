// Stripe product configuration
export const PRODUCTS = {
  premium: {
    monthly: {
      priceId: 'price_1Rhw3SFmiwnPC9Y0rBg2BHtD',
      name: 'Edventure+ Monthly Subscription',
      description: 'Premium Plan for Edventure+ for unlimited past year papers',
      mode: 'subscription' as const,
      price: 'RM28.00/month'
    },
    annual: {
      priceId: 'price_1Rhw5PFmiwnPC9Y0uo5jKG0L', // Replace with your annual price ID
      name: 'Edventure+ Annual Subscription',
      description: 'Premium Plan for Edventure+ for unlimited past year papers (save 16%)',
      mode: 'subscription' as const,
      price: 'RM280.00/year'
    },
    additionalKid: {
      priceId: 'price_1Rhw6DFmiwnPC9Y0PN9dP2mF', // Replace with your additional kid price ID
      name: 'Additional Child',
      description: 'Add another child to your Premium subscription',
      mode: 'subscription' as const,
      price: 'RM10.00/month'
    },
    features: [
      'Unlimited exams per day',
      'Full access to all reports and analytics',
      'Access to all question banks',
      'One child included (add more for RM10/month each)',
      'Premium badge system',
      'Priority support'
    ],
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