import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Student, Question } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { X, BookOpen, Clock, Target, Star, Zap, Trophy, CheckCircle, AlertCircle, ArrowUpDown, Edit3, Lock, BookOpenCheck, XCircle, MapPin } from 'lucide-react'
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
      selectedLeftItem: null,
      showSubmitWarning: false
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

  // Smart question selection that prioritizes fresh, newer questions
  const getSmartQuestionSelection = async (
    allowedLevels: string[], 
    subject: string, 
    questionTypes: string[], 
    requiredCount: number
  ) => {
    // Step 1: Fetch all available questions for the criteria
    const { data: allQuestions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .in('level', allowedLevels)
      .eq('subject', subject)
      .in('type', questionTypes)
      .order('created_at', { ascending: false }) // Newest first

    if (questionsError) throw questionsError

    if (!allQuestions || allQuestions.length === 0) {
      throw new Error(
        `No questions available for ${subject} at levels: ${allowedLevels.join(', ')}.`
      )
    }

    // Step 2: Get previously answered question IDs for this student
    const { data: studentExams, error: examsError } = await supabase
      .from('exams')
      .select('question_ids')
      .eq('student_id', student.id)
      .eq('subject', subject)
      .eq('completed', true)

    if (examsError) throw examsError

    // Extract all previously answered question IDs
    const answeredQuestionIds = new Set<string>()
    if (studentExams) {
      studentExams.forEach((exam: any) => {
        if (Array.isArray(exam.question_ids)) {
          exam.question_ids.forEach((id: string) => answeredQuestionIds.add(id))
        }
      })
    }

    console.log(`Student ${student.name} has previously answered ${answeredQuestionIds.size} questions in ${subject}`)

    // Step 3: Separate fresh questions from previously answered ones
    const freshQuestions = allQuestions.filter((q: Question) => !answeredQuestionIds.has(q.id))
    const answeredQuestions = allQuestions.filter((q: Question) => answeredQuestionIds.has(q.id))

    console.log(`Found ${freshQuestions.length} fresh questions and ${answeredQuestions.length} previously answered questions`)

    // Step 4: Smart selection strategy
    let selectedQuestions: typeof allQuestions = []

    if (freshQuestions.length >= requiredCount) {
      // Enough fresh questions - prioritize newest with some randomization
      const newestQuestions = freshQuestions.slice(0, Math.min(requiredCount * 2, freshQuestions.length))
      const shuffledNewest = newestQuestions.sort(() => 0.5 - Math.random())
      selectedQuestions = shuffledNewest.slice(0, requiredCount)
      
      console.log(`Selected ${selectedQuestions.length} fresh questions (newest first with randomization)`)
    } else if (freshQuestions.length > 0) {
      // Use all fresh questions + fill remainder with least recently answered
      selectedQuestions = [...freshQuestions]
      
      // Sort previously answered questions by most recent exam date (oldest exams first for variety)
      const questionsWithLastAnswered = answeredQuestions.map((question: Question) => {
        let lastAnsweredDate = null
        for (const exam of studentExams || []) {
          if (Array.isArray(exam.question_ids) && exam.question_ids.includes(question.id)) {
            lastAnsweredDate = exam.created_at
            break // Get most recent exam that included this question
          }
        }
        return { ...question, lastAnsweredDate }
      })

      questionsWithLastAnswered.sort((a: any, b: any) => {
        if (!a.lastAnsweredDate) return -1
        if (!b.lastAnsweredDate) return 1
        return new Date(a.lastAnsweredDate).getTime() - new Date(b.lastAnsweredDate).getTime()
      })

      const needed = requiredCount - freshQuestions.length
      const oldQuestions = questionsWithLastAnswered
        .slice(0, needed)
        .sort(() => 0.5 - Math.random()) // Randomize the old questions

      selectedQuestions = selectedQuestions.concat(oldQuestions)
      
      console.log(`Selected ${freshQuestions.length} fresh + ${oldQuestions.length} previously answered questions`)
    } else {
      // No fresh questions available - use the most varied set of answered questions
      const shuffledAnswered = answeredQuestions.sort(() => 0.5 - Math.random())
      selectedQuestions = shuffledAnswered.slice(0, requiredCount)
      
      console.log(`No fresh questions available - selected ${selectedQuestions.length} from previously answered questions`)
    }

    return selectedQuestions
  }

  const startExam = async () => {
    setLoading(true)
    setError('')

    try {
      const config = getModeConfig(selectedMode)
      
      // Get allowed levels for this student
      const allowedLevels = getAllowedLevels(student.level)
      
      console.log(`Student ${student.name} (${student.level}) can access questions from levels:`, allowedLevels)
      
      // Use smart question selection instead of random selection
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

      console.log(`Selected ${selectedQuestions.length} questions from levels:`, 
        [...new Set(selectedQuestions.map(q => q.level))].join(', '))

      // Final shuffle to ensure the order isn't predictable
      const finalQuestions = selectedQuestions.sort(() => 0.5 - Math.random())

      setQuestions(finalQuestions)
      setTimeLeft(config.timeMinutes * 60) // Convert to seconds
      setStep('exam')
      setExamStarted(true)
      setCurrentQuestionIndex(0)
      
      // Initialize matching pairs for the first question if it's a matching type
      initializeMatchingQuestion(finalQuestions[0])
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
      // Check for unanswered questions before finishing
      checkUnansweredQuestionsBeforeSubmit()
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

  // New function to jump to specific question
  const jumpToQuestion = (questionIndex: number) => {
    if (questionIndex >= 0 && questionIndex < questions.length) {
      setCurrentQuestionIndex(questionIndex)
      initializeMatchingQuestion(questions[questionIndex])
      setSelectedLeftItem(null)
    }
  }

  // Check if a question is answered
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
      .map((_: ExamQuestion, index: number) => ({ index, number: index + 1 }))
      .filter(({ index }: { index: number }) => !isQuestionAnswered(index))
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

  // Render the question progress tracker
  const renderProgressTracker = () => {
    if (questions.length === 0) return null

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4">
        <div className="flex items-center mb-2">
          <Target className="w-4 h-4 text-blue-600 mr-2" />
          <h4 className="text-sm font-semibold text-gray-700">Question Progress</h4>
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {questions.map((_, index) => {
            const isAnswered = isQuestionAnswered(index)
            const isCurrent = index === currentQuestionIndex
            
            return (
              <button
                key={index}
                onClick={() => jumpToQuestion(index)}
                className={`
                  w-8 h-8 rounded-lg border-2 text-xs font-bold transition-all duration-300 
                  flex items-center justify-center
                  ${isCurrent 
                    ? 'border-blue-500 bg-blue-500 text-white shadow-md ring-2 ring-blue-200' 
                    : isAnswered 
                      ? 'border-green-400 bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'border-yellow-400 bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  }
                `}
                title={`Question ${index + 1} - ${isAnswered ? 'Answered' : 'Unanswered'}`}
              >
                {index + 1}
              </button>
            )
          })}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center mt-3 space-x-4 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
            <span className="text-gray-600">Current</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-100 border border-green-400 rounded mr-1"></div>
            <span className="text-gray-600">Answered</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-400 rounded mr-1"></div>
            <span className="text-gray-600">Unanswered</span>
          </div>
        </div>
      </div>
    )
  }

  // Render submit warning modal
  const renderSubmitWarningModal = () => {
    if (!showSubmitWarning) return null

    const unanswered = getUnansweredQuestions()

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-6 h-6 text-yellow-600 mr-3" />
            <h3 className="text-lg font-bold text-gray-900">Unanswered Questions</h3>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-700 mb-3">
              You have {unanswered.length} unanswered question{unanswered.length !== 1 ? 's' : ''}:
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex flex-wrap gap-2">
                {unanswered.map(({ index, number }) => (
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
    )
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
  }, [step, selectedSubject, selectedMode, questions, currentQuestionIndex, timeLeft, examStarted, examScore, totalQuestions, matchingPairs, selectedLeftItem, showSubmitWarning])

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
    setShowSubmitWarning(false)
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
                {/* Question Progress Tracker */}
                {renderProgressTracker()}

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
                      <div className="flex space-x-2">
                        <Button
                          onClick={nextQuestion}
                          className="bg-gradient-to-r from-green-500 to-green-600 text-sm"
                        >
                          {currentQuestionIndex === questions.length - 1 ? 'Submit Exam' : 'Next →'}
                        </Button>
                      </div>
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

        {/* Submit Warning Modal */}
        {renderSubmitWarningModal()}
      </div>
    </div>
  )
}