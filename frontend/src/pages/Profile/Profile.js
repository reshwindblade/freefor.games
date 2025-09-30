import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import AvailabilityCalendar from '../../components/Calendar/AvailabilityCalendar';
import FriendButton from '../../components/friends/FriendButton';
import { MapPin, Clock, Gamepad2, Edit, Calendar, Share } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [error, setError] = useState(null);

  const isOwnProfile = currentUser && currentUser.username === username;

  useEffect(() => {
    fetchProfile();
    fetchAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/profiles/${username}`);
      setProfile(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 404) {
        setError('Profile not found');
      } else {
        setError('Error loading profile');
      }
    }
    setLoading(false);
  };

  const fetchAvailability = async () => {
    try {
      setAvailabilityLoading(true);
      const response = await axios.get(`/api/availability/user/${username}`);
      setAvailability(response.data.availability || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
      setAvailability([]);
    }
    setAvailabilityLoading(false);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/${username}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.profile.displayName}'s Gaming Availability`,
          text: `Check out when ${profile.profile.displayName} is available to play games!`,
          url: url
        });
      } catch (error) {
        // User cancelled sharing or error occurred
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Profile link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gaming-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{error}</h2>
          <p className="text-gray-600 mb-6">
            {error === 'Profile not found' 
              ? "This profile doesn't exist or is private."
              : "Please try again later."
            }
          </p>
          <Link to="/explore" className="btn-primary">
            Browse Other Profiles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="card p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="flex items-center space-x-6 mb-6 md:mb-0">
              <div className="w-20 h-20 bg-gradient-to-br from-gaming-400 to-gaming-600 rounded-full flex items-center justify-center">
                {profile.profile.avatar ? (
                  <img
                    src={profile.profile.avatar}
                    alt={profile.profile.displayName}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <Gamepad2 className="h-10 w-10 text-white" />
                )}
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile.profile.displayName}
                </h1>
                <p className="text-lg text-gray-600">@{profile.username}</p>
                
                <div className="flex items-center space-x-4 mt-2">
                  {profile.profile.region && (
                    <div className="flex items-center space-x-1 text-gray-500">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.profile.region}</span>
                    </div>
                  )}
                  {profile.profile.timezone && (
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{profile.profile.timezone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleShare}
                className="btn-outline flex items-center space-x-2"
              >
                <Share className="h-4 w-4" />
                <span>Share</span>
              </button>
              
              {isOwnProfile ? (
                <>
                  <Link
                    to="/edit-profile"
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </Link>
                  <Link
                    to="/availability"
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Edit Calendar</span>
                  </Link>
                </>
              ) : (
                <FriendButton user={profile} />
              )}
            </div>
          </div>

          {/* Bio */}
          {profile.profile.bio && (
            <div className="mt-6">
              <p className="text-gray-700">{profile.profile.bio}</p>
            </div>
          )}

          {/* Gaming Info */}
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            {/* Platforms */}
            {profile.profile.platforms && profile.profile.platforms.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Platforms</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.profile.platforms.map((platform, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Preferred Games */}
            {profile.profile.preferredGames && profile.profile.preferredGames.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Preferred Games</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.profile.preferredGames.map((game, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gaming-100 text-gaming-800 rounded-full text-sm"
                    >
                      {game}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Availability Calendar */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Gaming Availability
            </h2>
            {isOwnProfile && (
              <Link
                to="/availability"
                className="btn-outline flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </Link>
            )}
          </div>

          {availabilityLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gaming-600"></div>
            </div>
          ) : (
            <>
              {availability.length > 0 ? (
                <>
                  <AvailabilityCalendar
                    events={availability}
                    editable={false}
                  />
                  
                  {/* Legend */}
                  <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span>Available for games</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span>Busy</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                      <span>Override</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No availability set
                  </h3>
                  <p className="text-gray-600">
                    {isOwnProfile 
                      ? "Set your gaming availability to let others know when you're free to play."
                      : "This user hasn't set their availability yet."
                    }
                  </p>
                  {isOwnProfile && (
                    <Link
                      to="/availability"
                      className="btn-primary mt-4"
                    >
                      Set Availability
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Last Active */}
        <div className="text-center mt-6 text-sm text-gray-500">
          Last active: {new Date(profile.lastActive).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default Profile;
