import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/OptimizedAuthContext' 
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { X, User, School, Calendar, GraduationCap, Sparkles, Star, Zap, CreditCard } from 'lucide-react'
import { validateDateOfBirth } from '../../utils/dateUtils'
import { PRODUCTS, CHECKOUT_CONFIG } from '../../stripe-config'

interface AddStudentModalProps {
  isOpen: boolean
  onClose: () => void
  onStudentAdded: () => void
}

export function AddStudentModal({ isOpen, onClose, onStudentAdded }: AddStudentModalProps) {
  const { user, profile, subscriptionPlan, isBetaTester, effectiveAccess } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    school: '',
    level: '',
    dateOfBirth: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [purchasingSlot, setPurchasingSlot] = useState(false)
  const [currentStudentCount, setCurrentStudentCount] = useState(0)
  const [loadingStudentCount, setLoadingStudentCount] = useState(true)

  const levels = [
    'Darjah 1', 'Darjah 2', 'Darjah 3', 'Darjah 4', 'Darjah 5', 'Darjah 6',
    'Tingkatan 1', 'Tingkatan 2', 'Tingkatan 3', 'Tingkatan 4', 'Tingkatan 5'
  ]

  // Fetch current student count when modal opens
  useEffect(() => {
    if (isOpen && user) {
      fetchStudentCount()
    }
  }, [isOpen, user])

  const fetchStudentCount = async () => {
    if (!user) return
    
    setLoadingStudentCount(true)
    try {
      const { data: existingStudents, error } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)

      if (error) throw error
      setCurrentStudentCount(existingStudents?.length || 0)
    } catch (err) {
      console.error('Error fetching student count:', err)
    } finally {
      setLoadingStudentCount(false)
    }
  }

  // Premium: 1 kid included, then pay for each additional (but beta testers get unlimited)
  const needsToPurchaseSlot = !isBetaTester && profile?.subscription_plan === 'premium' && currentStudentCount >= 1

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!user) {
      setError('You must be logged in to add a student')
      setLoading(false)
      return
    }

    // Validate date of birth
    const dateValidation = validateDateOfBirth(formData.dateOfBirth)
    if (!dateValidation.isValid) {
      setError(dateValidation.error || 'Invalid date of birth')
      setLoading(false)
      return
    }

    try {
      // Check current student count
      const { data: existingStudents, error: countError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)

      if (countError) {
        throw countError
      }

      // Check subscription limits (beta testers get unlimited kids, premium users are limited)
      if (!isBetaTester && !effectiveAccess?.hasUnlimitedKids && existingStudents && existingStudents.length >= effectiveAccess?.maxStudents) {
        setError(`Free plan is limited to 1 child. Upgrade to Premium to add more children.`)
        setLoading(false)
        return
      }
      
      // For premium users, allow adding kids - payment requirement will be handled in UI

      // Insert new student
      const { error: insertError } = await supabase
        .from('students')
        .insert([
          {
            user_id: user.id,
            name: formData.name.trim(),
            school: formData.school.trim(),
            level: formData.level,
            date_of_birth: formData.dateOfBirth,
            xp: 0
          }
        ])

      if (insertError) {
        throw insertError
      }

      // Reset form and close modal
      setFormData({ name: '', school: '', level: '', dateOfBirth: '' })
      onStudentAdded()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to add student')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('') // Clear error when user starts typing
  }

  const handlePurchaseAdditionalKid = async () => {
    setPurchasingSlot(true)
    setError('')

    try {
      // Get the current user's session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('You must be logged in to purchase additional kids')
      }

      // Create a checkout session for additional kid only (existing premium users)
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          price_id: PRODUCTS.premium.additionalKid.priceId, // Only charge for additional kid
          billing_cycle: 'monthly',
          additional_kids: 0, // Don't double-count since we're using the additional kid price ID directly
          success_url: CHECKOUT_CONFIG.successUrl,
          cancel_url: CHECKOUT_CONFIG.cancelUrl,
          mode: 'subscription'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const { url } = await response.json()
      
      // Redirect to Stripe Checkout
      window.location.href = url
    } catch (err: any) {
      console.error('Error creating checkout session:', err)
      setError(err.message || 'Failed to start purchase process')
      setPurchasingSlot(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white/95 backdrop-blur-lg rounded-lg sm:rounded-xl shadow-xl max-w-md w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="p-3 sm:p-4 bg-gradient-to-r from-indigo-100 to-purple-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg p-2 mr-3 shadow-md">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Add New Kid</h2>
              </div>
              <button
                onClick={onClose}
                className="bg-red-500 text-white hover:bg-red-600 transition-colors rounded-lg p-2 shadow-md"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {isBetaTester ? (
              <p className="text-purple-700 text-xs">
                <strong>Beta Tester:</strong> Unlimited children and exams! 🚀
              </p>
            ) : effectiveAccess?.hasUnlimitedExams ? (
              <p className="text-indigo-700 text-xs">
                Premium plan: <strong>{effectiveAccess?.maxStudents || 1} child{(effectiveAccess?.maxStudents || 1) > 1 ? 'ren' : ''}</strong> and <strong>unlimited exams</strong>!
              </p>
            ) : (
              <p className="text-indigo-700 text-xs">
                Free plan: Limited to <strong>1 child</strong> and <strong>3 exams/day</strong>. <span className="font-semibold">Upgrade to Premium for more!</span>
              </p>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-3 sm:p-4 space-y-4">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                <p className="text-red-700 font-medium text-center text-sm">{error}</p>
              </div>
            )}

            <Input
              type="text"
              placeholder="Kid's full name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              icon={<User className="w-4 h-4" />}
              required
            />

            <Input
              type="text"
              placeholder="School name"
              value={formData.school}
              onChange={(e) => handleInputChange('school', e.target.value)}
              icon={<School className="w-4 h-4" />}
              required
            />

            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                value={formData.level}
                onChange={(e) => handleInputChange('level', e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
                required
              >
                <option value="">Select education level</option>
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <Input
              type="date"
              placeholder="Date of birth"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              icon={<Calendar className="w-4 h-4" />}
              helper="We'll calculate their age automatically"
              required
            />

            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 border border-indigo-300 rounded-lg p-2.5">
              <div className="flex items-center mb-1">
                <Sparkles className="w-4 h-4 text-indigo-600 mr-1.5" />
                <p className="text-indigo-800 font-medium text-xs">Your Plan Info</p>
              </div>
              {isBetaTester ? (
                <p className="text-purple-700 text-xs">
                  <strong>Beta Tester:</strong> Unlimited children and exams! 🚀
                </p>
              ) : effectiveAccess?.hasUnlimitedExams ? (
                <p className="text-indigo-700 text-xs">
                  Premium plan: <strong>{effectiveAccess?.maxStudents || 1} child{(effectiveAccess?.maxStudents || 1) > 1 ? 'ren' : ''}</strong> and <strong>unlimited exams</strong>!
                </p>
              ) : (
                <p className="text-indigo-700 text-xs">
                  Free plan: Limited to <strong>1 child</strong> and <strong>3 exams/day</strong>. <span className="font-semibold">Upgrade to Premium for more!</span>
                </p>
              )}
            </div>

            {/* Purchase Additional Kid Section for Premium Users */}
            {needsToPurchaseSlot && !loadingStudentCount && (
              <div className="bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  <CreditCard className="w-4 h-4 text-amber-600 mr-2" />
                  <p className="text-amber-800 font-medium text-sm">Additional Kid Slot Required</p>
                </div>
                <p className="text-amber-700 text-xs mb-3">
                  You currently have <strong>{currentStudentCount}</strong> {currentStudentCount === 1 ? 'child' : 'children'}. 
                  Premium includes <strong>1 child</strong>. To add another child, purchase an additional slot for <strong>RM10/month</strong>.
                </p>
                <Button
                  type="button"
                  onClick={handlePurchaseAdditionalKid}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm"
                  loading={purchasingSlot}
                  icon={!purchasingSlot ? <CreditCard className="w-4 h-4" /> : undefined}
                >
                  {purchasingSlot ? 'Processing...' : 'Purchase Additional Kid Slot - RM10/month'}
                </Button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border border-slate-200 hover:border-slate-300 text-sm"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm"
                disabled={loading || !formData.name || !formData.school || !formData.level || !formData.dateOfBirth || needsToPurchaseSlot}
                loading={loading}
                icon={!loading ? <Zap className="w-4 h-4" /> : undefined}
              >
                {loading ? 'Adding...' : needsToPurchaseSlot ? 'Purchase Required' : 'Add Kid!'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}