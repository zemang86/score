import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { BookOpen, Search, Filter, Plus, Edit, Trash2, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface Question {
  id: string
  level: string
  subject: string
  year: string
  type: 'MCQ' | 'ShortAnswer' | 'Subjective' | 'Matching'
  topic?: string
  question_text: string
  options: string[]
  correct_answer: string
  created_at: string
}

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
  
  // CSV Upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100) // Limit for performance

      if (error) throw error
      setQuestions(data || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching questions:', err)
    } finally {
      setLoading(false)
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
            correct_answer: row.correct_answer.trim()
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

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.topic?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = !selectedSubject || question.subject === selectedSubject
    const matchesLevel = !selectedLevel || question.level === selectedLevel
    
    return matchesSearch && matchesSubject && matchesLevel
  })

  const subjects = [...new Set(questions.map(q => q.subject))]
  const levels = [...new Set(questions.map(q => q.level))]

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'MCQ': return 'bg-blue-100 text-blue-800'
      case 'ShortAnswer': return 'bg-green-100 text-green-800'
      case 'Subjective': return 'bg-purple-100 text-purple-800'
      case 'Matching': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading questions...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Question Bank Management</h1>
            <p className="text-gray-600">Manage exam questions across all subjects and levels</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setShowUploadModal(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload CSV
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search questions by text or topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Levels</option>
            {levels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>

          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Questions</p>
              <p className="text-2xl font-bold text-gray-900">{questions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-green-600 font-bold text-sm">MCQ</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">MCQ Questions</p>
              <p className="text-2xl font-bold text-gray-900">
                {questions.filter(q => q.type === 'MCQ').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-purple-600 font-bold text-xs">SUB</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Subjects</p>
              <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-orange-600 font-bold text-xs">LVL</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Levels</p>
              <p className="text-2xl font-bold text-gray-900">{levels.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Questions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Questions ({filteredQuestions.length})</h2>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Question
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredQuestions.map((question) => (
                <tr key={question.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {question.question_text}
                      </div>
                      {question.topic && (
                        <div className="text-sm text-gray-500">Topic: {question.topic}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{question.subject}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{question.level}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(question.type)}`}>
                      {question.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{question.year}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredQuestions.length === 0 && !loading && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedSubject || selectedLevel 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'No questions have been added yet.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CSV Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Upload Questions CSV</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* CSV Format Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">CSV Format Requirements</h3>
                <p className="text-sm text-blue-800 mb-3">
                  Your CSV file must have the following columns in this exact order:
                </p>
                <div className="text-xs text-blue-700 space-y-1">
                  <div><strong>level:</strong> Education level (e.g., "Darjah 1", "Tingkatan 5")</div>
                  <div><strong>subject:</strong> Subject name (e.g., "Mathematics", "Science")</div>
                  <div><strong>year:</strong> Year of the question (e.g., "2023")</div>
                  <div><strong>type:</strong> Question type (MCQ, ShortAnswer, Subjective, Matching)</div>
                  <div><strong>topic:</strong> Topic name (optional, can be empty)</div>
                  <div><strong>question_text:</strong> The full question text</div>
                  <div><strong>options:</strong> For MCQ: comma-separated options (e.g., "A,B,C,D"). For others: leave empty</div>
                  <div><strong>correct_answer:</strong> The correct answer</div>
                </div>
                <p className="text-xs text-blue-700 mt-3">
                  <strong>Note:</strong> Use double quotes around fields that contain commas.
                </p>
              </div>

              {/* File Upload */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select CSV File
                  </label>
                  <input
                    id="csv-file-input"
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>

                {selectedFile && (
                  <div className="flex items-center text-sm text-green-600">
                    <FileText className="w-4 h-4 mr-2" />
                    <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                )}
              </div>

              {/* Upload Result */}
              {uploadResult && (
                <div className={`rounded-lg p-4 ${uploadResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center mb-2">
                    {uploadResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    )}
                    <span className={`font-medium ${uploadResult.success ? 'text-green-800' : 'text-red-800'}`}>
                      {uploadResult.message}
                    </span>
                  </div>
                  
                  {uploadResult.errors.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Issues found:</p>
                      <div className="max-h-32 overflow-y-auto">
                        {uploadResult.errors.map((error, index) => (
                          <p key={index} className="text-xs text-gray-600 mb-1">• {error}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1"
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUploadCSV}
                  className="flex-1"
                  disabled={!selectedFile || uploading}
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload CSV
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}