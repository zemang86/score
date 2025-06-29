import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'fun' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children: React.ReactNode
  glow?: boolean
  bounce?: boolean
  pulse?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  glow = false,
  bounce = false,
  pulse = false,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-bold-game transition-all duration-300 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 hover:scale-105'
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-roblox-blue-400 to-roblox-blue-600 text-white hover:from-roblox-blue-500 hover:to-roblox-blue-700 focus:ring-roblox-blue-300 shadow-roblox hover:shadow-roblox-hover border-4 border-roblox-blue-700',
    secondary: 'bg-gradient-to-r from-roblox-purple-400 to-roblox-purple-600 text-white hover:from-roblox-purple-500 hover:to-roblox-purple-700 focus:ring-roblox-purple-300 shadow-roblox hover:shadow-roblox-hover border-4 border-roblox-purple-700',
    outline: 'border-4 border-roblox-blue-400 bg-white text-roblox-blue-600 hover:bg-roblox-blue-50 hover:border-roblox-blue-500 focus:ring-roblox-blue-300 shadow-roblox hover:shadow-roblox-hover',
    ghost: 'text-roblox-blue-600 hover:bg-roblox-blue-100 focus:ring-roblox-blue-300 rounded-2xl hover:shadow-md',
    fun: 'bg-gradient-to-r from-roblox-yellow-400 to-roblox-orange-400 text-roblox-blue-800 hover:from-roblox-yellow-500 hover:to-roblox-orange-500 focus:ring-roblox-yellow-300 shadow-roblox hover:shadow-roblox-hover border-4 border-roblox-orange-600',
    danger: 'bg-gradient-to-r from-roblox-red-400 to-roblox-red-600 text-white hover:from-roblox-red-500 hover:to-roblox-red-700 focus:ring-roblox-red-300 shadow-roblox hover:shadow-roblox-hover border-4 border-roblox-red-700',
    success: 'bg-gradient-to-r from-roblox-green-400 to-roblox-green-600 text-white hover:from-roblox-green-500 hover:to-roblox-green-700 focus:ring-roblox-green-300 shadow-roblox hover:shadow-roblox-hover border-4 border-roblox-green-700'
  }
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-xl',
    md: 'px-6 py-3 text-base rounded-2xl',
    lg: 'px-8 py-4 text-lg rounded-2xl',
    xl: 'px-10 py-5 text-xl rounded-3xl'
  }

  const glowClass = glow ? 'shadow-neon-blue animate-glow' : ''
  const bounceClass = bounce ? 'animate-bounce-gentle' : ''
  const pulseClass = pulse ? 'animate-pulse' : ''

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${glowClass} ${bounceClass} ${pulseClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}