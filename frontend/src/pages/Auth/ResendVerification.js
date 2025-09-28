import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Mail, Send, CheckCircle, ArrowLeft } from 'lucide-react';

const ResendVerification = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/auth/resend-verification', {
        email: data.email
      });

      setEmailSent(true);
      setSentEmail(data.email);
      toast.success(response.data.message);

    } catch (error) {
      console.error('Resend verification error:', error);
      toast.error(error.response?.data?.message || 'Failed to send verification email');
    }
    
    setIsLoading(false);
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gaming-900 via-gaming-800 to-purple-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            
            <div className="mx-auto mb-6 h-12 w-12 text-green-500">
              <CheckCircle className="h-full w-full" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Verification Email Sent! 📧
            </h2>
            
            <p className="text-gray-600 mb-6">
              We've sent a new verification email to:
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="font-semibold text-gaming-600">{sentEmail}</p>
            </div>
            
            <div className="space-y-4 text-left mb-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-gaming-100 rounded-full flex items-center justify-center text-xs font-bold text-gaming-600 mt-0.5">1</div>
                <p className="text-sm text-gray-600">Check your inbox for an email from FreeFor.Games</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-gaming-100 rounded-full flex items-center justify-center text-xs font-bold text-gaming-600 mt-0.5">2</div>
                <p className="text-sm text-gray-600">Click the verification link in the email</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-gaming-100 rounded-full flex items-center justify-center text-xs font-bold text-gaming-600 mt-0.5">3</div>
                <p className="text-sm text-gray-600">Return here to log in and start gaming!</p>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                to="/login"
                className="btn-primary w-full"
              >
                Go to Login
              </Link>
              
              <button
                onClick={() => {
                  setEmailSent(false);
                  setSentEmail('');
                }}
                className="btn-secondary w-full"
              >
                Send to Different Email
              </button>
            </div>

            <div className="mt-6 p-4 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Don't see the email?</strong><br />
                Check your spam/junk folder or wait a few minutes before trying again.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gaming-900 via-gaming-800 to-purple-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-gaming-500 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Resend Verification
          </h1>
          <p className="text-gaming-200">
            Enter your email to receive a new verification link
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Invalid email address'
                  }
                })}
                className={`input-field ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                placeholder="Enter your email address"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Verification Email</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center space-y-4">
          <Link 
            to="/login"
            className="inline-flex items-center space-x-2 text-gaming-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Login</span>
          </Link>
          
          <div className="text-gaming-200 text-sm">
            <p>
              Need a new account?{' '}
              <Link to="/register" className="text-gaming-400 hover:underline">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResendVerification;