import React from 'react';

// Button Component
export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'ghost' | 'danger' | 'default' | 'success'; 
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  fullWidth?: boolean;
}): React.ReactElement {
  const { className, variant = 'default', size = 'md', icon, fullWidth, children, ...rest } = props as any;
  const sizeCls = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  const variantCls = variant === 'primary' ? 'primary' : variant === 'ghost' ? 'ghost' : variant === 'danger' ? 'danger' : variant === 'success' ? 'success' : '';
  
  return (
    <button 
      {...rest} 
      className={`btn ${variantCls} ${sizeCls} ${className ?? ''}`}
      style={{ width: fullWidth ? '100%' : undefined, ...rest.style }}
    >
      {icon && <span style={{ marginRight: '4px' }}>{icon}</span>}
      {children}
    </button>
  );
}

// Input Component
export function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { 
  icon?: string;
  label?: string;
  error?: string;
}): React.ReactElement {
  const { icon, label, error, className, ...rest } = props;
  
  return (
    <div style={{ width: '100%' }}>
      {label && <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>
        {label}
      </label>}
      <div style={{ position: 'relative' }}>
        {icon && <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>{icon}</span>}
        <input {...rest} className={`input ${className ?? ''}`} style={{ paddingLeft: icon ? '36px' : undefined }} />
      </div>
      {error && <div style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>{error}</div>}
    </div>
  );
}

// Card Component
export function Card({ children, className }: { children: React.ReactNode; className?: string }): React.ReactElement {
  return <div className={`card ${className ?? ''}`}>{children}</div>;
}

// Table Component
export function Table<T>({ columns, rows, rowKey }: { 
  columns: Array<{ key: keyof T; label: string }>; 
  rows: T[]; 
  rowKey: (r: T) => React.Key;
}): React.ReactElement {
  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>{columns.map(c => <th key={String(c.key)}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={rowKey(r)}>
              {columns.map(c => <td key={String(c.key)}>{String(r[c.key])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Spinner Component
export function Spinner(): React.ReactElement {
  return (
    <div className="row" style={{ justifyContent: 'center', padding: '40px' }}>
      <div className="spinner" />
      <div style={{ marginLeft: '12px', color: 'var(--muted)' }}>Loading…</div>
    </div>
  );
}

// Badge Component
export function Badge({ children, variant }: { children: React.ReactNode; variant: 'success' | 'danger' | 'warning' | 'info' }): React.ReactElement {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

// StatusBadge Component
export function StatusBadge({ status }: { status: string }): React.ReactElement {
  const statusClass = `status-${status.toLowerCase()}`;
  return <span className={`status-badge ${statusClass}`}>{status}</span>;
}

// EmptyState Component
export function EmptyState({ icon = '📭', title, description }: { 
  icon?: string; 
  title: string; 
  description?: string;
}): React.ReactElement {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <div className="empty-state-title">{title}</div>
      {description && <div className="empty-state-text">{description}</div>}
    </div>
  );
}

// LoadingSkeleton Component
export function LoadingSkeleton({ width = '100%', height = '20px', style }: { 
  width?: string; 
  height?: string; 
  style?: React.CSSProperties 
}): React.ReactElement {
  return (
    <div 
      className="skeleton" 
      style={{ width, height, ...style }}
    />
  );
}

// StatCard Component
export function StatCard({ icon, value, label, variant }: { 
  icon: string; 
  value: string | number; 
  label: string; 
  variant?: 'success' | 'danger' | 'warning';
}): React.ReactElement {
  return (
    <div className={`stat-card ${variant ? `stat-${variant}` : ''}`}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}

// Toast
type ToastItem = { id: number; message: string; type?: 'success' | 'error' | 'info' };
const ToastCtx = React.createContext<{ push: (m: string, t?: ToastItem['type']) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [items, setItems] = React.useState<ToastItem[]>([]);
  const push = (message: string, type?: ToastItem['type']) => {
    const id = Date.now();
    setItems(prev => [...prev, { id, message, type }]);
    setTimeout(() => setItems(prev => prev.filter(i => i.id !== id)), 4000);
  };
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div style={{ 
        position: 'fixed', 
        right: 20, 
        bottom: 20, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 12,
        zIndex: 50
      }}>
        {items.map(i => (
          <div 
            key={i.id} 
            className="card" 
            style={{ 
              borderLeft: `4px solid ${i.type === 'error' ? 'var(--danger)' : i.type === 'success' ? 'var(--success)' : 'var(--accent)'}`,
              minWidth: '300px',
              animation: 'slideIn 0.3s ease'
            }}
          >
            <div style={{ 
              fontWeight: 600, 
              marginBottom: i.type ? '4px' : '0',
              fontSize: '14px'
            }}>
              {i.message}
            </div>
            {i.type && (
              <div style={{ 
                fontSize: '12px', 
                color: 'var(--muted)' 
              }}>
                {i.type === 'error' ? '❌ Error' : i.type === 'success' ? '✓ Success' : 'ℹ Info'}
              </div>
            )}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

// TwoColumn Layout Helper
export function TwoColumn({ left, right, gap = 16 }: { left: React.ReactNode; right: React.ReactNode; gap?: number }): React.ReactElement {
  return (
    <div className="two-col-grid" style={{ display: 'grid', gap, gridTemplateColumns: '1fr', alignItems: 'start', width: '100%' }}>
      <div style={{ gridColumn: 'span 1', minWidth: 0 }}>{left}</div>
      <div style={{ gridColumn: 'span 1', minWidth: 0 }}>{right}</div>
      <style>{`
        @media (min-width: 768px) {
          .two-col-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}