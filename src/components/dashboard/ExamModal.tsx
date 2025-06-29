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
    if (score >= 90) return 'text-roblox-green-600'
    if (score >= 70) return 'text-roblox-yellow-600'
    if (score >= 50) return 'text-roblox-orange-600'
    return 'text-roblox-red-600'
  }

  const getScoreMessage = (score: number) => {
    if (score === 100) return '🏆 Perfect Score! Amazing! 🏆'
    if (score >= 90) return '🌟 Excellent work! 🌟'
    if (score >= 70) return '👍 Good job! 👍'
    if (score >= 50) return '📚 Keep practicing! 📚'
    return '💪 Don\'t give up! Try again! 💪'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-roblox-hover max-w-4xl w-full max-h-[90vh] overflow-y-auto border-4 border-roblox-blue-300">
        
        {/* Setup Step */}
        {step === 'setup' && (
          <>
            <div className="p-6 border-b-4 border-roblox-blue-200 bg-gradient-to-r from-roblox-blue-100 to-roblox-purple-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-roblox-blue-500 rounded-full p-3 mr-4 shadow-neon-blue">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold-game text-roblox-blue-600">🎯 Start New Exam 🎯</h2>
                    <p className="text-roblox-purple-600 font-game">For {student.name} - {student.level}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-roblox-blue-500 hover:text-roblox-blue-700 transition-colors bg-white rounded-full p-2 shadow-roblox"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {error && (
                <div className="bg-roblox-red-100 border-4 border-roblox-red-400 rounded-2xl p-4 shadow-roblox">
                  <p className="text-roblox-red-700 font-game font-bold text-center">⚠️ {error}</p>
                </div>
              )}

              {/* Subject Selection */}
              <div>
                <label className="block text-lg font-bold-game text-roblox-blue-700 mb-3">
                  📚 Choose Subject 📚
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {subjects.map((subject) => (
                    <button
                      key={subject}
                      onClick={() => setSelectedSubject(subject)}
                      className={`p-4 rounded-2xl border-4 font-game font-bold transition-all duration-300 ${
                        selectedSubject === subject
                          ? 'bg-roblox-blue-500 text-white border-roblox-blue-700 shadow-roblox-hover'
                          : 'bg-white text-roblox-blue-600 border-roblox-blue-300 hover:bg-roblox-blue-50'
                      }`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode Selection */}
              <div>
                <label className="block text-lg font-bold-game text-roblox-blue-700 mb-3">
                  🎮 Choose Difficulty 🎮
                </label>
                <div className="space-y-3">
                  {(['Easy', 'Medium', 'Full'] as ExamMode[]).map((mode) => {
                    const config = getModeConfig(mode)
                    return (
                      <button
                        key={mode}
                        onClick={() => setSelectedMode(mode)}
                        className={`w-full p-4 rounded-2xl border-4 font-game transition-all duration-300 text-left ${
                          selectedMode === mode
                            ? 'bg-roblox-green-500 text-white border-roblox-green-700 shadow-roblox-hover'
                            : 'bg-white text-roblox-green-600 border-roblox-green-300 hover:bg-roblox-green-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-lg">{mode} Mode</div>
                            <div className="text-sm opacity-90">
                              {config.questionCount} questions • {config.timeMinutes} minutes
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-5 h-5" />
                            <Target className="w-5 h-5" />
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 font-game border-4 border-roblox-blue-300"
                  disabled={loading}
                >
                  ❌ Cancel
                </Button>
                <Button
                  onClick={startExam}
                  className="flex-1 font-bold-game bg-gradient-to-r from-roblox-green-400 to-roblox-green-600"
                  disabled={loading}
                  glow={!loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Loading... 🎮
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      🚀 Start Exam! 🚀
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Exam Step */}
        {step === 'exam' && questions.length > 0 && (
          <>
            <div className="p-6 border-b-4 border-roblox-blue-200 bg-gradient-to-r from-roblox-blue-100 to-roblox-green-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-roblox-green-500 rounded-full p-3 mr-4 shadow-neon-green">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold-game text-roblox-blue-600">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </h2>
                    <p className="text-roblox-green-600 font-game">{selectedSubject} - {selectedMode} Mode</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-roblox-red-500 text-white rounded-2xl px-4 py-2 shadow-roblox">
                    <Clock className="w-5 h-5 inline mr-2" />
                    <span className="font-bold-game text-lg">{formatTime(timeLeft)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              {questions[currentQuestionIndex] && (
                <div className="space-y-6">
                  <div className="bg-roblox-blue-50 border-4 border-roblox-blue-200 rounded-2xl p-6">
                    <h3 className="text-xl font-bold-game text-roblox-blue-700 mb-4">
                      {questions[currentQuestionIndex].question_text}
                    </h3>
                    
                    {questions[currentQuestionIndex].type === 'MCQ' && (
                      <div className="space-y-3">
                        {questions[currentQuestionIndex].options.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => handleAnswerSelect(option)}
                            className={`w-full p-4 rounded-2xl border-4 font-game text-left transition-all duration-300 ${
                              questions[currentQuestionIndex].userAnswer === option
                                ? 'bg-roblox-yellow-400 border-roblox-yellow-600 text-roblox-blue-800 shadow-roblox-hover'
                                : 'bg-white border-roblox-blue-300 text-roblox-blue-700 hover:bg-roblox-blue-50'
                            }`}
                          >
                            <span className="font-bold mr-3">{String.fromCharCode(65 + index)}.</span>
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
                        className="w-full p-4 border-4 border-roblox-blue-300 rounded-2xl font-game text-lg focus:border-roblox-blue-500 focus:ring-4 focus:ring-roblox-blue-200"
                      />
                    )}
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                      disabled={currentQuestionIndex === 0}
                      className="font-game border-4 border-roblox-purple-300"
                    >
                      ← Previous
                    </Button>
                    <Button
                      onClick={nextQuestion}
                      disabled={!questions[currentQuestionIndex].userAnswer}
                      className="font-bold-game bg-gradient-to-r from-roblox-green-400 to-roblox-green-600"
                      glow={!!questions[currentQuestionIndex].userAnswer}
                    >
                      {currentQuestionIndex === questions.length - 1 ? '🏁 Finish Exam' : 'Next →'}
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
            <div className="p-6 border-b-4 border-roblox-green-200 bg-gradient-to-r from-roblox-green-100 to-roblox-yellow-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-roblox-green-500 rounded-full p-3 mr-4 shadow-neon-green">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold-game text-roblox-green-600">🎉 Exam Complete! 🎉</h2>
                    <p className="text-roblox-blue-600 font-game">{student.name}'s Results</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-roblox-green-500 hover:text-roblox-green-700 transition-colors bg-white rounded-full p-2 shadow-roblox"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Score Display */}
              <div className="text-center bg-gradient-to-r from-roblox-yellow-100 to-roblox-orange-100 border-4 border-roblox-yellow-400 rounded-3xl p-8 shadow-roblox-hover">
                <div className={`text-6xl font-bold-game mb-4 ${getScoreColor(questions.filter(q => q.isCorrect).length / questions.length * 100)}`}>
                  {Math.round((questions.filter(q => q.isCorrect).length / questions.length) * 100)}%
                </div>
                <div className="text-2xl font-bold-game text-roblox-blue-700 mb-2">
                  {getScoreMessage(Math.round((questions.filter(q => q.isCorrect).length / questions.length) * 100))}
                </div>
                <div className="text-lg font-game text-roblox-purple-600">
                  {questions.filter(q => q.isCorrect).length} out of {questions.length} correct
                </div>
              </div>

              {/* Question Review */}
              <div className="bg-white border-4 border-roblox-blue-200 rounded-2xl p-6">
                <h3 className="text-xl font-bold-game text-roblox-blue-700 mb-4">📊 Question Review 📊</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {questions.map((question, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-xl border-2 ${
                        question.isCorrect
                          ? 'bg-roblox-green-50 border-roblox-green-300'
                          : 'bg-roblox-red-50 border-roblox-red-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-game text-sm">
                          Q{index + 1}: {question.question_text.substring(0, 50)}...
                        </span>
                        <div className="flex items-center">
                          {question.isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-roblox-green-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-roblox-red-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={onClose}
                className="w-full font-bold-game bg-gradient-to-r from-roblox-blue-400 to-roblox-purple-500"
                size="lg"
                glow={true}
              >
                <Star className="w-6 h-6 mr-2" />
                🎯 Continue Learning! 🎯
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}