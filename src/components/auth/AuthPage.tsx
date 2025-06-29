import React, { useState } from 'react'
import { LoginForm } from './LoginForm'
import { SignUpForm } from './SignUpForm'
import { ForgotPasswordForm } from './ForgotPasswordForm'
import { GraduationCap, Star, Trophy, Users, Sparkles, Heart, Zap } from 'lucide-react'

type AuthMode = 'login' | 'signup' | 'forgot'

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')

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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 relative overflow-hidden">
      {/* Floating decorative elements */}
      <div className="fixed top-20 right-10 animate-float z-10 opacity-40">
        <Star className="w-6 h-6 text-accent-400" />
      </div>
      <div className="fixed top-40 right-32 animate-bounce-gentle z-10 opacity-40">
        <Sparkles className="w-5 h-5 text-primary-400" />
      </div>
      <div className="fixed bottom-20 left-10 animate-wiggle z-10 opacity-40">
        <Heart className="w-7 h-7 text-secondary-400" />
      </div>
      <div className="fixed top-1/2 right-5 animate-pulse-soft z-10 opacity-40">
        <Zap className="w-6 h-6 text-accent-400" />
      </div>

      <div className="flex min-h-screen relative z-20">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-500 via-secondary-500 to-primary-600 p-12 text-white relative overflow-hidden">
          {/* Floating decorative elements */}
          <div className="absolute top-10 right-10 animate-bounce-gentle opacity-60">
            <Star className="w-8 h-8 text-accent-300" />
          </div>
          <div className="absolute top-32 right-32 animate-pulse-soft opacity-60">
            <Sparkles className="w-6 h-6 text-accent-200" />
          </div>
          <div className="absolute bottom-20 right-20 animate-wiggle opacity-60">
            <Heart className="w-8 h-8 text-secondary-300" />
          </div>

          <div className="flex flex-col justify-center max-w-lg relative z-10">
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <div className="glass rounded-3xl p-4 mr-4 border border-white/30">
                  <GraduationCap className="w-16 h-16 text-accent-300" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-white">KitaScore</h1>
                  <p className="text-accent-200 text-xl">Powered by KITAMEN</p>
                </div>
              </div>
              <div className="glass rounded-3xl p-6 border border-white/20">
                <p className="text-3xl font-bold mb-3 text-accent-300">We Score Together!</p>
                <p className="text-primary-100 text-xl leading-relaxed">
                  Transform exam practice into an engaging learning adventure for Malaysian students.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4 glass rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="bg-accent-400 rounded-full p-3 shadow-warning">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-accent-300">Gamified Learning</h3>
                  <p className="text-primary-100">Earn XP, unlock badges, and level up your learning journey!</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 glass rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="bg-secondary-400 rounded-full p-3 shadow-success">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-accent-300">Track Progress</h3>
                  <p className="text-primary-100">Watch your skills grow and celebrate every achievement!</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 glass rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="bg-primary-400 rounded-full p-3 shadow-fun">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-accent-300">Family Dashboard</h3>
                  <p className="text-primary-100">Parents and kids learning together as a team!</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-success-100/20 border-2 border-success-400/50 rounded-2xl glass">
              <p className="text-success-200 text-center font-medium">
                <strong>FREE Premium Access</strong> during launch period!
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Auth forms */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-white to-primary-50 relative">
          <div className="w-full max-w-md">
            {/* Mobile branding */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-primary-500 rounded-3xl p-4 mr-3 shadow-fun">
                  <GraduationCap className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-primary-600">KitaScore</h1>
                  <p className="text-secondary-600 text-lg">We Score Together</p>
                </div>
              </div>
            </div>

            <div className="glass rounded-3xl p-8 border border-white/30">
              {renderForm()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}