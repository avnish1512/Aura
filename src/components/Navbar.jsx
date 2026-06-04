import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, Home, Compass, Bookmark, Crown, Menu, X, User, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import CountrySelector from './CountrySelector';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { auth, watchlist } = useApp();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
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

          <form className="navbar-search" onSubmit={handleSearch}>
            <Search className="navbar-search-icon" />
            <input
              type="text"
              placeholder="Search movies, TV shows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="navbar-search-input"
            />
          </form>

          <div className="navbar-links">
            <NavLink to="/" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`} end>
              <Home size={18} /> Home
            </NavLink>
            <NavLink to="/browse" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              <Compass size={18} /> Browse
            </NavLink>
            <NavLink to="/watchlist" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              <Bookmark size={18} /> Watchlist
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
            <NavLink to="/premium" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              <Crown size={18} /> Pro
            </NavLink>
          </div>

          <div className="navbar-actions">
            <CountrySelector />
            {auth.isAuthenticated ? (
              <div style={{ position: 'relative' }}>
                <button
                  className="btn-icon btn-secondary"
                  onClick={auth.logout}
                  title="Log out"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--gradient-primary)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    border: 'none',
                  }}
                >
                  {auth.user.name?.[0]?.toUpperCase() || 'U'}
                </button>
              </div>
            ) : (
              <Link to="/auth" className="btn btn-primary btn-sm">
                Sign In
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

        <div className="mobile-search">
          <form onSubmit={(e) => { handleSearch(e); closeMobile(); }}>
            <input
              type="text"
              placeholder="Search movies, TV shows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
