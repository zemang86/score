import React, { useState } from 'react'
import { Button } from './Button'
import { Input } from './Input'
import { Mail, Clock, CheckCircle, Sparkles, Star, Crown, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { WaitlistService } from '../../services/waitlistService'

interface WaitlistComponentProps {
  title: string
  subtitle: string
  placeholder: string
  buttonText: {
    idle: string
    loading: string
    success: string
  }
  theme?: 'light' | 'dark' | 'system'
}

export default function WaitlistComponent({
  title,
  subtitle,
  placeholder,
  buttonText,
  theme = 'system'
}: WaitlistComponentProps) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    try {
      const result = await WaitlistService.submitToWaitlist(email)
      
      if (result.success) {
        setSuccess(true)
      } else {
        setError(result.error || 'Failed to join waitlist. Please try again.')
      }
    } catch (err) {
      console.error('Error submitting to waitlist:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-3xl p-8 animate-scale-in">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500 animate-bounce-gentle" />
          </div>
          <h2 className="text-3xl font-bold text-green-700 mb-4">{buttonText.success}</h2>
          <p className="text-green-600 text-lg mb-6">
            Thank you for joining our beta program waitlist! Our team will review your application and get back to you soon.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-green-800 mb-2">What happens next?</h3>
            <ul className="text-green-700 text-sm space-y-1 text-left">
              <li>• Our team will review your application</li>
              <li>• You'll receive an email with beta access instructions</li>
              <li>• Beta testers get early access to new features</li>
              <li>• Your feedback helps shape the future of our platform</li>
            </ul>
          </div>
          <div className="flex items-center justify-center text-green-600">
            <Clock className="w-5 h-5 mr-2" />
            <span className="text-sm">Expected response time: 1-3 business days</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Crown className="w-6 h-6 text-amber-500 mr-2 animate-pulse-soft" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{title}</h1>
          <Crown className="w-6 h-6 text-amber-500 ml-2 animate-pulse-soft" />
        </div>
        <p className="text-slate-600 text-lg">{subtitle}</p>
      </div>

      <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-6">
        <div className="flex items-center mb-2">
          <Star className="w-5 h-5 text-amber-500 mr-2" />
          <h3 className="font-semibold text-amber-800">Beta Program Access</h3>
        </div>
        <p className="text-amber-700 text-sm">
          Our platform is currently in beta and only accessible to approved testers. Join our waitlist to get early access!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <p className="text-red-700 font-medium text-center">{error}</p>
          </div>
        )}

        <Input
          type="email"
          placeholder={placeholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-5 h-5" />}
          required
        />

        <Button
          type="submit"
          size="lg"
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
          loading={loading}
          icon={!loading ? <Zap className="w-5 h-5" /> : undefined}
        >
          {loading ? buttonText.loading : buttonText.idle}
        </Button>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="flex items-center mb-2">
            <Sparkles className="w-5 h-5 text-purple-500 mr-2" />
            <h3 className="font-semibold text-slate-800">Beta Benefits</h3>
          </div>
          <ul className="text-slate-700 text-sm space-y-1">
            <li>• Early access to new features</li>
            <li>• Direct feedback channel to our team</li>
            <li>• Priority support and bug fixes</li>
            <li>• Influence the future of our platform</li>
          </ul>
        </div>
      </form>
    </div>
  )
}