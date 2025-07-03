import React from 'react'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'card' | 'avatar' | 'button' | 'stat'
  count?: number
}

export function Skeleton({ className = '', variant = 'text', count = 1 }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%]'
  
  const variantClasses = {
    text: 'h-4 rounded-md',
    card: 'h-32 rounded-xl',
    avatar: 'h-12 w-12 rounded-full',
    button: 'h-10 rounded-lg',
    stat: 'h-16 rounded-lg'
  }

  const skeletonClass = `${baseClasses} ${variantClasses[variant]} ${className}`

  if (count === 1) {
    return <div className={skeletonClass} />
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={skeletonClass} />
      ))}
    </div>
  )
}

// Specific skeleton components for common use cases
export function StudentCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center space-x-3 mb-4">
        <Skeleton variant="avatar" />
        <div className="flex-1">
          <Skeleton className="w-24 h-5 mb-2" />
          <Skeleton className="w-16 h-4" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton variant="button" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton variant="stat" />
          <Skeleton variant="stat" />
        </div>
      </div>
    </div>
  )
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg p-3 shadow-sm border border-slate-200">
          <div className="flex items-center">
            <Skeleton className="w-8 h-8 rounded-lg mr-2" />
            <div className="flex-1">
              <Skeleton className="w-12 h-3 mb-1" />
              <Skeleton className="w-8 h-5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function QuickActionsSkeleton() {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-white/30 p-4 shadow-md">
      <div className="flex items-center mb-3">
        <Skeleton className="w-6 h-6 rounded-lg mr-2" />
        <Skeleton className="w-24 h-5" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} variant="button" className="w-full" />
        ))}
      </div>
    </div>
  )
}