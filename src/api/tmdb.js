// TMDb API Wrapper
// Uses TMDb API v3 — get your free key at https://www.themoviedb.org/settings/api

import freekeys from 'freekeys';

let API_KEY = null;
let keyPromise = null;
const ENV_TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '';

const ensureApiKey = () => {
  if (API_KEY) return Promise.resolve(API_KEY);
  if (ENV_TMDB_API_KEY) {
    API_KEY = ENV_TMDB_API_KEY;
    return Promise.resolve(API_KEY);
  }
  if (!keyPromise) {
    keyPromise = freekeys()
      .then(params => {
        API_KEY = params?.tmdb_key || 'demo';
        console.log('TMDb API key initialized via freekeys.');
        return API_KEY;
      })
      .catch(err => {
        console.error('Failed to fetch TMDb key from freekeys, falling back to demo:', err);
        API_KEY = 'demo';
        return API_KEY;
      });
  }
  return keyPromise;
};

const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';
const normalizeImageUrl = (path) =>
  path.startsWith('http://') ? path.replace('http://', 'https://') : path;

// Image URL helpers
export const getImageUrl = (path, size = 'w500') => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return normalizeImageUrl(path);
  return `${IMG_BASE}/${size}${path}`;
};

export const getBackdropUrl = (path, size = 'original') => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return normalizeImageUrl(path);
  return `${IMG_BASE}/${size}${path}`;
};

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const USE_LOCAL_CATALOG = import.meta.env.VITE_USE_LOCAL_CATALOG === 'true';

const fetchWithCache = async (urlWithoutKey) => {
  if (USE_LOCAL_CATALOG) {
    return getMockData(urlWithoutKey);
  }

  let key = 'demo';
  try {
    key = await ensureApiKey();
  } catch (err) {
    console.warn('Using demo fallback due to key error:', err);
  }

  const separator = urlWithoutKey.includes('?') ? '&' : '?';
  const url = `${urlWithoutKey}${separator}api_key=${key}`;

  const cached = cache.get(url);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return cached.data;
  }

  // In demo mode, return mock data
  if (key === 'demo') {
    return getMockData(url);
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDb API Error: ${response.status}`);
    }
    const data = await response.json();
    cache.set(url, { data, time: Date.now() });
    return data;
  } catch (error) {
    console.error('TMDb request failed, falling back to mock data:', error);
    return getMockData(url);
  }
};

// API Methods
const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY || '';
const OMDB_API_URL = OMDB_API_KEY ? `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&` : null;

const getOmdbPosterUrl = (imdbId) =>
  OMDB_API_KEY ? `https://img.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${imdbId}` : null;

const searchLocalCatalog = (query) => {
  const queryLower = query.toLowerCase();
  const localResults = MOCK_MOVIES.filter(m =>
    (m.title || m.name || '').toLowerCase().includes(queryLower) ||
    (m.overview || '').toLowerCase().includes(queryLower)
  );

  return { results: localResults, total_results: localResults.length, page: 1 };
};

const getLocalDetails = (id) => {
  const movie = MOCK_MOVIES.find(m => String(m.id) === String(id)) || MOCK_MOVIES[0];

  return {
    ...movie,
    genres: movie.genre_ids.map(gid => GENRES.find(g => g.id === gid) || { id: gid, name: 'Unknown' }),
    credits: {
      cast: [
        { id: 101, name: 'Timothee Chalamet', character: 'Lead', profile_path: null },
        { id: 102, name: 'Zendaya', character: 'Supporting', profile_path: null },
      ]
    },
    similar: {
      results: MOCK_MOVIES.filter(m => m.id !== id).slice(0, 6)
    }
  };
};

export const searchMulti = async (query, page = 1) => {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return { results: [], total_results: 0, page: 1 };
  }

  if (ENV_TMDB_API_KEY || !OMDB_API_URL) {
    const params = new URLSearchParams({
      query: trimmedQuery,
      page: String(page),
      include_adult: 'false',
    });

    return fetchWithCache(`${BASE_URL}/search/multi?${params.toString()}`);
  }

  try {
    const response = await fetch(`${OMDB_API_URL}s=${encodeURIComponent(trimmedQuery)}&page=${page}`);
    if (!response.ok) {
      throw new Error(`OMDb Search Error: ${response.status}`);
    }
    const data = await response.json();
    if (data.Response === 'False') {
      return searchLocalCatalog(trimmedQuery);
    }

    const results = data.Search.map(item => ({
      id: item.imdbID,
      title: item.Title,
      name: item.Title,
      media_type: item.Type === 'series' ? 'tv' : 'movie',
      poster_path: item.Poster !== 'N/A' ? item.Poster : getOmdbPosterUrl(item.imdbID),
      backdrop_path: item.Poster !== 'N/A' ? item.Poster : getOmdbPosterUrl(item.imdbID),
      release_date: item.Year,
      first_air_date: item.Year,
      vote_average: 6.0,
      genre_ids: []
    }));

    return { results, total_results: parseInt(data.totalResults) || results.length, page: 1 };
  } catch (error) {
    console.error('OMDb search failed, falling back to local database search:', error);
    return searchLocalCatalog(trimmedQuery);
  }
};

