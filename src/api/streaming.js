// Streaming Availability Data using Movie of the Night API (v4)

export const PLATFORMS = {
  netflix: {
    id: 'netflix',
    name: 'Netflix',
    color: '#e50914',
    icon: '🔴',
    url: 'https://www.netflix.com',
  },
  prime: {
    id: 'prime',
    name: 'Prime Video',
    color: '#00a8e1',
    icon: '🔵',
    url: 'https://www.primevideo.com',
  },
  disney: {
    id: 'disney',
    name: 'Disney+',
    color: '#113ccf',
    icon: '🏰',
    url: 'https://www.disneyplus.com',
  },
  hulu: {
    id: 'hulu',
    name: 'Hulu',
    color: '#1ce783',
    icon: '🟢',
    url: 'https://www.hulu.com',
  },
  hbo: {
    id: 'hbo',
    name: 'Max',
    color: '#b535f6',
    icon: '🟣',
    url: 'https://www.max.com',
  },
  apple: {
    id: 'apple',
    name: 'Apple TV+',
    color: '#555555',
    icon: '🍎',
    url: 'https://tv.apple.com',
  },
  peacock: {
    id: 'peacock',
    name: 'Peacock',
    color: '#fdb927',
    icon: '🦚',
    url: 'https://www.peacocktv.com',
  },
  paramount: {
    id: 'paramount',
    name: 'Paramount+',
    color: '#0064ff',
    icon: '⛰️',
    url: 'https://www.paramountplus.com',
  },
  crunchyroll: {
    id: 'crunchyroll',
    name: 'Crunchyroll',
    color: '#f47521',
    icon: '🍥',
    url: 'https://www.crunchyroll.com',
  },
  hotstar: {
    id: 'hotstar',
    name: 'JioCinema',
    color: '#1d8fff',
    icon: '🌟',
    url: 'https://www.jiocinema.com',
  },
};

// In-memory cache for API results
const streamingCache = new Map();

const API_KEY = import.meta.env.VITE_STREAMING_API_KEY || '';

const getApiConfig = (key, showType, showId, country) => {
  const isDirectKey = key.startsWith('motn-key-');
  const isImdbId = typeof showId === 'string' && showId.startsWith('tt');
  const idPath = isImdbId ? showId : `${showType}/${showId}`;

  if (isDirectKey) {
    return {
      url: `https://api.movieofthenight.com/v4/shows/${idPath}?country=${country}`,
      headers: {
        'X-API-Key': key,
        'Content-Type': 'application/json',
      },
    };
  } else {
    return {
      url: `https://streaming-availability.p.rapidapi.com/shows/${idPath}?country=${country}`,
      headers: {
        'x-rapidapi-key': key,
        'x-rapidapi-host': 'streaming-availability.p.rapidapi.com',
        'Content-Type': 'application/json',
      },
    };
  }
};

const getPlatformObject = (service) => {
  const serviceId = service.id.toLowerCase();
  
  if (PLATFORMS[serviceId]) {
    return PLATFORMS[serviceId];
  }

  // Handle common variations
  if (serviceId === 'amazon' || serviceId === 'primevideo') {
    return PLATFORMS.prime;
  }
  if (serviceId === 'max') {
    return PLATFORMS.hbo;
  }
  if (serviceId === 'appletv' || serviceId === 'apple-tv') {
    return PLATFORMS.apple;
  }
  if (serviceId === 'paramountplus') {
    return PLATFORMS.paramount;
  }

  // Dynamic fallback for any other service
  return {
    id: serviceId,
    name: service.name,
    color: '#3b82f6',
    icon: '📺',
    url: service.homepage || 'https://www.google.com',
  };
};

const parseStreamingData = (data, countryCode) => {
  const result = {
    subscription: [],
    rent: [],
    buy: [],
  };

  if (!data || !data.streamingOptions) return result;

  const country = countryCode.toLowerCase();
  const options = data.streamingOptions[country] || [];

  options.forEach(option => {
    const platform = getPlatformObject(option.service);
    const platformWithLink = {
      ...platform,
      url: option.link || platform.url,
    };

    const type = option.type?.toLowerCase();
    
    if (type === 'subscription' || type === 'free') {
      if (!result.subscription.some(p => p.id === platformWithLink.id)) {
        result.subscription.push(platformWithLink);
      }
    } else if (type === 'rent') {
      if (!result.rent.some(p => p.id === platformWithLink.id)) {
        result.rent.push(platformWithLink);
      }
    } else if (type === 'buy') {
      if (!result.buy.some(p => p.id === platformWithLink.id)) {
        result.buy.push(platformWithLink);
      }
    }
  });

  return result;
};

