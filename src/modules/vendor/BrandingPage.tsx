import React from 'react';
import { apiGet, apiPost } from '../../api/client';
import { Button, Card, Input, Spinner, useToast } from '../ui';

export function BrandingPage(): React.ReactElement {
  const vendorId = Number((import.meta as any).env.VITE_VENDOR_ID ?? 1);
  const { push } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [logoUrl, setLogoUrl] = React.useState('');
  const [bannerUrl, setBannerUrl] = React.useState('');

  const fetchBranding = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<{ vendor_id: number; logo_url: string | null; banner_url: string | null } | null>(`/vendors/${vendorId}/branding`);
      if (data) {
        setLogoUrl(data.logo_url ?? '');
        setBannerUrl(data.banner_url ?? '');
      }
    } catch (e: any) {
      setError(e?.message ?? 'Failed to fetch branding');
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  React.useEffect(() => {
    fetchBranding();
  }, [fetchBranding]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiPost('/vendors/branding', { vendorId, logo_url: logoUrl || null, banner_url: bannerUrl || null });
      push('Branding saved', 'success');
    } catch (err: any) {
      push(err?.message ?? 'Failed to save branding', 'error');
    }
  };

  return (
    <div>
      <h3>Branding</h3>
      {loading && <Spinner />}
      {error && <Card><div style={{ color: 'var(--danger)' }}>{error}</div></Card>}
      {!loading && (
        <form onSubmit={onSave} className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
          <div className="card">
            <p>Logo URL</p>
            <Input placeholder="https://..." value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
            {logoUrl && <img src={logoUrl} alt="logo" style={{ marginTop: 8, maxWidth: '100%', height: 80, objectFit: 'contain' }} />}
          </div>
          <div className="card">
            <p>Banner URL</p>
            <Input placeholder="https://..." value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} />
            {bannerUrl && <img src={bannerUrl} alt="banner" style={{ marginTop: 8, width: '100%', height: 120, objectFit: 'cover' }} />}
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <Button type="submit">Save</Button>
          </div>
        </form>
      )}
    </div>
  );
}


