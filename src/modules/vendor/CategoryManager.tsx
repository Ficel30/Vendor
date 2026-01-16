import React from 'react';
import { apiGet, apiPost, apiDelete } from '../../api/client';
import { Button, Card, Input, useToast } from '../ui';

type Category = { id: number; name: string; sort_index: number };

export function CategoryManager(): React.ReactElement {
  const [vendorId, setVendorId] = React.useState<number | null>(null);
  const [vendors, setVendors] = React.useState<Array<{ id: number; name?: string }>>([]);
  const { push } = useToast();
  const [cats, setCats] = React.useState<Category[]>([]);
  const [name, setName] = React.useState('');

  React.useEffect(() => {
    const fromEnv = (import.meta as any).env.VITE_VENDOR_ID;
    const stored = localStorage.getItem('vendorId');
    if (fromEnv) {
      setVendorId(Number(fromEnv));
      return;
    }
    if (stored) {
      setVendorId(Number(stored));
      return;
    }
    (async () => {
      try {
        const list = await apiGet<Array<{ id: number; name?: string }>>('/vendors');
        setVendors(list);
        const first = list?.[0]?.id;
        if (first) {
          localStorage.setItem('vendorId', String(first));
          setVendorId(first);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  const fetchCats = React.useCallback(async () => {
    if (!vendorId) return;
    const data = await apiGet<Category[]>(`/vendors/${vendorId}/categories`);
    setCats(data);
  }, [vendorId]);

  React.useEffect(() => { fetchCats(); }, [fetchCats]);

  const addCat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    if (!vendorId) { push('No vendor selected', 'error'); return; }
    try { await apiPost('/vendors/categories', { vendorId, name }); setName(''); fetchCats(); } catch (err: any) { push(err?.message ?? 'Failed to add category', 'error'); }
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = [...cats];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    const tmp = next[index];
    next[index] = next[j];
    next[j] = tmp;
    setCats(next);
  };

  const saveOrder = async () => {
    try {
      const order = cats.map((c, i) => ({ id: c.id, sort_index: i }));
      await apiPost(`/vendors/${vendorId}/categories/reorder`, { order });
      push('Order saved', 'success');
      fetchCats();
    } catch (err: any) { push(err?.message ?? 'Failed to reorder', 'error'); }
  };

  return (
    <Card>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontWeight: 600 }}>Categories</div>
        <div className="row" style={{ gap: 8 }}>
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
        </div>
      </div>
      <form className="row" onSubmit={addCat} style={{ gap: 8, marginBottom: 8 }}>
        <Input placeholder="New category name" value={name} onChange={(e) => setName(e.target.value)} />
        <Button type="submit">Add</Button>
      </form>
      {!vendorId && <div style={{ color: 'var(--warning)', marginBottom: 8 }}>Select a vendor to manage categories.</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {cats.map((c, i) => (
          <div key={c.id} className="row" style={{ gap: 8, alignItems: 'center' }}>
            <div className="btn" style={{ cursor: 'grab' }}>≡</div>
            <div style={{ flex: 1 }}>{c.name}</div>
            <Button type="button" onClick={() => move(i, -1)}>↑</Button>
            <Button type="button" onClick={() => move(i, 1)}>↓</Button>
            <Button type="button" className="danger" onClick={async () => {
              if (!vendorId) { push('No vendor selected', 'error'); return; }
              if (!confirm('Delete this category? Items will be unassigned.')) return;
              try {
                const res = await fetch(`/vendors/${vendorId}/categories/${c.id}`, { method: 'DELETE' });
                if (!res.ok) {
                  let msg = 'Failed to delete category';
                  try { const j = await res.json(); msg = j?.message ?? msg; } catch { try { msg = await res.text(); } catch {} }
                  throw new Error(msg);
                }
                push('Category deleted', 'success');
                fetchCats();
              } catch (err: any) { push(err?.message ?? 'Failed to delete category', 'error'); }
            }}>Delete</Button>
          </div>
        ))}
      </div>
      <div className="row" style={{ marginTop: 8 }}>
        <Button type="button" onClick={saveOrder}>Save Order</Button>
      </div>
    </Card>
  );
}


