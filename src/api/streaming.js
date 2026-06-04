// Streaming availability through Watchmode.

export const PLATFORMS = {
  netflix: {
    id: 'netflix',
    name: 'Netflix',
    color: '#e50914',
    icon: 'N',
    url: 'https://www.netflix.com',
  },
  amazon: {
    id: 'amazon',
    name: 'Amazon',
    color: '#00a8e1',
    icon: 'A',
    url: 'https://www.amazon.com/gp/video/storefront',
  },
  amazonprimevideo: {
    id: 'amazonprimevideo',
    name: 'Prime Video',
    color: '#00a8e1',
    icon: 'P',
    url: 'https://www.primevideo.com',
  },
  appletv: {
    id: 'appletv',
    name: 'Apple TV',
    color: '#555555',
    icon: 'A',
    url: 'https://tv.apple.com',
  },
  appletvplus: {
    id: 'appletvplus',
    name: 'Apple TV+',
    color: '#555555',
    icon: 'A',
    url: 'https://tv.apple.com',
  },
  disneyplus: {
    id: 'disneyplus',
    name: 'Disney+',
    color: '#113ccf',
    icon: 'D',
    url: 'https://www.disneyplus.com',
  },
  hulu: {
    id: 'hulu',
    name: 'Hulu',
    color: '#1ce783',
    icon: 'H',
    url: 'https://www.hulu.com',
  },
  max: {
    id: 'max',
    name: 'Max',
    color: '#b535f6',
    icon: 'M',
    url: 'https://www.max.com',
  },
  hbo: {
    id: 'hbo',
    name: 'HBO',
    color: '#b535f6',
    icon: 'H',
    url: 'https://www.max.com',
  },
  peacock: {
    id: 'peacock',
    name: 'Peacock',
    color: '#fdb927',
    icon: 'P',
    url: 'https://www.peacocktv.com',
  },
  paramountplus: {
    id: 'paramountplus',
    name: 'Paramount+',
    color: '#0064ff',
    icon: 'P',
    url: 'https://www.paramountplus.com',
  },
  crunchyroll: {
    id: 'crunchyroll',
    name: 'Crunchyroll',
    color: '#f47521',
    icon: 'C',
    url: 'https://www.crunchyroll.com',
  },
  hotstar: {
    id: 'hotstar',
    name: 'JioCinema',
    color: '#1d8fff',
    icon: 'J',
    url: 'https://www.jiocinema.com',
  },
  googleplay: {
    id: 'googleplay',
    name: 'Google Play',
    color: '#3bccff',
    icon: 'G',
    url: 'https://play.google.com/store/movies',
  },
  youtubetv: {
    id: 'youtubetv',
    name: 'YouTube TV',
    color: '#ff0000',
    icon: 'Y',
    url: 'https://tv.youtube.com',
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    color: '#ff0000',
    icon: 'Y',
    url: 'https://www.youtube.com/movies',
  },
  fandangoathome: {
    id: 'fandangoathome',
    name: 'Fandango at Home',
    color: '#f36f21',
    icon: 'F',
    url: 'https://athome.fandango.com',
  },
  vudu: {
    id: 'vudu',
    name: 'Vudu',
    color: '#0073cf',
    icon: 'V',
    url: 'https://www.vudu.com',
  },
  directvondemand: {
    id: 'directvondemand',
    name: 'DirecTV On Demand',
    color: '#00a6d6',
    icon: 'D',
    url: 'https://stream.directv.com',
  },
  spectrumondemand: {
    id: 'spectrumondemand',
    name: 'Spectrum On Demand',
    color: '#0073d1',
    icon: 'S',
    url: 'https://ondemand.spectrum.net',
  },
};

const API_KEY = import.meta.env.VITE_STREAMING_API_KEY || '';
const WATCHMODE_BASE_URL = 'https://api.watchmode.com/v1';
const streamingCache = new Map();

const emptyAvailability = Object.freeze({
  subscription: [],
  free: [],
  rent: [],
  buy: [],
});

const normalizePlatformKey = (name = '') =>
  name.toLowerCase().replace(/[^a-z0-9]/g, '');

const colorFromName = (name) => {
  const palette = ['#3b82f6', '#14b8a6', '#f97316', '#8b5cf6', '#ef4444', '#22c55e'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
};

const getWatchmodeTitleId = (mediaType, id) => {
  const stringId = String(id);
  if (stringId.startsWith('tt')) return stringId;

  const type = mediaType === 'tv' ? 'tv' : 'movie';
  return `${type}-${stringId}`;
};

const getPlatformObject = (source) => {
  const platformKey = normalizePlatformKey(source.name);
  const basePlatform = PLATFORMS[platformKey] || {
    id: platformKey || `source-${source.source_id}`,
    name: source.name || 'Streaming Service',
    color: colorFromName(source.name || String(source.source_id)),
    icon: (source.name || 'S').slice(0, 1).toUpperCase(),
    url: source.web_url || 'https://www.google.com',
  };

  return {
    ...basePlatform,
    id: `${basePlatform.id}-${source.source_id}`,
    name: source.name || basePlatform.name,
    url: source.web_url || basePlatform.url,
    price: source.price,
    format: source.format,
  };
};

const pushUniquePlatform = (items, platform) => {
  if (!items.some(item => item.id === platform.id)) {
    items.push(platform);
  }
};

const parseWatchmodeSources = (sources) => {
  const result = {
    subscription: [],
    free: [],
    rent: [],
    buy: [],
  };

  if (!Array.isArray(sources)) return result;

  sources.forEach(source => {
    const platform = getPlatformObject(source);
    const type = source.type;

    if (type === 'sub' || type === 'tve') {
      pushUniquePlatform(result.subscription, platform);
    } else if (type === 'free') {
      pushUniquePlatform(result.free, platform);
    } else if (type === 'rent') {
      pushUniquePlatform(result.rent, platform);
    } else if (type === 'buy') {
      pushUniquePlatform(result.buy, platform);
    }
  });

  return result;
};

export const getStreamingAvailability = async (mediaType, id, countryCode = 'US') => {
  const region = countryCode.toUpperCase();
  const titleId = getWatchmodeTitleId(mediaType, id);
  const cacheKey = `${titleId}-${region}`;

  if (streamingCache.has(cacheKey)) {
    return streamingCache.get(cacheKey);
  }

  if (!API_KEY) {
    return emptyAvailability;
  }

  const url = `${WATCHMODE_BASE_URL}/title/${titleId}/sources/?apiKey=${API_KEY}&regions=${region}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Watchmode API error: ${response.status}`);
    }

    const data = await response.json();
    const parsed = parseWatchmodeSources(data);
    streamingCache.set(cacheKey, parsed);
    return parsed;
  } catch (error) {
    console.error('Failed to fetch Watchmode streaming availability:', error);
    streamingCache.set(cacheKey, emptyAvailability);
    return emptyAvailability;
  }
};

export const getMoviePlatforms = (movieId) => {
  const id = String(movieId);
  const cachedKey = Array.from(streamingCache.keys()).find(key =>
    key.startsWith(`${id}-`) ||
    key.startsWith(`movie-${id}-`) ||
    key.startsWith(`tv-${id}-`)
  );

  if (!cachedKey) return [];

  const cached = streamingCache.get(cachedKey);
  const allPlatforms = [
    ...(cached.subscription || []),
    ...(cached.free || []),
    ...(cached.rent || []),
    ...(cached.buy || []),
  ];

  return allPlatforms.filter((platform, index, items) =>
    items.findIndex(item => item.id === platform.id) === index
  );
};
