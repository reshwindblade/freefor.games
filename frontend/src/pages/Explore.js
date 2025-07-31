import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, MapPin, Clock, Gamepad2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Explore = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    game: '',
    platform: '',
    region: '',
    page: 1
  });
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchProfiles();
  }, [filters]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await axios.get(`/api/profiles?${params}`);
      setProfiles(response.data.profiles);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/users/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const platforms = ['PC', 'PlayStation', 'Xbox', 'Switch', 'Mobile', 'VR'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Explore Gamers
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Discover gaming partners with matching availability and game preferences
          </p>
        </div>

        {/* Stats */}
        {stats.totalUsers && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-gaming-600">{stats.totalUsers}</div>
              <div className="text-sm text-gray-600">Total Gamers</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-gaming-600">
                {stats.platforms?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Platforms</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-gaming-600">
                {stats.topGames?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Popular Games</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-gaming-600">24/7</div>
              <div className="text-sm text-gray-600">Always Available</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search usernames..."
                className="input-field pl-10"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            {/* Game Filter */}
            <input
              type="text"
              placeholder="Filter by game..."
              className="input-field"
              value={filters.game}
              onChange={(e) => handleFilterChange('game', e.target.value)}
            />

            {/* Platform Filter */}
            <select
              className="input-field"
              value={filters.platform}
              onChange={(e) => handleFilterChange('platform', e.target.value)}
            >
              <option value="">All Platforms</option>
              {platforms.map(platform => (
                <option key={platform} value={platform}>{platform}</option>
              ))}
            </select>

            {/* Region Filter */}
            <input
              type="text"
              placeholder="Filter by region..."
              className="input-field"
              value={filters.region}
              onChange={(e) => handleFilterChange('region', e.target.value)}
            />
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gaming-600"></div>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {pagination.totalProfiles > 0 ? (
                  `Showing ${profiles.length} of ${pagination.totalProfiles} gamers`
                ) : (
                  'No gamers found matching your filters'
                )}
              </p>
            </div>

            {/* Profile Grid */}
            {profiles.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {profiles.map((profile, index) => (
                  <Link
                    key={index}
                    to={`/${profile.username}`}
                    className="card p-6 hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-gaming-400 to-gaming-600 rounded-full flex items-center justify-center flex-shrink-0">
                        {profile.profile.avatar ? (
                          <img
                            src={profile.profile.avatar}
                            alt={profile.profile.displayName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <Gamepad2 className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {profile.profile.displayName}
                        </h3>
                        <p className="text-sm text-gray-500">@{profile.username}</p>
                        
                        {profile.profile.region && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                            <MapPin className="h-3 w-3" />
                            <span>{profile.profile.region}</span>
                          </div>
                        )}
                        
                        {profile.profile.timezone && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                            <Clock className="h-3 w-3" />
                            <span>{profile.profile.timezone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {profile.profile.bio && (
                      <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                        {profile.profile.bio}
                      </p>
                    )}

                    {/* Platforms */}
                    {profile.profile.platforms && profile.profile.platforms.length > 0 && (
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1">
                          {profile.profile.platforms.slice(0, 3).map((platform, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {platform}
                            </span>
                          ))}
                          {profile.profile.platforms.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              +{profile.profile.platforms.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Games */}
                    {profile.profile.preferredGames && profile.profile.preferredGames.length > 0 && (
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1">
                          {profile.profile.preferredGames.slice(0, 2).map((game, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gaming-100 text-gaming-700 text-xs rounded"
                            >
                              {game}
                            </span>
                          ))}
                          {profile.profile.preferredGames.length > 2 && (
                            <span className="px-2 py-1 bg-gaming-100 text-gaming-700 text-xs rounded">
                              +{profile.profile.preferredGames.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 text-xs text-gray-500">
                      Last active: {new Date(profile.lastActive).toLocaleDateString()}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No gamers found</h3>
                <p className="text-gray-600">
                  Try adjusting your filters or check back later for new profiles.
                </p>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="flex items-center px-4 py-2 text-sm text-gray-700">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Explore;
