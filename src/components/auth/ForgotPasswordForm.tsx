import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Mail, ArrowLeft, Sparkles, Heart, Zap } from 'lucide-react'

interface ForgotPasswordFormProps {
  onBack: () => void
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await resetPassword(email)
    
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
    
    setLoading(false)
  }

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="bg-gradient-to-r from-success-100 to-primary-100 border-2 border-success-300 rounded-3xl p-8 animate-scale-in">
          <div className="flex justify-center mb-4">
            <Heart className="w-16 h-16 text-success-500 animate-pulse-soft" />
          </div>
          <h2 className="text-3xl font-bold text-success-700 mb-4">Check Your Email!</h2>
          <p className="text-success-600 text-lg mb-6">
            We've sent a password reset link to <strong>{email}</strong>. 
            Check your email and follow the instructions to get back to learning!
          </p>
          <Button 
            onClick={onBack} 
            variant="outline"
            size="lg"
            className="w-full"
            icon={<ArrowLeft className="w-5 h-5" />}
          >
            Back to Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="w-6 h-6 text-primary-500 mr-2 animate-pulse-soft" />
          <h1 className="text-3xl font-bold text-primary-600">Reset Password</h1>
          <Sparkles className="w-6 h-6 text-primary-500 ml-2 animate-pulse-soft" />
        </div>
        <p className="text-secondary-600 text-lg">Don't worry! We'll help you get back to learning</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-error-50 border-2 border-error-200 rounded-xl p-4">
            <p className="text-error-700 font-medium text-center">{error}</p>
          </div>
        )}

        <Input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-5 h-5" />}
          required
        />

        <Button
          type="submit"
          variant="fun"
          size="lg"
          className="w-full"
          loading={loading}
          icon={!loading ? <Zap className="w-5 h-5" /> : undefined}
        >
          {loading ? 'Sending Reset Link...' : 'Send Reset Link!'}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={onBack}
            className="text-secondary-600 hover:text-secondary-700 font-medium inline-flex items-center transition-colors hover:underline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </button>
        </div>
      </form>
    </div>
  )
}