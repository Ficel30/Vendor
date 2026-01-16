import React from 'react';
import { apiGet, apiPost } from '../../api/client';
import { Button, Card, Input, Spinner, useToast, TwoColumn } from '../ui';

type University = { id: number; name: string };
type Campus = { id: number; university_id: number; name: string; boundary_json: string | null };
type Zone = { id: number; campus_id: number; name: string; boundary_json: string | null };

export function ZonesPage(): React.ReactElement {
  const { push } = useToast();
  const [unis, setUnis] = React.useState<University[]>([]);
  const [campuses, setCampuses] = React.useState<Campus[]>([]);
  const [zones, setZones] = React.useState<Zone[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [uniName, setUniName] = React.useState('');
  const [campusName, setCampusName] = React.useState('');
  const [zoneName, setZoneName] = React.useState('');
  const [selectedUni, setSelectedUni] = React.useState<number | ''>('');
  const [selectedCampus, setSelectedCampus] = React.useState<number | ''>('');

  const load = React.useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const u = await apiGet<University[]>('/admin/universities');
      setUnis(u);
      const c = await apiGet<Campus[]>('/admin/campuses');
      setCampuses(c);
      const z = await apiGet<Zone[]>('/admin/zones');
      setZones(z);
    } catch (e: any) { setError(e?.message ?? 'Failed to load'); }
    finally { setLoading(false); }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const createUni = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uniName) return;
    try { await apiPost('/admin/universities', { name: uniName }); push('University created', 'success'); setUniName(''); load(); } catch (err: any) { push(err?.message ?? 'Failed', 'error'); }
  };
  const createCampus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campusName || !selectedUni) return;
    try { await apiPost('/admin/campuses', { university_id: Number(selectedUni), name: campusName }); push('Campus created', 'success'); setCampusName(''); load(); } catch (err: any) { push(err?.message ?? 'Failed', 'error'); }
  };
  const createZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneName || !selectedCampus) return;
    try { await apiPost('/admin/zones', { campus_id: Number(selectedCampus), name: zoneName }); push('Zone created', 'success'); setZoneName(''); load(); } catch (err: any) { push(err?.message ?? 'Failed', 'error'); }
  };

  return (
    <div>
      <h2>Universities, Campuses & Delivery Zones</h2>
      {loading && <Spinner />}
      {error && <Card><div style={{ color: 'var(--danger)' }}>{error}</div></Card>}
      <TwoColumn
        left={
          <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 12 }}>
            <Card>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Universities</div>
              <form className="row" onSubmit={createUni} style={{ gap: 8 }}>
                <Input placeholder="New university" value={uniName} onChange={(e) => setUniName(e.target.value)} />
                <Button type="submit">Add</Button>
              </form>
            </Card>
            <Card>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Campuses</div>
              <form className="row" onSubmit={createCampus} style={{ gap: 8 }}>
                <select className="btn" value={selectedUni} onChange={(e) => setSelectedUni(e.target.value ? Number(e.target.value) : '')}>
                  <option value="">Select university…</option>
                  {unis.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <Input placeholder="New campus" value={campusName} onChange={(e) => setCampusName(e.target.value)} />
                <Button type="submit">Add</Button>
              </form>
            </Card>
            <Card>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Delivery Zones</div>
              <form className="row" onSubmit={createZone} style={{ gap: 8 }}>
                <select className="btn" value={selectedCampus} onChange={(e) => setSelectedCampus(e.target.value ? Number(e.target.value) : '')}>
                  <option value="">Select campus…</option>
                  {campuses.filter(c => !selectedUni || c.university_id === selectedUni).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <Input placeholder="New zone" value={zoneName} onChange={(e) => setZoneName(e.target.value)} />
                <Button type="submit">Add</Button>
              </form>
            </Card>
          </div>
        }
        right={
          <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 12 }}>
            <Card>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Universities</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {unis.map(u => (
                  <div key={u.id} className="btn" onClick={() => setSelectedUni(u.id)} style={{ background: selectedUni === u.id ? '#0f172a' : undefined }}>{u.name}</div>
                ))}
              </div>
            </Card>
            <Card>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Campuses</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {campuses.filter(c => !selectedUni || c.university_id === selectedUni).map(c => (
                  <div key={c.id} className="btn" onClick={() => setSelectedCampus(c.id)} style={{ background: selectedCampus === c.id ? '#0f172a' : undefined }}>{c.name}</div>
                ))}
              </div>
            </Card>
            <Card>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Delivery Zones</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {zones.filter(z => !selectedCampus || z.campus_id === selectedCampus).map(z => (
                  <div key={z.id} className="btn">{z.name}</div>
                ))}
              </div>
            </Card>
          </div>
        }
      />
    </div>
  );
}


