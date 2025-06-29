import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Mail, Lock, Eye, EyeOff, Sparkles, Star, Zap } from 'lucide-react'

interface LoginFormProps {
  onToggleMode: () => void
  onForgotPassword: () => void
}

export function LoginForm({ onToggleMode, onForgotPassword }: LoginFormProps) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await signIn(email, password)
    
    if (error) {
      setError(error.message)
    }
    
    setLoading(false)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-roblox-yellow-500 mr-2 animate-pulse" />
          <h1 className="text-4xl font-bold-game text-roblox-blue-600 animate-bounce-gentle">🎯 Welcome Back! 🎯</h1>
          <Sparkles className="w-8 h-8 text-roblox-yellow-500 ml-2 animate-pulse" />
        </div>
        <p className="text-roblox-purple-600 font-game text-lg">🚀 Ready for another awesome learning adventure? 🚀</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-roblox-red-100 border-4 border-roblox-red-400 rounded-2xl p-4 shadow-roblox animate-shake">
            <p className="text-roblox-red-700 font-game font-bold text-center">⚠️ {error}</p>
          </div>
        )}

        <Input
          type="email"
          placeholder="Enter your email address 📧"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fun={true}
          icon={<Mail className="w-6 h-6" />}
          required
        />

        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password 🔐"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fun={true}
            icon={<Lock className="w-6 h-6" />}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-roblox-blue-500 hover:text-roblox-blue-700 transition-colors"
          >
            {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
          </button>
        </div>

        <Button
          type="submit"
          variant="fun"
          size="lg"
          className="w-full font-bold-game text-xl"
          disabled={loading}
          glow={!loading}
          bounce={!loading}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
              🎮 Signing In... 🎮
            </>
          ) : (
            <>
              <Zap className="w-6 h-6 mr-2" />
              🚀 Let's Go! 🚀
            </>
          )}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-roblox-purple-600 hover:text-roblox-purple-800 font-game font-bold transition-colors hover:underline transform hover:scale-105 duration-300"
          >
            🤔 Forgot your password? 🤔
          </button>
        </div>

        <div className="text-center bg-gradient-to-r from-roblox-yellow-100 to-roblox-orange-100 rounded-2xl p-4 border-4 border-roblox-yellow-300 shadow-roblox">
          <p className="text-roblox-blue-700 font-game">
            🆕 New to KitaScore?{' '}
            <button
              type="button"
              onClick={onToggleMode}
              className="text-roblox-purple-600 hover:text-roblox-purple-800 font-bold transition-colors hover:underline transform hover:scale-105 duration-300"
            >
              🎉 Join the fun here! 🎉
            </button>
          </p>
        </div>
      </form>
    </div>
  )
}