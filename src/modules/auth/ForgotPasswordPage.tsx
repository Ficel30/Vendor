import React from 'react';
import { apiPost } from '../../api/client';

export function ForgotPasswordPage(): React.ReactElement {
  const [email, setEmail] = React.useState('');
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setMessage(null);
    try { await apiPost('/auth/forgot-password', { email }, { headers: {} }); setMessage('If the email exists, a code has been sent.'); } catch (err: any) { setError(err?.message ?? 'Request failed'); }
  }

  return (
		<div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
			<div className="card" style={{ width: '100%', maxWidth: 420 }}>
				<div className="grid" style={{ gridTemplateColumns: '1fr', gap: 16 }}>
					<div style={{ textAlign: 'center' }}>
						<div className="brand" style={{ marginBottom: 4 }}>ODG Delivery</div>
						<div style={{ color: 'var(--muted)' }}>Forgot password</div>
					</div>
					{message && <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>{message}</div>}
					{error && <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>{error}</div>}
					<form onSubmit={onSubmit} className="grid" style={{ gridTemplateColumns: '1fr', gap: 12 }}>
						<input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
						<button className="btn">Send code</button>
					</form>
				</div>
			</div>
		</div>
  );
}


