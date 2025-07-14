import React, { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Phone, Shield, Check, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface PhoneVerificationProps {
  email: string
  onVerificationComplete: () => void
  onBack: () => void
}

export function PhoneVerification({ email, onVerificationComplete, onBack }: PhoneVerificationProps) {
  const { t } = useTranslation()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [step, setStep] = useState<'phone' | 'verify'>('phone')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate sending SMS code
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setLoading(false)
    setStep('verify')
    setCountdown(60) // 60 second countdown for resend
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate code verification
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setLoading(false)
    onVerificationComplete()
  }

  const handleResendCode = async () => {
    setLoading(true)
    
    // Simulate resending code
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setLoading(false)
    setCountdown(60)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-green-500 mr-2 animate-pulse-soft" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Phone Verification
          </h1>
        </div>
        <p className="text-slate-600 text-lg">
          {step === 'phone' 
            ? 'Verify your phone number to secure your account' 
            : 'Enter the verification code sent to your phone'
          }
        </p>
        <p className="text-slate-500 text-sm mt-2">
          Email: <span className="font-medium">{email}</span>
        </p>
      </div>

      {step === 'phone' ? (
        <form onSubmit={handleSendCode} className="space-y-6">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-center mb-2">
              <Shield className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-blue-800 font-semibold">Security First</span>
            </div>
            <p className="text-blue-700 text-sm">
              We'll send a verification code to your phone to ensure your account security before granting beta access.
            </p>
          </div>

          <Input
            type="tel"
            placeholder="Enter your phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            icon={<Phone className="w-5 h-5" />}
            required
          />

          <div className="space-y-3">
            <Button
              type="submit"
              size="lg"
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              loading={loading}
              disabled={loading || !phoneNumber}
              icon={!loading ? <ArrowRight className="w-5 h-5" /> : undefined}
            >
              {loading ? 'Sending Code...' : 'Send Verification Code'}
            </Button>

            <Button
              type="button"
              onClick={onBack}
              size="lg"
              variant="outline"
              className="w-full"
            >
              Back to Registration
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-6">
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <div className="flex items-center mb-2">
              <Check className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-800 font-semibold">Code Sent!</span>
            </div>
            <p className="text-green-700 text-sm">
              We've sent a 6-digit verification code to {phoneNumber}
            </p>
          </div>

          <Input
            type="text"
            placeholder="Enter 6-digit code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            icon={<Shield className="w-5 h-5" />}
            required
            maxLength={6}
          />

          <div className="space-y-3">
            <Button
              type="submit"
              size="lg"
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              loading={loading}
              disabled={loading || verificationCode.length !== 6}
              icon={!loading ? <Check className="w-5 h-5" /> : undefined}
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </Button>

            {countdown > 0 ? (
              <p className="text-center text-slate-500 text-sm">
                Resend code in {countdown} seconds
              </p>
            ) : (
              <Button
                type="button"
                onClick={handleResendCode}
                size="md"
                variant="outline"
                className="w-full"
                loading={loading}
              >
                Resend Code
              </Button>
            )}

            <Button
              type="button"
              onClick={() => setStep('phone')}
              size="md"
              variant="ghost"
              className="w-full"
            >
              Change Phone Number
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}