import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Trophy, Users, BookOpen, Target, Award, TrendingUp, ArrowRight, Play, CheckCircle, XCircle, DollarSign, Crown, Shield, Sparkles, Heart, Zap, Monitor, Smartphone, Rocket, Brain, Globe, ChevronDown, Lightbulb, Gamepad2, BarChart3, Clock, Gift } from 'lucide-react'
import { Button } from '../ui/Button'
import { RevealOnScroll } from '../animations/RevealOnScroll'
import { EdventureLogo } from '../ui/EdventureLogo'
import { supabase } from '../../lib/supabase'
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
      {/* Floating decorative elements - Simplified for performance */}
      <div className="fixed top-20 right-10 animate-float z-10 opacity-20">
        <Star className="w-8 h-8 text-indigo-400" />
      </div>
      <div className="fixed top-40 right-32 animate-bounce-gentle z-10 opacity-20">
        <Sparkles className="w-6 h-6 text-purple-400" />
      </div>

      {/* Navigation - Load immediately without animation delay */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <RevealOnScroll animationType="slide-right" delay={0}>
              <EdventureLogo size="md" className="sm:scale-110" />
            </RevealOnScroll>
            
            <RevealOnScroll animationType="slide-left" delay={0}>
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Language Switcher - Compact for Mobile */}
                <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-lg border border-slate-200/50 p-1">
                  <button 
                    onClick={() => changeLanguage('en')} 
                    className={`px-2 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                      i18n.language === 'en' 
                        ? 'bg-indigo-500 text-white shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    EN
                  </button>
                  <button 
                    onClick={() => changeLanguage('ms')} 
                    className={`px-2 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                      i18n.language === 'ms' 
                        ? 'bg-indigo-500 text-white shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    MS
                  </button>
                </div>
                
                {/* Get Started Button - Always Visible */}
                <button 
                  onClick={handleGetStarted} 
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <span className="hidden sm:inline">{t('nav.getStarted')}</span>
                  <span className="sm:hidden">Start</span>
                </button>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </nav>

      {/* Hero Section - Faster loading */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        {/* Background Elements - Simplified */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-r from-indigo-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse-soft"></div>
          <div className="absolute bottom-1/4 right-1/4 w-56 sm:w-80 h-56 sm:h-80 bg-gradient-to-r from-pink-400/30 to-rose-400/30 rounded-full blur-3xl animate-float"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Content - Load immediately */}
            <div className="text-center lg:text-left">
              <RevealOnScroll animationType="scale-in" delay={0}>
                <div className="mb-8">
                  {/* Premium Badge */}
                  <div className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 rounded-full text-indigo-700 text-xs sm:text-sm font-semibold mb-6 sm:mb-8 shadow-lg border border-white/50 backdrop-blur-sm">
                    <Rocket className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {t('hero.badge')}
                    </span>
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3 text-amber-500" />
                  </div>
                  
                  {/* Main Headline */}
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 sm:mb-8 leading-none tracking-tight">
                    {t('hero.title')}
                    <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">
                      {t('hero.titleHighlight')}
                    </span>
                  </h1>
                  
                  {/* Subtitle */}
                  <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 mb-8 sm:mb-10 leading-relaxed max-w-3xl mx-auto lg:mx-0 font-light">
                    {t('hero.subtitle')}
                  </p>
                </div>
              </RevealOnScroll>
              
              {/* Action Buttons - Reduced delay */}
              <RevealOnScroll animationType="slide-up" delay={100}>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start items-center mb-10 sm:mb-12">
                  <Button 
                    size="lg" 
                    onClick={handleGetStarted}
                    variant="gradient-primary"
                    icon={<Rocket className="w-5 h-5 sm:w-6 sm:h-6" />}
                  >
                    <span className="flex items-center">
                      {t('hero.startButton')}
                      <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-3" />
                    </span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={handleWatchDemo}
                    icon={<Play className="w-5 h-5 sm:w-6 sm:h-6" />}
                  >
                    {t('hero.watchDemo')}
                  </Button>
                </div>
              </RevealOnScroll>
              
              {/* Stats Cards - Show immediately with fast animations */}
              <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center lg:text-left">
                <RevealOnScroll animationType="slide-up" delay={150}>
                  <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-3xl p-3 sm:p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="text-xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                      {formatNumber(questionCount)}
                    </div>
                    <div className="text-slate-600 font-semibold text-xs sm:text-sm">{t('stats.questions')}</div>
                  </div>
                </RevealOnScroll>
                <RevealOnScroll animationType="slide-up" delay={200}>
                  <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-3xl p-3 sm:p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="text-xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                      {subjectCount || 5}
                    </div>
                    <div className="text-slate-600 font-semibold text-xs sm:text-sm">{t('stats.subjects')}</div>
                  </div>
                </RevealOnScroll>
                <RevealOnScroll animationType="slide-up" delay={250}>
                  <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-3xl p-3 sm:p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="text-xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                      {levelCount || 11}
                    </div>
                    <div className="text-slate-600 font-semibold text-xs sm:text-sm">{t('stats.levels')}</div>
                  </div>
                </RevealOnScroll>
              </div>
            </div>

            {/* Right Visual - Dashboard Preview - Faster loading */}
            <div className="relative mt-12 lg:mt-0">
              <RevealOnScroll animationType="scale-in" delay={200}>
                <div className="relative">
                  {/* Main Dashboard Mockup */}
                  <div className="bg-gradient-to-br from-white via-slate-50 to-indigo-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl sm:shadow-3xl border border-white/50 backdrop-blur-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
                      <div className="flex items-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl sm:rounded-2xl flex items-center justify-center mr-2 sm:mr-3 lg:mr-4">
                          <Crown className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm sm:text-base lg:text-lg">Welcome back, Sarah!</h3>
                          <p className="text-slate-500 text-xs sm:text-sm">Ready for today's adventure?</p>
                        </div>
                      </div>
                      <div className="flex space-x-1 sm:space-x-2">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-400 rounded-full"></div>
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full"></div>
                      </div>
                    </div>

                    {/* Dashboard Content */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
                      {/* Student Card */}
                      <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border border-slate-100">
                        <div className="flex items-center mb-3 sm:mb-4">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-pink-400 to-rose-400 rounded-lg sm:rounded-xl flex items-center justify-center mr-2 sm:mr-3">
                            <Users className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-800 text-xs sm:text-sm lg:text-base">Ahmad</h4>
                            <p className="text-slate-500 text-xs">Tingkatan 3</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-slate-600">XP Progress</span>
                            <span className="font-semibold text-indigo-600">850 XP</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 sm:h-2">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 sm:h-2 rounded-full w-4/5"></div>
                          </div>
                        </div>
                      </div>

                      {/* Achievement Card */}
                      <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border border-slate-100">
                        <div className="text-center">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                          </div>
                          <h4 className="font-semibold text-slate-800 text-xs sm:text-sm lg:text-base mb-1">Perfect Score!</h4>
                          <p className="text-slate-500 text-xs">Mathematics Exam</p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Chart */}
                    <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border border-slate-100">
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h4 className="font-semibold text-slate-800 text-xs sm:text-sm lg:text-base">Weekly Progress</h4>
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">95%</div>
                      </div>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center">
                          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full mr-2 sm:mr-3"></div>
                          <div className="flex-1 bg-slate-200 rounded-full h-1.5 sm:h-2">
                            <div className="bg-gradient-to-r from-green-400 to-emerald-400 h-1.5 sm:h-2 rounded-full w-11/12"></div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-400 rounded-full mr-2 sm:mr-3"></div>
                          <div className="flex-1 bg-slate-200 rounded-full h-1.5 sm:h-2">
                            <div className="bg-gradient-to-r from-blue-400 to-indigo-400 h-1.5 sm:h-2 rounded-full w-4/5"></div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-400 rounded-full mr-2 sm:mr-3"></div>
                          <div className="flex-1 bg-slate-200 rounded-full h-1.5 sm:h-2">
                            <div className="bg-gradient-to-r from-purple-400 to-pink-400 h-1.5 sm:h-2 rounded-full w-3/4"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating Achievement Badges - Responsive */}
                  <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 lg:-top-6 lg:-right-6 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl flex items-center justify-center animate-bounce-gentle">
                    <Star className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                  </div>
                  <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 lg:-bottom-6 lg:-left-6 w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl flex items-center justify-center animate-float">
                    <Brain className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <div className="absolute top-1/2 -right-2 sm:-right-3 lg:-right-4 w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl flex items-center justify-center animate-pulse-soft">
                    <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7 text-white" />
                  </div>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-slate-400" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="py-20 sm:py-32 bg-gradient-to-br from-white via-slate-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll animationType="fade-in" delay={100}>
            <div className="text-center mb-12 sm:mb-20">
              <div className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full text-indigo-700 text-xs sm:text-sm font-semibold mb-6 sm:mb-8">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {t('features.title')}
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 sm:mb-8">
                {t('features.subtitle')}
                <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {t('features.subtitleHighlight')}
                </span>
              </h2>
              <p className="text-lg sm:text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
                {t('features.description')}
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10 auto-rows-fr">
            {[
              {
                icon: Gamepad2,
                title: "Gamified Learning Experience",
                description: "Earn XP points, unlock achievement badges, and celebrate milestones. Learning becomes an adventure, not a chore.",
                color: "from-indigo-500 to-purple-500",
                delay: 200,
                accent: "indigo"
              },
              {
                icon: BookOpen,
                title: "Comprehensive Question Bank",
                description: "Access thousands of past year questions across BM, BI, Mathematics, Science, and History for all levels.",
                color: "from-purple-500 to-pink-500",
                delay: 300,
                accent: "purple"
              },
              {
                icon: Target,
                title: "Adaptive Practice Modes",
                description: "Choose from Easy (10 MCQs), Medium (20-30 mixed), or Full Mode (complete papers) based on your child's readiness.",
                color: "from-pink-500 to-rose-500",
                delay: 400,
                accent: "pink"
              },
              {
                icon: BarChart3,
                title: "Advanced Progress Tracking",
                description: "Monitor your children's learning journey with detailed analytics, performance reports, and improvement insights.",
                color: "from-amber-500 to-orange-500",
                delay: 500,
                accent: "amber"
              },
              {
                icon: Users,
                title: "Family Dashboard",
                description: "Manage multiple children from one parent account. See everyone's progress at a glance and celebrate together.",
                color: "from-green-500 to-emerald-500",
                delay: 600,
                accent: "green"
              },
              {
                icon: Award,
                title: "Achievement System",
                description: "Unlock badges for milestones like \"First Perfect Score\", \"5-Day Streak\", and \"Subject Master\" to keep motivation high.",
                color: "from-blue-500 to-indigo-500",
                delay: 700,
                accent: "blue"
              }
            ].map((feature, index) => (
              <RevealOnScroll key={index} animationType="slide-up" delay={feature.delay}>
                <div className="group bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 p-6 sm:p-8 border border-white/50 hover:border-white/80 hover:scale-105 h-full flex flex-col">
                  <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0`}>
                    <feature.icon className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4 flex-shrink-0">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm sm:text-lg flex-grow">
                    {feature.description}
                  </p>
                  <div className={`mt-4 sm:mt-6 w-full h-1 bg-gradient-to-r ${feature.color} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0`}></div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section - REMOVED STEP NUMBERS */}
      <section className="py-20 sm:py-32 bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll animationType="fade-in" delay={100}>
            <div className="text-center mb-12 sm:mb-20">
              <div className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full text-indigo-700 text-xs sm:text-sm font-semibold mb-6 sm:mb-8">
                <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {t('howItWorks.title')}
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 sm:mb-8">
                {t('howItWorks.subtitle')}
                <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {t('howItWorks.subtitleHighlight')}
                </span>
              </h2>
              <p className="text-lg sm:text-xl text-slate-600 max-w-4xl mx-auto">
                {t('howItWorks.description')}
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 auto-rows-fr">
            {[
              {
                title: "Create & Add Children",
                description: "Sign up as a parent and add your children's profiles with their school level and subjects. Set up takes less than 2 minutes.",
                bgColor: "from-indigo-500 to-purple-500",
                delay: 200,
                icon: Users
              },
              {
                title: "Choose Practice Mode",
                description: "Select subject and difficulty level. Our smart system generates randomized questions from past year papers tailored to your child's level.",
                bgColor: "from-purple-500 to-pink-500",
                delay: 300,
                icon: Target
              },
              {
                title: "Practice & Progress",
                description: "Complete exercises, earn XP, unlock badges, and track improvement over time with detailed reports and analytics.",
                bgColor: "from-pink-500 to-amber-500",
                delay: 400,
                icon: TrendingUp
              }
            ].map((item, index) => (
              <RevealOnScroll key={index} animationType="scale-in" delay={item.delay}>
                <div className="text-center group h-full">
                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8 border border-white/50 hover:shadow-xl transition-all duration-300 group-hover:scale-105 h-full flex flex-col">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${item.bgColor} rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 flex-shrink-0`}>
                      <item.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4 flex-shrink-0">{item.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-sm sm:text-base flex-grow">
                      {item.description}
                    </p>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section className="py-20 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll animationType="fade-in" delay={100}>
            <div className="text-center mb-12 sm:mb-20">
              <div className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full text-indigo-700 text-xs sm:text-sm font-semibold mb-6 sm:mb-8">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {t('subjects.title')}
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 sm:mb-8">
                {t('subjects.subtitle')}
                <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {t('subjects.subtitleHighlight')}
                </span>
              </h2>
              <p className="text-lg sm:text-xl text-slate-600 max-w-4xl mx-auto">
                {t('subjects.description')}
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-8">
            {[
              { name: 'Bahasa Melayu', icon: '🇲🇾', color: 'from-red-500 to-pink-500', delay: 200 },
              { name: 'English', icon: '🇬🇧', color: 'from-blue-500 to-indigo-500', delay: 300 },
              { name: 'Mathematics', icon: '🔢', color: 'from-green-500 to-emerald-500', delay: 400 },
              { name: 'Science', icon: '🔬', color: 'from-purple-500 to-violet-500', delay: 500 },
              { name: 'History', icon: '📚', color: 'from-amber-500 to-orange-500', delay: 600 }
            ].map((subject, index) => (
              <RevealOnScroll key={index} animationType="bounce-in" delay={subject.delay}>
                <div className="group bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 text-center border border-white/50 hover:border-white/80 hover:scale-105">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${subject.color} flex items-center justify-center text-xl sm:text-3xl mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {subject.icon}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">{subject.name}</h3>
                  <div className={`mt-2 sm:mt-4 w-full h-1 bg-gradient-to-r ${subject.color} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-white/10 rounded-full blur-3xl animate-pulse-soft"></div>
          <div className="absolute bottom-1/4 right-1/4 w-56 sm:w-80 h-56 sm:h-80 bg-white/10 rounded-full blur-3xl animate-float"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <RevealOnScroll animationType="scale-in" delay={100}>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-8 sm:p-12 border border-white/20 shadow-xl">
              <div className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-white/20 rounded-full text-white text-xs sm:text-sm font-semibold mb-6 sm:mb-8">
                <Rocket className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {t('cta.badge')}
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 sm:mb-8">
                {t('cta.title')}
                <span className="block bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                  {t('cta.titleHighlight')}
                </span>
              </h2>
              <p className="text-lg sm:text-xl text-purple-100 mb-8 sm:mb-10 leading-relaxed max-w-3xl mx-auto">
                {t('cta.description')}
              </p>
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                variant="white"
                icon={<Rocket className="w-5 h-5 sm:w-6 sm:h-6" />}
              >
                <span className="flex items-center">
                  {t('cta.button')}
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-3" />
                </span>
              </Button>
              <p className="text-purple-200 text-sm sm:text-base mt-4 sm:mt-6">{t('cta.note')}</p>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Fun Footnote Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-r from-slate-100 via-blue-100 to-indigo-100 relative overflow-hidden">
        <div className="absolute top-4 left-4 animate-pulse-soft opacity-30">
          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400" />
        </div>
        <div className="absolute bottom-4 right-4 animate-bounce-gentle opacity-30">
          <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-pink-400" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <RevealOnScroll animationType="slide-up" delay={100}>
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/50 shadow-lg">
              <div className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-12">
                
                {/* Desktop Experience */}
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full p-3 sm:p-4 shadow-lg">
                    <Monitor className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="text-center md:text-left">
                    <div className="text-lg sm:text-xl font-bold text-slate-800">Best Experience on Desktop! 🖥️</div>
                    <div className="text-slate-600 text-sm">Optimized for bigger screens & better learning</div>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden md:block w-px h-16 bg-slate-300"></div>
                <div className="md:hidden w-16 h-px bg-slate-300"></div>

                {/* Mobile App Coming */}
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-pink-500 to-purple-500 rounded-full p-3 sm:p-4 shadow-lg">
                    <Smartphone className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="text-center md:text-left">
                    <div className="text-lg sm:text-xl font-bold text-slate-800">Mobile App Coming Soon! 📱</div>
                    <div className="text-slate-600 text-sm">Learning adventures on-the-go await!</div>
                  </div>
                </div>
              </div>

              {/* Fun tagline */}
              <div className="mt-6 sm:mt-8 text-center">
                <p className="text-slate-600 text-sm sm:text-base italic">
                  ✨ For now, grab your laptop and let's make learning magical together! ✨
                </p>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll animationType="fade-in" delay={100}>
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-6 md:mb-0">
                <EdventureLogo size="md" className="text-white" />
              </div>
              <div className="text-center md:text-right">
                <p className="text-slate-400 text-sm sm:text-base">{t('footer.copyright')}</p>
                <p className="text-slate-500 mt-2 text-sm sm:text-lg font-semibold">{t('footer.tagline')}</p>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </footer>
    </div>
  )
}