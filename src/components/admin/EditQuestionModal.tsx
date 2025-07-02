import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Question } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { X, Save, Eye, Image, BookOpen, Target, Edit3, ArrowUpDown, AlertCircle } from 'lucide-react'

interface EditQuestionModalProps {
  isOpen: boolean
  onClose: () => void
  question: Question | null
  onQuestionUpdated: () => void
}

interface QuestionFormData {
  level: string
  subject: string
  year: string
  type: 'MCQ' | 'ShortAnswer' | 'Subjective' | 'Matching'
  topic: string
  question_text: string
  options: string[]
  correct_answer: string
  image_url: string
}

export function EditQuestionModal({ isOpen, onClose, question, onQuestionUpdated }: EditQuestionModalProps) {
  const [formData, setFormData] = useState<QuestionFormData>({
    level: '',
    subject: '',
    year: '',
    type: 'MCQ',
    topic: '',
    question_text: '',
    options: [],
    correct_answer: '',
    image_url: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [previewMode, setPreviewMode] = useState(false)
  const [optionsText, setOptionsText] = useState('')

  const levels = [
    'Darjah 1', 'Darjah 2', 'Darjah 3', 'Darjah 4', 'Darjah 5', 'Darjah 6',
    'Tingkatan 1', 'Tingkatan 2', 'Tingkatan 3', 'Tingkatan 4', 'Tingkatan 5'
  ]

  const subjects = ['Bahasa Melayu', 'English', 'Mathematics', 'Science', 'History']

  const questionTypes = [
    { value: 'MCQ', label: 'Multiple Choice (MCQ)' },
    { value: 'ShortAnswer', label: 'Short Answer' },
    { value: 'Subjective', label: 'Subjective/Essay' },
    { value: 'Matching', label: 'Matching' }
  ]

  // Populate form when question changes
  useEffect(() => {
    if (question && isOpen) {
      setFormData({
        level: question.level,
        subject: question.subject,
        year: question.year,
        type: question.type,
        topic: question.topic || '',
        question_text: question.question_text,
        options: question.options || [],
        correct_answer: question.correct_answer,
        image_url: question.image_url || ''
      })
      
      // Convert options array to text for editing
      if (question.options && question.options.length > 0) {
        if (question.type === 'MCQ') {
          setOptionsText(question.options.join('\n'))
        } else if (question.type === 'Matching') {
          setOptionsText(question.options.join('\n'))
        } else {
          setOptionsText('')
        }
      } else {
        setOptionsText('')
      }
      
      setError('')
      setPreviewMode(false)
    }
  }, [question, isOpen])

  const handleInputChange = (field: keyof QuestionFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  const handleOptionsChange = (value: string) => {
    setOptionsText(value)
    
    // Convert text to options array based on question type
    if (formData.type === 'MCQ') {
      const options = value.split('\n').map(opt => opt.trim()).filter(opt => opt)
      setFormData(prev => ({ ...prev, options }))
    } else if (formData.type === 'Matching') {
      const options = value.split('\n').map(opt => opt.trim()).filter(opt => opt)
      setFormData(prev => ({ ...prev, options }))
    }
  }

  const validateForm = (): boolean => {
    if (!formData.level.trim()) {
      setError('Level is required')
      return false
    }
    if (!formData.subject.trim()) {
      setError('Subject is required')
      return false
    }
    if (!formData.year.trim()) {
      setError('Year is required')
      return false
    }
    if (!formData.question_text.trim()) {
      setError('Question text is required')
      return false
    }
    if (!formData.correct_answer.trim()) {
      setError('Correct answer is required')
      return false
    }
    
    // Validate options for MCQ and Matching
    if (formData.type === 'MCQ' && formData.options.length < 2) {
      setError('MCQ questions must have at least 2 options')
      return false
    }
    if (formData.type === 'Matching' && formData.options.length < 2) {
      setError('Matching questions must have at least 2 pairs')
      return false
    }
    
    // Validate matching format
    if (formData.type === 'Matching') {
      const invalidPairs = formData.options.filter(option => !option.includes(':'))
      if (invalidPairs.length > 0) {
        setError('Matching options must be in format "Left:Right"')
        return false
      }
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question) return

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const updateData = {
        level: formData.level.trim(),
        subject: formData.subject.trim(),
        year: formData.year.trim(),
        type: formData.type,
        topic: formData.topic.trim() || null,
        question_text: formData.question_text.trim(),
        options: formData.options,
        correct_answer: formData.correct_answer.trim(),
        image_url: formData.image_url.trim() || null
      }

      const { error: updateError } = await supabase
        .from('questions')
        .update(updateData)
        .eq('id', question.id)

      if (updateError) {
        throw updateError
      }

      onQuestionUpdated()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to update question')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError('')
    setPreviewMode(false)
    onClose()
  }

  const renderQuestionPreview = () => {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Question Header */}
        <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 mr-2 sm:mr-3" />
              <div>
                <h4 className="font-bold text-primary-700 text-sm sm:text-base">{formData.type} Question</h4>
                <p className="text-primary-600 text-xs sm:text-sm">
                  {formData.level} • {formData.subject} • {formData.year}
                  {formData.topic && ` • ${formData.topic}`}
                </p>
              </div>
            </div>
          </div>
          
          {/* Question Text */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-neutral-800 mb-3 sm:mb-4">
              {formData.question_text}
            </h3>
            
            {/* Image Display */}
            {formData.image_url && (
              <div className="mb-4 sm:mb-6">
                <img 
                  src={formData.image_url} 
                  alt="Question diagram"
                  className="max-w-full h-auto rounded-xl border border-neutral-200 shadow-sm"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>

          {/* Question Content Based on Type */}
          {formData.type === 'MCQ' && formData.options.length > 0 && (
            <div className="space-y-2 sm:space-y-3">
              <h4 className="font-semibold text-neutral-700 mb-2 sm:mb-3 text-sm sm:text-base">Options:</h4>
              {formData.options.map((option, index) => (
                <div
                  key={index}
                  className={`p-3 sm:p-4 rounded-xl border-2 text-sm sm:text-base ${
                    formData.correct_answer === option
                      ? 'bg-success-100 border-success-400 text-success-800'
                      : 'bg-white border-neutral-300 text-neutral-700'
                  }`}
                >
                  <span className="font-bold mr-2 sm:mr-3">{String.fromCharCode(65 + index)}.</span>
                  {option}
                  {formData.correct_answer === option && (
                    <span className="ml-2 text-success-600 font-bold">✓ Correct</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {formData.type === 'Matching' && formData.options.length > 0 && (
            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-semibold text-neutral-700 mb-2 sm:mb-3 text-sm sm:text-base flex items-center">
                <ArrowUpDown className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Matching Pairs:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {formData.options.map((option, index) => {
                  const [left, right] = option.split(':')
                  return (
                    <div key={index} className="bg-white border-2 border-neutral-300 rounded-xl p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-neutral-800 text-sm sm:text-base">{left?.trim()}</span>
                        <ArrowUpDown className="w-4 h-4 text-neutral-400 mx-2" />
                        <span className="font-medium text-neutral-800 text-sm sm:text-base">{right?.trim()}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {(formData.type === 'ShortAnswer' || formData.type === 'Subjective') && (
            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-semibold text-neutral-700 mb-2 sm:mb-3 text-sm sm:text-base flex items-center">
                <Edit3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Expected Answer:
              </h4>
              <div className="bg-success-50 border-2 border-success-300 rounded-xl p-3 sm:p-4">
                <p className="text-success-800 text-sm sm:text-base">{formData.correct_answer}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!isOpen || !question) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-200 bg-gradient-to-r from-primary-100 to-secondary-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-primary-500 rounded-full p-2 sm:p-3 mr-3 sm:mr-4 shadow-lg">
                {previewMode ? <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-white" /> : <Edit3 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-600">
                  {previewMode ? 'Preview Question' : 'Edit Question'}
                </h2>
                <p className="text-sm sm:text-base text-secondary-600">
                  {formData.subject} • {formData.type} • {formData.level}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
                icon={previewMode ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                className="text-xs sm:text-sm"
              >
                {previewMode ? 'Edit' : 'Preview'}
              </Button>
              <button
                onClick={handleClose}
                className="text-neutral-400 hover:text-neutral-600 transition-colors bg-white rounded-full p-1.5 sm:p-2 shadow-sm"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {error && (
            <div className="mb-4 sm:mb-6 bg-error-50 border-2 border-error-200 rounded-xl p-3 sm:p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-error-600 mr-2 sm:mr-3" />
                <p className="text-error-700 font-medium text-sm sm:text-base">{error}</p>
              </div>
            </div>
          )}

          {previewMode ? (
            renderQuestionPreview()
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => handleInputChange('level', e.target.value)}
                    className="w-full px-3 py-2.5 sm:py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm sm:text-base"
                    required
                  >
                    <option value="">Select Level</option>
                    {levels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className="w-full px-3 py-2.5 sm:py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm sm:text-base"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                <Input
                  type="text"
                  placeholder="e.g., 2023"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  label="Year"
                  required
                />
              </div>

              {/* Question Type and Topic */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Question Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value as any)}
                    className="w-full px-3 py-2.5 sm:py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm sm:text-base"
                    required
                  >
                    {questionTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <Input
                  type="text"
                  placeholder="e.g., Algebra, Grammar (optional)"
                  value={formData.topic}
                  onChange={(e) => handleInputChange('topic', e.target.value)}
                  label="Topic (Optional)"
                  icon={<Target className="w-4 h-4 sm:w-5 sm:h-5" />}
                />
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Question Text</label>
                <textarea
                  placeholder="Enter the full question text..."
                  value={formData.question_text}
                  onChange={(e) => handleInputChange('question_text', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm sm:text-base resize-none"
                  required
                />
              </div>

              {/* Image URL */}
              <div>
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg (optional)"
                  value={formData.image_url}
                  onChange={(e) => handleInputChange('image_url', e.target.value)}
                  label="Image URL (Optional)"
                  icon={<Image className="w-4 h-4 sm:w-5 sm:h-5" />}
                  helper="Add an image or diagram to accompany the question"
                />
                {formData.image_url && (
                  <div className="mt-3">
                    <img 
                      src={formData.image_url} 
                      alt="Question preview"
                      className="max-w-full h-auto max-h-48 rounded-xl border border-neutral-200 shadow-sm"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Options (for MCQ and Matching) */}
              {(formData.type === 'MCQ' || formData.type === 'Matching') && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    {formData.type === 'MCQ' ? 'Answer Options' : 'Matching Pairs'}
                  </label>
                  <textarea
                    placeholder={
                      formData.type === 'MCQ' 
                        ? "Enter each option on a new line:\nOption A\nOption B\nOption C\nOption D"
                        : "Enter each pair on a new line in format Left:Right:\nQuestion 1:Answer 1\nQuestion 2:Answer 2"
                    }
                    value={optionsText}
                    onChange={(e) => handleOptionsChange(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm sm:text-base resize-none"
                    required={formData.type === 'MCQ' || formData.type === 'Matching'}
                  />
                  <p className="text-sm text-neutral-500 mt-2">
                    {formData.type === 'MCQ' 
                      ? 'Enter each option on a separate line'
                      : 'Enter each matching pair as "Left:Right" on separate lines'
                    }
                  </p>
                </div>
              )}

              {/* Correct Answer */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Correct Answer</label>
                {formData.type === 'MCQ' ? (
                  <select
                    value={formData.correct_answer}
                    onChange={(e) => handleInputChange('correct_answer', e.target.value)}
                    className="w-full px-3 py-2.5 sm:py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm sm:text-base"
                    required
                  >
                    <option value="">Select correct option</option>
                    {formData.options.map((option, index) => (
                      <option key={index} value={option}>
                        {String.fromCharCode(65 + index)}. {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <textarea
                    placeholder={
                      formData.type === 'Matching' 
                        ? "For matching questions, this should describe the correct pairing logic or be the same as the options"
                        : "Enter the correct answer or key points for grading"
                    }
                    value={formData.correct_answer}
                    onChange={(e) => handleInputChange('correct_answer', e.target.value)}
                    rows={formData.type === 'Subjective' ? 4 : 2}
                    className="w-full px-3 py-3 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm sm:text-base resize-none"
                    required
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 text-sm sm:text-base"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white text-sm sm:text-base"
                  disabled={loading}
                  loading={loading}
                  icon={!loading ? <Save className="w-4 h-4 sm:w-5 sm:h-5" /> : undefined}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}