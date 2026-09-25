import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles, LayoutDashboard, UserCircle, Shield, Menu, X, LogOut, ChevronDown,
  Home, Link2, Plus, BarChart3, Settings, Loader2, FolderOpen
} from 'lucide-react';
import { linksApi } from '../services/api';
import { useToast } from '../context/ToastContext';

function NavItem({ to, icon: Icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) => `nav-pill${isActive ? ' nav-pill--active' : ''}`}
    >
      <Icon className="h-[15px] w-[15px]" />
      {label}
    </NavLink>
  );
}

function LandingNavLink({ href, label, onClick }) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  const handleClick = (e) => {
    if (onClick) onClick();
    if (isHome) {
      e.preventDefault();
      const id = href.replace('/#', '').replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <a
      href={isHome ? href.replace('/', '') : href}
      onClick={handleClick}
      className="nav-pill"
    >
      {label}
    </a>
  );
}

function Layout() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const toast       = useToast();
  const queryClient = useQueryClient();

  const [drawer, setDrawer]                 = useState(false);
  const [dropdown, setDropdown]             = useState(false);
  const [scrolled, setScrolled]             = useState(false);
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [showAnalyticsSheet, setShowAnalyticsSheet] = useState(false);

  // Create link form states inside layout
  const [createUrl, setCreateUrl]     = useState('');
  const [createAlias, setCreateAlias] = useState('');
  const [createTags, setCreateTags]   = useState('');
  const [createNotes, setCreateNotes] = useState('');

  useEffect(() => {
    setDropdown(false);
    setDrawer(false);
    setShowCreateSheet(false);
    setShowAnalyticsSheet(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const storedUser = JSON.parse(localStorage.getItem('smartlink_user') || '{}');
  const isAdmin    = storedUser?.role === 'admin';
  const userName   = storedUser?.name  || '';
  const userEmail  = storedUser?.email || '';
  const initials   = userName ? userName.charAt(0).toUpperCase() : '?';

  // Fetch user's links for analytics chooser
  const linksQuery = useQuery({
    queryKey: ['links-selector'],
    queryFn: async () => {
      const res = await linksApi.list({});
      return res?.data?.data || [];
    },
    enabled: !!userName && showAnalyticsSheet
  });

  const createMutation = useMutation({
    mutationFn: linksApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      queryClient.invalidateQueries({ queryKey: ['links-selector'] });
      toast.success('SmartLink created with AI analysis!');
      setShowCreateSheet(false);
      setCreateUrl('');
      setCreateAlias('');
      setCreateTags('');
      setCreateNotes('');
      navigate('/dashboard');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to create link');
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('smartlink_token');
    localStorage.removeItem('smartlink_user');
    setDrawer(false); setDropdown(false);
    navigate('/login');
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!userName) {
      toast.warning('Please sign in to create smart links.');
      setShowCreateSheet(false);
      navigate('/login');
      return;
    }
    if (!createUrl.trim()) return;
    createMutation.mutate({
      originalUrl: createUrl,
      customAlias: createAlias,
      tags: createTags,
      notes: createNotes
    });
  };

  const mainNavLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Vault' },
    { to: '/collections', icon: FolderOpen, label: 'Collections' },
    ...(isAdmin ? [{ to: '/admin', icon: Shield, label: 'Admin' }] : [])
  ];

  const landingNavLinks = [];

  const selectorLinks = linksQuery.data || [];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)' }}>
      {/* ── Desktop Navbar ── */}
      <header className={`navbar-root${scrolled ? ' navbar-root--scrolled' : ''}`}>
        <div className="navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <div className="navbar-logo-icon">
              <Sparkles className="h-[18px] w-[18px]" />
            </div>
            <span className="navbar-logo-text">
              SmartLink <span className="navbar-logo-accent">AI</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="navbar-links">
            {landingNavLinks.map((l) => (
              <LandingNavLink key={l.href} href={l.href} label={l.label} />
            ))}
            {userName && mainNavLinks.map((l) => (
              <NavItem key={l.to} {...l} />
            ))}
          </nav>

          {/* Right side controls */}
          <div className="navbar-right">
            {userName ? (
              <div className="navbar-user-wrap">
                <button
                  className="navbar-avatar-btn"
                  onClick={() => setDropdown(v => !v)}
                  aria-expanded={dropdown}
                  aria-label="User menu"
                >
                  <div className="navbar-avatar">{initials}</div>
                  <span className="navbar-username" style={{ display: 'none' }} id="nav-username">{userName}</span>
                  <span className="hidden lg:block" style={{ fontSize: 13, fontWeight: 500, color: 'var(--c-text-2)' }}>
                    {userName}
                  </span>
                  <ChevronDown
                    className="h-3.5 w-3.5"
                    style={{ color: 'var(--c-text-4)', transition: 'transform 0.2s', transform: dropdown ? 'rotate(180deg)' : 'none' }}
                  />
                </button>

                {dropdown && (
                  <>
                    <div className="dropdown-backdrop" onClick={() => setDropdown(false)} />
                    <div className="dropdown-menu">
                      <div className="dropdown-header">
                        <div className="navbar-avatar dropdown-avatar">{initials}</div>
                        <div>
                          <p className="dropdown-name">{userName}</p>
                          <p className="dropdown-email">{userEmail}</p>
                        </div>
                      </div>
                      <div className="dropdown-divider" />
                      <Link to="/dashboard" className="dropdown-item"><LayoutDashboard className="h-4 w-4" /> Dashboard</Link>
                      <Link to="/settings"  className="dropdown-item"><UserCircle className="h-4 w-4" /> Settings</Link>
                      {isAdmin && <Link to="/admin" className="dropdown-item"><Shield className="h-4 w-4" /> Admin Panel</Link>}
                      <div className="dropdown-divider" />
                      <button className="dropdown-item dropdown-item--danger" onClick={handleLogout}>
                        <LogOut className="h-4 w-4" /> Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Link to="/login"    className="nav-pill">Log in</Link>
                <Link to="/register" className="navbar-cta">Get started</Link>
              </div>
            )}

            <button className="navbar-hamburger md:hidden" onClick={() => setDrawer(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Navigation Bar ── */}
      <nav className="mobile-bottom-nav">
        <Link to="/" className={`mobile-nav-item${location.pathname === '/' ? ' mobile-nav-item--active' : ''}`}>
          <Home className="h-5 w-5" />
          <span>Home</span>
        </Link>
        <Link to="/dashboard" className={`mobile-nav-item${location.pathname === '/dashboard' ? ' mobile-nav-item--active' : ''}`}>
          <Link2 className="h-5 w-5" />
          <span>Vault</span>
        </Link>
        
        {/* Floating Action Button */}
        <button
          className="mobile-fab"
          onClick={() => {
            if (!userName) {
              toast.warning('Please sign in to create smart links.');
              navigate('/login');
            } else {
              setShowCreateSheet(true);
            }
          }}
          aria-label="Create link"
        >
          <Plus className="h-6 w-6" />
        </button>

        <Link to="/collections" className={`mobile-nav-item${location.pathname === '/collections' ? ' mobile-nav-item--active' : ''}`}>
          <FolderOpen className="h-5 w-5" />
          <span>Collections</span>
        </Link>
        <Link to="/settings" className={`mobile-nav-item${location.pathname === '/settings' ? ' mobile-nav-item--active' : ''}`}>
          <Settings className="h-5 w-5" />
          <span>Profile</span>
        </Link>
      </nav>

      {/* ── Mobile Slide-out Drawer Menu ── */}
      {drawer && (
        <>
          <div className="drawer-backdrop" onClick={() => setDrawer(false)} />
          <aside className="drawer-panel">
            <div className="drawer-header">
              <div className="navbar-logo">
                <div className="navbar-logo-icon" style={{ width: 32, height: 32 }}>
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="navbar-logo-text" style={{ fontSize: 16 }}>
                  SmartLink <span className="navbar-logo-accent">AI</span>
                </span>
              </div>
              <button className="drawer-close" onClick={() => setDrawer(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            {userName && (
              <div className="drawer-user">
                <div className="navbar-avatar" style={{ width: 42, height: 42, fontSize: 17 }}>{initials}</div>
                <div>
                  <p className="dropdown-name">{userName}</p>
                  <p className="dropdown-email">{userEmail}</p>
                </div>
                {isAdmin && <span className="admin-badge">Admin</span>}
              </div>
            )}

            <nav className="drawer-nav">
              <p className="drawer-section-label">Overview</p>
              {landingNavLinks.map(l => (
                <LandingNavLink key={l.href} href={l.href} label={l.label} onClick={() => setDrawer(false)} />
              ))}

              {userName ? (
                <>
                  <p className="drawer-section-label">SmartLink App</p>
                  {mainNavLinks.map(l => <NavItem key={l.to} {...l} onClick={() => setDrawer(false)} />)}
                  <p className="drawer-section-label">Account</p>
                  <NavItem to="/settings" icon={UserCircle} label="Settings" onClick={() => setDrawer(false)} />
                </>
              ) : (
                <>
                  <p className="drawer-section-label">Account</p>
                  <Link to="/login" className="nav-pill" onClick={() => setDrawer(false)}>
                    Log in
                  </Link>
                  <Link to="/register" className="navbar-cta mt-2 text-center justify-center" onClick={() => setDrawer(false)}>
                    Get started
                  </Link>
                </>
              )}
            </nav>

            {userName && (
              <div className="drawer-footer">
                <button className="drawer-logout-btn" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            )}
          </aside>
        </>
      )}

      {/* ── PWA Global Bottom Sheets ── */}
      
      {/* 1. Create Link Bottom Sheet */}
      {showCreateSheet && (
        <>
          <div className="bottom-sheet-backdrop" onClick={() => setShowCreateSheet(false)} />
          <div className="bottom-sheet-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles className="h-5 w-5" style={{ color: 'var(--c-primary)' }} />
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>Create Smart Link</h3>
              </div>
              <button
                onClick={() => setShowCreateSheet(false)}
                style={{ background: 'none', border: 'none', color: 'var(--c-text-3)' }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="auth-label">Destination URL</label>
                <input
                  type="url"
                  className="create-input"
                  placeholder="https://example.com"
                  value={createUrl}
                  onChange={e => setCreateUrl(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="auth-label">Custom Alias (Optional)</label>
                <input
                  type="text"
                  className="create-input"
                  placeholder="my-custom-slug"
                  value={createAlias}
                  onChange={e => setCreateAlias(e.target.value)}
                />
              </div>
              <div>
                <label className="auth-label">Tags (Comma-separated)</label>
                <input
                  type="text"
                  className="create-input"
                  placeholder="mongodb, deployment, react"
                  value={createTags}
                  onChange={e => setCreateTags(e.target.value)}
                />
              </div>
              <div>
                <label className="auth-label">Notes (Why you saved it)</label>
                <textarea
                  className="create-input"
                  style={{ minHeight: 60, padding: 10, resize: 'vertical' }}
                  placeholder="Need this for MongoDB setup..."
                  value={createNotes}
                  onChange={e => setCreateNotes(e.target.value)}
                />
              </div>
              <button type="submit" className="create-btn" disabled={createMutation.isPending} style={{ marginTop: 8 }}>
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing URL...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Shorten & Analyze
                  </>
                )}
              </button>
            </form>
          </div>
        </>
      )}

      {/* 2. Choose Link for Analytics Bottom Sheet */}
      {showAnalyticsSheet && (
        <>
          <div className="bottom-sheet-backdrop" onClick={() => setShowAnalyticsSheet(false)} />
          <div className="bottom-sheet-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>Select Link for Analytics</h3>
              <button
                onClick={() => setShowAnalyticsSheet(false)}
                style={{ background: 'none', border: 'none', color: 'var(--c-text-3)' }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {linksQuery.isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
                <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--c-primary)' }} />
              </div>
            ) : selectorLinks.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--c-text-3)', padding: 24, fontSize: 14 }}>
                You haven't created any links yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '260px', overflowY: 'auto', paddingRight: 4 }}>
                {selectorLinks.map(l => (
                  <button
                    key={l._id}
                    onClick={() => {
                      setShowAnalyticsSheet(false);
                      navigate(`/analytics/${l._id}`);
                    }}
                    style={{
                      display: 'flex', flexDirection: 'column', gap: 4,
                      padding: 12, borderRadius: 12, border: '1px solid var(--c-border)',
                      background: 'var(--c-bg)', cursor: 'pointer', textAlign: 'left',
                      width: '100%', transition: 'border-color 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--c-primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--c-border)'}
                  >
                    <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--c-text)' }}>{l.title || 'SmartLink'}</span>
                    <span style={{ fontSize: 11, color: 'var(--c-text-3)', wordBreak: 'break-all' }}>{l.originalUrl}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Main page content area */}
      <main style={{
        maxWidth: location.pathname === '/' ? '100%' : 1440,
        margin: '0 auto',
        padding: location.pathname === '/' ? '0 0 72px 0' : '24px 16px'
      }}>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
