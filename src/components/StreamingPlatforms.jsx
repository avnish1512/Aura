import { ExternalLink, Play, ShoppingCart } from 'lucide-react';

export default function StreamingPlatforms({ availability }) {
  if (!availability) return null;

  const { subscription = [], rent = [], buy = [] } = availability;

  const renderSection = (title, icon, items, type) => {
    if (items.length === 0) return null;
    return (
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)',
          marginBottom: 'var(--space-sm)',
          color: 'var(--text-secondary)',
          fontSize: '0.8rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {icon} {title}
        </div>
        <div className="streaming-grid">
          {items.map(platform => (
            <a
              key={platform.id}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="streaming-item"
            >
              <div
                className="streaming-logo"
                style={{
                  background: platform.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {platform.icon}
              </div>
              <div className="streaming-item-info">
                <div className="streaming-item-name">{platform.name}</div>
                <div className="streaming-item-type">{type}</div>
              </div>
              <ExternalLink size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
            </a>
          ))}
        </div>
      </div>
    );
  };

  const hasAny = subscription.length > 0 || rent.length > 0 || buy.length > 0;

  if (!hasAny) {
    return (
      <div className="streaming-section">
        <h3>📺 Where to Watch</h3>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
          Streaming availability data is not available for this title in your region.
        </p>
      </div>
    );
  }

  return (
    <div className="streaming-section">
      <h3>📺 Where to Watch</h3>
      {renderSection('Stream', <Play size={14} />, subscription, 'Subscription')}
      {renderSection('Rent', <ShoppingCart size={14} />, rent, 'Rent')}
      {renderSection('Buy', <ShoppingCart size={14} />, buy, 'Purchase')}
    </div>
  );
}
