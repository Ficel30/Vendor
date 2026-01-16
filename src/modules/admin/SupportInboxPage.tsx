import React from 'react';
import { apiGet } from '../../api/client';
import { Card, Input, Spinner, EmptyState } from '../ui';

type SupportItem = { id: number; user_id: number; name: string; email: string; phone: string; message: string; created_at: string };

export function SupportInboxPage(): React.ReactElement {
  const [items, setItems] = React.useState<SupportItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [q, setQ] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true); setError(null);
    try { 
      const data = await apiGet<SupportItem[]>('/admin/support/messages'); 
      setItems(data);
    } catch (e: any) { 
      setError(e?.message ?? 'Failed to load');
    } finally { 
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const filtered = items.filter(i => `${i.name} ${i.email ?? ''} ${i.phone ?? ''} ${i.message}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ marginBottom: 4 }}>Support Inbox</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>View and respond to customer support messages</p>
      </div>
      
      {loading && <Spinner />}
      {error && <Card><div style={{ color: 'var(--danger)', padding: '12px' }}>{error}</div></Card>}
      
      {!loading && !error && (
        <>
          <div className="row" style={{ marginBottom: 20 }}>
            <Input icon="🔍" placeholder="Search messages..." value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: '400px' }} />
            <div style={{ color: 'var(--muted)', fontSize: '14px' }}>
              {filtered.length} {filtered.length === 1 ? 'message' : 'messages'} found
            </div>
          </div>
          
          {filtered.length === 0 ? (
            <EmptyState 
              icon="💬" 
              title={q ? "No messages match your search" : "No support messages"}
              description={q ? "Try adjusting your search terms" : "All customer support is handled"}
            />
          ) : (
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
              {filtered.map(m => (
                <Card key={m.id}>
                  <div style={{ display: 'flex', alignItems: 'start', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '18px'
                    }}>
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>{m.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>ID: #{m.user_id}</div>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>Contact</div>
                    <div style={{ fontSize: '14px' }}>📧 {m.email ?? '—'} • 📱 {m.phone ?? '—'}</div>
                  </div>
                  
                  <div style={{ marginBottom: '12px', padding: '12px', background: 'var(--elev)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '14px', lineHeight: '1.6' }}>{m.message}</div>
                  </div>
                  
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    📅 {new Date(m.created_at).toLocaleString()}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
