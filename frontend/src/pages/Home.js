import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Users, Shield, Gamepad2, Clock, Globe, User } from 'lucide-react';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  // Animations removed for now to reduce bundle and fix warnings

  // Particles removed for now

  // particles options removed

  const features = [
    {
      icon: Calendar,
      title: 'Smart Calendar Sync',
      description: 'Connect your Google Calendar to automatically show when you\'re busy, while keeping your gaming availability visible.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Users,
      title: 'Find Gaming Partners',
      description: 'Discover other gamers with overlapping free time and similar game preferences in your region.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Only show when you\'re available for games. Your private events stay private.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Globe,
      title: 'Public Profiles',
      description: 'Share your gaming availability with a simple link: freefor.games/yourusername',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Create Your Profile',
      description: 'Sign up and set your gaming preferences, platforms, and timezone.',
      icon: User
    },
    {
      number: '2',
      title: 'Set Your Availability',
      description: 'Connect your calendar or manually set when you\'re free to play games.',
      icon: Calendar
    },
    {
      number: '3',
      title: 'Share & Discover',
      description: 'Share your profile link and find other gamers with matching free time.',
      icon: Users
    }
  ];

  // animation variants removed

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gaming-600 to-gaming-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-gaming font-bold mb-6">
              Game Scheduling
              <br />
              <span className="text-gaming-200">Made Easy</span>
            </h1>
            <p className="text-xl md:text-2xl text-gaming-100 mb-8 max-w-3xl mx-auto">
              Show when you're free to play games. Find others with matching availability. 
              Connect your calendar and keep your gaming schedule organized.
            </p>
            
            {isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to={`/${user?.username}`}
                  className="btn-primary bg-white text-gaming-600 hover:bg-gray-100 text-lg px-8 py-3"
                >
                  View My Profile
                </Link>
                <Link
                  to="/explore"
                  className="btn-outline border-white text-white hover:bg-white hover:text-gaming-600 text-lg px-8 py-3"
                >
                  Explore Gamers
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="btn-primary bg-white text-gaming-600 hover:bg-gray-100 text-lg px-8 py-3"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/explore"
                  className="btn-outline border-white text-white hover:bg-white hover:text-gaming-600 text-lg px-8 py-3"
                >
                  Browse Profiles
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in just 3 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gaming-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built for Gamers
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to coordinate gaming sessions with friends and meet new players
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-6 text-center">
                <feature.icon className="h-12 w-12 text-gaming-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Profile Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Your Gaming Profile
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Share your availability with a clean, professional-looking profile
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="card p-8">
              <div className="flex items-center space-x-6 mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-gaming-400 to-gaming-600 rounded-full flex items-center justify-center">
                  <Gamepad2 className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">@your-username</h3>
                  <p className="text-gray-600">Your Display Name</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm text-gray-500">📍 Your Region</span>
                    <span className="text-sm text-gray-500">🕐 Your Timezone</span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Preferred Games</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Valorant', 'Apex Legends', 'Rocket League'].map((game, index) => (
                      <span key={index} className="px-3 py-1 bg-gaming-100 text-gaming-800 rounded-full text-sm">
                        {game}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Platforms</h4>
                  <div className="flex flex-wrap gap-2">
                    {['PC', 'PlayStation', 'Switch'].map((platform, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center space-x-2 text-gray-600">
                  <Clock className="h-5 w-5" />
                  <span>Weekly availability calendar would appear here</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-20 bg-gaming-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Gaming?
            </h2>
            <p className="text-xl text-gaming-100 mb-8 max-w-2xl mx-auto">
              Join thousands of gamers already using freefor.games to coordinate their gaming sessions.
            </p>
            <Link
              to="/register"
              className="btn-primary bg-white text-gaming-600 hover:bg-gray-100 text-lg px-8 py-3 inline-block"
            >
              Create Your Profile
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
