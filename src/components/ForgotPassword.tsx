import { useState } from 'react';
import { ArrowLeft, Mail, Zap, CheckCircle, ArrowRight } from 'lucide-react';

interface ForgotPasswordProps {
  onBack: () => void;
  onBackToLogin: () => void;
}

export function ForgotPassword({ onBack, onBackToLogin }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (!email) {
      setError('Email is required');
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    // Simulate password reset process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2523ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20"></div>
        
        <div className="relative w-full max-w-md mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="relative">
                <Zap className="w-12 h-12 text-cyan-400" />
                <div className="absolute inset-0 animate-pulse">
                  <Zap className="w-12 h-12 text-cyan-300 opacity-50" />
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-white">summoned.spaces</h1>
                <p className="text-sm text-cyan-300 opacity-80">Quantum-Inspired Collaboration</p>
              </div>
            </div>
          </div>

          {/* Success Card */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">Check Your Email</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              We've sent a quantum-encrypted password reset link to{' '}
              <span className="text-cyan-400 font-medium">{email}</span>
            </p>
            
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-300 leading-relaxed">
                The reset link will expire in <span className="text-cyan-400 font-medium">15 minutes</span> for security. 
                If you don't see the email, check your spam folder.
              </p>
            </div>

            <button
              onClick={onBackToLogin}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white 
                       rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all 
                       duration-200 font-medium shadow-lg hover:shadow-xl flex items-center 
                       justify-center space-x-2"
            >
              <span>Return to Login</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Resend Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Didn't receive the email?{' '}
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setEmail('');
                }}
                className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
              >
                Try again
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2523ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20"></div>
      
      <div className="relative w-full max-w-md mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="relative">
              <Zap className="w-12 h-12 text-cyan-400" />
              <div className="absolute inset-0 animate-pulse">
                <Zap className="w-12 h-12 text-cyan-300 opacity-50" />
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-white">summoned.spaces</h1>
              <p className="text-sm text-cyan-300 opacity-80">Quantum-Inspired Collaboration</p>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Reset Your Quantum Key</h2>
            <p className="text-gray-400">Enter your email to receive a secure reset link</p>
          </div>
        </div>

        {/* Reset Form */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg text-white 
                           placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 
                           focus:border-transparent transition-colors ${
                    error ? 'border-red-500' : 'border-white/10'
                  }`}
                  placeholder="your@email.com"
                  required
                />
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
              <p className="text-sm text-gray-300 leading-relaxed">
                We'll send you a secure quantum-encrypted link to reset your password. 
                The link will expire in 15 minutes for your security.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white 
                       rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all 
                       duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 
                       disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sending Quantum Link...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              onClick={onBackToLogin}
              className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium 
                       flex items-center space-x-2 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 text-center text-sm text-gray-500 space-y-2">
          <p>All password resets are quantum-encrypted</p>
          <p>Your privacy and security are our top priority</p>
        </div>
      </div>
    </div>
  );
}