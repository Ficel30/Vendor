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
      {error && (
        <Card>
          <div className="text-danger">{error}</div>
        </Card>
      )}
      {!loading && !error && (
        <>
          <div className="row mb-2">
            <Input placeholder="Search comments or names" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((r, idx) => (
              <Card 
                key={idx} 
                className={`${`${r.name} ${r.comment ?? ''}`.toLowerCase().includes(q.toLowerCase()) ? 'block' : 'hidden'}`}
              >
                <div className="font-semibold">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                <div className="opacity-80">{r.comment ?? 'No comment'}</div>
                <div className="mt-2 text-xs">by {r.name}</div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}