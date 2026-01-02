interface SkeletonLoaderProps {
  type?: 'table' | 'card' | 'stat';
  rows?: number;
}

export const SkeletonLoader = ({ type = 'card', rows = 3 }: SkeletonLoaderProps) => {
  if (type === 'table') {
    return (
      <div className="skeleton-table">
        <div className="skeleton-row skeleton-header">
          <div className="skeleton-cell" style={{ width: '25%' }}></div>
          <div className="skeleton-cell" style={{ width: '15%' }}></div>
          <div className="skeleton-cell" style={{ width: '15%' }}></div>
          <div className="skeleton-cell" style={{ width: '15%' }}></div>
          <div className="skeleton-cell" style={{ width: '15%' }}></div>
          <div className="skeleton-cell" style={{ width: '15%' }}></div>
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skeleton-row">
            <div className="skeleton-cell" style={{ width: '25%' }}></div>
            <div className="skeleton-cell" style={{ width: '15%' }}></div>
            <div className="skeleton-cell" style={{ width: '15%' }}></div>
            <div className="skeleton-cell" style={{ width: '15%' }}></div>
            <div className="skeleton-cell" style={{ width: '15%' }}></div>
            <div className="skeleton-cell" style={{ width: '15%' }}></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'stat') {
    return (
      <div className="skeleton-stat-grid">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="skeleton-stat-card">
            <div className="skeleton-line" style={{ width: '60%', height: '0.9rem', marginBottom: '0.5rem' }}></div>
            <div className="skeleton-line" style={{ width: '40%', height: '1.8rem', marginBottom: '0.5rem' }}></div>
            <div className="skeleton-line" style={{ width: '80%', height: '0.75rem' }}></div>
          </div>
        ))}
      </div>
    );
  }

  // Card type (default)
  return (
    <div className="skeleton-cards">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-line" style={{ width: '40%', height: '1.2rem', marginBottom: '1rem' }}></div>
          <div className="skeleton-line" style={{ width: '100%', height: '0.9rem', marginBottom: '0.5rem' }}></div>
          <div className="skeleton-line" style={{ width: '80%', height: '0.9rem', marginBottom: '0.5rem' }}></div>
          <div className="skeleton-line" style={{ width: '90%', height: '0.9rem' }}></div>
        </div>
      ))}
    </div>
  );
};