export const getTrending = (mediaType = 'all', timeWindow = 'week') =>
  fetchWithCache(`${BASE_URL}/trending/${mediaType}/${timeWindow}`);

export const getPopular = (mediaType = 'movie', page = 1) =>
  fetchWithCache(`${BASE_URL}/${mediaType}/popular?page=${page}`);

export const getTopRated = (mediaType = 'movie', page = 1) =>
  fetchWithCache(`${BASE_URL}/${mediaType}/top_rated?page=${page}`);

export const getLatestReleases = (page = 1) => {
  const today = new Date().toISOString().slice(0, 10);
  const params = new URLSearchParams({
    sort_by: 'primary_release_date.desc',
    'primary_release_date.lte': today,
    'vote_count.gte': '20',
    include_adult: 'false',
    include_video: 'false',
    page: String(page),
  });

  return fetchWithCache(`${BASE_URL}/discover/movie?${params.toString()}`);
};

export const getDetails = async (mediaType, id) => {
  const isTmdbId = /^\d+$/.test(String(id));

  if (isTmdbId) {
    return fetchWithCache(`${BASE_URL}/${mediaType}/${id}?append_to_response=credits,similar,watch/providers`);
  }

  if (!OMDB_API_URL) {
    return getLocalDetails(id);
  }

  try {
    const response = await fetch(`${OMDB_API_URL}i=${id}&plot=full`);
    if (!response.ok) {
      throw new Error(`OMDb Detail Error: ${response.status}`);
    }
    const data = await response.json();
    if (data.Response === 'False') {
      throw new Error(data.Error || 'Title not found');
    }

    const genres = data.Genre && data.Genre !== 'N/A'
      ? data.Genre.split(', ').map((g, idx) => ({ id: 1000 + idx, name: g }))
      : [];

    const cast = data.Actors && data.Actors !== 'N/A'
      ? data.Actors.split(', ').map((actor, idx) => ({
          id: 2000 + idx,
          name: actor,
          character: 'Lead Cast',
          profile_path: null
        }))
      : [];

    return {
      id: data.imdbID,
      imdb_id: data.imdbID,
      title: data.Title,
      name: data.Title,
      release_date: data.Released !== 'N/A' ? data.Released : `${data.Year}-01-01`,
      first_air_date: data.Released !== 'N/A' ? data.Released : `${data.Year}-01-01`,
      vote_average: parseFloat(data.imdbRating) || 6.0,
      overview: data.Plot !== 'N/A' ? data.Plot : 'No description available.',
      poster_path: data.Poster !== 'N/A' ? data.Poster : getOmdbPosterUrl(data.imdbID),
      backdrop_path: data.Poster !== 'N/A' ? data.Poster : getOmdbPosterUrl(data.imdbID),
      runtime: parseInt(data.Runtime) || 120,
      number_of_seasons: parseInt(data.totalSeasons) || undefined,
      genres,
      credits: { cast },
      similar: {
        results: MOCK_MOVIES.filter(m => m.id !== data.imdbID).slice(0, 6)
      }
    };
  } catch (error) {
    console.error('OMDb details fetch failed, falling back to local database:', error);
    return getLocalDetails(id);
  }
};

