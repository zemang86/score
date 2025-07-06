import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Trophy, Users, BookOpen, Target, Award, TrendingUp, ArrowRight, Play, CheckCircle, XCircle, DollarSign, Crown, Shield, Sparkles, Heart, Zap, Monitor, Smartphone, Rocket, Brain, Globe, ChevronDown, Lightbulb, Gamepad2, BarChart3, Clock, Gift } from 'lucide-react'
import { Button } from '../ui/Button'
import { RevealOnScroll } from '../animations/RevealOnScroll'
import { EdventureLogo } from '../ui/EdventureLogo'
import { supabase } from '../../lib/supabase'
import { PRODUCTS } from '../../stripe-config'
import { useTranslation } from 'react-i18next'

export function LandingPage() {
  const navigate = useNavigate()
  const observerRef = useRef<IntersectionObserver | null>(null)
  const [questionCount, setQuestionCount] = useState<number | null>(null)
  const [subjectCount, setSubjectCount] = useState<number | null>(null)
  const [levelCount, setLevelCount] = useState<number | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const { t, i18n } = useTranslation()

  // Optimized data fetching with immediate fallbacks
  const fetchQuestionStats = useCallback(async () => {
    // Set fallback values immediately for faster perceived loading
    setQuestionCount(10000) // Show default immediately
    setSubjectCount(5)
    setLevelCount(11)
    setStatsLoading(false) // Stop loading animation immediately
    
    // Fetch real data in background
    try {
      const { count: questionCount, error: questionError } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })

      if (!questionError && questionCount !== null) {
        setQuestionCount(questionCount)
      }
    } catch (error) {
      console.error('Error fetching question stats:', error)
      // Keep fallback values on error
    }
  }, [])

  // Optimized scroll observer with better performance
  useEffect(() => {
    // Simplified intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            // Unobserve after animation to improve performance
            observerRef.current?.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.05, // Reduced threshold for faster triggering
        rootMargin: '100px 0px -50px 0px' // Larger root margin for earlier triggering
      }
    )

    // Delayed observer setup to not block initial render
    const setupObserver = () => {
      const animatedElements = document.querySelectorAll('.scroll-fade-in, .scroll-slide-left, .scroll-slide-right, .scroll-scale-in, .scroll-bounce-in')
      animatedElements.forEach((el) => {
        observerRef.current?.observe(el)
      })
    }

    // Setup observer after a short delay to prioritize critical rendering
    const timeoutId = setTimeout(setupObserver, 100)

    // Fetch stats immediately
    fetchQuestionStats()

    return () => {
      clearTimeout(timeoutId)
      observerRef.current?.disconnect()
    }
  }, [fetchQuestionStats])

  const handleGetStarted = useCallback(() => {
    console.log('🚀 Navigating to auth page...')
    navigate('/auth')
  }, [navigate])

  const handleWatchDemo = useCallback(() => {
    const featuresSection = document.getElementById('features-section')
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  const changeLanguage = useCallback((lng: string) => {
    i18n.changeLanguage(lng)
  }, [i18n])

  // Memoized number formatting
  const formatNumber = useMemo(() => {
    return (num: number | null): string => {
      if (num === null) return '10,000+' // Fallback value
      return num.toLocaleString()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Rest of the JSX code... */}
    </div>
  )
}