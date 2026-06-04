import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import MovieCard from './MovieCard';

export default function Carousel({ title, items = [], seeAllLink, cardWidth = 200 }) {
  const trackRef = useRef(null);

  const scroll = (direction) => {
    if (!trackRef.current) return;
    const amount = cardWidth * 3;
    trackRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  if (items.length === 0) return null;

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        {seeAllLink && (
          <Link to={seeAllLink} className="section-link">
            See All <ChevronRight size={16} />
          </Link>
        )}
      </div>

      <div className="carousel-wrapper">
        <button
          className="carousel-btn left"
          onClick={() => scroll('left')}
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="carousel-track" ref={trackRef}>
          {items.map((item) => (
            <MovieCard key={item.id} movie={item} width={`${cardWidth}px`} />
          ))}
        </div>

        <button
          className="carousel-btn right"
          onClick={() => scroll('right')}
          aria-label="Scroll right"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
