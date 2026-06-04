import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, Plus, Crown, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BottomNavbar() {
  const navigate = useNavigate();
  const { watchlist } = useApp();

  return (
    <div className="bottom-nav">
      <div className="bottom-nav-capsule">
        <NavLink to="/" className={({ isActive }) => `bottom-nav-btn ${isActive ? 'active' : ''}`} end>
          <Home size={22} />
          <span>Home</span>
        </NavLink>

        <NavLink to="/search" className={({ isActive }) => `bottom-nav-btn ${isActive ? 'active' : ''}`}>
          <Search size={22} />
          <span>Search</span>
        </NavLink>

        <div className="bottom-nav-center">
          <button 
            className="bottom-nav-center-btn" 
            onClick={() => navigate('/browse')}
            title="Browse Categories"
            aria-label="Browse"
          >
            <Plus size={28} />
          </button>
        </div>

        <NavLink to="/premium" className={({ isActive }) => `bottom-nav-btn ${isActive ? 'active' : ''}`}>
          <Crown size={22} />
          <span>Pro</span>
        </NavLink>

        <NavLink to="/watchlist" className={({ isActive }) => `bottom-nav-btn ${isActive ? 'active' : ''}`}>
          <div style={{ position: 'relative' }}>
            <User size={22} />
            {watchlist.count > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-6px',
                background: 'var(--gradient-primary)',
                color: 'white',
                fontSize: '0.6rem',
                fontWeight: 700,
                borderRadius: '50%',
                width: '14px',
                height: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid rgba(10, 10, 24, 0.9)'
              }}>
                {watchlist.count}
              </span>
            )}
          </div>
          <span>My Box</span>
        </NavLink>
      </div>
    </div>
  );
}
