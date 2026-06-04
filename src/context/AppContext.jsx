import { createContext, useContext, useState } from 'react';
import { useWatchlist } from '../hooks/useWatchlist';
import { useAuth } from '../hooks/useAuth';

const AppContext = createContext(null);

const COUNTRY_KEY = 'aura_country';

function loadCountry() {
  try {
    return localStorage.getItem(COUNTRY_KEY) || 'US';
  } catch {
    return 'US';
  }
}

export function AppProvider({ children }) {
  const [country, setCountryState] = useState(loadCountry);
  const watchlist = useWatchlist();
  const auth = useAuth();

  const setCountry = (code) => {
    setCountryState(code);
    try { localStorage.setItem(COUNTRY_KEY, code); } catch { return; }
  };

  return (
    <AppContext.Provider value={{
      country,
      setCountry,
      watchlist,
      auth,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
