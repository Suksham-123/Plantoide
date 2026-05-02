import { useState } from 'react';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './views/HomeView';
import { ActivityLogView } from './views/ActivityLogView'; // Added Import
import { CatalogView } from './views/CatalogView';
import { DiagnosisView } from './views/DiagnosisView';
import { SchedulerView } from './views/SchedulerView';
import { LoginView, type UserInfo } from './views/LoginView';
import { PermissionsModal } from './components/PermissionsModal';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('username'));
  const [showPermissions, setShowPermissions] = useState(() => {
    return !!localStorage.getItem('username') && !localStorage.getItem('coords');
  });
  
  const [showHint, setShowHint] = useState(false);
  const [currentTab, setCurrentTab] = useState<'home' | 'inventory' | 'history' | 'scheduler' | 'analytics'>('home');
  const [isDiagnosisOpen, setIsDiagnosisOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLocation = (coords: {lat: number, lon: number}) => {
    localStorage.setItem('coords', JSON.stringify(coords));
  };

  const handleLogin = (info: UserInfo) => {
    setIsAuthenticated(true);
    setShowPermissions(true); 
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setCurrentTab('home');
  };

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <TopBar onMenuClick={() => setIsSidebarOpen(true)} />

      <main style={{ 
        flex: 1, 
        backgroundColor: 'white', 
        paddingBottom: '75px', // Fixed padding to ensure visibility above BottomNav
        overflowY: 'auto' 
      }}>
        {currentTab === 'home' && (
          <HomeView 
            onOpenDiagnosis={() => setIsDiagnosisOpen(true)} 
            onNavigate={(tab: any) => setCurrentTab(tab)} 
          />
        )}
        
        {/* Shows ActivityLog whenever 'history' OR 'analytics' is selected */}
        {(currentTab === 'history' || currentTab === 'analytics') && <ActivityLogView />}
        
        {currentTab === 'inventory' && <CatalogView />}
        {currentTab === 'scheduler' && <SchedulerView />}
      </main>

      <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onLogout={handleLogout} 
        onNavigate={setCurrentTab} 
      />

      {isDiagnosisOpen && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100 }}>
          <DiagnosisView onClose={() => setIsDiagnosisOpen(false)} />
        </div>
      )}

      {showPermissions && (
        <PermissionsModal onComplete={() => { setShowPermissions(false); setShowHint(true); }} onLocationGranted={handleLocation} />
      )}

      {showHint && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 90, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '20px', width: '85%', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1rem' }}>Welcome!</h3>
            <button onClick={() => setShowHint(false)} style={{ width: '100%', padding: '0.8rem', backgroundColor: '#003a99', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700 }}>Start Farming</button>
          </div>
        </div>
      )}
    </div>
  );
}