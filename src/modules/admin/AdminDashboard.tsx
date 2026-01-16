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
        <h1 style={{ marginBottom: 24 }}>Admin Dashboard</h1>
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ marginBottom: 4 }}>Dashboard</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Welcome to ODG Delivery Admin Panel</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 24 }}>
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
          variant="info"
        />
        <StatCard 
          icon="🔍" 
          value={stats?.pendingRiderVerifications ?? 0} 
          label="Pending Verifications"
          variant="warning"
        />
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 16 }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          <Card style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
              <div style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px'
              }}>
                👥
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ marginBottom: 8, fontSize: '18px' }}>User Management</h3>
                <p style={{ color: 'var(--muted)', marginBottom: 16, fontSize: '14px' }}>
                  Manage users, roles, and permissions across the platform
                </p>
                <Link to="/admin/users" className="btn primary" style={{ display: 'inline-flex' }}>
                  Manage Users →
                </Link>
              </div>
            </div>
          </Card>
          
          <Card>
            <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
              <div style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px'
              }}>
                ✅
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ marginBottom: 8, fontSize: '18px' }}>Rider Verification</h3>
                <p style={{ color: 'var(--muted)', marginBottom: 16, fontSize: '14px' }}>
                  Review and approve rider documents and applications
                </p>
                <Link to="/admin/riders" className="btn primary" style={{ display: 'inline-flex' }}>
                  Verify Riders →
                </Link>
              </div>
            </div>
          </Card>
          
          <Card>
            <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
              <div style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px'
              }}>
                📦
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ marginBottom: 8, fontSize: '18px' }}>Order Management</h3>
                <p style={{ color: 'var(--muted)', marginBottom: 16, fontSize: '14px' }}>
                  Monitor and manage all orders in real-time
                </p>
                <Link to="/admin/orders" className="btn primary" style={{ display: 'inline-flex' }}>
                  View Orders →
                </Link>
              </div>
            </div>
          </Card>
          
          <Card>
            <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
              <div style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px'
              }}>
                💬
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ marginBottom: 8, fontSize: '18px' }}>Support Inbox</h3>
                <p style={{ color: 'var(--muted)', marginBottom: 16, fontSize: '14px' }}>
                  View and respond to customer support messages
                </p>
                <Link to="/admin/support" className="btn primary" style={{ display: 'inline-flex' }}>
                  View Support →
                </Link>
              </div>
            </div>
          </Card>
          
          <Card>
            <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
              <div style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px'
              }}>
                📊
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ marginBottom: 8, fontSize: '18px' }}>Reports</h3>
                <p style={{ color: 'var(--muted)', marginBottom: 16, fontSize: '14px' }}>
                  View analytics, insights, and detailed reports
                </p>
                <Link to="/admin/reports" className="btn primary" style={{ display: 'inline-flex' }}>
                  View Reports →
                </Link>
              </div>
            </div>
          </Card>
          
          <Card>
            <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
              <div style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px'
              }}>
                ⚙️
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ marginBottom: 8, fontSize: '18px' }}>Settings</h3>
                <p style={{ color: 'var(--muted)', marginBottom: 16, fontSize: '14px' }}>
                  Configure system settings and preferences
                </p>
                <Link to="/admin/settings" className="btn primary" style={{ display: 'inline-flex' }}>
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
