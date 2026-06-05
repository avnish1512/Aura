import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, Play, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  getTrending,
  getPopular,
  getTopRated,
  getNowPlaying,
  getLatestReleases,
  getUpcoming,
  getPosterGradient,
  getBackdropUrl,
  getImageUrl,
  GENRES,
} from '../api/tmdb';
import { useApp } from '../context/AppContext';
import MovieScrollView from '../components/MovieScrollView';

const getTitle = (movie) => movie?.title || movie?.name || 'Aura Pick';

const getDate = (movie) => movie?.release_date || movie?.first_air_date || '';

const getDetailsPath = (movie) => `/details/${movie?.media_type || 'movie'}/${movie?.id}`;

function getLandscapeImage(movie, size = 'w1280') {
  if (!movie) return null;
  if (movie.backdrop_path) return getBackdropUrl(movie.backdrop_path, size);
  return getImageUrl(movie.poster_path, size === 'original' ? 'w1280' : 'w780');
}

function getGenreNames(movie) {
  return (movie?.genre_ids || [])
    .slice(0, 3)
    .map((id) => GENRES.find((genre) => genre.id === id)?.name)
    .filter(Boolean);
}

function uniqueMovies(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item?.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function rowFallback(preferred, pool, start = 0) {
  if (preferred.length > 0) return preferred;
  if (pool.length === 0) return [];

  const count = Math.min(18, pool.length);
  return Array.from({ length: count }, (_, index) => pool[(start + index) % pool.length]);
}

function WebflixCard({ movie, index, onOpen }) {
  const image = getLandscapeImage(movie, 'w780');
  const title = getTitle(movie);
  const year = getDate(movie).slice(0, 4);

  return (
    <motion.button
      type="button"
      className="webflix-card"
      onClick={() => onOpen(movie)}
      title={title}
      style={!image ? { background: getPosterGradient(movie.id || index) } : undefined}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: Math.min(index * 0.025, 0.16) }}
    >
      {image && <img src={image} alt={title} loading="lazy" />}
      <span className="webflix-card-vignette" />
      <span className="webflix-card-copy">
        <strong>{title}</strong>
        {year && <small>{year}</small>}
      </span>
    </motion.button>
  );
}

function WebflixRow({ title, items, priority = false, onOpen }) {
  return (
    <section className={`webflix-row ${priority ? 'priority' : ''}`}>
      <div className="webflix-row-head">
        <h2>{title}</h2>
        <div className="webflix-row-lines" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="webflix-row-track">
        {items.map((movie, index) => (
          <WebflixCard
            key={`${title}-${movie.id}-${index}`}
            movie={movie}
            index={index}
            onOpen={onOpen}
          />
        ))}
      </div>
    </section>
  );
}

