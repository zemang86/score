import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'warning' | 'error' | 'gradient-primary' | 'white'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children: React.ReactNode
  icon?: React.ReactNode
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  icon,
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95'
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-lg hover:shadow-xl',
    secondary: 'bg-slate-600 text-white hover:bg-slate-700 focus:ring-slate-500 shadow-lg hover:shadow-xl',
    outline: 'border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 focus:ring-slate-500 shadow-sm hover:shadow-md',
    ghost: 'text-slate-700 hover:bg-slate-100 focus:ring-slate-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-lg hover:shadow-xl',
    warning: 'bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500 shadow-lg hover:shadow-xl',
    error: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-lg hover:shadow-xl',
    'gradient-primary': 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 focus:ring-indigo-500 shadow-lg hover:shadow-xl',
    'white': 'bg-white text-purple-600 hover:bg-purple-50 focus:ring-purple-500 shadow-lg hover:shadow-xl'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-xs sm:text-sm rounded-lg',
    md: 'px-4 py-2.5 text-sm sm:text-base rounded-xl',
    lg: 'px-6 py-3 text-base sm:text-lg rounded-xl sm:rounded-2xl',
    xl: 'px-8 py-4 text-lg sm:text-xl rounded-xl sm:rounded-2xl'
  }

  const isDisabled = disabled || loading

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent mr-2 sm:mr-3"></div>
      )}
      {icon && !loading && <span className="mr-2 sm:mr-3">{icon}</span>}
      {children}
    </button>
  )
}