export const getCredits = (mediaType, id) =>
  fetchWithCache(`${BASE_URL}/${mediaType}/${id}/credits`);

export const getSimilar = (mediaType, id) =>
  fetchWithCache(`${BASE_URL}/${mediaType}/${id}/similar`);

export const getGenres = (mediaType = 'movie') =>
  fetchWithCache(`${BASE_URL}/genre/${mediaType}/list`);

export const discoverByGenre = (mediaType = 'movie', genreId, page = 1) =>
  fetchWithCache(`${BASE_URL}/discover/${mediaType}?with_genres=${genreId}&page=${page}`);

export const getUpcoming = () =>
  fetchWithCache(`${BASE_URL}/movie/upcoming`);

export const getNowPlaying = () =>
  fetchWithCache(`${BASE_URL}/movie/now_playing`);

// Genre list for reference
export const GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
];

// ============================================================
// MOCK DATA — mapped from movie.json when API_KEY is 'demo'
// ============================================================

import moviesRaw from './movie.json';

const mapGenresToIds = (genreStrings) => {
  if (!genreStrings || !Array.isArray(genreStrings)) return [28]; // default Action
  return genreStrings
    .map(g => {
      const match = GENRES.find(item => item.name.toLowerCase() === g.toLowerCase());
      return match ? match.id : null;
    })
    .filter(Boolean);
};

const MOCK_MOVIES = moviesRaw.map((m, index) => {
  const isTV = m.type?.toLowerCase().includes('tv') || m.type?.toLowerCase().includes('series');
  const mediaType = isTV ? 'tv' : 'movie';
  const title = m.primaryTitle || m.originalTitle || 'Untitled';
  
  return {
    id: m.id || `mock-${index}`,
    title: mediaType === 'movie' ? title : undefined,
    name: mediaType === 'tv' ? title : undefined,
    media_type: mediaType,
    overview: m.description || 'No description available.',
    poster_path: m.primaryImage || getOmdbPosterUrl(m.id || `mock-${index}`),
    backdrop_path: m.primaryImage || getOmdbPosterUrl(m.id || `mock-${index}`),
    vote_average: m.averageRating || 6.0,
    release_date: mediaType === 'movie' ? (m.releaseDate || `${m.startYear || 2024}-01-01`) : undefined,
    first_air_date: mediaType === 'tv' ? (m.releaseDate || `${m.startYear || 2024}-01-01`) : undefined,
    genre_ids: mapGenresToIds(m.genres),
    popularity: (m.numVotes || 0) + (m.averageRating || 0) * 10,
    runtime: m.runtimeMinutes || 120,
    tagline: m.description ? m.description.slice(0, 80) + '...' : 'An exciting title.',
  };
});

// Color gradient map for posters (used in demo mode)
const POSTER_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
  'linear-gradient(135deg, #f5576c 0%, #ff6f61 100%)',
  'linear-gradient(135deg, #0250c5 0%, #d43f8d 100%)',
];

export const getPosterGradient = (id) => {
  if (typeof id === 'number') {
    return POSTER_GRADIENTS[id % POSTER_GRADIENTS.length];
  }
  // Simple hash function for string IDs (IMDb tt...)
  const str = String(id);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % POSTER_GRADIENTS.length;
  return POSTER_GRADIENTS[index];
};

