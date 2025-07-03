import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Question } from '../../lib/supabase'
import { BookOpen, Search, Filter, Plus, Edit, Trash2, Upload, FileText, CheckCircle, AlertCircle, ArrowUpDown, Edit3, ChevronLeft, ChevronRight, Eye, RotateCcw } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { EditQuestionModal } from './EditQuestionModal'

interface UploadResult {
  success: boolean
  message: string
  imported: number
  errors: string[]
}

export function QuestionManagement() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [error, setError] = useState('')
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [questionsPerPage, setQuestionsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  
  // Subject list state
  const [allSubjects, setAllSubjects] = useState<string[]>([])
  const [allLevels, setAllLevels] = useState<string[]>([])
  
  // CSV Upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)

  // Edit Question Modal states
  const [selectedQuestionForEdit, setSelectedQuestionForEdit] = useState<Question | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  // Delete states
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null)

  // Question types
  const questionTypes = [
    { value: 'MCQ', label: 'Multiple Choice (MCQ)' },
    { value: 'ShortAnswer', label: 'Short Answer' },
    { value: 'Subjective', label: 'Subjective/Essay' },
    { value: 'Matching', label: 'Matching' }
  ]

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      setError('')

      // Build the query
      let query = supabase
        .from('questions')
        .select('*', { count: 'exact' })

      // Apply filters
      if (searchTerm) {
        query = query.or(`question_text.ilike.%${searchTerm}%,topic.ilike.%${searchTerm}%`)
      }
      
      if (selectedSubject) {
        query = query.eq('subject', selectedSubject)
      }
      
      if (selectedLevel) {
        query = query.eq('level', selectedLevel)
      }

      if (selectedType) {
        query = query.eq('type', selectedType)
      }

      // Apply pagination
      const from = (currentPage - 1) * questionsPerPage
      const to = from + questionsPerPage - 1
      
      query = query.range(from, to).order('created_at', { ascending: false })

      const { data, error: fetchError, count } = await query

      if (fetchError) {
        throw fetchError
      }

      setQuestions(data || [])
      setTotalQuestions(count || 0)
      setTotalPages(Math.ceil((count || 0) / questionsPerPage))
    } catch (err) {
      console.error('Error fetching questions:', err)
      setError('Failed to fetch questions')
    } finally {
      setLoading(false)
    }
  }

  const fetchAllSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('subject')
        .not('subject', 'is', null)

      if (error) throw error

      const subjects = [...new Set(data?.map(item => item.subject) || [])]
      setAllSubjects(subjects.sort())
    } catch (err) {
      console.error('Error fetching subjects:', err)
    }
  }

  const fetchAllLevels = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('level')
        .not('level', 'is', null)

      if (error) throw error

      const levels = [...new Set(data?.map(item => item.level) || [])]
      setAllLevels(levels.sort())
    } catch (err) {
      console.error('Error fetching levels:', err)
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return
    }

    try {
      setDeletingQuestionId(questionId)
      
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId)

      if (error) throw error

      // Refresh the questions list
      await fetchQuestions()
    } catch (err) {
      console.error('Error deleting question:', err)
      setError('Failed to delete question')
    } finally {
      setDeletingQuestionId(null)
    }
  }

  const handleEditQuestion = (question: Question) => {
    setSelectedQuestionForEdit(question)
    setShowEditModal(true)
  }

  const handleQuestionUpdated = () => {
    fetchQuestions()
    setShowEditModal(false)
    setSelectedQuestionForEdit(null)
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setSelectedSubject('')
    setSelectedLevel('')
    setSelectedType('')
    setCurrentPage(1)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'text/csv') {
      setSelectedFile(file)
      setUploadResult(null)
    } else {
      alert('Please select a valid CSV file')
    }
  }

  const handleCSVUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setUploadResult(null)

    try {
      const text = await selectedFile.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        throw new Error('CSV file must contain at least a header row and one data row')
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      const requiredHeaders = ['level', 'subject', 'year', 'type', 'question_text']
      
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`)
      }

      const questions = []
      const errors = []

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map(v => v.trim())
          const question: any = {}

          headers.forEach((header, index) => {
            question[header] = values[index] || ''
          })

          // Parse options if present
          if (question.options) {
            try {
              question.options = JSON.parse(question.options)
            } catch {
              question.options = question.options.split('|').map((opt: string) => opt.trim())
            }
          }

          questions.push(question)
        } catch (err) {
          errors.push(`Row ${i + 1}: ${err instanceof Error ? err.message : 'Invalid format'}`)
        }
      }

      if (questions.length === 0) {
        throw new Error('No valid questions found in CSV')
      }

      // Insert questions into database
      const { error: insertError } = await supabase
        .from('questions')
        .insert(questions)

      if (insertError) throw insertError

      setUploadResult({
        success: true,
        message: `Successfully imported ${questions.length} questions`,
        imported: questions.length,
        errors
      })

      // Refresh questions list
      await fetchQuestions()
      
    } catch (err) {
      setUploadResult({
        success: false,
        message: err instanceof Error ? err.message : 'Upload failed',
        imported: 0,
        errors: []
      })
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [currentPage, questionsPerPage, selectedSubject, selectedLevel, selectedType, searchTerm])

  useEffect(() => {
    fetchAllSubjects()
    fetchAllLevels()
  }, [])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleSubjectFilter = (subject: string) => {
    setSelectedSubject(subject)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleLevelFilter = (level: string) => {
    setSelectedLevel(level)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleTypeFilter = (type: string) => {
    setSelectedType(type)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleQuestionsPerPageChange = (perPage: number) => {
    setQuestionsPerPage(perPage)
    setCurrentPage(1) // Reset to first page when changing page size
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'MCQ': return 'bg-blue-100 text-blue-800'
      case 'ShortAnswer': return 'bg-green-100 text-green-800'
      case 'Subjective': return 'bg-purple-100 text-purple-800'
      case 'Matching': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Compact Header */}
      <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Question Bank</h1>
              <p className="text-sm text-gray-600">{totalQuestions} questions available</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => setShowUploadModal(true)}
              variant="outline"
              size="sm"
              icon={<Upload className="h-4 w-4" />}
              className="border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400"
            >
              Import CSV
            </Button>
            <Button
              size="sm"
              icon={<Plus className="h-4 w-4" />}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add Question
            </Button>
          </div>
        </div>
      </div>

      {/* Compact Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4">
        <div className="flex flex-col gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search questions by text or topic..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
          
          {/* Filter Row */}
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedSubject}
              onChange={(e) => handleSubjectFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">All Subjects</option>
              {allSubjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            
            <select
              value={selectedLevel}
              onChange={(e) => handleLevelFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">All Levels</option>
              {allLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => handleTypeFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">All Types</option>
              {questionTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            
            <select
              value={questionsPerPage}
              onChange={(e) => handleQuestionsPerPageChange(Number(e.target.value))}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>

            <Button
              onClick={handleResetFilters}
              variant="outline"
              size="sm"
              icon={<RotateCcw className="h-4 w-4" />}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
            >
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Compact Questions Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Question
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-sm">Loading questions...</span>
                    </div>
                  </td>
                </tr>
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <BookOpen className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm">No questions found</p>
                      {(searchTerm || selectedSubject || selectedLevel || selectedType) && (
                        <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                questions.map((question) => (
                  <tr key={question.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3">
                      <div className="max-w-xs">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {question.question_text}
                        </p>
                        {question.topic && (
                          <p className="text-xs text-gray-500">{question.topic}</p>
                        )}
                        {question.image_url && (
                          <div className="flex items-center mt-1">
                            <Eye className="h-3 w-3 text-blue-500 mr-1" />
                            <span className="text-xs text-blue-500">Has image</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {question.subject}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {question.level}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(question.type)}`}>
                        {question.type}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                      {question.year}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-1">
                        <Button
                          onClick={() => handleEditQuestion(question)}
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1.5 border border-transparent hover:border-blue-200"
                          title="Edit question"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteQuestion(question.id)}
                          disabled={deletingQuestionId === question.id}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1.5 border border-transparent hover:border-red-200"
                          title="Delete question"
                        >
                          {deletingQuestionId === question.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Compact Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-3 py-2 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Previous
              </Button>
              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * questionsPerPage + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * questionsPerPage, totalQuestions)}</span> of{' '}
                  <span className="font-medium">{totalQuestions}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className="relative inline-flex items-center px-2 py-1 rounded-l-md border-gray-300 text-gray-500 hover:bg-gray-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        variant="outline"
                        size="sm"
                        className={`relative inline-flex items-center px-3 py-1 border text-xs font-medium ${
                          currentPage === pageNum
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                  
                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                    className="relative inline-flex items-center px-2 py-1 rounded-r-md border-gray-300 text-gray-500 hover:bg-gray-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSV Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Import Questions from CSV</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select CSV File
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              
              <div className="text-xs text-gray-600">
                <p className="font-medium mb-1">Required columns:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>level</li>
                  <li>subject</li>
                  <li>year</li>
                  <li>type</li>
                  <li>question_text</li>
                </ul>
                <p className="mt-2">Optional columns: topic, options, correct_answer, explanation</p>
              </div>

              {uploadResult && (
                <div className={`p-3 rounded-md ${uploadResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center">
                    {uploadResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                    )}
                    <p className={`text-sm ${uploadResult.success ? 'text-green-800' : 'text-red-800'}`}>
                      {uploadResult.message}
                    </p>
                  </div>
                  {uploadResult.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-600">Errors:</p>
                      <ul className="text-xs text-red-600 list-disc list-inside">
                        {uploadResult.errors.slice(0, 5).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                        {uploadResult.errors.length > 5 && (
                          <li>... and {uploadResult.errors.length - 5} more errors</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                onClick={() => {
                  setShowUploadModal(false)
                  setSelectedFile(null)
                  setUploadResult(null)
                }}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCSVUpload}
                disabled={!selectedFile || uploading}
                className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {uploading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </div>
                ) : (
                  'Upload'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Question Modal */}
      {showEditModal && selectedQuestionForEdit && (
        <EditQuestionModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedQuestionForEdit(null)
          }}
          question={selectedQuestionForEdit}
          onQuestionUpdated={handleQuestionUpdated}
        />
      )}
    </div>
  )
}