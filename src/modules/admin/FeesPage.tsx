import React from 'react';
import { apiGet, apiPost } from '../../api/client';
import { Button, Card, Input, Spinner, useToast, EmptyState, TwoColumn } from '../ui';

type FeeVersion = { id: number; version: number; platform_fee_bps: number; delivery_fee_cents: number; surge_multiplier: number; notes: string | null; created_at: string };

export function FeesPage(): React.ReactElement {
  const { push } = useToast();
  const [versions, setVersions] = React.useState<FeeVersion[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [platformFeeBps, setPlatformFeeBps] = React.useState('');
  const [deliveryFee, setDeliveryFee] = React.useState('');
  const [surge, setSurge] = React.useState('1.00');
  const [notes, setNotes] = React.useState('');

  const fetchFees = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<FeeVersion[]>('/admin/fees');
      setVersions(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load fees');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchFees(); }, [fetchFees]);

  const createVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    const pf = Number(platformFeeBps);
    const df = Math.round(Number(deliveryFee) * 100);
    const sm = Number(surge);
    if (Number.isNaN(pf) || Number.isNaN(df) || Number.isNaN(sm)) { 
      push('Enter valid fee values', 'error'); 
      return; 
    }
    try {
      await apiPost('/admin/fees', { platform_fee_bps: pf, delivery_fee_cents: df, surge_multiplier: sm, notes: notes || undefined });
      push('Fee version created', 'success');
      setPlatformFeeBps(''); setDeliveryFee(''); setSurge('1.00'); setNotes('');
      fetchFees();
    } catch (err: any) { 
      push(err?.message ?? 'Failed to create version', 'error'); 
    }
  };

  const rollback = async (version: number) => {
    try { 
      await apiPost('/admin/fees/rollback', { version }); 
      push('Rolled back', 'success'); 
      fetchFees(); 
    } catch (err: any) { 
      push(err?.message ?? 'Failed to rollback', 'error'); 
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ marginBottom: 4 }}>Fees Configuration</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Manage fee versions and pricing structure</p>
      </div>
      
      {loading && <Spinner />}
      {error && <Card><div style={{ color: 'var(--danger)', padding: '12px' }}>{error}</div></Card>}
      
      <TwoColumn
        left={
          <Card>
            <div style={{ fontWeight: 700, marginBottom: 12, fontSize: '16px' }}>Create New Fee Version</div>
            <form className="grid fees-form" onSubmit={createVersion} style={{ gap: 12 }}>
              <Input label="Platform Fee (bps)" icon="💳" placeholder="e.g. 100" value={platformFeeBps} onChange={(e) => setPlatformFeeBps(e.target.value)} />
              <Input label="Delivery Fee" icon="🚚" placeholder="e.g. 500.00" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} />
              <Input label="Surge Multiplier" icon="⚡" placeholder="e.g. 1.25" value={surge} onChange={(e) => setSurge(e.target.value)} />
              <Input label="Notes" placeholder="Optional" value={notes} onChange={(e) => setNotes(e.target.value)} />
              <Button variant="primary" type="submit" style={{ justifySelf: 'flex-start' }}>⚙️ Create Version</Button>
            </form>
            <style>{`
              .fees-form {
                grid-template-columns: 1fr;
              }
              @media (min-width: 768px) {
                .fees-form {
                  grid-template-columns: repeat(2, 1fr);
                }
                .fees-form button { grid-column: 1 / -1; }
              }
            `}</style>
          </Card>
        }
        right={
          versions.length === 0 ? (
            <EmptyState icon="📊" title="No fee versions" description="Create your first version to get started" />
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Version</th>
                    <th>Platform Fee</th>
                    <th>Delivery Fee</th>
                    <th>Surge</th>
                    <th>Notes</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {versions.map(v => (
                    <tr key={v.id}>
                      <td><strong>v{v.version}</strong></td>
                      <td>{(Number(v.platform_fee_bps) / 100).toFixed(2)}%</td>
                      <td>₦{(Number(v.delivery_fee_cents) / 100).toFixed(2)}</td>
                      <td>{Number(v.surge_multiplier).toFixed(2)}x</td>
                      <td>{v.notes ?? '—'}</td>
                      <td style={{ fontSize: '13px', color: 'var(--muted)' }}>{new Date(v.created_at).toLocaleString()}</td>
                      <td>
                        <Button size="sm" variant="primary" icon="🔄" onClick={() => rollback(v.version)}>
                          Rollback
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      />
    </div>
  );
}
