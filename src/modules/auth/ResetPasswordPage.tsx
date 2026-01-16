import React from 'react';
import { apiPost } from '../../api/client';
import { useNavigate } from 'react-router-dom';

export function ResetPasswordPage(): React.ReactElement {
  const [email, setEmail] = React.useState('');
  const [code, setCode] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setMessage(null);
    try {
      await apiPost('/auth/reset-password', { email, code, newPassword: password }, { headers: {} });
      setMessage('Password updated. Redirecting to login…');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err: any) {
      setError(err?.message ?? 'Reset failed');
    }
  }

  return (
		<div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
			<div className="card" style={{ width: '100%', maxWidth: 420 }}>
				<div className="grid" style={{ gridTemplateColumns: '1fr', gap: 16 }}>
					<div style={{ textAlign: 'center' }}>
						<div className="brand" style={{ marginBottom: 4 }}>ODG Delivery</div>
						<div style={{ color: 'var(--muted)' }}>Reset password</div>
					</div>
					{message && <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>{message}</div>}
					{error && <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>{error}</div>}
					<form onSubmit={onSubmit} className="grid" style={{ gridTemplateColumns: '1fr', gap: 12 }}>
						<input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
						<input className="input" placeholder="Code" value={code} onChange={(e) => setCode(e.target.value)} />
						<input className="input" type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
						<button className="btn">Update password</button>
					</form>
				</div>
			</div>
		</div>
  );
}


