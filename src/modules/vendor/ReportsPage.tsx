import React from 'react';
import { apiGet } from '../../api/client';
import { Card, Input, Spinner } from '../ui';

type Stats = { orders_count: number; gross_cents: number; completed_cents: number; today_orders: number; today_cents: number };
type EarningsRow = { label: string; orders_count: number; gross_cents: number; completed_cents: number };

export function ReportsPage(): React.ReactElement {
  const vendorId = Number((import.meta as any).env.VITE_VENDOR_ID ?? 1);
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [earnings, setEarnings] = React.useState<EarningsRow[]>([]);
  const [range, setRange] = React.useState<'daily'|'weekly'|'monthly'>('daily');
  const [tx, setTx] = React.useState<Array<{ id: number; status: string; total_cents: number; payment_status: string; created_at: string }>>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchAll = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await apiGet<Stats>(`/vendors/${vendorId}/stats`);
      const e = await apiGet<EarningsRow[]>(`/vendors/${vendorId}/earnings?range=${range}`);
      const t = await apiGet<typeof tx>(`/vendors/${vendorId}/transactions`);
      setStats(s); setEarnings(e); setTx(t);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [vendorId, range]);

  React.useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <div>
      <h2 style={{ marginBottom: 8 }}>Financials & Reporting</h2>
      <div className="row" style={{ gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <label>Range</label>
        <select className="btn" value={range} onChange={(e) => setRange(e.target.value as any)}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <button className="btn" type="button" onClick={() => {
          const rows = [
            ['Period','Orders','Gross','Completed'],
            ...earnings.map(r => [r.label, r.orders_count, (r.gross_cents/100).toFixed(2), (r.completed_cents/100).toFixed(2)])
          ];
          const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = `vendor_earnings_${range}.csv`; a.click();
          URL.revokeObjectURL(url);
        }}>Export CSV</button>
      </div>
      {loading && <Spinner />}
      {error && <Card><div style={{ color: 'var(--danger)' }}>{error}</div></Card>}
      {stats && (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <Card>
            <div style={{ opacity: 0.7 }}>Total Orders</div>
            <div style={{ fontWeight: 700, fontSize: 24 }}>{stats.orders_count}</div>
          </Card>
          <Card>
            <div style={{ opacity: 0.7 }}>Gross Revenue</div>
            <div style={{ fontWeight: 700, fontSize: 24 }}>₦{(stats.gross_cents / 100).toFixed(2)}</div>
          </Card>
          <Card>
            <div style={{ opacity: 0.7 }}>Completed Revenue</div>
            <div style={{ fontWeight: 700, fontSize: 24 }}>₦{(stats.completed_cents / 100).toFixed(2)}</div>
          </Card>
          <Card>
            <div style={{ opacity: 0.7 }}>Today</div>
            <div className="row" style={{ gap: 8 }}>
              <div>{stats.today_orders} orders</div>
              <div>₦{(stats.today_cents / 100).toFixed(2)}</div>
            </div>
          </Card>
        </div>
      )}
      {!!earnings.length && (
        <div className="card" style={{ marginTop: 12 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Orders</th>
                <th>Gross</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {earnings.map(r => (
                <tr key={r.label}>
                  <td>{r.label}</td>
                  <td>{r.orders_count}</td>
                  <td>₦{(r.gross_cents / 100).toFixed(2)}</td>
                  <td>₦{(r.completed_cents / 100).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!!tx.length && (
        <div className="card" style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Recent Transactions</div>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {tx.map(t => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.status}</td>
                  <td>{t.payment_status}</td>
                  <td>₦{(t.total_cents / 100).toFixed(2)}</td>
                  <td>{new Date(t.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


