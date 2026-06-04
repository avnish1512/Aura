import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
];

export default function CountrySelector() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { country, setCountry } = useApp();

  const selected = COUNTRIES.find(c => c.code === country) || COUNTRIES[0];

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="country-selector" ref={ref}>
      <button
        className="country-selector-btn"
        onClick={() => setOpen(!open)}
        aria-label="Select country"
        id="country-selector"
      >
        <span className="country-flag">{selected.flag}</span>
        <span>{selected.code}</span>
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="country-dropdown">
          {COUNTRIES.map(c => (
            <div
              key={c.code}
              className={`country-option ${c.code === country ? 'active' : ''}`}
              onClick={() => { setCountry(c.code); setOpen(false); }}
            >
              <span className="country-flag">{c.flag}</span>
              <span>{c.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
