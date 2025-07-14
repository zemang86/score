import React, { useState } from 'react'
import { useAuth } from '../../contexts/OptimizedAuthContext'
import { Button } from '../ui/Button'
import { PremiumUpgradeModal } from '../dashboard/PremiumUpgradeModal'
import { Input } from '../ui/Input'
import WaitlistComponent from '../ui/waiting-list'
import { PhoneVerification } from './PhoneVerification'
import { Mail, Lock, User, Eye, EyeOff, Sparkles, Star, Crown, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface SignUpFormProps {
  onToggleMode: () => void
}

export function SignUpForm({ onToggleMode }: SignUpFormProps) {
  const { signUp } = useAuth()
  const { t } = useTranslation()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [step, setStep] = useState<'signup' | 'phone-verification' | 'waitlist'>('signup')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError(t('auth.signUp.passwordsNoMatch'))
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError(t('auth.signUp.passwordTooShort'))
      setLoading(false)
      return
    }

    // Instead of creating the account immediately, go to phone verification
    // The admin will manually approve beta testers after verification
    setLoading(false)
    setStep('phone-verification')
  }

  // Phone Verification Step
  if (step === 'phone-verification') {
    return (
      <PhoneVerification
        email={email}
        onVerificationComplete={() => setStep('waitlist')}
        onBack={() => setStep('signup')}
      />
    )
  }

  // Beta Waitlist Step
  if (step === 'waitlist') {
    return (
      <WaitlistComponent
        title="Join Our Beta Program"
        subtitle="Be the first to experience our revolutionary learning platform for kids"
        placeholder="" // No email input needed since already provided
        buttonText={{
          idle: "Join Beta Waitlist",
          loading: "Joining...",
          success: "Welcome to Beta!",
        }}
        theme="system"
        userEmail={email} // Pass the email to the component
      />
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="w-6 h-6 text-purple-500 mr-2 animate-pulse-soft" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{t('auth.signUp.title')}</h1>
          <Sparkles className="w-6 h-6 text-purple-500 ml-2 animate-pulse-soft" />
        </div>
        <p className="text-slate-600 text-lg">{t('auth.signUp.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <p className="text-red-700 font-medium text-center">{error}</p>
          </div>
        )}

        <Input
          type="text"
          placeholder={t('auth.signUp.fullNamePlaceholder')}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          icon={<User className="w-5 h-5" />}
          required
        />

        <Input
          type="email"
          placeholder={t('auth.signUp.emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-5 h-5" />}
          required
        />

        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder={t('auth.signUp.passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-5 h-5" />}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder={t('auth.signUp.confirmPasswordPlaceholder')}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          icon={<Lock className="w-5 h-5" />}
          required
        />

        <Button
          type="submit"
          size="lg"
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
          loading={loading}
          icon={!loading ? <Zap className="w-5 h-5" /> : undefined}
        >
          {loading ? t('auth.signUp.loading') : t('auth.signUp.button')}
        </Button>

        <div className="text-center bg-slate-50 rounded-xl p-4 border border-slate-200">
          <p className="text-slate-700">
            {t('auth.signUp.hasAccount')}{' '}
            <button
              type="button"
              onClick={onToggleMode}
              className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors hover:underline"
            >
              {t('auth.signUp.signInLink')}
            </button>
          </p>
        </div>
      </form>
    </div>
  )
}