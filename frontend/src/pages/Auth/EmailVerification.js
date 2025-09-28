import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CheckCircle, AlertCircle, Mail, ArrowRight } from 'lucide-react';

const EmailVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await axios.get(`/api/auth/verify-email/${token}`);
      
      setVerificationStatus('success');
      setMessage(response.data.message);
      setUserData(response.data.user);
      
      toast.success('Email verified successfully!');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Email verified! You can now log in.',
            email: response.data.user.email
          }
        });
      }, 3000);

    } catch (error) {
      console.error('Email verification error:', error);
      setVerificationStatus('error');
      
      const errorMessage = error.response?.data?.message || 'Failed to verify email';
      setMessage(errorMessage);
      
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gaming-900 via-gaming-800 to-purple-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          
          {verificationStatus === 'verifying' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gaming-500 mx-auto mb-6"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Verifying Email...
              </h2>
              <p className="text-gray-600">
                Please wait while we verify your email address.
              </p>
            </>
          )}

          {verificationStatus === 'success' && (
            <>
              <div className="mx-auto mb-6 h-12 w-12 text-green-500">
                <CheckCircle className="h-full w-full" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Email Verified! 🎉
              </h2>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              
              {userData && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Welcome to FreeFor.Games!</h3>
                  <p className="text-sm text-gray-600">
                    <strong>Username:</strong> {userData.username}<br />
                    <strong>Email:</strong> {userData.email}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <Link
                  to="/login"
                  state={{ 
                    message: 'Email verified! You can now log in.',
                    email: userData?.email
                  }}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  <span>Continue to Login</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                
                <p className="text-sm text-gray-500">
                  Redirecting to login in 3 seconds...
                </p>
              </div>
            </>
          )}

          {verificationStatus === 'error' && (
            <>
              <div className="mx-auto mb-6 h-12 w-12 text-red-500">
                <AlertCircle className="h-full w-full" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Verification Failed
              </h2>
              <p className="text-gray-600 mb-6">
                {message}
              </p>

              <div className="space-y-3">
                <Link
                  to="/resend-verification"
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  <Mail className="h-4 w-4" />
                  <span>Resend Verification Email</span>
                </Link>
                
                <Link
                  to="/register"
                  className="btn-secondary w-full"
                >
                  Back to Registration
                </Link>
              </div>
            </>
          )}

        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-gray-300 text-sm">
            Having trouble? Contact support or{' '}
            <Link to="/register" className="text-gaming-400 hover:underline">
              create a new account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;