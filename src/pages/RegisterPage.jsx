import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

function RegisterPage() {
  const navigate = useNavigate();
  const { registerMutation } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    registerMutation.mutate(form, { onSuccess: () => navigate('/dashboard') });
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="auth-logo-text">SmartLink <span style={{ color: 'var(--c-primary)' }}>AI</span></span>
        </div>

        <h1 className="auth-heading">Create your account</h1>
        <p className="auth-subheading">Start managing smarter links in seconds</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <label className="auth-label" htmlFor="reg-name">Full name</label>
            <input
              id="reg-name"
              className="auth-input"
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={e => setForm(c => ({ ...c, name: e.target.value }))}
              autoComplete="name"
              required
            />
          </div>

          <div>
            <label className="auth-label" htmlFor="reg-email">Email address</label>
            <input
              id="reg-email"
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(c => ({ ...c, email: e.target.value }))}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="auth-label" htmlFor="reg-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-password"
                className="auth-input"
                type={showPw ? 'text' : 'password'}
                placeholder="At least 8 characters"
                value={form.password}
                onChange={e => setForm(c => ({ ...c, password: e.target.value }))}
                autoComplete="new-password"
                minLength={8}
                style={{ paddingRight: 42 }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--c-text-4)', display: 'grid', placeItems: 'center'
                }}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {registerMutation.isError && (
            <p className="auth-error">
              {registerMutation.error?.response?.data?.message || 'Unable to create account. Please try again.'}
            </p>
          )}

          <button type="submit" className="auth-btn" disabled={registerMutation.isPending}>
            {registerMutation.isPending
              ? <><Loader2 className="h-4 w-4 animate-spin" style={{ display: 'inline', marginRight: 6 }} />Creating account…</>
              : 'Create account'
            }
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
