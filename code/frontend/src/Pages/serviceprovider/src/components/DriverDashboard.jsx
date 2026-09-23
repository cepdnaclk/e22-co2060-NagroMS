import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../../../../utils/firebase.js';
import { collection, onSnapshot, doc, updateDoc, setDoc, query, where, getDoc } from 'firebase/firestore';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Truck, MapPin, CheckCircle, Navigation, Package, ArrowRight, User } from 'lucide-react';

const ds = {
    bg: '#0f172a', surface: '#1e293b',
    blue: '#3b82f6', green: '#10b981', red: '#ef4444',
    text: '#f8fafc', textSec: '#94a3b8',
    border: '#334155'
};

// ── Leaflet Icons ──
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const makeIcon = (html, size = 32) => L.divIcon({ className: '', html, iconSize: [size, size], iconAnchor: [size/2, size/2] });
const TRUCK_ICON = makeIcon(`<div style="width:32px;height:32px;border-radius:50%;background:#3b82f6;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid #fff;">🚚</div>`);
const PICKUP_ICON = makeIcon(`<div style="width:24px;height:24px;border-radius:50%;background:#f59e0b;display:flex;align-items:center;justify-content:center;font-size:12px;border:2px solid #fff;">📦</div>`, 24);
const DROP_ICON = makeIcon(`<div style="width:24px;height:24px;border-radius:50%;background:#10b981;display:flex;align-items:center;justify-content:center;font-size:12px;border:2px solid #fff;">🏁</div>`, 24);

function MapRecenter({ lat, lng, zoom = 14 }) {
    const map = useMap();
    useEffect(() => { if (lat && lng) map.flyTo([lat, lng], zoom, { animate: true }); }, [lat, lng, zoom]);
    return null;
}

// ── Coordinate Resolver (Mock for demo) ──
const resolveCityCoords = (str) => {
    const s = (str || '').toLowerCase();
    if (s.includes('jaffna'))       return { lat: 9.6615, lng: 80.0255 };
    if (s.includes('anuradhapura')) return { lat: 8.3122, lng: 80.4037 };
    if (s.includes('kandy'))        return { lat: 7.2906, lng: 80.6337 };
    if (s.includes('galle'))        return { lat: 6.0535, lng: 80.2210 };
    return { lat: 6.9271, lng: 79.8612 }; // Colombo default
};

