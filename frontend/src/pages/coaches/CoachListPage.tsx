import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Users, BarChart3, Filter, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCoaches, Coach } from '../../services/coaches';

export default function CoachListPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    search: '',
    minRating: '',
    sortBy: 'rating',
  });

  useEffect(() => {
    let cancelled = false;
    async function fetchCoaches() {
      setLoading(true);
      setError(null);
      try {
        const data = await getCoaches();
        if (!cancelled) setCoaches(data);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Failed to load coaches. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchCoaches();
    return () => { cancelled = true; };
  }, []);

  const filteredCoaches = coaches
    .filter(coach => {
      if (filters.search && !coach.name.toLowerCase().includes(filters.search.toLowerCase()) && !coach.email.toLowerCase().includes(filters.search.toLowerCase()))
        return false;
      if (filters.minRating && (coach.avgRating || 0) < parseFloat(filters.minRating))
        return false;
      return true;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'rating': return (b.avgRating || 0) - (a.avgRating || 0);
        case 'members': return (b.totalMembers || 0) - (a.totalMembers || 0);
        case 'sessions': return (b.totalSessions || 0) - (a.totalSessions || 0);
        case 'name': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-[#020617] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl font-bold text-white mb-4">Meet Your Coaches</h1>
          <p className="text-[#94a3b8] text-lg max-w-2xl mx-auto">
            Professional fitness experts to help you achieve your goals. Book sessions and start your transformation journey.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#0f172a] rounded-xl p-6 border border-[#1e293b] sticky top-24"
            >
              <h2 className="text-xl font-semibold text-white mb-6">Filters</h2>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Coach name or email..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full rounded-lg border border-[#1e293b] bg-[#020617] px-3 py-2 text-white placeholder-[#64748b] focus:border-[#2563eb] focus:outline-none"
                />
              </div>

              {/* Minimum Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-2">Minimum Rating</label>
                <select
                  value={filters.minRating}
                  onChange={(e) => setFilters(prev => ({ ...prev, minRating: e.target.value }))}
                  className="w-full rounded-lg border border-[#1e293b] bg-[#020617] px-3 py-2 text-white focus:border-[#2563eb] focus:outline-none"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                  <option value="3.0">3.0+ Stars</option>
                </select>
              </div>

              <button
                onClick={() => setFilters({ search: '', minRating: '', sortBy: 'rating' })}
                className="w-full rounded-lg bg-[#1e293b] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2563eb]"
              >
                Clear Filters
              </button>
            </motion.div>
          </div>

          {/* Coach Cards */}
          <div className="lg:col-span-3">
            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 size={48} className="text-[#2563eb] animate-spin mb-4" />
                <p className="text-[#94a3b8] text-lg">Loading coaches...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-red-500/30 bg-red-500/10 p-8 text-center"
              >
                <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
                <p className="text-red-300 text-lg mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="rounded-lg bg-[#2563eb] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1d4ed8]"
                >
                  Retry
                </button>
              </motion.div>
            )}

            {/* Loaded Content */}
            {!loading && !error && (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-[#94a3b8]">
                    Showing {filteredCoaches.length} coach{filteredCoaches.length !== 1 ? 'es' : ''}
                  </p>
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-[#94a3b8]" />
                    <span className="text-sm text-[#94a3b8]">Sort by</span>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                      className="rounded-lg border border-[#1e293b] bg-[#0f172a] px-3 py-1 text-sm text-white focus:border-[#2563eb] focus:outline-none"
                    >
                      <option value="rating">Rating (High to Low)</option>
                      <option value="members">Most Members</option>
                      <option value="sessions">Most Sessions</option>
                      <option value="name">Name (A-Z)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredCoaches.map((coach, i) => (
                    <motion.div
                      key={coach.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                      className="rounded-xl border border-[#1e293b] bg-[#0f172a] p-6 transition-all hover:border-[#2563eb]/50"
                    >
                      {/* Coach Profile Image */}
                      <div className="mb-4 flex items-start justify-between">
                        {coach.avatar_url ? (
                          <img
                            src={coach.avatar_url}
                            alt={coach.name}
                            className="h-16 w-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#2563eb] to-[#0ea5e9] flex items-center justify-center text-white font-semibold text-lg">
                            {getInitials(coach.name)}
                          </div>
                        )}
                        <div className="text-right">
                          <div className="inline-flex items-center gap-1 rounded-full bg-[#22c55e]/20 px-2 py-1 text-xs font-medium text-[#22c55e]">
                            <Star size={12} />
                            {(coach.avgRating || 0).toFixed(1)}
                          </div>
                        </div>
                      </div>

                      <h3 className="mb-1 text-lg font-semibold text-white">{coach.name}</h3>
                      <p className="mb-3 text-sm text-[#60a5fa]">{coach.email}</p>

                      <div className="mb-4 space-y-2 text-sm text-[#94a3b8]">
                        <div className="flex items-center gap-2">
                          <Star size={14} className="text-[#fbbf24]" />
                          <span>{(coach.avgRating || 0).toFixed(1)} average rating</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-[#94a3b8]" />
                          <span>{coach.totalMembers} member{coach.totalMembers !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BarChart3 size={14} className="text-[#94a3b8]" />
                          <span>{coach.totalSessions} session{coach.totalSessions !== 1 ? 's' : ''} completed</span>
                        </div>
                      </div>

                      <Link
                        to={`/coaches/${coach.id}`}
                        className="block w-full rounded-lg bg-[#2563eb] px-4 py-2 text-center text-sm font-medium text-white transition-all hover:bg-[#1d4ed8] hover:scale-105"
                      >
                        View Profile
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {filteredCoaches.length === 0 && !loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <p className="text-[#94a3b8] text-lg">No coaches match your filters. Try adjusting your search criteria.</p>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
