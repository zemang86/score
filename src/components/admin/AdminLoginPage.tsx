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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black">
      <div className="flex min-h-screen">
        {/* Left side - Admin Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-red-600 via-gray-800 to-black p-12 text-white relative overflow-hidden">
          {/* Security-themed decorative elements */}
          <div className="absolute top-10 right-10 animate-pulse">
            <Shield className="w-12 h-12 text-red-300 opacity-60" />
          </div>
          <div className="absolute top-32 right-32 animate-bounce-slow">
            <Crown className="w-8 h-8 text-yellow-400 opacity-60" />
          </div>
          <div className="absolute bottom-20 right-20 animate-pulse">
            <Zap className="w-10 h-10 text-red-400 opacity-60" />
          </div>

          <div className="flex flex-col justify-center max-w-lg relative z-10">
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <div className="bg-red-600/30 backdrop-blur-sm rounded-3xl p-4 mr-4 shadow-roblox border-2 border-red-400/50">
                  <Shield className="w-16 h-16 text-red-300" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold-game text-white drop-shadow-lg">Admin Portal</h1>
                  <p className="text-red-200 text-xl font-game">KitaScore System Control</p>
                </div>
              </div>
              <div className="bg-red-600/20 backdrop-blur-sm rounded-3xl p-6 border-2 border-red-400/30 shadow-roblox">
                <p className="text-3xl font-bold-game mb-3 text-red-300">🛡️ Secure Access Only 🛡️</p>
                <p className="text-red-100 text-xl font-game leading-relaxed">
                  Administrative access to KitaScore system management and controls.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4 bg-red-600/20 backdrop-blur-sm rounded-2xl p-4 border border-red-400/30 hover:bg-red-600/30 transition-all duration-300">
                <div className="bg-red-500 rounded-full p-3 shadow-roblox">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold-game text-xl text-red-300">🔐 System Management</h3>
                  <p className="text-red-100 font-game">Full access to user management, question banks, and system analytics.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-red-600/20 backdrop-blur-sm rounded-2xl p-4 border border-red-400/30 hover:bg-red-600/30 transition-all duration-300">
                <div className="bg-yellow-500 rounded-full p-3 shadow-roblox">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold-game text-xl text-red-300">👑 Administrative Control</h3>
                  <p className="text-red-100 font-game">Monitor platform performance and manage educational content.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-red-600/20 backdrop-blur-sm rounded-2xl p-4 border border-red-400/30 hover:bg-red-600/30 transition-all duration-300">
                <div className="bg-gray-500 rounded-full p-3 shadow-roblox">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold-game text-xl text-red-300">⚡ Advanced Analytics</h3>
                  <p className="text-red-100 font-game">Deep insights into system usage and educational effectiveness.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-yellow-600/20 border-2 border-yellow-400/50 rounded-2xl">
              <p className="text-yellow-200 font-game text-center">
                ⚠️ <strong>Authorized Personnel Only</strong> ⚠️
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Admin Login Form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-100 to-gray-200">
          <div className="w-full max-w-md">
            {/* Mobile branding */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-red-600 rounded-3xl p-4 mr-3 shadow-roblox">
                  <Shield className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold-game text-gray-800">Admin Portal</h1>
                  <p className="text-red-600 font-game text-lg">🛡️ Secure Access 🛡️</p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-roblox border-4 border-gray-300">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-red-600 rounded-full p-3 mr-3 shadow-roblox">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold-game text-gray-800">Administrator Login</h1>
                </div>
                <p className="text-gray-600 font-game text-lg">🔐 Enter your admin credentials to access the system 🔐</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-100 border-4 border-red-400 rounded-2xl p-4 shadow-roblox">
                    <p className="text-red-700 font-game font-bold text-center">⚠️ {error}</p>
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-500 w-6 h-6" />
                  <Input
                    type="email"
                    placeholder="Admin email address 📧"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 font-game border-4 border-gray-300 focus:border-red-500 focus:ring-4 focus:ring-red-200 rounded-2xl shadow-roblox bg-gradient-to-r from-white to-gray-50"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-500 w-6 h-6" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Admin password 🔐"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12 font-game border-4 border-gray-300 focus:border-red-500 focus:ring-4 focus:ring-red-200 rounded-2xl shadow-roblox bg-gradient-to-r from-white to-gray-50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full font-bold-game text-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-2 border-red-800 shadow-roblox hover:shadow-roblox-hover"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                      Authenticating... 🔐
                    </>
                  ) : (
                    <>
                      <Shield className="w-6 h-6 mr-3" />
                      🛡️ Access Admin Panel 🛡️
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleBackToHome}
                    className="text-gray-600 hover:text-gray-800 font-game font-bold inline-flex items-center transition-colors hover:underline"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    🏠 Back to Home 🏠
                  </button>
                </div>

                <div className="bg-yellow-100 border-2 border-yellow-400 rounded-2xl p-4">
                  <p className="text-yellow-800 font-game text-center text-sm">
                    ⚠️ <strong>Security Notice:</strong> This area is restricted to authorized administrators only. 
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