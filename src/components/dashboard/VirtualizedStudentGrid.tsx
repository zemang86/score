import React, { useMemo, useCallback, useState, useEffect } from 'react'
import { VirtualGrid } from '../ui/VirtualScrolling'
import { StudentCard } from './StudentCard'
import { Student } from '../../lib/supabase'

interface VirtualizedStudentGridProps {
  students: Student[]
  onExamComplete: () => void
  onStudentUpdated: () => void
  onOpenExamModal: (student: Student) => void
  onOpenEditModal: (student: Student) => void
  onOpenProgressModal: (student: Student) => void
  containerHeight?: number
  className?: string
}

export function VirtualizedStudentGrid({
  students,
  onExamComplete,
  onStudentUpdated,
  onOpenExamModal,
  onOpenEditModal,
  onOpenProgressModal,
  containerHeight = 600,
  className = ''
}: VirtualizedStudentGridProps) {
  // Responsive grid calculation
  const [itemsPerRow, setItemsPerRow] = useState(2)
  const [containerWidth, setContainerWidth] = useState(0)

  // Calculate responsive layout
  useEffect(() => {
    const calculateLayout = () => {
      const width = window.innerWidth
      if (width < 768) {
        setItemsPerRow(1) // Mobile: 1 column
      } else if (width < 1024) {
        setItemsPerRow(2) // Tablet: 2 columns
      } else if (width < 1280) {
        setItemsPerRow(2) // Small desktop: 2 columns
      } else {
        setItemsPerRow(3) // Large desktop: 3 columns
      }
      setContainerWidth(width)
    }

    calculateLayout()
    window.addEventListener('resize', calculateLayout)
    return () => window.removeEventListener('resize', calculateLayout)
  }, [])

  // Memoized render function for student cards
  const renderStudent = useCallback((student: Student, index: number) => {
    return (
      <div className="p-2">
        <StudentCard
          key={student.id}
          student={student}
          onExamComplete={onExamComplete}
          onStudentUpdated={onStudentUpdated}
          onOpenExamModal={onOpenExamModal}
          onOpenEditModal={onOpenEditModal}
          onOpenProgressModal={onOpenProgressModal}
        />
      </div>
    )
  }, [onExamComplete, onStudentUpdated, onOpenExamModal, onOpenEditModal, onOpenProgressModal])

  // Memoized key function for better performance
  const getStudentKey = useCallback((student: Student, index: number) => {
    return student.id
  }, [])

  // Handle scroll for performance monitoring
  const handleScroll = useCallback((scrollTop: number) => {
    // Optional: Add scroll position tracking for analytics
    // console.log('Virtual grid scroll position:', scrollTop)
  }, [])

  // If no students, show empty state
  if (students.length === 0) {
    return (
      <div className={`${className}`} style={{ height: containerHeight }}>
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-center py-6">
            <div className="bg-indigo-100 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-indigo-600 mb-2">No students yet!</h3>
            <p className="text-slate-600 text-sm mb-3">
              Start by adding your first student to begin their learning journey.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Calculate optimal heights based on device
  const cardHeight = 180 // Height of StudentCard component
  const gap = 16 // Gap between cards

  return (
    <div className={className}>
      <VirtualGrid
        items={students}
        itemHeight={cardHeight}
        itemsPerRow={itemsPerRow}
        containerHeight={containerHeight}
        gap={gap}
        renderItem={renderStudent}
        getItemKey={getStudentKey}
        onScroll={handleScroll}
        overscan={2} // Render 2 extra rows for smooth scrolling
        className="rounded-lg"
      />
    </div>
  )
}

// Performance monitoring component
export function StudentGridPerformanceMonitor({ 
  studentCount, 
  isVirtualized 
}: { 
  studentCount: number
  isVirtualized: boolean 
}) {
  const [renderTime, setRenderTime] = useState<number>(0)

  useEffect(() => {
    const startTime = performance.now()
    
    // Measure render time
    const timeoutId = setTimeout(() => {
      const endTime = performance.now()
      setRenderTime(endTime - startTime)
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [studentCount, isVirtualized])

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-2 text-xs shadow-lg z-50">
      <div className="text-gray-600">
        <div>👥 Students: {studentCount}</div>
        <div>⚡ Virtual: {isVirtualized ? 'Yes' : 'No'}</div>
        <div>⏱️ Render: {renderTime.toFixed(1)}ms</div>
        <div className={`font-bold ${isVirtualized ? 'text-green-600' : 'text-orange-600'}`}>
          {isVirtualized ? '🚀 Optimized' : '🐌 Standard'}
        </div>
      </div>
    </div>
  )
}

// Hook for automatic virtualization based on student count
export function useAutoVirtualization(studentCount: number, threshold: number = 20) {
  const shouldVirtualize = useMemo(() => {
    return studentCount >= threshold
  }, [studentCount, threshold])

  return {
    shouldVirtualize,
    containerHeight: shouldVirtualize ? 600 : 'auto'
  }
}