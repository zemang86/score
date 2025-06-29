import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  fun?: boolean
  icon?: React.ReactNode
}

export function Input({ label, error, className = '', fun = false, icon, ...props }: InputProps) {
  const funClasses = fun 
    ? 'border-4 border-roblox-blue-300 focus:border-roblox-blue-500 focus:ring-4 focus:ring-roblox-blue-200 rounded-2xl shadow-roblox bg-gradient-to-r from-white to-roblox-blue-50 hover:shadow-roblox-hover transition-all duration-300'
    : 'border-2 border-gray-300 focus:border-roblox-blue-500 focus:ring-2 focus:ring-roblox-blue-200 rounded-xl shadow-md'

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-bold-game text-roblox-blue-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-roblox-blue-500">
            {icon}
          </div>
        )}
        <input
          className={`block w-full ${icon ? 'pl-12' : 'px-4'} py-3 text-base font-game placeholder-roblox-blue-400 shadow-sm focus:outline-none transition-all duration-300 ${
            error ? 'border-roblox-red-500 focus:border-roblox-red-500 focus:ring-roblox-red-200 bg-roblox-red-50 animate-shake' : funClasses
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-roblox-red-600 font-game font-bold animate-wiggle">⚠️ {error}</p>
      )}
    </div>
  )
}