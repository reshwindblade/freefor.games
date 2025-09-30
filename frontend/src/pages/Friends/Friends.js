import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import * as friendService from '../../services/friendService';
import * as userService from '../../services/userService';
import FriendButton from '../../components/friends/FriendButton';
import toast from 'react-hot-toast';

const Friends = () => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [searchUsers, setSearchUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadFriendsData();
    }
  }, [currentUser]);

  const loadFriendsData = async () => {
    setLoading(true);
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        friendService.getFriends(),
        friendService.getFriendRequests()
      ]);

      if (friendsRes.success) {
        setFriends(friendsRes.data.friends || []);
        setBlockedUsers(friendsRes.data.blocked || []);
      }

      if (requestsRes.success) {
        setPendingRequests(requestsRes.data.received || []);
        setSentRequests(requestsRes.data.sent || []);
      }
    } catch (error) {
      console.error('Failed to load friends data:', error);
      toast.error('Failed to load friends data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchUsers([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await userService.searchUsers(query);
      if (response.success) {
        // Filter out current user
        const filteredUsers = response.data.filter(user => user._id !== currentUser._id);
        setSearchUsers(filteredUsers);
      }
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const onStatusChange = () => {
    loadFriendsData();
    // Refresh search results to update friend buttons
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
    }
  };

  const renderUserCard = (user, showFriendButton = true, additionalActions = null) => (
    <div key={user._id} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <img
          src={user.avatar || '/api/placeholder/40/40'}
          alt={user.username}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <h3 className="text-white font-medium">{user.username}</h3>
          <p className="text-gray-400 text-sm">{user.email}</p>
          {user.bio && <p className="text-gray-300 text-sm mt-1">{user.bio}</p>}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {additionalActions}
        {showFriendButton && (
          <FriendButton user={user} onStatusChange={onStatusChange} />
        )}
      </div>
    </div>
  );

  const renderFriendsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Friends ({friends.length})</h2>
      </div>
      
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg p-4 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-32"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : friends.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-300">No friends yet</h3>
          <p className="mt-1 text-sm text-gray-500">Start by searching for users to add as friends.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {friends.map(friend => renderUserCard(friend))}
        </div>
      )}
    </div>
  );

  const renderRequestsTab = () => (
    <div className="space-y-6">
      {/* Pending Requests (Received) */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Friend Requests ({pendingRequests.length})</h2>
        {pendingRequests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No pending friend requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map(request => renderUserCard(request.requester))}
          </div>
        )}
      </div>

      {/* Sent Requests */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Sent Requests ({sentRequests.length})</h2>
        {sentRequests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No sent requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sentRequests.map(request => renderUserCard(request.recipient))}
          </div>
        )}
      </div>
    </div>
  );

  const renderSearchTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Find Friends</h2>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearchSubmit} className="flex space-x-2">
        <input
          type="text"
          placeholder="Search by username or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={searchLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition duration-200 flex items-center"
        >
          {searchLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          )}
        </button>
      </form>

      {/* Search Results */}
      {searchUsers.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Search Results</h3>
          {searchUsers.map(user => renderUserCard(user))}
        </div>
      )}

      {searchQuery && !searchLoading && searchUsers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">No users found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );

  const renderBlockedTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Blocked Users ({blockedUsers.length})</h2>
      </div>
      
      {blockedUsers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No blocked users</p>
        </div>
      ) : (
        <div className="space-y-4">
          {blockedUsers.map(user => renderUserCard(user))}
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'friends', label: 'Friends', count: friends.length },
    { id: 'requests', label: 'Requests', count: pendingRequests.length },
    { id: 'search', label: 'Find Friends', count: null },
    { id: 'blocked', label: 'Blocked', count: blockedUsers.length }
  ];

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Friends</h1>
          <p className="mt-2 text-gray-400">Manage your gaming network and connections</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-gray-800 rounded-lg p-6">
          {activeTab === 'friends' && renderFriendsTab()}
          {activeTab === 'requests' && renderRequestsTab()}
          {activeTab === 'search' && renderSearchTab()}
          {activeTab === 'blocked' && renderBlockedTab()}
        </div>
      </div>
    </div>
  );
};

export default Friends;