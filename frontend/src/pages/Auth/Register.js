import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Gamepad2, Check, X, Mail, CheckCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';

const Register = () => {
  const { register: registerUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const watchedUsername = watch('username');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Check username availability
  useEffect(() => {
    const checkUsername = async () => {
      if (watchedUsername && watchedUsername.length >= 3) {
        setCheckingUsername(true);
        try {
          const response = await axios.get(`/api/profiles/check-username/${watchedUsername}`);
          setUsernameAvailable(response.data.available);
        } catch (error) {
          setUsernameAvailable(false);
        }
        setCheckingUsername(false);
      } else {
        setUsernameAvailable(null);
      }
    };

    const debounceTimer = setTimeout(checkUsername, 500);
    return () => clearTimeout(debounceTimer);
  }, [watchedUsername]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await registerUser(data.username, data.email, data.password);
    setIsLoading(false);
    
    if (result.success) {
      if (result.requiresVerification) {
        // Show success message and verification instructions
        setRegistrationSuccess({
          email: result.user.email,
          username: result.user.username
        });
      } else {
        // Direct login (legacy path)
        navigate('/');
      }
    }
  };

  const getUsernameValidation = () => {
    if (!watchedUsername || watchedUsername.length < 3) return null;
    if (checkingUsername) return 'checking';
    return usernameAvailable ? 'available' : 'taken';
  };

  const usernameStatus = getUsernameValidation();

  // Show success screen if registration completed
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gaming-900 via-gaming-800 to-purple-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            
            <div className="mx-auto mb-6 h-12 w-12 text-green-500">
              <CheckCircle className="h-full w-full" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Account Created! 🎉
            </h2>
            
            <p className="text-gray-600 mb-6">
              Welcome to FreeFor.Games, <strong>{registrationSuccess.username}</strong>!
            </p>
            
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <Mail className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Check Your Email</h3>
              </div>
              <p className="text-sm text-blue-800">
                We've sent a verification email to:
              </p>
              <p className="font-semibold text-blue-900 mt-1">
                {registrationSuccess.email}
              </p>
            </div>
            
            <div className="space-y-4 text-left mb-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-gaming-100 rounded-full flex items-center justify-center text-xs font-bold text-gaming-600 mt-0.5">1</div>
                <p className="text-sm text-gray-600">Open the email from FreeFor.Games</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-gaming-100 rounded-full flex items-center justify-center text-xs font-bold text-gaming-600 mt-0.5">2</div>
                <p className="text-sm text-gray-600">Click the verification link</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-gaming-100 rounded-full flex items-center justify-center text-xs font-bold text-gaming-600 mt-0.5">3</div>
                <p className="text-sm text-gray-600">Log in and start exploring!</p>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                to="/login"
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <span>Go to Login</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              
              <Link
                to="/resend-verification"
                state={{ email: registrationSuccess.email }}
                className="btn-secondary w-full"
              >
                Didn't get the email? Resend
              </Link>
            </div>

            <div className="mt-6 p-4 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Don't see the email?</strong><br />
                Check your spam folder and make sure {registrationSuccess.email} is correct.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Gamepad2 className="h-12 w-12 text-gaming-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-gaming-600 hover:text-gaming-500"
            >
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="relative">
                <input
                  {...register('username', {
                    required: 'Username is required',
                    minLength: {
                      value: 3,
                      message: 'Username must be at least 3 characters'
                    },
                    maxLength: {
                      value: 30,
                      message: 'Username must be less than 30 characters'
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_-]+$/,
                      message: 'Username can only contain letters, numbers, hyphens, and underscores'
                    }
                  })}
                  type="text"
                  autoComplete="username"
                  className={`input-field pr-10 ${errors.username ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Choose a username"
                />
                
                {/* Username status indicator */}
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {usernameStatus === 'checking' && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gaming-600"></div>
                  )}
                  {usernameStatus === 'available' && (
                    <Check className="h-5 w-5 text-green-500" />
                  )}
                  {usernameStatus === 'taken' && (
                    <X className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
              
              {/* Username feedback */}
              {watchedUsername && watchedUsername.length >= 3 && (
                <div className="mt-1">
                  {usernameStatus === 'available' && (
                    <p className="text-sm text-green-600">
                      Great! This username is available
                    </p>
                  )}
                  {usernameStatus === 'taken' && (
                    <p className="text-sm text-red-600">
                      This username is already taken
                    </p>
                  )}
                </div>
              )}
              
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
              
              <p className="mt-1 text-sm text-gray-500">
                Your profile will be available at freefor.games/{watchedUsername || 'username'}
              </p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email address'
                  }
                })}
                type="email"
                autoComplete="email"
                className={`input-field ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`input-field pr-10 ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || usernameStatus === 'taken' || usernameStatus === 'checking'}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gaming-600 hover:bg-gaming-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gaming-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                'Create account'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              By creating an account, you agree to share your gaming availability publicly
              and allow others to find you based on your gaming preferences.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
