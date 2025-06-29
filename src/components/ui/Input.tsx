import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  helper?: string
}

export function Input({ label, error, className = '', icon, helper, ...props }: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
            {icon}
          </div>
        )}
        <input
          className={`block w-full ${icon ? 'pl-10' : 'px-3'} py-3 text-base border-2 border-neutral-200 rounded-xl shadow-soft focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-smooth placeholder-neutral-400 ${
            error ? 'border-error-400 focus:border-error-500 focus:ring-error-500 bg-error-50' : 'bg-white hover:border-neutral-300'
          } ${className}`}
          {...props}
        />
      </div>
      {helper && !error && (
        <p className="text-sm text-neutral-500">{helper}</p>
      )}
      {error && (
        <p className="text-sm text-error-600 animate-slide-up">{error}</p>
      )}
    </div>
  )
}