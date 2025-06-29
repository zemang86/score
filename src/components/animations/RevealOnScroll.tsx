import React, { useEffect, useRef, useState } from 'react'

interface RevealOnScrollProps {
  children: React.ReactNode
  animationType?: 'fade-in' | 'slide-up' | 'slide-left' | 'slide-right' | 'scale-in' | 'bounce-in'
  delay?: number
  threshold?: number
  className?: string
}

export function RevealOnScroll({ 
  children, 
  animationType = 'fade-in', 
  delay = 0, 
  threshold = 0.1,
  className = ''
}: RevealOnScrollProps) {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true)
          }, delay)
          observer.unobserve(entry.target)
        }
      },
      {
        threshold,
        rootMargin: '50px 0px -50px 0px'
      }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current)
      }
    }
  }, [delay, threshold])

  const getAnimationClass = () => {
    const baseClass = 'transition-all duration-700 ease-out'
    
    if (!isVisible) {
      switch (animationType) {
        case 'fade-in':
          return `${baseClass} opacity-0`
        case 'slide-up':
          return `${baseClass} opacity-0 translate-y-8`
        case 'slide-left':
          return `${baseClass} opacity-0 translate-x-8`
        case 'slide-right':
          return `${baseClass} opacity-0 -translate-x-8`
        case 'scale-in':
          return `${baseClass} opacity-0 scale-95`
        case 'bounce-in':
          return `${baseClass} opacity-0 scale-90`
        default:
          return `${baseClass} opacity-0`
      }
    }

    switch (animationType) {
      case 'fade-in':
        return `${baseClass} opacity-100`
      case 'slide-up':
        return `${baseClass} opacity-100 translate-y-0`
      case 'slide-left':
        return `${baseClass} opacity-100 translate-x-0`
      case 'slide-right':
        return `${baseClass} opacity-100 translate-x-0`
      case 'scale-in':
        return `${baseClass} opacity-100 scale-100`
      case 'bounce-in':
        return `${baseClass} opacity-100 scale-100`
      default:
        return `${baseClass} opacity-100`
    }
  }

  return (
    <div 
      ref={elementRef} 
      className={`${getAnimationClass()} ${className}`}
    >
      {children}
    </div>
  )
}