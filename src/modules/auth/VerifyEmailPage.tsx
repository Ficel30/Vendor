import React from 'react';
import { apiPost } from '../../api/client';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function VerifyEmailPage(): React.ReactElement {
  const [email, setEmail] = React.useState('');
  const [code, setCode] = React.useState('');
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [search] = useSearchParams();
  const navigate = useNavigate();

  React.useEffect(() => {
    const e = search.get('email');
    if (e) setEmail(e);
  }, [search]);

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await apiPost('/auth/verify', { email, code }, { headers: {} });
      setMessage('Email verified. You can now sign in.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err: any) {
      setError(err?.message ?? 'Verification failed');
    }
  }

  async function onResend() {
    setError(null); setMessage(null);
    try { await apiPost('/auth/request-verification', { email }, { headers: {} }); setMessage('Code sent.'); } catch (e: any) { setError(e?.message ?? 'Failed to send'); }
  }

  return (
		<div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
			<div className="card" style={{ width: '100%', maxWidth: 420 }}>
				<div className="grid" style={{ gridTemplateColumns: '1fr', gap: 16 }}>
					<div style={{ textAlign: 'center' }}>
						<div className="brand" style={{ marginBottom: 4 }}>ODG Delivery</div>
						<div style={{ color: 'var(--muted)' }}>Verify your email</div>
					</div>
					{message && <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>{message}</div>}
					{error && <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>{error}</div>}
					<form onSubmit={onVerify} className="grid" style={{ gridTemplateColumns: '1fr', gap: 12 }}>
						<input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
						<input className="input" placeholder="Code" value={code} onChange={(e) => setCode(e.target.value)} />
						<button className="btn">Verify</button>
					</form>
					<button className="btn" style={{ marginTop: 8 }} onClick={onResend}>Resend code</button>
				</div>
			</div>
		</div>
  );
}


