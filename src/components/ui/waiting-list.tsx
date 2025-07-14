import React, { useState, useEffect } from 'react'
import { Button } from './Button'
import { Input } from './Input'
import { Mail, Users, ExternalLink, Crown, Sparkles, Star, Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface WaitlistComponentProps {
  title: string
  subtitle: string
  placeholder: string
  buttonText: {
    idle: string
    loading: string
    success: string
  }
  theme?: 'light' | 'dark' | 'system'
}

export default function WaitlistComponent({
  title,
  subtitle,
  placeholder,
  buttonText,
  theme = 'system'
}: WaitlistComponentProps) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [queuePosition, setQueuePosition] = useState<number>(0)
  const [showForm, setShowForm] = useState(false)

  // Generate random queue position starting from 100+
  useEffect(() => {
    const randomPosition = Math.floor(Math.random() * 500) + 100
    setQueuePosition(randomPosition)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setLoading(false)
    setSuccess(true)
  }

  const handlePriorityAccess = () => {
    // TODO: Replace with your actual Google Form URL for beta testing priority access
    const googleFormUrl = 'https://forms.google.com/forms/d/e/YOUR_FORM_ID/viewform'
    window.open(googleFormUrl, '_blank')
  }

  const getButtonState = () => {
    if (loading) return buttonText.loading
    if (success) return buttonText.success
    return buttonText.idle
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      {/* Floating decorative elements */}
      <div className="fixed top-20 right-10 animate-float z-10 opacity-10">
        <Star className="w-6 h-6 text-indigo-400" />
      </div>
      <div className="fixed top-40 right-32 animate-bounce-gentle z-10 opacity-10">
        <Sparkles className="w-5 h-5 text-purple-400" />
      </div>
      <div className="fixed bottom-20 left-10 animate-wiggle z-10 opacity-10">
        <Trophy className="w-7 h-7 text-amber-400" />
      </div>

      <div className="w-full max-w-md mx-auto">
        <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Crown className="w-8 h-8 text-purple-500 mr-2 animate-pulse-soft" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {title}
              </h1>
              <Crown className="w-8 h-8 text-purple-500 ml-2 animate-pulse-soft" />
            </div>
            <p className="text-slate-600 text-lg mb-6">{subtitle}</p>
            
            {/* Beta Access Notice */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center mb-2">
                <Crown className="w-5 h-5 text-amber-600 mr-2" />
                <span className="text-amber-800 font-semibold">Exclusive Beta Access</span>
              </div>
              <p className="text-amber-700 text-sm">
                Our platform is currently only accessible to beta testers. Join our exclusive program and help shape the future of learning!
              </p>
            </div>
          </div>

          {!success ? (
            <>
              {/* Queue Position */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6 mb-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-indigo-600 mr-2" />
                  <span className="text-indigo-800 font-semibold">Current Position in Queue</span>
                </div>
                <div className="text-4xl font-bold text-indigo-600 mb-2">#{queuePosition}</div>
                <p className="text-indigo-600 text-sm">You're in line for early access!</p>
              </div>

              {/* Email Form */}
              <form onSubmit={handleSubmit} className="space-y-6 mb-6">
                <Input
                  type="email"
                  placeholder={placeholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="w-5 h-5" />}
                  required
                />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                  loading={loading}
                  disabled={loading || !email}
                >
                  {getButtonState()}
                </Button>
              </form>

              {/* Priority Access CTA */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-6">
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center mb-2">
                    <Sparkles className="w-5 h-5 text-emerald-600 mr-2" />
                    <span className="text-emerald-800 font-semibold">Want Priority Access?</span>
                  </div>
                  <p className="text-emerald-700 text-sm mb-4">
                    Get priority beta access for your kids by filling out our detailed form. Skip the queue and get access faster!
                  </p>
                </div>
                
                <Button
                  onClick={handlePriorityAccess}
                  size="lg"
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
                  icon={<ExternalLink className="w-5 h-5" />}
                >
                  Get Priority Beta Access
                </Button>
              </div>
            </>
          ) : (
            /* Success State */
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-xl p-6 mb-6">
                <div className="flex justify-center mb-4">
                  <Trophy className="w-16 h-16 text-amber-500 animate-bounce-gentle" />
                </div>
                <h2 className="text-2xl font-bold text-green-700 mb-2">Welcome to the Waitlist!</h2>
                <p className="text-green-600 mb-4">
                  You're now #{queuePosition} in line for beta access. We'll notify you when it's your turn!
                </p>
                <div className="text-sm text-green-600">
                  <p className="mb-2">✨ Check your email for confirmation</p>
                  <p>🚀 We'll update you on your progress</p>
                </div>
              </div>

              {/* Still show priority access option */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4">
                <p className="text-amber-700 text-sm mb-3">
                  Want to skip the wait? Fill out our priority form for faster access!
                </p>
                <Button
                  onClick={handlePriorityAccess}
                  size="md"
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  icon={<ExternalLink className="w-4 h-4" />}
                >
                  Get Priority Access
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}