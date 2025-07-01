import React from 'react'
import { Zap, BookOpen, Star } from 'lucide-react'

interface EdventureLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'full' | 'icon' | 'text'
  className?: string
}

export function EdventureLogo({ size = 'md', variant = 'full', className = '' }: EdventureLogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl'
  }

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-16 h-16'
  }

  if (variant === 'icon') {
    return (
      <div className={`relative ${className}`}>
        <div className="relative">
          {/* Unique geometric logo design */}
          <div className={`${iconSizes[size]} relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg transform rotate-12 flex items-center justify-center`}>
            <div className="absolute inset-1 bg-white rounded-xl flex items-center justify-center">
              <div className="relative">
                <BookOpen className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : size === 'lg' ? 'w-5 h-5' : 'w-8 h-8'} text-indigo-600`} />
                <Star className={`absolute -top-1 -right-1 ${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4'} text-amber-400 fill-current`} />
              </div>
            </div>
          </div>
          <Zap className={`absolute -bottom-1 -right-1 ${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : size === 'lg' ? 'w-5 h-5' : 'w-6 h-6'} text-amber-500 fill-current`} />
        </div>
      </div>
    )
  }

  if (variant === 'text') {
    return (
      <div className={`font-bold ${sizeClasses[size]} ${className}`}>
        <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Edventure
        </span>
        <span className="text-amber-500">+</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <EdventureLogo size={size} variant="icon" />
      <EdventureLogo size={size} variant="text" />
    </div>
  )
}