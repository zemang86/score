import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Student, Question } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { X, BookOpen, Clock, Target, Star, Zap, Trophy, CheckCircle, AlertCircle } from 'lucide-react'

interface ExamModalProps {
  isOpen: boolean
  onClose: () => void
  student: Student
  onExamComplete: (score: number, totalQuestions: number) => void
}

interface ExamQuestion extends Question {
  userAnswer?: string
  isCorrect?: boolean
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

  const subjects: Subject[] = ['Bahasa Melayu', 'English', 'Mathematics', 'Science', 'History']
  
  const getModeConfig = (mode: ExamMode) => {
    switch (mode) {
      case 'Easy':
        return { questionCount: 10, timeMinutes: 15, types: ['MCQ'] }
      case 'Medium':
        return { questionCount: 20, timeMinutes: 30, types: ['MCQ', 'ShortAnswer'] }
      case 'Full':
        return { questionCount: 40, timeMinutes: 60, types: ['MCQ', 'ShortAnswer', 'Subjective'] }
    }
  }

  const startExam = async () => {
    setLoading(true)
    setError('')

    try {
      const config = getModeConfig(selectedMode)
      
      // Fetch questions from database
      const { data: fetchedQuestions, error: fetchError } = await supabase
        .from('questions')
        .select('*')
        .eq('level', student.level)
        .eq('subject', selectedSubject)
        .in('type', config.types)
        .limit(config.questionCount * 2) // Fetch more to randomize

      if (fetchError) throw fetchError

      if (!fetchedQuestions || fetchedQuestions.length < config.questionCount) {
        throw new Error(`Not enough questions available for ${selectedSubject} at ${student.level} level`)
      }

      // Randomize and select questions
      const shuffled = fetchedQuestions.sort(() => 0.5 - Math.random())
      const selectedQuestions = shuffled.slice(0, config.questionCount)

      setQuestions(selectedQuestions)
      setTimeLeft(config.timeMinutes * 60) // Convert to seconds
      setStep('exam')
      setExamStarted(true)
    } catch (err: any) {
      setError(err.message || 'Failed to start exam')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (answer: string) => {
    const updatedQuestions = [...questions]
    updatedQuestions[currentQuestionIndex].userAnswer = answer
    setQuestions(updatedQuestions)
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      finishExam()
    }
  }

  const finishExam = async () => {
    setExamStarted(false)
    
    // Calculate score
    let correctAnswers = 0
    const gradedQuestions = questions.map(question => {
      const isCorrect = question.userAnswer === question.correct_answer
      if (isCorrect) correctAnswers++
      return { ...question, isCorrect }
    })

    setQuestions(gradedQuestions)
    
    const score = Math.round((correctAnswers / questions.length) * 100)
    
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
        answer_given: question.userAnswer || '',
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

      onExamComplete(score, questions.length)
    } catch (err: any) {
      console.error('Error saving exam:', err)
      setError('Failed to save exam results')
    }

    setStep('results')
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Setup Step */}
        {step === 'setup' && (
          <>
            <div className="p-4 sm:p-6 border-b border-neutral-200 bg-gradient-to-r from-primary-100 to-secondary-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-primary-500 rounded-full p-2 sm:p-3 mr-3 sm:mr-4 shadow-fun">
                    <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-600">Start New Exam</h2>
                    <p className="text-sm sm:text-base text-secondary-600">For {student.name} - {student.level}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors bg-white rounded-full p-1.5 sm:p-2 shadow-soft"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {error && (
                <div className="bg-error-50 border-2 border-error-200 rounded-xl p-3 sm:p-4">
                  <p className="text-error-700 font-medium text-center text-sm sm:text-base">{error}</p>
                </div>
              )}

