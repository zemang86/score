import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Trophy, Users, BookOpen, Target, Award, TrendingUp, ArrowRight, Play, CheckCircle, XCircle, DollarSign, Crown, Shield, Sparkles, Heart, Zap, Monitor, Smartphone, Rocket, Brain, Globe, ChevronDown, Lightbulb, Gamepad2, BarChart3, Clock, Gift } from 'lucide-react'
import { Button } from '../ui/Button'
import { RevealOnScroll } from '../animations/RevealOnScroll'
import { EdventureLogo } from '../ui/EdventureLogo'

export function LandingPage() {
  const navigate = useNavigate()
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    // Initialize optimized scroll observer for performance
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            // Remove will-change after animation completes
            setTimeout(() => {
              entry.target.classList.add('animation-complete')
            }, 800)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '50px 0px -50px 0px'
      }
    )

    // Observe all scroll-animated elements
    const animatedElements = document.querySelectorAll('.scroll-fade-in, .scroll-slide-left, .scroll-slide-right, .scroll-scale-in, .scroll-bounce-in')
    animatedElements.forEach((el) => {
      el.classList.add('will-animate')
      observerRef.current?.observe(el)
    })

    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  const handleGetStarted = () => {
    console.log('🚀 Navigating to auth page...')
    navigate('/auth')
  }

  const handleWatchDemo = () => {
    // Smooth scroll to features section
    const featuresSection = document.getElementById('features-section')
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Floating decorative elements */}
      <div className="fixed top-20 right-10 animate-float z-10 opacity-20">
        <Star className="w-8 h-8 text-indigo-400" />
      </div>
      <div className="fixed top-40 right-32 animate-bounce-gentle z-10 opacity-20">
        <Sparkles className="w-6 h-6 text-purple-400" />
      </div>
      <div className="fixed bottom-20 left-10 animate-wiggle z-10 opacity-20">
        <Heart className="w-8 h-8 text-pink-400" />
      </div>
      <div className="fixed top-1/2 right-5 animate-pulse-soft z-10 opacity-20">
        <Zap className="w-7 h-7 text-amber-400" />
      </div>

      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-white/20 sticky shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <RevealOnScroll animationType="slide-right" delay={100}>
              <EdventureLogo size="lg" />
            </RevealOnScroll>
            <RevealOnScroll animationType="slide-left" delay={200}>
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  onClick={handleGetStarted} 
                  className="text-slate-700 hover:text-indigo-600 font-medium px-6 py-3"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={handleGetStarted} 
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-semibold"
                >
                  Get Started Free
                </Button>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </nav>

      {/* Hero Section - Million Dollar Design */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient Orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-indigo-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse-soft"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-400/30 to-rose-400/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-full blur-3xl animate-bounce-gentle"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <RevealOnScroll animationType="scale-in" delay={300}>
                <div className="mb-8">
                  {/* Premium Badge */}
                  <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 rounded-full text-indigo-700 text-sm font-semibold mb-8 shadow-lg border border-white/50 backdrop-blur-sm">
                    <Rocket className="w-5 h-5 mr-3" />
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Transforming Education in Malaysia
                    </span>
                    <Sparkles className="w-5 h-5 ml-3 text-amber-500" />
                  </div>
                  
                  {/* Main Headline */}
                  <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-slate-900 mb-8 leading-none tracking-tight">
                    Where Learning
                    <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">
                      Becomes Adventure
                    </span>
                  </h1>
                  
                  {/* Subtitle */}
                  <p className="text-xl sm:text-2xl lg:text-3xl text-slate-600 mb-10 leading-relaxed max-w-3xl mx-auto lg:mx-0 font-light">
                    Transform exam preparation into an <span className="font-semibold text-indigo-600">engaging journey</span>. 
                    From Darjah 1 to Tingkatan 5, track progress and celebrate achievements together.
                  </p>
                </div>
              </RevealOnScroll>
              
              {/* Action Buttons */}
              <RevealOnScroll animationType="slide-up" delay={500}>
                <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start items-center mb-12">
                  <Button 
                    size="xl" 
                    onClick={handleGetStarted}
                    className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-12 py-5 text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 font-bold rounded-2xl border-0"
                    icon={<Rocket className="w-6 h-6" />}
                  >
                    <span className="flex items-center">
                      Start Your Adventure
                      <ArrowRight className="w-6 h-6 ml-3" />
                    </span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="xl"
                    onClick={handleWatchDemo}
                    className="w-full sm:w-auto border-3 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-indigo-300 px-12 py-5 text-xl font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                    icon={<Play className="w-6 h-6" />}
                  >
                    Watch Demo
                  </Button>
                </div>
              </RevealOnScroll>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-6 text-center lg:text-left">
                <RevealOnScroll animationType="slide-up" delay={600}>
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">10,000+</div>
                    <div className="text-slate-600 font-semibold">Questions</div>
                  </div>
                </RevealOnScroll>
                <RevealOnScroll animationType="slide-up" delay={700}>
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">5</div>
                    <div className="text-slate-600 font-semibold">Subjects</div>
                  </div>
                </RevealOnScroll>
                <RevealOnScroll animationType="slide-up" delay={800}>
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">11</div>
                    <div className="text-slate-600 font-semibold">Levels</div>
                  </div>
                </RevealOnScroll>
              </div>
            </div>

            {/* Right Visual - Premium Dashboard Preview */}
            <div className="relative">
              <RevealOnScroll animationType="scale-in" delay={400}>
                <div className="relative">
                  {/* Main Dashboard Mockup */}
                  <div className="bg-gradient-to-br from-white via-slate-50 to-indigo-50 rounded-3xl p-8 shadow-3xl border border-white/50 backdrop-blur-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mr-4">
                          <Crown className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800">Welcome back, Sarah!</h3>
                          <p className="text-slate-500 text-sm">Ready for today's adventure?</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                    </div>

                    {/* Dashboard Content */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      {/* Student Card */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-rose-400 rounded-xl flex items-center justify-center mr-3">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-800">Ahmad</h4>
                            <p className="text-slate-500 text-xs">Tingkatan 3</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">XP Progress</span>
                            <span className="font-semibold text-indigo-600">850 XP</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full w-4/5"></div>
                          </div>
                        </div>
                      </div>

                      {/* Achievement Card */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <Trophy className="w-6 h-6 text-white" />
                          </div>
                          <h4 className="font-semibold text-slate-800 mb-1">Perfect Score!</h4>
                          <p className="text-slate-500 text-xs">Mathematics Exam</p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Chart */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-slate-800">Weekly Progress</h4>
                        <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">95%</div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                          <div className="flex-1 bg-slate-200 rounded-full h-2">
                            <div className="bg-gradient-to-r from-green-400 to-emerald-400 h-2 rounded-full w-11/12"></div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-400 rounded-full mr-3"></div>
                          <div className="flex-1 bg-slate-200 rounded-full h-2">
                            <div className="bg-gradient-to-r from-blue-400 to-indigo-400 h-2 rounded-full w-4/5"></div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-purple-400 rounded-full mr-3"></div>
                          <div className="flex-1 bg-slate-200 rounded-full h-2">
                            <div className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full w-3/4"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating Achievement Badges */}
                  <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl shadow-2xl flex items-center justify-center animate-bounce-gentle">
                    <Star className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-2xl flex items-center justify-center animate-float">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute top-1/2 -right-4 w-14 h-14 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl shadow-xl flex items-center justify-center animate-pulse-soft">
                    <Lightbulb className="w-7 h-7 text-white" />
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
      <section id="features-section" className="py-32 bg-gradient-to-br from-white via-slate-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll animationType="fade-in" delay={100}>
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full text-indigo-700 text-sm font-semibold mb-8">
                <Sparkles className="w-5 h-5 mr-2" />
                Why Choose Edventure+?
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-8">
                The Future of 
                <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Learning is Here
                </span>
              </h2>
              <p className="text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
                We've reimagined exam preparation to make it engaging, effective, and enjoyable for both parents and children.
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
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
                <div className="group bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 p-8 border border-white/50 hover:border-white/80 hover:scale-105">
                  <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <feature.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    {feature.description}
                  </p>
                  <div className={`mt-6 w-full h-1 bg-gradient-to-r ${feature.color} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section className="py-32 bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 relative overflow-hidden">
        <div className="absolute top-10 left-10 animate-float opacity-20">
          <Crown className="w-12 h-12 text-amber-300" />
        </div>
        <div className="absolute bottom-10 right-10 animate-bounce-gentle opacity-20">
          <Gift className="w-12 h-12 text-green-300" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <RevealOnScroll animationType="fade-in" delay={100}>
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full text-amber-300 text-sm font-semibold mb-8 border border-amber-400/30">
                <Crown className="w-5 h-5 mr-2" />
                Choose Your Learning Plan
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8">
                Unlock Your Child's
                <span className="block bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                  Full Potential
                </span>
              </h2>
              <p className="text-xl lg:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
                Start with our free plan or unlock the full potential with premium features
              </p>
              <div className="mt-8 inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 rounded-2xl text-lg font-semibold shadow-xl border border-emerald-400/30">
                <Sparkles className="w-6 h-6 mr-3" />
                All users currently have premium access during launch!
              </div>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {/* Free Plan */}
            <RevealOnScroll animationType="slide-right" delay={200}>
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 relative border border-white/20 hover:border-white/40 transition-all duration-300">
                <div className="text-center mb-10">
                  <div className="bg-slate-100 rounded-full p-6 w-24 h-24 mx-auto mb-8 shadow-lg">
                    <BookOpen className="w-12 h-12 text-slate-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">Free Plan</h3>
                  <div className="text-5xl font-bold text-white mb-4">
                    RM0<span className="text-xl font-normal text-slate-300">/month</span>
                  </div>
                  <p className="text-slate-300 text-lg">Perfect for getting started</p>
                </div>

                <div className="space-y-6 mb-10">
                  <div className="flex items-center text-white">
                    <CheckCircle className="w-6 h-6 text-green-400 mr-4 flex-shrink-0" />
                    <span className="text-lg">1 exam paper per day</span>
                  </div>
                  <div className="flex items-center text-white">
                    <CheckCircle className="w-6 h-6 text-green-400 mr-4 flex-shrink-0" />
                    <span className="text-lg">1 child profile</span>
                  </div>
                  <div className="flex items-center text-white">
                    <CheckCircle className="w-6 h-6 text-green-400 mr-4 flex-shrink-0" />
                    <span className="text-lg">Easy level access only</span>
                  </div>
                  <div className="flex items-center text-white">
                    <CheckCircle className="w-6 h-6 text-green-400 mr-4 flex-shrink-0" />
                    <span className="text-lg">Basic progress tracking</span>
                  </div>
                  <div className="flex items-center text-slate-400">
                    <XCircle className="w-6 h-6 text-slate-500 mr-4 flex-shrink-0" />
                    <span className="text-lg">Medium & Full exam modes</span>
                  </div>
                  <div className="flex items-center text-slate-400">
                    <XCircle className="w-6 h-6 text-slate-500 mr-4 flex-shrink-0" />
                    <span className="text-lg">Advanced analytics</span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full py-4 text-white border-white/30 hover:bg-white/10 font-semibold text-lg rounded-2xl"
                  onClick={handleGetStarted}
                >
                  Start Free
                </Button>
              </div>
            </RevealOnScroll>

            {/* Premium Plan */}
            <RevealOnScroll animationType="slide-left" delay={300}>
              <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl p-10 relative transform scale-105 border-4 border-amber-400">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="bg-amber-500 text-white px-8 py-3 rounded-full text-lg font-bold shadow-xl">
                    MOST POPULAR
                  </div>
                </div>

                <div className="text-center mb-10 mt-6">
                  <div className="bg-white rounded-full p-6 w-24 h-24 mx-auto mb-8 shadow-xl">
                    <Crown className="w-12 h-12 text-amber-500" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">Premium Plan</h3>
                  <div className="text-5xl font-bold text-white mb-4">
                    RM20<span className="text-xl font-normal text-purple-100">/month</span>
                  </div>
                  <p className="text-purple-100 text-lg">Full access to all features</p>
                </div>

                <div className="space-y-6 mb-10">
                  <div className="flex items-center text-white">
                    <CheckCircle className="w-6 h-6 text-green-300 mr-4 flex-shrink-0" />
                    <span className="text-lg font-medium">Unlimited exam papers</span>
                  </div>
                  <div className="flex items-center text-white">
                    <CheckCircle className="w-6 h-6 text-green-300 mr-4 flex-shrink-0" />
                    <span className="text-lg font-medium">Up to 3 children profiles</span>
                  </div>
                  <div className="flex items-center text-white">
                    <CheckCircle className="w-6 h-6 text-green-300 mr-4 flex-shrink-0" />
                    <span className="text-lg font-medium">All difficulty levels</span>
                  </div>
                  <div className="flex items-center text-white">
                    <CheckCircle className="w-6 h-6 text-green-300 mr-4 flex-shrink-0" />
                    <span className="text-lg font-medium">Advanced progress analytics</span>
                  </div>
                  <div className="flex items-center text-white">
                    <CheckCircle className="w-6 h-6 text-green-300 mr-4 flex-shrink-0" />
                    <span className="text-lg font-medium">Complete badge system</span>
                  </div>
                  <div className="flex items-center text-white">
                    <CheckCircle className="w-6 h-6 text-green-300 mr-4 flex-shrink-0" />
                    <span className="text-lg font-medium">Priority support</span>
                  </div>
                </div>

                <div className="mb-8 p-4 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                  <div className="flex items-center text-sm text-white font-medium">
                    <DollarSign className="w-5 h-5 mr-2" />
                    <span>Additional children: RM5/child/month</span>
                  </div>
                </div>

                <Button 
                  className="w-full py-4 bg-white text-purple-600 hover:bg-purple-50 font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  onClick={handleGetStarted}
                  icon={<Crown className="w-6 h-6" />}
                >
                  Get Premium Access
                </Button>
              </div>
            </RevealOnScroll>
          </div>

          <RevealOnScroll animationType="scale-in" delay={400}>
            <div className="text-center mt-16">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 max-w-3xl mx-auto">
                <p className="text-white text-xl font-semibold">
                  <strong>Special Launch Offer:</strong> All users get premium access for free during our launch period!
                </p>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll animationType="fade-in" delay={100}>
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full text-indigo-700 text-sm font-semibold mb-8">
                <Lightbulb className="w-5 h-5 mr-2" />
                How It Works
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-8">
                Simple Steps to
                <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Learning Success
                </span>
              </h2>
              <p className="text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto">
                Transform your child's exam preparation in just three easy steps
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: 1,
                title: "Create & Add Children",
                description: "Sign up as a parent and add your children's profiles with their school level and subjects. Set up takes less than 2 minutes.",
                bgColor: "from-indigo-500 to-purple-500",
                delay: 200,
                icon: Users
              },
              {
                step: 2,
                title: "Choose Practice Mode",
                description: "Select subject and difficulty level. Our smart system generates randomized questions from past year papers tailored to your child's level.",
                bgColor: "from-purple-500 to-pink-500",
                delay: 300,
                icon: Target
              },
              {
                step: 3,
                title: "Practice & Progress",
                description: "Complete exercises, earn XP, unlock badges, and track improvement over time with detailed reports and analytics.",
                bgColor: "from-pink-500 to-amber-500",
                delay: 400,
                icon: TrendingUp
              }
            ].map((item, index) => (
              <RevealOnScroll key={index} animationType="scale-in" delay={item.delay}>
                <div className="text-center group">
                  <div className={`bg-gradient-to-br ${item.bgColor} text-white rounded-full w-28 h-28 flex items-center justify-center text-4xl font-bold mx-auto mb-8 shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                    {item.step}
                  </div>
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-white/50 hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                    <div className={`w-16 h-16 bg-gradient-to-br ${item.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">{item.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-lg">
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
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll animationType="fade-in" delay={100}>
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full text-indigo-700 text-sm font-semibold mb-8">
                <BookOpen className="w-5 h-5 mr-2" />
                Complete Coverage
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-8">
                All Core Subjects
                <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Covered
                </span>
              </h2>
              <p className="text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto">
                From Darjah 1 to Tingkatan 5, we've got all core subjects covered with thousands of questions
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">
            {[
              { name: 'Bahasa Melayu', icon: '🇲🇾', color: 'from-red-500 to-pink-500', delay: 200 },
              { name: 'English', icon: '🇬🇧', color: 'from-blue-500 to-indigo-500', delay: 300 },
              { name: 'Mathematics', icon: '🔢', color: 'from-green-500 to-emerald-500', delay: 400 },
              { name: 'Science', icon: '🔬', color: 'from-purple-500 to-violet-500', delay: 500 },
              { name: 'History', icon: '📚', color: 'from-amber-500 to-orange-500', delay: 600 }
            ].map((subject, index) => (
              <RevealOnScroll key={index} animationType="bounce-in" delay={subject.delay}>
                <div className="group bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 text-center border border-white/50 hover:border-white/80 hover:scale-105">
                  <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${subject.color} flex items-center justify-center text-3xl mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {subject.icon}
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">{subject.name}</h3>
                  <div className={`mt-4 w-full h-1 bg-gradient-to-r ${subject.color} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-soft"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <RevealOnScroll animationType="scale-in" delay={100}>
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 lg:p-16 border border-white/20 shadow-2xl">
              <div className="inline-flex items-center px-6 py-3 bg-white/20 rounded-full text-white text-sm font-semibold mb-8">
                <Rocket className="w-5 h-5 mr-2" />
                Ready to Transform Learning?
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8">
                Start Your Family's
                <span className="block bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                  Learning Adventure
                </span>
              </h2>
              <p className="text-xl lg:text-2xl text-purple-100 mb-12 leading-relaxed max-w-3xl mx-auto">
                Join thousands of Malaysian families who are making exam preparation fun and effective with Edventure+.
              </p>
              <Button 
                size="xl" 
                onClick={handleGetStarted}
                className="bg-white text-purple-600 hover:bg-purple-50 px-12 py-5 text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 font-bold rounded-2xl"
                icon={<Rocket className="w-6 h-6" />}
              >
                <span className="flex items-center">
                  Start Free Today
                  <ArrowRight className="w-6 h-6 ml-3" />
                </span>
              </Button>
              <p className="text-purple-200 text-lg mt-6">No credit card required • Set up in 2 minutes • Premium access included</p>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Fun Footnote Section */}
      <section className="py-20 bg-gradient-to-r from-slate-100 via-blue-100 to-indigo-100 relative overflow-hidden">
        <div className="absolute top-4 left-4 animate-pulse-soft opacity-30">
          <Sparkles className="w-8 h-8 text-indigo-400" />
        </div>
        <div className="absolute bottom-4 right-4 animate-bounce-gentle opacity-30">
          <Heart className="w-8 h-8 text-pink-400" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <RevealOnScroll animationType="slide-up" delay={100}>
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-10 border border-white/50 shadow-xl">
              <div className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-16">
                
                {/* Desktop Experience */}
                <div className="flex items-center space-x-6">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full p-4 shadow-xl">
                    <Monitor className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-center md:text-left">
                    <div className="text-2xl font-bold text-slate-800">Best Experience on Desktop! 🖥️</div>
                    <div className="text-slate-600">Optimized for bigger screens & better learning</div>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden md:block w-px h-16 bg-slate-300"></div>
                <div className="md:hidden w-16 h-px bg-slate-300"></div>

                {/* Mobile App Coming */}
                <div className="flex items-center space-x-6">
                  <div className="bg-gradient-to-br from-pink-500 to-purple-500 rounded-full p-4 shadow-xl">
                    <Smartphone className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-center md:text-left">
                    <div className="text-2xl font-bold text-slate-800">Mobile App Coming Soon! 📱</div>
                    <div className="text-slate-600">Learning adventures on-the-go await!</div>
                  </div>
                </div>
              </div>

              {/* Fun tagline */}
              <div className="mt-8 text-center">
                <p className="text-slate-600 text-lg italic">
                  ✨ For now, grab your laptop and let's make learning magical together! ✨
                </p>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll animationType="fade-in" delay={100}>
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-8 md:mb-0">
                <EdventureLogo size="lg" className="text-white" />
              </div>
              <div className="text-center md:text-right">
                <p className="text-slate-400 text-lg">© 2025 Edventure+. All rights reserved.</p>
                <p className="text-slate-500 mt-2 text-xl font-semibold">Where Learning Becomes Adventure</p>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </footer>
    </div>
  )
}