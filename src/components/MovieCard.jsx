import { useNavigate } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getPosterGradient, getImageUrl } from '../api/tmdb';
import { getMoviePlatforms } from '../api/streaming';

export default function MovieCard({ movie, width = '100%' }) {
  const navigate = useNavigate();
  const { watchlist } = useApp();

  if (!movie) return null;

  const title = movie.title || movie.name;
  const year = (movie.release_date || movie.first_air_date || '').slice(0, 4);
  const rating = movie.vote_average?.toFixed(1);
  const mediaType = movie.media_type || 'movie';
  const isWatchlisted = watchlist.isInWatchlist(movie.id);
  const platforms = getMoviePlatforms(movie.id);

  const ratingClass = movie.vote_average >= 7.5 ? '' : movie.vote_average >= 5 ? 'mid' : 'low';

  const handleClick = () => {
    navigate(`/details/${mediaType}/${movie.id}`);
  };

  const handleWatchlist = (e) => {
    e.stopPropagation();
    watchlist.toggleWatchlist(movie);
  };

  // Generate poster visual for demo mode
  const posterStyle = movie.poster_path === '/mock' || !movie.poster_path
    ? {
        background: getPosterGradient(movie.id),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }
    : {};

  return (
    <div
      className="movie-card"
      onClick={handleClick}
      style={{ width }}
      role="button"
      tabIndex={0}
      id={`movie-card-${movie.id}`}
    >
      <div className="movie-card-poster">
        {movie.poster_path === '/mock' || !movie.poster_path ? (
          <div style={{
            ...posterStyle,
            width: '100%',
            height: '100%',
            position: 'absolute',
            inset: 0,
          }}>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '1rem',
              color: 'rgba(255,255,255,0.9)',
              textAlign: 'center',
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              lineHeight: 1.3,
            }}>
              {title}
            </span>
          </div>
        ) : (
          <img
            src={getImageUrl(movie.poster_path, 'w342')}
            alt={title}
            loading="lazy"
          />
        )}

        <div className="movie-card-overlay">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {mediaType === 'tv' ? 'TV Series' : 'Movie'} · {year}
          </span>
        </div>

        <button
          className={`movie-card-watchlist ${isWatchlisted ? 'active' : ''}`}
          onClick={handleWatchlist}
          aria-label={isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          <Heart size={16} fill={isWatchlisted ? 'currentColor' : 'none'} />
        </button>

        {rating && (
          <div className={`movie-card-rating badge badge-rating ${ratingClass}`}>
            <Star size={10} fill="currentColor" /> {rating}
          </div>
        )}
      </div>

      <div className="movie-card-info">
        <div className="movie-card-title">{title}</div>
        <div className="movie-card-year">{year}</div>
        {platforms.length > 0 && (
          <div className="movie-card-platforms">
            {platforms.slice(0, 4).map(p => (
              <div
                key={p.id}
                className="platform-dot tooltip"
                data-tooltip={p.name}
                style={{ backgroundColor: p.logoUrl ? 'rgba(255,255,255,0.92)' : p.color }}
              >
                {p.logoUrl && <img src={p.logoUrl} alt="" loading="lazy" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
