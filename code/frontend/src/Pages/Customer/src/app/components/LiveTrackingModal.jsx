import { useState, useEffect, useRef } from 'react';
import { db } from '../../../../../utils/firebase.js';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { X, CheckCircle, Clock, Package, Truck, MapPin, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ─── Fix Leaflet default icon paths (Webpack quirk) ──────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl:       require('leaflet/dist/images/marker-icon.png'),
  shadowUrl:     require('leaflet/dist/images/marker-shadow.png'),
});

// ─── Custom SVG icon factory ─────────────────────────────────────────────────
function makeSvgIcon(svgContent, size = 40) {
  return L.divIcon({
    className: '',
    html: svgContent,
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor:[0, -(size / 2)],
  });
}

const TRUCK_ICON = makeSvgIcon(`
  <div style="position:relative;width:48px;height:48px;display:flex;align-items:center;justify-content:center;">
    <div style="
      position:absolute;width:48px;height:48px;border-radius:50%;
      background:rgba(59,130,246,0.25);
      animation:uberPulse 1.8s ease-out infinite;
    "></div>
    <div style="
      width:36px;height:36px;border-radius:50%;
      background:linear-gradient(135deg,#1d4ed8,#3b82f6);
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 4px 14px rgba(59,130,246,0.7);
      border:2.5px solid #fff;
      font-size:16px;
    ">🚚</div>
  </div>
  <style>
    @keyframes uberPulse{0%{transform:scale(1);opacity:.6}70%{transform:scale(2.2);opacity:0}100%{transform:scale(2.2);opacity:0}}
  </style>
`, 48);

const PICKUP_ICON = makeSvgIcon(`
  <div style="
    width:34px;height:34px;border-radius:50%;
    background:linear-gradient(135deg,#f59e0b,#d97706);
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 4px 12px rgba(217,119,6,0.6);
    border:2.5px solid #fff;font-size:15px;
  ">📦</div>
`, 34);

const DROP_ICON = makeSvgIcon(`
  <div style="
    width:34px;height:34px;border-radius:50%;
    background:linear-gradient(135deg,#10b981,#059669);
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 4px 12px rgba(5,150,105,0.6);
    border:2.5px solid #fff;font-size:15px;
  ">🏁</div>
`, 34);

// ─── Smooth map recenter when driver moves ─────────────────────────────────────
function MapRecenter({ lat, lng, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], zoom ?? map.getZoom(), { animate: true, duration: 1.2 });
    }
  }, [lat, lng]);
  return null;
}

// ─── Fetch real road route from OSRM ─────────────────────────────────────────
async function fetchRoute(fromLat, fromLng, toLat, toLng) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
    const res  = await fetch(url);
    const data = await res.json();
    if (data.routes?.[0]) {
      const coords = data.routes[0].geometry.coordinates;
      return coords.map(([lng, lat]) => [lat, lng]);   // flip to [lat,lng] for Leaflet
    }
  } catch (e) {
    console.warn('OSRM unavailable, falling back to straight line');
  }
  return [[fromLat, fromLng], [toLat, toLng]];          // fallback straight line
}

