import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, Home, Compass, Bookmark, Crown, Menu, X, User, LogOut, Bell, ChevronDown, Smile } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { searchMulti, getImageUrl } from '../api/tmdb';
import { useDebounce } from '../hooks/useDebounce';
import CountrySelector from './CountrySelector';

const getResultTitle = (item) => item?.title || item?.name || 'Untitled';

const getResultYear = (item) =>
  (item?.release_date || item?.first_air_date || '').slice(0, 4);

function SearchSuggestions({ query, results, loading, onPick }) {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return null;

  return (
    <div className="navbar-search-dropdown" role="listbox" aria-label="Search suggestions">
      {trimmedQuery.length < 2 ? (
        <div className="navbar-search-status">Keep typing to search titles</div>
      ) : loading ? (
        <div className="navbar-search-status">Searching...</div>
      ) : results.length > 0 ? (
        results.map((item) => {
          const title = getResultTitle(item);
          const year = getResultYear(item);
          const image = getImageUrl(item.poster_path, 'w92') || getImageUrl(item.backdrop_path, 'w154');

          return (
            <button
              type="button"
              className="navbar-search-result"
              key={`${item.media_type || 'movie'}-${item.id}`}
              onClick={() => onPick(item)}
              role="option"
            >
              <span className="navbar-search-thumb">
                {image ? <img src={image} alt="" loading="lazy" /> : <span>{title.charAt(0)}</span>}
              </span>
              <span className="navbar-search-copy">
                <strong>{title}</strong>
                <small>
                  {item.media_type === 'tv' ? 'Series' : 'Movie'}
                  {year ? ` · ${year}` : ''}
                </small>
              </span>
            </button>
          );
        })
      ) : (
        <div className="navbar-search-status">No titles found</div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const navigate = useNavigate();
  const { auth, watchlist } = useApp();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const query = debouncedSearchQuery.trim();
    if (query.length < 2) {
      return undefined;
    }

    let active = true;
    async function fetchSuggestions() {
      setSearchLoading(true);
      try {
        const data = await searchMulti(query);
        if (!active) return;
        const titles = (data.results || [])
          .filter((item) => item.media_type !== 'person')
          .slice(0, 7);
        setSearchResults(titles);
      } catch (err) {
        console.error('Navbar search failed:', err);
        if (active) setSearchResults([]);
      } finally {
        if (active) setSearchLoading(false);
      }
    }

    fetchSuggestions();
    return () => {
      active = false;
    };
  }, [debouncedSearchQuery]);

  useEffect(() => {
    const handleClick = (event) => {
      const target = event.target;
      const inDesktopSearch = searchRef.current?.contains(target);
      const inMobileSearch = mobileSearchRef.current?.contains(target);
      if (!inDesktopSearch && !inMobileSearch) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchOpen(false);
    setSearchLoading(false);
  };

  const openSearchResult = (item, closeMenu = false) => {
    if (!item?.id) return;
    navigate(`/details/${item.media_type || 'movie'}/${item.id}`);
    clearSearch();
    if (closeMenu) setMobileOpen(false);
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setSearchOpen(Boolean(value.trim()));
    if (value.trim().length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
    }
  };

  const handleSearch = (e, closeMenu = false) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (searchResults.length > 0) {
      openSearchResult(searchResults[0], closeMenu);
    } else {
      setSearchOpen(true);
    }
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="main-navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo">
            <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="14" cy="14" r="13" stroke="url(#logo-grad)" strokeWidth="2"/>
              <path d="M8 18L14 8L20 18" stroke="url(#logo-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="14" cy="16" r="2" fill="url(#logo-grad)"/>
              <defs>
                <linearGradient id="logo-grad" x1="4" y1="4" x2="24" y2="24">
                  <stop stopColor="#8b5cf6"/>
                  <stop offset="1" stopColor="#06b6d4"/>
                </linearGradient>
              </defs>
            </svg>
            Aura
          </Link>

          <div className="navbar-links">
            <NavLink to="/" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`} end>
              Home
            </NavLink>
            <NavLink to="/browse?media=tv" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              Shows
            </NavLink>
            <NavLink to="/browse?media=movie" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              Movies
            </NavLink>
            <NavLink to="/browse?category=games" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              Games
            </NavLink>
            <NavLink to="/browse?sort=popular" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              New & Popular
            </NavLink>
            <NavLink to="/watchlist" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              My List
              {watchlist.count > 0 && (
                <span style={{
                  background: 'var(--gradient-primary)',
                  borderRadius: 'var(--radius-full)',
                  padding: '1px 7px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: 'white',
                  marginLeft: '-2px'
                }}>
                  {watchlist.count}
                </span>
              )}
            </NavLink>
            <NavLink to="/browse" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              Browse by Languages
            </NavLink>
          </div>

          <form className="navbar-search" onSubmit={handleSearch} ref={searchRef}>
            <Search className="navbar-search-icon" />
            <input
              type="text"
              placeholder="Titles, people, genres"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setSearchOpen(Boolean(searchQuery.trim()))}
              id="navbar-search-input"
              autoComplete="off"
            />
            {searchOpen && (
              <SearchSuggestions
                query={searchQuery}
                results={searchResults}
                loading={searchLoading}
                onPick={(item) => openSearchResult(item)}
              />
            )}
          </form>

          <div className="navbar-actions">
            <Link to="/browse?genre=10751" className="navbar-web-action navbar-kids-link">
              Kids
            </Link>
            <button type="button" className="navbar-web-action navbar-bell-btn" aria-label="Notifications">
              <Bell size={24} />
            </button>
            <CountrySelector />
            {auth.isAuthenticated ? (
              <div style={{ position: 'relative' }}>
                <button
                  className="btn-icon btn-secondary navbar-profile-chip"
                  onClick={auth.logout}
                  title="Log out"
                >
                  {auth.user.name?.[0]?.toUpperCase() || 'U'}
                  <ChevronDown className="navbar-profile-arrow" size={16} />
                </button>
              </div>
            ) : (
              <Link to="/auth" className="btn btn-primary btn-sm navbar-profile-chip" aria-label="Profile">
                <span className="navbar-signin-text">Sign In</span>
                <Smile className="navbar-profile-smile" size={23} />
                <ChevronDown className="navbar-profile-arrow" size={16} />
              </Link>
            )}
            <button
              className="navbar-mobile-toggle"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Nav */}
      <div className={`mobile-nav-overlay ${mobileOpen ? 'open' : ''}`} onClick={closeMobile} />
      <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`}>
        <button className="mobile-nav-close" onClick={closeMobile} aria-label="Close menu">
          <X size={22} />
        </button>

        <div className="mobile-search" ref={mobileSearchRef}>
          <form onSubmit={(e) => handleSearch(e, true)}>
            <input
              type="text"
              placeholder="Titles, people, genres"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setSearchOpen(Boolean(searchQuery.trim()))}
              autoComplete="off"
            />
            {searchOpen && (
              <SearchSuggestions
                query={searchQuery}
                results={searchResults}
                loading={searchLoading}
                onPick={(item) => openSearchResult(item, true)}
              />
            )}
          </form>
        </div>

        <NavLink to="/" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
          <Home size={20} /> Home
        </NavLink>
        <NavLink to="/browse" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
          <Compass size={20} /> Browse
        </NavLink>
        <NavLink to="/search" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
          <Search size={20} /> Search
        </NavLink>
        <NavLink to="/watchlist" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
          <Bookmark size={20} /> Watchlist {watchlist.count > 0 && `(${watchlist.count})`}
        </NavLink>
        <NavLink to="/premium" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} onClick={closeMobile}>
          <Crown size={20} /> Premium
        </NavLink>

        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-lg)', borderTop: '1px solid var(--border-subtle)' }}>
          {auth.isAuthenticated ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: 'var(--space-md)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <User size={18} /> {auth.user.name}
              </div>
              <button className="mobile-nav-link" onClick={() => { auth.logout(); closeMobile(); }} style={{ width: '100%', textAlign: 'left', color: 'var(--rating-low)' }}>
                <LogOut size={20} /> Log Out
              </button>
            </>
          ) : (
            <Link to="/auth" className="btn btn-primary" style={{ width: '100%' }} onClick={closeMobile}>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
