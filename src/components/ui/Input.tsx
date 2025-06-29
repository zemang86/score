import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export function Input({ label, error, className = '', icon, ...props }: InputProps) {
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
          className={`block w-full ${icon ? 'pl-10' : 'px-3'} py-2.5 text-sm border border-neutral-300 rounded-xl shadow-soft focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-smooth placeholder-neutral-400 ${
            error ? 'border-error-500 focus:border-error-500 focus:ring-error-500 bg-error-50' : 'bg-white hover:border-neutral-400'
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-error-600 animate-slide-up">{error}</p>
      )}
    </div>
  )
}