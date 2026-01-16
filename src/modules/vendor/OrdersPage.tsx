import React from 'react';
import { apiGet, apiPost } from '../../api/client';
import { Button, Card, Input, Spinner, useToast, StatusBadge, EmptyState } from '../ui';

type VendorOrder = { id: number; user_id: number; status: string; total_cents: number; created_at: string; student_name?: string; student_phone?: string };

export function OrdersPage(): React.ReactElement {
  const vendorId = Number((import.meta as any).env.VITE_VENDOR_ID ?? 1);
  const { push } = useToast();
  const [orders, setOrders] = React.useState<VendorOrder[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [q, setQ] = React.useState('');

  const fetchOrders = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<VendorOrder[]>(`/vendors/${vendorId}/orders`);
      setOrders(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  React.useEffect(() => {
    fetchOrders();
    const es = new EventSource(`/vendors/${vendorId}/events`);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data?.type === 'order_status') {
          fetchOrders();
        }
      } catch {}
    };
    es.onerror = () => {
      es.close();
    };
    return () => es.close();
  }, [fetchOrders]);

  const updateStatus = async (orderId: number, status: string) => {
    try {
      let reason: string | undefined;
      if (status === 'cancelled') {
        reason = prompt('Reason for decline/cancellation?') || undefined;
      }
      await apiPost(`/vendors/${vendorId}/orders/${orderId}/status`, { status, reason });
      push('Order status updated', 'success');
      fetchOrders();
    } catch (err: any) {
      push(err?.message ?? 'Failed to update order', 'error');
    }
  };

  const filtered = orders.filter(o => `${o.id} ${o.status} ${o.student_name} ${o.student_phone}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ marginBottom: 4 }}>Incoming Orders</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Manage and process customer orders</p>
      </div>
      
      {loading && <Spinner />}
      {error && <Card><div style={{ color: 'var(--danger)', padding: '12px' }}>{error}</div></Card>}
      
      {!loading && !error && (
        <>
          <div className="row" style={{ marginBottom: 20 }}>
            <Input 
              icon="🔍"
              placeholder="Search by ID or status" 
              value={q} 
              onChange={(e) => setQ(e.target.value)}
              style={{ maxWidth: '520px' }}
            />
            <div style={{ color: 'var(--muted)', fontSize: '14px' }}>
              {filtered.length} {filtered.length === 1 ? 'order' : 'orders'} found
            </div>
          </div>
          
          {filtered.length === 0 ? (
            <EmptyState 
              icon="📦" 
              title={q ? "No orders match your search" : "No orders yet"} 
              description={q ? "Try adjusting your search terms" : "New orders will appear here"}
            />
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Student</th>
                    <th>Phone</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(o => (
                    <tr key={o.id}>
                      <td><strong>#{o.id}</strong></td>
                      <td>{o.student_name ?? `Customer #${o.user_id}`}</td>
                      <td>{o.student_phone ?? '—'}</td>
                      <td><strong>₦{(o.total_cents / 100).toFixed(2)}</strong></td>
                      <td><StatusBadge status={o.status} /></td>
                      <td style={{ fontSize: '13px', color: 'var(--muted)' }}>
                        {new Date(o.created_at).toLocaleString()}
                      </td>
                      <td>
                        <div className="row" style={{ gap: '6px', flexWrap: 'wrap' }}>
                          <Button size="sm" variant="primary" icon="🍳" onClick={() => updateStatus(o.id, 'preparing')}>
                            Preparing
                          </Button>
                          <Button size="sm" icon="✅" onClick={() => updateStatus(o.id, 'ready')}>
                            Ready
                          </Button>
                          <Button size="sm" variant="success" onClick={() => updateStatus(o.id, 'completed')}>
                            ✓ Complete
                          </Button>
                          <Button size="sm" variant="danger" icon="✗" onClick={() => updateStatus(o.id, 'cancelled')}>
                            Decline
                          </Button>
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
