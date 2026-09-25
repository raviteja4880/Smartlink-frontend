import { useMemo, useState } from 'react';
import { SlidersHorizontal, X, Filter } from 'lucide-react';

const READING_TIME_OPTIONS = [
  { label: 'Any length', value: '' },
  { label: '< 3 min',    value: 'short' },
  { label: '3–7 min',    value: 'medium' },
  { label: '7+ min',     value: 'long' }
];

const SORT_OPTIONS = [
  { label: 'Newest',       value: '' },
  { label: 'Oldest',       value: 'oldest' },
  { label: 'Most clicked', value: 'clicks' }
];

function FilterBar({ categories = [], category, onCategoryChange, readingTime, onReadingTimeChange, sort, onSortChange }) {
  const [showSheet, setShowSheet] = useState(false);
  const categoryOptions = useMemo(() => ['All', ...categories.filter(Boolean)], [categories]);

  const activeFiltersCount = [category, readingTime, sort].filter(Boolean).length;

  return (
    <>
      {/* ── Mobile Filter Trigger Button ── */}
      <div className="md:hidden" style={{ width: '100%' }}>
        <button
          type="button"
          onClick={() => setShowSheet(true)}
          className="action-btn action-btn-ghost"
          style={{
            width: '100%', height: 48, display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8, fontSize: 14, fontWeight: 600
          }}
        >
          <SlidersHorizontal className="h-4 w-4" style={{ color: 'var(--c-primary)' }} />
          <span>Filters & Sorting</span>
          {activeFiltersCount > 0 && (
            <span style={{
              background: 'var(--c-primary)', color: '#fff', fontSize: 11,
              borderRadius: '50%', width: 20, height: 20, display: 'grid',
              placeItems: 'center', fontWeight: 700
            }}>
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Desktop Horizontal Filter Bar ── */}
      <div className="filter-bar hidden md:flex">
        <div className="filter-bar-label">
          <SlidersHorizontal className="h-4 w-4" style={{ color: 'var(--c-primary)' }} />
          <span>Filters</span>
        </div>

        {/* Category */}
        <div className="filter-group">
          <label htmlFor="filter-category" className="filter-label">Category</label>
          <select
            id="filter-category"
            className="filter-select"
            value={category || 'All'}
            onChange={e => onCategoryChange(e.target.value === 'All' ? '' : e.target.value)}
          >
            {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        {/* Reading time */}
        <div className="filter-group">
          <label htmlFor="filter-reading-time" className="filter-label">Read time</label>
          <select
            id="filter-reading-time"
            className="filter-select"
            value={readingTime || ''}
            onChange={e => onReadingTimeChange(e.target.value)}
          >
            {READING_TIME_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        {/* Sort */}
        <div className="filter-group">
          <label htmlFor="filter-sort" className="filter-label">Sort</label>
          <select
            id="filter-sort"
            className="filter-select"
            value={sort || ''}
            onChange={e => onSortChange(e.target.value)}
          >
            {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
      </div>

      {/* ── Mobile Filter Bottom Sheet ── */}
      {showSheet && (
        <>
          <div className="bottom-sheet-backdrop" onClick={() => setShowSheet(false)} />
          <div className="bottom-sheet-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Filter className="h-5 w-5" style={{ color: 'var(--c-primary)' }} />
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>Filters & Sorting</h3>
              </div>
              <button
                onClick={() => setShowSheet(false)}
                style={{ background: 'none', border: 'none', color: 'var(--c-text-3)' }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Category */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label className="auth-label" htmlFor="mobile-filter-category">Category</label>
                <select
                  id="mobile-filter-category"
                  className="create-input"
                  style={{ height: 48 }}
                  value={category || 'All'}
                  onChange={e => onCategoryChange(e.target.value === 'All' ? '' : e.target.value)}
                >
                  {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              {/* Reading time */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label className="auth-label" htmlFor="mobile-filter-readtime">Read Time</label>
                <select
                  id="mobile-filter-readtime"
                  className="create-input"
                  style={{ height: 48 }}
                  value={readingTime || ''}
                  onChange={e => onReadingTimeChange(e.target.value)}
                >
                  {READING_TIME_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>

              {/* Sort */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label className="auth-label" htmlFor="mobile-filter-sort">Sort By</label>
                <select
                  id="mobile-filter-sort"
                  className="create-input"
                  style={{ height: 48 }}
                  value={sort || ''}
                  onChange={e => onSortChange(e.target.value)}
                >
                  {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>

              <button
                type="button"
                className="create-btn"
                style={{ marginTop: 8, height: 48 }}
                onClick={() => setShowSheet(false)}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default FilterBar;
