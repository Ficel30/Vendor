import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import '../../index.css';
import { useAuth } from '../../auth/AuthContext';
import { apiGet } from '../../api/client';

export function AppLayout(): React.ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const { auth, logout } = useAuth();
  const [theme, setTheme] = React.useState<string>(() => localStorage.getItem('theme') || 'dark');
  const [brand, setBrand] = React.useState<string>(() => localStorage.getItem('brand') || 'brand-odg');
  const [atGlance, setAtGlance] = React.useState<{ today_orders: number; today_cents: number } | null>(null);
  const isActive = (path: string): string => (location.pathname === path || location.pathname.startsWith(path)) ? 'active' : '';
  const isAdmin = auth?.role === 'admin';
  const isVendor = !isAdmin;
  const section = location.pathname.startsWith('/admin') ? 'Admin' : location.pathname.startsWith('/vendor') ? 'Vendor' : 'Dashboard';
  React.useEffect(() => {
    const run = async () => {
      try {
        if (auth?.role !== 'admin') {
          const stored = localStorage.getItem('vendorId');
          const vendorId = stored ? Number(stored) : null;
          if (vendorId) {
            const stats = await apiGet<{ today_orders: number; today_cents: number }>(`/vendors/${vendorId}/stats`);
            setAtGlance({ today_orders: stats.today_orders, today_cents: stats.today_cents });
          }
        }
      } catch {}
    };
    run();
  }, [auth?.role]);

  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') root.classList.add('light'); else root.classList.remove('light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('brand-odg','brand-emerald','brand-indigo');
    root.classList.add(brand);
    localStorage.setItem('brand', brand);
  }, [brand]);
  return (
    <div className="shell">
      <div className="topbar">
        <button className="btn" onClick={() => setOpen(!open)}>☰</button>
        <div className="brand" style={{ flex: 1 }}>ODG Delivery</div>
        {auth?.token && (
          <div className="row">
            <div className="card" style={{ padding: '8px 12px' }}>{auth.role ?? 'user'}</div>
            <select className="btn" value={brand} onChange={(e) => setBrand(e.target.value)}>
              <option value="brand-odg">ODG</option>
              <option value="brand-emerald">Emerald</option>
              <option value="brand-indigo">Indigo</option>
            </select>
            <button className="btn" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? 'Dark' : 'Light'} Mode</button>
            <button className="btn ghost" onClick={() => { logout(); navigate('/login'); }}>Logout</button>
          </div>
        )}
      </div>
      <aside className={`sidebar ${open ? 'open' : ''}`} onClick={() => setOpen(false)}>
        <div className="brand">ODG Delivery</div>
        <div className="row" style={{ gap: 8, marginBottom: 12 }}>
          <select className="btn" value={brand} onChange={(e) => setBrand(e.target.value)}>
            <option value="brand-odg">ODG</option>
            <option value="brand-emerald">Emerald</option>
            <option value="brand-indigo">Indigo</option>
          </select>
          <button className="btn" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? 'Dark' : 'Light'}</button>
        </div>
        <nav className="nav">
          {isVendor && (
            <>
              <Link className={isActive('/vendor') || location.pathname === '/' ? 'active' : ''} to="/vendor">Vendor Dashboard</Link>
              <Link className={isActive('/vendor/orders')} to="/vendor/orders">Orders</Link>
              <Link className={isActive('/vendor/menu')} to="/vendor/menu">Create Menu</Link>
              <Link className={isActive('/vendor/menu-manage')} to="/vendor/menu-manage">Manage Menus</Link>
              <Link className={isActive('/vendor/reports')} to="/vendor/reports">Reports</Link>
              <Link className={isActive('/vendor/profile')} to="/vendor/profile">Profile</Link>
              <Link className={isActive('/vendor/branding')} to="/vendor/branding">Branding</Link>
              <Link className={isActive('/vendor/modifiers')} to="/vendor/modifiers">Modifiers</Link>
              <Link className={isActive('/vendor/feedback')} to="/vendor/feedback">Feedback</Link>
              <Link className={isActive('/vendor/support')} to="/vendor/support">Support</Link>
            </>
          )}
          {isAdmin && (
            <>
              <Link className={isActive('/admin')} to="/admin">Admin Dashboard</Link>
              <Link className={isActive('/admin/users')} to="/admin/users">Users</Link>
              <Link className={isActive('/admin/riders')} to="/admin/riders">Rider Verification</Link>
              <Link className={isActive('/admin/orders')} to="/admin/orders">Orders</Link>
              <Link className={isActive('/admin/campaigns')} to="/admin/campaigns">Campaigns</Link>
              <Link className={isActive('/admin/fees')} to="/admin/fees">Fees</Link>
              <Link className={isActive('/admin/payouts')} to="/admin/payouts">Payouts</Link>
              <Link className={isActive('/admin/refunds')} to="/admin/refunds">Refunds</Link>
              <Link className={isActive('/admin/settings')} to="/admin/settings">Settings</Link>
              <Link className={isActive('/admin/reports')} to="/admin/reports">Reports</Link>
              <Link className={isActive('/admin/zones')} to="/admin/zones">Zones</Link>
            </>
          )}
        </nav>
      </aside>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <header className="card" style={{ position: 'sticky', top: 0, zIndex: 5, borderRadius: 0, borderLeft: 'none', borderRight: 'none', marginBottom: 12 }}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 600 }}>{section} Dashboard</div>
            {isVendor && (
              <div className="row" style={{ gap: 8 }}>
                <Link className="btn ghost" to="/vendor/orders">Quick Orders</Link>
                <Link className="btn ghost" to="/vendor/reports">Quick Reports</Link>
                <button className="btn danger mobile-hide" onClick={() => { logout(); navigate('/login'); }}>Logout</button>
              </div>
            )}
            {isAdmin && (
              <div className="row" style={{ gap: 8 }}>
                <Link className="btn ghost" to="/admin/users">Quick Users</Link>
                <Link className="btn ghost" to="/admin/reports">Quick Reports</Link>
                <button className="btn danger mobile-hide" onClick={() => { logout(); navigate('/login'); }}>Logout</button>
              </div>
            )}
          </div>
        </header>
        <main className="content" onClick={() => setOpen(false)}>
          {/* At a glance - ALWAYS FIRST */}
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>At a glance</div>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div className="card stat">
                <div className="stat-label">Today Orders</div>
                <div className="stat-value">{atGlance ? atGlance.today_orders : '—'}</div>
              </div>
              <div className="card stat">
                <div className="stat-label">Today Sales</div>
                <div className="stat-value">{atGlance ? `₦${(atGlance.today_cents / 100).toFixed(2)}` : '—'}</div>
              </div>
            </div>
            {isVendor && location.pathname === '/vendor/menu' && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, marginBottom: 8, fontSize: '14px' }}>Quick Actions</div>
                <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                  <Link className="btn success" to="/vendor/menu" style={{ fontSize: '12px', padding: '6px 12px' }}>
                    ➕ Create Menu
                  </Link>
                  <Link className="btn ghost" to="/vendor/menu-manage" style={{ fontSize: '12px', padding: '6px 12px' }}>
                    📝 Manage Menus
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Main page content */}
          <div>
            <Outlet />
          </div>
        </main>
        <footer className="card" style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none' }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div>© {new Date().getFullYear()} ODG Delivery</div>
            <div className="row" style={{ gap: 8 }}>
              <a href="#about">About</a>
              <a href="#help">Help</a>
              <a href="#privacy">Privacy</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}


