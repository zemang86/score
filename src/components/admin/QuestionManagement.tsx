import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Question } from '../../lib/supabase'
import { BookOpen, Search, Filter, Plus, Edit, Trash2, Upload, FileText, CheckCircle, AlertCircle, ArrowUpDown, Edit3, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
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

  useEffect(() => {
    fetchQuestions()
    fetchAllSubjects()
    fetchAllLevels()
  }, [currentPage, questionsPerPage, selectedSubject, selectedLevel])

  const fetchAllSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('subject')
        .order('subject')
      
      if (error) throw error
      
      // Extract unique subjects
      const uniqueSubjects = [...new Set(data?.map(q => q.subject))].filter(Boolean)
      setAllSubjects(uniqueSubjects)
    } catch (err) {
      console.error('Error fetching subjects:', err)
    }
  }

  const fetchAllLevels = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('level')
        .order('level')
      
      if (error) throw error
      
      // Extract unique levels
      const uniqueLevels = [...new Set(data?.map(q => q.level))].filter(Boolean)
      setAllLevels(uniqueLevels)
    } catch (err) {
      console.error('Error fetching levels:', err)
    }
  }

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      
      // Build the query with filters
      let query = supabase
        .from('questions')
        .select('*', { count: 'exact' })
      
      // Apply filters if selected
      if (selectedSubject) {
        query = query.eq('subject', selectedSubject)
      }
      
      if (selectedLevel) {
        query = query.eq('level', selectedLevel)
      }
      
      // Apply search term if provided
      if (searchTerm) {
        query = query.or(`question_text.ilike.%${searchTerm}%,topic.ilike.%${searchTerm}%`)
      }
      
      // Get total count first
      const { count, error: countError } = await query
      
      if (countError) throw countError
      
      setTotalQuestions(count || 0)
      setTotalPages(Math.ceil((count || 0) / questionsPerPage))
      
      // Then get paginated data
      const from = (currentPage - 1) * questionsPerPage
      const to = from + questionsPerPage - 1
      
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error
      setQuestions(data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to fetch questions')
      console.error('Error fetching questions:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteQuestion = async (questionId: string, questionText: string) => {
    // Show confirmation dialog
    const confirmMessage = `Are you sure you want to delete this question?\n\n"${questionText.substring(0, 100)}${questionText.length > 100 ? '...' : '"}"\n\nThis action cannot be undone.`
    
    if (!window.confirm(confirmMessage)) {
      return
    }

    setDeletingQuestionId(questionId)
    setError('')

    try {
      console.log('🗑️ Deleting question:', questionId)
      
      const { error: deleteError } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId)

      if (deleteError) {
        throw deleteError
      }

      console.log('✅ Question deleted successfully')
      
      // Refresh the questions list
      await fetchQuestions()
      
      // Show success message briefly
      const successMessage = 'Question deleted successfully!'
      setError('')
      
      // You could add a success state here if you want to show a success message
      console.log(successMessage)
      
    } catch (err: any) {
      console.error('❌ Error deleting question:', err)
      setError(err.message || 'Failed to delete question')
    } finally {
      setDeletingQuestionId(null)
    }
  }

  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const rows = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Parse CSV line handling quoted fields
      const values = []
      let current = ''
      let inQuotes = false
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j]
        
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      values.push(current.trim()) // Add the last value

      if (values.length >= 8) { // Ensure we have all required columns
        const row: any = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        rows.push(row)
      }
    }

    return rows
  }

  const validateQuestion = (row: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    if (!row.level?.trim()) errors.push('Level is required')
    if (!row.subject?.trim()) errors.push('Subject is required')
    if (!row.year?.trim()) errors.push('Year is required')
    if (!row.type?.trim()) errors.push('Type is required')
    if (!row.question_text?.trim()) errors.push('Question text is required')
    if (!row.correct_answer?.trim()) errors.push('Correct answer is required')
    
    const validTypes = ['MCQ', 'ShortAnswer', 'Subjective', 'Matching']
    if (row.type && !validTypes.includes(row.type)) {
      errors.push(`Type must be one of: ${validTypes.join(', ')}`)
    }
    
    // For MCQ questions, options are required
    if (row.type === 'MCQ' && !row.options?.trim()) {
      errors.push('Options are required for MCQ questions')
    }

    return { valid: errors.length === 0, errors }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'text/csv') {
      setSelectedFile(file)
      setUploadResult(null)
    } else {
      setError('Please select a valid CSV file')
      setSelectedFile(null)
    }
  }

  const handleUploadCSV = async () => {
    if (!selectedFile) {
      setError('Please select a CSV file first')
      return
    }

    setUploading(true)
    setUploadResult(null)
    setError('')

    try {
      const csvText = await selectedFile.text()
      const rows = parseCSV(csvText)
      
      if (rows.length === 0) {
        throw new Error('No valid data found in CSV file')
      }

      const validQuestions: any[] = []
      const allErrors: string[] = []

      // Validate each row
      rows.forEach((row, index) => {
        const { valid, errors } = validateQuestion(row)
        
        if (valid) {
          // Process options for MCQ questions
          let options: string[] = []
          if (row.type === 'MCQ' && row.options) {
            options = row.options.split(',').map((opt: string) => opt.trim()).filter((opt: string) => opt)
          }

          validQuestions.push({
            level: row.level.trim(),
            subject: row.subject.trim(),
            year: row.year.trim(),
            type: row.type.trim(),
            topic: row.topic?.trim() || null,
            question_text: row.question_text.trim(),
            options: options,
            correct_answer: row.correct_answer.trim(),
            image_url: row.image_url?.trim() || null
          })
        } else {
          allErrors.push(`Row ${index + 2}: ${errors.join(', ')}`)
        }
      })

      if (validQuestions.length === 0) {
        throw new Error('No valid questions found in CSV file')
      }

      // Insert valid questions into database
      const { error: insertError } = await supabase
        .from('questions')
        .insert(validQuestions)

      if (insertError) {
        throw insertError
      }

      setUploadResult({
        success: true,
        message: `Successfully imported ${validQuestions.length} questions`,
        imported: validQuestions.length,
        errors: allErrors
      })

      // Refresh questions list
      await fetchQuestions()
      
      // Clear file selection
      setSelectedFile(null)
      const fileInput = document.getElementById('csv-file-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''

    } catch (err: any) {
      setUploadResult({
        success: false,
        message: err.message || 'Failed to upload CSV',
        imported: 0,
        errors: [err.message || 'Unknown error occurred']
      })
    } finally {
      setUploading(false)
    }
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPerPage = parseInt(e.target.value)
    setQuestionsPerPage(newPerPage)
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1) // Reset to first page when searching
    fetchQuestions()
  }

  const handleFilterChange = (type: 'subject' | 'level', value: string) => {
    if (type === 'subject') {
      setSelectedSubject(value)
    } else {
      setSelectedLevel(value)
    }
    setCurrentPage(1) // Reset to first page when changing filters
  }

  const handleEditQuestion = (question: Question) => {
    setSelectedQuestionForEdit(question)
    setShowEditModal(true)
  }

  const handleQuestionUpdated = () => {
    fetchQuestions() // Refresh the questions list
    setShowEditModal(false)
    setSelectedQuestionForEdit(null)
  }

  const filteredQuestions = questions

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'MCQ': return 'bg-primary-100 text-primary-800'
      case 'ShortAnswer': return 'bg-secondary-100 text-secondary-800'
      case 'Subjective': return 'bg-accent-100 text-accent-800'
      case 'Matching': return 'bg-warning-100 text-warning-800'
      default: return 'bg-neutral-100 text-neutral-800'
    }
  }

  if (loading && currentPage === 1) {
    return (
      <div className="card-fun p-6 sm:p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-4 border-primary-200 border-t-primary-600"></div>
          <span className="ml-2 text-neutral-600 text-sm sm:text-base">Loading questions...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="card-fun p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6">
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-800">Question Bank Management</h1>
            <p className="text-neutral-600 text-sm sm:text-base">Manage exam questions across all subjects and levels</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto mt-3 sm:mt-0">
            <Button variant="outline" onClick={() => setShowUploadModal(true)} icon={<Upload className="w-4 h-4" />} className="text-sm sm:text-base">
              Upload CSV
            </Button>
            <Button icon={<Plus className="w-4 h-4" />} className="text-sm sm:text-base">
              Add Question
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search questions by text or topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          
          <select
            value={selectedSubject}
            onChange={(e) => handleFilterChange('subject', e.target.value)}
            className="px-2 py-2 sm:px-3 sm:py-2 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm sm:text-base"
          >
            <option value="">All Subjects</option>
            {allSubjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>

          <select
            value={selectedLevel}
            onChange={(e) => handleFilterChange('level', e.target.value)}
            className="px-2 py-2 sm:px-3 sm:py-2 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm sm:text-base"
          >
            <option value="">All Levels</option>
            {allLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>

          <Button type="submit" variant="outline" icon={<Filter className="w-4 h-4" />} className="text-sm sm:text-base">
            Apply Filters
          </Button>
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        <div className="card-fun p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row items-center">
            <div className="bg-primary-500 rounded-xl sm:rounded-2xl p-2 sm:p-3 mb-2 sm:mb-0 sm:mr-3 lg:mr-4 shadow-fun">
              <BookOpen className="w-5 h-5 sm:w-6 lg:w-8 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs sm:text-sm font-medium text-primary-600">Total Questions</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-800">{totalQuestions.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card-fun p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row items-center">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-secondary-100 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-0 sm:mr-2 lg:mr-3">
              <span className="text-secondary-600 font-bold text-xs sm:text-sm">MCQ</span>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs sm:text-sm font-medium text-secondary-600">MCQ Questions</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-800">
                {questions.filter(q => q.type === 'MCQ').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card-fun p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row items-center">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-accent-100 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-0 sm:mr-2 lg:mr-3">
              <span className="text-accent-600 font-bold text-xs">SUB</span>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs sm:text-sm font-medium text-accent-600">Subjects</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-800">{allSubjects.length}</p>
            </div>
          </div>
        </div>

        <div className="card-fun p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row items-center">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-warning-100 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-0 sm:mr-2 lg:mr-3">
              <span className="text-warning-600 font-bold text-xs">LVL</span>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs sm:text-sm font-medium text-warning-600">Levels</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-800">{allLevels.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Questions Table */}
      <div className="card-fun">
        <div className="p-4 sm:p-6 border-b border-neutral-200">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-neutral-800">
              Questions ({totalQuestions.toLocaleString()})
            </h2>
            
            <div className="flex items-center space-x-2 mt-2 sm:mt-0">
              <span className="text-sm text-neutral-600">Show:</span>
              <select 
                value={questionsPerPage} 
                onChange={handlePerPageChange}
                className="px-2 py-1 border border-neutral-200 rounded-lg text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-neutral-600">per page</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 sm:p-4 bg-error-50 border-b border-error-200">
            <p className="text-error-600 text-xs sm:text-sm">{error}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Question
                </th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {filteredQuestions.map((question) => (
                <tr key={question.id} className="hover:bg-neutral-50">
                  <td className="px-3 py-3 sm:px-6 sm:py-4">
                    <div className="max-w-xs">
                      <div className="text-xs sm:text-sm font-medium text-neutral-800 truncate">
                        {question.question_text}
                      </div>
                      {question.topic && (
                        <div className="text-xs text-neutral-500">Topic: {question.topic}</div>
                      )}
                      {question.image_url && (
                        <div className="text-xs text-blue-500 flex items-center mt-1">
                          <Eye className="w-3 h-3 mr-1" />
                          Has image
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                    <div className="text-xs sm:text-sm text-neutral-800">{question.subject}</div>
                  </td>
                  <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                    <div className="text-xs sm:text-sm text-neutral-800">{question.level}</div>
                  </td>
                  <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium ${getTypeColor(question.type)}`}>
                      {question.type}
                    </span>
                  </td>
                  <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                    <div className="text-xs sm:text-sm text-neutral-800">{question.year}</div>
                  </td>
                  <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                    <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        icon={<Edit className="w-3 h-3 sm:w-4 sm:h-4" />}
                        onClick={() => handleEditQuestion(question)}
                        title="Edit question"
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-error-600 hover:text-error-700" 
                        icon={<Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />}
                        onClick={() => handleDeleteQuestion(question.id, question.question_text)}
                        disabled={deletingQuestionId === question.id}
                        loading={deletingQuestionId === question.id}
                        title="Delete question"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredQuestions.length === 0 && !loading && (
            <div className="text-center py-8 sm:py-12">
              <div className="bg-primary-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-neutral-800 mb-1 sm:mb-2">No questions found</h3>
              <p className="text-neutral-600 text-sm sm:text-base">
                {searchTerm || selectedSubject || selectedLevel 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'No questions have been added yet.'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 sm:p-6 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between">
            <div className="text-sm text-neutral-600 mb-3 sm:mb-0">
              Showing {(currentPage - 1) * questionsPerPage + 1} to {Math.min(currentPage * questionsPerPage, totalQuestions)} of {totalQuestions.toLocaleString()} questions
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                icon={<ChevronLeft className="w-4 h-4" />}
              >
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pages around current page
                  let pageToShow = currentPage - 2 + i
                  
                  // Adjust if we're at the beginning
                  if (currentPage < 3) {
                    pageToShow = i + 1
                  }
                  
                  // Adjust if we're at the end
                  if (currentPage > totalPages - 2) {
                    pageToShow = totalPages - 4 + i
                  }
                  
                  // Ensure page is in valid range
                  if (pageToShow > 0 && pageToShow <= totalPages) {
                    return (
                      <button
                        key={pageToShow}
                        onClick={() => handlePageChange(pageToShow)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm ${
                          currentPage === pageToShow
                            ? 'bg-primary-500 text-white'
                            : 'bg-white text-neutral-600 hover:bg-neutral-100'
                        }`}
                      >
                        {pageToShow}
                      </button>
                    )
                  }
                  return null
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="text-neutral-400">...</span>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-sm bg-white text-neutral-600 hover:bg-neutral-100"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                icon={<ChevronRight className="w-4 h-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* CSV Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold text-neutral-800">Upload Questions CSV</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* CSV Format Instructions */}
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 sm:p-4">
                <h3 className="text-sm font-semibold text-primary-800 mb-2">CSV Format Requirements</h3>
                <p className="text-sm text-primary-700 mb-3">
                  Your CSV file must have the following columns in this exact order:
                </p>
                <div className="text-xs text-primary-600 space-y-1">
                  <div><strong>level:</strong> Education level (e.g., "Darjah 1", "Tingkatan 5")</div>
                  <div><strong>subject:</strong> Subject name (e.g., "Mathematics", "Science")</div>
                  <div><strong>year:</strong> Year of the question (e.g., "2023")</div>
                  <div><strong>type:</strong> Question type (MCQ, ShortAnswer, Subjective, Matching)</div>
                  <div><strong>topic:</strong> Topic name (optional, can be empty)</div>
                  <div><strong>question_text:</strong> The full question text</div>
                  <div><strong>options:</strong> For MCQ: comma-separated options (e.g., "A,B,C,D"). For others: leave empty</div>
                  <div><strong>correct_answer:</strong> The correct answer</div>
                  <div><strong>image_url:</strong> URL to question image/diagram (optional)</div>
                </div>
                <p className="text-xs text-primary-600 mt-3">
                  <strong>Note:</strong> Use double quotes around fields that contain commas.
                </p>
              </div>

              {/* File Upload */}
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Select CSV File
                  </label>
                  <input
                    id="csv-file-input"
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                </div>

                {selectedFile && (
                  <div className="flex items-center text-sm text-success-600">
                    <FileText className="w-4 h-4 mr-2" />
                    <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                )}
              </div>

              {/* Upload Result */}
              {uploadResult && (
                <div className={`rounded-xl p-3 sm:p-4 ${uploadResult.success ? 'bg-success-50 border border-success-200' : 'bg-error-50 border border-error-200'}`}>
                  <div className="flex items-center mb-2">
                    {uploadResult.success ? (
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-success-600 mr-2" />
                    ) : (
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-error-600 mr-2" />
                    )}
                    <span className={`font-medium text-sm sm:text-base ${uploadResult.success ? 'text-success-800' : 'text-error-800'}`}>
                      {uploadResult.message}
                    </span>
                  </div>
                  
                  {uploadResult.errors.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-neutral-700 mb-2">Issues found:</p>
                      <div className="max-h-32 overflow-y-auto">
                        {uploadResult.errors.map((error, index) => (
                          <p key={index} className="text-xs text-neutral-600 mb-1">• {error}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 text-sm sm:text-base"
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUploadCSV}
                  className="flex-1 text-sm sm:text-base"
                  disabled={!selectedFile || uploading}
                  loading={uploading}
                  icon={!uploading ? <Upload className="w-4 h-4" /> : undefined}
                >
                  {uploading ? 'Uploading...' : 'Upload CSV'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Question Modal */}
      <EditQuestionModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedQuestionForEdit(null)
        }}
        question={selectedQuestionForEdit}
        onQuestionUpdated={handleQuestionUpdated}
      />
    </div>
  )
}