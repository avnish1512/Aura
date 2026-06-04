import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTrending, discoverByGenre, GENRES, getPosterGradient } from '../api/tmdb';
import { PLATFORMS } from '../api/streaming';
import MovieCard from '../components/MovieCard';
import GenreChips from '../components/GenreChips';
import { SkeletonCard } from '../components/SkeletonLoader';

const GENRE_EMOJIS = {
  28: '💥', 12: '🗺️', 16: '🎨', 35: '😂', 80: '🔫', 99: '📹',
  18: '🎭', 10751: '👨‍👩‍👧', 14: '🧙', 36: '📜', 27: '👻', 10402: '🎵',
  9648: '🔍', 10749: '💕', 878: '🚀', 53: '😰', 10752: '⚔️', 37: '🤠',
};

export default function Browse() {
  const [searchParams] = useSearchParams();
  const initialGenre = searchParams.get('genre');
  const [selectedGenres, setSelectedGenres] = useState(initialGenre ? [parseInt(initialGenre)] : []);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenreCards, setShowGenreCards] = useState(!initialGenre);

  useEffect(() => {
    async function fetchMovies() {
      setLoading(true);
      try {
        let data;
        if (selectedGenres.length > 0) {
          data = await discoverByGenre('movie', selectedGenres[selectedGenres.length - 1]);
          setShowGenreCards(false);
        } else {
          data = await getTrending();
          setShowGenreCards(true);
        }
        setMovies(data.results || []);
      } catch (err) {
        console.error('Failed to fetch browse data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMovies();
  }, [selectedGenres]);

  const handleGenreSelect = (ids) => {
    setSelectedGenres(ids);
    if (ids.length === 0) {
      setShowGenreCards(true);
    }
  };

  const platformList = Object.values(PLATFORMS);

  return (
    <div className="page-content">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ padding: 'var(--space-2xl) 0 var(--space-lg)' }}
        >
          <h1>
            Browse <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {selectedGenres.length > 0
                ? GENRES.find(g => g.id === selectedGenres[selectedGenres.length - 1])?.name || 'Titles'
                : 'All Titles'}
            </span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-sm)' }}>
            Discover movies and TV shows by genre, platform, and more.
          </p>
        </motion.div>

        {/* Genre Chips */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ marginBottom: 'var(--space-xl)' }}
        >
          <GenreChips selected={selectedGenres} onSelect={handleGenreSelect} />
        </motion.div>

        {/* Platform Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{ marginBottom: 'var(--space-2xl)' }}
        >
          <div style={{
            display: 'flex',
            gap: 'var(--space-sm)',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            paddingBottom: 'var(--space-xs)',
          }}>
            {platformList.map(platform => (
              <button
                key={platform.id}
                className={`filter-chip ${selectedPlatform === platform.id ? 'active' : ''}`}
                onClick={() => setSelectedPlatform(
                  selectedPlatform === platform.id ? null : platform.id
                )}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexShrink: 0,
                  borderColor: selectedPlatform === platform.id ? platform.color : undefined,
                  color: selectedPlatform === platform.id ? platform.color : undefined,
                  background: selectedPlatform === platform.id ? `${platform.color}15` : undefined,
                }}
              >
                <span style={{ fontSize: '1rem' }}>{platform.icon}</span>
                {platform.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Genre Cards (shown when no genre selected) */}
        {showGenreCards && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="section-header" style={{ marginBottom: 'var(--space-lg)' }}>
              <h2 className="section-title">Browse by Genre</h2>
            </div>
            <div className="genre-grid" style={{ marginBottom: 'var(--space-2xl)' }}>
              {GENRES.slice(0, 12).map((genre, i) => (
                <motion.div
                  key={genre.id}
                  className="genre-card"
                  onClick={() => handleGenreSelect([genre.id])}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <div
                    className="genre-card-bg"
                    style={{ background: getPosterGradient(genre.id) }}
                  />
                  <div className="genre-card-content">
                    <h3>
                      <span style={{ marginRight: '6px' }}>{GENRE_EMOJIS[genre.id] || '🎬'}</span>
                      {genre.name}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Movie Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <div className="section-header" style={{ marginBottom: 'var(--space-lg)' }}>
            <h2 className="section-title">
              {selectedGenres.length > 0
                ? `${GENRES.find(g => g.id === selectedGenres[selectedGenres.length - 1])?.name || ''} Titles`
                : '✨ All Titles'
              }
            </h2>
          </div>
          {loading ? (
            <div className="movie-grid">
              <SkeletonCard count={12} />
            </div>
          ) : (
            <div className="movie-grid">
              {movies.map((movie, i) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <MovieCard movie={movie} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
