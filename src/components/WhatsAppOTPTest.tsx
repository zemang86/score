import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Result {
  success: boolean;
  phone?: string;
  data?: any;
  error?: any;
  timestamp: string;
}

const WhatsAppOTPTest: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('+60164446716');
  const [otpToken, setOtpToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [step, setStep] = useState<'send' | 'verify'>('send');
  const [currentPhoneNumber, setCurrentPhoneNumber] = useState('');

  // Check environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const isConfigured = supabaseUrl && supabaseKey && 
    supabaseUrl !== 'https://YOUR_PROJECT.supabase.co' && 
    supabaseKey !== 'YOUR_ANON_KEY';

  useEffect(() => {
    if (!isConfigured) {
      setResult({
        success: false,
        error: { message: 'Please update your .env file with your actual Supabase credentials before testing.' },
        timestamp: new Date().toISOString()
      });
    }
  }, [isConfigured]);

  const sendOTP = async () => {
    if (!phoneNumber) {
      setResult({
        success: false,
        error: { message: 'Please enter a phone number' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!phoneNumber.startsWith('+')) {
      setResult({
        success: false,
        error: { message: 'Phone number must include country code (e.g., +60123456789)' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    try {
      setLoading(true);
      setLoadingText('Sending OTP to WhatsApp...');
      setResult(null);

      // Send OTP via WhatsApp
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
        options: { 
          channel: 'whatsapp' // ✅ WhatsApp channel
        }
      });

      setLoading(false);

      if (error) {
        console.error('Error sending OTP:', error);
        setResult({
          success: false,
          phone: phoneNumber,
          error: error,
          timestamp: new Date().toISOString()
        });
      } else {
        console.log('OTP sent:', data);
        setCurrentPhoneNumber(phoneNumber);
        setStep('verify');
        setResult({
          success: true,
          phone: phoneNumber,
          data: data,
          timestamp: new Date().toISOString()
        });
      }

    } catch (err) {
      setLoading(false);
      const error = err as Error;
      setResult({
        success: false,
        phone: phoneNumber,
        error: { message: error.message },
        timestamp: new Date().toISOString()
      });
      console.error('Exception:', err);
    }
  };

  const verifyOTP = async () => {
    if (!otpToken) {
      setResult({
        success: false,
        error: { message: 'Please enter the OTP token' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (otpToken.length !== 6) {
      setResult({
        success: false,
        error: { message: 'OTP must be 6 digits' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    try {
      setLoading(true);
      setLoadingText('Verifying OTP...');
      setResult(null);

      // Verify OTP
      const { data, error } = await supabase.auth.verifyOtp({
        phone: currentPhoneNumber,
        token: otpToken,
        type: 'sms' // ✅ Always 'sms' for phone OTPs (even WhatsApp)
      });

      setLoading(false);

      const result: Result = {
        success: !error,
        phone: currentPhoneNumber,
        data: data,
        error: error,
        timestamp: new Date().toISOString()
      };

      setResult(result);

      // Log to console as well
      console.log('Verification result:', result);

      if (!error) {
        console.log('✅ User session:', data.session);
        console.log('✅ User info:', data.user);
      }

    } catch (err) {
      setLoading(false);
      const error = err as Error;
      setResult({
        success: false,
        phone: currentPhoneNumber,
        error: { message: error.message },
        timestamp: new Date().toISOString()
      });
      console.error('Exception:', err);
    }
  };

  const resetForm = () => {
    setOtpToken('');
    setCurrentPhoneNumber('');
    setStep('send');
    setResult(null);
  };

  const handlePhoneKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendOTP();
    }
  };

  const handleOtpKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      verifyOTP();
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          WhatsApp OTP Test
        </h1>
        
        {/* Configuration Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Configuration</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConfigured ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {isConfigured ? 'Supabase configured' : 'Update your .env file with Supabase credentials'}
              </span>
            </div>
            {!isConfigured && (
              <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                <div>VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co</div>
                <div>VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY</div>
              </div>
            )}
          </div>
        </div>

        {/* Step 1: Send OTP */}
        <div className={`mb-6 transition-opacity duration-300 ${
          step === 'verify' ? 'opacity-50 pointer-events-none' : 'opacity-100'
        }`}>
          <h3 className="font-semibold text-gray-700 mb-4">Step 1: Send OTP</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              onKeyPress={handlePhoneKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your phone number (+60123456789)"
            />
          </div>

          <button
            onClick={sendOTP}
            disabled={loading || !isConfigured}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            📱 Send WhatsApp OTP
          </button>
        </div>

        {/* Step 2: Verify OTP */}
        <div className={`mb-6 transition-opacity duration-300 ${
          step === 'send' ? 'opacity-50 pointer-events-none' : 'opacity-100'
        }`}>
          <h3 className="font-semibold text-gray-700 mb-4">Step 2: Verify OTP</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OTP Token
            </label>
            <input
              type="text"
              value={otpToken}
              onChange={(e) => setOtpToken(e.target.value)}
              onKeyPress={handleOtpKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter the 6-digit OTP from WhatsApp"
              maxLength={6}
            />
          </div>

          <button
            onClick={verifyOTP}
            disabled={loading || !isConfigured}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            ✅ Verify OTP
          </button>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="mt-4 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-gray-600 mt-2">{loadingText}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className={`mt-6 p-4 rounded-md ${
            result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <h3 className="font-semibold mb-2">Result:</h3>
            <pre className={`text-sm p-2 rounded overflow-auto ${
              result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {/* Reset button */}
        {step === 'verify' && (
          <div className="mt-4">
            <button
              onClick={resetForm}
              className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-200"
            >
              🔄 Reset & Send New OTP
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppOTPTest;