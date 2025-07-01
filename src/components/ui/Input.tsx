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
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          className={`block w-full ${icon ? 'pl-10' : 'px-3'} py-3 text-base border-2 border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-slate-400 ${
            error ? 'border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50' : 'bg-white hover:border-slate-300'
          } ${className}`}
          {...props}
        />
      </div>
      {helper && !error && (
        <p className="text-sm text-slate-500">{helper}</p>
      )}
      {error && (
        <p className="text-sm text-red-600 animate-slide-up">{error}</p>
      )}
    </div>
  )
}