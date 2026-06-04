import { useNavigate } from 'react-router-dom';
import { Bookmark, Search, Star, Trash2, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { getPosterGradient } from '../api/tmdb';

export default function Watchlist() {
  const { watchlist, auth } = useApp();
  const navigate = useNavigate();

  const handleRemove = (e, item) => {
    e.stopPropagation();
    watchlist.toggleWatchlist(item);
  };

  // Get favorites (first 4 items in watchlist)
  const favorites = watchlist.watchlist.slice(0, 4);

  // Get recent activity (all items sorted by addedAt descending)
  const recentActivity = [...watchlist.watchlist].sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));

  const userName = auth.isAuthenticated ? auth.user.name.toLowerCase().replace(/\s+/g, '.') : 'guest.explorer';
  const initial = auth.isAuthenticated ? auth.user.name[0].toUpperCase() : 'G';
  const userTagline = auth.isAuthenticated ? "Film lover and critic." : "I love finding where to stream.";

  return (
    <div className="page-content">
      <div className="profile-container">
        {/* Profile Header */}
        <motion.div 
          className="profile-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar-glow">
              <div className="profile-avatar">
                {initial}
              </div>
            </div>
            <div className="profile-badge-small" title="Aura Explorer">
              <Award size={14} />
            </div>
          </div>

          <h1 className="profile-name">{userName}</h1>
          <p className="profile-tagline">{userTagline}</p>

          <div className="profile-badges">
            <span className="profile-badge green">Top 5% Explorer</span>
            <span className="profile-badge purple">{watchlist.count} Title{watchlist.count !== 1 ? 's' : ''}</span>
            <span className="profile-badge blue">Pro Member</span>
          </div>

          <button className="profile-btn-following" onClick={() => navigate('/premium')}>
            ✓ Following Aura
          </button>
        </motion.div>

        {watchlist.count === 0 ? (
          <motion.div
            className="watchlist-empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ marginTop: '0' }}
          >
            <div className="watchlist-empty-icon">
              <Bookmark size={32} />
            </div>
            <h3>Your box is empty</h3>
            <p>Start adding movies and TV shows to construct your personal box catalog!</p>
            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', marginTop: 'var(--space-lg)' }}>
              <button className="btn btn-primary" onClick={() => navigate('/search')}>
                <Search size={18} /> Search Titles
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/browse')}>
                Browse Genres
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Favorites Section */}
            <motion.section 
              className="favorites-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="favorites-header">
                <Star size={16} fill="currentColor" style={{ color: 'var(--aurora-orange)' }} />
                <span>Favorites</span>
              </div>
              <div className="favorites-grid">
                {favorites.map((item, index) => {
                  const title = item.title || item.name;
                  return (
                    <motion.div 
                      key={`fav-${item.id}`}
                      className="favorite-card"
                      onClick={() => navigate(`/details/${item.media_type || 'movie'}/${item.id}`)}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05 * index }}
                    >
                      {item.poster_path === '/mock' || !item.poster_path ? (
                        <div style={{
                          background: getPosterGradient(item.id),
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '12px',
                          textAlign: 'center'
                        }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>{title}</span>
                        </div>
                      ) : (
                        <img src={item.poster_path} alt={title} />
                      )}
                      <div className="favorite-card-overlay">
                        <span className="favorite-card-title">{title}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>

            {/* Recent Activity Section */}
            <motion.section 
              className="recent-activity-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="recent-activity-header">
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Recent Activity</h2>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/browse')}>See all</button>
              </div>

              <div className="recent-activity-list">
                <AnimatePresence>
                  {recentActivity.map((item, index) => {
                    const title = item.title || item.name;
                    const rating = item.vote_average || 6.0;
                    const ratingPercentage = (rating / 10) * 100;
                    const year = (item.release_date || item.first_air_date || '').slice(0, 4);

                    return (
                      <motion.div
                        key={`activity-${item.id}`}
                        className="activity-card"
                        onClick={() => navigate(`/details/${item.media_type || 'movie'}/${item.id}`)}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="activity-card-poster">
                          {item.poster_path === '/mock' || !item.poster_path ? (
                            <div style={{
                              background: getPosterGradient(item.id),
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '4px',
                              textAlign: 'center'
                            }}>
                              <span style={{ fontSize: '0.5rem', fontWeight: 700, color: 'white' }}>{title.slice(0, 10)}</span>
                            </div>
                          ) : (
                            <img src={item.poster_path} alt={title} />
                          )}
                        </div>

                        <div className="activity-card-content">
                          <div className="activity-card-meta">
                            {item.media_type === 'tv' ? 'TV SHOW' : 'MOVIE'} {year ? `• ${year}` : ''}
                          </div>
                          <div className="activity-card-title">{title}</div>
                          
                          {/* Horizontal Spectrum Rating Bar */}
                          <div className="rating-spectrum-bar" onClick={(e) => e.stopPropagation()}>
                            <div 
                              className="rating-spectrum-thumb"
                              style={{ left: `${ratingPercentage}%` }}
                              title={`Rating: ${rating}`}
                            >
                              {rating.toFixed(1)}
                            </div>
                          </div>
                          <div className="rating-spectrum-labels">
                            <span>POOR</span>
                            <span>AVERAGE</span>
                            <span>EXCELLENT</span>
                          </div>
                        </div>

                        <button 
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={(e) => handleRemove(e, item)}
                          title="Remove from Box"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.section>
          </>
        )}
      </div>
    </div>
  );
}
