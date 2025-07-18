import React, { useState } from 'react'
import { useAuth } from '../../contexts/OptimizedAuthContext'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Mail, ArrowLeft, Sparkles, Heart, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ForgotPasswordFormProps {
  onBack: () => void
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const { resetPassword } = useAuth()
  const { t } = useTranslation()
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
        <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-3xl p-8 animate-scale-in">
          <div className="flex justify-center mb-4">
            <Heart className="w-16 h-16 text-green-500 animate-pulse-soft" />
          </div>
          <h2 className="text-3xl font-bold text-green-700 mb-4">{t('auth.forgotPassword.checkEmailTitle')}</h2>
          <p className="text-green-600 text-lg mb-6">
            {t('auth.forgotPassword.checkEmailMessage', { email: <strong>{email}</strong> })}
          </p>
          <Button 
            onClick={onBack} 
            variant="outline"
            size="lg"
            className="w-full border-green-300 text-green-700 hover:bg-green-50"
            icon={<ArrowLeft className="w-5 h-5" />}
          >
            {t('auth.forgotPassword.backToSignIn')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="w-6 h-6 text-indigo-500 mr-2 animate-pulse-soft" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{t('auth.forgotPassword.title')}</h1>
          <Sparkles className="w-6 h-6 text-indigo-500 ml-2 animate-pulse-soft" />
        </div>
        <p className="text-slate-600 text-lg">{t('auth.forgotPassword.dontWorry')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <p className="text-red-700 font-medium text-center">{error}</p>
          </div>
        )}

        <Input
          type="email"
          placeholder={t('auth.forgotPassword.emailPlaceholder')}
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
          {loading ? t('auth.forgotPassword.loading') : t('auth.forgotPassword.button')}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={onBack}
            className="text-slate-600 hover:text-slate-700 font-medium inline-flex items-center transition-colors hover:underline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('auth.forgotPassword.backToSignIn')}
          </button>
        </div>
      </form>
    </div>
  )
}