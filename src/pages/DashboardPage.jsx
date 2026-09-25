import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, MousePointerClick, Sparkles, Tag, Plus, Loader2, Clock, ShieldCheck } from 'lucide-react';
import { useLinks } from '../hooks/useLinks';
import { useToast } from '../context/ToastContext';
import LinkCard from '../components/LinkCard';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';

function SkeletonCard() {
  return (
    <div className="link-card skeleton-card">
      <div className="skeleton skeleton-thumb" />
      <div className="link-card-body" style={{ gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <div className="skeleton" style={{ height: 18, width: '60%', borderRadius: 6 }} />
          <div className="skeleton" style={{ height: 18, width: '20%', borderRadius: 20 }} />
        </div>
        <div className="skeleton" style={{ height: 12, width: '40%', borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 60, width: '100%', borderRadius: 8 }} />
        <div style={{ display: 'flex', gap: 6 }}>
          {[80, 60, 70].map((w, i) => (
            <div key={i} className="skeleton" style={{ height: 26, width: w, borderRadius: 20 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg, delay = 0 }) {
  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <div className="stat-card-icon" style={{ background: bg }}>
        {Icon ? <Icon className="h-5 w-5" style={{ color }} /> : null}
      </div>
      <div>
        <p className="stat-card-label">{label}</p>
        <p className="stat-card-value">{value ?? 0}</p>
      </div>
    </motion.div>
  );
}

function DashboardPage() {
  const navigate = useNavigate();
  const [query, setQuery]           = useState('');
  const [category, setCategory]     = useState('');
  const [readingTime, setReadingTime] = useState('');
  const [sort, setSort]             = useState('');

  const filters = useMemo(
    () => ({ q: query || undefined, category: category || undefined, readingTime: readingTime || undefined, sort: sort || undefined }),
    [query, category, readingTime, sort]
  );

  const toast = useToast();
  const { linksQuery, createLinkMutation, deleteLinkMutation } = useLinks(filters);
  const [form, setForm] = useState({ originalUrl: '', customAlias: '', tags: '', notes: '' });

  const links = Array.isArray(linksQuery.data) ? linksQuery.data.filter(Boolean) : [];
  const totalClicks = links.reduce((t, l) => t + (l?.clicks || 0), 0);
  const aiCount     = links.filter(l => l?.summary).length;
  
  const categories  = useMemo(
    () => [...new Set(links.map(l => l?.primaryCategory || l?.category).filter(c => c && typeof c === 'string' && !['general', 'technology', 'website', 'miscellaneous', 'other'].includes(c.toLowerCase().trim())))].sort(),
    [links]
  );
  
  const linksWithReadingTime = links.filter(l => (l?.readingTime || 0) > 0);
  const avgReadingTime = linksWithReadingTime.length
    ? Math.round(linksWithReadingTime.reduce((acc, curr) => acc + (curr?.readingTime || 0), 0) / linksWithReadingTime.length)
    : 0;

  const categoryCounts = links.reduce((acc, curr) => {
    const cat = curr?.primaryCategory || curr?.category;
    if (cat && !['general', 'technology', 'website', 'miscellaneous', 'other'].includes(String(cat).toLowerCase().trim())) {
      acc[cat] = (acc[cat] || 0) + 1;
    }
    return acc;
  }, {});
  const topCategory = Object.keys(categoryCounts).length
    ? Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b)
    : 'None';

  // Compute all unique tags
  const uniqueTags = useMemo(() => {
    const set = new Set();
    links.forEach(l => {
      if (Array.isArray(l.tags)) {
        l.tags.forEach(t => set.add(t));
      }
    });
    return [...set].sort();
  }, [links]);

  const storedUser  = JSON.parse(localStorage.getItem('smartlink_user') || '{}');
  const greeting    = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('smartlink_token');
    if (!token) {
      toast.warning('Please sign in to create smart links.');
      navigate('/login');
      return;
    }
    if (!form.originalUrl.trim()) return;
    createLinkMutation.mutate(form, {
      onSuccess: () => {
        setForm({ originalUrl: '', customAlias: '', tags: '', notes: '' });
        toast.success('SmartLink created with AI analysis!');
      },
      onError: (err) => toast.error(err?.response?.data?.message || 'Failed to create link')
    });
  };

  const handleDelete = (id) => {
    deleteLinkMutation.mutate(id, {
      onSuccess: () => toast.success('Link deleted'),
      onError:   () => toast.error('Failed to delete link')
    });
  };

  return (
    <div className="dashboard-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Welcome header */}
      <div className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">SmartLink AI Workspace</p>
          <h1 className="dashboard-title">
            {greeting}{storedUser?.name ? `, ${storedUser.name.split(' ')[0]}` : ''}
          </h1>
          <p className="dashboard-subtitle">My Personal Knowledge Vault</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard label="Vault Links"  value={links.length} icon={Link2}             color="#3B82F6" bg="#DBEAFE" delay={0}    />
        <StatCard label="Total Clicks" value={totalClicks}  icon={MousePointerClick} color="#0EA5E9" bg="#E0F2FE" delay={0.05} />
        <StatCard label="AI Previews"  value={aiCount}      icon={Sparkles}          color="#8B5CF6" bg="#EDE9FE" delay={0.1}  />
        <StatCard label="Avg Reading"  value={`${avgReadingTime}m`} icon={Clock}     color="#F59E0B" bg="#FEF3C7" delay={0.15} />
        <StatCard label="Top Category" value={topCategory}  icon={Tag}               color="#22C55E" bg="#DCFCE7" delay={0.2}  />
      </div>

      {/* Create Link Panel for Desktop */}
      <motion.div
        className="create-panel hidden md:block"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        style={{ padding: 24, borderRadius: 20, background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}
      >
        <div className="create-panel-header" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{
            display: 'grid', placeItems: 'center',
            width: 30, height: 30, borderRadius: 8,
            background: 'var(--c-primary-light)'
          }}>
            <Plus className="h-4 w-4" style={{ color: 'var(--c-primary)' }} />
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-text)', margin: 0 }}>Add Link to Knowledge Vault</h2>
        </div>

        <form className="create-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <input
              id="create-url"
              className="create-input"
              type="url"
              placeholder="Paste destination URL (https://example.com)..."
              value={form.originalUrl}
              onChange={e => setForm(c => ({ ...c, originalUrl: e.target.value }))}
              required
              style={{ width: '100%' }}
            />
            <input
              id="create-alias"
              className="create-input"
              type="text"
              placeholder="Custom alias (optional)"
              value={form.customAlias}
              onChange={e => setForm(c => ({ ...c, customAlias: e.target.value }))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
            <input
              id="create-tags"
              className="create-input"
              type="text"
              placeholder="Tags (e.g. college, react, placement)"
              value={form.tags}
              onChange={e => setForm(c => ({ ...c, tags: e.target.value }))}
              style={{ width: '100%' }}
            />
            <textarea
              id="create-notes"
              className="create-input"
              placeholder="Personal Note: Why are you saving this link?"
              value={form.notes}
              onChange={e => setForm(c => ({ ...c, notes: e.target.value }))}
              style={{ width: '100%', minHeight: 44, resize: 'vertical', padding: '10px 14px' }}
            />
          </div>

          <button id="create-submit" type="submit" className="create-btn" disabled={createLinkMutation.isPending} style={{ width: 'fit-content', minHeight: 44 }}>
            {createLinkMutation.isPending
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Fetching details…</>
              : <><Sparkles className="h-4 w-4" /> Save Intelligent Object</>
            }
          </button>
        </form>
      </motion.div>

      {/* Search + Filters */}
      <div className="search-filter-row" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', width: '100%' }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <SearchBar value={query} onChange={setQuery} />
          </div>
          <FilterBar
            categories={categories}
            category={category}          onCategoryChange={setCategory}
            readingTime={readingTime}    onReadingTimeChange={setReadingTime}
            sort={sort}                  onSortChange={setSort}
          />
        </div>

        {/* Tag helper chips */}
        {uniqueTags.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', background: 'var(--c-surface)', padding: 12, borderRadius: 12, border: '1px solid var(--c-border)' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase' }}>Filter by Vault Tag:</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button
                onClick={() => setQuery('')}
                style={{
                  fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
                  background: query === '' ? 'var(--c-primary-light)' : 'var(--c-surface-2)',
                  color: query === '' ? 'var(--c-primary-text)' : 'var(--c-text-2)',
                  border: '1px solid var(--c-border)', cursor: 'pointer'
                }}
              >
                All
              </button>
              {uniqueTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  style={{
                    fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
                    background: query === tag ? 'var(--c-primary-light)' : 'var(--c-surface-2)',
                    color: query === tag ? 'var(--c-primary-text)' : 'var(--c-text-2)',
                    border: '1px solid var(--c-border)', cursor: 'pointer'
                  }}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Link grid */}
      <div>
        {linksQuery.isLoading ? (
          <div className="links-grid">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : links.length === 0 ? (
          <motion.div className="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'var(--c-primary-light)',
              display: 'grid', placeItems: 'center', marginBottom: 16
            }}>
              <Sparkles className="h-7 w-7" style={{ color: 'var(--c-primary)' }} />
            </div>
            <p style={{ fontWeight: 700, color: 'var(--c-text)', fontSize: 17 }}>
              {query || category || readingTime ? 'No matching links in vault' : 'Knowledge Vault is empty'}
            </p>
            <p style={{ color: 'var(--c-text-3)', fontSize: 14, marginTop: 6 }}>
              {query || category || readingTime
                ? 'Try adjusting your search query or filters'
                : 'Create your first SmartLink using the form or FAB button below'}
            </p>
          </motion.div>
        ) : (
          <div className="links-grid">
            <AnimatePresence>
              {links.map((link, i) => (
                <motion.div
                  key={link._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ delay: i * 0.04, duration: 0.28 }}
                >
                  <LinkCard link={link} onDelete={handleDelete} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
