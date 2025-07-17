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
  syllabus_reference: string
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
    image_url: '',
    syllabus_reference: ''
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
      // Ensure options is always an array
      const questionOptions = Array.isArray(question.options) ? question.options : []
      
      setFormData({
        level: question.level,
        subject: question.subject,
        year: question.year,
        type: question.type,
        topic: question.topic || '',
        question_text: question.question_text,
        options: questionOptions,
        correct_answer: question.correct_answer,
        image_url: question.image_url || '',
        syllabus_reference: question.syllabus_reference || ''
      })
      
      // Convert options array to text for editing
      let newOptionsText = ''
      if (questionOptions.length > 0) {
        if (question.type === 'MCQ') {
          newOptionsText = questionOptions.join('\n')
        } else if (question.type === 'Matching') {
          newOptionsText = questionOptions.join('\n')
        } else {
          newOptionsText = ''
        }
      } else {
        newOptionsText = ''
      }
      
      setOptionsText(newOptionsText)
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
        image_url: formData.image_url.trim() || null,
        syllabus_reference: formData.syllabus_reference.trim() || null
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
      <div className="space-y-4">
        {/* Question Header */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <BookOpen className="w-4 h-4 text-blue-600 mr-2" />
              <div>
                <h4 className="font-bold text-blue-700 text-sm">{formData.type} Question</h4>
                <p className="text-blue-600 text-xs">
                  {formData.level} • {formData.subject} • {formData.year}
                  {formData.topic && ` • ${formData.topic}`}
                </p>
              </div>
            </div>
          </div>
          
          {/* Question Text */}
          <div className="mb-3">
            <h3 className="text-base font-bold text-gray-800 mb-2">
              {formData.question_text}
            </h3>
            
            {/* Image Display */}
            {formData.image_url && (
              <div className="mb-3">
                <img 
                  src={formData.image_url} 
                  alt="Question diagram"
                  className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>

          {/* Question Content Based on Type */}
          {formData.type === 'MCQ' && Array.isArray(formData.options) && formData.options.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="font-semibold text-gray-700 mb-1.5 text-sm">Options:</h4>
              {formData.options.map((option, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg border-2 text-sm ${
                    formData.correct_answer === option
                      ? 'bg-success-100 border-success-400 text-success-800'
                      : 'bg-white border-gray-300 text-gray-700'
                  }`}
                >
                  <span className="font-bold mr-2">{String.fromCharCode(65 + index)}.</span>
                  {option}
                  {formData.correct_answer === option && (
                    <span className="ml-2 text-success-600 font-bold">✓ Correct</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {formData.type === 'Matching' && Array.isArray(formData.options) && formData.options.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700 mb-1.5 text-sm flex items-center">
                <ArrowUpDown className="w-4 h-4 mr-1" />
                Matching Pairs:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {formData.options.map((option, index) => {
                  const [left, right] = option.split(':')
                  return (
                    <div key={index} className="bg-white border-2 border-gray-300 rounded-lg p-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-800 text-sm">{left?.trim()}</span>
                        <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 mx-1.5" />
                        <span className="font-medium text-gray-800 text-sm">{right?.trim()}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {(formData.type === 'ShortAnswer' || formData.type === 'Subjective') && (
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700 mb-1.5 text-sm flex items-center">
                <Edit3 className="w-4 h-4 mr-1" />
                Expected Answer:
              </h4>
              <div className="bg-success-50 border-2 border-success-300 rounded-lg p-2">
                <p className="text-success-800 text-sm">{formData.correct_answer}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!isOpen || !question) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-100 to-green-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-blue-500 rounded-lg p-2 mr-3 shadow-md">
                  {previewMode ? <Eye className="w-5 h-5 text-white" /> : <Edit3 className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-blue-600">
                    {previewMode ? 'Preview Question' : 'Edit Question'}
                  </h2>
                  <p className="text-xs text-green-600">
                    {formData.subject} • {formData.type} • {formData.level}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewMode(!previewMode)}
                  icon={previewMode ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  className="text-xs py-1 px-2 border border-gray-300"
                >
                  {previewMode ? 'Edit' : 'Preview'}
                </Button>
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
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-4">
            {error && (
              <div className="mb-3 bg-error-50 border-2 border-error-200 rounded-lg p-3">
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 text-error-600 mr-2" />
                  <p className="text-error-700 font-medium text-sm">{error}</p>
                </div>
              </div>
            )}

            {previewMode ? (
              renderQuestionPreview()
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic Information - Compact Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                    <select
                      value={formData.level}
                      onChange={(e) => handleInputChange('level', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                      required
                    >
                      <option value="">Select Level</option>
                      {levels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value as any)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
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
                    icon={<Target className="w-4 h-4" />}
                  />
                </div>

                {/* Question Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                  <textarea
                    placeholder="Enter the full question text..."
                    value={formData.question_text}
                    onChange={(e) => handleInputChange('question_text', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm resize-none"
                    required
                  />
                </div>

                {/* Syllabus Reference */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Syllabus Reference</label>
                  <input
                    type="text"
                    placeholder="e.g., Chapter 5: Fractions (5.1.2)"
                    value={formData.syllabus_reference}
                    onChange={(e) => handleInputChange('syllabus_reference', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Short, readable reference to help students identify the topic (optional)
                  </p>
                </div>

                {/* Image URL */}
                <div>
                  <Input
                    type="url"
                    placeholder="https://example.com/image.jpg (optional)"
                    value={formData.image_url}
                    onChange={(e) => handleInputChange('image_url', e.target.value)}
                    label="Image URL (Optional)"
                    icon={<Image className="w-4 h-4" />}
                    helper="Add an image or diagram to accompany the question"
                  />
                  {formData.image_url && (
                    <div className="mt-2">
                      <img 
                        src={formData.image_url} 
                        alt="Question preview"
                        className="max-w-full h-auto max-h-32 rounded-lg border border-gray-200 shadow-sm"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      rows={4}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm resize-none"
                      required={formData.type === 'MCQ' || formData.type === 'Matching'}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.type === 'MCQ' 
                        ? 'Enter each option on a separate line'
                        : 'Enter each matching pair as "Left:Right" on separate lines'
                      }
                    </p>
                  </div>
                )}

                {/* Correct Answer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                  {formData.type === 'MCQ' ? (
                    <select
                      value={formData.correct_answer}
                      onChange={(e) => handleInputChange('correct_answer', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                      required
                    >
                      <option value="">Select correct option</option>
                      {Array.isArray(formData.options) && formData.options.map((option, index) => (
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
                      rows={formData.type === 'Subjective' ? 3 : 2}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm resize-none"
                      required
                    />
                  )}
                </div>

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
                    className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white text-sm"
                    disabled={loading}
                    loading={loading}
                    icon={!loading ? <Save className="w-4 h-4" /> : undefined}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}