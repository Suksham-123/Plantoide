import { useEffect, useState } from 'react';
import { Calendar, MapPin, Leaf, Clock, RefreshCcw } from 'lucide-react';

export function ActivityLogView() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Load from local storage first (for speed), then sync from cloud
    const data = JSON.parse(localStorage.getItem('scanHistory') || '[]');
    setLogs(data);
  }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '100%' }}>
      <h2 style={{ fontWeight: 800, color: '#1b5e20', marginBottom: '20px' }}>Field History</h2>
      {logs.length === 0 ? (
        <p style={{ color: '#64748b', textAlign: 'center', marginTop: '50px' }}>No recent scans found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {logs.map((log: any, i) => (
            <div key={i} style={{ padding: '15px', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Leaf size={18} color="#2e7d32" />
                  <b style={{ fontSize: '1rem' }}>{log.speciesName}</b>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#2e7d32', fontWeight: 700, backgroundColor: '#f0fdf4', padding: '2px 8px', borderRadius: '100px' }}>
                  {log.confidence}% MATCH
                </span>
              </div>
              <div style={{ display: 'flex', gap: '15px', color: '#64748b', fontSize: '0.8rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14}/> {new Date(log.timestamp).toLocaleDateString()}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14}/> {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={14} /> {log.location.latitude.toFixed(4)}, {log.location.longitude.toFixed(4)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}