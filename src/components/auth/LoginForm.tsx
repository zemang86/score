import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Mail, Lock, Eye, EyeOff, Sparkles, Zap } from 'lucide-react'

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
          <Sparkles className="w-6 h-6 text-accent-500 mr-2 animate-pulse-soft" />
          <h1 className="text-3xl font-bold text-primary-600">Welcome Back!</h1>
          <Sparkles className="w-6 h-6 text-accent-500 ml-2 animate-pulse-soft" />
        </div>
        <p className="text-secondary-600 text-lg">Ready for another learning adventure?</p>
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

        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-5 h-5" />}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <Button
          type="submit"
          variant="fun"
          size="lg"
          className="w-full"
          loading={loading}
          icon={!loading ? <Zap className="w-5 h-5" /> : undefined}
        >
          {loading ? 'Signing In...' : "Let's Go!"}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-secondary-600 hover:text-secondary-700 font-medium transition-colors hover:underline"
          >
            Forgot your password?
          </button>
        </div>

        <div className="text-center bg-accent-50 rounded-xl p-4 border border-accent-200">
          <p className="text-neutral-700">
            New to KitaScore?{' '}
            <button
              type="button"
              onClick={onToggleMode}
              className="text-primary-600 hover:text-primary-700 font-semibold transition-colors hover:underline"
            >
              Join the fun here!
            </button>
          </p>
        </div>
      </form>
    </div>
  )
}