import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import * as friendService from '../../services/friendService';

const FriendButton = ({ user, onStatusChange }) => {
  const { user: currentUser } = useAuth();
  const [friendshipStatus, setFriendshipStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (currentUser && user && user._id !== currentUser._id) {
      loadFriendshipStatus();
    }
  }, [currentUser, user]);

  const loadFriendshipStatus = async () => {
    try {
      const response = await friendService.getFriendshipStatus(user._id);
      if (response.success) {
        setFriendshipStatus(response.data);
      }
    } catch (error) {
      console.error('Failed to load friendship status:', error);
    }
  };

  const handleSendRequest = async () => {
    setLoading(true);
    const result = await friendService.sendFriendRequest(user._id);
    if (result.success) {
      await loadFriendshipStatus();
      onStatusChange?.();
    }
    setLoading(false);
  };

  const handleAcceptRequest = async () => {
    setLoading(true);
    const result = await friendService.acceptFriendRequest(friendshipStatus.friendship._id);
    if (result.success) {
      await loadFriendshipStatus();
      onStatusChange?.();
    }
    setLoading(false);
  };

  const handleDeclineRequest = async () => {
    setLoading(true);
    const result = await friendService.declineFriendRequest(friendshipStatus.friendship._id);
    if (result.success) {
      await loadFriendshipStatus();
      onStatusChange?.();
    }
    setLoading(false);
  };

  const handleCancelRequest = async () => {
    setLoading(true);
    const result = await friendService.cancelFriendRequest(friendshipStatus.friendship._id);
    if (result.success) {
      await loadFriendshipStatus();
      onStatusChange?.();
    }
    setLoading(false);
  };

  const handleRemoveFriend = async () => {
    setLoading(true);
    const result = await friendService.removeFriend(friendshipStatus.friendship._id);
    if (result.success) {
      await loadFriendshipStatus();
      onStatusChange?.();
    }
    setLoading(false);
    setShowConfirm(false);
  };

  const handleBlockUser = async () => {
    setLoading(true);
    const result = await friendService.blockUser(user._id);
    if (result.success) {
      await loadFriendshipStatus();
      onStatusChange?.();
    }
    setLoading(false);
  };

  // Don't show button for current user
  if (!currentUser || !user || user._id === currentUser._id) {
    return null;
  }

  if (!friendshipStatus) {
    return (
      <div className="w-32 h-10 bg-gray-700 animate-pulse rounded-lg"></div>
    );
  }

  const { status, isRequester } = friendshipStatus;

  // Handle different friendship states
  const renderButton = () => {
    switch (status) {
      case 'none':
        return (
          <button
            onClick={handleSendRequest}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
              </svg>
            )}
            Add Friend
          </button>
        );

      case 'pending':
        if (isRequester) {
          // User sent the request
          return (
            <button
              onClick={handleCancelRequest}
              disabled={loading}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              )}
              Cancel Request
            </button>
          );
        } else {
          // User received the request
          return (
            <div className="flex space-x-2">
              <button
                onClick={handleAcceptRequest}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-medium py-2 px-3 rounded-lg transition duration-200 flex items-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </button>
              <button
                onClick={handleDeclineRequest}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-medium py-2 px-3 rounded-lg transition duration-200 flex items-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                )}
              </button>
            </div>
          );
        }

      case 'accepted':
        return (
          <div className="relative">
            <button
              onClick={() => setShowConfirm(!showConfirm)}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Friends
            </button>
            
            {showConfirm && (
              <div className="absolute top-full left-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 min-w-[200px]">
                <button
                  onClick={handleRemoveFriend}
                  disabled={loading}
                  className="w-full text-left px-4 py-3 text-red-400 hover:bg-gray-700 transition duration-200 flex items-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400 mr-2"></div>
                  ) : (
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  )}
                  Remove Friend
                </button>
                <button
                  onClick={handleBlockUser}
                  disabled={loading}
                  className="w-full text-left px-4 py-3 text-red-400 hover:bg-gray-700 transition duration-200 flex items-center border-t border-gray-700"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"></path>
                  </svg>
                  Block User
                </button>
              </div>
            )}
          </div>
        );

      case 'blocked':
        if (isRequester) {
          return (
            <button
              onClick={() => friendService.unblockUser(user._id).then(() => {
                loadFriendshipStatus();
                onStatusChange?.();
              })}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"></path>
              </svg>
              Unblock
            </button>
          );
        } else {
          return (
            <button
              disabled
              className="bg-gray-600 text-gray-400 font-medium py-2 px-4 rounded-lg cursor-not-allowed flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"></path>
              </svg>
              Blocked
            </button>
          );
        }

      default:
        return null;
    }
  };

  return (
    <div className="relative">
      {renderButton()}
    </div>
  );
};

export default FriendButton;