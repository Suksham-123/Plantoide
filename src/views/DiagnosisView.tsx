import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle, Leaf, ScanLine, Video, X, ChevronDown,
  Info, MapPin, Shield, CheckCircle2, Sprout, FlaskConical
} from 'lucide-react';
import type { Detection } from '../lib/yoloInference';
import { DISPLAY_THRESHOLD, loadModel, runYOLO } from '../lib/yoloInference';
import { getWeedInfo, RISK_META, type WeedInfo } from '../lib/weedDatabase';

// ─── Types ────────────────────────────────────────────────────────────────────
interface DiagnosisViewProps { onClose: () => void; }


export interface WeedHistoryEntry {
  userId: string | null;
  speciesName: string;
  confidence: string;
  status: string;
  timestamp: string; // ISO format: YYYY-MM-DDTHH:mm:ssZ
  location: { latitude: number; longitude: number };
}
/**
 * Phase machine:
 *  model_loading → live → (scan button) → scanning → frozen
 *  frozen → (go live button) → live
 */
type Phase = 'model_loading' | 'live' | 'scanning' | 'frozen';

// ─── Constants ────────────────────────────────────────────────────────────────
const LIVE_INTERVAL_MS = 2500;
const API_BASE_URL = 'https://plantoide-backend.onrender.com';

// ─── Helpers ──────────────────────────────────────────────────────────────────
/**
 * Paint detection bounding boxes on a canvas overlay.
 * fitMode controls how box coords (in original frame space) map to display coords.
 *   'cover'   → video fills container, some edges may be cropped
 *   'contain' → frozen image shows fully, letterboxed
 */
function paintBoxes(
  canvas: HTMLCanvasElement,
  dets: Detection[],
  srcW: number, srcH: number,
  fitMode: 'cover' | 'contain',
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!dets.length || !srcW || !srcH) return;

  const cW = canvas.width, cH = canvas.height;
  const scale = fitMode === 'cover'
    ? Math.max(cW / srcW, cH / srcH)
    : Math.min(cW / srcW, cH / srcH);
  const ox = (cW - srcW * scale) / 2;
  const oy = (cH - srcH * scale) / 2;

  for (const det of dets) {
    const ok    = det.label !== 'Unidentified';
    const color = ok ? '#22c55e' : '#f59e0b';
    const { x1, y1, x2, y2 } = det.bbox;

    const bx = ox + x1 * scale;
    const by = oy + y1 * scale;
    const bw = (x2 - x1) * scale;
    const bh = (y2 - y1) * scale;
    const cs = Math.min(bw, bh, 18);

    // Translucent fill
    ctx.fillStyle = ok ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)';
    ctx.fillRect(bx, by, bw, bh);

    // Box outline
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, bw, bh);

    // Corner accents
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(bx,      by + cs);  ctx.lineTo(bx,    by);    ctx.lineTo(bx + cs,    by);
    ctx.moveTo(bx+bw-cs, by);      ctx.lineTo(bx+bw, by);    ctx.lineTo(bx+bw,      by+cs);
    ctx.moveTo(bx+bw,   by+bh-cs); ctx.lineTo(bx+bw, by+bh); ctx.lineTo(bx+bw-cs,  by+bh);
    ctx.moveTo(bx+cs,   by+bh);    ctx.lineTo(bx,    by+bh); ctx.lineTo(bx,         by+bh-cs);
    ctx.stroke();

    // Label chip
    const txt = `${det.label}  ${(det.confidence * 100).toFixed(0)}%`;
    ctx.font = 'bold 12px "Public Sans", sans-serif';
    const tw   = ctx.measureText(txt).width + 12;
    const chipY = by > 28 ? by - 24 : by + bh + 4;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(bx, chipY, tw, 22, 4);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText(txt, bx + 6, chipY + 15);
  }
}

