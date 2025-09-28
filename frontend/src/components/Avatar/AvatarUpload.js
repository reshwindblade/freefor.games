import React, { useState, useRef } from 'react';
import { Camera, Upload, Trash2, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AvatarUpload = ({ currentAvatar, onAvatarUpdate }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload the file
    uploadAvatar(file);
  };

  const uploadAvatar = async (file) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await axios.post('/api/profiles/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Avatar updated successfully!');
      onAvatarUpdate(response.data.avatar);
      setPreview(null);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error(error.response?.data?.message || 'Failed to upload avatar');
      setPreview(null);
    }
    
    setIsUploading(false);
  };

  const deleteAvatar = async () => {
    setIsUploading(true);
    
    try {
      await axios.delete('/api/profiles/avatar');
      toast.success('Avatar deleted successfully!');
      onAvatarUpdate('');
    } catch (error) {
      console.error('Error deleting avatar:', error);
      toast.error(error.response?.data?.message || 'Failed to delete avatar');
    }
    
    setIsUploading(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative group">
        {/* Avatar Display */}
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
          {preview ? (
            <img
              src={preview}
              alt="Avatar preview"
              className="w-full h-full object-cover"
            />
          ) : currentAvatar ? (
            <img
              src={currentAvatar}
              alt="Current avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gaming-500 to-gaming-600">
              <Camera className="h-8 w-8 text-white" />
            </div>
          )}
        </div>

        {/* Loading Overlay */}
        {isUploading && (
          <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}

        {/* Preview Controls */}
        {preview && (
          <button
            onClick={clearPreview}
            className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Upload Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        
        <button
          type="button"
          onClick={triggerFileInput}
          disabled={isUploading}
          className="btn-primary flex items-center space-x-2 text-sm"
        >
          <Upload className="h-4 w-4" />
          <span>{currentAvatar ? 'Change Avatar' : 'Upload Avatar'}</span>
        </button>

        {currentAvatar && (
          <button
            type="button"
            onClick={deleteAvatar}
            disabled={isUploading}
            className="btn-secondary flex items-center space-x-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            <span>Remove</span>
          </button>
        )}
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          Upload a square image for best results. Max size: 5MB
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Supported formats: JPG, PNG, GIF, WebP
        </p>
      </div>
    </div>
  );
};

export default AvatarUpload;