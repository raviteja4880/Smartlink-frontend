import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Save, Loader2, LogOut } from 'lucide-react';
import { userApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

function SectionCard({ title, icon: Icon, children, delay = 0, span = false }) {
  return (
    <motion.div
      className="create-panel"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={span ? { gridColumn: '1 / -1' } : {}}
    >
      <div className="create-panel-header">
        <div style={{ display: 'grid', placeItems: 'center', width: 30, height: 30, borderRadius: 8, background: 'var(--c-primary-light)' }}>
          <Icon className="h-4 w-4" style={{ color: 'var(--c-primary)' }} />
        </div>
        <h3>{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

function ProfilePage() {
  const navigate    = useNavigate();
  const toast       = useToast();
  const queryClient = useQueryClient();

  const storedUser = JSON.parse(localStorage.getItem('smartlink_user') || '{}');
  const [nameForm, setNameForm] = useState({ name: storedUser.name || '' });
  const [emailForm, setEmailForm] = useState({ email: storedUser.email || '' });
  const [pwForm, setPwForm]     = useState({ currentPassword: '', newPassword: '', confirm: '' });

  const { data: meData } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await userApi.getMe();
      return res?.data?.data;
    },
    onSuccess: (data) => {
      setNameForm({ name: data.name || '' });
      setEmailForm({ email: data.email || '' });
    },
    staleTime: 60_000
  });
  const user = meData || storedUser;
  const initials = (user?.name || '?').charAt(0).toUpperCase();

  const updateMutation = useMutation({
    mutationFn: userApi.updateMe,
    onSuccess: (res) => {
      const updated = res?.data?.data;
      if (updated) {
        const stored = JSON.parse(localStorage.getItem('smartlink_user') || '{}');
        localStorage.setItem('smartlink_user', JSON.stringify({ ...stored, ...updated }));
      }
      toast.success('Profile updated');
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to update profile')
  });

  const handleLogout = () => {
    localStorage.removeItem('smartlink_token');
    localStorage.removeItem('smartlink_user');
    navigate('/login');
  };

  return (
    <div className="dashboard-wrapper">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">Account</p>
          <h1 className="dashboard-title">Settings</h1>
        </div>
        <button className="action-btn action-btn-danger" onClick={handleLogout}>
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      {/* Profile summary card */}
      <motion.div
        className="create-panel"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', gap: 20 }}
      >
        <div style={{
          width: 60, height: 60, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--c-primary) 0%, var(--c-secondary) 100%)',
          display: 'grid', placeItems: 'center',
          fontSize: 24, fontWeight: 700, color: '#fff'
        }}>
          {initials}
        </div>
        <div>
          <p style={{ fontWeight: 700, color: 'var(--c-text)', fontSize: 17 }}>{user?.name}</p>
          <p style={{ fontSize: 14, color: 'var(--c-text-3)' }}>{user?.email}</p>
          {user?.role === 'admin' && (
            <span style={{
              display: 'inline-flex', marginTop: 6, padding: '2px 10px',
              borderRadius: 'var(--r-full)', fontSize: 11, fontWeight: 600,
              background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A'
            }}>Admin</span>
          )}
        </div>
      </motion.div>

      <div className="settings-grid">
        {/* Name */}
        <SectionCard title="Display Name" icon={User} delay={0.05}>
          <form style={{ display: 'flex', gap: 10 }}
            onSubmit={e => { e.preventDefault(); updateMutation.mutate({ name: nameForm.name }); }}>
            <input className="create-input" style={{ flex: 1 }} placeholder="Your name"
              value={nameForm.name} onChange={e => setNameForm({ name: e.target.value })} required />
            <button className="create-btn" type="submit" disabled={updateMutation.isPending} style={{ flexShrink: 0, padding: '11px 18px' }}>
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            </button>
          </form>
        </SectionCard>

        {/* Email */}
        <SectionCard title="Email Address" icon={Mail} delay={0.1}>
          <form style={{ display: 'flex', gap: 10 }}
            onSubmit={e => { e.preventDefault(); updateMutation.mutate({ email: emailForm.email }); }}>
            <input className="create-input" style={{ flex: 1 }} type="email" placeholder="you@example.com"
              value={emailForm.email} onChange={e => setEmailForm({ email: e.target.value })} required />
            <button className="create-btn" type="submit" disabled={updateMutation.isPending} style={{ flexShrink: 0, padding: '11px 18px' }}>
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            </button>
          </form>
        </SectionCard>

        {/* Password */}
        <SectionCard title="Change Password" icon={Lock} delay={0.15} span>
          <form
            onSubmit={e => {
              e.preventDefault();
              if (pwForm.newPassword !== pwForm.confirm) { toast.error('New passwords do not match'); return; }
              updateMutation.mutate({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
              setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
            }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)) auto', gap: 10, alignItems: 'center' }}
          >
            <input className="create-input" type="password" placeholder="Current password"
              value={pwForm.currentPassword} onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} required />
            <input className="create-input" type="password" placeholder="New password (8+ chars)"
              value={pwForm.newPassword} minLength={8} onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} required />
            <input className="create-input" type="password" placeholder="Confirm new password"
              value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} required />
            <button className="create-btn" type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Save</>}
            </button>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}

export default ProfilePage;
