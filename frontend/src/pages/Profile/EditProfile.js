import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Save, User } from 'lucide-react';

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      displayName: user?.profile?.displayName || '',
      bio: user?.profile?.bio || '',
      timezone: user?.profile?.timezone || '',
      region: user?.profile?.region || '',
      isPublic: user?.profile?.isPublic !== false,
      preferredGames: user?.profile?.preferredGames?.join(', ') || '',
      platforms: user?.profile?.platforms || []
    }
  });

  const platforms = ['PC', 'PlayStation', 'Xbox', 'Switch', 'Mobile', 'VR'];

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      // Convert games string to array
      const preferredGames = data.preferredGames
        ? data.preferredGames.split(',').map(game => game.trim()).filter(game => game)
        : [];

      const updateData = {
        ...data,
        preferredGames
      };

      const response = await axios.put('/api/profiles/me', updateData);
      
      // Update user context
      updateUser({
        profile: response.data.profile
      });

      toast.success('Profile updated successfully!');
      navigate(`/${user.username}`);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card p-8">
          <div className="flex items-center space-x-3 mb-8">
            <User className="h-8 w-8 text-gaming-600" />
            <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              <input
                {...register('displayName', {
                  required: 'Display name is required',
                  maxLength: {
                    value: 50,
                    message: 'Display name must be less than 50 characters'
                  }
                })}
                type="text"
                className="input-field"
                placeholder="How you want to be known"
              />
              {errors.displayName && (
                <p className="mt-1 text-sm text-red-600">{errors.displayName.message}</p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                {...register('bio', {
                  maxLength: {
                    value: 500,
                    message: 'Bio must be less than 500 characters'
                  }
                })}
                rows={4}
                className="input-field"
                placeholder="Tell others about yourself and your gaming style..."
              />
              {errors.bio && (
                <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
              )}
            </div>

            {/* Region & Timezone */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Region
                </label>
                <input
                  {...register('region')}
                  type="text"
                  className="input-field"
                  placeholder="e.g., US West, EU, Asia"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select {...register('timezone')} className="input-field">
                  <option value="">Select timezone...</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">GMT (London)</option>
                  <option value="Europe/Paris">CET (Paris)</option>
                  <option value="Asia/Tokyo">JST (Tokyo)</option>
                  <option value="Asia/Shanghai">CST (Shanghai)</option>
                  <option value="Australia/Sydney">AEST (Sydney)</option>
                </select>
              </div>
            </div>

            {/* Preferred Games */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Games
              </label>
              <input
                {...register('preferredGames')}
                type="text"
                className="input-field"
                placeholder="Valorant, Apex Legends, Rocket League (comma separated)"
              />
              <p className="mt-1 text-sm text-gray-500">
                Separate multiple games with commas
              </p>
            </div>

            {/* Platforms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gaming Platforms
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {platforms.map((platform) => (
                  <label key={platform} className="flex items-center space-x-2">
                    <input
                      {...register('platforms')}
                      type="checkbox"
                      value={platform}
                      className="rounded border-gray-300 text-gaming-600 focus:ring-gaming-500"
                    />
                    <span className="text-sm text-gray-700">{platform}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Privacy */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy Settings</h3>
              <label className="flex items-center space-x-2">
                <input
                  {...register('isPublic')}
                  type="checkbox"
                  className="rounded border-gray-300 text-gaming-600 focus:ring-gaming-500"
                />
                <span className="text-sm text-gray-700">
                  Make my profile public (allow others to find and view my profile)
                </span>
              </label>
              <p className="mt-2 text-sm text-gray-500">
                If unchecked, only you can view your profile and others won't be able to find you in search.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate(`/${user.username}`)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary flex items-center space-x-2"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
