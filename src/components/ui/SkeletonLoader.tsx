import React from 'react'

// Base skeleton component
export function Skeleton({ className = '', ...props }: { className?: string }) {
  return (
    <div 
      className={`animate-pulse bg-slate-200 rounded ${className}`} 
      {...props} 
    />
  )
}

// Student Card Skeleton - matches your StudentCard layout exactly
export function StudentCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 border-2 border-slate-200 shadow-lg">
      {/* Header skeleton */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <Skeleton className="w-10 h-10 rounded-xl mr-3" />
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
      
      {/* Content skeleton */}
      <div className="space-y-3">
        {/* School and level row */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-16 rounded-lg" />
        </div>
        
        {/* XP Progress */}
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
          <div className="flex items-center">
            <Skeleton className="w-6 h-6 rounded-lg mr-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex space-x-2 pt-1">
          <Skeleton className="flex-1 h-10 rounded-lg" />
          <Skeleton className="flex-1 h-10 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

// Dashboard Stats Skeleton
export function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-lg p-2.5 sm:p-3 shadow-sm border border-slate-200">
      <div className="flex items-center">
        <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg mr-2" />
        <div className="flex-1">
          <Skeleton className="h-3 w-12 mb-1" />
          <div className="flex items-baseline">
            <Skeleton className="h-5 w-8 mr-1.5" />
            <Skeleton className="h-3 w-10" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Welcome Section Skeleton
export function WelcomeSkeleton() {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30 shadow-md">
      <div className="flex flex-col sm:flex-row items-center justify-between">
        <div className="flex flex-col sm:flex-row items-center mb-3 sm:mb-0">
          <Skeleton className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg mb-2 sm:mb-0 sm:mr-3" />
          <div className="text-center sm:text-left">
            <Skeleton className="h-6 w-48 mb-1" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="hidden lg:block">
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

// Full Dashboard Skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome section skeleton */}
      <WelcomeSkeleton />
      
      {/* Plan section skeleton */}
      <div className="bg-slate-100 rounded-xl p-3 sm:p-4 border-2 border-slate-200 shadow-md">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="flex items-center mb-3 lg:mb-0">
            <Skeleton className="w-10 h-10 rounded-lg mr-3" />
            <div>
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
          <div className="flex gap-3">
            <Skeleton className="w-20 h-16 rounded-lg" />
            <Skeleton className="w-20 h-16 rounded-lg" />
            <Skeleton className="w-20 h-16 rounded-lg" />
          </div>
        </div>
      </div>
      
      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
      
      {/* Main content grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Students section skeleton */}
        <div className="lg:col-span-2">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-white/30 shadow-md">
            <div className="p-3 sm:p-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Skeleton className="w-8 h-8 rounded-lg mr-3" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-9 w-20 rounded-lg" />
              </div>
            </div>
            
            <div className="p-3 sm:p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {[...Array(4)].map((_, i) => (
                  <StudentCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Sidebar skeleton */}
        <div className="space-y-3 sm:space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white/90 backdrop-blur-sm rounded-xl border border-white/30 p-3 sm:p-4 shadow-md">
              <div className="flex items-center mb-3">
                <Skeleton className="w-8 h-8 rounded-lg mr-2" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="space-y-2">
                {[...Array(3)].map((_, j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Shimmer animation keyframes (add to your global CSS)
export const skeletonAnimationCSS = `
@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.animate-shimmer {
  animation: shimmer 2s linear infinite;
  background: linear-gradient(110deg, #f1f5f9 8%, #e2e8f0 18%, #f1f5f9 33%);
  background-size: 200px 100%;
}
`