export function DriverDashboard({ onNavigate }) {
    const [deliveries, setDeliveries] = useState([]);
    const [activeShipment, setActiveShipment] = useState(null);
    const [driverName, setDriverName] = useState('Driver');
    const [gpsEnabled, setGpsEnabled] = useState(false);
    const gpsInterval = useRef(null);

    // Fetch driver details
    useEffect(() => {
        if (auth.currentUser) {
            getDoc(doc(db, 'users', auth.currentUser.uid)).then(snap => {
                if (snap.exists()) setDriverName(snap.data().fullName || 'Driver');
            });
        }
    }, []);

    // Listen to pending deliveries
    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'deliveries'), (snapshot) => {
            const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setDeliveries(list.filter(d => d.status === 'Pending'));
        });
        return () => unsub();
    }, []);

    // Listen to my active shipment
    useEffect(() => {
        const q = query(collection(db, 'shipments'), where('driverId', '==', auth.currentUser?.uid || 'temp'));
        const unsub = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                // Find first non-delivered shipment
                const active = snapshot.docs.map(d => ({ id: d.id, ...d.data() })).find(s => s.status !== 'Delivered');
                setActiveShipment(active || null);
            } else {
                setActiveShipment(null);
            }
        });
        return () => unsub();
    }, []);

    // Stop GPS on unmount
    useEffect(() => {
        return () => { if (gpsInterval.current) clearInterval(gpsInterval.current); };
    }, []);

    const acceptJob = async (delivery) => {
        const pickupCoords = resolveCityCoords(delivery.pickup);
        const dropCoords = resolveCityCoords(delivery.drop);
        const now = new Date().toISOString();

        // 1. Mark delivery as accepted
        await updateDoc(doc(db, 'deliveries', delivery.id), { status: 'Accepted' });

        // 2. Create shipment bound to this driver
        const newShip = {
            orderId: delivery.orderId || delivery.id,
            customerId: delivery.customerId || '',
            farmer: delivery.farmer,
            driver: driverName,
            driverId: auth.currentUser?.uid || 'temp',
            vehicle: 'Personal Vehicle',
            from: delivery.pickup,
            to: delivery.drop,
            progress: 0,
            status: 'Accepted',
            eta: 'Awaiting pickup',
            product: `${delivery.product} (${delivery.qty})`,
            acceptedAt: now,
            trackingHistory: [
                { status: 'Order Placed', date: delivery.orderDate || now, completed: true },
                { status: 'Order Accepted', date: now, completed: true }
            ],
            gps: {
                pickupLat: pickupCoords.lat, pickupLng: pickupCoords.lng,
                dropLat: dropCoords.lat, dropLng: dropCoords.lng,
                driverLat: pickupCoords.lat, driverLng: pickupCoords.lng,
            }
        };
        await setDoc(doc(db, 'shipments', delivery.id), newShip);
    };

    const updateStatus = async (newStatus, progress, eta) => {
        if (!activeShipment) return;
        const sfDoc = doc(db, 'shipments', activeShipment.id);
        const now = new Date().toISOString();
        const history = activeShipment.trackingHistory || [];

        const updates = {
            status: newStatus,
            progress,
            eta,
            trackingHistory: [...history, { status: newStatus, date: now, completed: true }]
        };

        if (newStatus === 'In Transit') {
            updates.startedAt = now;
            startLiveTracking(activeShipment.id);
        } else if (newStatus === 'Delivered') {
            updates.deliveredAt = now;
            stopLiveTracking();
            // Update orders & deliveries collections
            try { await updateDoc(doc(db, 'deliveries', activeShipment.id), { status: 'Delivered' }); } catch {}
            if (activeShipment.orderId) {
                try { await updateDoc(doc(db, 'orders', activeShipment.orderId), { status: 'delivered', deliveredAt: now }); } catch {}
            }
        } else if (newStatus === 'Picked Up') {
            updates.pickedUp = true;
            updates.pickedUpAt = now;
            try { await updateDoc(doc(db, 'deliveries', activeShipment.id), { status: 'Picked Up' }); } catch {}
        }

        await updateDoc(sfDoc, updates);
    };

    const startLiveTracking = (shipmentId) => {
        if (gpsInterval.current) clearInterval(gpsInterval.current);
        setGpsEnabled(true);

        const progressRef = { current: 25 };

        const broadcast = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (pos) => {
                        progressRef.current = Math.min(98, progressRef.current + 2);
                        await updateDoc(doc(db, 'shipments', shipmentId), {
                            'gps.driverLat': pos.coords.latitude,
                            'gps.driverLng': pos.coords.longitude,
                            progress: progressRef.current,
                        });
                    },
                    (err) => console.error("GPS Error:", err),
                    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
                );
            }
        };
        broadcast();
        gpsInterval.current = setInterval(broadcast, 5000);
    };

    const stopLiveTracking = () => {
        if (gpsInterval.current) clearInterval(gpsInterval.current);
        setGpsEnabled(false);
    };

    return (
        <div style={{ background: ds.bg, minHeight: '100vh', width: '100%', color: ds.text, fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <header style={{ background: ds.surface, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${ds.border}`, position: 'sticky', top: 0, zIndex: 100 }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>NagroMS Driver</h1>
                    <p style={{ margin: 0, fontSize: 12, color: ds.textSec }}>Welcome back, {driverName}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {gpsEnabled && <span style={{ width: 10, height: 10, borderRadius: '50%', background: ds.green, boxShadow: `0 0 8px ${ds.green}`, animation: 'pulse 1.5s infinite' }} />}
                    <button onClick={() => onNavigate('landing')} style={{ background: 'transparent', border: 'none', color: ds.textSec, cursor: 'pointer' }}><User size={20} /></button>
                </div>
            </header>

            <main style={{ padding: '20px', maxWidth: 600, margin: '0 auto' }}>
                {activeShipment ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ background: ds.surface, borderRadius: 16, padding: 16, border: `1px solid ${ds.border}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <Badge status={activeShipment.status} />
                                <span style={{ fontSize: 12, color: ds.textSec, fontFamily: "'JetBrains Mono', monospace" }}>{activeShipment.id}</span>
                            </div>
                            <h2 style={{ margin: '0 0 8px 0', fontSize: 16 }}>{activeShipment.product}</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: ds.textSec }}>
                                <MapPin size={14} /> {activeShipment.from} <ArrowRight size={14} /> {activeShipment.to}
                            </div>
                        </div>

                        {/* Map View */}
                        <div style={{ height: 300, borderRadius: 16, overflow: 'hidden', position: 'relative', border: `1px solid ${ds.border}` }}>
                            <div style={{ position: 'absolute', inset: 0, filter: 'invert(100%) hue-rotate(180deg) brightness(0.92) contrast(0.88) saturate(0.7)' }}>
                                <MapContainer center={[activeShipment.gps.driverLat, activeShipment.gps.driverLng]} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <MapRecenter lat={activeShipment.gps.driverLat} lng={activeShipment.gps.driverLng} />
                                    <Marker position={[activeShipment.gps.pickupLat, activeShipment.gps.pickupLng]} icon={PICKUP_ICON} />
                                    <Marker position={[activeShipment.gps.dropLat, activeShipment.gps.dropLng]} icon={DROP_ICON} />
                                    <Marker position={[activeShipment.gps.driverLat, activeShipment.gps.driverLng]} icon={TRUCK_ICON} />
                                    <Polyline positions={[[activeShipment.gps.pickupLat, activeShipment.gps.pickupLng], [activeShipment.gps.driverLat, activeShipment.gps.driverLng]]} pathOptions={{ color: ds.blue, weight: 5 }} />
                                </MapContainer>
                            </div>
                        </div>

                        {/* Action Controls */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                            {activeShipment.status === 'Accepted' && (
                                <ActionButton icon={<Package/>} label="Mark Picked Up" color={ds.blue} onClick={() => updateStatus('Picked Up', 10, 'Calculating...')} />
                            )}
                            {activeShipment.status === 'Picked Up' && (
                                <ActionButton icon={<Navigation/>} label="Start Transit & GPS" color={ds.green} onClick={() => updateStatus('In Transit', 25, 'On the way')} />
                            )}
                            {activeShipment.status === 'In Transit' && (
                                <ActionButton icon={<CheckCircle/>} label="Mark Delivered" color={ds.textSec} bg={ds.surface} border={`1px solid ${ds.border}`} onClick={() => updateStatus('Delivered', 100, '0 min')} />
                            )}
                        </div>
                    </div>
                ) : (
                    <div>
                        <h2 style={{ fontSize: 16, marginBottom: 16, fontWeight: 600 }}>Available Jobs Nearby</h2>
                        {deliveries.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: ds.textSec }}>
                                <Truck size={48} style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
                                <p>No pending jobs available right now.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {deliveries.map(d => (
                                    <div key={d.id} style={{ background: ds.surface, borderRadius: 12, padding: 16, border: `1px solid ${ds.border}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                            <span style={{ fontSize: 14, fontWeight: 600 }}>{d.product}</span>
                                            <span style={{ fontSize: 14, fontWeight: 700, color: ds.green }}>Rs {d.price.toLocaleString()}</span>
                                        </div>
                                        <div style={{ fontSize: 12, color: ds.textSec, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={12} /> {d.pickup} → {d.drop}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Package size={12} /> {d.qty} • {d.distance}</div>
                                        </div>
                                        <button 
                                            onClick={() => acceptJob(d)}
                                            style={{ width: '100%', padding: '10px', background: ds.blue, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
                                        >
                                            Accept Job
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
            <style>{`
                @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } 70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
            `}</style>
        </div>
    );
}

function ActionButton({ icon, label, color, bg, border, onClick }) {
    return (
        <button onClick={onClick} style={{ width: '100%', padding: '14px', background: bg || color, color: bg ? color : '#fff', border: border || 'none', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            {icon} {label}
        </button>
    );
}

function Badge({ status }) {
    const colors = {
        'Accepted': { bg: 'rgba(59,130,246,0.1)', color: ds.blue },
        'Picked Up': { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
        'In Transit': { bg: 'rgba(16,185,129,0.1)', color: ds.green },
    };
    const c = colors[status] || colors['Accepted'];
    return (
        <span style={{ padding: '4px 10px', borderRadius: 99, background: c.bg, color: c.color, fontSize: 11, fontWeight: 700 }}>
            {status}
        </span>
    );
}
