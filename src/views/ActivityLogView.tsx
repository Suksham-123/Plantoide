import { useState, useEffect } from 'react';
import { Leaf, Calendar, Clock, MapPin, ChevronRight, Info } from 'lucide-react';
import { getWeedInfo } from '../lib/weedDatabase';
import { WeedInfoPanel } from './DiagnosisView'; // Import the panel you exported
import type { WeedHistoryEntry } from './DiagnosisView';

export function ActivityLogView() {
  const [logs, setLogs] = useState<WeedHistoryEntry[]>([]);
  const [selectedLog, setSelectedLog] = useState<WeedHistoryEntry | null>(null);

  useEffect(() => {
    // Reads the scans you saved in DiagnosisView
    const data = JSON.parse(localStorage.getItem('scanHistory') || '[]');
    setLogs(data);
  }, []);

  // Helper to format the ISO timestamp
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString();
  };

  return (
    <div style={{ padding: '1.25rem', paddingBottom: '90px' }}>
      <h2 style={{ color: '#1a472a', marginBottom: '1.5rem', fontWeight: 800 }}>Field History</h2>

      {logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#666' }}>
          <Info size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <p>No scans recorded yet. Start scanning to build your history.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {logs.map((log, i) => (
            <button
              key={i}
              onClick={() => setSelectedLog(log)} // Opens the info sheet on click
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '1rem',
                backgroundColor: 'white',
                borderRadius: '16px',
                border: '1px solid #edf2f7',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                textAlign: 'left',
                width: '100%',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ padding: '0.5rem', backgroundColor: '#f0fdf4', borderRadius: '10px' }}>
                    <Leaf size={18} color="#22c55e" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: '#1a202c' }}>{log.speciesName}</h3>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#22c55e' }}>
                      {log.confidence}% MATCH
                    </span>
                  </div>
                </div>
                <ChevronRight size={18} color="#cbd5e0" />
              </div>

              <div style={{ 
                marginTop: '1rem', 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '0.5rem',
                borderTop: '1px solid #f7fafc',
                paddingTop: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#718096', fontSize: '0.75rem' }}>
                  <Calendar size={12} /> {formatDate(log.timestamp)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#718096', fontSize: '0.75rem' }}>
                  <Clock size={12} /> {formatTime(log.timestamp)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#718096', fontSize: '0.75rem', gridColumn: 'span 2' }}>
                  <MapPin size={12} /> {log.location.latitude.toFixed(4)}, {log.location.longitude.toFixed(4)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ══ THE INFO SHEET ══ */}
      {selectedLog && (() => {
        const info = getWeedInfo(selectedLog.speciesName);
        return info ? (
          <WeedInfoPanel
            info={info}
            det={{ 
              label: selectedLog.speciesName, 
              confidence: parseFloat(selectedLog.confidence) / 100,
              bbox: { x1:0, y1:0, x2:0, y2:0 },
              rawLabel: ''
            }}
            onClose={() => setSelectedLog(null)}
          />
        ) : null;
      })()}
    </div>
  );
}