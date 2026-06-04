import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Play, Star, Clock, Calendar, Film, Tv } from 'lucide-react';
import { motion } from 'framer-motion';
import { getDetails, getPosterGradient, getImageUrl, GENRES } from '../api/tmdb';
import { getStreamingAvailability } from '../api/streaming';
import { useApp } from '../context/AppContext';
import StreamingPlatforms from '../components/StreamingPlatforms';
import Carousel from '../components/Carousel';
import { SkeletonDetail } from '../components/SkeletonLoader';

export default function Details() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [streaming, setStreaming] = useState(null);
  const [loading, setLoading] = useState(true);
  const { watchlist, country } = useApp();

  useEffect(() => {
    async function fetchDetailsAndStreaming() {
      setLoading(true);
      try {
        const detailsData = await getDetails(type, id);
        setDetails(detailsData);
        
        // Fetch streaming availability using the actual TMDb ID and country code
        const streamingData = await getStreamingAvailability(type, detailsData.id, country);
        setStreaming(streamingData);
      } catch (err) {
        console.error('Failed to fetch details or streaming data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetailsAndStreaming();
    window.scrollTo(0, 0);
  }, [type, id, country]);

  if (loading) {
    return (
      <div className="page-content">
        <SkeletonDetail />
      </div>
    );
  }

  if (!details) {
    return (
      <div className="page-content">
        <div className="container" style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
          <h2>Title not found</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-sm)' }}>
            The movie or TV show you're looking for doesn't exist.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: 'var(--space-lg)' }}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const title = details.title || details.name;
  const year = (details.release_date || details.first_air_date || '').slice(0, 4);
  const rating = details.vote_average?.toFixed(1);
  const ratingClass = details.vote_average >= 7.5 ? '' : details.vote_average >= 5 ? 'mid' : 'low';
  const cast = details.credits?.cast?.slice(0, 10) || [];
  const similar = details.similar?.results?.slice(0, 8) || [];
  const genres = details.genres || details.genre_ids?.map(gid => GENRES.find(g => g.id === gid)).filter(Boolean) || [];
  const isTV = type === 'tv';
  const isWatchlisted = watchlist.isInWatchlist(details.id);

  return (
    <div className="page-content">
      {/* Backdrop */}
      <div className="details-backdrop">
        <div style={{
          width: '100%',
          height: '100%',
          background: getPosterGradient(details.id),
          opacity: 0.5,
        }} />
      </div>

      {/* Main Content */}
      <div className="details-main container">
        <motion.div
          className="details-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Poster */}
          <div className="details-poster">
            {details.poster_path === '/mock' || !details.poster_path ? (
              <div style={{
                background: getPosterGradient(details.id),
                aspectRatio: '2/3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
              }}>
                <span style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: '1.5rem',
                  color: 'rgba(255,255,255,0.9)',
                  textAlign: 'center',
                  textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}>
                  {title}
                </span>
              </div>
            ) : (
              <img
                src={getImageUrl(details.poster_path, 'w500')}
                alt={title}
              />
            )}
          </div>

          {/* Info */}
          <div className="details-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge" style={{
                background: isTV ? 'rgba(6, 182, 212, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                color: isTV ? 'var(--aurora-cyan)' : 'var(--aurora-purple)',
              }}>
                {isTV ? <><Tv size={12} /> TV Series</> : <><Film size={12} /> Movie</>}
              </span>
            </div>

            <h1>{title}</h1>

            {details.tagline && (
              <p style={{ color: 'var(--text-tertiary)', fontStyle: 'italic', marginBottom: 'var(--space-md)', fontSize: '1rem' }}>
                "{details.tagline}"
              </p>
            )}

            <div className="details-meta">
              {rating && (
                <span className={`badge badge-rating ${ratingClass}`}>
                  <Star size={12} fill="currentColor" /> {rating}
                </span>
              )}
              {year && (
                <span><Calendar size={14} /> {year}</span>
              )}
              {details.runtime && (
                <span><Clock size={14} /> {Math.floor(details.runtime / 60)}h {details.runtime % 60}m</span>
              )}
              {isTV && details.number_of_seasons && (
                <span>{details.number_of_seasons} Season{details.number_of_seasons > 1 ? 's' : ''}</span>
              )}
              {isTV && details.number_of_episodes && (
                <span>{details.number_of_episodes} Episodes</span>
              )}
            </div>

            <div className="details-genres">
              {genres.map(g => (
                <span key={g.id} className="badge badge-genre">{g.name}</span>
              ))}
            </div>

            {rating && (
              <div style={{ margin: 'var(--space-md) 0 var(--space-lg)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-tertiary)', marginBottom: '6px', letterSpacing: '0.5px' }}>
                  AURA RATING
                </div>
                <div className="rating-spectrum-bar" style={{ maxWidth: '400px' }}>
                  <div 
                    className="rating-spectrum-thumb"
                    style={{ left: `${(parseFloat(rating) / 10) * 100}%` }}
                  >
                    {rating}
                  </div>
                </div>
                <div className="rating-spectrum-labels" style={{ maxWidth: '400px' }}>
                  <span>POOR</span>
                  <span>AVERAGE</span>
                  <span>EXCELLENT</span>
                </div>
              </div>
            )}

            {details.overview && (
              <p className="details-overview">{details.overview}</p>
            )}

            <div className="details-actions" style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
              <button
                className={isWatchlisted ? 'btn-capsule-outline' : 'btn-capsule-filled'}
                onClick={() => watchlist.toggleWatchlist(details)}
              >
                <Heart size={16} fill={isWatchlisted ? 'currentColor' : 'none'} />
                {isWatchlisted ? 'In Box' : 'Add to Box'}
              </button>

              <button
                className="btn-capsule-outline"
                onClick={() => {
                  const element = document.getElementById('streaming-availability');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Play size={16} /> Streaming Options
              </button>
            </div>
          </div>
        </motion.div>

        {/* Where to Watch */}
        <motion.div
          id="streaming-availability"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <StreamingPlatforms availability={streaming} />
        </motion.div>

        {/* Cast */}
        {cast.length > 0 && (
          <motion.div
            className="section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <div className="section-header">
              <h2 className="section-title">Cast</h2>
            </div>
            <div className="cast-grid">
              {cast.map(person => (
                <div key={person.id} className="cast-card">
                  <div className="cast-photo">
                    {person.profile_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                        alt={person.name}
                        loading="lazy"
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: getPosterGradient(person.id),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1.5rem',
                      }}>
                        {person.name?.[0]}
                      </div>
                    )}
                  </div>
                  <div className="cast-name">{person.name}</div>
                  <div className="cast-character">{person.character}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Similar Titles */}
        {similar.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <Carousel
              title="Similar Titles"
              items={similar.map(s => ({ ...s, media_type: s.media_type || type }))}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
