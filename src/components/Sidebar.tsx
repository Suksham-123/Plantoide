import { React, useEffect, useState } from 'react';
import {
  X, User, Settings, Bell, Sprout, BarChart2,
  Camera, LogOut, ChevronRight, Leaf, Shield, LayoutDashboard, BarChart3, Package, Clock, HelpCircle
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onNavigate: (tab: 'home' | 'inventory' | 'analytics' | 'scheduler') => void;
}

// Added a safety check to menu items
const menuItems: { icon: any, label: string, tab: 'home' | 'inventory' | 'analytics' | 'scheduler' }[] = [
  { icon: LayoutDashboard, label: 'Dashboard', tab: 'home' },
  { icon: Package, label: 'Inventory', tab: 'inventory' },
  { icon: Clock, label: 'Schedulers', tab: 'scheduler' },
];

export function Sidebar({ isOpen, onClose, onLogout, onNavigate }: SidebarProps) {
  // Use data from LoginView localStorage keys
  const [scanCount, setScanCount] = useState(0);

  useEffect(() => {
    setScanCount(parseInt(localStorage.getItem('scan_count') ?? '0', 10));
  }, []);

  const name = localStorage.getItem('username') || '';
  const email = localStorage.getItem('userEmail') || '';
  const farmName = localStorage.getItem('farmName') || '';

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 40,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'all' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Panel */}
      <aside style={{
        position: 'absolute', top: 0, left: 0, bottom: 0,
        width: '82%',
        maxWidth: '320px',
        backgroundColor: 'var(--color-surface)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--color-primary) 0%, #003a99 100%)',
          padding: '2.5rem 1.5rem 2rem',
          position: 'relative',
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '1.25rem', right: '1.25rem',
              color: 'rgba(255,255,255,0.7)',
              padding: '4px',
              background: 'none', border: 'none'
            }}
          >
            <X size={22} />
          </button>

          <div style={{
            width: '64px', height: '64px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            border: '2px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1rem',
          }}>
            <User size={32} color="white" />
          </div>

          <h2 style={{ color: 'white', fontSize: '1.125rem', margin: '0 0 0.25rem', fontWeight: 700 }}>
            {name}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', margin: '0 0 1rem' }}>
            {email}
          </p>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: '100px',
            padding: '4px 12px',
          }}>
            <Leaf size={12} color="rgba(255,255,255,0.8)" />
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
              {farmName}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--color-border)',
          gap: '0.5rem',
        }}>
          {[
            { value: String(scanCount), label: 'Scans' },
            { value: '0', label: 'Alerts' },
          ].map(({ value, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                {value}
              </div>
              <div style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Menu Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0.75rem 0' }}>
          {menuItems.map((item, i) => {
            // Defensive check: if icon is missing, use HelpCircle instead of crashing
            const IconComponent = item?.icon || HelpCircle;
            return (
              <button
                key={i}
                onClick={() => {
                  onNavigate(item.tab);
                  onClose();
                }}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center',
                  padding: '0.875rem 1.5rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--color-neutral)',
                  textAlign: 'left',
                }}
              >
                <IconComponent size={20} color="var(--color-text-light)" style={{ marginRight: '1rem' }} />
                <div style={{ flex: 1, fontSize: '1rem', fontWeight: 600 }}>{item.label}</div>
                <ChevronRight size={18} color="var(--color-border)" />
              </button>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div style={{ marginTop: 'auto', padding: '1rem 1.5rem 2rem', borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={onLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.875rem 1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.06)',
              borderRadius: '12px',
              color: '#EF4444', fontWeight: 600,
              border: 'none', cursor: 'pointer',
            }}>
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}