// 1. Changed to 'export' so ActivityLogView can use it
// 2. Changed 'det' type to 'any' to support history scans
export function WeedInfoPanel({ info, det, onClose }: { info: WeedInfo; det: any; onClose: () => void }) {
  const risk = RISK_META[info.riskLevel];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      />

      {/* Sheet */}
      <div style={{
        position: 'relative',
        backgroundColor: '#0d0d0d',
        borderRadius: '24px 24px 0 0',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '0 0 calc(env(safe-area-inset-bottom) + 1.5rem)',
        maxHeight: '85vh',
        overflowY: 'auto',
        animation: 'slideUp 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        
        {/* ══ NEW: REAL FIELD IMAGE HEADER ══ */}
        <div style={{ position: 'relative', width: '100%', height: '220px', overflow: 'hidden' }}>
          <img 
            src={info.image} // This pulls from your updated WEED_DATABASE
            alt={info.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/400x220?text=Field+Photo+Unavailable')}
          />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '2rem 1.25rem 0.5rem',
            background: 'linear-gradient(to top, #0d0d0d, transparent)',
          }}>
            <span style={{ 
              backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.65rem', 
              padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>
              Real Field Appearance
            </span>
          </div>
        </div>

        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0.75rem 0 0.5rem' }}>
          <div style={{ width: '40px', height: '4px', borderRadius: '2px', backgroundColor: 'rgba(255,255,255,0.2)' }} />
        </div>

        {/* Header Information */}
        <div style={{ padding: '0.5rem 1.25rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{info.icon}</span>
                <h2 style={{ color: '#fff', fontSize: '1.2rem', margin: 0, fontFamily: 'Manrope, sans-serif' }}>
                  {info.name}
                </h2>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', margin: 0, fontStyle: 'italic' }}>
                {info.scientificName}
              </p>
            </div>
            <button onClick={onClose} style={iconBtn}><X size={18} /></button>
          </div>

          {/* Risk + Confidence Row */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              backgroundColor: risk.bg, color: risk.color,
              borderRadius: '100px', padding: '4px 12px', fontSize: '0.72rem', fontWeight: 700,
              border: `1px solid ${risk.color}40`,
            }}>
              <Shield size={11} /> {risk.label}
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e',
              borderRadius: '100px', padding: '4px 12px', fontSize: '0.72rem', fontWeight: 700,
              border: '1px solid rgba(34,197,94,0.3)',
            }}>
              <FlaskConical size={11} /> 
              {/* Handles both '0.85' from live and '85' from history logs */}
              {typeof det.confidence === 'string' ? det.confidence : (det.confidence * 100).toFixed(0)}% Match
            </span>
          </div>
        </div>

        {/* ══ THE CONTENT SECTIONS (YOUR SNIPPET) ══ */}
        <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <InfoSection icon={<Info size={15} color="#7dd3fc" />} title="About this plant" color="#7dd3fc">
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', lineHeight: 1.65, margin: 0 }}>
              {info.description}
            </p>
          </InfoSection>

          <InfoSection icon={<Sprout size={15} color="#86efac" />} title="Visual Identification" color="#86efac">
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', lineHeight: 1.65, margin: 0 }}>
              {info.visualTraits}
            </p>
          </InfoSection>

          <InfoSection icon={<AlertTriangle size={15} color={risk.color} />} title="Crop Impact" color={risk.color}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', lineHeight: 1.65, margin: 0 }}>
              {info.cropImpact}
            </p>
          </InfoSection>

          <InfoSection icon={<MapPin size={15} color="#f9a8d4" />} title="Typical Habitat" color="#f9a8d4">
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', lineHeight: 1.65, margin: 0 }}>
              {info.habitat}
            </p>
          </InfoSection>

          <InfoSection icon={<CheckCircle2 size={15} color="#a5f3fc" />} title="Control & Management" color="#a5f3fc">
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {info.controlMethods.map((method, i) => (
                <li key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                  <span style={{
                    flexShrink: 0, marginTop: '2px', width: '18px', height: '18px', borderRadius: '50%',
                    backgroundColor: 'rgba(165,243,252,0.12)', color: '#a5f3fc', fontSize: '0.65rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', lineHeight: 1.6 }}>
                    {method}
                  </span>
                </li>
              ))}
            </ul>
          </InfoSection>
        </div>
      </div>
    </div>
  );
}

function InfoSection({
  icon, title, color, children
}: { icon: React.ReactNode; title: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.07)',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.6rem 0.9rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backgroundColor: 'rgba(255,255,255,0.03)',
      }}>
        {icon}
        <span style={{ color, fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {title}
        </span>
      </div>
      <div style={{ padding: '0.75rem 0.9rem' }}>
        {children}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function DiagnosisView({ onClose }: DiagnosisViewProps) {
  // DOM refs
  const videoRef   = useRef<HTMLVideoElement>(null);
  const snapRef    = useRef<HTMLCanvasElement>(null);   // hidden – capture
  const overlayRef = useRef<HTMLCanvasElement>(null);   // visible – boxes
  const streamRef  = useRef<MediaStream | null>(null);

  // Async state guards (avoid stale closures / post-unmount setState)
  const mountedRef    = useRef(true);
  const busyRef       = useRef(false);
  const liveTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs for values needed inside callbacks without re-creating them
  const phaseRef      = useRef<Phase>('model_loading');
  const detsRef       = useRef<Detection[]>([]);
  const frozenDimsRef = useRef({ w: 0, h: 0 });

  // React state (drives renders)
  const [phase,      setPhase]      = useState<Phase>('model_loading');
  const [modelError, setModelError] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [frozenImg,  setFrozenImg]  = useState<string | null>(null);
  const [selectedDet, setSelectedDet] = useState<Detection | null>(null);

  const userId = localStorage.getItem('currentUserId') ?? 'guest_user';

  // Keep refs in sync with state (synchronous, no render cost)
  phaseRef.current = phase;
  detsRef.current  = detections;

  // ── Live inference loop ───────────────────────────────────────────────────
  // Uses only refs — stable reference (empty useCallback deps).
  const startLiveLoop = useCallback(() => {
    if (liveTimerRef.current) clearTimeout(liveTimerRef.current);

    const tick = async () => {
      if (!mountedRef.current || phaseRef.current !== 'live') return;

      const vid     = videoRef.current;
      const snap    = snapRef.current;
      const overlay = overlayRef.current;

      if (!busyRef.current && vid && snap && overlay && vid.readyState >= 2 && vid.videoWidth > 0) {
        busyRef.current = true;
        try {
          snap.width  = vid.videoWidth;
          snap.height = vid.videoHeight;
          snap.getContext('2d')!.drawImage(vid, 0, 0);

          const dets = await runYOLO(snap);

          // Guard: phase may have changed during async inference
          if (!mountedRef.current || phaseRef.current !== 'live') {
            busyRef.current = false;
            return;
          }

          setDetections(dets);
          detsRef.current = dets;
          paintBoxes(overlay, dets, vid.videoWidth, vid.videoHeight, 'cover');
        } catch (e) {
          console.error('[Live inference]', e);
        } finally {
          busyRef.current = false;
        }
      }

      // Schedule next tick only if still in live phase
      if (mountedRef.current && phaseRef.current === 'live') {
        liveTimerRef.current = setTimeout(tick, LIVE_INTERVAL_MS);
      }
    };

    liveTimerRef.current = setTimeout(tick, 600); // brief delay for video stabilisation
  }, []);

  // ── Mount / unmount ───────────────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;

    // Load ONNX model
    loadModel()
      .then(() => {
        if (!mountedRef.current) return;
        setPhase('live');
        phaseRef.current = 'live';
        startLiveLoop();
      })
      .catch(() =>
        setModelError('Could not load AI model.\nEnsure best.onnx is in public/models/'),
      );

    // Start camera
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      .then((stream) => {
        if (!mountedRef.current) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        const vid = videoRef.current;
        if (vid) {
          vid.srcObject = stream;
          vid.onloadedmetadata = () => vid.play().catch(() => {});
        }
      })
      .catch(() => alert('Camera error: please grant camera permissions.'));

    return () => {
      mountedRef.current = false;
      if (liveTimerRef.current) clearTimeout(liveTimerRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [startLiveLoop]);

  // ── Overlay canvas ResizeObserver ─────────────────────────────────────────
  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      el.width  = el.clientWidth;
      el.height = el.clientHeight;
      const vid  = videoRef.current;
      const dims = frozenDimsRef.current;
      if (!vid) return;

      if (phaseRef.current === 'frozen' && dims.w > 0) {
        // Repaint at new size using contain transform (frozen image)
        paintBoxes(el, detsRef.current, dims.w, dims.h, 'contain');
      } else if (phaseRef.current === 'live') {
        // Repaint at new size using cover transform (live video)
        paintBoxes(el, detsRef.current, vid.videoWidth, vid.videoHeight, 'cover');
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []); // intentionally empty — all values come from refs

  // ── Scan button: freeze current frame ────────────────────────────────────
  // ── Scan button: freeze current frame ────────────────────────────────────
// ─── 5. HANDLE SCAN (Cleaned & Corrected) ──────────────────
const handleScan = useCallback(async () => {
    if (busyRef.current || phaseRef.current !== 'live') return;
    if (liveTimerRef.current) clearTimeout(liveTimerRef.current);

    busyRef.current = true;
    setPhase('scanning');
    phaseRef.current = 'scanning';

    const vid = videoRef.current;
    const snap = snapRef.current;
    if (!vid || !snap) {
      busyRef.current = false;
      return;
    }

    snap.width = vid.videoWidth;
    snap.height = vid.videoHeight;
    snap.getContext('2d')?.drawImage(vid, 0, 0);

    try {
      // 1. Run the AI inference
      const results = await runYOLO(snap); 
      
      setFrozenImg(snap.toDataURL('image/jpeg', 0.92));
      setDetections(results);
      setPhase('frozen');
      phaseRef.current = 'frozen';

      const overlay = overlayRef.current;
      if (overlay) {
        overlay.getContext('2d')?.clearRect(0, 0, overlay.width, overlay.height);
        paintBoxes(overlay, results, snap.width, snap.height, 'contain');
      }

      // 2. TRIGGER SYNC FOR ALL RESULTS (Identified & Unidentified)
      if (results.length > 0) {
        results.forEach(det => {
          saveToBackend(det); // This loops through every box found
        });
      }
    } catch (e) {
      console.error('[Scan error]', e);
    } finally {
      busyRef.current = false;
    }
  }, [userId]);
  // ── Go back to live mode ──────────────────────────────────────────────────
  const goLive = useCallback(() => {
    setFrozenImg(null);
    setDetections([]);
    setSelectedDet(null);
    detsRef.current = [];
    overlayRef.current
      ?.getContext('2d')
      ?.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
    setPhase('live');
    phaseRef.current = 'live';
    startLiveLoop();
  }, [startLiveLoop]);

  const saveToBackend = (det: Detection) => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      // payload must match the schema seen in image_a30eff.png
      const payload = {
        userId: localStorage.getItem('currentUserId') || '69de1292ca72ba5e15aceale', 
        detectedSpecies: det.label,
        confidenceScore: det.confidence, // DB expects a number, not a string
        location: { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
        status: "weed", 
        timestamp: new Date().toISOString(),
        isManuallyLabeled: false,
        manualLabelName: ""
      };

      try {
        await fetch(`${API_BASE_URL}/api/detections`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        // Update local Field History (as seen in WhatsApp Image 2026-05-02 at 21.09.34.jpeg)
        const historyItem: WeedHistoryEntry = {
          userId: payload.userId,
          speciesName: det.label,
          confidence: (det.confidence * 100).toFixed(0),
          status: 'Recognized',
          timestamp: payload.timestamp,
          location: payload.location
        };

        const existing = JSON.parse(localStorage.getItem('scanHistory') || '[]');
        localStorage.setItem('scanHistory', JSON.stringify([historyItem, ...existing].slice(0, 30)));
        
        // Update home screen counter
        const currentCount = parseInt(localStorage.getItem('scan_count') || '0');
        localStorage.setItem('scan_count', (currentCount + 1).toString());

      } catch (e) {
        console.warn("MongoDB sync failed, saved to local history only.");
      }
    });
  };

  // ── Derived booleans for readability ─────────────────────────────────────
  const isLive     = phase === 'live';
  const isFrozen   = phase === 'frozen';
  const isScanning = phase === 'scanning';
  const isLoading  = phase === 'model_loading';

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: '#000',
      zIndex: 100,
      display: 'flex', flexDirection: 'column',
      fontFamily: 'var(--font-body, sans-serif)',
    }}>

      {/* ══ CAMERA AREA ═══════════════════════════════════════════════════════ */}
      <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>

        {/* Live video — always playing, hidden in frozen mode */}
        <video
          ref={videoRef} autoPlay playsInline muted
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover',
            visibility: isFrozen ? 'hidden' : 'visible',
          }}
        />

        {/* Frozen image — shown after scan, full image visible (contain) */}
        {frozenImg && (
          <img
            src={frozenImg} alt="Captured frame"
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'contain',
              backgroundColor: '#000',
              display: isFrozen ? 'block' : 'none',
            }}
          />
        )}

        {/* Bounding box overlay — always on top, uses cover (live) or contain (frozen) */}
        <canvas
          ref={overlayRef}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        />

        {/* Hidden frame-capture canvas */}
        <canvas ref={snapRef} style={{ display: 'none' }} />

        {/* ── Top bar ──────────────────────────────────────────────────────── */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: 'calc(env(safe-area-inset-top) + 0.75rem) 1rem 0.75rem',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)',
        }}>
          <button onClick={onClose} style={iconBtn} aria-label="Close">
            <X size={20} />
          </button>

          <span style={{
            color: '#fff', fontWeight: 700,
            fontSize: '0.9rem', letterSpacing: '0.07em',
            textShadow: '0 1px 6px rgba(0,0,0,0.7)',
          }}>
            {isLoading  ? 'Loading AI…'
           : isScanning ? 'Scanning…'
           : isFrozen   ? 'Scan Result'
           :              '🌿 LIVE SCAN'}
          </span>

          {/* Go Live button (frozen mode only) */}
          {isFrozen ? (
            <button
              onClick={goLive}
              style={{ ...iconBtn, backgroundColor: 'rgba(34,197,94,0.25)', borderColor: 'rgba(34,197,94,0.6)' }}
              aria-label="Go live"
            >
              <Video size={18} color="#22c55e" />
            </button>
          ) : (
            <div style={{ width: 40 }} /> // spacer to keep title centred
          )}
        </div>

        {/* ── Model load error ──────────────────────────────────────────────── */}
        {modelError && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 10,
            background: 'rgba(0,0,0,0.88)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: '1rem', padding: '2rem', textAlign: 'center',
          }}>
            <AlertTriangle size={48} color="#f59e0b" />
            <h3 style={{ color: '#fff', margin: 0 }}>Model Load Failed</h3>
            <pre style={{
              color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem',
              whiteSpace: 'pre-wrap', background: 'rgba(255,255,255,0.06)',
              padding: '0.75rem', borderRadius: '8px',
            }}>
              {modelError}
            </pre>
          </div>
        )}

        {/* ── Loading pill (model_loading phase) ───────────────────────────── */}
        {isLoading && !modelError && (
          <div style={{
            position: 'absolute', bottom: '1.5rem', left: '50%',
            transform: 'translateX(-50%)', zIndex: 5,
          }}>
            <div style={{
              background: 'rgba(0,0,0,0.72)',
              backdropFilter: 'blur(8px)',
              borderRadius: '999px',
              padding: '0.5rem 1.1rem',
              display: 'flex', alignItems: 'center', gap: '0.6rem',
            }}>
              <div style={{
                width: '14px', height: '14px', borderRadius: '50%',
                border: '2px solid #22c55e', borderTopColor: 'transparent',
                animation: 'spin 0.9s linear infinite', flexShrink: 0,
              }} />
              <span style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 600 }}>
                Loading AI model…
              </span>
            </div>
          </div>
        )}

        {/* ── Viewfinder brackets (live, no detections yet) ─────────────────── */}
        {isLive && detections.length === 0 && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <div style={{ width: '60%', aspectRatio: '1', position: 'relative' }}>
              {(['tl', 'tr', 'bl', 'br'] as const).map((pos) => (
                <div key={pos} style={{
                  position: 'absolute', width: '20px', height: '20px',
                  borderColor: 'rgba(255,255,255,0.6)', borderStyle: 'solid', borderWidth: 0,
                  ...(pos === 'tl' ? { top: 0,    left: 0,  borderTopWidth: 3, borderLeftWidth: 3 }   : {}),
                  ...(pos === 'tr' ? { top: 0,    right: 0, borderTopWidth: 3, borderRightWidth: 3 }  : {}),
                  ...(pos === 'bl' ? { bottom: 0, left: 0,  borderBottomWidth: 3, borderLeftWidth: 3 } : {}),
                  ...(pos === 'br' ? { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 }: {}),
                }} />
              ))}
            </div>
            {/* Hint text */}
            <div style={{
              position: 'absolute', bottom: '6rem',
              left: '50%', transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(6px)',
              borderRadius: '100px',
              padding: '0.4rem 1rem',
              whiteSpace: 'nowrap',
            }}>
              <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.75rem' }}>
                Point camera at plants, then tap Scan
              </span>
            </div>
          </div>
        )}

        {/* ── LIVE indicator dot (top-right) ────────────────────────────────── */}
        {isLive && (
          <div style={{
            position: 'absolute', top: 'calc(env(safe-area-inset-top) + 4.5rem)',
            right: '1rem', zIndex: 5,
            display: 'flex', alignItems: 'center', gap: '0.35rem',
          }}>
            <div style={{
              width: '7px', height: '7px', borderRadius: '50%',
              backgroundColor: '#22c55e',
              boxShadow: '0 0 6px #22c55e',
              animation: 'pulse-ring 2s ease infinite',
            }} />
            <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.68rem', letterSpacing: '0.06em' }}>
              LIVE
            </span>
          </div>
        )}

        {/* ── Scan button (live + scanning phases) ─────────────────────────── */}
        {(isLive || isScanning) && (
          <div style={{
            position: 'absolute', bottom: '1.5rem', left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 5,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
          }}>
            <button
              onClick={handleScan}
              disabled={isScanning}
              aria-label="Scan now"
              style={{
                width: '70px', height: '70px', borderRadius: '50%',
                border: '3px solid',
                // GREEN when ready to scan, GREY while scanning
                borderColor:     isLive ? '#22c55e' : 'rgba(100,100,100,0.5)',
                backgroundColor: isLive ? 'rgba(34,197,94,0.2)' : 'rgba(60,60,60,0.2)',
                backdropFilter: 'blur(8px)',
                boxShadow:  isLive ? '0 0 20px rgba(34,197,94,0.45)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: isLive ? 'pointer' : 'default',
                transition: 'border-color 0.3s, background-color 0.3s, box-shadow 0.3s',
              }}
            >
              {isScanning
                ? <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    border: '3px solid rgba(120,120,120,0.5)',
                    borderTopColor: 'transparent',
                    animation: 'spin 0.75s linear infinite',
                  }} />
                : <ScanLine size={28} color="#22c55e" />
              }
            </button>
            <span style={{
              fontSize: '0.68rem', letterSpacing: '0.06em',
              color: isLive ? 'rgba(34,197,94,0.9)' : 'rgba(120,120,120,0.7)',
              transition: 'color 0.3s',
            }}>
              {isScanning ? 'PROCESSING…' : 'SCAN NOW'}
            </span>
          </div>
        )}
      </div>

      {/* ══ RESULTS STRIP (never overlaps image) ══════════════════════════════ */}
      <div style={{
        flexShrink: 0,
        backgroundColor: 'rgba(8,8,8,0.97)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        minHeight: '80px',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.5rem)',
      }}>
        {detections.length === 0 ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.55rem', padding: '1.25rem 1rem',
            color: 'rgba(255,255,255,0.28)', fontSize: '0.85rem',
          }}>
            <Leaf size={15} />
            <span>
              {isLoading  ? 'Loading AI model…'
             : isScanning ? 'Analysing frame…'
             : isLive     ? 'Scanning live for weeds…'
             :              'No weeds detected in this scan'}
            </span>
          </div>
        ) : (
          <>
            <div style={{
              padding: '0.6rem 1rem 0.3rem',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', letterSpacing: '0.07em', textTransform: 'uppercase', fontWeight: 600 }}>
                {detections.length} Plant{detections.length > 1 ? 's' : ''} detected · tap for details
              </span>
              <ChevronDown size={12} color="rgba(255,255,255,0.3)" />
            </div>
            <div style={{
              display: 'flex', gap: '0.6rem',
              overflowX: 'auto', padding: '0.2rem 1rem 0.6rem',
              scrollbarWidth: 'none',
            }}>
              {detections.map((det, i) => {
                const ok   = det.label !== 'Unidentified';
                const c    = ok ? '#22c55e' : '#f59e0b';
                const info = ok ? getWeedInfo(det.label) : null;
                const risk = info ? RISK_META[info.riskLevel] : null;
                return (
                  <button
                    key={i}
                    onClick={() => ok ? setSelectedDet(det) : undefined}
                    style={{
                      flexShrink: 0,
                      display: 'flex', flexDirection: 'column', gap: '0.2rem',
                      background: ok ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                      border: `1.5px solid ${ok ? 'rgba(34,197,94,0.35)' : 'rgba(245,158,11,0.35)'}`,
                      borderRadius: '12px',
                      padding: '0.6rem 0.9rem',
                      minWidth: '130px',
                      textAlign: 'left',
                      cursor: ok ? 'pointer' : 'default',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {ok ? <Leaf size={12} color={c} /> : <AlertTriangle size={12} color={c} />}
                      <span style={{ color: c, fontWeight: 700, fontSize: '0.78rem' }}>
                        {(det.confidence * 100).toFixed(0)}%
                      </span>
                      {risk && (
                        <span style={{
                          marginLeft: 'auto', fontSize: '0.6rem', fontWeight: 700,
                          color: risk.color, letterSpacing: '0.03em',
                        }}>
                          {risk.label.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.83rem', lineHeight: 1.25 }}>
                      {det.label}
                    </span>
                    {ok && info && (
                      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.65rem', fontStyle: 'italic' }}>
                        {info.scientificName}
                      </span>
                    )}
                    {!ok && (
                      <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.7rem' }}>
                        ~{det.rawLabel}
                      </span>
                    )}
                    {ok && (
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: '0.25rem',
                        color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', marginTop: '0.15rem',
                      }}>
                        <Info size={9} />
                        Tap for info
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ══ WEED INFO BOTTOM SHEET ════════════════════════════════════════════ */}
      {selectedDet && (() => {
        const info = getWeedInfo(selectedDet.label);
        return info ? (
          <WeedInfoPanel
            info={info}
            det={selectedDet}
            onClose={() => setSelectedDet(null)}
          />
        ) : null;
      })()}

      {/* Slide-up animation */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── Shared style ─────────────────────────────────────────────────────────────
const iconBtn: React.CSSProperties = {
  width: '40px', height: '40px', borderRadius: '50%',
  background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255,255,255,0.15)', color: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', flexShrink: 0,
};