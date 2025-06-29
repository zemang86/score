import React from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Star, Trophy, Users, BookOpen, Target, Award, TrendingUp, ArrowRight, Play, CheckCircle, XCircle, DollarSign, Crown, Shield, Sparkles, Gamepad2, Zap } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-roblox-blue-50 via-roblox-purple-50 to-roblox-yellow-50">
      {/* Floating decorative elements */}
      <div className="fixed top-20 right-10 animate-float z-10">
        <Star className="w-8 h-8 text-roblox-yellow-400 opacity-60" />
      </div>
      <div className="fixed top-40 right-32 animate-bounce-gentle z-10">
        <Sparkles className="w-6 h-6 text-roblox-purple-400 opacity-60" />
      </div>
      <div className="fixed bottom-20 left-10 animate-wiggle z-10">
        <Gamepad2 className="w-10 h-10 text-roblox-green-400 opacity-60" />
      </div>
      <div className="fixed top-1/2 right-5 animate-pulse z-10">
        <Zap className="w-7 h-7 text-roblox-yellow-400 opacity-60" />
      </div>

      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b-4 border-roblox-blue-200 shadow-roblox">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="bg-roblox-blue-500 rounded-full p-3 mr-4 shadow-neon-blue">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold-game text-roblox-blue-600">KitaScore</h1>
                <p className="text-sm font-game text-roblox-purple-600">🎮 Powered by KITAMEN 🎮</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleGetStarted} className="font-game">
                🔐 Sign In
              </Button>
              <Button variant="ghost" onClick={handleAdminAccess} className="text-red-600 hover:text-red-700 font-game">
                <Shield className="w-4 h-4 mr-1" />
                🛡️ Admin
              </Button>
              <Button onClick={handleGetStarted} variant="fun" glow={true} className="font-bold-game">
                🚀 Get Started! 🚀
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(26, 140, 255, 0.3), rgba(140, 26, 255, 0.3)), url('https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')`
        }}
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border-4 border-white/30 shadow-roblox-hover mb-8">
              <h1 className="text-6xl md:text-8xl font-bold-game mb-6 leading-tight animate-bounce-gentle">
                🎮 We Score <span className="text-roblox-yellow-300 animate-pulse">Together!</span> 🎮
              </h1>
              <p className="text-2xl md:text-3xl mb-8 text-roblox-blue-100 leading-relaxed font-game">
                🚀 Turn boring exam practice into an EPIC gaming adventure for Malaysian students! 🚀
              </p>
              <p className="text-xl md:text-2xl mb-8 text-roblox-purple-100 font-game">
                From Darjah 1 to Tingkatan 5 - make learning fun and track progress together! 📚✨
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <Button 
                size="xl" 
                onClick={handleGetStarted}
                variant="fun"
                glow={true}
                bounce={true}
                className="font-bold-game text-2xl px-12 py-6"
              >
                <Star className="w-8 h-8 mr-3" />
                🌟 Start Your Adventure! 🌟
                <ArrowRight className="w-8 h-8 ml-3" />
              </Button>
              <Button 
                variant="outline" 
                size="xl"
                className="bg-white/20 backdrop-blur-sm border-4 border-white/50 text-white hover:bg-white/30 font-bold-game text-xl px-10 py-6"
              >
                <Play className="w-6 h-6 mr-3" />
                🎬 Watch Demo 🎬
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 border-4 border-white/30 shadow-roblox hover:shadow-roblox-hover transition-all duration-300 transform hover:scale-105">
                <div className="text-4xl font-bold-game text-roblox-yellow-300 mb-2 animate-pulse">10,000+</div>
                <div className="text-roblox-blue-100 font-game text-lg">📚 Questions Available</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 border-4 border-white/30 shadow-roblox hover:shadow-roblox-hover transition-all duration-300 transform hover:scale-105">
                <div className="text-4xl font-bold-game text-roblox-yellow-300 mb-2 animate-pulse">5</div>
                <div className="text-roblox-blue-100 font-game text-lg">🎯 Core Subjects</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 border-4 border-white/30 shadow-roblox hover:shadow-roblox-hover transition-all duration-300 transform hover:scale-105">
                <div className="text-4xl font-bold-game text-roblox-yellow-300 mb-2 animate-pulse">11</div>
                <div className="text-roblox-blue-100 font-game text-lg">🎓 Education Levels</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section className="py-20 bg-gradient-to-r from-roblox-red-400 to-roblox-red-600 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 animate-float">
          <Crown className="w-12 h-12 text-roblox-yellow-300 opacity-60" />
        </div>
        <div className="absolute bottom-10 right-10 animate-bounce-gentle">
          <DollarSign className="w-10 h-10 text-roblox-green-300 opacity-60" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold-game text-white mb-6 animate-bounce-gentle">🎯 Choose Your Learning Plan 🎯</h2>
            <p className="text-2xl text-white max-w-3xl mx-auto font-game">
              🚀 Start with our free plan or unlock the full potential with premium features! 🚀
            </p>
            <div className="mt-8 inline-flex items-center px-6 py-3 bg-roblox-green-100 text-roblox-green-800 rounded-full text-lg font-bold-game border-4 border-roblox-green-400 shadow-roblox animate-pulse">
              <Crown className="w-6 h-6 mr-3" />
              🎉 All users currently have premium access until further notice! 🎉
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-roblox-hover border-4 border-roblox-blue-300 p-8 relative flex flex-col transform hover:scale-105 transition-all duration-300">
              <div className="flex-1">
                <div className="text-center mb-8">
                  <div className="bg-roblox-blue-500 rounded-full p-4 w-20 h-20 mx-auto mb-4 shadow-neon-blue">
                    <BookOpen className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold-game text-roblox-blue-600 mb-2">🆓 Free Plan</h3>
                  <div className="text-5xl font-bold-game text-roblox-blue-700 mb-2">
                    RM0<span className="text-xl font-game text-roblox-blue-500">/month</span>
                  </div>
                  <p className="text-roblox-blue-600 font-game text-lg">Perfect for getting started! 🎯</p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center bg-roblox-green-50 p-3 rounded-2xl border-2 border-roblox-green-200">
                    <CheckCircle className="w-6 h-6 text-roblox-green-600 mr-3 flex-shrink-0" />
                    <span className="text-roblox-green-700 font-game font-bold">📝 1 exam paper per day</span>
                  </div>
                  <div className="flex items-center bg-roblox-green-50 p-3 rounded-2xl border-2 border-roblox-green-200">
                    <CheckCircle className="w-6 h-6 text-roblox-green-600 mr-3 flex-shrink-0" />
                    <span className="text-roblox-green-700 font-game font-bold">👤 1 child profile</span>
                  </div>
                  <div className="flex items-center bg-roblox-green-50 p-3 rounded-2xl border-2 border-roblox-green-200">
                    <CheckCircle className="w-6 h-6 text-roblox-green-600 mr-3 flex-shrink-0" />
                    <span className="text-roblox-green-700 font-game font-bold">🎮 Easy level access only</span>
                  </div>
                  <div className="flex items-center bg-roblox-green-50 p-3 rounded-2xl border-2 border-roblox-green-200">
                    <CheckCircle className="w-6 h-6 text-roblox-green-600 mr-3 flex-shrink-0" />
                    <span className="text-roblox-green-700 font-game font-bold">📊 Basic progress tracking</span>
                  </div>
                  <div className="flex items-center bg-roblox-red-50 p-3 rounded-2xl border-2 border-roblox-red-200">
                    <XCircle className="w-6 h-6 text-roblox-red-500 mr-3 flex-shrink-0" />
                    <span className="text-roblox-red-600 font-game">❌ Medium & Full exam modes</span>
                  </div>
                  <div className="flex items-center bg-roblox-red-50 p-3 rounded-2xl border-2 border-roblox-red-200">
                    <XCircle className="w-6 h-6 text-roblox-red-500 mr-3 flex-shrink-0" />
                    <span className="text-roblox-red-600 font-game">❌ Advanced analytics</span>
                  </div>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full py-4 text-lg font-bold-game border-4 border-roblox-blue-400"
                onClick={handleGetStarted}
              >
                🆓 Start Free! 🆓
              </Button>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-roblox-yellow-100 to-roblox-orange-100 rounded-3xl shadow-roblox-hover text-roblox-blue-800 p-8 relative transform scale-105 flex flex-col border-4 border-roblox-yellow-400">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                <div className="bg-roblox-red-500 text-white px-6 py-3 rounded-full text-lg font-bold-game border-4 border-roblox-red-700 shadow-roblox animate-bounce-gentle">
                  🌟 MOST POPULAR! 🌟
                </div>
              </div>

              <div className="flex-1">
                <div className="text-center mb-8 mt-4">
                  <div className="bg-roblox-yellow-500 rounded-full p-4 w-20 h-20 mx-auto mb-4 shadow-neon-yellow">
                    <Crown className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold-game text-roblox-yellow-700 mb-2">👑 Premium Plan</h3>
                  <div className="text-5xl font-bold-game text-roblox-orange-700 mb-2">
                    RM20<span className="text-xl font-game text-roblox-orange-600">/month</span>
                  </div>
                  <p className="text-roblox-yellow-700 font-game text-lg">Full access to all features! 🚀</p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center bg-roblox-green-50 p-3 rounded-2xl border-2 border-roblox-green-300">
                    <CheckCircle className="w-6 h-6 text-roblox-green-600 mr-3 flex-shrink-0" />
                    <span className="text-roblox-green-700 font-game font-bold">♾️ Unlimited exam papers</span>
                  </div>
                  <div className="flex items-center bg-roblox-green-50 p-3 rounded-2xl border-2 border-roblox-green-300">
                    <CheckCircle className="w-6 h-6 text-roblox-green-600 mr-3 flex-shrink-0" />
                    <span className="text-roblox-green-700 font-game font-bold">👨‍👩‍👧‍👦 Up to 3 children profiles</span>
                  </div>
                  <div className="flex items-center bg-roblox-green-50 p-3 rounded-2xl border-2 border-roblox-green-300">
                    <CheckCircle className="w-6 h-6 text-roblox-green-600 mr-3 flex-shrink-0" />
                    <span className="text-roblox-green-700 font-game font-bold">🎯 All difficulty levels</span>
                  </div>
                  <div className="flex items-center bg-roblox-green-50 p-3 rounded-2xl border-2 border-roblox-green-300">
                    <CheckCircle className="w-6 h-6 text-roblox-green-600 mr-3 flex-shrink-0" />
                    <span className="text-roblox-green-700 font-game font-bold">📈 Advanced analytics</span>
                  </div>
                  <div className="flex items-center bg-roblox-green-50 p-3 rounded-2xl border-2 border-roblox-green-300">
                    <CheckCircle className="w-6 h-6 text-roblox-green-600 mr-3 flex-shrink-0" />
                    <span className="text-roblox-green-700 font-game font-bold">🏆 Complete badge system</span>
                  </div>
                  <div className="flex items-center bg-roblox-green-50 p-3 rounded-2xl border-2 border-roblox-green-300">
                    <CheckCircle className="w-6 h-6 text-roblox-green-600 mr-3 flex-shrink-0" />
                    <span className="text-roblox-green-700 font-game font-bold">🎧 Priority support</span>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-roblox-blue-100 rounded-2xl border-2 border-roblox-blue-300">
                  <div className="flex items-center text-sm font-game font-bold text-roblox-blue-700">
                    <DollarSign className="w-5 h-5 mr-2" />
                    💰 Additional children: RM5/child/month
                  </div>
                </div>
              </div>

              <Button 
                className="w-full py-4 text-xl font-bold-game bg-gradient-to-r from-roblox-yellow-500 to-roblox-orange-500 text-white border-4 border-roblox-orange-600"
                onClick={handleGetStarted}
                glow={true}
              >
                <Crown className="w-6 h-6 mr-3" />
                👑 Get Premium! 👑
              </Button>
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 border-4 border-white/30 shadow-roblox">
              <p className="text-white text-2xl font-bold-game">
                🎉 <strong>Special Launch Offer:</strong> All users get premium access for free during our launch period! 🎉
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-roblox-blue-50 to-roblox-purple-50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-20 animate-float">
          <Star className="w-10 h-10 text-roblox-yellow-400 opacity-40" />
        </div>
        <div className="absolute bottom-20 right-20 animate-bounce-gentle">
          <Trophy className="w-12 h-12 text-roblox-green-400 opacity-40" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold-game text-roblox-blue-600 mb-6 animate-bounce-gentle">🌟 Why Choose KitaScore? 🌟</h2>
            <p className="text-2xl text-roblox-purple-600 max-w-3xl mx-auto font-game">
              🚀 We've reimagined exam preparation to make it engaging, effective, and enjoyable for both parents and children! 🚀
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-roblox hover:shadow-roblox-hover transition-all duration-300 transform hover:scale-105 border-4 border-roblox-blue-200">
              <div className="bg-roblox-blue-500 w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto shadow-neon-blue">
                <Star className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold-game text-roblox-blue-600 mb-4 text-center">🎮 Gamified Learning</h3>
              <p className="text-roblox-blue-700 font-game text-lg text-center">
                🌟 Earn XP points, unlock achievement badges, and celebrate milestones. Learning becomes an adventure, not a chore! 🌟
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-roblox hover:shadow-roblox-hover transition-all duration-300 transform hover:scale-105 border-4 border-roblox-green-200">
              <div className="bg-roblox-green-500 w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto shadow-neon-green">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold-game text-roblox-green-600 mb-4 text-center">📚 Comprehensive Question Bank</h3>
              <p className="text-roblox-green-700 font-game text-lg text-center">
                📖 Access thousands of past year questions across BM, BI, Mathematics, Science, and History for all levels! 📖
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-roblox hover:shadow-roblox-hover transition-all duration-300 transform hover:scale-105 border-4 border-roblox-purple-200">
              <div className="bg-roblox-purple-500 w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto shadow-neon-purple">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold-game text-roblox-purple-600 mb-4 text-center">🎯 Adaptive Practice Modes</h3>
              <p className="text-roblox-purple-700 font-game text-lg text-center">
                🎮 Choose from Easy (10 MCQs), Medium (20-30 mixed), or Full Mode (complete papers) based on your child's readiness! 🎮
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-roblox hover:shadow-roblox-hover transition-all duration-300 transform hover:scale-105 border-4 border-roblox-yellow-200">
              <div className="bg-roblox-yellow-500 w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto shadow-neon-yellow">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold-game text-roblox-yellow-600 mb-4 text-center">📈 Progress Tracking</h3>
              <p className="text-roblox-yellow-700 font-game text-lg text-center">
                📊 Monitor your children's learning journey with detailed analytics, performance reports, and improvement insights! 📊
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-roblox hover:shadow-roblox-hover transition-all duration-300 transform hover:scale-105 border-4 border-roblox-red-200">
              <div className="bg-roblox-red-500 w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto shadow-roblox">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold-game text-roblox-red-600 mb-4 text-center">👨‍👩‍👧‍👦 Family Dashboard</h3>
              <p className="text-roblox-red-700 font-game text-lg text-center">
                👪 Manage multiple children from one parent account. See everyone's progress at a glance and celebrate together! 👪
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-roblox hover:shadow-roblox-hover transition-all duration-300 transform hover:scale-105 border-4 border-roblox-orange-200">
              <div className="bg-roblox-orange-500 w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto shadow-roblox">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold-game text-roblox-orange-600 mb-4 text-center">🏆 Achievement System</h3>
              <p className="text-roblox-orange-700 font-game text-lg text-center">
                🎖️ Unlock badges for milestones like "First Perfect Score", "5-Day Streak", and "Subject Master" to keep motivation high! 🎖️
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute top-10 right-10 animate-float">
          <Gamepad2 className="w-12 h-12 text-roblox-blue-300 opacity-40" />
        </div>
        <div className="absolute bottom-10 left-10 animate-bounce-gentle">
          <Sparkles className="w-10 h-10 text-roblox-purple-300 opacity-40" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold-game text-roblox-blue-600 mb-6 animate-bounce-gentle">🎯 How KitaScore Works 🎯</h2>
            <p className="text-2xl text-roblox-purple-600 font-game">🚀 Simple steps to transform your child's exam preparation! 🚀</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center transform hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-r from-roblox-blue-500 to-roblox-blue-700 text-white rounded-full w-24 h-24 flex items-center justify-center text-4xl font-bold-game mx-auto mb-6 shadow-roblox-hover border-4 border-roblox-blue-800 animate-bounce-gentle">
                1
              </div>
              <div className="bg-roblox-blue-50 rounded-3xl p-6 border-4 border-roblox-blue-200 shadow-roblox">
                <h3 className="text-2xl font-bold-game text-roblox-blue-600 mb-4">👨‍👩‍👧‍👦 Create & Add Children</h3>
                <p className="text-roblox-blue-700 font-game text-lg">
                  🎯 Sign up as a parent and add your children's profiles with their school level and subjects! 🎯
                </p>
              </div>
            </div>

            <div className="text-center transform hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-r from-roblox-green-500 to-roblox-green-700 text-white rounded-full w-24 h-24 flex items-center justify-center text-4xl font-bold-game mx-auto mb-6 shadow-roblox-hover border-4 border-roblox-green-800 animate-bounce-gentle" style={{ animationDelay: '0.2s' }}>
                2
              </div>
              <div className="bg-roblox-green-50 rounded-3xl p-6 border-4 border-roblox-green-200 shadow-roblox">
                <h3 className="text-2xl font-bold-game text-roblox-green-600 mb-4">🎮 Choose Practice Mode</h3>
                <p className="text-roblox-green-700 font-game text-lg">
                  📚 Select subject and difficulty level. Our system generates randomized questions from past year papers! 📚
                </p>
              </div>
            </div>

            <div className="text-center transform hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-r from-roblox-purple-500 to-roblox-purple-700 text-white rounded-full w-24 h-24 flex items-center justify-center text-4xl font-bold-game mx-auto mb-6 shadow-roblox-hover border-4 border-roblox-purple-800 animate-bounce-gentle" style={{ animationDelay: '0.4s' }}>
                3
              </div>
              <div className="bg-roblox-purple-50 rounded-3xl p-6 border-4 border-roblox-purple-200 shadow-roblox">
                <h3 className="text-2xl font-bold-game text-roblox-purple-600 mb-4">📈 Practice & Progress</h3>
                <p className="text-roblox-purple-700 font-game text-lg">
                  🏆 Complete exercises, earn XP, unlock badges, and track improvement over time with detailed reports! 🏆
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section className="py-20 bg-gradient-to-br from-roblox-blue-50 via-roblox-purple-50 to-roblox-yellow-50 relative overflow-hidden">
        <div className="absolute top-20 left-20 animate-float">
          <BookOpen className="w-10 h-10 text-roblox-blue-400 opacity-40" />
        </div>
        <div className="absolute bottom-20 right-20 animate-wiggle">
          <Target className="w-12 h-12 text-roblox-green-400 opacity-40" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold-game text-roblox-blue-600 mb-6 animate-bounce-gentle">📚 Complete Subject Coverage 📚</h2>
            <p className="text-2xl text-roblox-purple-600 font-game">🎓 From Darjah 1 to Tingkatan 5, we've got all core subjects covered! 🎓</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { name: 'Bahasa Melayu', icon: '🇲🇾', color: 'bg-roblox-red-100 text-roblox-red-600 border-roblox-red-300' },
              { name: 'English', icon: '🇬🇧', color: 'bg-roblox-blue-100 text-roblox-blue-600 border-roblox-blue-300' },
              { name: 'Mathematics', icon: '🔢', color: 'bg-roblox-green-100 text-roblox-green-600 border-roblox-green-300' },
              { name: 'Science', icon: '🔬', color: 'bg-roblox-purple-100 text-roblox-purple-600 border-roblox-purple-300' },
              { name: 'History', icon: '📚', color: 'bg-roblox-yellow-100 text-roblox-yellow-600 border-roblox-yellow-300' }
            ].map((subject, index) => (
              <div key={index} className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 text-center shadow-roblox hover:shadow-roblox-hover transition-all duration-300 transform hover:scale-105 border-4 border-roblox-blue-200">
                <div className={`w-20 h-20 rounded-full ${subject.color} border-4 flex items-center justify-center text-4xl mx-auto mb-4 shadow-roblox`}>
                  {subject.icon}
                </div>
                <h3 className="font-bold-game text-roblox-blue-700 text-lg">{subject.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-roblox-blue-600 via-roblox-purple-600 to-roblox-blue-700 relative overflow-hidden">
        <div className="absolute top-10 left-10 animate-float">
          <Star className="w-12 h-12 text-roblox-yellow-300 opacity-60" />
        </div>
        <div className="absolute bottom-10 right-10 animate-bounce-gentle">
          <Trophy className="w-10 h-10 text-roblox-yellow-300 opacity-60" />
        </div>
        <div className="absolute top-1/2 left-20 animate-pulse">
          <Sparkles className="w-8 h-8 text-roblox-yellow-300 opacity-60" />
        </div>

        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border-4 border-white/30 shadow-roblox-hover">
            <h2 className="text-5xl font-bold-game text-white mb-6 animate-bounce-gentle">🚀 Ready to Transform Learning? 🚀</h2>
            <p className="text-2xl text-roblox-blue-100 mb-8 font-game">
              🎯 Join thousands of Malaysian families who are making exam preparation fun and effective with KitaScore! 🎯
            </p>
            <Button 
              size="xl" 
              onClick={handleGetStarted}
              variant="fun"
              glow={true}
              bounce={true}
              className="font-bold-game text-2xl px-12 py-6 mb-6"
            >
              <Star className="w-8 h-8 mr-3" />
              🌟 Start Free Today! 🌟
              <ArrowRight className="w-8 h-8 ml-3" />
            </Button>
            <p className="text-roblox-blue-200 text-lg font-game">✨ No credit card required • Set up in 2 minutes ✨</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-roblox-blue-900 text-white py-12 relative overflow-hidden">
        <div className="absolute top-5 right-5 animate-float">
          <GraduationCap className="w-8 h-8 text-roblox-blue-300 opacity-40" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-roblox-blue-500 rounded-full p-3 mr-4 shadow-neon-blue">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold-game text-roblox-blue-300">KitaScore</h3>
                <p className="text-roblox-purple-300 font-game">🎮 Powered by KITAMEN 🎮</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-roblox-blue-200 font-game">© 2025 KitaScore. All rights reserved.</p>
              <p className="text-roblox-purple-300 font-bold-game text-lg mt-1">🎯 We Score Together! 🎯</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}