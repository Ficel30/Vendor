import React from 'react';
import { apiGet, apiPost } from '../../api/client';
import { Button, Card, Input, Spinner, useToast } from '../ui';

type SettingRow = { key: string; value: string };

export function SettingsPage(): React.ReactElement {
  const { push } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [deliveryFee, setDeliveryFee] = React.useState('');
  const [serviceCharge, setServiceCharge] = React.useState('');
  const [riderCommission, setRiderCommission] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const rows = await apiGet<SettingRow[]>('/admin/settings');
      const map = new Map(rows.map(r => [r.key, r.value]));
      setDeliveryFee((Number(map.get('delivery_fee_cents') ?? '0') / 100).toFixed(2));
      setServiceCharge((Number(map.get('platform_fee_bps') ?? '0') / 100).toFixed(2));
      setRiderCommission((Number(map.get('rider_commission_bps') ?? '0') / 100).toFixed(2));
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  async function saveKey(key: string, value: string) {
    await apiPost('/admin/settings', { key, value });
  }

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveKey('delivery_fee_cents', String(Math.round(Number(deliveryFee) * 100)));
      await saveKey('platform_fee_bps', String(Math.round(Number(serviceCharge) * 100)));
      await saveKey('rider_commission_bps', String(Math.round(Number(riderCommission) * 100)));
      push('Settings saved', 'success');
      load();
    } catch (err: any) {
      push(err?.message ?? 'Failed to save settings', 'error');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ marginBottom: 4 }}>System Settings</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Configure platform fees and settings</p>
      </div>
      
      {loading && <Spinner />}
      {error && <Card><div style={{ color: 'var(--danger)', padding: '12px' }}>{error}</div></Card>}
      
      {!loading && !error && (
        <Card>
          <form onSubmit={onSave} className="grid" style={{ gridTemplateColumns: '1fr', gap: 16 }}>
            <div>
              <Input 
                label="Delivery Fee (₦)"
                icon="🚚"
                placeholder="e.g. 500.00"
                value={deliveryFee} 
                onChange={(e) => setDeliveryFee(e.target.value)} 
              />
            </div>
            
            <div>
              <Input 
                label="Service Charge (%)"
                icon="💳"
                placeholder="e.g. 2.50"
                value={serviceCharge} 
                onChange={(e) => setServiceCharge(e.target.value)} 
              />
            </div>
            
            <div>
              <Input 
                label="Rider Commission (%)"
                icon="🏍️"
                placeholder="e.g. 15.00"
                value={riderCommission} 
                onChange={(e) => setRiderCommission(e.target.value)} 
              />
            </div>
            
            <div style={{ marginTop: 8 }}>
              <Button variant="primary" type="submit" size="lg">
                💾 Save Settings
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
