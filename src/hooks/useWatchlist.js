import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'aura_watchlist';

function loadWatchlist() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveWatchlist(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage full or unavailable
  }
}

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState(loadWatchlist);

  useEffect(() => {
    saveWatchlist(watchlist);
  }, [watchlist]);

  const addToWatchlist = useCallback((item) => {
    setWatchlist(prev => {
      if (prev.some(i => i.id === item.id)) return prev;
      return [...prev, {
        id: item.id,
        title: item.title || item.name,
        poster_path: item.poster_path,
        media_type: item.media_type || 'movie',
        vote_average: item.vote_average,
        release_date: item.release_date || item.first_air_date,
        genre_ids: item.genre_ids || [],
        addedAt: Date.now(),
      }];
    });
  }, []);

  const removeFromWatchlist = useCallback((id) => {
    setWatchlist(prev => prev.filter(i => i.id !== id));
  }, []);

  const isInWatchlist = useCallback((id) => {
    return watchlist.some(i => i.id === id);
  }, [watchlist]);

  const toggleWatchlist = useCallback((item) => {
    if (isInWatchlist(item.id)) {
      removeFromWatchlist(item.id);
    } else {
      addToWatchlist(item);
    }
  }, [isInWatchlist, addToWatchlist, removeFromWatchlist]);

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    toggleWatchlist,
    count: watchlist.length,
  };
}
