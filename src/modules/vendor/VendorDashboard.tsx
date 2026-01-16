import React from 'react';
import { Card, Button } from '../ui';
import { Link } from 'react-router-dom';
import { apiGet } from '../../api/client';

export function VendorDashboard(): React.ReactElement {
  const vendorId = Number((import.meta as any).env.VITE_VENDOR_ID ?? 1);
  const [stats, setStats] = React.useState<{ today_orders: number; today_cents: number } | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const run = async () => {
      try {
        const data = await apiGet<{ today_orders: number; today_cents: number }>(`/vendors/${vendorId}/stats`);
        setStats(data);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [vendorId]);

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ marginBottom: 4 }}>Vendor Dashboard</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Manage your restaurant operations</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            <div style={{ color: 'var(--muted)' }}>Loading...</div>
          </div>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {/* Quick Stats */}
          <Card style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: '32px', fontWeight: 800, marginBottom: 4 }}>
                  {stats?.today_orders ?? 0}
                </div>
                <div style={{ color: 'var(--muted)', fontSize: '14px' }}>Today's Orders</div>
              </div>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px'
              }}>
                📦
              </div>
            </div>
            <div style={{ marginTop: 12, padding: '12px 0', borderTop: '1px solid var(--border)' }}>
              <Link to="/vendor/orders" className="btn primary" style={{ display: 'flex', justifyContent: 'center' }}>
                View All Orders →
              </Link>
            </div>
          </Card>

          <Card style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: '32px', fontWeight: 800, marginBottom: 4 }}>
                  ₦{stats?.today_cents ? (stats.today_cents / 100).toFixed(2) : '0.00'}
                </div>
                <div style={{ color: 'var(--muted)', fontSize: '14px' }}>Today's Revenue</div>
              </div>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px'
              }}>
                💰
              </div>
            </div>
            <div style={{ marginTop: 12, padding: '12px 0', borderTop: '1px solid var(--border)' }}>
              <Link to="/vendor/reports" className="btn primary" style={{ display: 'flex', justifyContent: 'center' }}>
                View Reports →
              </Link>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <div style={{ fontWeight: 700, fontSize: '18px', marginBottom: 8 }}>Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link to="/vendor/orders" className="btn">
                📋 View Orders
              </Link>
              <Link to="/vendor/menu" className="btn">
                ➕ Create Menu Item
              </Link>
              <Link to="/vendor/reports" className="btn">
                📊 View Reports
              </Link>
            </div>
          </Card>

          {/* Setup Guide */}
          <Card style={{ background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)', border: '2px dashed rgba(34, 211, 238, 0.3)' }}>
            <div style={{ textAlign: 'center', padding: '8px' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚡</div>
              <div style={{ fontWeight: 700, marginBottom: '8px', fontSize: '16px' }}>Get Started</div>
              <div style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '16px' }}>
                Complete your profile and branding to start receiving orders
              </div>
              <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
                <Link to="/vendor/profile" className="btn primary">
                  Complete Profile →
                </Link>
                <Link to="/vendor/branding" className="btn ghost">
                  Upload Branding →
                </Link>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
