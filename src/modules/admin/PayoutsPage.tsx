import React from 'react';
import { apiGet, apiPost } from '../../api/client';
import { Button, Card, Input, Spinner, useToast, StatusBadge, EmptyState, TwoColumn } from '../ui';

type Payout = { id: number; vendor_id: number; vendor_name: string; amount_cents: number; status: string; reference: string | null; created_at: string; paid_at: string | null };

export function PayoutsPage(): React.ReactElement {
  const { push } = useToast();
  const [rows, setRows] = React.useState<Payout[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [vendorId, setVendorId] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [reference, setReference] = React.useState('');

  const fetchPayouts = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<Payout[]>('/admin/payouts');
      setRows(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load payouts');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchPayouts(); }, [fetchPayouts]);

  const createPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount_cents = Math.round(Number(amount) * 100);
    if (!vendorId || !amount || Number.isNaN(amount_cents) || amount_cents <= 0) { 
      push('Enter vendor and valid amount', 'error'); 
      return; 
    }
    try {
      await apiPost('/admin/payouts', { vendorId: Number(vendorId), amount_cents, reference: reference || undefined });
      push('Payout created', 'success');
      setVendorId(''); setAmount(''); setReference('');
      fetchPayouts();
    } catch (err: any) { 
      push(err?.message ?? 'Failed to create payout', 'error'); 
    }
  };

  const markPaid = async (id: number) => {
    try { 
      await apiPost(`/admin/payouts/${id}/mark-paid`, {}); 
      push('Marked as paid', 'success'); 
      fetchPayouts(); 
    } catch (err: any) { 
      push(err?.message ?? 'Failed to mark paid', 'error'); 
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ marginBottom: 4 }}>Payouts</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Manage vendor payments and transfers</p>
      </div>
      
      {loading && <Spinner />}
      {error && <Card><div style={{ color: 'var(--danger)', padding: '12px' }}>{error}</div></Card>}
      
      <TwoColumn
        left={
          <Card>
            <div style={{ fontWeight: 700, marginBottom: 12, fontSize: '16px' }}>Create New Payout</div>
            <form className="row" onSubmit={createPayout} style={{ gap: 12, alignItems: 'end', flexWrap: 'wrap' }}>
              <Input label="Vendor ID" placeholder="e.g. 1" value={vendorId} onChange={(e) => setVendorId(e.target.value)} style={{ flex: '1 1 200px' }} />
              <Input label="Amount" placeholder="e.g. 25000.00" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ flex: '1 1 200px' }} />
              <Input label="Reference" placeholder="Optional" value={reference} onChange={(e) => setReference(e.target.value)} style={{ flex: '1 1 200px' }} />
              <Button variant="primary" type="submit">💰 Create Payout</Button>
            </form>
          </Card>
        }
        right={
          rows.length === 0 && !loading ? (
            <EmptyState icon="💰" title="No payouts" description="Create a new payout to get started" />
          ) : (
            rows.length > 0 ? (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Vendor</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Reference</th>
                      <th>Created</th>
                      <th>Paid At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(p => (
                      <tr key={p.id}>
                        <td><strong>#{p.id}</strong></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ 
                              width: '32px', 
                              height: '32px', 
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 700,
                              fontSize: '12px'
                            }}>
                              {p.vendor_name.charAt(0).toUpperCase()}
                            </div>
                            {p.vendor_name} (#{p.vendor_id})
                          </div>
                        </td>
                        <td><strong>₦{(p.amount_cents / 100).toFixed(2)}</strong></td>
                        <td><StatusBadge status={p.status} /></td>
                        <td>{p.reference ?? '—'}</td>
                        <td style={{ fontSize: '13px', color: 'var(--muted)' }}>{new Date(p.created_at).toLocaleString()}</td>
                        <td style={{ fontSize: '13px', color: 'var(--muted)' }}>{p.paid_at ? new Date(p.paid_at).toLocaleString() : '—'}</td>
                        <td>
                          {p.status !== 'paid' && (
                            <Button size="sm" variant="success" icon="✓" onClick={() => markPaid(p.id)}>
                              Mark Paid
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