function WebflixSkeleton() {
  return (
    <div className="webflix-skeleton-wrap">
      {[0, 1, 2].map((row) => (
        <section className="webflix-row" key={row}>
          <div className="webflix-row-head">
            <span className="webflix-skeleton-title" />
          </div>
          <div className="webflix-row-track">
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <span className="webflix-skeleton-card" key={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default function Home() {
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [latestReleases, setLatestReleases] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroMovie, setHeroMovie] = useState(null);
  const navigate = useNavigate();
  const { watchlist } = useApp();

  useEffect(() => {
    async function fetchData() {
      try {
        const [latestData, trendData, popData, topData, nowData, upcomingData] = await Promise.all([
          getLatestReleases(),
          getTrending(),
          getPopular(),
          getTopRated(),
          getNowPlaying(),
          getUpcoming(),
        ]);

        const latestItems = (latestData.results || []).slice(0, 18);
        const trendingItems = (trendData.results || []).slice(0, 18);
        const popularItems = (popData.results || []).slice(0, 18);
        const topItems = (topData.results || []).slice(0, 18);
        const nowItems = (nowData.results || []).slice(0, 18);
        const upcomingItems = (upcomingData.results || []).slice(0, 18);

        setLatestReleases(latestItems);
        setTrending(trendingItems);
        setPopular(popularItems);
        setTopRated(topItems);
        setNowPlaying(nowItems);
        setUpcoming(upcomingItems);

        const hero = latestItems.find((item) => item.backdrop_path) || trendingItems[0] || latestItems[0];
        if (hero) setHeroMovie(hero);
      } catch (err) {
        console.error('Failed to fetch home data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const openDetails = (movie) => {
    if (!movie?.id) return;
    navigate(getDetailsPath(movie));
  };

  const handleWatchlistAdd = () => {
    if (heroMovie) watchlist.toggleWatchlist(heroMovie);
  };

  const savedItems = watchlist.watchlist || [];
  const allItems = uniqueMovies([
    ...latestReleases,
    ...trending,
    ...popular,
    ...nowPlaying,
    ...topRated,
    ...upcoming,
  ]);
  const heroTitle = getTitle(heroMovie);
  const heroBackdrop = getLandscapeImage(heroMovie, 'original');
  const heroGenres = getGenreNames(heroMovie);
  const heroYear = getDate(heroMovie).slice(0, 4);
  const heroRating = heroMovie?.vote_average ? heroMovie.vote_average.toFixed(1) : null;

  const rows = [
    { title: 'Your Next Watch', items: rowFallback(latestReleases, allItems, 0) },
    { title: 'My List', items: savedItems.length ? savedItems : rowFallback(topRated.slice(0, 8), allItems, 3) },
    { title: 'Top Searches', items: rowFallback(trending, allItems, 6) },
    { title: 'New & Popular', items: rowFallback(popular, allItems, 9) },
    { title: 'Now Playing', items: rowFallback(nowPlaying, allItems, 12) },
    { title: 'Critically Acclaimed', items: rowFallback(topRated, allItems, 15) },
    { title: 'Coming Soon', items: rowFallback(upcoming, allItems, 2) },
  ].filter((row) => row.items.length > 0);

  return (
    <div className="page-content home-page-content webflix-page">
      {!loading && (
        <MovieScrollView
          trending={trending}
          popular={popular}
          topRated={topRated}
          nowPlaying={nowPlaying}
          latestReleases={latestReleases}
          upcoming={upcoming}
        />
      )}

      <div className="home-desktop-content webflix-home">
        <section className="webflix-hero">
          <div
            className="webflix-hero-media"
            style={!heroBackdrop && heroMovie ? { background: getPosterGradient(heroMovie.id) } : undefined}
          >
            {heroBackdrop && <img src={heroBackdrop} alt="" />}
          </div>
          <div className="webflix-hero-scrim" />

          <motion.div
            className="webflix-hero-content"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            <span className="webflix-eyebrow">Aura Feature</span>
            <h1>{heroMovie ? heroTitle : 'Aura'}</h1>
            <p>
              {heroMovie?.overview ||
                'Movies and shows presented in a cinematic web experience, with fast rows, bold art, and one-tap details.'}
            </p>

            <div className="webflix-hero-meta">
              {heroYear && <span>{heroYear}</span>}
              {heroRating && <span>{heroRating} rating</span>}
              {heroGenres.map((genre) => (
                <span key={genre}>{genre}</span>
              ))}
            </div>

            <div className="webflix-actions">
              <button
                type="button"
                className="webflix-btn webflix-btn-play"
                onClick={() => openDetails(heroMovie)}
                disabled={!heroMovie}
              >
                <Play size={28} fill="currentColor" />
                Play
              </button>
              <button
                type="button"
                className="webflix-btn webflix-btn-info"
                onClick={() => openDetails(heroMovie)}
                disabled={!heroMovie}
              >
                <Info size={28} />
                More Info
              </button>
              <button
                type="button"
                className={`webflix-plus ${heroMovie && watchlist.isInWatchlist(heroMovie.id) ? 'active' : ''}`}
                onClick={handleWatchlistAdd}
                disabled={!heroMovie}
                aria-label="Add feature to My List"
              >
                <Plus size={24} />
              </button>
            </div>
          </motion.div>

          <div className="webflix-rating-panel" aria-label="Suggested maturity rating">
            <span>TV-PG</span>
          </div>
        </section>

        <div className="webflix-rows">
          {loading ? (
            <WebflixSkeleton />
          ) : (
            rows.map((row, index) => (
              <WebflixRow
                key={row.title}
                title={row.title}
                items={row.items}
                priority={index === 0}
                onOpen={openDetails}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