              {/* Subject Selection */}
              <div>
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
              <div>
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
                  onClick={onClose}
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
            </div>
          </>
        )}

        {/* Exam Step */}
        {step === 'exam' && questions.length > 0 && (
          <>
            <div className="p-4 sm:p-6 border-b border-neutral-200 bg-gradient-to-r from-primary-100 to-secondary-100">
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <div className="flex items-center mb-3 sm:mb-0">
                  <div className="bg-secondary-500 rounded-full p-2 sm:p-3 mr-3 sm:mr-4 shadow-success">
                    <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-primary-600">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </h2>
                    <p className="text-sm sm:text-base text-secondary-600">{selectedSubject} - {selectedMode} Mode</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-error-500 text-white rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-error">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
                    <span className="font-bold text-sm sm:text-base lg:text-lg">{formatTime(timeLeft)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {questions[currentQuestionIndex] && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-primary-700 mb-3 sm:mb-4">
                      {questions[currentQuestionIndex].question_text}
                    </h3>
                    
                    {questions[currentQuestionIndex].type === 'MCQ' && (
                      <div className="space-y-2 sm:space-y-3">
                        {questions[currentQuestionIndex].options.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => handleAnswerSelect(option)}
                            className={`w-full p-3 sm:p-4 rounded-xl border-2 text-left transition-all duration-300 text-sm sm:text-base ${
                              questions[currentQuestionIndex].userAnswer === option
                                ? 'bg-accent-400 border-accent-600 text-white shadow-warning'
                                : 'bg-white border-primary-300 text-primary-700 hover:bg-primary-50'
                            }`}
                          >
                            <span className="font-bold mr-2 sm:mr-3">{String.fromCharCode(65 + index)}.</span>
                            {option}
                          </button>
                        ))}
                      </div>
                    )}

                    {questions[currentQuestionIndex].type === 'ShortAnswer' && (
                      <input
                        type="text"
                        placeholder="Type your answer here..."
                        value={questions[currentQuestionIndex].userAnswer || ''}
                        onChange={(e) => handleAnswerSelect(e.target.value)}
                        className="w-full p-3 sm:p-4 border-2 border-primary-300 rounded-xl text-base sm:text-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                      />
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                      disabled={currentQuestionIndex === 0}
                      className="text-sm sm:text-base"
                    >
                      ← Previous
                    </Button>
                    <Button
                      onClick={nextQuestion}
                      disabled={!questions[currentQuestionIndex].userAnswer}
                      className="bg-gradient-to-r from-secondary-400 to-secondary-600 text-sm sm:text-base"
                    >
                      {currentQuestionIndex === questions.length - 1 ? 'Finish Exam' : 'Next →'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Results Step */}
        {step === 'results' && (
          <>
            <div className="p-4 sm:p-6 border-b border-neutral-200 bg-gradient-to-r from-success-100 to-accent-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-success-500 rounded-full p-2 sm:p-3 mr-3 sm:mr-4 shadow-success">
                    <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-success-600">Exam Complete!</h2>
                    <p className="text-sm sm:text-base text-primary-600">{student.name}'s Results</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors bg-white rounded-full p-1.5 sm:p-2 shadow-soft"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Score Display */}
              <div className="text-center bg-gradient-to-r from-accent-100 to-warning-100 border-2 border-accent-400 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-large">
                <div className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 ${getScoreColor(questions.filter(q => q.isCorrect).length / questions.length * 100)}`}>
                  {Math.round((questions.filter(q => q.isCorrect).length / questions.length) * 100)}%
                </div>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-700 mb-1 sm:mb-2">
                  {getScoreMessage(Math.round((questions.filter(q => q.isCorrect).length / questions.length) * 100))}
                </div>
                <div className="text-base sm:text-lg text-secondary-600">
                  {questions.filter(q => q.isCorrect).length} out of {questions.length} correct
                </div>
              </div>

              {/* Question Review */}
              <div className="bg-white border-2 border-primary-200 rounded-xl p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-primary-700 mb-3 sm:mb-4">Question Review</h3>
                <div className="space-y-2 sm:space-y-3 max-h-60 overflow-y-auto">
                  {questions.map((question, index) => (
                    <div
                      key={index}
                      className={`p-2.5 sm:p-3 rounded-xl border-2 ${
                        question.isCorrect
                          ? 'bg-success-50 border-success-300'
                          : 'bg-error-50 border-error-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm">
                          Q{index + 1}: {question.question_text.substring(0, 50)}...
                        </span>
                        <div className="flex items-center">
                          {question.isCorrect ? (
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-success-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-error-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-primary-400 to-secondary-500 text-sm sm:text-base lg:text-lg"
                size="lg"
                icon={<Star className="w-5 h-5 sm:w-6 sm:h-6" />}
              >
                Continue Learning!
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}