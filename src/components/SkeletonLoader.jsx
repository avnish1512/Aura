export function SkeletonCard({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="movie-card" style={{ pointerEvents: 'none' }}>
          <div className="movie-card-poster">
            <div className="skeleton" style={{ position: 'absolute', inset: 0 }} />
          </div>
          <div className="movie-card-info">
            <div className="skeleton skeleton-text" style={{ width: '80%' }} />
            <div className="skeleton skeleton-text short" style={{ height: '10px' }} />
          </div>
        </div>
      ))}
    </>
  );
}

export function SkeletonCarousel() {
  return (
    <div className="section">
      <div className="section-header">
        <div className="skeleton skeleton-title" style={{ width: '200px' }} />
      </div>
      <div className="carousel-track">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ width: '200px', flexShrink: 0 }}>
            <div className="skeleton skeleton-card" />
            <div style={{ padding: '8px 0' }}>
              <div className="skeleton skeleton-text" style={{ width: '70%' }} />
              <div className="skeleton skeleton-text short" style={{ height: '10px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div style={{ padding: 'var(--space-2xl) 0' }}>
      <div className="details-header container">
        <div className="skeleton" style={{ width: '280px', aspectRatio: '2/3', flexShrink: 0, borderRadius: 'var(--radius-lg)' }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton skeleton-title" style={{ width: '60%', height: '40px', marginBottom: '16px' }} />
          <div className="skeleton skeleton-text" style={{ width: '40%' }} />
          <div className="skeleton skeleton-text" style={{ width: '90%', marginTop: '24px' }} />
          <div className="skeleton skeleton-text" style={{ width: '85%' }} />
          <div className="skeleton skeleton-text" style={{ width: '70%' }} />
        </div>
      </div>
    </div>
  );
}
