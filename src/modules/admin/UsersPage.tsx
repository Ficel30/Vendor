import React from 'react';
import { apiGet, apiPost } from '../../api/client';
import { Button, Card, Spinner, Input, useToast, StatusBadge, EmptyState } from '../ui';

export function UsersPage(): React.ReactElement {
  const { push } = useToast();
  const [users, setUsers] = React.useState<Array<{ id: number; name: string; email: string; phone: string; role: string; is_verified: number }>>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [q, setQ] = React.useState('');

  React.useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const data = await apiGet<typeof users>('/admin/users');
        setUsers(data);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await apiGet<typeof users>('/admin/users');
      setUsers(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  async function activate(id: number, active: boolean) {
    try { 
      await apiPost(`/admin/users/${id}/${active ? 'activate' : 'deactivate'}`, {}); 
      push(`User ${active ? 'activated' : 'deactivated'} successfully`, 'success'); 
      load(); 
    } catch (err: any) { 
      push(err?.message ?? 'Failed', 'error'); 
    }
  }

  async function resetPassword(id: number) {
    try { 
      await apiPost(`/admin/users/${id}/reset-password`, {}); 
      push('Password reset email sent', 'success'); 
    } catch (err: any) { 
      push(err?.message ?? 'Failed', 'error'); 
    }
  }

  async function remove(id: number) {
    if (!confirm('Delete this user?')) return;
    try { 
      await fetch(`/admin/users/${id}`, { method: 'DELETE' }); 
      push('User deleted', 'success'); 
      load(); 
    } catch (err: any) { 
      push(err?.message ?? 'Failed', 'error'); 
    }
  }

  const filtered = users.filter(u => `${u.name} ${u.email ?? ''} ${u.phone ?? ''} ${u.role}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ marginBottom: 4 }}>Users</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Manage all platform users</p>
      </div>
      
      {loading && <Spinner />}
      {error && <Card><div style={{ color: 'var(--danger)', padding: '12px' }}>{error}</div></Card>}
      
      {!loading && !error && (
        <>
          <div className="row" style={{ marginBottom: 20 }}>
            <Input 
              placeholder="🔍 Search users..." 
              value={q} 
              onChange={(e) => setQ(e.target.value)}
              style={{ maxWidth: '520px' }}
            />
            <div style={{ color: 'var(--muted)', fontSize: '14px' }}>
              {filtered.length} {filtered.length === 1 ? 'user' : 'users'} found
            </div>
          </div>
          
          {filtered.length === 0 ? (
            <EmptyState 
              icon="👥" 
              title="No users found" 
              description={q ? "Try adjusting your search" : "No users in the system yet"}
            />
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id}>
                      <td><strong>#{u.id}</strong></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ 
                            width: '32px', 
                            height: '32px', 
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '12px'
                          }}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          {u.name}
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>{u.phone || '—'}</td>
                      <td>
                        <span style={{ 
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: u.role === 'admin' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                          color: u.role === 'admin' ? '#8b5cf6' : '#3b82f6'
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={u.is_verified === 1 ? 'verified' : 'pending'} />
                      </td>
                      <td>
                        <div className="row action-buttons" style={{ gap: '6px' }}>
                          <Button size="sm" onClick={() => activate(u.id, true)}>✓ Activate</Button>
                          <Button size="sm" variant="danger" onClick={() => activate(u.id, false)}>✗ Deactivate</Button>
                          <Button size="sm" variant="ghost" onClick={() => resetPassword(u.id)}>🔑</Button>
                          <Button size="sm" variant="danger" onClick={() => remove(u.id)}>🗑️</Button>
                        </div>
                        <style>{`
                          .action-buttons {
                            flex-wrap: nowrap !important;
                          }
                          @media (max-width: 768px) {
                            .action-buttons {
                              flex-direction: row !important;
                            }
                            .action-buttons button {
                              font-size: 11px;
                              padding: 6px 10px;
                              white-space: nowrap;
                            }
                          }
                        `}</style>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
