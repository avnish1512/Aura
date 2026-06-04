import { GENRES } from '../api/tmdb';

export default function GenreChips({ selected = [], onSelect, genres = GENRES }) {
  return (
    <div className="genre-chips">
      <button
        className={`genre-chip ${selected.length === 0 ? 'active' : ''}`}
        onClick={() => onSelect([])}
      >
        All
      </button>
      {genres.map(genre => (
        <button
          key={genre.id}
          className={`genre-chip ${selected.includes(genre.id) ? 'active' : ''}`}
          onClick={() => {
            if (selected.includes(genre.id)) {
              onSelect(selected.filter(id => id !== genre.id));
            } else {
              onSelect([...selected, genre.id]);
            }
          }}
        >
          {genre.name}
        </button>
      ))}
    </div>
  );
}
