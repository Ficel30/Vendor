import React from 'react';
import { apiGet, apiPost } from '../../api/client';
import { Button, Card, Input, Spinner, useToast } from '../ui';

type Group = { id: number; name: string };
type Option = { id: number; name: string; price_cents: number };

export function ModifiersPage(): React.ReactElement {
  const vendorId = Number((import.meta as any).env.VITE_VENDOR_ID ?? 1);
  const { push } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [optionsByGroup, setOptionsByGroup] = React.useState<Record<number, Option[]>>({});

  const [newGroup, setNewGroup] = React.useState('');
  const [newOption, setNewOption] = React.useState<{ name: string; price: string; groupId: number | null }>({ name: '', price: '', groupId: null });

  const fetchGroups = React.useCallback(async () => {
    setLoading(true);
    try {
      const gs = await apiGet<Group[]>(`/vendors/${vendorId}/modifier-groups`);
      setGroups(gs);
      // Fetch options for each group
      const map: Record<number, Option[]> = {};
      await Promise.all(gs.map(async (g) => {
        const opts = await apiGet<Option[]>(`/vendors/modifier-options/${g.id}`);
        map[g.id] = opts;
      }));
      setOptionsByGroup(map);
    } catch (e: any) {
      push(e?.message ?? 'Failed to load modifiers', 'error');
    } finally {
      setLoading(false);
    }
  }, [vendorId, push]);

  React.useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const onAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroup) return;
    try {
      const res = await apiPost<{ id: number }>(`/vendors/modifier-groups`, { vendorId, name: newGroup });
      push('Group added', 'success');
      setNewGroup('');
      setGroups(prev => [...prev, { id: res.id, name: newGroup }]);
    } catch (err: any) {
      push(err?.message ?? 'Failed to add group', 'error');
    }
  };

  const onAddOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOption.groupId || !newOption.name) return;
    const price_cents = Math.round(Number(newOption.price) * 100);
    if (Number.isNaN(price_cents) || price_cents < 0) {
      push('Enter a valid price', 'error');
      return;
    }
    try {
      const res = await apiPost<{ id: number }>(`/vendors/modifier-options`, { groupId: newOption.groupId, name: newOption.name, price_cents });
      push('Option added', 'success');
      setNewOption({ name: '', price: '', groupId: newOption.groupId });
      setOptionsByGroup(prev => ({
        ...prev,
        [newOption.groupId as number]: [
          ...(prev[newOption.groupId as number] ?? []),
          { id: res.id, name: newOption.name, price_cents }
        ]
      }));
    } catch (err: any) {
      push(err?.message ?? 'Failed to add option', 'error');
    }
  };

  return (
    <div>
      <h3>Modifiers & Add-ons</h3>
      {loading && <Spinner />}
      <Card>
        <form className="row" onSubmit={onAddGroup} style={{ gap: 8, alignItems: 'center' }}>
          <Input placeholder="New group name (e.g., Drinks)" value={newGroup} onChange={(e) => setNewGroup(e.target.value)} />
          <Button type="submit">Add Group</Button>
        </form>
      </Card>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {groups.map(g => (
          <div key={g.id} className="card">
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{g.name}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(optionsByGroup[g.id] ?? []).map(o => (
                <div key={o.id} className="row" style={{ justifyContent: 'space-between' }}>
                  <div>{o.name}</div>
                  <div>₦{(o.price_cents / 100).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <form onSubmit={onAddOption} className="row" style={{ gap: 6, marginTop: 8 }}>
              <Input placeholder="Option name" value={newOption.groupId === g.id ? newOption.name : ''} onChange={(e) => setNewOption({ ...newOption, name: e.target.value, groupId: g.id })} />
              <Input placeholder="Price" value={newOption.groupId === g.id ? newOption.price : ''} onChange={(e) => setNewOption({ ...newOption, price: e.target.value, groupId: g.id })} />
              <Button type="submit">Add</Button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}


