import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

export function SelectRolePage(): React.ReactElement {
  const { selectRole } = useAuth();
  const navigate = useNavigate();
  async function choose(role: 'student' | 'rider') {
    await selectRole(role);
    navigate('/vendor');
  }
  return (
		<div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
			<div className="card" style={{ width: '100%', maxWidth: 420 }}>
				<div className="grid" style={{ gridTemplateColumns: '1fr', gap: 16 }}>
					<div style={{ textAlign: 'center' }}>
						<div className="brand" style={{ marginBottom: 4 }}>ODG Delivery</div>
						<div style={{ color: 'var(--muted)' }}>Select your role</div>
					</div>
					<div className="row" style={{ justifyContent: 'center' }}>
						<button className="btn" onClick={() => choose('student')}>Student</button>
						<button className="btn" onClick={() => choose('rider')}>Rider</button>
					</div>
				</div>
			</div>
		</div>
  );
}


