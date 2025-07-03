import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { X, Trophy, Plus, Edit, Trash2, Award, Star, Sparkles, Zap } from 'lucide-react'

interface AddBadgeModalProps {
  isOpen: boolean
  onClose: () => void
  onBadgeAdded: () => void
}

interface BadgeFormData {
  name: string
  description: string
  icon: string
  condition_type: string
  condition_value: number
}

const conditionTypes = [
  { value: 'exams_completed', label: 'Exams Completed', description: 'Complete a certain number of exams' },
  { value: 'perfect_score', label: 'Perfect Scores', description: 'Achieve perfect scores (100%)' },
  { value: 'streak_days', label: 'Learning Streak', description: 'Maintain consecutive days of learning' },
  { value: 'xp_earned', label: 'XP Points', description: 'Earn a certain amount of XP points' },
  { value: 'subject_mastery', label: 'Subject Mastery', description: 'Complete exams in the same subject' },
  { value: 'first_exam', label: 'First Achievement', description: 'Complete first exam or milestone' }
]

const iconOptions = [
  { emoji: '🏆', name: 'Trophy' },
  { emoji: '⭐', name: 'Star' },
  { emoji: '🎯', name: 'Target' },
  { emoji: '🔥', name: 'Fire' },
  { emoji: '💎', name: 'Diamond' },
  { emoji: '👑', name: 'Crown' },
  { emoji: '🚀', name: 'Rocket' },
  { emoji: '⚡', name: 'Lightning' },
  { emoji: '🎖️', name: 'Medal' },
  { emoji: '🏅', name: 'Gold Medal' },
  { emoji: '🌟', name: 'Glowing Star' },
  { emoji: '💫', name: 'Shooting Star' },
  { emoji: '🎊', name: 'Confetti' },
  { emoji: '🎉', name: 'Party' },
  { emoji: '📚', name: 'Books' },
  { emoji: '🧠', name: 'Brain' },
  { emoji: '💪', name: 'Strong' },
  { emoji: '🎓', name: 'Graduate' }
]