// ─── The actual Leaflet map panel ─────────────────────────────────────────────
function UberMap({ shipment }) {
  const [route, setRoute] = useState([]);   // full road route pickup → drop

  const driverLat = shipment?.gps?.driverLat;
  const driverLng = shipment?.gps?.driverLng;
  const pickupLat = shipment?.gps?.pickupLat;
  const pickupLng = shipment?.gps?.pickupLng;
  const dropLat   = shipment?.gps?.dropLat;
  const dropLng   = shipment?.gps?.dropLng;
  const status    = (shipment?.status || '').toLowerCase();
  const delivered = status === 'delivered';

  // Fetch full road route ONCE when pickup→drop coords are available
  useEffect(() => {
    if (!pickupLat || !dropLat) return;
    fetchRoute(pickupLat, pickupLng, dropLat, dropLng).then(setRoute);
  }, [pickupLat, pickupLng, dropLat, dropLng]);  // ← only pickup/drop, NOT driver coords

  // "Completed" segment: simple direct line pickup → driver (no OSRM, updates live)
  const doneSegment = (driverLat && pickupLat)
    ? [[pickupLat, pickupLng], [driverLat, driverLng]]
    : [];

  const center = driverLat
    ? [driverLat, driverLng]
    : pickupLat
      ? [pickupLat, pickupLng]
      : [7.8731, 80.7718];  // centre of Sri Lanka

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 16, overflow: 'hidden' }}>
      {/* Dark filter wrapper — inverts OSM tiles to get Uber-style dark map, no API key needed */}
      <div style={{
        position: 'absolute', inset: 0,
        filter: 'invert(100%) hue-rotate(180deg) brightness(0.92) contrast(0.88) saturate(0.7)',
      }}>
      <MapContainer
        center={center}
        zoom={driverLat ? 13 : 8}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        {/* ── Free OpenStreetMap tiles ── */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={20}
        />

        {/* Smooth recenter + zoom on driver every GPS update */}
        {driverLat && <MapRecenter lat={driverLat} lng={driverLng} zoom={14} />}

        {/* Full route (grey dashed) — drawn once */}
        {route.length > 1 && (
          <Polyline
            positions={route}
            pathOptions={{ color: '#475569', weight: 5, dashArray: '10 6', opacity: 0.55 }}
          />
        )}

        {/* Completed segment (blue solid) — simple direct line, updates live */}
        {doneSegment.length > 1 && !delivered && (
          <Polyline
            positions={doneSegment}
            pathOptions={{ color: '#3b82f6', weight: 6, lineCap: 'round', lineJoin: 'round', opacity: 0.9 }}
          />
        )}

        {/* Full route green when delivered */}
        {delivered && route.length > 1 && (
          <Polyline
            positions={route}
            pathOptions={{ color: '#10b981', weight: 6, lineCap: 'round' }}
          />
        )}

        {/* Pickup marker */}
        {pickupLat && (
          <Marker position={[pickupLat, pickupLng]} icon={PICKUP_ICON}>
            <Popup>
              <strong>📦 Pickup Point</strong>
              <br />{shipment?.from || 'Pickup location'}
            </Popup>
          </Marker>
        )}

        {/* Drop marker */}
        {dropLat && (
          <Marker position={[dropLat, dropLng]} icon={DROP_ICON}>
            <Popup>
              <strong>🏁 Delivery Destination</strong>
              <br />{shipment?.to || 'Destination'}
            </Popup>
          </Marker>
        )}

        {/* Driver / truck marker */}
        {driverLat && !delivered && (
          <Marker position={[driverLat, driverLng]} icon={TRUCK_ICON}>
            <Popup>
              <strong>🚚 Driver</strong>
              <br />{shipment?.driver || 'Driver'}
            </Popup>
          </Marker>
        )}
      </MapContainer>
      </div> {/* end dark-filter wrapper */}

      {/* Overlay: GPS badge — placed OUTSIDE the filter wrapper so it stays white */}
      <div style={{
        position: 'absolute', top: 12, right: 12, zIndex: 1000,
        background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)',
        borderRadius: 10, padding: '6px 12px',
        display: 'flex', alignItems: 'center', gap: 6,
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%', display: 'inline-block',
          background: delivered ? '#10b981' : (driverLat ? '#3b82f6' : '#f59e0b'),
          boxShadow: driverLat && !delivered ? '0 0 0 3px rgba(59,130,246,0.3)' : 'none',
          animation: (driverLat && !delivered) ? 'uberDot 1.4s ease-in-out infinite' : 'none',
        }}/>
        <span style={{ fontSize: 10, color: '#e2e8f0', fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>
          {delivered ? 'Delivered ✓' : driverLat ? 'Live GPS' : 'Awaiting Pickup'}
        </span>
      </div>

      {/* GPS coordinates badge */}
      {driverLat && !delivered && (
        <div style={{
          position: 'absolute', bottom: 12, left: 12, zIndex: 1000,
          background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)',
          borderRadius: 8, padding: '5px 10px',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: '#94a3b8' }}>
            📡 {driverLat.toFixed(4)}°N  {driverLng.toFixed(4)}°E
          </span>
        </div>
      )}

      <style>{`
        @keyframes uberDot { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  );
}

// ─── Milestone timeline ───────────────────────────────────────────────────────
const MILESTONES = [
  { key: 'Order Placed',   Icon: Package },
  { key: 'Order Accepted', Icon: CheckCircle },
  { key: 'Picked Up',      Icon: MapPin },
  { key: 'In Transit',     Icon: Truck },
  { key: 'Delivered',      Icon: CheckCircle },
];

function getMilestoneIndex(status) {
  const s = (status || '').toLowerCase();
  if (s === 'delivered')  return 4;
  if (s === 'in transit') return 3;
  if (s === 'picked up')  return 2;
  if (s === 'accepted')   return 1;
  return 0;
}

function Timeline({ currentStatus, trackingHistory }) {
  const idx = getMilestoneIndex(currentStatus);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {MILESTONES.map((m, i) => {
        const Icon      = m.Icon;
        const done      = i <= idx;
        const active    = i === idx;
        const hist      = trackingHistory?.find(h =>
          h.status.toLowerCase().includes(m.key.toLowerCase().split(' ')[0])
        );
        return (
          <div key={m.key} style={{ display: 'flex', gap: 14, position: 'relative', minHeight: 56 }}>
            {/* Connector line */}
            {i < MILESTONES.length - 1 && (
              <div style={{
                position: 'absolute', left: 17, top: 40, width: 2, height: 28,
                background: done && i < idx ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                transition: 'background 0.6s ease',
              }}/>
            )}
            {/* Icon circle */}
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: done
                ? (active ? '#3b82f6' : 'rgba(59,130,246,0.25)')
                : 'rgba(255,255,255,0.07)',
              color: done ? (active ? '#fff' : '#93c5fd') : 'rgba(255,255,255,0.25)',
              border: active ? '2px solid rgba(147,197,253,0.5)' : '2px solid transparent',
              boxShadow: active ? '0 0 12px rgba(59,130,246,0.5)' : 'none',
              transition: 'all 0.5s ease',
              zIndex: 1,
            }}>
              <Icon style={{ width: 16, height: 16 }} />
            </div>
            {/* Text */}
            <div style={{ paddingTop: 6, paddingBottom: 20 }}>
              <p style={{
                margin: 0, fontFamily: "'Plus Jakarta Sans',sans-serif",
                fontSize: 13, fontWeight: active ? 700 : 500,
                color: done ? (active ? '#f8fafc' : '#94a3b8') : 'rgba(255,255,255,0.2)',
                transition: 'color 0.5s ease',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                {m.key}
                {active && (
                  <span style={{
                    fontSize: 9, background: '#1d4ed8', color: '#bfdbfe',
                    padding: '2px 7px', borderRadius: 99, fontWeight: 700,
                    border: '1px solid rgba(147,197,253,0.3)', letterSpacing: '0.05em'
                  }}>NOW</span>
                )}
              </p>
              <p style={{ margin: 0, fontFamily: "'Inter',sans-serif", fontSize: 11, color: 'rgba(148,163,184,0.6)' }}>
                {hist?.date
                  ? new Date(hist.date).toLocaleString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })
                  : done ? 'Completed' : 'Pending'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export function LiveTrackingModal({ order, onClose }) {
  const [shipment,    setShipment]    = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Subscribe to matching shipment doc (by document ID or orderId field)
  useEffect(() => {
    if (!order?.id) return;
    setLoading(true);

    // Listener 1 — by doc ID
    const unsubDoc = onSnapshot(
      doc(db, 'shipments', order.id),
      snap => {
        if (snap.exists()) {
          setShipment({ id: snap.id, ...snap.data() });
          setLastUpdated(new Date());
          setLoading(false);
        }
      },
      () => {}
    );

    // Listener 2 — by orderId field
    const unsubQ = onSnapshot(
      query(collection(db, 'shipments'), where('orderId', '==', order.id)),
      snap => {
        if (!snap.empty) {
          const d = snap.docs[0];
          setShipment({ id: d.id, ...d.data() });
          setLastUpdated(new Date());
          setLoading(false);
        } else {
          setLoading(false);
        }
      },
      err => {
        console.error("Firebase tracking error:", err);
        setLoading(false);
      }
    );

    return () => { unsubDoc(); unsubQ(); };
  }, [order?.id]);

  const status     = shipment?.status || order?.status || 'pending';
  const milestoneI = getMilestoneIndex(status);

  // Status colour
  const statusColor =
    milestoneI >= 4 ? '#10b981' :
    milestoneI >= 3 ? '#3b82f6' :
    milestoneI >= 2 ? '#a855f7' :
    '#f59e0b';

  return (
    <>
      <style>{`
        @keyframes modalSlideUp {
          from { opacity:0; transform:translateY(48px) scale(0.96); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }
        @keyframes backdropFadeIn { from{opacity:0} to{opacity:1} }
        @keyframes spinRing { to{transform:rotate(360deg)} }
        @keyframes livePulseGlow {
          0%,100% { box-shadow:0 0 0 0 rgba(59,130,246,0.4); }
          50%      { box-shadow:0 0 0 10px rgba(59,130,246,0); }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position:'fixed', inset:0, zIndex:9998,
          background:'rgba(2,6,23,0.75)',
          backdropFilter:'blur(6px)',
          animation:'backdropFadeIn 0.3s ease',
        }}
      />

      {/* Modal */}
      <div style={{
        position:'fixed', inset:0, zIndex:9999,
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:20, pointerEvents:'none',
      }}>
        <div style={{
          width:'100%', maxWidth:1000, height:'88vh', maxHeight:760,
          background:'#0f172a',
          borderRadius:24,
          boxShadow:'0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)',
          display:'flex', flexDirection:'column',
          animation:'modalSlideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
          pointerEvents:'all', overflow:'hidden',
        }}>

          {/* ── Top Header ── */}
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'18px 24px',
            borderBottom:'1px solid rgba(255,255,255,0.07)',
            flexShrink:0,
            background:'rgba(15,23,42,0.95)',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <div style={{
                width:42, height:42, borderRadius:12,
                background:'linear-gradient(135deg,#1d4ed8,#3b82f6)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:20, boxShadow:'0 4px 12px rgba(59,130,246,0.4)',
              }}>🚚</div>
              <div>
                <h2 style={{
                  margin:0, fontFamily:"'Plus Jakarta Sans',sans-serif",
                  fontSize:17, fontWeight:800, color:'#f8fafc',
                }}>
                  Live Order Tracking
                </h2>
                <p style={{ margin:0, fontFamily:"'Inter',sans-serif", fontSize:11, color:'#64748b' }}>
                  Order #{order?.id?.slice(0,12)} · Powered by NagroMS Logistics
                </p>
              </div>
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              {/* Live status pill */}
              <div style={{
                display:'flex', alignItems:'center', gap:7,
                background:'rgba(255,255,255,0.05)',
                border:`1px solid ${statusColor}40`,
                borderRadius:99, padding:'5px 14px',
              }}>
                <span style={{
                  width:7, height:7, borderRadius:'50%', background:statusColor,
                  display:'inline-block',
                  animation: milestoneI === 3 ? 'livePulseGlow 1.6s ease infinite' : 'none',
                }}/>
                <span style={{
                  fontFamily:"'Plus Jakarta Sans',sans-serif",
                  fontSize:12, fontWeight:700, color:statusColor,
                  textTransform:'capitalize',
                }}>
                  {status}
                </span>
              </div>

              {/* Close */}
              <button
                onClick={onClose}
                style={{
                  width:34, height:34, borderRadius:9, border:'1px solid rgba(255,255,255,0.1)',
                  background:'rgba(255,255,255,0.05)', color:'#94a3b8',
                  cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                  transition:'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.12)'; e.currentTarget.style.color='#f8fafc'; }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='#94a3b8'; }}
              >
                <X style={{ width:16, height:16 }} />
              </button>
            </div>
          </div>

          {/* ── Body ── */}
          <div style={{ flex:1, display:'grid', gridTemplateColumns:'280px 1fr', minHeight:0 }}>

            {/* LEFT PANEL — dark info strip */}
            <div style={{
              background:'#0a1628',
              borderRight:'1px solid rgba(255,255,255,0.06)',
              display:'flex', flexDirection:'column',
              padding:'20px 20px', gap:20, overflowY:'auto',
            }}>

              {/* Driver card */}
              {shipment?.driver && (
                <div style={{
                  background:'rgba(255,255,255,0.04)',
                  borderRadius:14, padding:'14px 16px',
                  border:'1px solid rgba(255,255,255,0.07)',
                }}>
                  <p style={{ margin:'0 0 12px 0', fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:700, color:'#64748b', letterSpacing:'0.08em', textTransform:'uppercase' }}>Driver</p>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{
                      width:40, height:40, borderRadius:'50%',
                      background:'linear-gradient(135deg,#1e3a8a,#3b82f6)',
                      display:'flex', alignItems:'center', justifyContent:'center', fontSize:18,
                    }}>🧑‍✈️</div>
                    <div>
                      <p style={{ margin:0, fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:14, fontWeight:700, color:'#f1f5f9' }}>{shipment.driver}</p>
                      <p style={{ margin:0, fontFamily:"'Inter',sans-serif", fontSize:11, color:'#64748b' }}>{shipment.vehicle || 'Delivery Vehicle'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Route */}
              {(shipment?.from || shipment?.to) && (
                <div style={{
                  background:'rgba(255,255,255,0.04)',
                  borderRadius:14, padding:'14px 16px',
                  border:'1px solid rgba(255,255,255,0.07)',
                  display:'flex', flexDirection:'column', gap:10,
                }}>
                  <p style={{ margin:0, fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:700, color:'#64748b', letterSpacing:'0.08em', textTransform:'uppercase' }}>Route</p>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', paddingTop:3 }}>
                      <span style={{ width:10, height:10, borderRadius:'50%', background:'#f59e0b', display:'block', flexShrink:0 }}/>
                      <span style={{ width:1.5, height:28, background:'rgba(255,255,255,0.1)', display:'block', margin:'4px 0' }}/>
                      <span style={{ width:10, height:10, borderRadius:'50%', background:'#10b981', display:'block', flexShrink:0 }}/>
                    </div>
                    <div style={{ flex:1, display:'flex', flexDirection:'column', gap:10 }}>
                      <div>
                        <p style={{ margin:0, fontFamily:"'Inter',sans-serif", fontSize:11, color:'#94a3b8' }}>Pickup</p>
                        <p style={{ margin:0, fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12, fontWeight:600, color:'#f1f5f9' }}>{shipment.from}</p>
                      </div>
                      <div>
                        <p style={{ margin:0, fontFamily:"'Inter',sans-serif", fontSize:11, color:'#94a3b8' }}>Destination</p>
                        <p style={{ margin:0, fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12, fontWeight:600, color:'#f1f5f9' }}>{shipment.to}</p>
                      </div>
                    </div>
                  </div>
                  {shipment.product && (
                    <div style={{ background:'rgba(59,130,246,0.08)', borderRadius:8, padding:'6px 10px', fontSize:11, color:'#93c5fd', border:'1px solid rgba(59,130,246,0.15)' }}>
                      📦 {shipment.product}
                    </div>
                  )}
                </div>
              )}

              {/* ETA */}
              {shipment?.eta && milestoneI < 4 && (
                <div style={{
                  background:'rgba(59,130,246,0.08)',
                  borderRadius:14, padding:'14px 16px',
                  border:'1px solid rgba(59,130,246,0.2)',
                  display:'flex', alignItems:'center', gap:12,
                }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:'rgba(59,130,246,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Clock style={{ width:18, height:18, color:'#60a5fa' }} />
                  </div>
                  <div>
                    <p style={{ margin:0, fontFamily:"'Inter',sans-serif", fontSize:10, color:'#64748b' }}>Estimated Arrival</p>
                    <p style={{ margin:0, fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:16, fontWeight:800, color:'#60a5fa' }}>{shipment.eta}</p>
                  </div>
                </div>
              )}

              {/* Delivered banner */}
              {milestoneI >= 4 && (
                <div style={{
                  background:'rgba(16,185,129,0.1)',
                  borderRadius:14, padding:'14px 16px',
                  border:'1px solid rgba(16,185,129,0.3)',
                  textAlign:'center',
                }}>
                  <div style={{ fontSize:28, marginBottom:6 }}>✅</div>
                  <p style={{ margin:0, fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:14, fontWeight:800, color:'#34d399' }}>Delivered!</p>
                  <p style={{ margin:0, fontFamily:"'Inter',sans-serif", fontSize:11, color:'#64748b' }}>Your order has arrived</p>
                </div>
              )}

              {/* Timeline */}
              <div>
                <p style={{ margin:'0 0 12px 0', fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:700, color:'#64748b', letterSpacing:'0.08em', textTransform:'uppercase' }}>Progress</p>
                {loading ? (
                  <div style={{ display:'flex', justifyContent:'center', padding:20 }}>
                    <div style={{ width:28, height:28, borderRadius:'50%', border:'2.5px solid rgba(59,130,246,0.2)', borderTopColor:'#3b82f6', animation:'spinRing 0.8s linear infinite' }}/>
                  </div>
                ) : (
                  <Timeline currentStatus={status} trackingHistory={shipment?.trackingHistory || order?.trackingHistory} />
                )}
              </div>

              {/* Last updated */}
              {lastUpdated && (
                <p style={{ margin:'auto 0 0 0', fontFamily:"'Inter',sans-serif", fontSize:10, color:'#334155', textAlign:'center' }}>
                  🔄 Updated {lastUpdated.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', second:'2-digit' })}
                </p>
              )}
            </div>

            {/* RIGHT PANEL — map */}
            <div style={{ position:'relative', minHeight:0 }}>
              {loading ? (
                <div style={{
                  width:'100%', height:'100%',
                  background:'#0a1628',
                  display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16,
                }}>
                  <div style={{ width:44, height:44, borderRadius:'50%', border:'3px solid rgba(59,130,246,0.15)', borderTopColor:'#3b82f6', animation:'spinRing 0.9s linear infinite' }}/>
                  <p style={{ margin:0, fontFamily:"'Inter',sans-serif", fontSize:13, color:'#475569' }}>Loading map…</p>
                </div>
              ) : shipment?.gps ? (
                <UberMap shipment={shipment} />
              ) : (
                <div style={{
                  width:'100%', height:'100%',
                  background:'linear-gradient(160deg,#0a1628,#0f172a)',
                  display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14,
                }}>
                  <Navigation style={{ width:52, height:52, color:'#1e3a8a' }} />
                  <p style={{ margin:0, fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:14, fontWeight:600, color:'#334155', textAlign:'center' }}>
                    GPS tracking activates<br/>once the driver picks up your order
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LiveTrackingModal;
