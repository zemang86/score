import React, { useState, useEffect } from 'react'
import { X, BookOpen, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { ExamSetup, ExamTimer, ExamProgressTracker, ExamQuestionRenderer } from './index'
import { ExamResults } from './ExamResults'
import { ExamModalProps, ExamQuestion, MatchingPair, ExamMode, Subject, ExamStep } from './types'
import { checkShortAnswer } from '../../utils/answerChecker'

// Utility function to sync offline exams
const syncOfflineExams = async () => {
  try {
    const offlineExams = JSON.parse(localStorage.getItem('offline-exams') || '[]')
    
    if (offlineExams.length === 0) return
    
    console.log(`🔄 Syncing ${offlineExams.length} offline exams...`)
    
    const syncPromises = offlineExams.map(async (examData: any) => {
      try {
        const { offline, timestamp, ...cleanExamData } = examData
        
        const { error } = await supabase
          .from('exams')
          .insert(cleanExamData)
        
        if (error) {
          console.error('❌ Failed to sync offline exam:', error)
          return false
        }
        
        return true
      } catch (error) {
        console.error('❌ Error syncing offline exam:', error)
        return false
      }
    })
    
    const results = await Promise.all(syncPromises)
    const successCount = results.filter(result => result).length
    
    if (successCount > 0) {
      // Remove successfully synced exams
      const remainingExams = offlineExams.filter((_: any, index: number) => !results[index])
      localStorage.setItem('offline-exams', JSON.stringify(remainingExams))
      
      console.log(`✅ Successfully synced ${successCount} offline exams`)
    }
  } catch (error) {
    console.error('❌ Error during offline sync:', error)
  }
}

export function ExamModalRefactored({ isOpen, onClose, student, onExamComplete }: ExamModalProps) {
  // Initialize state from session storage if available
  const getInitialState = () => {
    try {
      const saved = sessionStorage.getItem(`exam-state-${student.id}`)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch {
      // Fall back to defaults if parsing fails
    }
    return {
      step: 'setup',
      selectedSubject: 'Mathematics',
      selectedMode: 'Easy',
      questions: [],
      currentQuestionIndex: 0,
      timeLeft: 0,
      examStarted: false,
      examScore: 0,
      totalQuestions: 0,
      matchingPairs: [],
      selectedLeftItem: null,
      showSubmitWarning: false
    }
  }

  const initialState = getInitialState()
  
  const [step, setStep] = useState<ExamStep>(initialState.step)
  const [selectedSubject, setSelectedSubject] = useState<Subject>(initialState.selectedSubject)
  const [selectedMode, setSelectedMode] = useState<ExamMode>(initialState.selectedMode)
  const [questions, setQuestions] = useState<ExamQuestion[]>(initialState.questions)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(initialState.currentQuestionIndex)
  const [timeLeft, setTimeLeft] = useState(initialState.timeLeft)
  const [examStarted, setExamStarted] = useState(initialState.examStarted)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [examScore, setExamScore] = useState(initialState.examScore)
  const [totalQuestions, setTotalQuestions] = useState(initialState.totalQuestions)
  const [showSubmitWarning, setShowSubmitWarning] = useState(initialState.showSubmitWarning)
  
  // Matching question state
  const [matchingPairs, setMatchingPairs] = useState<MatchingPair[]>(initialState.matchingPairs)
  const [selectedLeftItem, setSelectedLeftItem] = useState<string | null>(initialState.selectedLeftItem)

  // Save state to session storage whenever important state changes
  const saveState = () => {
    const stateToSave = {
      step,
      selectedSubject,
      selectedMode,
      questions,
      currentQuestionIndex,
      timeLeft,
      examStarted,
      examScore,
      totalQuestions,
      matchingPairs,
      selectedLeftItem,
      showSubmitWarning
    }
    sessionStorage.setItem(`exam-state-${student.id}`, JSON.stringify(stateToSave))
  }

  // Save state whenever it changes
  useEffect(() => {
    saveState()
  }, [step, selectedSubject, selectedMode, questions, currentQuestionIndex, timeLeft, examStarted, examScore, totalQuestions, matchingPairs, selectedLeftItem, showSubmitWarning])

  // Sync offline exams when component mounts or comes back online
  useEffect(() => {
    // Try to sync offline exams on mount
    if (navigator.onLine) {
      syncOfflineExams()
    }

    // Listen for online events to sync when connection is restored
    const handleOnline = () => {
      console.log('🌐 Connection restored, syncing offline exams...')
      syncOfflineExams()
    }

    window.addEventListener('online', handleOnline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
    }
  }, [])

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

  const getAllowedLevels = (currentLevel: string): string[] => {
    const levelMap: { [key: string]: string[] } = {
      'Darjah 1': ['Darjah 1'],
      'Darjah 2': ['Darjah 1', 'Darjah 2'],
      'Darjah 3': ['Darjah 1', 'Darjah 2', 'Darjah 3'],
      'Darjah 4': ['Darjah 4'],
      'Darjah 5': ['Darjah 4', 'Darjah 5'],
      'Darjah 6': ['Darjah 4', 'Darjah 5', 'Darjah 6'],
      'Tingkatan 1': ['Tingkatan 1'],
      'Tingkatan 2': ['Tingkatan 2'],
      'Tingkatan 3': ['Tingkatan 3'],
      'Tingkatan 4': ['Tingkatan 4'],
      'Tingkatan 5': ['Tingkatan 5'],
    }
    return levelMap[currentLevel] || [currentLevel]
  }

  const getSmartQuestionSelection = async (
    allowedLevels: string[], 
    subject: string, 
    questionTypes: string[], 
    requiredCount: number
  ) => {
    const { data: allQuestions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .in('level', allowedLevels)
      .eq('subject', subject)
      .in('type', questionTypes)
      .order('created_at', { ascending: false })

    if (questionsError) throw questionsError
    if (!allQuestions || allQuestions.length === 0) {
      throw new Error(`No questions available for ${subject} at levels: ${allowedLevels.join(', ')}.`)
    }

    const { data: studentExams, error: examsError } = await supabase
      .from('exams')
      .select('question_ids')
      .eq('student_id', student.id)
      .eq('subject', subject)
      .eq('completed', true)

    if (examsError) throw examsError

    const answeredQuestionIds = new Set<string>()
    if (studentExams) {
      studentExams.forEach((exam: any) => {
        if (Array.isArray(exam.question_ids)) {
          exam.question_ids.forEach((id: string) => answeredQuestionIds.add(id))
        }
      })
    }

    const freshQuestions = allQuestions.filter((q: any) => !answeredQuestionIds.has(q.id))
    const answeredQuestions = allQuestions.filter((q: any) => answeredQuestionIds.has(q.id))

    let selectedQuestions: any[] = []

    if (freshQuestions.length >= requiredCount) {
      const newestQuestions = freshQuestions.slice(0, Math.min(requiredCount * 2, freshQuestions.length))
      const shuffledNewest = newestQuestions.sort(() => 0.5 - Math.random())
      selectedQuestions = shuffledNewest.slice(0, requiredCount)
    } else if (freshQuestions.length > 0) {
      selectedQuestions = [...freshQuestions]
      const needed = requiredCount - freshQuestions.length
      const shuffledAnswered = answeredQuestions.sort(() => 0.5 - Math.random())
      selectedQuestions = selectedQuestions.concat(shuffledAnswered.slice(0, needed))
    } else {
      const shuffledAnswered = answeredQuestions.sort(() => 0.5 - Math.random())
      selectedQuestions = shuffledAnswered.slice(0, requiredCount)
    }

    return selectedQuestions
  }

  const startExam = async () => {
    setLoading(true)
    setError('')

    try {
      const config = getModeConfig(selectedMode)
      const allowedLevels = getAllowedLevels(student.level)
      const selectedQuestions = await getSmartQuestionSelection(
        allowedLevels,
        selectedSubject,
        config.types,
        config.questionCount
      )

      if (selectedQuestions.length < config.questionCount) {
        throw new Error(
          `Not enough questions available for ${selectedSubject} at levels: ${allowedLevels.join(', ')}. ` +
          `Found ${selectedQuestions.length} questions, need ${config.questionCount}.`
        )
      }

      const finalQuestions = selectedQuestions.sort(() => 0.5 - Math.random())
      setQuestions(finalQuestions)
      setTimeLeft(config.timeMinutes * 60)
      setStep('exam')
      setExamStarted(true)
      setCurrentQuestionIndex(0)
      
      initializeMatchingQuestion(finalQuestions[0])
    } catch (err: any) {
      setError(err.message || 'Failed to start exam')
    } finally {
      setLoading(false)
    }
  }

  const initializeMatchingQuestion = (question: ExamQuestion) => {
    if (question.type === 'Matching' && question.options.length > 0) {
      const pairs = question.options.map(option => {
        const [left, right] = option.split(':')
        return { left: left?.trim() || '', right: right?.trim() || '', matched: false }
      })
      
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
    const newPairs = matchingPairs.map(pair => {
      if (pair.left === leftItem) {
        return { ...pair, right: rightItem, matched: true }
      }
      if (pair.right === rightItem && pair.matched) {
        return { ...pair, matched: false }
      }
      return pair
    })
    
    setMatchingPairs(newPairs)
    setSelectedLeftItem(null)
    
    const matchedPairs = newPairs
      .filter(pair => pair.matched)
      .map(pair => `${pair.left}:${pair.right}`)
    
    handleAnswerSelect(matchedPairs)
  }

  const isQuestionAnswered = (questionIndex: number) => {
    const question = questions[questionIndex]
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

  // Get list of unanswered questions
  const getUnansweredQuestions = () => {
    return questions
      .map((_, index) => ({ index, number: index + 1 }))
      .filter(({ index }) => !isQuestionAnswered(index))
  }

  // Check for unanswered questions before submitting
  const checkUnansweredQuestionsBeforeSubmit = () => {
    const unanswered = getUnansweredQuestions()
    if (unanswered.length > 0) {
      setShowSubmitWarning(true)
    } else {
      finishExam()
    }
  }

  // Proceed with submission despite unanswered questions
  const proceedWithSubmit = () => {
    setShowSubmitWarning(false)
    finishExam()
  }

  // Go back to review unanswered questions
  const reviewUnansweredQuestions = () => {
    setShowSubmitWarning(false)
    const unanswered = getUnansweredQuestions()
    if (unanswered.length > 0) {
      jumpToQuestion(unanswered[0].index)
    }
  }

  const nextQuestion = () => {
    setError('') // Clear any previous errors
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1
      setCurrentQuestionIndex(nextIndex)
      initializeMatchingQuestion(questions[nextIndex])
      setSelectedLeftItem(null)
    } else {
      checkUnansweredQuestionsBeforeSubmit()
    }
  }

  const previousQuestion = () => {
    setError('') // Clear any previous errors
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1
      setCurrentQuestionIndex(prevIndex)
      initializeMatchingQuestion(questions[prevIndex])
      setSelectedLeftItem(null)
    }
  }

  const jumpToQuestion = (questionIndex: number) => {
    if (questionIndex >= 0 && questionIndex < questions.length) {
      setCurrentQuestionIndex(questionIndex)
      initializeMatchingQuestion(questions[questionIndex])
      setSelectedLeftItem(null)
    }
  }

  const gradeQuestion = async (question: ExamQuestion): Promise<boolean> => {
    if (!question.userAnswer) return false
    
    const correctAnswer = question.correct_answer?.toString().toLowerCase().trim()
    const userAnswer = Array.isArray(question.userAnswer) 
      ? question.userAnswer.join(', ').toLowerCase().trim() 
      : question.userAnswer.toString().toLowerCase().trim()

    if (question.type === 'MCQ' || question.type === 'Matching') {
      return userAnswer === correctAnswer
    } else if (question.type === 'ShortAnswer') {
      try {
        const checkResult = await checkShortAnswer(userAnswer, correctAnswer || '')
        return checkResult.result === 'correct'
      } catch (error) {
        return userAnswer === correctAnswer
      }
    } else if (question.type === 'Subjective') {
      return userAnswer.includes(correctAnswer || '')
    }
    
    return false
  }

  const finishExam = async () => {
    setLoading(true)
    
    try {
      console.log('🎯 Starting exam submission...')
      
      const gradedQuestions = await Promise.all(
        questions.map(async (question) => ({
          ...question,
          isCorrect: await gradeQuestion(question)
        }))
      )
      
      const correctAnswers = gradedQuestions.filter(q => q.isCorrect).length
      const score = Math.round((correctAnswers / questions.length) * 100)
      
      setQuestions(gradedQuestions)
      setExamScore(score)
      setTotalQuestions(questions.length)
      
      console.log('📊 Exam results calculated:', {
        totalQuestions: questions.length,
        correctAnswers,
        score,
        studentId: student.id,
        subject: selectedSubject,
        mode: selectedMode
      })
      
      // Check authentication before submission
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Authentication required. Please sign in again.')
      }
      
      console.log('🔐 Authentication verified, saving exam...')
      
      // Check network connectivity
      const isOnline = navigator.onLine
      if (!isOnline) {
        console.warn('🌐 No internet connection detected, attempting offline storage...')
        
        // Store exam results locally for later sync
        const offlineExamData = {
          student_id: student.id,
          subject: selectedSubject,
          mode: selectedMode,
          total_questions: questions.length,
          score: score,
          question_ids: questions.map(q => q.id),
          completed: true,
          timestamp: new Date().toISOString(),
          offline: true
        }
        
        const offlineExams = JSON.parse(localStorage.getItem('offline-exams') || '[]')
        offlineExams.push(offlineExamData)
        localStorage.setItem('offline-exams', JSON.stringify(offlineExams))
        
        console.log('💾 Exam saved offline for later sync')
        
        // Show results but with offline notice
        setStep('results')
        onExamComplete(score, questions.length)
        sessionStorage.removeItem(`exam-state-${student.id}`)
        
        // Show offline message
        setError('Exam completed offline. Results will be synced when connection is restored.')
        return
      }
      
      // Prepare exam data
      const examData = {
        student_id: student.id,
        subject: selectedSubject,
        mode: selectedMode,
        total_questions: questions.length,
        score: score,
        question_ids: questions.map(q => q.id),
        completed: true
      }
      
      console.log('💾 Attempting to save exam data:', examData)
      
      // Save exam with retry logic
      let saveError: any = null
      let retryCount = 0
      const maxRetries = 3
      
      while (retryCount < maxRetries) {
        try {
          const { error } = await supabase
            .from('exams')
            .insert(examData)
          
          if (error) {
            saveError = error
            console.warn(`❌ Exam save attempt ${retryCount + 1} failed:`, error)
            
            if (retryCount < maxRetries - 1) {
              console.log(`⏳ Retrying in ${(retryCount + 1) * 1000}ms...`)
              await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000))
            }
            retryCount++
          } else {
            console.log('✅ Exam saved successfully!')
            saveError = null
            break
          }
        } catch (networkError: any) {
          console.warn(`🌐 Network error on attempt ${retryCount + 1}:`, networkError)
          saveError = networkError
          
          if (retryCount < maxRetries - 1) {
            console.log(`⏳ Retrying in ${(retryCount + 1) * 1000}ms...`)
            await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000))
          }
          retryCount++
        }
      }
      
      if (saveError) {
        console.error('❌ All exam save attempts failed:', saveError)
        throw saveError
      }
      
      // Update student XP
      console.log('⭐ Updating student XP...')
      const xpGained = correctAnswers * 10 + (score === 100 ? 100 : score >= 90 ? 50 : score >= 80 ? 25 : 0)
      const { error: xpError } = await supabase
        .from('students')
        .update({ xp: student.xp + xpGained })
        .eq('id', student.id)

      if (xpError) {
        console.error('Failed to update student XP:', xpError)
        // Don't throw error - exam submission was successful
      } else {
        console.log(`✅ Student XP updated: +${xpGained} XP`)
      }
      
      setStep('results')
      onExamComplete(score, questions.length)
      
      // Clear session storage
      sessionStorage.removeItem(`exam-state-${student.id}`)
      
      console.log('🎉 Exam submission completed successfully!')
      
    } catch (err: any) {
      console.error('💥 Exam submission error:', err)
      
      // Provide more helpful error messages
      let errorMessage = 'Unknown error occurred'
      
      if (err.message === 'Failed to fetch') {
        errorMessage = 'Network connection failed. Please check your internet connection and try again.'
      } else if (err.message?.includes('Authentication')) {
        errorMessage = 'Authentication required. Please sign in again.'
      } else if (err.code === 'PGRST301') {
        errorMessage = 'Database connection issue. Please try refreshing the page.'
      } else if (err.code === 'PGRST116') {
        errorMessage = 'Data access issue. Please check your permissions.'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(`Failed to save exam results: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleModalClose = () => {
    sessionStorage.removeItem(`exam-state-${student.id}`)
    onClose()
  }

  const handleTimeUpdate = (newTime: number) => {
    setTimeLeft(newTime)
  }

  const handleTimeUp = () => {
    finishExam()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-2xl shadow-xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center min-w-0 flex-1">
                <div className="bg-blue-500 rounded-lg p-2 mr-3 shadow-md flex-shrink-0">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base sm:text-lg font-bold text-blue-600 truncate">
                    {step === 'setup' && 'Start New Exam'}
                    {step === 'exam' && `Question ${currentQuestionIndex + 1} of ${questions.length}`}
                    {step === 'results' && 'Exam Complete!'}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    {step === 'setup' && `For ${student.name} - ${student.level}`}
                    {step === 'exam' && `${selectedSubject} - ${selectedMode} Mode`}
                    {step === 'results' && `${student.name}'s Results`}
                  </p>
                </div>
              </div>
              
              {/* Timer */}
              {step === 'exam' && (
                <ExamTimer 
                  timeLeft={timeLeft}
                  onTimeUpdate={handleTimeUpdate}
                  onTimeUp={handleTimeUp}
                  isActive={examStarted}
                />
              )}
              
              {/* Close Button */}
              <button
                onClick={handleModalClose}
                className="bg-red-500 text-white hover:bg-red-600 transition-colors rounded-lg p-2 shadow-md flex-shrink-0"
                title="Close exam"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-4">
            {step === 'setup' && (
              <ExamSetup 
                student={student}
                selectedSubject={selectedSubject}
                selectedMode={selectedMode}
                onSubjectChange={setSelectedSubject}
                onModeChange={setSelectedMode}
                onStartExam={startExam}
                onCancel={handleModalClose}
                loading={loading}
                error={error}
              />
            )}

            {step === 'exam' && questions.length > 0 && (
              <div className="space-y-4">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 6.5c-.77.833-.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                        {error.includes('Network connection failed') && (
                          <div className="mt-2 text-sm">
                            <p className="font-semibold">Try these steps:</p>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              <li>Check your internet connection</li>
                              <li>Refresh the page and try again</li>
                              <li>If offline, your results will be saved locally</li>
                            </ul>
                          </div>
                        )}
                        {error.includes('Authentication required') && (
                          <div className="mt-2 text-sm">
                            <p className="font-semibold">Please sign in again to continue.</p>
                          </div>
                        )}
                        {error.includes('Database connection issue') && (
                          <div className="mt-2 text-sm">
                            <p className="font-semibold">Please refresh the page and try again.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                <ExamProgressTracker 
                  questions={questions}
                  currentQuestionIndex={currentQuestionIndex}
                  onJumpToQuestion={jumpToQuestion}
                  isQuestionAnswered={isQuestionAnswered}
                />

                {questions[currentQuestionIndex] && (
                  <>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 sm:p-6 shadow-lg">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg sm:text-xl font-bold text-blue-800 leading-tight flex-1">
                          {questions[currentQuestionIndex].question_text}
                        </h3>
                        <div className="ml-4 flex-shrink-0">
                          <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            {questions[currentQuestionIndex].type}
                          </div>
                        </div>
                      </div>
                      
                      <ExamQuestionRenderer 
                        question={questions[currentQuestionIndex]}
                        matchingPairs={matchingPairs}
                        selectedLeftItem={selectedLeftItem}
                        onAnswerSelect={handleAnswerSelect}
                        onMatchingSelect={handleMatchingSelect}
                        onSetSelectedLeftItem={setSelectedLeftItem}
                      />
                    </div>

                    {/* Navigation */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                      <div className="flex items-center justify-between space-x-4">
                        <Button
                          variant="outline"
                          onClick={previousQuestion}
                          disabled={currentQuestionIndex === 0}
                          className="flex-shrink-0 min-w-[100px]"
                        >
                          ← Previous
                        </Button>
                        
                        <div className="flex-1 text-center">
                          <div className="text-sm text-gray-600">
                            Question <span className="font-bold text-blue-600">{currentQuestionIndex + 1}</span> of <span className="font-bold">{questions.length}</span>
                          </div>
                        </div>

                        <Button
                          onClick={nextQuestion}
                          disabled={loading}
                          className="flex-shrink-0 min-w-[100px] bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50"
                        >
                          {loading && currentQuestionIndex === questions.length - 1 ? 'Submitting...' : 
                           currentQuestionIndex === questions.length - 1 ? 'Submit Exam' : 'Next →'}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {step === 'results' && (
              <ExamResults 
                student={student}
                questions={questions}
                examScore={examScore}
                selectedSubject={selectedSubject}
                selectedMode={selectedMode}
                onClose={handleModalClose}
                onTryAgain={() => {
                  setStep('setup')
                  setExamScore(0)
                  setQuestions([])
                  setCurrentQuestionIndex(0)
                  setTimeLeft(0)
                  setExamStarted(false)
                  setError('')
                  setTotalQuestions(0)
                  setMatchingPairs([])
                  setSelectedLeftItem(null)
                  setShowSubmitWarning(false)
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Submit Warning Modal */}
      {showSubmitWarning && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-600 mr-3" />
              <h3 className="text-lg font-bold text-gray-900">Unanswered Questions</h3>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-700 mb-3">
                You have {getUnansweredQuestions().length} unanswered question{getUnansweredQuestions().length !== 1 ? 's' : ''}:
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex flex-wrap gap-2">
                  {getUnansweredQuestions().map(({ index, number }) => (
                    <button
                      key={index}
                      onClick={() => {
                        setShowSubmitWarning(false)
                        jumpToQuestion(index)
                      }}
                      className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded font-medium text-sm hover:bg-yellow-300 transition-colors"
                    >
                      Question {number}
                    </button>
                  ))}
                </div>
              </div>
              
              <p className="text-gray-600 text-sm">
                You can either go back to review these questions or submit the exam as is.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={reviewUnansweredQuestions}
                className="flex-1"
              >
                Review Questions
              </Button>
              <Button
                onClick={proceedWithSubmit}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600"
              >
                Submit Anyway
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}