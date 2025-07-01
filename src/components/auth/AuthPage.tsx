import React, { useState } from 'react'
import { LoginForm } from './LoginForm'
import { SignUpForm } from './SignUpForm'
import { ForgotPasswordForm } from './ForgotPasswordForm'
import { Star, Trophy, Users, Sparkles, Heart, Zap, Rocket, Brain, Globe, ArrowLeft } from 'lucide-react'
import { EdventureLogo } from '../ui/EdventureLogo'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'

type AuthMode = 'login' | 'signup' | 'forgot'

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')
  const navigate = useNavigate()

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
      <div className="fixed top-20 right-10 animate-float z-10 opacity-30">
        <Star className="w-6 h-6 text-indigo-400" />
      </div>
      <div className="fixed top-40 right-32 animate-bounce-gentle z-10 opacity-30">
        <Sparkles className="w-5 h-5 text-purple-400" />
      </div>
      <div className="fixed bottom-20 left-10 animate-wiggle z-10 opacity-30">
        <Heart className="w-7 h-7 text-pink-400" />
      </div>
      <div className="fixed top-1/2 right-5 animate-pulse-soft z-10 opacity-30">
        <Zap className="w-6 h-6 text-amber-400" />
      </div>

      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-50">
        <Button
          variant="ghost"
          onClick={handleBackToHome}
          icon={<ArrowLeft className="w-4 h-4" />}
          className="text-slate-600 hover:text-indigo-600 bg-white/80 backdrop-blur-sm border border-white/30 shadow-sm"
        >
          Back to Home
        </Button>
      </div>

      <div className="flex min-h-screen relative z-20">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-12 text-white relative overflow-hidden">
          {/* Floating decorative elements */}
          <div className="absolute top-10 right-10 animate-bounce-gentle opacity-40">
            <Star className="w-8 h-8 text-amber-300" />
          </div>
          <div className="absolute top-32 right-32 animate-pulse-soft opacity-40">
            <Sparkles className="w-6 h-6 text-purple-200" />
          </div>
          <div className="absolute bottom-20 right-20 animate-wiggle opacity-40">
            <Heart className="w-8 h-8 text-pink-300" />
          </div>

          <div className="flex flex-col justify-center max-w-lg relative z-10">
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <EdventureLogo size="xl" className="text-white" />
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
                <p className="text-3xl font-bold mb-3 text-amber-300">Where Learning Becomes Adventure!</p>
                <p className="text-purple-100 text-xl leading-relaxed">
                  Transform exam practice into an engaging learning adventure for Malaysian students.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="bg-amber-400 rounded-full p-3 shadow-lg">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-amber-300">Gamified Learning</h3>
                  <p className="text-purple-100">Earn XP, unlock badges, and level up your learning journey!</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="bg-green-400 rounded-full p-3 shadow-lg">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-amber-300">Track Progress</h3>
                  <p className="text-purple-100">Watch your skills grow and celebrate every achievement!</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="bg-blue-400 rounded-full p-3 shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-amber-300">Family Dashboard</h3>
                  <p className="text-purple-100">Parents and kids learning together as a team!</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-green-100/20 border-2 border-green-400/50 rounded-2xl backdrop-blur-lg">
              <p className="text-green-200 text-center font-medium">
                <strong>FREE Premium Access</strong> during launch period!
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
              {renderForm()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}