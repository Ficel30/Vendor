import React from 'react';
import { apiGet } from '../../api/client';
import { Card, Input, Spinner } from '../ui';

type Rating = { rating: number; comment: string | null; name: string };

export function FeedbackPage(): React.ReactElement {
  const vendorId = Number((import.meta as any).env.VITE_VENDOR_ID ?? 1);
  const [items, setItems] = React.useState<Rating[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [q, setQ] = React.useState('');

  React.useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGet<Rating[]>(`/vendors/${vendorId}/ratings`);
        setItems(data);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load feedback');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [vendorId]);

  return (
    <div>
      <h3>Ratings & Reviews</h3>
      {loading && <Spinner />}
      {error && <Card><div style={{ color: 'var(--danger)' }}>{error}</div></Card>}
      {!loading && !error && (
        <>
          <div className="row" style={{ marginBottom: 8 }}>
            <Input placeholder="Search comments or names" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {items.map((r, idx) => (
              <Card key={idx} style={{ display: `${`${r.name} ${r.comment ?? ''}`.toLowerCase().includes(q.toLowerCase()) ? 'block' : 'none'}` }}>
                <div style={{ fontWeight: 600 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                <div style={{ opacity: 0.8 }}>{r.comment ?? 'No comment'}</div>
                <div style={{ marginTop: 8, fontSize: 12 }}>by {r.name}</div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}


