import React from 'react';
import { Link } from 'react-router-dom';
import { apiGet } from '../../api/client';
import { Card, Spinner, StatCard, EmptyState } from '../ui';

export function AdminDashboard(): React.ReactElement {
  const [stats, setStats] = React.useState<{
    totalUsers: number;
    totalOrders: number;
    pendingRiderVerifications: number;
    todayOrders: number;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const users = await apiGet<any[]>('/admin/users');
        const orders = await apiGet<any[]>('/admin/orders');
        const riders = await apiGet<any[]>('/admin/riders/pending');
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        setStats({
          totalUsers: users.length,
          totalOrders: orders.length,
          pendingRiderVerifications: riders.length,
          todayOrders: orders.filter((o: any) => new Date(o.created_at) >= today).length,
        });
      } catch (error) {
        console.error('Failed to load stats:', error);
        setStats({
          totalUsers: 0,
          totalOrders: 0,
          pendingRiderVerifications: 0,
          todayOrders: 0,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="mb-6">Admin Dashboard</h1>
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2">
        <h1 className="mb-1">Dashboard</h1>
        <p className="text-muted text-sm">Welcome to ODG Delivery Admin Panel</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard 
          icon="👥" 
          value={stats?.totalUsers ?? 0} 
          label="Total Users" 
        />
        <StatCard 
          icon="📦" 
          value={stats?.totalOrders ?? 0} 
          label="Total Orders"
          variant="success"
        />
        <StatCard 
          icon="📊" 
          value={stats?.todayOrders ?? 0} 
          label="Today's Orders"
          variant="success"
        />
        <StatCard 
          icon="🔍" 
          value={stats?.pendingRiderVerifications ?? 0} 
          label="Pending Verifications"
          variant="warning"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="relative">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-500 flex items-center justify-center text-2xl">
                👥
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-lg">User Management</h3>
                <p className="text-muted mb-4 text-sm">
                  Manage users, roles, and permissions across the platform
                </p>
                <Link to="/admin/users" className="btn primary inline-flex">
                  Manage Users →
                </Link>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-2xl">
                ✅
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-lg">Rider Verification</h3>
                <p className="text-muted mb-4 text-sm">
                  Review and approve rider documents and applications
                </p>
                <Link to="/admin/riders" className="btn primary inline-flex">
                  Verify Riders →
                </Link>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-2xl">
                📦
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-lg">Order Management</h3>
                <p className="text-muted mb-4 text-sm">
                  Monitor and manage all orders in real-time
                </p>
                <Link to="/admin/orders" className="btn primary inline-flex">
                  View Orders →
                </Link>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-2xl">
                💬
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-lg">Support Inbox</h3>
                <p className="text-muted mb-4 text-sm">
                  View and respond to customer support messages
                </p>
                <Link to="/admin/support" className="btn primary inline-flex">
                  View Support →
                </Link>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-2xl">
                📊
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-lg">Reports</h3>
                <p className="text-muted mb-4 text-sm">
                  View analytics, insights, and detailed reports
                </p>
                <Link to="/admin/reports" className="btn primary inline-flex">
                  View Reports →
                </Link>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-2xl">
                ⚙️
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-lg">Settings</h3>
                <p className="text-muted mb-4 text-sm">
                  Configure system settings and preferences
                </p>
                <Link to="/admin/settings" className="btn primary inline-flex">
                  Edit Settings →
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}