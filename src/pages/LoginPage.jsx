import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

function LoginPage() {
  const navigate = useNavigate();
  const { loginMutation } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate(form, { onSuccess: () => navigate('/dashboard') });
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

        <h1 className="auth-heading">Welcome back</h1>
        <p className="auth-subheading">Sign in to your account to continue</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <label className="auth-label" htmlFor="login-email">Email address</label>
            <input
              id="login-email"
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
            <label className="auth-label" htmlFor="login-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                className="auth-input"
                type={showPw ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm(c => ({ ...c, password: e.target.value }))}
                autoComplete="current-password"
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

          {loginMutation.isError && (
            <p className="auth-error">
              {loginMutation.error?.response?.data?.message || 'Invalid email or password.'}
            </p>
          )}

          <button type="submit" className="auth-btn" disabled={loginMutation.isPending}>
            {loginMutation.isPending
              ? <><Loader2 className="h-4 w-4 animate-spin" style={{ display: 'inline', marginRight: 6 }} />Signing in…</>
              : 'Sign in'
            }
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register">Create one free</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
