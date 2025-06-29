import React from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Star, Trophy, Users, BookOpen, Target, Award, TrendingUp, ArrowRight, Play, CheckCircle, XCircle, DollarSign, Crown, Shield, Sparkles, Heart, Zap } from 'lucide-react'
import { Button } from '../ui/Button'

export function LandingPage() {
  const navigate = useNavigate()

  const handleGetStarted = () => {
    navigate('/auth')
  }

  const handleAdminAccess = () => {
    navigate('/admin-login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50">
      {/* Floating decorative elements */}
      <div className="fixed top-20 right-10 animate-float z-10 opacity-60">
        <Star className="w-6 h-6 text-accent-400" />
      </div>
      <div className="fixed top-40 right-32 animate-bounce-gentle z-10 opacity-60">
        <Sparkles className="w-5 h-5 text-primary-400" />
      </div>
      <div className="fixed bottom-20 left-10 animate-wiggle z-10 opacity-60">
        <Heart className="w-7 h-7 text-secondary-400" />
      </div>

      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 glass border-b border-white/20 sticky">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-primary-500 rounded-2xl p-2 mr-3 shadow-fun">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary-700">KitaScore</h1>
                <p className="text-xs text-secondary-600">We Score Together</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={handleGetStarted} className="text-sm">
                Sign In
              </Button>
              <Button variant="ghost" onClick={handleAdminAccess} className="text-error-600 hover:text-error-700 text-sm">
                <Shield className="w-4 h-4 mr-1" />
                Admin
              </Button>
              <Button onClick={handleGetStarted} variant="fun" size="sm">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="glass rounded-3xl p-8 mb-8 border border-white/30">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-primary-500 rounded-full p-4 mr-4 shadow-fun">
                  <GraduationCap className="w-12 h-12 text-white" />
                </div>
                <div className="text-left">
                  <h1 className="text-5xl md:text-6xl font-bold text-primary-700 mb-2">
                    We Score Together
                  </h1>
                  <p className="text-xl text-secondary-600">Making exam practice fun for Malaysian students</p>
                </div>
              </div>
              
              <p className="text-lg md:text-xl text-neutral-600 mb-8 leading-relaxed">
                Transform boring exam preparation into an engaging learning adventure. 
                From Darjah 1 to Tingkatan 5, track progress and celebrate achievements together.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                variant="fun"
                className="px-8 py-4 text-lg"
                icon={<Star className="w-5 h-5" />}
              >
                Start Learning Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-4 text-lg"
                icon={<Play className="w-5 h-5" />}
              >
                Watch Demo
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="card-fun">
                <div className="text-3xl font-bold text-primary-600 mb-2">10,000+</div>
                <div className="text-neutral-600">Questions Available</div>
              </div>
              <div className="card-fun">
                <div className="text-3xl font-bold text-secondary-600 mb-2">5</div>
                <div className="text-neutral-600">Core Subjects</div>
              </div>
              <div className="card-fun">
                <div className="text-3xl font-bold text-accent-600 mb-2">11</div>
                <div className="text-neutral-600">Education Levels</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-secondary-500 relative overflow-hidden">
        <div className="absolute top-10 left-10 animate-float opacity-40">
          <Crown className="w-8 h-8 text-accent-300" />
        </div>
        <div className="absolute bottom-10 right-10 animate-bounce-gentle opacity-40">
          <DollarSign className="w-8 h-8 text-accent-300" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Choose Your Learning Plan</h2>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Start with our free plan or unlock the full potential with premium features
            </p>
            <div className="mt-6 inline-flex items-center px-4 py-2 bg-accent-100 text-neutral-800 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              All users currently have premium access during launch!
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-3xl shadow-xl p-8 relative flex flex-col">
              <div className="text-center mb-8">
                <div className="bg-primary-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-800 mb-2">Free Plan</h3>
                <div className="text-4xl font-bold text-neutral-900 mb-2">
                  RM0<span className="text-lg font-normal text-neutral-600">/month</span>
                </div>
                <p className="text-neutral-600">Perfect for getting started</p>
              </div>

              <div className="space-y-3 mb-8 flex-1">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-success-500 mr-3 flex-shrink-0" />
                  <span className="text-neutral-700">1 exam paper per day</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-success-500 mr-3 flex-shrink-0" />
                  <span className="text-neutral-700">1 child profile</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-success-500 mr-3 flex-shrink-0" />
                  <span className="text-neutral-700">Easy level access only</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-success-500 mr-3 flex-shrink-0" />
                  <span className="text-neutral-700">Basic progress tracking</span>
                </div>
                <div className="flex items-center">
                  <XCircle className="w-5 h-5 text-neutral-400 mr-3 flex-shrink-0" />
                  <span className="text-neutral-400">Medium & Full exam modes</span>
                </div>
                <div className="flex items-center">
                  <XCircle className="w-5 h-5 text-neutral-400 mr-3 flex-shrink-0" />
                  <span className="text-neutral-400">Advanced analytics</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full py-3"
                onClick={handleGetStarted}
              >
                Start Free
              </Button>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-accent-100 to-warning-100 rounded-3xl shadow-xl p-8 relative transform scale-105 flex flex-col border-2 border-accent-300">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-accent-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                  MOST POPULAR
                </div>
              </div>

              <div className="text-center mb-8 mt-2">
                <div className="bg-accent-500 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-800 mb-2">Premium Plan</h3>
                <div className="text-4xl font-bold text-neutral-900 mb-2">
                  RM20<span className="text-lg font-normal text-neutral-600">/month</span>
                </div>
                <p className="text-neutral-600">Full access to all features</p>
              </div>

              <div className="space-y-3 mb-8 flex-1">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-success-500 mr-3 flex-shrink-0" />
                  <span className="text-neutral-700">Unlimited exam papers</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-success-500 mr-3 flex-shrink-0" />
                  <span className="text-neutral-700">Up to 3 children profiles</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-success-500 mr-3 flex-shrink-0" />
                  <span className="text-neutral-700">All difficulty levels</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-success-500 mr-3 flex-shrink-0" />
                  <span className="text-neutral-700">Advanced progress analytics</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-success-500 mr-3 flex-shrink-0" />
                  <span className="text-neutral-700">Complete badge system</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-success-500 mr-3 flex-shrink-0" />
                  <span className="text-neutral-700">Priority support</span>
                </div>
              </div>

              <div className="mb-6 p-3 bg-primary-100 rounded-xl">
                <div className="flex items-center text-sm text-primary-700">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span>Additional children: RM5/child/month</span>
                </div>
              </div>

              <Button 
                className="w-full py-3 bg-accent-500 hover:bg-accent-600"
                onClick={handleGetStarted}
                icon={<Crown className="w-5 h-5" />}
              >
                Get Premium
              </Button>
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="glass rounded-2xl p-6 border border-white/30">
              <p className="text-white text-lg">
                <strong>Special Launch Offer:</strong> All users get premium access for free during our launch period!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-800 mb-4">Why Choose KitaScore?</h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              We've reimagined exam preparation to make it engaging, effective, and enjoyable for both parents and children.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card-fun text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Star className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-4">Gamified Learning</h3>
              <p className="text-neutral-600">
                Earn XP points, unlock achievement badges, and celebrate milestones. Learning becomes an adventure, not a chore.
              </p>
            </div>

            <div className="card-fun text-center">
              <div className="bg-secondary-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <BookOpen className="w-8 h-8 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-4">Comprehensive Question Bank</h3>
              <p className="text-neutral-600">
                Access thousands of past year questions across BM, BI, Mathematics, Science, and History for all levels.
              </p>
            </div>

            <div className="card-fun text-center">
              <div className="bg-accent-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Target className="w-8 h-8 text-accent-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-4">Adaptive Practice Modes</h3>
              <p className="text-neutral-600">
                Choose from Easy (10 MCQs), Medium (20-30 mixed), or Full Mode (complete papers) based on your child's readiness.
              </p>
            </div>

            <div className="card-fun text-center">
              <div className="bg-warning-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <TrendingUp className="w-8 h-8 text-warning-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-4">Progress Tracking</h3>
              <p className="text-neutral-600">
                Monitor your children's learning journey with detailed analytics, performance reports, and improvement insights.
              </p>
            </div>

            <div className="card-fun text-center">
              <div className="bg-error-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Users className="w-8 h-8 text-error-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-4">Family Dashboard</h3>
              <p className="text-neutral-600">
                Manage multiple children from one parent account. See everyone's progress at a glance and celebrate together.
              </p>
            </div>

            <div className="card-fun text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Award className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-4">Achievement System</h3>
              <p className="text-neutral-600">
                Unlock badges for milestones like "First Perfect Score", "5-Day Streak", and "Subject Master" to keep motivation high.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-800 mb-4">How KitaScore Works</h2>
            <p className="text-xl text-neutral-600">Simple steps to transform your child's exam preparation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-fun">
                1
              </div>
              <div className="card-fun">
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Create & Add Children</h3>
                <p className="text-neutral-600">
                  Sign up as a parent and add your children's profiles with their school level and subjects.
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-secondary-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-success">
                2
              </div>
              <div className="card-fun">
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Choose Practice Mode</h3>
                <p className="text-neutral-600">
                  Select subject and difficulty level. Our system generates randomized questions from past year papers.
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-accent-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-warning">
                3
              </div>
              <div className="card-fun">
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Practice & Progress</h3>
                <p className="text-neutral-600">
                  Complete exercises, earn XP, unlock badges, and track improvement over time with detailed reports.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-800 mb-4">Complete Subject Coverage</h2>
            <p className="text-xl text-neutral-600">From Darjah 1 to Tingkatan 5, we've got all core subjects covered</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { name: 'Bahasa Melayu', icon: '🇲🇾', color: 'bg-error-100 text-error-600' },
              { name: 'English', icon: '🇬🇧', color: 'bg-primary-100 text-primary-600' },
              { name: 'Mathematics', icon: '🔢', color: 'bg-secondary-100 text-secondary-600' },
              { name: 'Science', icon: '🔬', color: 'bg-accent-100 text-accent-600' },
              { name: 'History', icon: '📚', color: 'bg-warning-100 text-warning-600' }
            ].map((subject, index) => (
              <div key={index} className="card-fun text-center">
                <div className={`w-16 h-16 rounded-2xl ${subject.color} flex items-center justify-center text-2xl mx-auto mb-4`}>
                  {subject.icon}
                </div>
                <h3 className="font-semibold text-neutral-800">{subject.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-3xl p-8 border border-white/30">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Learning?</h2>
            <p className="text-xl text-neutral-700 mb-8">
              Join thousands of Malaysian families who are making exam preparation fun and effective with KitaScore.
            </p>
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              variant="fun"
              className="px-8 py-4 text-lg shadow-xl"
              icon={<Star className="w-5 h-5" />}
            >
              Start Free Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-primary-200 text-sm mt-4">No credit card required • Set up in 2 minutes</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-primary-500 rounded-2xl p-2 mr-3">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">KitaScore</h3>
                <p className="text-neutral-400 text-sm">Powered by KITAMEN</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-neutral-400 text-sm">© 2025 KitaScore. All rights reserved.</p>
              <p className="text-neutral-500 text-xs mt-1">We Score Together</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}