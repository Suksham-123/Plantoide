import { Home, LayoutGrid, Droplets, History } from 'lucide-react';

interface BottomNavProps {
  currentTab: 'home' | 'inventory' | 'history' | 'scheduler' | 'analytics';
  onTabChange: (tab: 'home' | 'inventory' | 'history' | 'scheduler' | 'analytics') => void;
}

export function BottomNav({ currentTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'inventory', icon: LayoutGrid, label: 'Inventory' },
    { id: 'history', icon: History, label: 'History' }, // Added History Tab
    { id: 'scheduler', icon: Droplets, label: 'Scheduler' }
  ] as const;

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      maxWidth: 'var(--max-width)',
      margin: '0 auto',
      backgroundColor: 'var(--color-surface)',
      borderTop: '1px solid var(--color-border)',
      padding: '0.5rem 1rem',
      paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))',
      zIndex: 50,
      boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        maxWidth: '100%',
      }}>
        {tabs.map(({ id, icon: Icon, label }) => {
          const isActive = currentTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.5rem',
                borderRadius: '0.75rem',
                backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                color: isActive ? 'white' : 'var(--color-text-light)',
                transition: 'all 0.2s ease',
                minWidth: '60px',
                flex: 1,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span style={{
                fontSize: '0.625rem',
                fontWeight: isActive ? 600 : 500,
                letterSpacing: '0.025em',
              }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}