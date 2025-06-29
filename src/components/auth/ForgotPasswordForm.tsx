import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Mail, ArrowLeft, Sparkles, Heart, Star, Zap } from 'lucide-react'

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
        <div className="bg-gradient-to-r from-roblox-green-100 to-roblox-blue-100 border-4 border-roblox-green-400 rounded-3xl p-8 shadow-roblox-hover animate-celebrate">
          <div className="flex justify-center mb-4">
            <Heart className="w-16 h-16 text-roblox-green-500 animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold-game text-roblox-green-700 mb-4 animate-bounce-gentle">📧 Check Your Email! 📧</h2>
          <p className="text-roblox-green-600 font-game text-lg mb-6">
            🎯 We've sent a password reset link to <strong>{email}</strong>. 
            Check your email and follow the instructions to get back to learning! 🚀
          </p>
          <Button 
            onClick={onBack} 
            variant="outline"
            size="lg"
            className="font-bold-game border-4 border-roblox-green-400"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            🎮 Back to Sign In 🎮
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-roblox-blue-500 mr-2 animate-pulse" />
          <h1 className="text-4xl font-bold-game text-roblox-blue-600 animate-bounce-gentle">🔐 Reset Password 🔐</h1>
          <Sparkles className="w-8 h-8 text-roblox-blue-500 ml-2 animate-pulse" />
        </div>
        <p className="text-roblox-purple-600 font-game text-lg">🔐 Don't worry! We'll help you get back to learning! 🔐</p>
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
              📧 Sending Reset Link... 📧
            </>
          ) : (
            <>
              <Zap className="w-6 h-6 mr-2" />
              🚀 Send Reset Link! 🚀
            </>
          )}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={onBack}
            className="text-roblox-purple-600 hover:text-roblox-purple-800 font-game font-bold inline-flex items-center transition-colors hover:underline transform hover:scale-105 duration-300"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            🎮 Back to Sign In 🎮
          </button>
        </div>
      </form>
    </div>
  )
}