export function AddBadgeModal({ isOpen, onClose, onBadgeAdded }: AddBadgeModalProps) {
  const [formData, setFormData] = useState<BadgeFormData>({
    name: '',
    description: '',
    icon: '🏆',
    condition_type: 'exams_completed',
    condition_value: 1
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (field: keyof BadgeFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('') // Clear error when user starts typing
  }

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Badge name is required')
      return false
    }
    if (!formData.description.trim()) {
      setError('Badge description is required')
      return false
    }
    if (!formData.icon.trim()) {
      setError('Badge icon is required')
      return false
    }
    if (!formData.condition_type) {
      setError('Condition type is required')
      return false
    }
    if (formData.condition_value <= 0) {
      setError('Condition value must be greater than 0')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error: insertError } = await supabase
        .from('badges')
        .insert([
          {
            name: formData.name.trim(),
            description: formData.description.trim(),
            icon: formData.icon,
            condition_type: formData.condition_type,
            condition_value: formData.condition_value
          }
        ])

      if (insertError) {
        throw insertError
      }

      // Reset form
      setFormData({
        name: '',
        description: '',
        icon: '🏆',
        condition_type: 'exams_completed',
        condition_value: 1
      })

      // Notify parent component and close modal
      onBadgeAdded()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create badge')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError('')
    setFormData({
      name: '',
      description: '',
      icon: '🏆',
      condition_type: 'exams_completed',
      condition_value: 1
    })
    onClose()
  }

  const getConditionDescription = (type: string) => {
    const condition = conditionTypes.find(c => c.value === type)
    return condition?.description || ''
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-xl max-w-2xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="p-3 sm:p-4 bg-gradient-to-r from-accent-100 to-warning-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-accent-500 rounded-lg p-2 mr-3 shadow-md">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-accent-600">Create New Badge</h2>
                  <p className="text-xs text-warning-600">Design an achievement badge to motivate students</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="bg-red-500 text-white hover:bg-red-600 transition-colors rounded-lg p-2 shadow-md"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-3 sm:p-4 space-y-4">
            {error && (
              <div className="bg-error-50 border-2 border-error-200 rounded-lg p-3">
                <p className="text-error-700 font-medium text-center text-sm">{error}</p>
              </div>
            )}

            {/* Badge Preview - Compact */}
            <div className="bg-gradient-to-r from-accent-100 to-warning-100 border border-accent-300 rounded-lg p-3">
              <h3 className="text-sm font-bold text-accent-700 mb-2 text-center">Badge Preview</h3>
              <div className="flex justify-center">
                <div className="bg-white rounded-lg p-3 shadow-md border border-accent-200 max-w-xs w-full">
                  <div className="text-center">
                    <div className="text-2xl mb-1">{formData.icon}</div>
                    <h4 className="font-bold text-gray-800 mb-0.5 text-sm">
                      {formData.name || 'Badge Name'}
                    </h4>
                    <p className="text-xs text-gray-600 mb-1">
                      {formData.description || 'Badge description will appear here'}
                    </p>
                    <div className="text-xs text-accent-600">
                      {getConditionDescription(formData.condition_type)}
                      {formData.condition_value > 0 && ` (${formData.condition_value})`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Badge Name */}
            <Input
              type="text"
              placeholder="Enter badge name (e.g., 'First Steps', 'Perfect Score Master')"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              icon={<Award className="w-4 h-4" />}
              label="Badge Name"
              helper="Choose a motivating and descriptive name for the badge"
              required
            />

            {/* Badge Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Badge Description
              </label>
              <textarea
                placeholder="Describe what this badge represents and how students can earn it..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 bg-white text-sm resize-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Explain the achievement and inspire students to earn it</p>
            </div>

            {/* Badge Icon - Compact Grid */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Badge Icon
              </label>
              <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5 mb-2">
                {iconOptions.map((option) => (
                  <button
                    key={option.emoji}
                    type="button"
                    onClick={() => handleInputChange('icon', option.emoji)}
                    className={`p-1.5 rounded-lg border-2 transition-all duration-300 hover:scale-110 ${
                      formData.icon === option.emoji
                        ? 'bg-accent-100 border-accent-400 shadow-sm'
                        : 'bg-white border-gray-200 hover:border-accent-300'
                    }`}
                    title={option.name}
                  >
                    <span className="text-lg">{option.emoji}</span>
                  </button>
                ))}
              </div>
              <Input
                type="text"
                placeholder="Or enter custom emoji/icon"
                value={formData.icon}
                onChange={(e) => handleInputChange('icon', e.target.value)}
                icon={<Sparkles className="w-4 h-4" />}
                helper="Select from above or enter your own emoji"
              />
            </div>

            {/* Condition Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Achievement Condition
              </label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={formData.condition_type}
                  onChange={(e) => handleInputChange('condition_type', e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 bg-white text-sm"
                  required
                >
                  {conditionTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {getConditionDescription(formData.condition_type)}
              </p>
            </div>

            {/* Condition Value */}
            <Input
              type="number"
              placeholder="Enter the required value"
              value={formData.condition_value}
              onChange={(e) => handleInputChange('condition_value', parseInt(e.target.value) || 0)}
              icon={<Zap className="w-4 h-4" />}
              label="Required Value"
              helper="How many times the condition must be met to earn this badge"
              min="1"
              required
            />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 text-sm border border-gray-200"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-accent-500 to-warning-500 hover:from-accent-600 hover:to-warning-600 text-white text-sm"
                disabled={loading || !formData.name || !formData.description}
                loading={loading}
                icon={!loading ? <Plus className="w-4 h-4" /> : undefined}
              >
                {loading ? 'Creating Badge...' : 'Create Badge'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}