import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'warning' | 'error' | 'gradient-primary' | 'white'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children: React.ReactNode
  icon?: React.ReactNode
  loading?: boolean
  loadingText?: string
  fullWidth?: boolean
  success?: boolean
  pulse?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  icon,
  loading = false,
  loadingText = 'Loading...',
  fullWidth = false,
  success = false,
  pulse = false,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden'
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-lg hover:shadow-xl active:scale-95',
    secondary: 'bg-slate-600 text-white hover:bg-slate-700 focus:ring-slate-500 shadow-lg hover:shadow-xl active:scale-95',
    outline: 'border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 focus:ring-slate-500 shadow-sm hover:shadow-md active:scale-95',
    ghost: 'text-slate-700 hover:bg-slate-100 focus:ring-slate-500 active:scale-95',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-lg hover:shadow-xl active:scale-95',
    warning: 'bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500 shadow-lg hover:shadow-xl active:scale-95',
    error: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-lg hover:shadow-xl active:scale-95',
    'gradient-primary': 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 focus:ring-indigo-500 shadow-lg hover:shadow-xl active:scale-95',
    'white': 'bg-white text-purple-600 hover:bg-purple-50 focus:ring-purple-500 shadow-lg hover:shadow-xl active:scale-95 border border-purple-200'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-xs sm:text-sm rounded-lg',
    md: 'px-4 py-2.5 text-sm sm:text-base rounded-xl',
    lg: 'px-6 py-3 text-base sm:text-lg rounded-xl sm:rounded-2xl',
    xl: 'px-8 py-4 text-lg sm:text-xl rounded-xl sm:rounded-2xl'
  }

  const isDisabled = disabled || loading

  // Success state overrides
  const displayVariant = success ? 'success' : variant
  const displayIcon = success ? (
    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ) : icon

  const displayText = success ? 'Success!' : (loading ? loadingText : children)

  return (
    <button
      className={`
        ${baseClasses} 
        ${variantClasses[displayVariant]} 
        ${sizeClasses[size]} 
        ${fullWidth ? 'w-full' : ''} 
        ${pulse ? 'animate-pulse' : ''} 
        ${className}
      `}
      disabled={isDisabled}
      aria-label={loading ? loadingText : undefined}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent mr-2 sm:mr-3"></div>
      )}
      
      {/* Icon */}
      {displayIcon && !loading && (
        <span className={`${displayText ? 'mr-2 sm:mr-3' : ''} flex-shrink-0`}>
          {displayIcon}
        </span>
      )}
      
      {/* Text content */}
      <span className="transition-all duration-200">
        {displayText}
      </span>
      
      {/* Success ripple effect */}
      {success && (
        <div className="absolute inset-0 bg-green-400 opacity-25 animate-ping rounded-xl"></div>
      )}
      
      {/* Hover shimmer effect for gradient buttons */}
      {variant === 'gradient-primary' && !loading && !disabled && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
      )}
    </button>
  )
}