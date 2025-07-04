import React, { useState, useEffect } from 'react'
import { X, BookOpen } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { ExamSetup, ExamTimer, ExamProgressTracker, ExamQuestionRenderer } from './index'
import { ExamModalProps, ExamQuestion, MatchingPair, ExamMode, Subject, ExamStep } from './types'
import { checkShortAnswer } from '../../utils/answerChecker'

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

  const nextQuestion = () => {
    setError('') // Clear any previous errors
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
      
      const { error: saveError } = await supabase
        .from('exams')
        .insert({
          student_id: student.id,
          subject: selectedSubject,
          mode: selectedMode,
          questions_count: questions.length,
          correct_answers: correctAnswers,
          score: score,
          time_taken: getModeConfig(selectedMode).timeMinutes * 60 - timeLeft,
          question_ids: questions.map(q => q.id),
          completed: true
        })
      
      if (saveError) throw saveError
      
      setStep('results')
      onExamComplete(score, questions.length)
      
      // Clear session storage
      sessionStorage.removeItem(`exam-state-${student.id}`)
    } catch (err: any) {
      console.error('Exam submission error:', err)
      setError(`Failed to save exam results: ${err.message || 'Unknown error'}`)
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
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
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
              <div className="text-center space-y-4">
                <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-xl p-6 shadow-lg">
                  <h3 className="text-2xl font-bold text-green-600 mb-2">Exam Complete!</h3>
                  <div className="text-4xl font-bold text-blue-600 mb-4">{examScore}%</div>
                  <div className="text-gray-600">
                    {questions.filter(q => q.isCorrect).length} out of {questions.length} questions correct
                  </div>
                </div>
                
                <Button onClick={handleModalClose} className="bg-green-500 hover:bg-green-600">
                  Continue Learning
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}