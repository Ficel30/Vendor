import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useToast } from '../ui';
import { Link, useNavigate } from 'react-router-dom';

export function SignupPage(): React.ReactElement {
  const { signup } = useAuth();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [agree, setAgree] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const { push } = useToast();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      await signup(name, email, phone, password, agree);
      push('Account created. Check your email for a code.', 'success');
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (e: any) {
      const message = e?.message ?? 'Signup failed';
      setError(message);
      push('Signup failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: 520 }}>
        <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <div className="brand" style={{ marginBottom: 4 }}>ODG Delivery</div>
            <div style={{ color: 'var(--muted)' }}>Create your vendor or admin account</div>
          </div>
          {error && <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>{error}</div>}
          <form onSubmit={onSubmit} className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <input className="input" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="input" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ gridColumn: '1 / span 2' }} />
            <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ gridColumn: '1 / span 2' }} />
            <label style={{ gridColumn: '1 / span 2', display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span>I agree to the Terms and Privacy Policy</span>
            </label>
            <button className="btn" disabled={loading || !agree} style={{ gridColumn: '1 / span 2' }}>
              {loading ? 'Creating…' : 'Create account'}
            </button>
          </form>
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <span>Have an account? <Link to="/login">Sign in</Link></span>
          </div>
        </div>
      </div>
    </div>
  );
}


