import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  Tooltip, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend
} from 'recharts';
import {
  ArrowLeft, MousePointerClick, Calendar, TrendingUp,
  Globe, Monitor, Activity, Clock, ExternalLink
} from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';

/* ── Chart palette ── */
const CHART_COLORS = ['#3B82F6', '#0EA5E9', '#8B5CF6', '#22C55E', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6'];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--c-surface)', border: '1px solid var(--c-border)',
      borderRadius: 10, padding: '8px 12px', boxShadow: 'var(--shadow-md)', fontSize: 13
    }}>
      {label && <p style={{ color: 'var(--c-text-3)', marginBottom: 4 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg, delay = 0 }) {
  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
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

function ChartCard({ title, children }) {
  return (
    <div className="chart-card">
      <p className="chart-title">{title}</p>
      {children}
    </div>
  );
}

function SkeletonAnalytics() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="stats-grid">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="stat-card skeleton" style={{ height: 80 }} />
        ))}
      </div>
      <div className="chart-card skeleton" style={{ height: 280 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="chart-card skeleton" style={{ height: 240 }} />
        <div className="chart-card skeleton" style={{ height: 240 }} />
      </div>
    </div>
  );
}

function formatDate(d)  { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
function formatTime(d)  { return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }

function AnalyticsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { statsQuery, eventsQuery } = useAnalytics(id);

  const data   = statsQuery.data;
  const events = eventsQuery.data || [];

  if (statsQuery.isLoading) return (
    <div className="dashboard-wrapper">
      <button className="action-btn action-btn-ghost" onClick={() => navigate('/dashboard')} style={{ width: 'fit-content' }}>
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <SkeletonAnalytics />
    </div>
  );

  if (statsQuery.isError || !data) return (
    <div className="dashboard-wrapper">
      <button className="action-btn action-btn-ghost" onClick={() => navigate('/dashboard')} style={{ width: 'fit-content' }}>
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <div className="empty-state" style={{ marginTop: 40 }}>
        <p style={{ color: 'var(--c-error)', fontWeight: 600 }}>Failed to load analytics.</p>
        <p style={{ color: 'var(--c-text-3)', fontSize: 14, marginTop: 6 }}>Make sure this link belongs to you.</p>
      </div>
    </div>
  );

  const { link, stats, clicksPerDay = [], browsers = [], devices = [], referrers = [], countries = [] } = data;
  const chartClicksData = clicksPerDay.map(d => ({ ...d, date: formatDate(d.date) }));

  return (
    <div className="dashboard-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <button className="action-btn action-btn-ghost" onClick={() => navigate('/dashboard')} style={{ flexShrink: 0 }}>
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </button>
        <div style={{ flex: 1 }}>
          <p className="dashboard-eyebrow">Link Analytics</p>
          <h1 className="dashboard-title" style={{ fontSize: '1.6rem' }}>
            {link?.title || link?.shortCode || 'Analytics'}
          </h1>
          {link?.originalUrl && (
            <a href={link.originalUrl} target="_blank" rel="noopener noreferrer"
              className="link-card-url" style={{ marginTop: 4, display: 'inline-flex' }}>
              <ExternalLink className="h-3 w-3" style={{ flexShrink: 0 }} /> {link.originalUrl}
            </a>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
        <StatCard label="Total Clicks"  value={stats?.total}     icon={MousePointerClick} color="#3B82F6" bg="#DBEAFE" delay={0}    />
        <StatCard label="Today"         value={stats?.today}     icon={Calendar}          color="#0EA5E9" bg="#E0F2FE" delay={0.05} />
        <StatCard label="This Week"     value={stats?.thisWeek}  icon={TrendingUp}        color="#8B5CF6" bg="#EDE9FE" delay={0.1}  />
        <StatCard label="This Month"    value={stats?.thisMonth} icon={Activity}          color="#22C55E" bg="#DCFCE7" delay={0.15} />
        <StatCard label="Avg / Day"     value={stats?.avgDaily}  icon={Clock}             color="#F59E0B" bg="#FEF3C7" delay={0.2}  />
      </div>

      {/* 30-day area chart */}
      <ChartCard title="Clicks per Day — Last 30 Days">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartClicksData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="clickGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 11 }} tickLine={false} axisLine={false} interval={4} />
            <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="clicks" stroke="#3B82F6" strokeWidth={2} fill="url(#clickGrad)" name="Clicks" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Distribution charts */}
      <div className="analytics-charts-grid">
        <ChartCard title="Browsers">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={browsers} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={75} paddingAngle={3}>
                {browsers.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={v => <span style={{ color: 'var(--c-text-3)', fontSize: 12 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Devices">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={devices} dataKey="count" nameKey="label" cx="50%" cy="50%" innerRadius={40} outerRadius={75} paddingAngle={3}>
                {devices.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={v => <span style={{ color: 'var(--c-text-3)', fontSize: 12 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Referrers">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={referrers} layout="vertical" margin={{ left: 0, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="label" width={70} tick={{ fill: '#94A3B8', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Clicks" radius={[0, 4, 4, 0]} fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Countries">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={countries} layout="vertical" margin={{ left: 0, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="label" width={70} tick={{ fill: '#94A3B8', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Clicks" radius={[0, 4, 4, 0]} fill="#0EA5E9" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Recent activity table */}
      <div className="chart-card">
        <p className="chart-title">Recent Activity</p>
        {events.length === 0 ? (
          <p style={{ color: 'var(--c-text-4)', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>
            No click events recorded yet.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Time</th><th>Browser</th><th>Device</th><th>OS</th><th>Country</th><th>Referrer</th>
                </tr>
              </thead>
              <tbody>
                {events.map(e => (
                  <tr key={e._id}>
                    <td data-label="Time">{formatTime(e.timestamp)}</td>
                    <td data-label="Browser">{e.browser || '—'}</td>
                    <td data-label="Device" style={{ textTransform: 'capitalize' }}>{e.device || 'desktop'}</td>
                    <td data-label="OS">{e.os || '—'}</td>
                    <td data-label="Country">{e.country || '—'}</td>
                    <td data-label="Referrer" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {e.referrer || 'direct'}
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

export default AnalyticsPage;
