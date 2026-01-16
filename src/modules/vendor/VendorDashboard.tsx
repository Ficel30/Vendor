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
      <div className="mb-2">
        <h1 className="mb-1">Vendor Dashboard</h1>
        <p className="text-muted text-sm">Manage your restaurant operations</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-10">
          <div className="text-center">
            <div className="spinner mx-auto mb-4" />
            <div className="text-muted">Loading...</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Quick Stats */}
          <Card className="relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-extrabold mb-1">
                  {stats?.today_orders ?? 0}
                </div>
                <div className="text-muted text-sm">Today's Orders</div>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-500 flex items-center justify-center text-3xl">
                📦
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border">
              <Link to="/vendor/orders" className="btn primary flex justify-center">
                View All Orders →
              </Link>
            </div>
          </Card>

          <Card className="relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-extrabold mb-1">
                  ₦{stats?.today_cents ? (stats.today_cents / 100).toFixed(2) : '0.00'}
                </div>
                <div className="text-muted text-sm">Today's Revenue</div>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-3xl">
                💰
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border">
              <Link to="/vendor/reports" className="btn primary flex justify-center">
                View Reports →
              </Link>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <div className="font-bold text-lg mb-2">Quick Actions</div>
            <div className="flex flex-col gap-2">
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
          <Card className="bg-gradient-to-br from-cyan-400/10 to-cyan-500/5 border-2 border-dashed border-cyan-400/30">
            <div className="text-center p-2">
              <div className="text-4xl mb-3">⚡</div>
              <div className="font-bold mb-2 text-base">Get Started</div>
              <div className="text-muted text-xs mb-4">
                Complete your profile and branding to start receiving orders
              </div>
              <div className="flex gap-2 flex-col">
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