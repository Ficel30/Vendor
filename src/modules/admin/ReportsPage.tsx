import React from 'react';
import { apiGet } from '../../api/client';
import { Button, Card, Spinner } from '../ui';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';

type Overview = { orders: number; vendors: number; riders: number; students: number; avgDeliveryMins: number };
type DayRow = { d: string; orders: number; gross_cents: number };

export function AdminReportsPage(): React.ReactElement {
  const [ov, setOv] = React.useState<Overview | null>(null);
  const [days, setDays] = React.useState<DayRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const o = await apiGet<Overview>('/admin/analytics/overview');
      const d = await apiGet<DayRow[]>('/admin/analytics/orders-by-day?days=30');
      setOv(o); setDays(d);
    } catch (e: any) { setError(e?.message ?? 'Failed to load'); }
    finally { setLoading(false); }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const exportPdf = async () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('ODG Delivery - Admin Report', 14, 18);
    doc.setFontSize(12);
    doc.text(`Orders: ${ov?.orders ?? 0}`, 14, 30);
    doc.text(`Vendors: ${ov?.vendors ?? 0}`, 14, 38);
    doc.text(`Riders: ${ov?.riders ?? 0}`, 14, 46);
    doc.text(`Students: ${ov?.students ?? 0}`, 14, 54);
    doc.text(`Avg Delivery: ${ov?.avgDeliveryMins?.toFixed(1) ?? '0.0'} mins`, 14, 62);
    // Simple table-like text for last 10 days
    const subset = days.slice(-10);
    let y = 78;
    doc.text('Date        Orders   Gross (₦)', 14, y); y += 8;
    subset.forEach(r => { doc.text(`${r.d}    ${String(r.orders).padStart(3, ' ')}      ${(r.gross_cents/100).toFixed(2)}`, 14, y); y += 8; });
    doc.save('admin_report.pdf');
  };

  const printPage = () => {
    window.print();
  };

  const Chart: React.FC = () => {
    if (!days.length) return null;
    return (
      <div className="card" style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={days} margin={{ top: 12, right: 24, bottom: 12, left: 0 }}>
            <XAxis dataKey="d" hide />
            <YAxis allowDecimals={false} />
            <Tooltip formatter={(value: number) => [value, 'Orders']} labelFormatter={(l) => `Date: ${l}`} />
            <Line type="monotone" dataKey="orders" stroke="#22c55e" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div>
      <h2 style={{ marginBottom: 8 }}>Reporting & Analytics</h2>
      {loading && <Spinner />}
      {error && <Card><div style={{ color: 'var(--danger)' }}>{error}</div></Card>}
      {ov && (
        <div className="grid admin-ov" style={{ gridTemplateColumns: '1fr', gap: 16 }}>
          <Card>
            <div style={{ opacity: 0.7 }}>Total Orders</div>
            <div style={{ fontWeight: 700, fontSize: 24 }}>{ov.orders}</div>
          </Card>
          <Card>
            <div style={{ opacity: 0.7 }}>Vendors</div>
            <div style={{ fontWeight: 700, fontSize: 24 }}>{ov.vendors}</div>
          </Card>
          <Card>
            <div style={{ opacity: 0.7 }}>Riders</div>
            <div style={{ fontWeight: 700, fontSize: 24 }}>{ov.riders}</div>
          </Card>
          <Card>
            <div style={{ opacity: 0.7 }}>Students</div>
            <div style={{ fontWeight: 700, fontSize: 24 }}>{ov.students}</div>
          </Card>
          <Card>
            <div style={{ opacity: 0.7 }}>Avg Delivery Time</div>
            <div style={{ fontWeight: 700, fontSize: 24 }}>{ov.avgDeliveryMins.toFixed(1)} mins</div>
          </Card>
        </div>
      )}
      {!!days.length && (
        <>
          <div className="card" style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Orders by Day (30d)</div>
            <Chart />
          </div>
          <div className="card" style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Daily Breakdown</div>
            <div className="grid admin-breakdown" style={{ gridTemplateColumns: '1fr', gap: 16 }}>
              {days.map(r => (
                <Card key={r.d}>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>{r.d}</div>
                  <div>Orders: {r.orders}</div>
                  <div>Gross: ₦{(r.gross_cents / 100).toFixed(2)}</div>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
      <div className="row" style={{ marginTop: 12 }}>
        <Button type="button" variant="primary" onClick={exportPdf}>Export PDF</Button>
        <Button type="button" onClick={printPage}>Print</Button>
      </div>
    <style>{`
      @media (min-width: 768px) {
        .admin-ov { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important; }
        .admin-breakdown { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important; }
      }
    `}</style>
    </div>
  );
}


