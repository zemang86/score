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
        <div className="bg-gradient-to-r from-success-100 to-accent-100 border-2 border-success-300 rounded-3xl p-8 animate-scale-in">
          <div className="flex justify-center mb-4">
            <Star className="w-16 h-16 text-accent-500 animate-bounce-gentle" />
          </div>
          <h2 className="text-3xl font-bold text-success-700 mb-4">Account Created!</h2>
          <p className="text-success-600 text-lg mb-6">
            Welcome to KitaScore! You're now part of our learning family. 
            Time to add your kids and start the adventure!
          </p>
          <Button 
            onClick={onToggleMode} 
            variant="success"
            size="lg"
            className="w-full"
            icon={<Crown className="w-5 h-5" />}
          >
            Let's Start Learning!
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="w-6 h-6 text-secondary-500 mr-2 animate-pulse-soft" />
          <h1 className="text-3xl font-bold text-primary-600">Join KitaScore!</h1>
          <Sparkles className="w-6 h-6 text-secondary-500 ml-2 animate-pulse-soft" />
        </div>
        <p className="text-secondary-600 text-lg">Create your family's learning adventure account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-error-50 border-2 border-error-200 rounded-xl p-4">
            <p className="text-error-700 font-medium text-center">{error}</p>
          </div>
        )}

        <Input
          type="text"
          placeholder="Enter your full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          icon={<User className="w-5 h-5" />}
          required
        />

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
            placeholder="Create a strong password"
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

        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          icon={<Lock className="w-5 h-5" />}
          required
        />

        <Button
          type="submit"
          variant="fun"
          size="lg"
          className="w-full"
          loading={loading}
          icon={!loading ? <Zap className="w-5 h-5" /> : undefined}
        >
          {loading ? 'Creating Account...' : 'Create My Account!'}
        </Button>

        <div className="text-center bg-primary-50 rounded-xl p-4 border border-primary-200">
          <p className="text-neutral-700">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onToggleMode}
              className="text-primary-600 hover:text-primary-700 font-semibold transition-colors hover:underline"
            >
              Sign in here!
            </button>
          </p>
        </div>
      </form>
    </div>
  )
}