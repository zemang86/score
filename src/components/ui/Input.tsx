import React, { forwardRef } from 'react'
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  success?: string
  hint?: string
  loading?: boolean
  icon?: React.ReactNode
  fullWidth?: boolean
  variant?: 'default' | 'filled' | 'outlined'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  success,
  hint,
  loading = false,
  icon,
  fullWidth = false,
  variant = 'default',
  className = '',
  type = 'text',
  disabled,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  const baseClasses = 'w-full px-4 py-3 text-sm transition-all duration-300 focus:outline-none placeholder:text-slate-400'
  
  const variantClasses = {
    default: 'border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
    filled: 'border-0 rounded-xl bg-slate-100 focus:ring-2 focus:ring-indigo-500 focus:bg-white',
    outlined: 'border-2 border-slate-200 rounded-xl bg-transparent focus:border-indigo-500'
  }

  const stateClasses = error 
    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
    : success 
    ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
    : ''

  const isDisabled = disabled || loading

  return (
    <div className={`${fullWidth ? 'w-full' : ''} space-y-2`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Leading Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 z-10">
            {icon}
          </div>
        )}

        {/* Input Field */}
        <input
          ref={ref}
          type={inputType}
          className={`
            ${baseClasses}
            ${variantClasses[variant]}
            ${stateClasses}
            ${icon ? 'pl-10' : ''}
            ${isPassword ? 'pr-12' : ''}
            ${isDisabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'hover:border-slate-400'}
            ${className}
          `}
          disabled={isDisabled}
          {...props}
        />

        {/* Password Toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors z-10"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-300 border-t-indigo-600"></div>
          </div>
        )}

        {/* Success/Error Icon */}
        {(success || error) && !loading && (
          <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isPassword ? 'right-12' : 'right-3'}`}>
            {success && <CheckCircle className="w-5 h-5 text-green-500" />}
            {error && <AlertCircle className="w-5 h-5 text-red-500" />}
          </div>
        )}
      </div>

      {/* Helper Text */}
      {(hint || error || success) && (
        <div className="mt-2 text-sm">
          {error && (
            <p className="text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
              {error}
            </p>
          )}
          {success && !error && (
            <p className="text-green-600 flex items-center">
              <CheckCircle className="w-4 h-4 mr-1 flex-shrink-0" />
              {success}
            </p>
          )}
          {hint && !error && !success && (
            <p className="text-slate-500">{hint}</p>
          )}
        </div>
      )}
    </div>
  )
})