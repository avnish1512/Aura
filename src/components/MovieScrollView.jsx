import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Film, Bell, User } from 'lucide-react';
import { getImageUrl, getPosterGradient, GENRES } from '../api/tmdb';

export default function MovieScrollView({
  trending = [],
  nowPlaying = [],
  latestReleases = [],
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const trackRef = useRef(null);
  const navigate = useNavigate();

  const movies = latestReleases.length > 0
    ? latestReleases
    : nowPlaying.length > 0
      ? nowPlaying
      : trending;

  const activeMovie = movies[currentIndex] || movies[0];
  const activePosterUrl = activeMovie?.poster_path
    ? getImageUrl(activeMovie.poster_path, 'w780')
    : null;

  const openMovie = useCallback((movie) => {
    navigate(`/details/${movie.media_type || 'movie'}/${movie.id}`);
  }, [navigate]);

  const handleScroll = useCallback(() => {
    if (!trackRef.current) return;
    const el = trackRef.current;
    const slideStep = el.firstElementChild?.offsetHeight;
    if (!slideStep) return;
    const idx = Math.round(el.scrollTop / slideStep);

    if (idx !== currentIndex && idx >= 0 && idx < movies.length) {
      setCurrentIndex(idx);
    }
  }, [currentIndex, movies.length]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const formatRuntime = (mins) => {
    if (!mins) return '1h 30 m';
    return `${Math.floor(mins / 60)}h ${mins % 60} m`;
  };

  const getGenre = (movie) => {
    if (movie.genre_ids?.length > 0) {
      const genre = GENRES.find((item) => item.id === movie.genre_ids[0]);
      return genre ? genre.name : 'Movie';
    }
    return movie.media_type === 'tv' ? 'TV Series' : 'Movie';
  };

  if (movies.length === 0) return null;

  return (
    <div className="msv">
      <div
        className="msv-ambient"
        style={activePosterUrl ? { backgroundImage: `url("${activePosterUrl}")` } : undefined}
        aria-hidden="true"
      />

      <div className="msv-scroll" ref={trackRef}>
        {movies.map((movie, index) => {
          const title = movie.title || movie.name;
          const posterUrl = getImageUrl(movie.poster_path, 'w780');
          const hasPoster = movie.poster_path && movie.poster_path !== '/mock';

          return (
            <div
              className={`msv-slide ${index === currentIndex ? 'active' : ''}`}
              key={movie.id}
              style={{ zIndex: index + 1 }}
            >
              <div
                className="msv-poster"
                onClick={() => openMovie(movie)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openMovie(movie);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Open ${title}`}
              >
                {hasPoster ? (
                  <img
                    src={posterUrl}
                    alt={title}
                    loading={index < 3 ? 'eager' : 'lazy'}
                    draggable={false}
                  />
                ) : (
                  <div className="msv-poster-fb" style={{ background: getPosterGradient(movie.id) }}>
                    <span>{title}</span>
                  </div>
                )}

                <div className="msv-pills">
                  <span className="msv-pill">{formatRuntime(movie.runtime)}</span>
                  <span className="msv-pill">{getGenre(movie)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="msv-bnav">
        <button className="msv-bnav-btn" onClick={() => navigate('/')} aria-label="Home" title="Home">
          <Home size={22} strokeWidth={1.8} />
        </button>
        <button
          className="msv-bnav-btn msv-bnav-center active"
          onClick={() => navigate('/browse')}
          aria-label="Movies"
          title="Movies"
        >
          <Film size={19} strokeWidth={1.9} />
          <span>Moves</span>
        </button>
        <button
          className="msv-bnav-btn"
          onClick={() => navigate('/premium')}
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={22} strokeWidth={1.8} />
        </button>
        <button
          className="msv-bnav-btn"
          onClick={() => navigate('/watchlist')}
          aria-label="Profile"
          title="Profile"
        >
          <User size={22} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}
