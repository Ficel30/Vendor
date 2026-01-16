import React from 'react';
import { apiGet, apiPost } from '../../api/client';
import { Card, Button, Spinner, EmptyState, StatusBadge } from '../ui';

export function RiderVerificationPage(): React.ReactElement {
  const [docs, setDocs] = React.useState<Array<{ id: number; user_id: number; document_type: string; document_url: string; status: string; name: string }>>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGet<typeof docs>('/admin/riders/pending');
      setDocs(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  async function act(docId: number, action: 'approve' | 'reject') {
    await apiPost(`/admin/riders/${action}`, { docId });
    await load();
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ marginBottom: 4 }}>Rider Verification</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Review and approve rider documents and applications</p>
      </div>
      
      {loading && <Spinner />}
      {error && <Card><div style={{ color: 'var(--danger)', padding: '12px' }}>{error}</div></Card>}
      
      {!loading && !error && docs.length === 0 && (
        <EmptyState 
          icon="✅" 
          title="No pending verifications"
          description="All rider documents have been reviewed"
        />
      )}
      
      {!loading && !error && docs.length > 0 && (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 24 }}>
          {docs.map(d => (
            <Card key={d.id}>
              <div style={{ display: 'flex', alignItems: 'start', gap: '12px', marginBottom: '12px' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '18px'
                }}>
                  {d.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>{d.name}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '12px' }}>ID: #{d.user_id}</div>
                </div>
              </div>
              
              <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                <StatusBadge status={d.status} />
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>Document Type</div>
                <div style={{ fontWeight: 600 }}>{d.document_type}</div>
              </div>
              
              <Button 
                variant="primary" 
                fullWidth 
                style={{ marginBottom: '8px' }}
                onClick={() => {
                  window.open(d.document_url, '_blank');
                }}
              >
                📄 View Document
              </Button>
              
              <div className="row" style={{ gap: '8px' }}>
                <Button variant="success" icon="✓" onClick={() => act(d.id, 'approve')} style={{ flex: 1 }}>
                  Approve
                </Button>
                <Button variant="danger" icon="✗" onClick={() => act(d.id, 'reject')} style={{ flex: 1 }}>
                  Reject
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
