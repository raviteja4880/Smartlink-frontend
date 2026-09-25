import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Users, Link2, MousePointerClick, Activity, CheckCircle2, XCircle, Trash2, Shield } from 'lucide-react';
import { adminApi } from '../services/api';
import { useToast } from '../context/ToastContext';

function StatusBadge({ status }) {
  const ok = status === 'connected' || status === 'healthy';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 12px', borderRadius: 'var(--r-full)',
      fontSize: 12, fontWeight: 600,
      background: ok ? '#DCFCE7' : '#FEE2E2',
      color: ok ? '#15803D' : '#B91C1C',
      border: `1px solid ${ok ? '#BBF7D0' : '#FECACA'}`
    }}>
      {ok
        ? <CheckCircle2 style={{ width: 13, height: 13 }} />
        : <XCircle style={{ width: 13, height: 13 }} />}
      {status}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, color, bg, delay = 0 }) {
  return (
    <motion.div className="stat-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <div className="stat-card-icon" style={{ background: bg }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <div>
        <p className="stat-card-label">{label}</p>
        <p className="stat-card-value">{value ?? '—'}</p>
      </div>
    </motion.div>
  );
}

function AdminPage() {
  const navigate    = useNavigate();
  const toast       = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('smartlink_user') || '{}');
    if (user.role !== 'admin') navigate('/dashboard');
  }, [navigate]);

  const statsQuery = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => { const r = await adminApi.getStats(); return r?.data?.data; },
    refetchInterval: 30_000
  });
  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => { const r = await adminApi.getUsers(); return r?.data?.data || []; }
  });
  const linksQuery = useQuery({
    queryKey: ['admin-links'],
    queryFn: async () => { const r = await adminApi.getLinks(); return r?.data?.data || []; }
  });

  const deleteLinkMutation = useMutation({
    mutationFn: adminApi.deleteLink,
    onSuccess: () => {
      toast.success('Link deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-links'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: err => toast.error(err?.response?.data?.message || 'Delete failed')
  });

  const s = statsQuery.data;

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">System Control</p>
          <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Shield className="h-7 w-7" style={{ color: 'var(--c-warning)' }} /> Admin Panel
          </h1>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard label="Total Users"   value={s?.users}       icon={Users}            color="#3B82F6" bg="#DBEAFE" delay={0}    />
        <StatCard label="Total Links"   value={s?.links}       icon={Link2}            color="#0EA5E9" bg="#E0F2FE" delay={0.05} />
        <StatCard label="Total Clicks"  value={s?.totalClicks} icon={MousePointerClick} color="#8B5CF6" bg="#EDE9FE" delay={0.1}  />
        <StatCard label="Today's Clicks" value={s?.todayClicks} icon={Activity}         color="#22C55E" bg="#DCFCE7" delay={0.15} />
      </div>

      {/* Service status */}
      {s && (
        <div className="create-panel">
          <div className="create-panel-header">
            <div style={{ display: 'grid', placeItems: 'center', width: 30, height: 30, borderRadius: 8, background: 'var(--c-primary-light)' }}>
              <Activity className="h-4 w-4" style={{ color: 'var(--c-primary)' }} />
            </div>
            <h3>Service Status</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            {[
              { label: 'MongoDB', status: s.database },
              { label: 'Redis',   status: s.redis    },
              { label: 'AI Service', status: s.ai    },
              { label: 'Backend API', status: 'healthy' }
            ].map(({ label, status }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, color: 'var(--c-text-3)', minWidth: 80 }}>{label}</span>
                <StatusBadge status={status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users table */}
      <div className="chart-card">
        <p className="chart-title">All Users ({usersQuery.data?.length ?? 0})</p>
        {usersQuery.isLoading
          ? <div className="skeleton" style={{ height: 120, borderRadius: 8 }} />
          : (
            <div style={{ overflowX: 'auto' }}>
              <table className="analytics-table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr>
                </thead>
                <tbody>
                   {(usersQuery.data || []).map(u => (
                    <tr key={u._id}>
                      <td data-label="Name" style={{ fontWeight: 600, color: 'var(--c-text)' }}>{u.name}</td>
                      <td data-label="Email">{u.email}</td>
                      <td data-label="Role">
                        <span style={{
                          padding: '2px 10px', borderRadius: 'var(--r-full)', fontSize: 11, fontWeight: 600,
                          ...(u.role === 'admin'
                            ? { background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }
                            : { background: 'var(--c-surface-2)', color: 'var(--c-text-3)', border: '1px solid var(--c-border)' })
                        }}>{u.role}</span>
                      </td>
                      <td data-label="Joined">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      {/* Links table */}
      <div className="chart-card">
        <p className="chart-title">All Links ({linksQuery.data?.length ?? 0})</p>
        {linksQuery.isLoading
          ? <div className="skeleton" style={{ height: 180, borderRadius: 8 }} />
          : (
            <div style={{ overflowX: 'auto' }}>
              <table className="analytics-table">
                <thead>
                  <tr><th>Title</th><th>Short Code</th><th>Category</th><th>Clicks</th><th>User</th><th>Action</th></tr>
                </thead>
                <tbody>
                   {(linksQuery.data || []).map(l => (
                    <tr key={l._id}>
                      <td data-label="Title" style={{ fontWeight: 600, color: 'var(--c-text)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {l.title || '—'}
                      </td>
                      <td data-label="Short Code"><span className="short-code-badge">{l.shortCode}</span></td>
                      <td data-label="Category">
                        {(() => {
                          const cat = l.primaryCategory || l.category;
                          const isGeneric = !cat || ['general', 'technology', 'website', 'miscellaneous', 'other'].includes(String(cat).toLowerCase().trim());
                          if (isGeneric) return <span style={{ color: 'var(--c-text-4)' }}>—</span>;
                          return (
                            <span className="category-badge" style={{ background: 'var(--c-primary-light)', color: 'var(--c-primary-text)', border: '1px solid #BFDBFE' }}>
                              {cat}
                            </span>
                          );
                        })()}
                      </td>
                      <td data-label="Clicks" style={{ fontWeight: 600, color: 'var(--c-text)' }}>{l.clicks}</td>
                      <td data-label="User" style={{ fontSize: 12, color: 'var(--c-text-3)' }}>{l.userId?.email || '—'}</td>
                      <td data-label="Action">
                        <button
                          className="action-btn action-btn-danger"
                          style={{ padding: '5px 10px' }}
                          disabled={deleteLinkMutation.isPending}
                          onClick={() => {
                            toast.confirm(
                              `Delete "${l.title || l.shortCode}"?`,
                              () => deleteLinkMutation.mutate(l._id),
                              { confirmLabel: 'Delete', danger: true }
                            );
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  );
}

export default AdminPage;
