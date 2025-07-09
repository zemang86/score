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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-800">
      <div className="flex min-h-screen">
        {/* Left side - Admin Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-red-600 via-slate-800 to-slate-900 p-12 text-white relative overflow-hidden">
          {/* Security-themed decorative elements */}
          <div className="absolute top-10 right-10 animate-pulse-soft opacity-40">
            <Shield className="w-12 h-12 text-red-300" />
          </div>
          <div className="absolute top-32 right-32 animate-bounce-gentle opacity-40">
            <Crown className="w-8 h-8 text-amber-400" />
          </div>
          <div className="absolute bottom-20 right-20 animate-pulse-soft opacity-40">
            <Zap className="w-10 h-10 text-red-400" />
          </div>

          <div className="flex flex-col justify-center max-w-lg relative z-10">
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 mr-4 border border-white/30">
                  <Shield className="w-16 h-16 text-red-300" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-white">Admin Portal</h1>
                  <p className="text-red-200 text-xl">Edventure+ System Control</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
                <p className="text-3xl font-bold mb-3 text-red-300">Secure Access Only</p>
                <p className="text-red-100 text-xl leading-relaxed">
                  Administrative access to Edventure+ system management and controls.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="bg-red-500 rounded-full p-3 shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-red-300">System Management</h3>
                  <p className="text-red-100">Full access to user management, question banks, and system analytics.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="bg-amber-500 rounded-full p-3 shadow-lg">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-red-300">Administrative Control</h3>
                  <p className="text-red-100">Monitor platform performance and manage educational content.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="bg-slate-500 rounded-full p-3 shadow-lg">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-red-300">Advanced Analytics</h3>
                  <p className="text-red-100">Deep insights into system usage and educational effectiveness.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-amber-100/20 border-2 border-amber-400/50 rounded-2xl backdrop-blur-lg">
              <p className="text-amber-200 text-center font-medium">
                <strong>Authorized Personnel Only</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Admin Login Form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-100 to-slate-200">
          <div className="w-full max-w-md">
            {/* Mobile branding */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-red-600 rounded-3xl p-4 mr-3 shadow-lg">
                  <Shield className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-slate-800">Admin Portal</h1>
                  <p className="text-red-600 text-lg">Secure Access</p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 border border-white/30 shadow-xl">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-red-600 rounded-full p-3 mr-3 shadow-lg">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-slate-800">Administrator Login</h1>
                </div>
                <p className="text-slate-600 text-lg">Enter your admin credentials to access the system</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <p className="text-red-700 font-medium text-center">{error}</p>
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
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  loading={loading}
                  icon={!loading ? <Shield className="w-5 h-5" /> : undefined}
                >
                  {loading ? 'Authenticating...' : 'Access Admin Panel'}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleBackToHome}
                    className="text-slate-600 hover:text-slate-800 font-medium inline-flex items-center transition-colors hover:underline"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </button>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-amber-800 text-center text-sm">
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