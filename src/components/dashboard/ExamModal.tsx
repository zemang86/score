import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Student, Question } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { X, BookOpen, Clock, Target, Star, Zap, Trophy, CheckCircle, AlertCircle, ArrowUpDown, Edit3 } from 'lucide-react'

interface ExamModalProps {
  isOpen: boolean
  onClose: () => void
  student: Student
  onExamComplete: (score: number, totalQuestions: number) => void
}

interface ExamQuestion extends Question {
  userAnswer?: string | string[]
  isCorrect?: boolean
}

interface MatchingPair {
  left: string
  right: string
  matched?: boolean
}

type ExamMode = 'Easy' | 'Medium' | 'Full'
type Subject = 'Bahasa Melayu' | 'English' | 'Mathematics' | 'Science' | 'History'

export function ExamModal({ isOpen, onClose, student, onExamComplete }: ExamModalProps) {
  const [step, setStep] = useState<'setup' | 'exam' | 'results'>('setup')
  const [selectedSubject, setSelectedSubject] = useState<Subject>('Mathematics')
  const [selectedMode, setSelectedMode] = useState<ExamMode>('Easy')
  const [questions, setQuestions] = useState<ExamQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [examStarted, setExamStarted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [examScore, setExamScore] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  
  // Matching question state
  const [matchingPairs, setMatchingPairs] = useState<MatchingPair[]>([])
  const [selectedLeftItem, setSelectedLeftItem] = useState<string | null>(null)

  const subjects: Subject[] = ['Bahasa Melayu', 'English', 'Mathematics', 'Science', 'History']
  
  const getModeConfig = (mode: ExamMode) => {
    switch (mode) {
      case 'Easy':
        return { questionCount: 10, timeMinutes: 15, types: ['MCQ'] }
      case 'Medium':
        return { questionCount: 20, timeMinutes: 30, types: ['MCQ', 'ShortAnswer'] }
      case 'Full':
        return { questionCount: 40, timeMinutes: 60, types: ['MCQ', 'ShortAnswer', 'Subjective', 'Matching'] }
    }
  }

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      // Store original overflow style
      const originalStyle = window.getComputedStyle(document.body).overflow
      // Prevent scrolling
      document.body.style.overflow = 'hidden'
      
      // Cleanup function to restore scrolling
      return () => {
        document.body.style.overflow = originalStyle
      }
    }
  }, [isOpen])

  // Function to determine allowed levels based on student's current level
  const getAllowedLevels = (currentLevel: string): string[] => {
    const levelMap: { [key: string]: string[] } = {
      // Primary School - Lower Primary (Level 1)
      'Darjah 1': ['Darjah 1'],
      'Darjah 2': ['Darjah 1', 'Darjah 2'],
      'Darjah 3': ['Darjah 1', 'Darjah 2', 'Darjah 3'],
      
      // Primary School - Upper Primary (Level 2)
      'Darjah 4': ['Darjah 4'],
      'Darjah 5': ['Darjah 4', 'Darjah 5'],
      'Darjah 6': ['Darjah 4', 'Darjah 5', 'Darjah 6'],
      
      // Secondary School - Each level gets their own questions only for now
      'Tingkatan 1': ['Tingkatan 1'],
      'Tingkatan 2': ['Tingkatan 2'],
      'Tingkatan 3': ['Tingkatan 3'],
      'Tingkatan 4': ['Tingkatan 4'],
      'Tingkatan 5': ['Tingkatan 5'],
    }
    
    return levelMap[currentLevel] || [currentLevel] // Fallback to current level if not found
  }

  const startExam = async () => {
    setLoading(true)
    setError('')

    try {
      const config = getModeConfig(selectedMode)
      
      // Get allowed levels for this student
      const allowedLevels = getAllowedLevels(student.level)
      
      console.log(`Student ${student.name} (${student.level}) can access questions from levels:`, allowedLevels)
      
      // Fetch questions from database using the allowed levels
      const { data: fetchedQuestions, error: fetchError } = await supabase
        .from('questions')
        .select('*')
        .in('level', allowedLevels) // Use 'in' instead of 'eq' to fetch from multiple levels
        .eq('subject', selectedSubject)
        .in('type', config.types)
        .limit(config.questionCount * 3) // Fetch more to ensure we have enough after filtering

      if (fetchError) throw fetchError

      if (!fetchedQuestions || fetchedQuestions.length < config.questionCount) {
        // Provide more detailed error message showing which levels were searched
        throw new Error(
          `Not enough questions available for ${selectedSubject} at levels: ${allowedLevels.join(', ')}. ` +
          `Found ${fetchedQuestions?.length || 0} questions, need ${config.questionCount}.`
        )
      }

      // Randomize and select questions
      const shuffled = fetchedQuestions.sort(() => 0.5 - Math.random())
      const selectedQuestions = shuffled.slice(0, config.questionCount)

      console.log(`Selected ${selectedQuestions.length} questions from levels:`, 
        [...new Set(selectedQuestions.map(q => q.level))].join(', '))

      setQuestions(selectedQuestions)
      setTimeLeft(config.timeMinutes * 60) // Convert to seconds
      setStep('exam')
      setExamStarted(true)
      setCurrentQuestionIndex(0)
      
      // Initialize matching pairs for the first question if it's a matching type
      initializeMatchingQuestion(selectedQuestions[0])
    } catch (err: any) {
      setError(err.message || 'Failed to start exam')
    } finally {
      setLoading(false)
    }
  }

  const initializeMatchingQuestion = (question: ExamQuestion) => {
    if (question.type === 'Matching' && question.options.length > 0) {
      // For matching questions, options should be in format: ["Left1:Right1", "Left2:Right2", ...]
      const pairs = question.options.map(option => {
        const [left, right] = option.split(':')
        return { left: left?.trim() || '', right: right?.trim() || '', matched: false }
      })
      
      // Shuffle the right side items
      const shuffledRights = pairs.map(p => p.right).sort(() => 0.5 - Math.random())
      const shuffledPairs = pairs.map((pair, index) => ({
        ...pair,
        right: shuffledRights[index]
      }))
      
      setMatchingPairs(shuffledPairs)
    } else {
      setMatchingPairs([])
    }
  }

  const handleAnswerSelect = (answer: string | string[]) => {
    const updatedQuestions = [...questions]
    updatedQuestions[currentQuestionIndex].userAnswer = answer
    setQuestions(updatedQuestions)
  }

  const handleMatchingSelect = (leftItem: string, rightItem: string) => {
    if (selectedLeftItem === leftItem) {
      // Deselect if clicking the same left item
      setSelectedLeftItem(null)
      return
    }

    if (selectedLeftItem) {
      // Make a match
      const newPairs = matchingPairs.map(pair => {
        if (pair.left === selectedLeftItem) {
          return { ...pair, right: rightItem, matched: true }
        }
        if (pair.right === rightItem && pair.matched) {
          return { ...pair, matched: false }
        }
        return pair
      })
      
      setMatchingPairs(newPairs)
      setSelectedLeftItem(null)
      
      // Update the answer in the format expected by the grading system
      const matchedPairs = newPairs
        .filter(pair => pair.matched)
        .map(pair => `${pair.left}:${pair.right}`)
      
      handleAnswerSelect(matchedPairs)
    } else {
      // Select left item
      setSelectedLeftItem(leftItem)
    }
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1
      setCurrentQuestionIndex(nextIndex)
      initializeMatchingQuestion(questions[nextIndex])
      setSelectedLeftItem(null)
    } else {
      finishExam()
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1
      setCurrentQuestionIndex(prevIndex)
      initializeMatchingQuestion(questions[prevIndex])
      setSelectedLeftItem(null)
    }
  }

  const gradeQuestion = (question: ExamQuestion): boolean => {
    if (!question.userAnswer) return false

    switch (question.type) {
      case 'MCQ': {
        const userAnswer = (question.userAnswer as string)?.trim()
        const correctAnswer = question.correct_answer?.trim()

        // 1. Direct match
        if (userAnswer === correctAnswer) {
          return true
        }

        // 2. If correct answer is a single letter, map to the corresponding full option text
        if (correctAnswer?.length === 1) {
          const letter = correctAnswer.toUpperCase()
          const matchedOption = question.options.find(option =>
            option.trim().toUpperCase().startsWith(`${letter}.`)
          )
          if (matchedOption) {
            return userAnswer === matchedOption.trim()
          }
        }

        // 3. If neither match, mark as incorrect
        return false
      }

      case 'ShortAnswer':
        return question.userAnswer === question.correct_answer

      case 'Subjective':
        // For subjective questions, we'll do a simple keyword-based check
        // In a real system, this would need manual grading or AI assistance
        const userText = (question.userAnswer as string).toLowerCase().trim()
        const correctText = question.correct_answer.toLowerCase().trim()
        
        // Check if user answer contains key words from correct answer
        const keyWords = correctText.split(/\s+/).filter(word => word.length > 3)
        const matchedWords = keyWords.filter(word => userText.includes(word))
        
        // Consider correct if at least 60% of key words are present
        return matchedWords.length >= Math.ceil(keyWords.length * 0.6)

      case 'Matching':
        if (!Array.isArray(question.userAnswer)) return false
        
        // Check if all pairs are correctly matched
        const correctPairs = question.options.map(option => option.trim())
        const userPairs = (question.userAnswer as string[]).map(pair => pair.trim())
        
        return correctPairs.length === userPairs.length && 
               correctPairs.every(pair => userPairs.includes(pair))

      default:
        return false
    }
  }

  const finishExam = async () => {
    setExamStarted(false)
    
    // Calculate score
    let correctAnswers = 0
    const gradedQuestions = questions.map(question => {
      const isCorrect = gradeQuestion(question)
      if (isCorrect) correctAnswers++
      return { ...question, isCorrect }
    })

    setQuestions(gradedQuestions)
    
    const score = Math.round((correctAnswers / questions.length) * 100)
    
    // Store score and total questions for later use
    setExamScore(score)
    setTotalQuestions(questions.length)
    
    // IMPORTANT: Set step to results FIRST before any async operations
    setStep('results')
    
    try {
      // Save exam to database
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .insert([
          {
            student_id: student.id,
            mode: selectedMode,
            subject: selectedSubject,
            question_ids: questions.map(q => q.id),
            score,
            total_questions: questions.length,
            completed: true
          }
        ])
        .select()
        .single()

      if (examError) throw examError

      // Save individual attempts
      const attempts = questions.map(question => ({
        exam_id: examData.id,
        question_id: question.id,
        answer_given: Array.isArray(question.userAnswer) 
          ? question.userAnswer.join(';') 
          : (question.userAnswer || ''),
        is_correct: question.isCorrect || false
      }))

      const { error: attemptsError } = await supabase
        .from('attempts')
        .insert(attempts)

      if (attemptsError) throw attemptsError

      // Update student XP
      const xpGained = correctAnswers * 10 + (score === 100 ? 50 : 0) // Bonus for perfect score
      const { error: xpError } = await supabase
        .from('students')
        .update({ xp: student.xp + xpGained })
        .eq('id', student.id)

      if (xpError) throw xpError

      console.log('Exam completed successfully:', {
        score,
        totalQuestions: questions.length,
        xpGained,
        newXP: student.xp + xpGained
      })

    } catch (err: any) {
      console.error('Error saving exam:', err)
      setError('Failed to save exam results')
    }
  }

  // Timer effect
  useEffect(() => {
    if (examStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (examStarted && timeLeft === 0) {
      finishExam()
    }
  }, [examStarted, timeLeft])

  // Handle modal close - reset all state
  const handleModalClose = () => {
    // Reset all state when modal closes
    setStep('setup')
    setQuestions([])
    setCurrentQuestionIndex(0)
    setTimeLeft(0)
    setExamStarted(false)
    setError('')
    setExamScore(0)
    setTotalQuestions(0)
    setMatchingPairs([])
    setSelectedLeftItem(null)
    onClose()
  }

  // Handle results completion - notify parent and close
  const handleResultsComplete = () => {
    // Notify parent component to refresh student data
    onExamComplete(examScore, totalQuestions)
    // Close the modal
    handleModalClose()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success-600'
    if (score >= 70) return 'text-accent-600'
    if (score >= 50) return 'text-warning-600'
    return 'text-error-600'
  }

  const getScoreMessage = (score: number) => {
    if (score === 100) return 'Perfect Score! Amazing!'
    if (score >= 90) return 'Excellent work!'
    if (score >= 70) return 'Good job!'
    if (score >= 50) return 'Keep practicing!'
    return 'Don\'t give up! Try again!'
  }

  const hasUserAnswer = () => {
    const question = questions[currentQuestionIndex]
    if (!question) return false

    switch (question.type) {
      case 'MCQ':
      case 'ShortAnswer':
      case 'Subjective':
        return !!question.userAnswer && question.userAnswer !== ''
      case 'Matching':
        return Array.isArray(question.userAnswer) && question.userAnswer.length > 0
      default:
        return false
    }
  }

  const renderQuestionContent = () => {
    const question = questions[currentQuestionIndex]
    if (!question) return null

    switch (question.type) {
      case 'MCQ':
        return (
          <div className="space-y-2 sm:space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full p-3 sm:p-4 rounded-xl border-2 text-left transition-all duration-300 text-sm sm:text-base ${
                  question.userAnswer === option
                    ? 'bg-accent-400 border-accent-600 text-white shadow-warning'
                    : 'bg-white border-primary-300 text-primary-700 hover:bg-primary-50'
                }`}
              >
                <span className="font-bold mr-2 sm:mr-3">{String.fromCharCode(65 + index)}.</span>
                {option}
              </button>
            ))}
          </div>
        )

      case 'ShortAnswer':
        return (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Type your answer here..."
              value={(question.userAnswer as string) || ''}
              onChange={(e) => handleAnswerSelect(e.target.value)}
              className="w-full p-3 sm:p-4 border-2 border-primary-300 rounded-xl text-base sm:text-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            />
            <div className="flex items-center text-sm text-primary-600">
              <Edit3 className="w-4 h-4 mr-2" />
              <span>Provide a concise answer</span>
            </div>
          </div>
        )

      case 'Subjective':
        return (
          <div className="space-y-3">
            <textarea
              placeholder="Write your detailed answer here..."
              value={(question.userAnswer as string) || ''}
              onChange={(e) => handleAnswerSelect(e.target.value)}
              rows={6}
              className="w-full p-3 sm:p-4 border-2 border-primary-300 rounded-xl text-base sm:text-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 resize-none"
            />
            <div className="flex items-center text-sm text-primary-600">
              <Edit3 className="w-4 h-4 mr-2" />
              <span>Provide a detailed explanation with examples where appropriate</span>
            </div>
          </div>
        )

      case 'Matching':
        if (matchingPairs.length === 0) {
          return <div className="text-center text-neutral-500">Loading matching pairs...</div>
        }

        const leftItems = matchingPairs.map(pair => pair.left)
        const rightItems = [...new Set(matchingPairs.map(pair => pair.right))]

        return (
          <div className="space-y-4">
            <div className="flex items-center text-sm text-primary-600 mb-4">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <span>Click a left item, then click its matching right item</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-2">
                <h4 className="font-semibold text-primary-700 text-center mb-3">Match these items:</h4>
                {leftItems.map((leftItem, index) => {
                  const pair = matchingPairs.find(p => p.left === leftItem)
                  const isSelected = selectedLeftItem === leftItem
                  const isMatched = pair?.matched
                  
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedLeftItem(isSelected ? null : leftItem)}
                      className={`w-full p-3 rounded-xl border-2 text-left transition-all duration-300 ${
                        isMatched
                          ? 'bg-success-100 border-success-400 text-success-800'
                          : isSelected
                          ? 'bg-accent-400 border-accent-600 text-white shadow-warning'
                          : 'bg-white border-primary-300 text-primary-700 hover:bg-primary-50'
                      }`}
                      disabled={isMatched}
                    >
                      {leftItem}
                      {isMatched && (
                        <span className="ml-2 text-success-600">
                          ✓ → {pair.right}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Right Column */}
              <div className="space-y-2">
                <h4 className="font-semibold text-primary-700 text-center mb-3">With these options:</h4>
                {rightItems.map((rightItem, index) => {
                  const isMatchedToSelected = matchingPairs.some(
                    pair => pair.right === rightItem && pair.matched
                  )
                  
                  return (
                    <button
                      key={index}
                      onClick={() => selectedLeftItem && handleMatchingSelect(selectedLeftItem, rightItem)}
                      className={`w-full p-3 rounded-xl border-2 text-left transition-all duration-300 ${
                        isMatchedToSelected
                          ? 'bg-success-100 border-success-400 text-success-800'
                          : selectedLeftItem
                          ? 'bg-white border-secondary-300 text-secondary-700 hover:bg-secondary-50'
                          : 'bg-neutral-100 border-neutral-300 text-neutral-500 cursor-not-allowed'
                      }`}
                      disabled={!selectedLeftItem || isMatchedToSelected}
                    >
                      {rightItem}
                      {isMatchedToSelected && <span className="ml-2 text-success-600">✓</span>}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Progress indicator */}
            <div className="text-center text-sm text-neutral-600">
              Matched: {matchingPairs.filter(p => p.matched).length} / {matchingPairs.length}
            </div>
          </div>
        )

      default:
        return <div className="text-center text-error-600">Unsupported question type: {question.type}</div>
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div className="absolute inset-0 flex flex-col w-full h-full overflow-hidden">
        <div className="w-full h-full bg-white flex flex-col overflow-hidden">
          {/* Sticky Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-neutral-200">
            {/* Setup Step Header */}
            {step === 'setup' && (
              <div className="p-3 sm:p-4 bg-gradient-to-r from-primary-100 to-secondary-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-primary-500 rounded-full p-2 sm:p-3 mr-3 sm:mr-4 shadow-fun">
                      <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-primary-600">Start New Exam</h2>
                      <p className="text-sm text-secondary-600">For {student.name} - {student.level}</p>
                      <p className="text-xs text-primary-500 mt-1">
                        Questions from: {getAllowedLevels(student.level).join(', ')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleModalClose}
                    className="text-neutral-400 hover:text-neutral-600 transition-colors bg-white rounded-full p-1.5 sm:p-2 shadow-soft"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
              </div>
            )}

            {/* Exam Step Header */}
            {step === 'exam' && questions.length > 0 && (
              <div className="p-3 sm:p-4 bg-gradient-to-r from-primary-100 to-secondary-100">
                <div className="flex flex-col sm:flex-row items-center justify-between">
                  <div className="flex items-center mb-2 sm:mb-0">
                    <div className="bg-secondary-500 rounded-full p-2 sm:p-3 mr-3 sm:mr-4 shadow-success">
                      <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-primary-600">
                        Question {currentQuestionIndex + 1} of {questions.length}
                      </h2>
                      <p className="text-sm text-secondary-600">
                        {selectedSubject} - {selectedMode} Mode - {questions[currentQuestionIndex]?.type}
                      </p>
                      <p className="text-xs text-primary-500">
                        Level: {questions[currentQuestionIndex]?.level}
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-error-500 text-white rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-error">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
                      <span className="font-bold text-sm sm:text-base">{formatTime(timeLeft)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Results Step Header */}
            {step === 'results' && (
              <div className="p-3 sm:p-4 bg-gradient-to-r from-success-100 to-accent-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-success-500 rounded-full p-2 sm:p-3 mr-3 sm:mr-4 shadow-success">
                      <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-success-600">Exam Complete!</h2>
                      <p className="text-sm text-primary-600">{student.name}'s Results</p>
                    </div>
                  </div>
                  <button
                    onClick={handleModalClose}
                    className="text-neutral-400 hover:text-neutral-600 transition-colors bg-white rounded-full p-1.5 sm:p-2 shadow-soft"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 max-w-4xl mx-auto">
              {/* Setup Step Content */}
              {step === 'setup' && (
                <>
                  {error && (
                    <div className="mb-4 sm:mb-6 bg-error-50 border-2 border-error-200 rounded-xl p-3 sm:p-4">
                      <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-error-600 mr-2 sm:mr-3" />
                        <p className="text-error-700 font-medium text-sm sm:text-base">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Level Information */}
                  <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                    <h3 className="text-sm sm:text-base font-semibold text-primary-800 mb-2">Smart Question Selection</h3>
                    <p className="text-xs sm:text-sm text-primary-700 mb-2">
                      Based on your level ({student.level}), you'll receive questions from:
                    </p>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {getAllowedLevels(student.level).map((level, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-200 text-primary-800">
                          {level}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-primary-600 mt-2">
                      This helps build a strong foundation by including questions from previous levels!
                    </p>
                  </div>

                  {/* Subject Selection */}
                  <div className="mb-4 sm:mb-6">
                    <label className="block text-base sm:text-lg font-bold text-primary-700 mb-2 sm:mb-3">
                      Choose Subject
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                      {subjects.map((subject) => (
                        <button
                          key={subject}
                          onClick={() => setSelectedSubject(subject)}
                          className={`p-3 sm:p-4 rounded-xl border-2 font-medium transition-all duration-300 text-sm sm:text-base ${
                            selectedSubject === subject
                              ? 'bg-primary-500 text-white border-primary-700 shadow-fun'
                              : 'bg-white text-primary-600 border-primary-300 hover:bg-primary-50'
                          }`}
                        >
                          {subject}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mode Selection */}
                  <div className="mb-4 sm:mb-6">
                    <label className="block text-base sm:text-lg font-bold text-primary-700 mb-2 sm:mb-3">
                      Choose Difficulty
                    </label>
                    <div className="space-y-2 sm:space-y-3">
                      {(['Easy', 'Medium', 'Full'] as ExamMode[]).map((mode) => {
                        const config = getModeConfig(mode)
                        return (
                          <button
                            key={mode}
                            onClick={() => setSelectedMode(mode)}
                            className={`w-full p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                              selectedMode === mode
                                ? 'bg-secondary-500 text-white border-secondary-700 shadow-success'
                                : 'bg-white text-secondary-600 border-secondary-300 hover:bg-secondary-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-bold text-base sm:text-lg">{mode} Mode</div>
                                <div className="text-xs sm:text-sm opacity-90">
                                  {config.questionCount} questions • {config.timeMinutes} minutes
                                </div>
                                <div className="text-xs opacity-75 mt-1">
                                  Types: {config.types.join(', ')}
                                </div>
                              </div>
                              <div className="flex items-center space-x-1 sm:space-x-2">
                                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                                <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <Button
                      variant="outline"
                      onClick={handleModalClose}
                      className="flex-1 text-sm sm:text-base"
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={startExam}
                      className="flex-1 bg-gradient-to-r from-secondary-400 to-secondary-600 text-sm sm:text-base"
                      disabled={loading}
                      loading={loading}
                      icon={!loading ? <Zap className="w-4 h-4 sm:w-5 sm:h-5" /> : undefined}
                    >
                      {loading ? 'Loading...' : 'Start Exam!'}
                    </Button>
                  </div>
                </>
              )}

              {/* Exam Step Content */}
              {step === 'exam' && questions.length > 0 && (
                <div className="space-y-4 sm:space-y-6">
                  {questions[currentQuestionIndex] && (
                    <>
                      <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-4 sm:p-6">
                        <h3 className="text-lg sm:text-xl font-bold text-primary-700 mb-3 sm:mb-4">
                          {questions[currentQuestionIndex].question_text}
                        </h3>
                        
                        {renderQuestionContent()}
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0">
                        <Button
                          variant="outline"
                          onClick={previousQuestion}
                          disabled={currentQuestionIndex === 0}
                          className="text-sm sm:text-base"
                        >
                          ← Previous
                        </Button>
                        <Button
                          onClick={nextQuestion}
                          disabled={!hasUserAnswer()}
                          className="bg-gradient-to-r from-secondary-400 to-secondary-600 text-sm sm:text-base"
                        >
                          {currentQuestionIndex === questions.length - 1 ? 'Finish Exam' : 'Next →'}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Results Step Content */}
              {step === 'results' && (
                <div className="space-y-4 sm:space-y-6">
                  {/* Score Display */}
                  <div className="text-center bg-gradient-to-r from-accent-100 to-warning-100 border-2 border-accent-400 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-large">
                    <div className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 ${getScoreColor(examScore)}`}>
                      {examScore}%
                    </div>
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-700 mb-1 sm:mb-2">
                      {getScoreMessage(examScore)}
                    </div>
                    <div className="text-base sm:text-lg text-secondary-600">
                      {questions.filter(q => q.isCorrect).length} out of {questions.length} correct
                    </div>
                    <div className="text-sm text-primary-600 mt-2">
                      Questions from levels: {[...new Set(questions.map(q => q.level))].join(', ')}
                    </div>
                    
                    {/* XP Gained Display */}
                    <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-primary-100 border-2 border-primary-300 rounded-xl">
                      <div className="flex items-center justify-center text-primary-700 mb-2">
                        <Star className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                        <span className="font-bold text-base sm:text-lg">XP Earned!</span>
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold text-primary-800">
                        +{questions.filter(q => q.isCorrect).length * 10 + (examScore === 100 ? 50 : 0)} XP
                      </div>
                      <div className="text-xs sm:text-sm text-primary-600 mt-1">
                        {questions.filter(q => q.isCorrect).length * 10} for correct answers
                        {examScore === 100 && ' + 50 perfect score bonus!'}
                      </div>
                    </div>
                  </div>

                  {/* Question Review with Correct Answers */}
                  <div className="bg-white border-2 border-primary-200 rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-primary-700 mb-3 sm:mb-4">Question Review</h3>
                    <div className="space-y-3 max-h-72 sm:max-h-96 overflow-y-auto">
                      {questions.map((question, index) => (
                        <div
                          key={index}
                          className={`p-3 sm:p-4 rounded-xl border-2 ${
                            question.isCorrect
                              ? 'bg-success-50 border-success-300'
                              : 'bg-error-50 border-error-300'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <span className="text-sm font-medium">
                                Q{index + 1} ({question.level}): {question.question_text.substring(0, 60)}...
                              </span>
                            </div>
                            <div className="flex items-center ml-2">
                              {question.isCorrect ? (
                                <CheckCircle className="w-5 h-5 text-success-600" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-error-600" />
                              )}
                            </div>
                          </div>
                          
                          {/* Show answers for review */}
                          <div className="text-xs space-y-1">
                            <div className={`${question.isCorrect ? 'text-success-700' : 'text-error-700'}`}>
                              <strong>Your answer:</strong> {
                                Array.isArray(question.userAnswer) 
                                  ? question.userAnswer.join(', ') 
                                  : (question.userAnswer || 'No answer')
                              }
                            </div>
                            {!question.isCorrect && (
                              <div className="text-success-700">
                                <strong>Correct answer:</strong> {question.correct_answer}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleResultsComplete}
                    className="w-full bg-gradient-to-r from-primary-400 to-secondary-500 text-sm sm:text-base lg:text-lg"
                    size="lg"
                    icon={<Star className="w-5 h-5 sm:w-6 sm:h-6" />}
                  >
                    Continue Learning!
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}