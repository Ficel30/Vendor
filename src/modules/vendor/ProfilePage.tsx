import React from 'react';
import { apiGet, apiPost } from '../../api/client';
import { Button, Card, Input, Spinner, useToast, StatCard } from '../ui';

type VendorProfile = { id: number; name: string; description: string | null; image_url: string | null; is_open: number };

export function ProfilePage(): React.ReactElement {
  const vendorId = Number((import.meta as any).env.VITE_VENDOR_ID ?? 1);
  const { push } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [imageUrl, setImageUrl] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(true);
  const [bankName, setBankName] = React.useState('');
  const [accountNumber, setAccountNumber] = React.useState('');
  const [hours, setHours] = React.useState<Array<{ day_of_week: number; open_time: string; close_time: string }>>(
    Array.from({ length: 7 }, (_, i) => ({ day_of_week: i, open_time: '08:00', close_time: '20:00' }))
  );

  React.useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGet<VendorProfile | null>(`/vendors/${vendorId}/profile`);
        if (data) {
          setName(data.name ?? '');
          setDescription(data.description ?? '');
          setImageUrl(data.image_url ?? '');
          setIsOpen(!!data.is_open);
        }
        const bank = await apiGet<{ vendor_id: number; bank_name: string; account_number: string } | null>(`/vendors/${vendorId}/bank`).catch(() => null);
        if (bank) { setBankName(bank.bank_name); setAccountNumber(bank.account_number); }
        const hrs = await apiGet<Array<{ day_of_week: number; open_time: string; close_time: string }>>(`/vendors/${vendorId}/hours`).catch(() => []);
        if (hrs?.length) setHours(hrs);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [vendorId]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiPost('/vendors/profile', { vendorId, name, description: description || null, image_url: imageUrl || null, is_open: isOpen ? 1 : 0 });
      push('Profile saved', 'success');
    } catch (err: any) {
      push(err?.message ?? 'Failed to save profile', 'error');
    }
  };

  const saveBank = async () => {
    try { 
      await apiPost('/vendors/bank', { vendorId, bank_name: bankName, account_number: accountNumber }); 
      push('Bank details saved', 'success'); 
    } catch (err: any) { 
      push(err?.message ?? 'Failed to save bank', 'error'); 
    }
  };

  const saveHours = async () => {
    try { 
      await apiPost('/vendors/hours', { vendorId, hours }); 
      push('Hours saved', 'success'); 
    } catch (err: any) { 
      push(err?.message ?? 'Failed to save hours', 'error'); 
    }
  };

  return (
    <div>
      <div className="mb-5">
        <h2 className="mb-1">Profile Settings</h2>
        <p className="text-muted text-sm">Manage your restaurant profile and settings</p>
      </div>
      
      {loading && <Spinner />}
      {error && (
        <Card>
          <div className="text-danger p-3">{error}</div>
        </Card>
      )}
      
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <div className="flex items-center gap-3 mb-5">
              <div className="text-2xl">🍽️</div>
              <div>
                <h3 className="m-0 text-lg">Restaurant Details</h3>
                <p className="m-0 text-xs text-muted">Basic information</p>
              </div>
            </div>
            <form onSubmit={onSave} className="grid grid-cols-1 gap-4">
              <Input label="Restaurant name" placeholder="Your restaurant name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Description" placeholder="Short description" value={description} onChange={(e) => setDescription(e.target.value)} />
              <Input label="Image URL" placeholder="Profile image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
              <label className="row gap-2 items-center">
                <input type="checkbox" checked={isOpen} onChange={(e) => setIsOpen(e.target.checked)} />
                Open for orders
              </label>
              <Button variant="primary" type="submit">💾 Save Profile</Button>
            </form>
          </Card>
          
          <Card>
            <div className="flex items-center gap-3 mb-5">
              <div className="text-2xl">🏦</div>
              <div>
                <h3 className="m-0 text-lg">Bank Details</h3>
                <p className="m-0 text-xs text-muted">Payment information</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Input label="Bank name" placeholder="Your bank name" value={bankName} onChange={(e) => setBankName(e.target.value)} />
              <Input label="Account number" placeholder="Account number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
              <Button variant="primary" type="button" onClick={saveBank}>💰 Save Bank Details</Button>
            </div>
          </Card>
          
          <Card className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="text-2xl">🕐</div>
              <div>
                <h3 className="m-0 text-lg">Operating Hours</h3>
                <p className="m-0 text-xs text-muted">Set your opening times</p>
              </div>
            </div>
            <div className="card bg-elev">
              {hours.map((h, i) => (
                <div key={h.day_of_week} className="row gap-3 items-center mb-3">
                  <div className="w-20 font-semibold">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][h.day_of_week]}</div>
                  <input className="input w-24" value={h.open_time} onChange={(e) => setHours(prev => prev.map((x, j) => j === i ? { ...x, open_time: e.target.value } : x))} />
                  <span className="text-muted">to</span>
                  <input className="input w-24" value={h.close_time} onChange={(e) => setHours(prev => prev.map((x, j) => j === i ? { ...x, close_time: e.target.value } : x))} />
                </div>
              ))}
              <Button variant="primary" type="button" onClick={saveHours}>🕐 Save Hours</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}