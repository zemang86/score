export interface Student {
  id: string
  name: string
  level: string
  school: string
  xp: number
}

export interface ExamQuestion {
  id: string
  question_text: string
  type: string
  options: string[]
  userAnswer?: string | string[]
  isCorrect?: boolean
  correct_answer?: string
  explanation?: string
}

export interface MatchingPair {
  left: string
  right: string
  matched?: boolean
}

export type ExamMode = 'Easy' | 'Medium' | 'Full'
export type Subject = 'Bahasa Melayu' | 'English' | 'Mathematics' | 'Science' | 'History'
export type ExamStep = 'setup' | 'exam' | 'results'

export interface ExamModalProps {
  isOpen: boolean
  onClose: () => void
  student: Student
  onExamComplete: (score: number, totalQuestions: number) => void
}