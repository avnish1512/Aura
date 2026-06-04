import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, Star, TrendingUp, Sparkles, Film } from 'lucide-react';
import { motion } from 'framer-motion';
import { getTrending, getPopular, getTopRated, getNowPlaying, getLatestReleases, getPosterGradient, GENRES } from '../api/tmdb';
import { useApp } from '../context/AppContext';
import Carousel from '../components/Carousel';
import GenreChips from '../components/GenreChips';
import { SkeletonCarousel } from '../components/SkeletonLoader';
import MovieScrollView from '../components/MovieScrollView';

export default function Home() {
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [latestReleases, setLatestReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroMovie, setHeroMovie] = useState(null);
  const navigate = useNavigate();
  const { watchlist } = useApp();

  useEffect(() => {
    async function fetchData() {
      try {
        const [latestData, trendData, popData, topData, nowData] = await Promise.all([
          getLatestReleases(),
          getTrending(),
          getPopular(),
          getTopRated(),
          getNowPlaying(),
        ]);
        setLatestReleases((latestData.results || []).slice(0, 15));
        setTrending((trendData.results || []).slice(0, 15));
        setPopular((popData.results || []).slice(0, 15));
        setTopRated((topData.results || []).slice(0, 15));
        setNowPlaying((nowData.results || []).slice(0, 15));

        const hero = (latestData.results || trendData.results || [])[0];
        if (hero) setHeroMovie(hero);
      } catch (err) {
        console.error('Failed to fetch home data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleWatchlistAdd = () => {
    if (heroMovie) watchlist.toggleWatchlist(heroMovie);
  };

  return (
    <div className="page-content">
      {/* === MOBILE: Vertical Full-Screen Movie Scroll === */}
      {!loading && (
        <MovieScrollView
          trending={trending}
          popular={popular}
          topRated={topRated}
          nowPlaying={nowPlaying}
          latestReleases={latestReleases}
        />
      )}

      {/* === DESKTOP: Original Hero + Carousels === */}
      <div className="home-desktop-content">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-backdrop">
            <div style={{
              width: '100%',
              height: '100%',
              background: heroMovie
                ? getPosterGradient(heroMovie.id)
                : 'linear-gradient(135deg, #1a1a3e, #0f0f2a)',
              opacity: 0.6,
            }} />
          </div>
          <div className="container">
            <motion.div
              className="hero-content"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              {heroMovie && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.2)', color: 'var(--aurora-purple)' }}>
                      <TrendingUp size={12} /> Latest Release
                    </span>
                    <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--rating-high)' }}>
                      <Star size={12} fill="currentColor" /> {heroMovie.vote_average?.toFixed(1)}
                    </span>
                  </div>

                  <h1>{heroMovie.title || heroMovie.name}</h1>
                  <p>{heroMovie.overview?.slice(0, 200)}{heroMovie.overview?.length > 200 ? '...' : ''}</p>

                  <div className="hero-meta">
                    {heroMovie.genre_ids?.slice(0, 3).map(gid => {
                      const genre = GENRES.find(g => g.id === gid);
                      return genre ? (
                        <span key={gid} className="badge badge-genre">{genre.name}</span>
                      ) : null;
                    })}
                  </div>

                  <div className="hero-actions">
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={() => navigate(`/details/${heroMovie.media_type || 'movie'}/${heroMovie.id}`)}
                    >
                      <Play size={18} /> View Details
                    </button>
                    <button
                      className="btn btn-secondary btn-lg"
                      onClick={handleWatchlistAdd}
                    >
                      <Plus size={18} />
                      {watchlist.isInWatchlist(heroMovie.id) ? 'In Watchlist' : 'Add to Watchlist'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </section>

        {/* Quick Genre Access */}
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="section">
              <div className="section-header">
                <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={20} style={{ color: 'var(--aurora-purple)' }} /> Quick Browse
                </h2>
              </div>
              <GenreChips
                selected={[]}
                onSelect={(ids) => {
                  if (ids.length > 0) {
                    navigate(`/browse?genre=${ids[ids.length - 1]}`);
                  }
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* Content Carousels */}
        <div className="container">
          {loading ? (
            <>
              <SkeletonCarousel />
              <SkeletonCarousel />
              <SkeletonCarousel />
            </>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Carousel
                  title="Latest Releases"
                  items={latestReleases}
                  seeAllLink="/browse"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Carousel
                  title={`🔥 Trending This Week`}
                  items={trending}
                  seeAllLink="/browse"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Carousel
                  title="⭐ Top Rated"
                  items={topRated}
                  seeAllLink="/browse"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Carousel
                  title="🎬 Popular Movies"
                  items={popular}
                  seeAllLink="/browse"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <Carousel
                  title="🍿 Now Playing"
                  items={nowPlaying}
                  seeAllLink="/browse"
                />
              </motion.div>

              {/* Ad zone placeholder for monetization */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                style={{
                  padding: 'var(--space-xl)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--gradient-card)',
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'center',
                  marginBottom: 'var(--space-2xl)',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-md)',
                  flexWrap: 'wrap',
                }}>
                  <Film size={24} style={{ color: 'var(--aurora-purple)' }} />
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>
                      Never miss where to watch
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      Upgrade to <strong style={{ color: 'var(--aurora-purple)' }}>Aura Pro</strong> for
                      personalized alerts when your favorite titles change platforms.
                    </p>
                  </div>
                  <button className="btn btn-primary" onClick={() => navigate('/premium')}>
                    Learn More
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
