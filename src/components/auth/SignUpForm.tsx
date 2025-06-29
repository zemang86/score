import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Mail, Lock, User, Eye, EyeOff, Sparkles, Star, Crown, Zap } from 'lucide-react'

interface SignUpFormProps {
  onToggleMode: () => void
}

export function SignUpForm({ onToggleMode }: SignUpFormProps) {
  const { signUp } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    const { error } = await signUp(email, password, fullName)
    
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
        <div className="bg-gradient-to-r from-roblox-green-100 to-roblox-yellow-100 border-4 border-roblox-green-400 rounded-3xl p-8 shadow-roblox-hover animate-celebrate">
          <div className="flex justify-center mb-4">
            <Star className="w-16 h-16 text-roblox-yellow-500 animate-bounce" />
          </div>
          <h2 className="text-3xl font-bold-game text-roblox-green-700 mb-4 animate-bounce-gentle">🎉 Account Created! 🎉</h2>
          <p className="text-roblox-green-600 font-game text-lg mb-6">
            🌟 Welcome to KitaScore! You're now part of our awesome learning family! 
            Time to add your kids and start the adventure! 🚀
          </p>
          <Button 
            onClick={onToggleMode} 
            variant="success"
            size="lg"
            className="font-bold-game"
            glow={true}
            bounce={true}
          >
            <Crown className="w-6 h-6 mr-2" />
            🎮 Let's Start Learning! 🎮
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-roblox-purple-500 mr-2 animate-pulse" />
          <h1 className="text-4xl font-bold-game text-roblox-blue-600 animate-bounce-gentle">🎯 Join KitaScore! 🎯</h1>
          <Sparkles className="w-8 h-8 text-roblox-purple-500 ml-2 animate-pulse" />
        </div>
        <p className="text-roblox-purple-600 font-game text-lg">🎯 Create your family's learning adventure account! 🎯</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-roblox-red-100 border-4 border-roblox-red-400 rounded-2xl p-4 shadow-roblox animate-shake">
            <p className="text-roblox-red-700 font-game font-bold text-center">⚠️ {error}</p>
          </div>
        )}

        <Input
          type="text"
          placeholder="Enter your full name 👤"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          fun={true}
          icon={<User className="w-6 h-6" />}
          required
        />

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
            placeholder="Create a strong password 🔐"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fun={true}
            icon={<Lock className="w-6 h-6" />}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-roblox-purple-500 hover:text-roblox-purple-700 transition-colors"
          >
            {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
          </button>
        </div>

        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder="Confirm your password ✅"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          fun={true}
          icon={<Lock className="w-6 h-6" />}
          required
        />

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
              🎮 Creating Account... 🎮
            </>
          ) : (
            <>
              <Zap className="w-6 h-6 mr-2" />
              🚀 Create My Account! 🚀
            </>
          )}
        </Button>

        <div className="text-center bg-gradient-to-r from-roblox-blue-100 to-roblox-purple-100 rounded-2xl p-4 border-4 border-roblox-blue-300 shadow-roblox">
          <p className="text-roblox-blue-700 font-game">
            🎮 Already have an account?{' '}
            <button
              type="button"
              onClick={onToggleMode}
              className="text-roblox-purple-600 hover:text-roblox-purple-800 font-bold transition-colors hover:underline transform hover:scale-105 duration-300"
            >
              🎯 Sign in here! 🎯
            </button>
          </p>
        </div>
      </form>
    </div>
  )
}