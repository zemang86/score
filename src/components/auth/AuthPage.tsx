import React, { useState } from 'react'
import { LoginForm } from './LoginForm'
import { SignUpForm } from './SignUpForm'
import { ForgotPasswordForm } from './ForgotPasswordForm'
import { Star, Trophy, Users, Sparkles, Heart, Zap, Rocket, Brain, Globe, ArrowLeft } from 'lucide-react'
import { EdventureLogo } from '../ui/EdventureLogo'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { useTranslation } from 'react-i18next'

type AuthMode = 'login' | 'signup' | 'forgot'

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleBackToHome = () => {
    console.log('🏠 Navigating back to home...')
    navigate('/')
  }

  const renderForm = () => {
    switch (mode) {
      case 'login':
        return (
          <LoginForm
            onToggleMode={() => setMode('signup')}
            onForgotPassword={() => setMode('forgot')}
          />
        )
      case 'signup':
        return <SignUpForm onToggleMode={() => setMode('login')} />
      case 'forgot':
        return <ForgotPasswordForm onBack={() => setMode('login')} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Floating decorative elements */}
      <div className="fixed top-20 right-10 animate-float z-10 opacity-10">
        <Star className="w-6 h-6 text-indigo-400" />
      </div>
      <div className="fixed top-40 right-32 animate-bounce-gentle z-10 opacity-10">
        <Sparkles className="w-5 h-5 text-purple-400" />
      </div>
      <div className="fixed bottom-20 left-10 animate-wiggle z-10 opacity-10">
        <Heart className="w-7 h-7 text-pink-400" />
      </div>
      <div className="fixed top-1/2 right-5 animate-pulse-soft z-10 opacity-10">
        <Zap className="w-6 h-6 text-amber-400" />
      </div>

      <div className="flex min-h-screen relative z-20">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-800 to-indigo-900 p-12 text-white relative overflow-hidden">
          {/* Floating decorative elements */}
          <div className="absolute top-10 right-10 animate-bounce-gentle opacity-10">
            <Star className="w-8 h-8 text-amber-300" />
          </div>
          <div className="absolute top-32 right-32 animate-pulse-soft opacity-10">
            <Sparkles className="w-6 h-6 text-purple-200" />
          </div>
          <div className="absolute bottom-20 right-20 animate-wiggle opacity-10">
            <Heart className="w-8 h-8 text-pink-300" />
          </div>

          <div className="flex flex-col justify-center max-w-lg relative z-10">
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <EdventureLogo size="xl" className="text-white" />
              </div>
              <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/10">
                <p className="text-3xl font-bold mb-3 text-indigo-200">{t('auth.branding.tagline')}</p>
                <p className="text-indigo-100 text-xl leading-relaxed">
                  {t('auth.branding.description')}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4 bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="bg-amber-400 rounded-full p-3 shadow-lg">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-indigo-200">{t('auth.branding.gamifiedTitle')}</h3>
                  <p className="text-indigo-100">{t('auth.branding.gamifiedDesc')}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="bg-green-400 rounded-full p-3 shadow-lg">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-indigo-200">{t('auth.branding.trackTitle')}</h3>
                  <p className="text-indigo-100">{t('auth.branding.trackDesc')}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="bg-blue-400 rounded-full p-3 shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-indigo-200">{t('auth.branding.familyTitle')}</h3>
                  <p className="text-indigo-100">{t('auth.branding.familyDesc')}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-emerald-500/20 border-2 border-emerald-400/30 rounded-2xl backdrop-blur-lg">
              <p className="text-emerald-200 text-center font-medium">
                {t('auth.branding.freeAccess')}
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Auth forms */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-white to-slate-50 relative">
          <div className="w-full max-w-md">
            {/* Mobile branding */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center mb-6">
                <EdventureLogo size="lg" />
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-white/30 shadow-xl">
              {/* Back to Home Button - Now inside the form container */}
              <Button
                variant="outline"
                onClick={handleBackToHome}
                icon={<ArrowLeft className="w-4 h-4" />}
                className="w-full mb-6 border-indigo-300 text-indigo-600 hover:bg-indigo-50"
              >
                {t('auth.backToHome')}
              </Button>

              {renderForm()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}