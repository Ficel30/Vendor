import React from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../../api/client';
import { Card, Spinner, Input, Button, useToast } from '../ui';
import { CategoryManager } from './CategoryManager';
import { useSearchParams } from 'react-router-dom';

export function MenuPage(): React.ReactElement {
  const [vendorId, setVendorId] = React.useState<number | null>(null);
  const [vendors, setVendors] = React.useState<Array<{ id: number; name?: string }>>([]);
  const [items, setItems] = React.useState<Array<{ id: number; name: string; description: string; price_cents: number; is_available: number; image_url?: string | null }>>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [q, setQ] = React.useState('');
  const { push } = useToast();

  const [form, setForm] = React.useState<{ name: string; description: string; price: string; image_url: string; is_available: boolean; editingId?: number | null }>({ name: '', description: '', price: '', image_url: '', is_available: true, editingId: null });
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [allGroups, setAllGroups] = React.useState<Array<{ id: number; name: string }>>([]);
  const [categories, setCategories] = React.useState<Array<{ id: number; name: string }>>([]);
  const [assignedByItem, setAssignedByItem] = React.useState<Record<number, Array<{ id: number; name: string }>>>({});

  const [searchParams, setSearchParams] = useSearchParams();
  const formRef = React.useRef<HTMLFormElement | null>(null);

  React.useEffect(() => {
    const fromEnv = (import.meta as any).env.VITE_VENDOR_ID;
    const stored = localStorage.getItem('vendorId');
    if (fromEnv) { setVendorId(Number(fromEnv)); return; }
    if (stored) { setVendorId(Number(stored)); return; }
    (async () => {
      try {
        const list = await apiGet<Array<{ id: number; name?: string }>>('/vendors');
        setVendors(list);
        const first = list?.[0]?.id;
        if (first) { localStorage.setItem('vendorId', String(first)); setVendorId(first); }
      } catch {}
    })();
  }, []);

  const fetchMenu = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!vendorId) { setItems([]); return; }
      const data = await apiGet<typeof items>(`/vendors/${vendorId}/menu`);
      setItems(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  React.useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // When ?edit=<id> is present, prefill and scroll to form
  React.useEffect(() => {
    const editId = searchParams.get('edit');
    if (!editId || !items.length) return;
    const it = items.find(i => i.id === Number(editId));
    if (it) {
      setForm({
        name: it.name,
        description: it.description ?? '',
        price: (it.price_cents / 100).toFixed(2),
        image_url: it.image_url ?? '',
        is_available: !!it.is_available,
        editingId: it.id,
      });
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    }
  }, [searchParams, items]);

  // Load all modifier groups for vendor and current assignments per item
  React.useEffect(() => {
    const run = async () => {
      try {
        if (!vendorId) return;
        const groups = await apiGet<Array<{ id: number; name: string }>>(`/vendors/${vendorId}/modifier-groups`);
        setAllGroups(groups);
        const cats = await apiGet<Array<{ id: number; name: string }>>(`/vendors/${vendorId}/categories`);
        setCategories(cats);
      } catch {}
    };
    run();
  }, [vendorId]);

  const loadAssignments = React.useCallback(async (menuItemId: number) => {
    try {
      if (!vendorId) return;
      const assigned = await apiGet<Array<{ id: number; name: string }>>(`/vendors/${vendorId}/menu/${menuItemId}/modifier-groups`);
      setAssignedByItem(prev => ({ ...prev, [menuItemId]: assigned }));
    } catch {}
  }, [vendorId]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) { push('No vendor selected', 'error'); return; }
    const normalizedPrice = String(form.price).replace(/,/g, '');
    const price_cents = Math.round(Number(normalizedPrice) * 100);
    if (!form.name || Number.isNaN(price_cents) || price_cents < 0) {
      push('Please provide valid name and price', 'error');
      return;
    }
    try {
      if (form.editingId) {
        await apiPut(`/vendors/${vendorId}/menu/${form.editingId}`, {
          name: form.name || undefined,
          description: form.description || null,
          price_cents,
          image_url: form.image_url || null,
          is_available: form.is_available,
        });
        push('Menu item updated', 'success');
      } else {
        await apiPost(`/vendors/${vendorId}/menu`, {
          name: form.name,
          description: form.description || null,
          price_cents,
          image_url: form.image_url || null,
          is_available: form.is_available,
        });
        push('Menu item created', 'success');
      }
      setForm({ name: '', description: '', price: '', image_url: '', is_available: true, editingId: null });
      fetchMenu();
      // Optionally clear the edit param after save
      if (searchParams.get('edit')) {
        searchParams.delete('edit');
        setSearchParams(searchParams, { replace: true });
      }
    } catch (err: any) {
      push(err?.message ?? 'Failed to save item', 'error');
    }
  };

  const onEdit = (it: { id: number; name: string; description: string; price_cents: number; is_available: number; image_url?: string | null }) => {
    setForm({
      name: it.name,
      description: it.description ?? '',
      price: (it.price_cents / 100).toFixed(2),
      image_url: it.image_url ?? '',
      is_available: !!it.is_available,
      editingId: it.id,
    });
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const onDelete = async (id: number) => {
    if (!confirm('Delete this menu item?')) return;
    try {
      if (!vendorId) { push('No vendor selected', 'error'); return; }
      await apiDelete(`/vendors/${vendorId}/menu/${id}`);
      push('Menu item deleted', 'success');
      fetchMenu();
    } catch (err: any) {
      push(err?.message ?? 'Failed to delete item', 'error');
    }
  };

  return (
    <div>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Create / Edit Menu</h2>
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
      {!vendorId && <Card><div style={{ color: 'var(--warning)' }}>Select a vendor to manage menu.</div></Card>}
      {loading && <Spinner />}
      {error && <Card><div style={{ color: 'var(--danger)' }}>{error}</div></Card>}
      {!loading && !error && (
        <>
        <form ref={formRef} onSubmit={onSubmit} className="card" style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: '14px' }}>Item Name</label>
              <Input placeholder="Enter item name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: '14px' }}>Price</label>
              <Input placeholder="Price (e.g. 1200.00)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: '14px' }}>Description</label>
            <Input placeholder="Enter item description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: '14px' }}>Image Upload</label>
            <div className="row" style={{ gap: 8, alignItems: 'center' }}>
              <input
                type="file"
                accept="image/*"
                style={{ flex: 1 }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    setUploadingImage(true);
                    const reader = new FileReader();
                    reader.onload = async () => {
                      try {
                        const dataUrl = reader.result as string;
                        const res = await fetch('/files/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: dataUrl, filename: file.name }) });
                        if (!res.ok) {
                          let msg = 'Upload failed';
                          try { const err = await res.json(); msg = err?.message ?? msg; } catch { try { msg = await res.text(); } catch {} }
                          throw new Error(msg);
                        }
                        const json = await res.json();
                        setForm({ ...form, image_url: json.url });
                      } catch (err: any) {
                        push(err?.message ?? 'Failed to upload image', 'error');
                      } finally {
                        setUploadingImage(false);
                      }
                    };
                    reader.readAsDataURL(file);
                  } catch {
                    setUploadingImage(false);
                  }
                }}
              />
              <Button type="button" onClick={() => setForm({ ...form, image_url: '' })} disabled={!form.image_url}>Clear</Button>
            </div>
            {form.image_url && (
              <div style={{ marginTop: 8 }}>
                <img src={form.image_url} alt="preview" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
              </div>
            )}
            {uploadingImage && <span style={{ fontSize: 12, opacity: 0.8, marginTop: 4, display: 'block' }}>Uploading image…</span>}
          </div>
          
          <div className="row" style={{ gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
            <label className="row" style={{ gap: 8, alignItems: 'center' }}>
              <input type="checkbox" checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} />
              <span style={{ fontWeight: 500, fontSize: '14px' }}>Available for ordering</span>
            </label>
            
            <div className="row" style={{ gap: 8 }}>
              <Button type="submit" variant="success">
                {form.editingId ? 'Update' : 'Add'} Item
              </Button>
              {form.editingId && (
                <Button type="button" variant="ghost" onClick={() => setForm({ name: '', description: '', price: '', image_url: '', is_available: true, editingId: null })}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </form>

        <div className="row" style={{ marginBottom: 8 }}>
          <Input placeholder="Search menu" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        
        <CategoryManager />
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {items.map((it) => (
            <Card key={it.id} style={{ display: `${`${it.name} ${it.description ?? ''}`.toLowerCase().includes(q.toLowerCase()) ? 'block' : 'none'}` }}>
              {it.image_url && <img src={it.image_url} alt={it.name} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />}
              <div style={{ fontWeight: 600 }}>{it.name}</div>
              <div style={{ opacity: 0.8 }}>{it.description}</div>
              <div style={{ marginTop: 8 }}>₦{(it.price_cents / 100).toFixed(2)}</div>
              <div style={{ marginTop: 4, fontSize: 12 }}>{it.is_available ? 'Available' : 'Unavailable'}</div>
              <div className="row" style={{ marginTop: 8, gap: 8 }}>
                <Button type="button" onClick={() => onEdit(it)}>Edit</Button>
                <Button type="button" className="danger" onClick={() => onDelete(it.id)}>Delete</Button>
              </div>
              <div className="row" style={{ gap: 6, marginTop: 6 }}>
                <select className="btn" value={(it as any).category_id ?? ''} onChange={async (e) => {
                  const category_id = e.target.value ? Number(e.target.value) : null;
                  try { await apiPost(`/vendors/${vendorId}/menu/${it.id}/category`, { category_id }); fetchMenu(); } catch (err: any) { push(err?.message ?? 'Failed to set category', 'error'); }
                }}>
                  <option value="">No category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Modifier Groups</div>
                <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                  {(assignedByItem[it.id] ?? []).map(g => (
                    <span key={g.id} className="btn" style={{ background: '#0f172a', borderRadius: 9999 }}>
                      {g.name}
                      <button className="btn" style={{ marginLeft: 6 }} onClick={async () => {
                        try {
                          await apiDelete(`/vendors/${vendorId}/menu/${it.id}/modifier-groups/${g.id}`);
                          loadAssignments(it.id);
                        } catch (err: any) { push(err?.message ?? 'Failed to remove group', 'error'); }
                      }}>×</button>
                    </span>
                  ))}
                </div>
                <div className="row" style={{ gap: 6, marginTop: 6 }}>
                  <select className="btn" onFocus={() => loadAssignments(it.id)} onChange={async (e) => {
                    const groupId = Number(e.target.value);
                    if (!groupId) return;
                    try {
                      await apiPost(`/vendors/${vendorId}/menu/${it.id}/modifier-groups`, { groupId });
                      loadAssignments(it.id);
                    } catch (err: any) { push(err?.message ?? 'Failed to assign group', 'error'); }
                    e.currentTarget.selectedIndex = 0;
                  }}>
                    <option value="">Assign group…</option>
                    {allGroups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>
          ))}
        </div>
        </>
      )}
    </div>
  );
}