export const getStreamingAvailability = async (mediaType, id, countryCode = 'US') => {
  const type = mediaType === 'tv' ? 'tv' : 'movie';
  const country = countryCode.toLowerCase();
  
  const cacheKey = `${type}-${id}-${country}`;
  if (streamingCache.has(cacheKey)) {
    return streamingCache.get(cacheKey);
  }

  if (!API_KEY) {
    const fallback = getMockAvailability(id);
    streamingCache.set(cacheKey, fallback);
    return fallback;
  }

  const { url, headers } = getApiConfig(API_KEY, type, id, country);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      throw new Error(`Streaming API error: ${response.status}`);
    }

    const data = await response.json();
    const parsed = parseStreamingData(data, countryCode);
    
    streamingCache.set(cacheKey, parsed);
    return parsed;
  } catch (error) {
    console.error('Failed to fetch streaming availability, using mock data:', error);
    return getMockAvailability(id);
  }
};

// Fallback mock availability data
const AVAILABILITY_MAP = {
  1: { subscription: ['prime', 'hotstar'], rent: ['apple'], buy: ['apple', 'prime'] },
  2: { subscription: ['peacock'], rent: ['prime', 'apple'], buy: ['prime', 'apple'] },
  3: { subscription: ['netflix', 'hbo'], rent: [], buy: ['prime', 'apple'] },
  4: { subscription: ['netflix'], rent: ['prime', 'apple'], buy: ['prime', 'apple'] },
  5: { subscription: ['paramount'], rent: ['prime', 'apple'], buy: ['prime', 'apple'] },
  6: { subscription: ['netflix', 'hbo'], rent: [], buy: ['prime', 'apple'] },
  7: { subscription: ['hbo'], rent: ['prime'], buy: ['prime', 'apple'] },
  8: { subscription: ['hulu'], rent: ['prime', 'apple'], buy: ['prime', 'apple'] },
  9: { subscription: ['netflix'], rent: [], buy: ['prime', 'apple'] },
  10: { subscription: ['netflix'], rent: [], buy: [] },
  11: { subscription: ['hbo'], rent: [], buy: ['prime'] },
  12: { subscription: ['disney'], rent: [], buy: [] },
  13: { subscription: ['hbo'], rent: ['prime', 'apple'], buy: ['prime', 'apple'] },
  14: { subscription: ['apple'], rent: ['prime'], buy: ['prime', 'apple'] },
  15: { subscription: ['hulu', 'disney'], rent: ['prime'], buy: ['prime', 'apple'] },
  16: { subscription: ['hulu', 'disney'], rent: [], buy: [] },
  17: { subscription: ['prime'], rent: [], buy: [] },
  18: { subscription: ['hbo', 'netflix'], rent: ['prime'], buy: ['prime', 'apple'] },
  19: { subscription: ['paramount'], rent: ['prime', 'apple'], buy: ['prime', 'apple'] },
  20: { subscription: ['netflix'], rent: [], buy: [] },
};

const getMockAvailability = (movieId) => {
  const availability = AVAILABILITY_MAP[movieId] || {
    subscription: ['netflix', 'prime'],
    rent: ['apple'],
    buy: ['apple', 'prime'],
  };

  return {
    subscription: availability.subscription.map(id => PLATFORMS[id]).filter(Boolean),
    rent: availability.rent.map(id => PLATFORMS[id]).filter(Boolean),
    buy: availability.buy.map(id => PLATFORMS[id]).filter(Boolean),
  };
};

export const getMoviePlatforms = (movieId) => {
  // Check if we have cached this movie's real platforms
  const cachedKey = Array.from(streamingCache.keys()).find(key => key.includes(`-${movieId}-`));
  if (cachedKey) {
    const cached = streamingCache.get(cachedKey);
    const allPlatforms = [
      ...(cached.subscription || []),
      ...(cached.rent || []),
      ...(cached.buy || []),
    ];
    const unique = [];
    allPlatforms.forEach(p => {
      if (!unique.some(x => x.id === p.id)) {
        unique.push(p);
      }
    });
    return unique;
  }

  const availability = AVAILABILITY_MAP[movieId] || { subscription: ['netflix'], rent: [], buy: [] };
  const allPlatformIds = [...new Set([...availability.subscription, ...availability.rent, ...availability.buy])];
  return allPlatformIds.map(id => PLATFORMS[id]).filter(Boolean);
};
