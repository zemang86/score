import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'

export function LandingPage() {
  const navigate = useNavigate()

  const handleGetStarted = () => {
    console.log('🚀 Navigating to auth page...')
    navigate('/auth')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Landing Page Test</h1>
        <p className="text-xl text-gray-600 mb-8">This is a simplified version to test if the page loads correctly.</p>
        <Button 
          onClick={handleGetStarted}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Get Started
        </Button>
      </div>
    </div>
  )
}