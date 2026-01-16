import React from 'react';
import { apiGet } from '../../api/client';
import { Card, Input, Spinner, Button, StatusBadge, EmptyState } from '../ui';

type ActiveOrder = { id: number; status: string; total_cents: number; rider_id?: number | null; vendor_name: string; user_name: string; user_phone: string };

export function AdminOrdersPage(): React.ReactElement {
  const [orders, setOrders] = React.useState<ActiveOrder[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [q, setQ] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<ActiveOrder[]>('/admin/orders/active');
      setOrders(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load active orders');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); const t = setInterval(load, 5000); return () => clearInterval(t); }, [load]);

  const filtered = orders.filter(o => `${o.id} ${o.status} ${o.vendor_name} ${o.user_name} ${o.user_phone}`.toLowerCase().includes(q.toLowerCase()));

  const exportCsv = () => {
    const rows = [
      ['ID','Status','Vendor','Student','Phone','Total'],
      ...filtered.map(o => [o.id, o.status, o.vendor_name, o.user_name, o.user_phone ?? '', (o.total_cents/100).toFixed(2)])
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'admin_active_orders.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ marginBottom: 4 }}>Orders Monitoring</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Monitor and manage all active orders in real-time</p>
      </div>
      
      {loading && <Spinner />}
      {error && <Card><div style={{ color: 'var(--danger)', padding: '12px' }}>{error}</div></Card>}
      
      {!loading && !error && (
        <>
          <div className="row" style={{ marginBottom: 20 }}>
            <Input icon="🔍" placeholder="Search orders..." value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: '640px' }} />
            <div style={{ color: 'var(--muted)', fontSize: '14px' }}>
              {filtered.length} {filtered.length === 1 ? 'order' : 'orders'} found
            </div>
            <div style={{ flex: 1 }} />
            <Button variant="primary" onClick={exportCsv}>📥 Export CSV</Button>
          </div>
          
          {filtered.length === 0 ? (
            <EmptyState 
              icon="📦" 
              title={q ? "No orders match your search" : "No active orders"}
              description={q ? "Try adjusting your search terms" : "Active orders will appear here"}
            />
          ) : (
            <div className="table-wrapper" style={{ width: '100%' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Status</th>
                    <th>Vendor</th>
                    <th>Student</th>
                    <th>Phone</th>
                    <th>Rider</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(o => (
                    <tr key={o.id}>
                      <td><strong>#{o.id}</strong></td>
                      <td><StatusBadge status={o.status} /></td>
                      <td>{o.vendor_name}</td>
                      <td>{o.user_name}</td>
                      <td>{o.user_phone ?? '—'}</td>
                      <td>{o.rider_id ?? '—'}</td>
                      <td><strong>₦{(o.total_cents / 100).toFixed(2)}</strong></td>
                      <td>
                        <div className="row" style={{ gap: '6px', flexWrap: 'wrap' }}>
                          <Button size="sm" icon="🔄" onClick={async () => {
                            const v = prompt('New rider ID?');
                            if (!v) return; const rider_id = Number(v);
                            try { await fetch(`/admin/orders/${o.id}/reassign`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rider_id }) }); load(); } catch {}
                          }}>Reassign</Button>
                          <Button size="sm" variant="danger" icon="✗" onClick={async () => {
                            const reason = prompt('Cancel reason?') || undefined;
                            try { await fetch(`/admin/orders/${o.id}/cancel`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason }) }); load(); } catch {}
                          }}>Cancel</Button>
                          <Button size="sm" variant="ghost" icon="💰" onClick={async () => {
                            const v = prompt('Adjust amount (₦, can be negative)?');
                            if (v === null) return; const adjust_amount_cents = Math.round(Number(v) * 100);
                            try { await fetch(`/admin/orders/${o.id}/adjust`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ adjust_amount_cents }) }); load(); } catch {}
                          }}>Adjust</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
