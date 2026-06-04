import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Grid, List, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchMulti, GENRES } from '../api/tmdb';
import { useDebounce } from '../hooks/useDebounce';
import MovieCard from '../components/MovieCard';
import { SkeletonCard } from '../components/SkeletonLoader';

const CONTENT_TYPES = [
  { id: 'all', label: 'All' },
  { id: 'movie', label: 'Movies' },
  { id: 'tv', label: 'TV Shows' },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [contentType, setContentType] = useState('all');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [showFilters, setShowFilters] = useState(true);
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      return undefined;
    }

    let isActive = true;

    async function doSearch() {
      setLoading(true);
      try {
        const data = await searchMulti(debouncedQuery);
        if (isActive) {
          setResults(data.results || []);
          setSearchParams({ q: debouncedQuery });
        }
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }
    doSearch();
    return () => {
      isActive = false;
    };
  }, [debouncedQuery, setSearchParams]);

  // Filter results
  const visibleResults = debouncedQuery.trim() ? results : [];
  const filteredResults = visibleResults.filter(item => {
    if (contentType !== 'all' && item.media_type !== contentType) return false;
    if (selectedGenres.length > 0 && !item.genre_ids?.some(g => selectedGenres.includes(g))) return false;
    // Filter out people
    if (item.media_type === 'person') return false;
    return true;
  });

  return (
    <div className="page-content">
      <div className="container">
        {/* Search Hero */}
        <div className="search-hero">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 style={{ marginBottom: 'var(--space-lg)', textAlign: 'center' }}>
              Search <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Everything</span>
            </h1>
            <div className="search-hero-wrapper" style={{ margin: '0 auto' }}>
              <SearchIcon className="search-hero-icon" />
              <input
                type="text"
                className="search-hero-input"
                placeholder="Search movies, TV shows, people..."
                value={query}
                onChange={(e) => {
                  const value = e.target.value;
                  setQuery(value);
                  if (!value.trim()) {
                    setResults([]);
                    setLoading(false);
                    setSearchParams({});
                  }
                }}
                autoFocus
                id="search-input"
              />
            </div>
          </motion.div>
        </div>

        {/* Controls */}
        {(visibleResults.length > 0 || query.trim()) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-lg)',
              flexWrap: 'wrap',
              gap: 'var(--space-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
              </span>
              <button
                className={`btn btn-ghost btn-sm ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <SlidersHorizontal size={14} /> Filters
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              {/* Content type filter */}
              <div style={{ display: 'flex', gap: '2px', background: 'rgba(139, 92, 246, 0.06)', borderRadius: 'var(--radius-full)', padding: '3px' }}>
                {CONTENT_TYPES.map(type => (
                  <button
                    key={type.id}
                    className={`filter-chip ${contentType === type.id ? 'active' : ''}`}
                    onClick={() => setContentType(type.id)}
                    style={{ border: 'none' }}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              {/* View toggle */}
              <div className="view-toggle">
                <button
                  className={viewMode === 'grid' ? 'active' : ''}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid size={16} />
                </button>
                <button
                  className={viewMode === 'list' ? 'active' : ''}
                  onClick={() => setViewMode('list')}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="search-page">
          {/* Filter Sidebar */}
          {showFilters && (visibleResults.length > 0 || query.trim()) && (
            <motion.aside
              className="search-sidebar"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="filter-panel">
                <div className="filter-group">
                  <div className="filter-label">Genres</div>
                  <div className="filter-chips">
                    {GENRES.slice(0, 12).map(genre => (
                      <button
                        key={genre.id}
                        className={`filter-chip ${selectedGenres.includes(genre.id) ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedGenres(prev =>
                            prev.includes(genre.id)
                              ? prev.filter(id => id !== genre.id)
                              : [...prev, genre.id]
                          );
                        }}
                      >
                        {genre.name}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedGenres.length > 0 && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setSelectedGenres([])}
                    style={{ width: '100%', marginTop: 'var(--space-sm)' }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </motion.aside>
          )}

          {/* Results */}
          <div className="search-main">
            {loading ? (
              <div className="movie-grid">
                <SkeletonCard count={8} />
              </div>
            ) : filteredResults.length > 0 ? (
              <motion.div
                className="movie-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <AnimatePresence>
                  {filteredResults.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <MovieCard movie={item} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : query.trim() && !loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  textAlign: 'center',
                  padding: 'var(--space-3xl)',
                  color: 'var(--text-secondary)',
                }}
              >
                <SearchIcon size={48} style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-md)' }} />
                <h3>No results found</h3>
                <p style={{ marginTop: 'var(--space-sm)' }}>
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </motion.div>
            ) : !query.trim() ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  textAlign: 'center',
                  padding: 'var(--space-3xl)',
                  color: 'var(--text-secondary)',
                }}
              >
                <SearchIcon size={48} style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-md)' }} />
                <h3>Start typing to search</h3>
                <p style={{ marginTop: 'var(--space-sm)' }}>
                  Search for any movie or TV show to find where to stream it.
                </p>
              </motion.div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
