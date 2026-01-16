import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useToast } from '../ui';
import { Link, useNavigate } from 'react-router-dom';

export function LoginPage(): React.ReactElement {
  const { login } = useAuth();
  const [emailOrPhone, setEmailOrPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const { push } = useToast();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      await login(emailOrPhone, password);
      push('Signed in', 'success');
      navigate('/vendor');
    } catch (e: any) {
      const message = e?.message ?? 'Login failed';
      setError(message);
      push('Login failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: 420 }}>
        <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <div className="brand" style={{ marginBottom: 4 }}>ODG Delivery</div>
            <div style={{ color: 'var(--muted)' }}>Welcome back</div>
          </div>
          {error && <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>{error}</div>}
          <form onSubmit={onSubmit} className="grid" style={{ gridTemplateColumns: '1fr', gap: 12 }}>
            <input className="input" placeholder="Email or phone" value={emailOrPhone} onChange={(e) => setEmailOrPhone(e.target.value)} />
            <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button className="btn" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <Link to="/forgot-password">Forgot password?</Link>
            <span>New here? <Link to="/signup">Create account</Link></span>
          </div>
        </div>
      </div>
    </div>
  );
}


