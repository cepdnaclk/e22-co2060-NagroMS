import React, { useState, useEffect, useRef } from 'react';
import { Navigation, CheckCircle, MapPin, DollarSign, Map as MapIcon, Compass, Bell } from 'lucide-react';
import { db } from '../../../../utils/firebase.js';
import { collection, onSnapshot, doc, setDoc, updateDoc } from 'firebase/firestore';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leafet default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const customCss = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  
  * {
    font-family: 'Plus Jakarta Sans', sans-serif !important;
  }

  /* Animated Mesh Background for the whole app */
  .mesh-bg {
    background-color: #f8fafc;
    background-image: 
      radial-gradient(at 0% 0%, hsla(253,16%,7%,0.03) 0, transparent 50%), 
      radial-gradient(at 50% 0%, hsla(225,39%,30%,0.03) 0, transparent 50%), 
      radial-gradient(at 100% 0%, hsla(339,49%,30%,0.03) 0, transparent 50%);
    background-size: cover;
    background-position: center;
  }

  /* Deep Glassmorphism (2D Polymorphism) */
  .poly-card {
    background: rgba(255, 255, 255, 0.65);
    backdrop-filter: blur(40px) saturate(200%);
    -webkit-backdrop-filter: blur(40px) saturate(200%);
    border: 1px solid rgba(255, 255, 255, 0.8);
    box-shadow: 
      0 20px 40px -10px rgba(0, 0, 0, 0.05),
      0 1px 3px rgba(0,0,0,0.02),
      inset 0 1px 0 rgba(255, 255, 255, 1),
      inset 0 0 32px rgba(255, 255, 255, 0.3);
    border-radius: 32px;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  .poly-card:hover {
    transform: translateY(-4px);
    box-shadow: 
      0 30px 60px -15px rgba(37, 99, 235, 0.1),
      0 4px 6px rgba(0,0,0,0.02),
      inset 0 1px 0 rgba(255, 255, 255, 1),
      inset 0 0 32px rgba(255, 255, 255, 0.5);
  }

  /* Modern Buttons */
  .poly-btn-primary {
    background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
    color: white;
    border: none;
    box-shadow: 
      0 10px 25px -5px rgba(37, 99, 235, 0.4), 
      inset 0 2px 0 rgba(255,255,255,0.2),
      inset 0 -2px 0 rgba(0,0,0,0.1);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    overflow: hidden;
  }
  .poly-btn-primary::before {
    content: '';
    position: absolute;
    top: 0; left: -100%; width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
    transition: all 0.5s ease;
  }
  .poly-btn-primary:hover::before {
    left: 100%;
  }
  .poly-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px -5px rgba(37, 99, 235, 0.5), inset 0 2px 0 rgba(255,255,255,0.3);
  }
  .poly-btn-primary:active {
    transform: translateY(1px);
  }

  .poly-btn-success {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4), inset 0 2px 0 rgba(255,255,255,0.2);
  }
  .poly-btn-success:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px -5px rgba(16, 185, 129, 0.5), inset 0 2px 0 rgba(255,255,255,0.3);
  }

  .poly-dark {
    background: linear-gradient(145deg, #0f172a, #1e293b);
    border: 1px solid rgba(255,255,255,0.1);
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05);
    color: white;
  }

  /* Typography */
  .text-gradient {
    background: linear-gradient(to right, #2563eb, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .text-gradient-success {
    background: linear-gradient(to right, #10b981, #059669);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  /* Bottom Nav Float */
  .nav-pill {
    background: rgba(255,255,255,0.85);
    backdrop-filter: blur(24px);
    border: 1px solid rgba(255,255,255,1);
    box-shadow: 0 10px 40px rgba(0,0,0,0.08);
    border-radius: 40px;
    padding: 8px;
  }
  .nav-item {
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    border-radius: 30px;
  }
  .nav-item.active {
    background: #eff6ff;
    color: #2563eb;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
  }
`;

// Custom icons
const createPriceIcon = (price) => L.divIcon({
    className: 'custom-price-icon',
    html: `<div style="background: rgba(255,255,255,0.95); backdrop-filter: blur(12px); color: #0f172a; padding: 8px 16px; border-radius: 20px; font-weight: 800; font-size: 14px; border: 2px solid #ffffff; box-shadow: 0 10px 25px -5px rgba(37,99,235,0.2), 0 4px 10px -4px rgba(0,0,0,0.1); white-space: nowrap; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);">
      <span style="color: #2563eb; font-weight: 800;">Rs</span> ${(price/1000).toFixed(0)}k
    </div>`,
    iconSize: [80, 36],
    iconAnchor: [40, 36]
});

const userIcon = L.divIcon({
    className: 'custom-user-icon',
    html: '<div style="background: linear-gradient(135deg, #3b82f6, #2563eb); width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 6px rgba(37,99,235,0.25), 0 8px 16px rgba(0,0,0,0.2);"></div>',
    iconSize: [22, 22],
    iconAnchor: [11, 11]
});

const targetIcon = L.divIcon({
    className: 'custom-target-icon',
    html: '<div style="background: linear-gradient(135deg, #10b981, #059669); width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 8px 16px rgba(0,0,0,0.2);"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

// Map auto-fitter
function MapFitter({ bounds }) {
    const map = useMap();
    useEffect(() => {
        if (bounds && bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50], animate: true });
        }
    }, [bounds, map]);
    return null;
}

export default function DriverDashboard({ onNavigate }) {
    const [deliveries, setDeliveries] = useState([]);
    const [myShipment, setMyShipment] = useState(null);
    const [myHistory, setMyHistory] = useState([]);
    const [tab, setTab] = useState('radar');
    const [isTracking, setIsTracking] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [routePath, setRoutePath] = useState([]);
    const [mapBounds, setMapBounds] = useState([]);
    
    const watchIdRef = useRef(null);

    const userEmail = localStorage.getItem('userEmail') || 'driver@nagroms.local';
    const userName = localStorage.getItem('userName') || 'Independent Driver';

    const enrichWithMockGps = (job) => {
        if (!job.mockLat) {
            const baseLat = 7.8731; const baseLng = 80.7718;
            job.mockLat = baseLat + (Math.random() - 0.5) * 2;
            job.mockLng = baseLng + (Math.random() - 0.5) * 2;
        }
        return job;
    };

    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(pos => {
                setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                if (tab === 'radar') setMapBounds([[pos.coords.latitude, pos.coords.longitude]]);
            });
        }

        const unsubDel = onSnapshot(collection(db, 'deliveries'), (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setDeliveries(list.map(enrichWithMockGps));
        });

        const unsubShip = onSnapshot(collection(db, 'shipments'), (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            const active = list.find(s => s.driverEmail === userEmail && (s.status === 'In Transit' || s.status === 'Accepted'));
            setMyShipment(active || null);
            
            if (active && tab === 'radar') setTab('run');

            const history = list.filter(s => s.driverEmail === userEmail && s.status === 'Delivered');
            setMyHistory(history);
        });

        return () => { unsubDel(); unsubShip(); };
    }, [userEmail]);

    useEffect(() => {
        const fetchRoute = async () => {
            if (!myShipment || tab !== 'run') { setRoutePath([]); return; }
            try {
                let origin = null; let dest = null;
                if (myShipment.status === 'Accepted') {
                    origin = userLocation ? [userLocation.lat, userLocation.lng] : [myShipment.gps.driverLat, myShipment.gps.driverLng];
                    dest = [myShipment.gps.pickupLat, myShipment.gps.pickupLng];
                } else if (myShipment.status === 'In Transit') {
                    origin = userLocation ? [userLocation.lat, userLocation.lng] : [myShipment.gps.driverLat, myShipment.gps.driverLng];
                    dest = [myShipment.gps.dropLat, myShipment.gps.dropLng];
                }

                if (origin && dest) {
                    const url = `https://router.project-osrm.org/route/v1/driving/${origin[1]},${origin[0]};${dest[1]},${dest[0]}?overview=full&geometries=geojson`;
                    const res = await fetch(url);
                    const data = await res.json();
                    if (data.routes && data.routes[0]) {
                        const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
                        setRoutePath(coords);
                        setMapBounds([origin, dest]);
                    }
                }
            } catch (e) { console.error(e); }
        };
        fetchRoute();
    }, [myShipment, tab, userLocation]);

    const handleAcceptJob = async (job) => {
        try {
            await updateDoc(doc(db, 'deliveries', job.id), { status: 'Accepted' });
            const newShip = {
                id: job.id, farmer: job.farmer, driver: userName, driverEmail: userEmail,
                vehicle: 'Personal Vehicle', from: job.pickup, to: job.drop,
                progress: 0, status: 'Accepted', product: `${job.product} (${job.qty})`, price: job.price || 0,
                gps: {
                    driverLat: userLocation ? userLocation.lat : job.mockLat, 
                    driverLng: userLocation ? userLocation.lng : job.mockLng,
                    pickupLat: job.mockLat, pickupLng: job.mockLng, dropLat: 6.9271, dropLng: 79.8612
                }
            };
            await setDoc(doc(db, 'shipments', job.id), newShip);
            setSelectedJob(null); setTab('run');
            toggleTracking(true);
        } catch (e) { alert("Failed to accept job."); }
    };

    const toggleTracking = (forceEnable = false) => {
        if (!myShipment) return;
        if (isTracking && !forceEnable) {
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
            setIsTracking(false);
        } else {
            if ('geolocation' in navigator) {
                setIsTracking(true);
                watchIdRef.current = navigator.geolocation.watchPosition(
                    (pos) => {
                        const { latitude, longitude } = pos.coords;
                        setUserLocation({ lat: latitude, lng: longitude });
                        updateDoc(doc(db, 'shipments', myShipment.id), { 'gps.driverLat': latitude, 'gps.driverLng': longitude });
                    },
                    (err) => { setIsTracking(false); },
                    { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
                );
            }
        }
    };

    const handleMarkPickedUp = async () => {
        if (!myShipment) return;
        try {
            await updateDoc(doc(db, 'shipments', myShipment.id), { status: 'In Transit', progress: 50 });
            await updateDoc(doc(db, 'deliveries', myShipment.id), { status: 'In Transit' });
        } catch (e) {}
    };

    const handleComplete = async () => {
        if (!myShipment) return;
        try {
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
            setIsTracking(false);
            await updateDoc(doc(db, 'shipments', myShipment.id), { status: 'Delivered', progress: 100, completedAt: new Date().toISOString() });
            await updateDoc(doc(db, 'deliveries', myShipment.id), { status: 'Delivered' });
            setMyShipment(null); setRoutePath([]); setTab('earnings');
        } catch (e) {}
    };

    const pendingJobs = deliveries.filter(d => d.status === 'Pending');
    const totalEarnings = myHistory.reduce((sum, h) => sum + (h.price || 0), 0);

    return (
        <div className="mesh-bg" style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <style>{customCss}</style>
            
            {/* Header */}
            <header style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 500, position: 'sticky', top: 0, borderBottom: '1px solid rgba(255,255,255,1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '14px', background: 'linear-gradient(135deg, #2563eb, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18, boxShadow: '0 8px 16px rgba(37,99,235,0.25)' }}>
                        {userName.charAt(0)}
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>✨ Gig Driver Pro</h1>
                        <p style={{ margin: 0, fontSize: 13, color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981'}}></span> Online
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {/* Switch Dashboard Dropdown */}
                    <div style={{ position: 'relative' }}>
                        <select
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'driver') {
                                    window.location.href = '/driver-dashboard';
                                } else {
                                    localStorage.setItem('serviceProviderType', val);
                                    window.location.href = '/service-provider-dashboard';
                                }
                            }}
                            value="driver"
                            style={{
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                padding: '8px 32px 8px 16px',
                                borderRadius: '24px',
                                fontSize: '13px',
                                fontWeight: 700,
                                color: '#0f172a',
                                cursor: 'pointer',
                                outline: 'none',
                                appearance: 'none',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                            }}
                        >
                            <option disabled value="driver">🛵 Gig Driver</option>
                            {(() => {
                                try {
                                    const cats = JSON.parse(localStorage.getItem('serviceCategories') || '[]');
                                    const map = {
                                        'equipment': '🚜 Equipment Rental',
                                        'delivery': '🚚 Delivery & Export',
                                        'storage': '🏠 Storage Facilities',
                                        'packaging': '📦 Packaging Services',
                                        'financial': '💳 Financial Services'
                                    };
                                    return cats.map(c => (
                                        <option key={c} value={c}>{map[c] || c}</option>
                                    ));
                                } catch (e) {
                                    return null;
                                }
                            })()}
                        </select>
                        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                    </div>

                    <button onClick={() => onNavigate('landing')} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '10px 16px', borderRadius: 24, fontSize: 13, fontWeight: 700, color: '#ef4444', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>Log Out</button>
                </div>
            </header>

            {/* Main Content Area */}
            <main style={{ flex: 1, position: 'relative', overflowY: 'auto' }}>
                
                {/* GLOBAL MAP LAYER */}
                {(tab === 'radar' || tab === 'run') && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: (tab === 'run' || selectedJob) ? '45%' : 0, zIndex: 0, transition: 'bottom 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                        <MapContainer center={[7.8731, 80.7718]} zoom={8} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                            
                            {userLocation && <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} />}
                            <MapFitter bounds={mapBounds} />

                            {tab === 'radar' && pendingJobs.map(job => (
                                <Marker 
                                    key={job.id} 
                                    position={[job.mockLat, job.mockLng]} 
                                    icon={createPriceIcon(job.price || 15000)}
                                    eventHandlers={{ click: () => setSelectedJob(job) }}
                                />
                            ))}

                            {tab === 'run' && myShipment && routePath.length > 0 && (
                                <>
                                    <Polyline positions={routePath} color="#2563eb" weight={6} opacity={0.8} />
                                    {myShipment.status === 'Accepted' ? (
                                        <Marker position={[myShipment.gps.pickupLat, myShipment.gps.pickupLng]} icon={targetIcon}><Popup>Pickup Location</Popup></Marker>
                                    ) : (
                                        <Marker position={[myShipment.gps.dropLat, myShipment.gps.dropLng]} icon={targetIcon}><Popup>Dropoff Location</Popup></Marker>
                                    )}
                                </>
                            )}
                        </MapContainer>
                    </div>
                )}

                {/* RADAR OVERLAYS */}
                {tab === 'radar' && (
                    <>
                        <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', padding: '12px 28px', borderRadius: 40, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 12, zIndex: 10, border: '1px solid rgba(255,255,255,1)' }}>
                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#2563eb', boxShadow: '0 0 0 4px rgba(37,99,235,0.2)' }} />
                            <span style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>{pendingJobs.length} Orders Nearby</span>
                        </div>

                        {/* Job Bottom Sheet - 2D Poly */}
                        {selectedJob && (
                            <div className="poly-card" style={{ position: 'absolute', bottom: 24, left: 16, right: 16, padding: 28, zIndex: 10 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                                    <div>
                                        <p style={{ margin: '0 0 4px', fontSize: 13, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Est. Payout</p>
                                        <h2 className="text-gradient" style={{ margin: 0, fontSize: 36, fontWeight: 900 }}>Rs {selectedJob.price?.toLocaleString() || '15,000'}</h2>
                                    </div>
                                    <button onClick={() => setSelectedJob(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', cursor: 'pointer', color: '#475569' }}>✕</button>
                                </div>

                                <div style={{ background: 'rgba(255, 255, 255, 0.5)', borderRadius: 20, padding: 24, marginBottom: 28, border: '1px solid rgba(255,255,255,0.8)', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5)' }}>
                                    <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{selectedJob.product} <span style={{ color: '#64748b', fontWeight: 600 }}>({selectedJob.qty})</span></h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                            <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#2563eb', boxShadow: '0 0 0 4px rgba(37,99,235,0.2)' }} />
                                            <span style={{ fontSize: 16, color: '#0f172a', fontWeight: 700 }}>{selectedJob.pickup}</span>
                                        </div>
                                        <div style={{ borderLeft: `2px dashed #cbd5e1`, height: 28, marginLeft: 7, marginTop: -12, marginBottom: -12 }} />
                                        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                            <div style={{ width: 16, height: 16, borderRadius: '4px', background: '#10b981', boxShadow: '0 0 0 4px rgba(16,185,129,0.2)' }} />
                                            <span style={{ fontSize: 16, color: '#0f172a', fontWeight: 700 }}>{selectedJob.drop}</span>
                                        </div>
                                    </div>
                                </div>

                                <button onClick={() => handleAcceptJob(selectedJob)} className="poly-btn-primary" style={{ width: '100%', padding: '20px', borderRadius: 20, fontSize: 18, fontWeight: 800, cursor: 'pointer' }}>Accept Order</button>
                            </div>
                        )}
                    </>
                )}

                {/* RUN OVERLAYS */}
                {tab === 'run' && (
                    <div className="poly-card" style={{ position: 'absolute', bottom: 24, left: 16, right: 16, maxHeight: '65%', padding: 28, zIndex: 10, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                        {!myShipment ? (
                            <div style={{ textAlign: 'center', margin: 'auto', padding: '40px 0' }}>
                                <div style={{ background: '#eff6ff', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 10px 25px rgba(37,99,235,0.1)' }}>
                                    <Compass size={40} color="#2563eb" />
                                </div>
                                <h3 style={{ margin: '0 0 12px', fontSize: 26, fontWeight: 900, color: '#0f172a' }}>You're Offline</h3>
                                <p style={{ margin: '0 0 32px', color: '#64748b', fontWeight: 500, fontSize: 16 }}>Head to the radar to find your next delivery.</p>
                                <button onClick={() => setTab('radar')} className="poly-btn-primary poly-dark" style={{ padding: '16px 40px', borderRadius: 30, fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>Go to Radar</button>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                    <span style={{ background: myShipment.status === 'Accepted' ? '#eff6ff' : '#ecfdf5', color: myShipment.status === 'Accepted' ? '#2563eb' : '#10b981', padding: '8px 20px', borderRadius: 24, fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
                                        {myShipment.status === 'Accepted' ? 'Heading to Pickup' : 'Heading to Drop-off'}
                                    </span>
                                    <span className="text-gradient-success" style={{ fontSize: 26, fontWeight: 900 }}>Rs {myShipment.price?.toLocaleString()}</span>
                                </div>
                                
                                <div style={{ background: 'rgba(255, 255, 255, 0.5)', borderRadius: 20, padding: 24, marginBottom: 28, border: '1px solid rgba(255,255,255,0.8)', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5)' }}>
                                    <h3 style={{ margin: '0 0 20px', fontSize: 19, fontWeight: 800, color: '#0f172a' }}>{myShipment.product}</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        <div style={{ display: 'flex', gap: 16, alignItems: 'center', opacity: myShipment.status === 'Accepted' ? 1 : 0.4 }}>
                                            <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#2563eb', boxShadow: '0 0 0 4px rgba(37,99,235,0.2)' }} />
                                            <span style={{ fontSize: 16, color: '#0f172a', fontWeight: 700 }}>{myShipment.from}</span>
                                        </div>
                                        <div style={{ borderLeft: `2px dashed #cbd5e1`, height: 28, marginLeft: 7, marginTop: -12, marginBottom: -12 }} />
                                        <div style={{ display: 'flex', gap: 16, alignItems: 'center', opacity: myShipment.status === 'In Transit' ? 1 : 0.4 }}>
                                            <div style={{ width: 16, height: 16, borderRadius: '4px', background: '#10b981', boxShadow: '0 0 0 4px rgba(16,185,129,0.2)' }} />
                                            <span style={{ fontSize: 16, color: '#0f172a', fontWeight: 700 }}>{myShipment.to}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 'auto' }}>
                                    {myShipment.status === 'Accepted' ? (
                                        <button onClick={handleMarkPickedUp} className="poly-btn-primary" style={{ padding: '20px', borderRadius: 20, fontWeight: 800, fontSize: 18, cursor: 'pointer' }}>
                                            Mark as Picked Up
                                        </button>
                                    ) : (
                                        <button onClick={handleComplete} className="poly-btn-success poly-btn-primary" style={{ padding: '20px', borderRadius: 20, fontWeight: 800, fontSize: 18, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
                                            <CheckCircle size={24} />
                                            Order Delivered
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* EARNINGS */}
                {tab === 'earnings' && (
                    <div style={{ padding: '32px 24px', paddingBottom: 140 }}>
                        {/* Creative Vibrant Total Earnings Card */}
                        <div style={{ 
                            background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)', 
                            borderRadius: 36, padding: 40, marginBottom: 40, 
                            position: 'relative', overflow: 'hidden',
                            boxShadow: '0 20px 40px -10px rgba(37,99,235,0.4), inset 0 2px 0 rgba(255,255,255,0.4)'
                        }}>
                            {/* Decorative Glass Circles */}
                            <div style={{ position: 'absolute', top: -40, right: -20, width: 150, height: 150, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', borderRadius: '50%' }} />
                            <div style={{ position: 'absolute', bottom: -60, right: 40, width: 200, height: 200, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', borderRadius: '50%' }} />
                            
                            <div style={{ position: 'relative', zIndex: 1, color: 'white' }}>
                                <p style={{ margin: '0 0 8px', fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2 }}>Balance</p>
                                <h2 style={{ margin: '0 0 32px', fontSize: 52, fontWeight: 900, textShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
                                    <span style={{ fontSize: 32, opacity: 0.8, marginRight: 4 }}>Rs</span> 
                                    {totalEarnings.toLocaleString()}
                                </h2>
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div>
                                        <p style={{ margin: '0 0 4px', fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>COMPLETED TRIPS</p>
                                        <p style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>{myHistory.length}</p>
                                    </div>
                                    <button style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 20, padding: '10px 20px', color: 'white', fontWeight: 800, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                                        Withdraw
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Mini Chart / Analytics Section */}
                        <div style={{ marginBottom: 32 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#0f172a' }}>Weekly Goal</h3>
                                <span style={{ background: '#eff6ff', color: '#2563eb', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800 }}>82%</span>
                            </div>
                            <div style={{ background: 'rgba(255, 255, 255, 0.5)', borderRadius: 20, padding: 24, border: '1px solid rgba(255,255,255,0.8)', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: 100, gap: 8 }}>
                                    {[30, 70, 45, 90, 60, 20, 85].map((h, i) => (
                                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: '100%', height: 100, background: 'rgba(37,99,235,0.1)', borderRadius: 10, position: 'relative', overflow: 'hidden' }}>
                                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${h}%`, background: h > 80 ? 'linear-gradient(to top, #3b82f6, #2563eb)' : '#bfdbfe', borderRadius: 10, transition: 'height 1s ease' }} />
                                            </div>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>{['M','T','W','T','F','S','S'][i]}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#0f172a' }}>Transactions</h3>
                        </div>

                        {myHistory.length === 0 ? (
                            <div style={{ background: 'rgba(255,255,255,0.5)', borderRadius: 24, padding: 40, textAlign: 'center', border: '2px dashed #cbd5e1' }}>
                                <p style={{ color: '#64748b', margin: 0, fontWeight: 600, fontSize: 16 }}>No completed trips yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {myHistory.map(h => (
                                    <div key={h.id} className="poly-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 24, border: '1px solid rgba(255,255,255,0.9)' }}>
                                        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                            <div style={{ width: 50, height: 50, borderRadius: 16, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 4px rgba(255,255,255,1)' }}>
                                                <CheckCircle size={24} color="#10b981" strokeWidth={2.5} />
                                            </div>
                                            <div>
                                                <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{h.product}</p>
                                                <p style={{ margin: 0, fontSize: 13, color: '#64748b', fontWeight: 600 }}>{new Date(h.completedAt || Date.now()).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <span className="text-gradient-success" style={{ fontSize: 18, fontWeight: 900 }}>+Rs {h.price?.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Floating Pill Bottom Navigation */}
            <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, width: '90%', maxWidth: 400 }}>
                <nav className="nav-pill" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button onClick={() => setTab('radar')} className={`nav-item ${tab === 'radar' ? 'active' : ''}`} style={{ background: tab === 'radar' ? '#eff6ff' : 'transparent', border: 'none', display: 'flex', padding: '12px 24px', alignItems: 'center', gap: 10, color: tab === 'radar' ? '#2563eb' : '#64748b', cursor: 'pointer' }}>
                        <MapIcon size={24} strokeWidth={tab === 'radar' ? 2.5 : 2} />
                        {tab === 'radar' && <span style={{ fontSize: 14, fontWeight: 800 }}>Radar</span>}
                    </button>
                    
                    <button onClick={() => setTab('run')} className={`nav-item ${tab === 'run' ? 'active' : ''}`} style={{ background: tab === 'run' ? '#eff6ff' : 'transparent', border: 'none', display: 'flex', padding: '12px 24px', alignItems: 'center', gap: 10, color: tab === 'run' ? '#2563eb' : '#64748b', position: 'relative', cursor: 'pointer' }}>
                        <Compass size={24} strokeWidth={tab === 'run' ? 2.5 : 2} />
                        {tab === 'run' && <span style={{ fontSize: 14, fontWeight: 800 }}>Run</span>}
                        {myShipment && tab !== 'run' && <div style={{ position: 'absolute', top: 10, right: 20, width: 10, height: 10, borderRadius: '50%', background: '#ef4444', border: '2px solid white' }} />}
                    </button>
                    
                    <button onClick={() => setTab('earnings')} className={`nav-item ${tab === 'earnings' ? 'active' : ''}`} style={{ background: tab === 'earnings' ? '#eff6ff' : 'transparent', border: 'none', display: 'flex', padding: '12px 24px', alignItems: 'center', gap: 10, color: tab === 'earnings' ? '#2563eb' : '#64748b', cursor: 'pointer' }}>
                        <DollarSign size={24} strokeWidth={tab === 'earnings' ? 2.5 : 2} />
                        {tab === 'earnings' && <span style={{ fontSize: 14, fontWeight: 800 }}>Earnings</span>}
                    </button>
                </nav>
            </div>
        </div>
    );
}
