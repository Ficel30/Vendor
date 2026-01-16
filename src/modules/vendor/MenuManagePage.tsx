import React from 'react';
import { apiDelete, apiGet } from '../../api/client';
import { Card, Input, Button, Spinner, useToast, EmptyState, StatusBadge } from '../ui';

export function MenuManagePage(): React.ReactElement {
  const [vendorId, setVendorId] = React.useState<number | null>(null);
  const [vendors, setVendors] = React.useState<Array<{ id: number; name?: string }>>([]);
  const [items, setItems] = React.useState<Array<{ id: number; name: string; description: string; price_cents: number; is_available: number; image_url?: string | null }>>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [q, setQ] = React.useState('');
  const { push } = useToast();

  React.useEffect(() => {
    const fromEnv = (import.meta as any).env.VITE_VENDOR_ID;
    const stored = localStorage.getItem('vendorId');
    if (fromEnv) { setVendorId(Number(fromEnv)); }
    else if (stored) { setVendorId(Number(stored)); }
    (async () => {
      try {
        const list = await apiGet<Array<{ id: number; name?: string }>>('/vendors');
        setVendors(list);
        if (!fromEnv && !stored) {
          const first = list?.[0]?.id;
          if (first) { localStorage.setItem('vendorId', String(first)); setVendorId(first); }
        }
      } catch {}
    })();
  }, []);

  const load = React.useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<typeof items>(`/vendors/${vendorId}/menu`);
      setItems(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  React.useEffect(() => { load(); }, [load]);

  const filtered = items.filter(it => `${it.name} ${it.description ?? ''}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Manage Menus</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: 4 }}>Browse and manage your menu items</p>
      </div>
      
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <select className="btn" value={vendorId ?? ''} onChange={(e) => {
          const v = e.target.value ? Number(e.target.value) : null;
          setVendorId(v);
          if (v) localStorage.setItem('vendorId', String(v));
        }}>
          <option value="">Select vendor…</option>
          {vendors.map(v => (
            <option key={v.id} value={v.id}>{v.name ?? `Vendor #${v.id}`}</option>
          ))}
        </select>
        <Input icon="🔍" placeholder="Search menu..." value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: '300px' }} />
      </div>
      
      {loading && <Spinner />}
      {error && <Card><div style={{ color: 'var(--danger)', padding: '12px' }}>{error}</div></Card>}
      
      {!loading && !error && filtered.length === 0 && (
        <EmptyState 
          icon="🍽️" 
          title={q ? "No menu items match your search" : "No menu items yet"}
          description={q ? "Try adjusting your search terms" : "Add your first menu item to get started"}
        />
      )}
      
      {!loading && !error && filtered.length > 0 && (
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
          {filtered.map((it) => (
            <Card key={it.id}>
              {it.image_url && (
                <img 
                  src={it.image_url} 
                  alt={it.name} 
                  style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 12, marginBottom: 12 }} 
                />
              )}
              <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: 6 }}>{it.name}</div>
              <div style={{ color: 'var(--muted)', marginBottom: 8, fontSize: '14px' }}>{it.description}</div>
              <div style={{ fontWeight: 800, fontSize: '20px', marginBottom: 8 }}>
                ₦{(it.price_cents / 100).toFixed(2)}
              </div>
              <div style={{ marginBottom: 12 }}>
                <StatusBadge status={it.is_available ? 'available' : 'unavailable'} />
              </div>
              <div className="row" style={{ gap: 8 }}>
                <Button 
                  variant="primary" 
                  onClick={() => { window.location.href = `/vendor/menu?edit=${it.id}`; }}
                  style={{ flex: 1 }}
                >
                  ✏️ Edit
                </Button>
                <Button 
                  variant="danger"
                  onClick={async () => {
                    if (!vendorId) { push('No vendor selected', 'error'); return; }
                    if (!confirm('Delete this menu item?')) return;
                    try { 
                      await apiDelete(`/vendors/${vendorId}/menu/${it.id}`); 
                      push('Item deleted', 'success'); 
                      load(); 
                    } catch (err: any) { 
                      push(err?.message ?? 'Failed to delete', 'error'); 
                    }
                  }}
                  style={{ flex: 1 }}
                >
                  🗑️ Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
