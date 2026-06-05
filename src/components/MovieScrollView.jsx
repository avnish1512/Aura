import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, ChevronRight, Home, Search, User } from 'lucide-react';
import { getImageUrl, getPosterGradient, GENRES } from '../api/tmdb';

export default function MovieScrollView({
  trending = [],
  nowPlaying = [],
  latestReleases = [],
  upcoming = [],
}) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [activeFeed, setActiveFeed] = useState('now');
  const trackRef = useRef(null);
  const deckRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const navigate = useNavigate();

  const getDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const tomorrowKey = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return getDateKey(date);
  }, []);

  const tomorrowMovies = latestReleases.filter((movie) =>
    (movie.release_date || movie.first_air_date) === tomorrowKey
  );

  const tabs = [
    {
      key: 'coming',
      label: 'Coming Soon',
      movies: upcoming.length > 0 ? upcoming : trending,
    },
    {
      key: 'now',
      label: 'Now Playing',
      movies: nowPlaying.length > 0 ? nowPlaying : latestReleases,
    },
    {
      key: 'tomorrow',
      label: 'Tomorrow',
      movies: tomorrowMovies.length > 0
        ? tomorrowMovies
        : upcoming.length > 0
          ? upcoming
          : latestReleases,
    },
  ];

  const selectedTab = tabs.find((tab) => tab.key === activeFeed) || tabs[1];
  const movies = selectedTab.movies.length > 0
    ? selectedTab.movies
    : latestReleases.length > 0
      ? latestReleases
      : trending;

  const activeIndex = Math.min(Math.round(scrollPosition), Math.max(movies.length - 1, 0));
  const activeMovie = movies[activeIndex] || movies[0];
  const activePosterUrl = activeMovie?.poster_path
    ? getImageUrl(activeMovie.poster_path, 'w780')
    : null;

  const openMovie = useCallback((movie) => {
    navigate(`/details/${movie.media_type || 'movie'}/${movie.id}`);
  }, [navigate]);

  const handleScroll = useCallback(() => {
    if (!trackRef.current) return;
    const el = trackRef.current;
    const slideStep = el.querySelector('.msv-stop')?.offsetHeight;
    if (!slideStep) return;
    const nextPosition = Math.min(
      Math.max(el.scrollTop / slideStep, 0),
      Math.max(movies.length - 1, 0)
    );

    if (Math.abs(nextPosition - scrollPositionRef.current) > 0.004) {
      scrollPositionRef.current = nextPosition;
      setScrollPosition(nextPosition);
    }
  }, [movies.length]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const selectFeed = (feed) => {
    setActiveFeed(feed);
    scrollPositionRef.current = 0;
    setScrollPosition(0);
    trackRef.current?.scrollTo({ top: 0 });
  };

  const handleScrollTap = (event) => {
    if (!activeMovie) return;

    const activePoster = deckRef.current?.querySelector('.msv-deck-card.active .msv-poster');
    if (!activePoster) return;

    const rect = activePoster.getBoundingClientRect();
    const isInsidePoster = event.clientX >= rect.left
      && event.clientX <= rect.right
      && event.clientY >= rect.top
      && event.clientY <= rect.bottom;

    if (isInsidePoster) {
      openMovie(activeMovie);
    }
  };

  const getDeckCardStyle = (index) => {
    const offset = index - scrollPosition;

    if (offset > 1.18 || offset < -1.06) {
      return {
        opacity: 0,
        zIndex: 0,
        transform: 'translate3d(-50%, 52px, 0) scale(0.82) rotate(0deg)',
      };
    }

    if (offset >= 0) {
      const progress = Math.min(offset, 1);
      const reveal = Math.max(0, Math.min(1, (1 - progress) / 0.55));
      const translateY = -64 * progress;
      const scale = 1 - (0.085 * progress);
      const opacity = (1 - (0.18 * progress)) * reveal;

      return {
        opacity,
        zIndex: Math.round(36 - (progress * 14)),
        transform: `translate3d(-50%, ${translateY}px, ${-28 * progress}px) scale(${scale}) rotate(0deg)`,
      };
    }

    const progress = Math.min(Math.abs(offset), 1);
    const fade = progress > 0.84 ? Math.max((1 - progress) / 0.16, 0) : 1;
    const translateY = 360 * progress;
    const scale = 1 - (0.17 * progress);
    const rotate = -5.5 * progress;

    return {
      opacity: (1 - (0.08 * progress)) * fade,
      zIndex: Math.round(56 - (progress * 6)),
      transform: `translate3d(-50%, ${translateY}px, ${36 * progress}px) scale(${scale}) rotate(${rotate}deg)`,
    };
  };

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

  const parseMovieDate = (value) => {
    if (!value) return null;

    const normalized = String(value).trim();
    if (/^\d{4}$/.test(normalized)) return null;

    const parts = normalized.split('-').map(Number);
    if (parts.length >= 3 && parts.every(Number.isFinite)) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }

    const parsed = new Date(normalized);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const formatFeatureDate = (movie) => {
    const fallback = new Date();
    if (activeFeed === 'tomorrow') fallback.setDate(fallback.getDate() + 1);

    const date = parseMovieDate(movie?.release_date || movie?.first_air_date) || fallback;
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();

    return `${String(date.getDate()).padStart(2, '0')} ${month}`;
  };

  if (movies.length === 0) return null;

  return (
    <div className="msv">
      <div
        className="msv-ambient"
        style={activePosterUrl ? { backgroundImage: `url("${activePosterUrl}")` } : undefined}
        aria-hidden="true"
      />

      <div className="msv-top">
        <div className="msv-tabs" role="tablist" aria-label="Movie schedule">
          {tabs.map((tab) => (
            <button
              className={`msv-tab ${tab.key === activeFeed ? 'active' : ''} ${tab.key === 'tomorrow' ? 'msv-tab-next' : ''}`}
              key={tab.key}
              onClick={() => selectFeed(tab.key)}
              role="tab"
              aria-selected={tab.key === activeFeed}
              title={tab.label}
              type="button"
            >
              <span>{tab.label}</span>
              {tab.key === 'tomorrow' && <ChevronRight size={16} strokeWidth={2.4} />}
            </button>
          ))}
        </div>
        <div className="msv-date" aria-live="polite">{formatFeatureDate(activeMovie)}</div>
      </div>

      <div className="msv-deck" ref={deckRef} aria-hidden="true">
        {movies.map((movie, index) => {
          const title = movie.title || movie.name;
          const posterUrl = getImageUrl(movie.poster_path, 'w780');
          const hasPoster = movie.poster_path && movie.poster_path !== '/mock';
          const stackSurface = hasPoster
            ? { backgroundImage: `url("${posterUrl}")` }
            : { background: getPosterGradient(movie.id) };

          return (
            <div
              className={`msv-deck-card ${index === activeIndex ? 'active' : ''}`}
              key={movie.id}
              style={getDeckCardStyle(index)}
            >
              <div className="msv-stack" aria-hidden="true">
                {[0, 1, 2, 3].map((layer) => (
                  <span
                    className="msv-stack-layer"
                    key={layer}
                    style={{ ...stackSurface, '--stack-index': layer }}
                  />
                ))}
              </div>

              <div
                className="msv-poster"
                aria-label={title}
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

      <div
        className="msv-scroll"
        ref={trackRef}
        onClick={handleScrollTap}
        onKeyDown={(event) => {
          if ((event.key === 'Enter' || event.key === ' ') && activeMovie) {
            event.preventDefault();
            openMovie(activeMovie);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Open ${activeMovie?.title || activeMovie?.name || 'selected movie'}`}
      >
        <div className="msv-scroll-spacer">
          {movies.map((movie, index) => (
            <div
              className={`msv-stop ${index === movies.length - 1 ? 'last' : ''}`}
              key={`stop-${movie.id}`}
            />
          ))}
        </div>
      </div>

      <div className="msv-bnav">
        <button className="msv-bnav-btn active" onClick={() => navigate('/')} aria-label="Home" title="Home">
          <Home size={22} strokeWidth={1.8} />
        </button>
        <button
          className="msv-bnav-btn"
          onClick={() => navigate('/search')}
          aria-label="Search"
          title="Search"
        >
          <Search size={22} strokeWidth={1.8} />
        </button>
        <button
          className="msv-bnav-btn"
          onClick={() => navigate('/watchlist')}
          aria-label="Bookmark"
          title="Bookmark"
        >
          <Bookmark size={22} strokeWidth={1.8} />
        </button>
        <button
          className="msv-bnav-btn"
          onClick={() => navigate('/auth')}
          aria-label="Profile"
          title="Profile"
        >
          <User size={22} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}
