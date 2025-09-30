import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const searchUsers = async (query) => {
  try {
    const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
    return {
      success: true,
      data: response.data.users || []
    };
  } catch (error) {
    console.error('User search error:', error);
    const message = error.response?.data?.message || 'Search failed';
    toast.error(message);
    return {
      success: false,
      error: message
    };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return {
      success: true,
      data: response.data.user
    };
  } catch (error) {
    console.error('Get user profile error:', error);
    const message = error.response?.data?.message || 'Failed to get user profile';
    toast.error(message);
    return {
      success: false,
      error: message
    };
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/users/profile', profileData);
    toast.success('Profile updated successfully');
    return {
      success: true,
      data: response.data.user
    };
  } catch (error) {
    console.error('Update profile error:', error);
    const message = error.response?.data?.message || 'Failed to update profile';
    toast.error(message);
    return {
      success: false,
      error: message
    };
  }
};

export const uploadAvatar = async (file) => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    toast.success('Avatar updated successfully');
    return {
      success: true,
      data: response.data.avatarUrl
    };
  } catch (error) {
    console.error('Avatar upload error:', error);
    const message = error.response?.data?.message || 'Failed to upload avatar';
    toast.error(message);
    return {
      success: false,
      error: message
    };
  }
};

export const deleteAccount = async () => {
  try {
    await api.delete('/users/account');
    toast.success('Account deleted successfully');
    return {
      success: true
    };
  } catch (error) {
    console.error('Delete account error:', error);
    const message = error.response?.data?.message || 'Failed to delete account';
    toast.error(message);
    return {
      success: false,
      error: message
    };
  }
};