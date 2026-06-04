// TMDb API wrapper. Live movie data requires VITE_TMDB_API_KEY.

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '';
const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY || '';

const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';
const OMDB_API_URL = OMDB_API_KEY ? `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&` : null;
const EMPTY_RESULTS = Object.freeze({ results: [], total_results: 0, page: 1 });

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;
let warnedMissingTmdbKey = false;

const normalizeImageUrl = (path) =>
  path.startsWith('http://') ? path.replace('http://', 'https://') : path;

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

const fetchWithCache = async (urlWithoutKey, fallback = EMPTY_RESULTS) => {
  if (!TMDB_API_KEY) {
    if (!warnedMissingTmdbKey) {
      console.warn('Missing VITE_TMDB_API_KEY. Online movie feeds will be empty.');
      warnedMissingTmdbKey = true;
    }
    return fallback;
  }

  const separator = urlWithoutKey.includes('?') ? '&' : '?';
  const url = `${urlWithoutKey}${separator}api_key=${TMDB_API_KEY}`;

  const cached = cache.get(url);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return cached.data;
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
    console.error('TMDb request failed:', error);
    return fallback;
  }
};

const getOmdbPosterUrl = (imdbId) =>
  OMDB_API_KEY ? `https://img.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${imdbId}` : null;

export const searchMulti = async (query, page = 1) => {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return EMPTY_RESULTS;
  }

  if (TMDB_API_KEY) {
    const params = new URLSearchParams({
      query: trimmedQuery,
      page: String(page),
      include_adult: 'false',
    });

    return fetchWithCache(`${BASE_URL}/search/multi?${params.toString()}`);
  }

  if (!OMDB_API_URL) {
    return EMPTY_RESULTS;
  }

  try {
    const response = await fetch(`${OMDB_API_URL}s=${encodeURIComponent(trimmedQuery)}&page=${page}`);
    if (!response.ok) {
      throw new Error(`OMDb Search Error: ${response.status}`);
    }

    const data = await response.json();
    if (data.Response === 'False') {
      return EMPTY_RESULTS;
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
      genre_ids: [],
    }));

    return { results, total_results: parseInt(data.totalResults) || results.length, page };
  } catch (error) {
    console.error('OMDb search failed:', error);
    return EMPTY_RESULTS;
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
    return fetchWithCache(
      `${BASE_URL}/${mediaType}/${id}?append_to_response=credits,similar,watch/providers`,
      null
    );
  }

  if (!OMDB_API_URL) {
    return null;
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
          profile_path: null,
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
      similar: { results: [] },
    };
  } catch (error) {
    console.error('OMDb details fetch failed:', error);
    return null;
  }
};

export const getCredits = (mediaType, id) =>
  fetchWithCache(`${BASE_URL}/${mediaType}/${id}/credits`, { cast: [], crew: [] });

export const getSimilar = (mediaType, id) =>
  fetchWithCache(`${BASE_URL}/${mediaType}/${id}/similar`);

export const getGenres = (mediaType = 'movie') =>
  fetchWithCache(`${BASE_URL}/genre/${mediaType}/list`, { genres: GENRES });

export const discoverByGenre = (mediaType = 'movie', genreId, page = 1) =>
  fetchWithCache(`${BASE_URL}/discover/${mediaType}?with_genres=${genreId}&page=${page}`);

export const getUpcoming = () =>
  fetchWithCache(`${BASE_URL}/movie/upcoming`);

export const getNowPlaying = () =>
  fetchWithCache(`${BASE_URL}/movie/now_playing`);

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

  const str = String(id);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % POSTER_GRADIENTS.length;
  return POSTER_GRADIENTS[index];
};
