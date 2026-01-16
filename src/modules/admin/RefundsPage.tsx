import React from 'react';
import { apiGet, apiPost } from '../../api/client';
import { Button, Card, Input, Spinner, useToast, StatusBadge, EmptyState, TwoColumn } from '../ui';

type Refund = { id: number; order_id: number; user_id: number; user_name: string; amount_cents: number; reason: string | null; status: string; created_at: string; processed_at: string | null };

export function RefundsPage(): React.ReactElement {
  const { push } = useToast();
  const [rows, setRows] = React.useState<Refund[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [orderId, setOrderId] = React.useState('');
  const [userId, setUserId] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [reason, setReason] = React.useState('');

  const fetchRefunds = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<Refund[]>('/admin/refunds');
      setRows(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load refunds');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchRefunds(); }, [fetchRefunds]);

  const createRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount_cents = Math.round(Number(amount) * 100);
    if (!orderId || !userId || Number.isNaN(amount_cents) || amount_cents <= 0) { 
      push('Enter order, user and valid amount', 'error'); 
      return; 
    }
    try {
      await apiPost('/admin/refunds', { order_id: Number(orderId), user_id: Number(userId), amount_cents, reason: reason || undefined });
      push('Refund created', 'success');
      setOrderId(''); setUserId(''); setAmount(''); setReason('');
      fetchRefunds();
    } catch (err: any) { 
      push(err?.message ?? 'Failed to create refund', 'error'); 
    }
  };

  const markProcessed = async (id: number) => {
    try { 
      await apiPost(`/admin/refunds/${id}/mark-processed`, {}); 
      push('Marked processed', 'success'); 
      fetchRefunds(); 
    } catch (err: any) { 
      push(err?.message ?? 'Failed to mark processed', 'error'); 
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ marginBottom: 4 }}>Refunds</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Manage customer refunds and processing</p>
      </div>
      
      {loading && <Spinner />}
      {error && <Card><div style={{ color: 'var(--danger)', padding: '12px' }}>{error}</div></Card>}
      
      <TwoColumn
        left={
          <Card>
            <div style={{ fontWeight: 700, marginBottom: 12, fontSize: '16px' }}>Create New Refund</div>
            <form className="row" onSubmit={createRefund} style={{ gap: 12, alignItems: 'end', flexWrap: 'wrap' }}>
              <Input label="Order ID" placeholder="e.g. 123" value={orderId} onChange={(e) => setOrderId(e.target.value)} style={{ flex: '1 1 150px' }} />
              <Input label="User ID" placeholder="e.g. 456" value={userId} onChange={(e) => setUserId(e.target.value)} style={{ flex: '1 1 150px' }} />
              <Input label="Amount" placeholder="e.g. 5000.00" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ flex: '1 1 150px' }} />
              <Input label="Reason" placeholder="Optional" value={reason} onChange={(e) => setReason(e.target.value)} style={{ flex: '1 1 200px' }} />
              <Button variant="primary" type="submit">💰 Create Refund</Button>
            </form>
          </Card>
        }
        right={
          rows.length === 0 && !loading ? (
            <EmptyState icon="💸" title="No refunds" description="Create a new refund to get started" />
          ) : (
            rows.length > 0 ? (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Order</th>
                      <th>User</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Reason</th>
                      <th>Created</th>
                      <th>Processed</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(r => (
                      <tr key={r.id}>
                        <td><strong>#{r.id}</strong></td>
                        <td>#{r.order_id}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ 
                              width: '32px', 
                              height: '32px', 
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 700,
                              fontSize: '12px'
                            }}>
                              {r.user_name.charAt(0).toUpperCase()}
                            </div>
                            {r.user_name} (#{r.user_id})
                          </div>
                        </td>
                        <td><strong>₦{(r.amount_cents / 100).toFixed(2)}</strong></td>
                        <td><StatusBadge status={r.status} /></td>
                        <td>{r.reason ?? '—'}</td>
                        <td style={{ fontSize: '13px', color: 'var(--muted)' }}>{new Date(r.created_at).toLocaleString()}</td>
                        <td style={{ fontSize: '13px', color: 'var(--muted)' }}>{r.processed_at ? new Date(r.processed_at).toLocaleString() : '—'}</td>
                        <td>
                          {r.status !== 'processed' && (
                            <Button size="sm" variant="success" icon="✓" onClick={() => markProcessed(r.id)}>
                              Mark Processed
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div />
            )
          )
        }
      />
    </div>
  );
}
