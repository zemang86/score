import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Shield, Mail, Lock, Eye, EyeOff, ArrowLeft, Crown, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function AdminLoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
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
    // Note: If login is successful, the AuthContext will handle redirection
    // based on the user's admin status
    
    setLoading(false)
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-error-900 to-neutral-800">
      <div className="flex min-h-screen">
        {/* Left side - Admin Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-error-600 via-neutral-800 to-neutral-900 p-12 text-white relative overflow-hidden">
          {/* Security-themed decorative elements */}
          <div className="absolute top-10 right-10 animate-pulse-soft opacity-60">
            <Shield className="w-12 h-12 text-error-300" />
          </div>
          <div className="absolute top-32 right-32 animate-bounce-gentle opacity-60">
            <Crown className="w-8 h-8 text-accent-400" />
          </div>
          <div className="absolute bottom-20 right-20 animate-pulse-soft opacity-60">
            <Zap className="w-10 h-10 text-error-400" />
          </div>

          <div className="flex flex-col justify-center max-w-lg relative z-10">
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <div className="glass rounded-3xl p-4 mr-4 border border-white/30">
                  <Shield className="w-16 h-16 text-error-300" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-white">Admin Portal</h1>
                  <p className="text-error-200 text-xl">KitaScore System Control</p>
                </div>
              </div>
              <div className="glass rounded-3xl p-6 border border-white/20">
                <p className="text-3xl font-bold mb-3 text-error-300">Secure Access Only</p>
                <p className="text-error-100 text-xl leading-relaxed">
                  Administrative access to KitaScore system management and controls.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4 glass rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="bg-error-500 rounded-full p-3 shadow-error">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-error-300">System Management</h3>
                  <p className="text-error-100">Full access to user management, question banks, and system analytics.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 glass rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="bg-accent-500 rounded-full p-3 shadow-warning">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-error-300">Administrative Control</h3>
                  <p className="text-error-100">Monitor platform performance and manage educational content.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 glass rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="bg-neutral-500 rounded-full p-3 shadow-medium">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-error-300">Advanced Analytics</h3>
                  <p className="text-error-100">Deep insights into system usage and educational effectiveness.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-warning-100/20 border-2 border-warning-400/50 rounded-2xl glass">
              <p className="text-warning-200 text-center font-medium">
                <strong>Authorized Personnel Only</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Admin Login Form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-neutral-100 to-neutral-200">
          <div className="w-full max-w-md">
            {/* Mobile branding */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-error-600 rounded-3xl p-4 mr-3 shadow-error">
                  <Shield className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-neutral-800">Admin Portal</h1>
                  <p className="text-error-600 text-lg">Secure Access</p>
                </div>
              </div>
            </div>

            <div className="glass rounded-3xl p-8 border border-white/30">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-error-600 rounded-full p-3 mr-3 shadow-error">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-neutral-800">Administrator Login</h1>
                </div>
                <p className="text-neutral-600 text-lg">Enter your admin credentials to access the system</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-error-50 border-2 border-error-200 rounded-xl p-4">
                    <p className="text-error-700 font-medium text-center">{error}</p>
                  </div>
                )}

                <Input
                  type="email"
                  placeholder="Admin email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="w-5 h-5" />}
                  required
                />

                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Admin password"
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
                  variant="error"
                  size="lg"
                  className="w-full"
                  loading={loading}
                  icon={!loading ? <Shield className="w-5 h-5" /> : undefined}
                >
                  {loading ? 'Authenticating...' : 'Access Admin Panel'}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleBackToHome}
                    className="text-neutral-600 hover:text-neutral-800 font-medium inline-flex items-center transition-colors hover:underline"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </button>
                </div>

                <div className="bg-warning-50 border border-warning-200 rounded-xl p-4">
                  <p className="text-warning-800 text-center text-sm">
                    <strong>Security Notice:</strong> This area is restricted to authorized administrators only. 
                    All access attempts are logged and monitored.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}