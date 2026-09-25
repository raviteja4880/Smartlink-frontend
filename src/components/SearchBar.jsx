import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

function SearchBar({ value, onChange, delay = 300, placeholder = 'Search by title, keyword, category…' }) {
  const [local, setLocal] = useState(value || '');
  const timer = useRef(null);

  useEffect(() => { setLocal(value || ''); }, [value]);

  const handleChange = (e) => {
    const next = e.target.value;
    setLocal(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(next), delay);
  };

  const handleClear = () => {
    setLocal('');
    clearTimeout(timer.current);
    onChange('');
  };

  return (
    <div className="search-bar-wrapper">
      <Search className="search-bar-icon" />
      <input
        id="link-search"
        type="text"
        className="search-bar-input"
        placeholder={placeholder}
        value={local}
        onChange={handleChange}
        autoComplete="off"
        aria-label="Search links"
      />
      {local && (
        <button className="search-bar-clear" onClick={handleClear} aria-label="Clear search" type="button">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
