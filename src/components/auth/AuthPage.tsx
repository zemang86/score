import React, { useState } from 'react'
import { LoginForm } from './LoginForm'
import { SignUpForm } from './SignUpForm'
import { ForgotPasswordForm } from './ForgotPasswordForm'
import { GraduationCap, Star, Trophy, Users, Sparkles, Gamepad2, Zap, Heart, Crown } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-roblox-blue-100 via-roblox-purple-100 to-roblox-yellow-100 relative overflow-hidden">
      {/* Floating decorative elements */}
      <div className="fixed top-20 right-10 animate-float z-10">
        <Star className="w-8 h-8 text-roblox-yellow-400 opacity-60" />
      </div>
      <div className="fixed top-40 right-32 animate-bounce-gentle z-10">
        <Sparkles className="w-6 h-6 text-roblox-purple-400 opacity-60" />
      </div>
      <div className="fixed bottom-20 left-10 animate-wiggle z-10">
        <Gamepad2 className="w-10 h-10 text-roblox-green-400 opacity-60" />
      </div>
      <div className="fixed top-1/2 right-5 animate-pulse z-10">
        <Zap className="w-7 h-7 text-roblox-yellow-400 opacity-60" />
      </div>
      <div className="fixed bottom-40 right-40 animate-float z-10">
        <Heart className="w-6 h-6 text-roblox-red-400 opacity-60" />
      </div>

      <div className="flex min-h-screen relative z-20">
        {/* Left side - Fun Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-roblox-blue-500 via-roblox-purple-500 to-roblox-blue-600 p-12 text-white relative overflow-hidden">
          {/* Floating decorative elements */}
          <div className="absolute top-10 right-10 animate-bounce-slow">
            <Star className="w-8 h-8 text-roblox-yellow-300" />
          </div>
          <div className="absolute top-32 right-32 animate-pulse">
            <Sparkles className="w-6 h-6 text-roblox-yellow-200" />
          </div>
          <div className="absolute bottom-20 right-20 animate-wiggle">
            <Gamepad2 className="w-10 h-10 text-roblox-green-300" />
          </div>
          <div className="absolute top-1/2 right-5 animate-bounce">
            <Zap className="w-7 h-7 text-roblox-yellow-400" />
          </div>

          <div className="flex flex-col justify-center max-w-lg relative z-10">
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-4 mr-4 shadow-roblox border-4 border-white/30">
                  <GraduationCap className="w-16 h-16 text-roblox-yellow-300" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold-game text-white drop-shadow-lg animate-bounce-gentle">KitaScore</h1>
                  <p className="text-roblox-yellow-200 text-xl font-game">🎮 Powered by KITAMEN 🎮</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border-4 border-white/20 shadow-roblox">
                <p className="text-3xl font-bold-game mb-3 text-roblox-yellow-300 animate-pulse">🎮 We Score Together! 🎮</p>
                <p className="text-roblox-blue-100 text-xl font-game leading-relaxed">
                  🚀 Turn boring exam practice into an EPIC gaming adventure for Malaysian students! 🚀
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border-2 border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="bg-roblox-yellow-400 rounded-full p-3 shadow-neon-yellow">
                  <Star className="w-8 h-8 text-roblox-blue-800" />
                </div>
                <div>
                  <h3 className="font-bold-game text-xl text-roblox-yellow-300">🌟 Epic Gamification! 🌟</h3>
                  <p className="text-roblox-blue-100 font-game">🏆 Earn XP, unlock cool badges, and level up your learning! 🏆</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border-2 border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="bg-roblox-green-400 rounded-full p-3 shadow-neon-green">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold-game text-xl text-roblox-yellow-300">📊 Track Your Progress! 📊</h3>
                  <p className="text-roblox-blue-100 font-game">🎉 Watch your skills grow and celebrate every victory! 🎉</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border-2 border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="bg-roblox-purple-400 rounded-full p-3 shadow-neon-purple">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold-game text-xl text-roblox-yellow-300">👨‍👩‍👧‍👦 Family Fun Dashboard! 👨‍👩‍👧‍👦</h3>
                  <p className="text-roblox-blue-100 font-game">🤝 Parents and kids learning together as a team! 🤝</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-roblox-green-100/20 border-4 border-roblox-green-400/50 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center justify-center text-roblox-green-200 font-game text-center">
                <Crown className="w-6 h-6 mr-3" />
                <span className="text-lg font-bold">
                  🎉 <strong>FREE Premium Access</strong> during launch! 🎉
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth forms */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-white to-roblox-blue-50 relative">
          <div className="w-full max-w-md">
            {/* Mobile branding */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-roblox-blue-500 rounded-3xl p-4 mr-3 shadow-roblox">
                  <GraduationCap className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold-game text-roblox-blue-600 animate-bounce-gentle">KitaScore</h1>
                  <p className="text-roblox-purple-600 font-game text-lg">🎮 We Score Together! 🎮</p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-roblox-hover border-4 border-roblox-blue-200">
              {renderForm()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}