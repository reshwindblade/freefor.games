import axios from 'axios';
import toast from 'react-hot-toast';

export const sendFriendRequest = async (userId, notes = '') => {
  try {
    const response = await axios.post(`/api/friends/request/${userId}`, { notes });
    toast.success('Friend request sent!');
    return { success: true, data: response.data };
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to send friend request';
    toast.error(message);
    return { success: false, error: message };
  }
};

export const acceptFriendRequest = async (friendshipId) => {
  try {
    const response = await axios.post(`/api/friends/accept/${friendshipId}`);
    toast.success('Friend request accepted!');
    return { success: true, data: response.data };
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to accept friend request';
    toast.error(message);
    return { success: false, error: message };
  }
};

export const declineFriendRequest = async (friendshipId) => {
  try {
    const response = await axios.post(`/api/friends/decline/${friendshipId}`);
    toast.success('Friend request declined');
    return { success: true, data: response.data };
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to decline friend request';
    toast.error(message);
    return { success: false, error: message };
  }
};

export const cancelFriendRequest = async (friendshipId) => {
  try {
    await axios.delete(`/api/friends/cancel/${friendshipId}`);
    toast.success('Friend request cancelled');
    return { success: true };
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to cancel friend request';
    toast.error(message);
    return { success: false, error: message };
  }
};

export const removeFriend = async (friendshipId) => {
  try {
    await axios.delete(`/api/friends/remove/${friendshipId}`);
    toast.success('Friend removed');
    return { success: true };
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to remove friend';
    toast.error(message);
    return { success: false, error: message };
  }
};

export const blockUser = async (userId) => {
  try {
    const response = await axios.post(`/api/friends/block/${userId}`);
    toast.success('User blocked successfully');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Block user error:', error);
    const message = error.response?.data?.message || 'Failed to block user';
    toast.error(message);
    return {
      success: false,
      error: message
    };
  }
};

export const unblockUser = async (userId) => {
  try {
    const response = await axios.post(`/api/friends/unblock/${userId}`);
    toast.success('User unblocked successfully');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Unblock user error:', error);
    const message = error.response?.data?.message || 'Failed to unblock user';
    toast.error(message);
    return {
      success: false,
      error: message
    };
  }
};

export const getFriends = async (status = 'accepted', page = 1, limit = 20) => {
  try {
    const response = await axios.get('/api/friends', {
      params: { status, page, limit }
    });
    return { success: true, data: response.data };
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch friends';
    return { success: false, error: message };
  }
};

export const getFriendRequests = async () => {
  try {
    const [receivedRes, sentRes] = await Promise.all([
      getReceivedRequests(),
      getSentRequests()
    ]);
    
    return {
      success: true,
      data: {
        received: receivedRes.success ? receivedRes.data.requests || [] : [],
        sent: sentRes.success ? sentRes.data.requests || [] : []
      }
    };
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch friend requests';
    return { success: false, error: message };
  }
};

export const getReceivedRequests = async (page = 1, limit = 20) => {
  try {
    const response = await axios.get('/api/friends/requests/received', {
      params: { page, limit }
    });
    return { success: true, data: response.data };
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch friend requests';
    return { success: false, error: message };
  }
};

export const getSentRequests = async (page = 1, limit = 20) => {
  try {
    const response = await axios.get('/api/friends/requests/sent', {
      params: { page, limit }
    });
    return { success: true, data: response.data };
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch sent requests';
    return { success: false, error: message };
  }
};

export const getFriendshipStatus = async (userId) => {
  try {
    const response = await axios.get(`/api/friends/status/${userId}`);
    return { success: true, data: response.data };
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to get friendship status';
    return { success: false, error: message };
  }
};

export const getBlockedUsers = async (page = 1, limit = 20) => {
  try {
    const response = await axios.get('/api/friends/blocked', {
      params: { page, limit }
    });
    return { success: true, data: response.data };
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch blocked users';
    return { success: false, error: message };
  }
};