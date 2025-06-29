import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'warning' | 'error' | 'fun'
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
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-smooth focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover-lift'
  
  const variantClasses = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 shadow-fun',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-500 shadow-success',
    outline: 'border-2 border-primary-300 bg-white text-primary-700 hover:bg-primary-50 hover:border-primary-400 focus:ring-primary-500 shadow-soft',
    ghost: 'text-primary-700 hover:bg-primary-100 focus:ring-primary-500',
    success: 'bg-success-500 text-white hover:bg-success-600 focus:ring-success-500 shadow-success',
    warning: 'bg-warning-500 text-white hover:bg-warning-600 focus:ring-warning-500 shadow-warning',
    error: 'bg-error-500 text-white hover:bg-error-600 focus:ring-error-500 shadow-error',
    fun: 'bg-gradient-to-r from-primary-400 to-secondary-400 text-white hover:from-primary-500 hover:to-secondary-500 focus:ring-primary-500 shadow-fun'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm rounded-xl',
    md: 'px-4 py-2.5 text-base rounded-xl',
    lg: 'px-6 py-3 text-lg rounded-2xl',
    xl: 'px-8 py-4 text-xl rounded-2xl'
  }

  const isDisabled = disabled || loading

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
      )}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  )
}