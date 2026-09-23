import React, { useState, useEffect, useRef } from 'react';
import { Navigation, CheckCircle, MapPin, DollarSign, Map as MapIcon, Compass } from 'lucide-react';
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

const ds = {
    bg: '#f1f5f9', surface: '#ffffff', border: '#e2e8f0', text: '#0f172a', textSec: '#64748b',
    blue: '#2563eb', blueLt: '#eff6ff', green: '#16a34a', greenLt: '#f0fdf4',
    dark: '#1e293b',
    shadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
    font: "'Inter', sans-serif"
};

// Custom icons
const createPriceIcon = (price) => L.divIcon({
    className: 'custom-price-icon',
    html: `<div style="background: #1e293b; color: white; padding: 4px 8px; border-radius: 12px; font-weight: bold; font-size: 12px; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); white-space: nowrap;">Rs ${(price/1000).toFixed(0)}k</div>`,
    iconSize: [60, 24],
    iconAnchor: [30, 24]
});

const userIcon = L.divIcon({
    className: 'custom-user-icon',
    html: '<div style="background: #3b82f6; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 4px rgba(59,130,246,0.3), 0 4px 6px rgba(0,0,0,0.2);"></div>',
    iconSize: [18, 18],
    iconAnchor: [9, 9]
});

const targetIcon = L.divIcon({
    className: 'custom-target-icon',
    html: '<div style="background: #16a34a; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
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

    // Mock GPS coordinates for pending jobs
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
    }, [userEmail]); // Removed tab from dependencies to avoid loop

    // OSRM Routing logic
    useEffect(() => {
        const fetchRoute = async () => {
            if (!myShipment || tab !== 'run') {
                setRoutePath([]);
                return;
            }

            try {
                // Determine origin and destination based on state
                let origin = null;
                let dest = null;

                if (myShipment.status === 'Accepted') {
                    // Heading to pickup
                    origin = userLocation ? [userLocation.lat, userLocation.lng] : [myShipment.gps.driverLat, myShipment.gps.driverLng];
                    dest = [myShipment.gps.pickupLat, myShipment.gps.pickupLng];
                } else if (myShipment.status === 'In Transit') {
                    // Heading to dropoff
                    origin = userLocation ? [userLocation.lat, userLocation.lng] : [myShipment.gps.driverLat, myShipment.gps.driverLng];
                    dest = [myShipment.gps.dropLat, myShipment.gps.dropLng];
                }

                if (origin && dest) {
                    const url = `https://router.project-osrm.org/route/v1/driving/${origin[1]},${origin[0]};${dest[1]},${dest[0]}?overview=full&geometries=geojson`;
                    const res = await fetch(url);
                    const data = await res.json();
                    if (data.routes && data.routes[0]) {
                        // GeoJSON uses [lng, lat], Leaflet uses [lat, lng]
                        const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
                        setRoutePath(coords);
                        
                        // Fit map to route
                        setMapBounds([origin, dest]);
                    }
                }
            } catch (e) {
                console.error("OSRM Route Fetch Error:", e);
            }
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
                    pickupLat: job.mockLat, pickupLng: job.mockLng,
                    dropLat: 6.9271, dropLng: 79.8612 // Example Colombo dropoff
                }
            };
            await setDoc(doc(db, 'shipments', job.id), newShip);
            setSelectedJob(null);
            setTab('run');
            
            // Automatically start tracking
            toggleTracking(true);
        } catch (e) {
            console.error(e); alert("Failed to accept job.");
        }
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
                        updateDoc(doc(db, 'shipments', myShipment.id), {
                            'gps.driverLat': latitude, 'gps.driverLng': longitude
                        });
                    },
                    (err) => { console.error(err); setIsTracking(false); },
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
        } catch (e) { console.error(e); }
    };

    const handleComplete = async () => {
        if (!myShipment) return;
        try {
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
            setIsTracking(false);
            await updateDoc(doc(db, 'shipments', myShipment.id), { status: 'Delivered', progress: 100, completedAt: new Date().toISOString() });
            await updateDoc(doc(db, 'deliveries', myShipment.id), { status: 'Delivered' });
            setMyShipment(null);
            setRoutePath([]);
            setTab('earnings');
        } catch (e) { console.error(e); }
    };

    const pendingJobs = deliveries.filter(d => d.status === 'Pending');
    const totalEarnings = myHistory.reduce((sum, h) => sum + (h.price || 0), 0);

    return (
        <div style={{ background: ds.bg, height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', fontFamily: ds.font, overflow: 'hidden' }}>
            {/* Header */}
            <header style={{ background: ds.surface, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 500, boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 20, background: ds.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                        {userName.charAt(0)}
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: ds.text }}>Gig Driver</h1>
                        <p style={{ margin: 0, fontSize: 12, color: ds.green, fontWeight: 600 }}>● Online</p>
                    </div>
                </div>
                <button onClick={() => onNavigate('landing')} style={{ background: ds.bg, border: `1px solid ${ds.border}`, padding: '8px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, color: ds.text, cursor: 'pointer' }}>Log Out</button>
            </header>

            {/* Main Content Area */}
            <main style={{ flex: 1, position: 'relative', background: ds.bg, overflowY: 'auto' }}>
                
                {/* GLOBAL MAP LAYER (Always rendered beneath UI for Radar & Run) */}
                {(tab === 'radar' || tab === 'run') && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: tab === 'run' ? '40%' : 0, zIndex: 0 }}>
                        <MapContainer center={[7.8731, 80.7718]} zoom={8} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
                            
                            {userLocation && <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} />}
                            <MapFitter bounds={mapBounds} />

                            {/* Radar View Markers */}
                            {tab === 'radar' && pendingJobs.map(job => (
                                <Marker 
                                    key={job.id} 
                                    position={[job.mockLat, job.mockLng]} 
                                    icon={createPriceIcon(job.price || 15000)}
                                    eventHandlers={{ click: () => setSelectedJob(job) }}
                                />
                            ))}

                            {/* Active Run View Route */}
                            {tab === 'run' && myShipment && routePath.length > 0 && (
                                <>
                                    <Polyline positions={routePath} color={ds.blue} weight={5} opacity={0.8} />
                                    {/* Destination Marker */}
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

                {/* UI OVERLAYS FOR RADAR */}
                {tab === 'radar' && (
                    <>
                        {/* Top float banner */}
                        <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', padding: '12px 24px', borderRadius: 30, boxShadow: ds.shadow, display: 'flex', alignItems: 'center', gap: 10, zIndex: 10 }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: ds.blue, animation: 'pulse 2s infinite' }} />
                            <span style={{ fontWeight: 700, fontSize: 14 }}>{pendingJobs.length} Requests Nearby</span>
                            <style>{`@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(59,130,246,0.4); } 70% { box-shadow: 0 0 0 10px rgba(59,130,246,0); } 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); } }`}</style>
                        </div>

                        {/* Job Bottom Sheet */}
                        {selectedJob && (
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: ds.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, boxShadow: '0 -10px 25px rgba(0,0,0,0.1)', zIndex: 10, transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                    <div>
                                        <h2 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800 }}>Rs {selectedJob.price?.toLocaleString()}</h2>
                                        <p style={{ margin: 0, fontSize: 14, color: ds.textSec }}>Est. {selectedJob.distance || '120 km'}</p>
                                    </div>
                                    <button onClick={() => setSelectedJob(null)} style={{ background: ds.bg, border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
                                </div>

                                <div style={{ background: ds.bg, borderRadius: 12, padding: 16, marginBottom: 20 }}>
                                    <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700 }}>{selectedJob.product} <span style={{ color: ds.textSec, fontWeight: 400 }}>({selectedJob.qty})</span></h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: ds.blue }} />
                                            <span style={{ fontSize: 14, color: ds.text, fontWeight: 500 }}>{selectedJob.pickup}</span>
                                        </div>
                                        <div style={{ borderLeft: `2px dashed ${ds.border}`, height: 20, marginLeft: 5, marginTop: -8, marginBottom: -8 }} />
                                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                            <div style={{ width: 12, height: 12, borderRadius: '2px', background: ds.green }} />
                                            <span style={{ fontSize: 14, color: ds.text, fontWeight: 500 }}>{selectedJob.drop}</span>
                                        </div>
                                    </div>
                                </div>

                                <button onClick={() => handleAcceptJob(selectedJob)} style={{ width: '100%', padding: '16px', background: ds.dark, color: 'white', border: 'none', borderRadius: 12, fontSize: 18, fontWeight: 700, boxShadow: ds.shadow, cursor: 'pointer' }}>Accept Job</button>
                            </div>
                        )}
                    </>
                )}

                {/* UI OVERLAYS FOR ACTIVE RUN */}
                {tab === 'run' && (
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', background: ds.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, boxShadow: '0 -10px 25px rgba(0,0,0,0.1)', zIndex: 10, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                        {!myShipment ? (
                            <div style={{ textAlign: 'center', margin: 'auto' }}>
                                <Compass size={48} style={{ margin: '0 auto 16px', color: ds.blue, opacity: 0.5 }} />
                                <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800 }}>You're Offline</h3>
                                <p style={{ margin: '0 0 24px', color: ds.textSec }}>Head to the radar to find your next delivery.</p>
                                <button onClick={() => setTab('radar')} style={{ background: ds.dark, color: '#fff', padding: '12px 24px', borderRadius: 30, border: 'none', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>Go to Radar</button>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                    <span style={{ background: myShipment.status === 'Accepted' ? ds.blueLt : ds.greenLt, color: myShipment.status === 'Accepted' ? ds.blue : ds.green, padding: '4px 12px', borderRadius: 20, fontWeight: 800, fontSize: 12, textTransform: 'uppercase' }}>
                                        {myShipment.status === 'Accepted' ? 'Heading to Pickup' : 'Heading to Drop-off'}
                                    </span>
                                    <span style={{ fontSize: 20, fontWeight: 800, color: ds.text }}>Rs {myShipment.price?.toLocaleString()}</span>
                                </div>
                                
                                <div style={{ background: ds.bg, borderRadius: 12, padding: 16, marginBottom: 20 }}>
                                    <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700 }}>{myShipment.product}</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', opacity: myShipment.status === 'Accepted' ? 1 : 0.5 }}>
                                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: ds.blue }} />
                                            <span style={{ fontSize: 14, color: ds.text, fontWeight: 600 }}>{myShipment.from}</span>
                                        </div>
                                        <div style={{ borderLeft: `2px dashed ${ds.border}`, height: 20, marginLeft: 5, marginTop: -8, marginBottom: -8 }} />
                                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', opacity: myShipment.status === 'In Transit' ? 1 : 0.5 }}>
                                            <div style={{ width: 12, height: 12, borderRadius: '2px', background: ds.green }} />
                                            <span style={{ fontSize: 14, color: ds.text, fontWeight: 600 }}>{myShipment.to}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 'auto' }}>
                                    {myShipment.status === 'Accepted' ? (
                                        <button onClick={handleMarkPickedUp} style={{ padding: '16px', borderRadius: 12, border: 'none', background: ds.blue, color: '#fff', fontWeight: 800, fontSize: 16, cursor: 'pointer', boxShadow: '0 4px 6px rgba(37,99,235,0.3)' }}>
                                            Mark as Picked Up
                                        </button>
                                    ) : (
                                        <button onClick={handleComplete} style={{ padding: '16px', borderRadius: 12, border: 'none', background: ds.green, color: '#fff', fontWeight: 800, fontSize: 16, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, boxShadow: '0 4px 6px rgba(22,163,74,0.3)' }}>
                                            <CheckCircle size={20} />
                                            Order Delivered, Cash Collected
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* TAB 3: EARNINGS */}
                {tab === 'earnings' && (
                    <div style={{ padding: 20, paddingBottom: 100 }}>
                        <div style={{ background: `linear-gradient(135deg, ${ds.dark} 0%, #000 100%)`, borderRadius: 24, padding: 30, color: 'white', marginBottom: 24, boxShadow: ds.shadow }}>
                            <p style={{ margin: '0 0 8px', fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Total Earnings</p>
                            <h2 style={{ margin: '0 0 24px', fontSize: 42, fontWeight: 800 }}>Rs {totalEarnings.toLocaleString()}</h2>
                            <div style={{ display: 'flex', gap: 20 }}>
                                <div>
                                    <p style={{ margin: '0 0 4px', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>TRIPS</p>
                                    <p style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{myHistory.length}</p>
                                </div>
                            </div>
                        </div>

                        <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800, color: ds.text }}>Recent Trips</h3>
                        {myHistory.length === 0 ? (
                            <p style={{ color: ds.textSec, textAlign: 'center', marginTop: 40 }}>No completed trips yet.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {myHistory.map(h => (
                                    <div key={h.id} style={{ background: ds.surface, borderRadius: 16, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                            <div style={{ width: 40, height: 40, borderRadius: 12, background: ds.greenLt, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle size={20} color={ds.green} /></div>
                                            <div>
                                                <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: ds.text }}>{h.product}</p>
                                                <p style={{ margin: 0, fontSize: 12, color: ds.textSec }}>{new Date(h.completedAt || Date.now()).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <span style={{ fontSize: 16, fontWeight: 800, color: ds.text }}>+Rs {h.price?.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Sticky Bottom Navigation (Mobile App Style) */}
            <nav style={{ background: ds.surface, display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '16px 10px', paddingBottom: '30px', boxShadow: '0 -4px 20px rgba(0,0,0,0.06)', zIndex: 1000, position: 'relative' }}>
                <button onClick={() => setTab('radar')} style={{ background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: tab === 'radar' ? ds.blue : ds.textSec, cursor: 'pointer' }}>
                    <MapIcon size={24} strokeWidth={tab === 'radar' ? 2.5 : 2} />
                    <span style={{ fontSize: 11, fontWeight: tab === 'radar' ? 800 : 600 }}>Radar</span>
                </button>
                <button onClick={() => setTab('run')} style={{ background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: tab === 'run' ? ds.blue : ds.textSec, position: 'relative', cursor: 'pointer' }}>
                    <Compass size={24} strokeWidth={tab === 'run' ? 2.5 : 2} />
                    <span style={{ fontSize: 11, fontWeight: tab === 'run' ? 800 : 600 }}>My Run</span>
                    {myShipment && <div style={{ position: 'absolute', top: -2, right: 6, width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />}
                </button>
                <button onClick={() => setTab('earnings')} style={{ background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: tab === 'earnings' ? ds.blue : ds.textSec, cursor: 'pointer' }}>
                    <DollarSign size={24} strokeWidth={tab === 'earnings' ? 2.5 : 2} />
                    <span style={{ fontSize: 11, fontWeight: tab === 'earnings' ? 800 : 600 }}>Earnings</span>
                </button>
            </nav>
        </div>
    );
}
