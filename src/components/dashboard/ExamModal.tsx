import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Student, Question } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { X, BookOpen, Clock, Target, Star, Zap, Trophy, CheckCircle, AlertCircle, ArrowUpDown, Edit3, Lock, BookOpenCheck, XCircle } from 'lucide-react'
import { checkShortAnswer } from '../../utils/answerChecker'

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
      selectedLeftItem: null
    }
  }

  const initialState = getInitialState()
  
  const [step, setStep] = useState<'setup' | 'exam' | 'results'>(initialState.step)
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
      selectedLeftItem
    }
    sessionStorage.setItem(`exam-state-${student.id}`, JSON.stringify(stateToSave))
  }

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
    
    // Process each question and grade it
    const gradingPromises = questions.map(async (question) => {
      let isCorrect = false;
      
      // For MCQ and Matching, use the synchronous grading function
      if (question.type === 'MCQ' || question.type === 'Matching') {
        isCorrect = gradeQuestion(question);
      } 
      // For ShortAnswer and Subjective, use the AI-powered checker
      else if ((question.type === 'ShortAnswer' || question.type === 'Subjective') && question.userAnswer) {
        try {
          const checkResult = await checkShortAnswer(
            question.userAnswer as string, 
            question.correct_answer,
            {
              openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY
            }
          );
          
          isCorrect = checkResult.result === 'correct';
          console.log(`Answer check for "${question.userAnswer}": ${checkResult.result} (${checkResult.method}) - ${checkResult.reason}`);
        } catch (error) {
          console.error('Error checking answer:', error);
          // Fallback to simple matching if AI check fails
          const userText = (question.userAnswer as string).toLowerCase().trim();
          const correctText = question.correct_answer.toLowerCase().trim();
          
          // Simple keyword matching as fallback
          const keyWords = correctText.split(/\s+/).filter(word => word.length > 3);
          const matchedWords = keyWords.filter(word => userText.includes(word));
          isCorrect = matchedWords.length >= Math.ceil(keyWords.length * 0.6);
        }
      }
      
      if (isCorrect) correctAnswers++;
      return { ...question, isCorrect };
    });
    
    // Wait for all grading to complete
    const gradedQuestions = await Promise.all(gradingPromises);
    setQuestions(gradedQuestions);
    
    const score = Math.round((correctAnswers / questions.length) * 100);
    
    // Store score and total questions for later use
    setExamScore(score);
    setTotalQuestions(questions.length);
    
    // IMPORTANT: Set step to results FIRST before any async operations
    setStep('results');
    
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
      const attempts = gradedQuestions.map(question => ({
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

  // Save state effect - persist state whenever important values change
  useEffect(() => {
    if (step === 'exam' && examStarted) {
      saveState()
    }
  }, [step, selectedSubject, selectedMode, questions, currentQuestionIndex, timeLeft, examStarted, examScore, totalQuestions, matchingPairs, selectedLeftItem])

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
    // Clear saved state
    sessionStorage.removeItem(`exam-state-${student.id}`)
    
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
    // Clear saved state since exam is complete
    sessionStorage.removeItem(`exam-state-${student.id}`)
    
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
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all duration-300 text-sm ${
                  question.userAnswer === option
                    ? 'bg-blue-500 border-blue-600 text-white shadow-md'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                }`}
              >
                <span className="font-bold mr-2">{String.fromCharCode(65 + index)}.</span>
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
              className="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            <div className="flex items-center text-sm text-gray-600">
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
              rows={4}
              className="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
            />
            <div className="flex items-center text-sm text-gray-600">
              <Edit3 className="w-4 h-4 mr-2" />
              <span>Provide a detailed explanation with examples where appropriate</span>
            </div>
          </div>
        )

      case 'Matching':
        if (matchingPairs.length === 0) {
          return <div className="text-center text-gray-500">Loading matching pairs...</div>
        }

        const leftItems = matchingPairs.map(pair => pair.left)
        const rightItems = [...new Set(matchingPairs.map(pair => pair.right))]

        return (
          <div className="space-y-4">
            <div className="flex items-center text-sm text-blue-600 mb-4">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <span>Click a left item, then click its matching right item</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700 text-center mb-3">Match these items:</h4>
                {leftItems.map((leftItem, index) => {
                  const pair = matchingPairs.find(p => p.left === leftItem)
                  const isSelected = selectedLeftItem === leftItem
                  const isMatched = pair?.matched
                  
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedLeftItem(isSelected ? null : leftItem)}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all duration-300 ${
                        isMatched
                          ? 'bg-green-100 border-green-400 text-green-800'
                          : isSelected
                          ? 'bg-blue-500 border-blue-600 text-white shadow-md'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                      disabled={isMatched}
                    >
                      {leftItem}
                      {isMatched && (
                        <span className="ml-2 text-green-600">
                          ✓ → {pair.right}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Right Column */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700 text-center mb-3">With these options:</h4>
                {rightItems.map((rightItem, index) => {
                  const isMatchedToSelected = matchingPairs.some(
                    pair => pair.right === rightItem && pair.matched
                  )
                  
                  return (
                    <button
                      key={index}
                      onClick={() => selectedLeftItem && handleMatchingSelect(selectedLeftItem, rightItem)}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all duration-300 ${
                        isMatchedToSelected
                          ? 'bg-green-100 border-green-400 text-green-800'
                          : selectedLeftItem
                          ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          : 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!selectedLeftItem || isMatchedToSelected}
                    >
                      {rightItem}
                      {isMatchedToSelected && <span className="ml-2 text-green-600">✓</span>}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Progress indicator */}
            <div className="text-center text-sm text-gray-600">
              Matched: {matchingPairs.filter(p => p.matched).length} / {matchingPairs.length}
            </div>
          </div>
        )

      default:
        return <div className="text-center text-red-600">Unsupported question type: {question.type}</div>
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-2xl shadow-xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        
        {/* Sticky Header */}
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
              
              {/* Timer for exam step */}
              {step === 'exam' && (
                <div className="bg-red-500 text-white rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 shadow-md mx-3 flex-shrink-0">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                  <span className="font-bold text-xs sm:text-sm">{formatTime(timeLeft)}</span>
                </div>
              )}
              
              {/* Close Button - More Visible */}
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-4">
            {/* Setup Step */}
            {step === 'setup' && (
              <div className="space-y-4">
                {error && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                      <p className="text-red-700 font-medium text-sm">{error}</p>
                    </div>
                  </div>
                )}

                {/* Level Information - Compact */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h3 className="text-sm font-semibold text-blue-800 mb-2">Smart Question Selection</h3>
                  <p className="text-xs text-blue-700 mb-2">
                    Based on your level ({student.level}), you'll receive questions from:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {getAllowedLevels(student.level).map((level, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-200 text-blue-800">
                        {level}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Subject Selection - Compact Grid */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Choose Subject</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {subjects.map((subject) => (
                      <button
                        key={subject}
                        onClick={() => setSelectedSubject(subject)}
                        className={`p-2 rounded-lg border-2 font-medium transition-all duration-300 text-xs sm:text-sm ${
                          selectedSubject === subject
                            ? 'bg-blue-500 text-white border-blue-700 shadow-md'
                            : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mode Selection - Compact */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Choose Difficulty</label>
                  <div className="space-y-2">
                    {/* Easy Mode - Enabled */}
                    <button
                      onClick={() => setSelectedMode('Easy')}
                      className={`w-full p-3 rounded-lg border-2 transition-all duration-300 text-left ${
                        selectedMode === 'Easy'
                          ? 'bg-green-500 text-white border-green-700 shadow-md'
                          : 'bg-white text-green-600 border-green-300 hover:bg-green-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-sm">Easy Mode</div>
                          <div className="text-xs opacity-90">
                            10 questions • 15 minutes
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <Target className="w-4 h-4" />
                        </div>
                      </div>
                    </button>

                    {/* Medium Mode - Disabled with Coming Soon */}
                    <div className="relative">
                      <button
                        disabled={true}
                        className="w-full p-3 rounded-lg border-2 transition-all duration-300 text-left bg-gray-100 text-gray-500 border-gray-300 opacity-80 cursor-not-allowed"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-sm">Medium Mode</div>
                            <div className="text-xs opacity-90">
                              20 questions • 30 minutes
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Lock className="w-4 h-4" />
                          </div>
                        </div>
                      </button>
                      <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">
                        Coming Soon
                      </div>
                    </div>

                    {/* Full Mode - Disabled with Coming Soon */}
                    <div className="relative">
                      <button
                        disabled={true}
                        className="w-full p-3 rounded-lg border-2 transition-all duration-300 text-left bg-gray-100 text-gray-500 border-gray-300 opacity-80 cursor-not-allowed"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-sm">Full Mode</div>
                            <div className="text-xs opacity-90">
                              40+ questions • 60 minutes
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Lock className="w-4 h-4" />
                          </div>
                        </div>
                      </button>
                      <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">
                        Coming Soon
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={handleModalClose}
                    className="flex-1 text-sm"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={startExam}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-sm"
                    disabled={loading}
                    loading={loading}
                    icon={!loading ? <Zap className="w-4 h-4" /> : undefined}
                  >
                    {loading ? 'Loading...' : 'Start Exam!'}
                  </Button>
                </div>
              </div>
            )}

            {/* Exam Step */}
            {step === 'exam' && questions.length > 0 && (
              <div className="space-y-4">
                {questions[currentQuestionIndex] && (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="text-base sm:text-lg font-bold text-blue-700 mb-3">
                        {questions[currentQuestionIndex].question_text}
                      </h3>
                      
                      {renderQuestionContent()}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0">
                      <Button
                        variant="outline"
                        onClick={previousQuestion}
                        disabled={currentQuestionIndex === 0}
                        className="text-sm"
                      >
                        ← Previous
                      </Button>
                      <Button
                        onClick={nextQuestion}
                        disabled={!hasUserAnswer()}
                        className="bg-gradient-to-r from-green-500 to-green-600 text-sm"
                      >
                        {currentQuestionIndex === questions.length - 1 ? 'Finish Exam' : 'Next →'}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Results Step */}
            {step === 'results' && (
              <div className="space-y-4">
                {/* Score Display */}
                <div className="text-center bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-lg p-4 shadow-lg">
                  <div className={`text-3xl sm:text-4xl font-bold mb-2 ${getScoreColor(examScore)}`}>
                    {examScore}%
                  </div>
                  <div className="text-base sm:text-lg font-bold text-gray-700 mb-1">
                    {getScoreMessage(examScore)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {questions.filter(q => q.isCorrect).length} out of {questions.length} correct
                  </div>
                  
                  {/* XP Display */}
                  <div className="mt-3 p-2 bg-blue-100 border border-blue-300 rounded-lg">
                    <div className="flex items-center justify-center text-blue-700 mb-1">
                      <Star className="w-4 h-4 mr-1" />
                      <span className="font-bold text-sm">XP Earned!</span>
                    </div>
                    <div className="text-xl font-bold text-blue-800">
                      +{questions.filter(q => q.isCorrect).length * 10 + (examScore === 100 ? 50 : 0)} XP
                    </div>
                  </div>
                </div>

                {/* Question Review with Correct Answers and Explanations */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-base font-bold text-gray-700 mb-3">Question Review</h3>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {questions.map((question, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border-2 ${
                          question.isCorrect
                            ? 'bg-green-50 border-green-300'
                            : 'bg-red-50 border-red-300'
                        }`}
                      >
                        {/* Question Header */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-white mr-2 ${
                              question.isCorrect ? 'bg-green-500' : 'bg-red-500'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <div className="flex items-center">
                                {question.isCorrect ? (
                                  <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-600 mr-1" />
                                )}
                                <span className={`font-semibold text-xs ${
                                  question.isCorrect ? 'text-green-700' : 'text-red-700'
                                }`}>
                                  {question.isCorrect ? 'Correct' : 'Incorrect'}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {question.type} • {question.level}
                                {question.topic && ` • ${question.topic}`}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Question Text */}
                        <div className="mb-2">
                          <p className="text-sm text-gray-700">{question.question_text}</p>
                        </div>
                        
                        {/* Your Answer */}
                        <div className="mb-2">
                          <div className="text-xs font-medium text-gray-700 mb-1">Your answer:</div>
                          <div className={`p-2 rounded-md border text-xs ${
                            question.isCorrect ? 'bg-green-100 border-green-300 text-green-800' : 'bg-red-100 border-red-300 text-red-800'
                          }`}>
                            {Array.isArray(question.userAnswer) 
                              ? question.userAnswer.join(', ') 
                              : (question.userAnswer || 'No answer provided')
                            }
                          </div>
                        </div>
                        
                        {/* Correct Answer - Show for all questions */}
                        <div className="mb-2">
                          <div className="text-xs font-medium text-green-700 mb-1">Correct answer:</div>
                          <div className="p-2 rounded-md bg-green-100 border border-green-300 text-green-800 text-xs">
                            {question.correct_answer}
                          </div>
                        </div>
                        
                        {/* Explanation - Show if available */}
                        {question.explanation && (
                          <div>
                            <div className="text-xs font-medium text-blue-700 mb-1 flex items-center">
                              <BookOpenCheck className="w-3.5 h-3.5 mr-1" />
                              Explanation:
                            </div>
                            <div className="p-2 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-xs">
                              {question.explanation}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleResultsComplete}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-sm"
                  size="lg"
                  icon={<Star className="w-5 h-5" />}
                >
                  Continue Learning!
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}