// Mock data generator
function getMockData(url) {
  if (url.includes('/search/multi')) {
    const params = new URLSearchParams(url.split('?')[1]);
    const query = (params.get('query') || '').toLowerCase();
    const filtered = MOCK_MOVIES.filter(m =>
      (m.title || m.name || '').toLowerCase().includes(query) ||
      (m.overview || '').toLowerCase().includes(query)
    );
    return { results: filtered, total_results: filtered.length, page: 1 };
  }

  if (url.includes('/trending/')) {
    const sorted = [...MOCK_MOVIES].sort((a, b) => b.popularity - a.popularity);
    return { results: sorted };
  }

  if (url.includes('/popular')) {
    const sorted = [...MOCK_MOVIES].sort((a, b) => b.popularity - a.popularity);
    return { results: sorted };
  }

  if (url.includes('/top_rated')) {
    const sorted = [...MOCK_MOVIES].sort((a, b) => b.vote_average - a.vote_average);
    return { results: sorted };
  }

  if (url.includes('/upcoming') || url.includes('/now_playing') || url.includes('sort_by=primary_release_date.desc')) {
    const today = new Date().toISOString().slice(0, 10);
    const sorted = [...MOCK_MOVIES].sort((a, b) => {
      const dateA = a.release_date || a.first_air_date || '0000-00-00';
      const dateB = b.release_date || b.first_air_date || '0000-00-00';
      return dateB.localeCompare(dateA);
    });
    const released = sorted.filter(movie => {
      const date = movie.release_date || movie.first_air_date;
      return !date || date <= today;
    });

    return { results: released.slice(0, 20) };
  }

  if (url.includes('/genre/')) {
    return { genres: GENRES };
  }

  if (url.includes('/discover/')) {
    const params = new URLSearchParams(url.split('?')[1]);
    const genreId = parseInt(params.get('with_genres'));
    const filtered = Number.isNaN(genreId)
      ? MOCK_MOVIES
      : MOCK_MOVIES.filter(m => m.genre_ids.includes(genreId));
    return { results: filtered, total_results: filtered.length };
  }

  // Details endpoint
  const idMatch = url.match(/\/(movie|tv)\/([\w\d-]+)/);
  if (idMatch) {
    const id = idMatch[2];
    const movie = MOCK_MOVIES.find(m => String(m.id) === String(id)) || MOCK_MOVIES[0];
    return {
      ...movie,
      runtime: movie.runtime || 120,
      number_of_seasons: movie.media_type === 'tv' ? 3 : undefined,
      number_of_episodes: movie.media_type === 'tv' ? 24 : undefined,
      tagline: movie.overview ? movie.overview.slice(0, 80) + '...' : 'An unforgettable experience.',
      status: 'Released',
      budget: 165000000,
      revenue: 711845366,
      genres: movie.genre_ids.map(gid => GENRES.find(g => g.id === gid) || { id: gid, name: 'Unknown' }),
      credits: {
        cast: [
          { id: 101, name: 'Timothée Chalamet', character: 'Lead', profile_path: null },
          { id: 102, name: 'Zendaya', character: 'Supporting', profile_path: null },
          { id: 103, name: 'Oscar Isaac', character: 'Supporting', profile_path: null },
          { id: 104, name: 'Rebecca Ferguson', character: 'Supporting', profile_path: null },
          { id: 105, name: 'Josh Brolin', character: 'Supporting', profile_path: null },
        ],
      },
      similar: {
        results: MOCK_MOVIES.filter(m => m.id !== movie.id && m.genre_ids.some(g => movie.genre_ids.includes(g))).slice(0, 6),
      },
      'watch/providers': {
        results: {
          US: {
            flatrate: [
              { provider_id: 8, provider_name: 'Netflix', logo_path: null },
              { provider_id: 337, provider_name: 'Disney+', logo_path: null },
            ],
            rent: [
              { provider_id: 3, provider_name: 'Google Play', logo_path: null },
              { provider_id: 2, provider_name: 'Apple TV', logo_path: null },
            ],
            buy: [
              { provider_id: 3, provider_name: 'Google Play', logo_path: null },
              { provider_id: 2, provider_name: 'Apple TV', logo_path: null },
              { provider_id: 10, provider_name: 'Amazon Video', logo_path: null },
            ],
          },
          IN: {
            flatrate: [
              { provider_id: 119, provider_name: 'Amazon Prime Video', logo_path: null },
              { provider_id: 122, provider_name: 'Hotstar', logo_path: null },
            ],
            rent: [
              { provider_id: 3, provider_name: 'Google Play', logo_path: null },
            ],
          },
        },
      },
    };
  }

  return { results: MOCK_MOVIES };
}
