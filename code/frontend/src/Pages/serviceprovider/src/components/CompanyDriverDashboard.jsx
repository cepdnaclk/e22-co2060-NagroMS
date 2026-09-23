import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation, CheckCircle, Map as MapIcon, Compass, Truck } from 'lucide-react';
import { db } from '../../../../utils/firebase.js';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
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

  .mesh-bg {
    background-color: #f8fafc;
    background-image: 
      radial-gradient(at 0% 0%, hsla(253,16%,7%,0.05) 0, transparent 50%), 
      radial-gradient(at 50% 0%, hsla(225,39%,30%,0.05) 0, transparent 50%), 
      radial-gradient(at 100% 0%, hsla(339,49%,30%,0.05) 0, transparent 50%);
    background-size: cover;
    background-position: center;
  }

  .poly-card {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(40px) saturate(200%);
    -webkit-backdrop-filter: blur(40px) saturate(200%);
    border: 1px solid rgba(255, 255, 255, 0.9);
    box-shadow: 
      0 20px 40px -10px rgba(0, 0, 0, 0.05),
      0 1px 3px rgba(0,0,0,0.02),
      inset 0 1px 0 rgba(255, 255, 255, 1);
    border-radius: 32px;
  }

  .poly-btn-primary {
    background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
    color: white;
    border: none;
    box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.4), inset 0 2px 0 rgba(255,255,255,0.2);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .poly-btn-primary:active { transform: translateY(2px); }

  .poly-btn-success {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4), inset 0 2px 0 rgba(255,255,255,0.2);
  }
  .poly-btn-success:active { transform: translateY(2px); }
`;

const truckIcon = L.divIcon({
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

function MapFitter({ bounds }) {
    const map = useMap();
    useEffect(() => {
        if (bounds && bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50], animate: true });
        }
    }, [bounds, map]);
    return null;
}

export default function CompanyDriverDashboard() {
    const { shipmentId } = useParams();
    const navigate = useNavigate();
    
    const [shipment, setShipment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isTracking, setIsTracking] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [routePath, setRoutePath] = useState([]);
    const [mapBounds, setMapBounds] = useState([]);
    
    const watchIdRef = useRef(null);

    useEffect(() => {
        if (!shipmentId) return;
        const unsub = onSnapshot(doc(db, 'shipments', shipmentId), (docSnap) => {
            if (docSnap.exists()) {
                setShipment({ id: docSnap.id, ...docSnap.data() });
                setLoading(false);
            } else {
                setError('Shipment not found or access expired.');
                setLoading(false);
            }
        }, (err) => {
            setError('Error loading tracking data.');
            setLoading(false);
        });

        return () => unsub();
    }, [shipmentId]);

    useEffect(() => {
        const fetchRoute = async () => {
            if (!shipment) { setRoutePath([]); return; }
            try {
                let origin = null; let dest = null;
                // For simplified visual, route from current driver GPS to Destination or Pickup based on status
                if (shipment.status === 'Accepted' || shipment.status === 'Pending') {
                    origin = userLocation ? [userLocation.lat, userLocation.lng] : [shipment.gps.driverLat || 6.9, shipment.gps.driverLng || 79.8];
                    dest = [shipment.gps.pickupLat, shipment.gps.pickupLng];
                } else if (shipment.status === 'In Transit') {
                    origin = userLocation ? [userLocation.lat, userLocation.lng] : [shipment.gps.driverLat || 6.9, shipment.gps.driverLng || 79.8];
                    dest = [shipment.gps.dropLat, shipment.gps.dropLng];
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
    }, [shipment, userLocation]);

    const toggleTracking = () => {
        if (!shipment) return;
        if (isTracking) {
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
            setIsTracking(false);
        } else {
            if ('geolocation' in navigator) {
                setIsTracking(true);
                watchIdRef.current = navigator.geolocation.watchPosition(
                    (pos) => {
                        const { latitude, longitude } = pos.coords;
                        setUserLocation({ lat: latitude, lng: longitude });
                        updateDoc(doc(db, 'shipments', shipment.id), { 
                            'gps.driverLat': latitude, 
                            'gps.driverLng': longitude,
                            ...(shipment.status === 'Accepted' || shipment.status === 'Pending' ? { status: 'In Transit', progress: 10 } : {})
                        });
                    },
                    (err) => { 
                        alert("Please enable GPS permissions to track route.");
                        setIsTracking(false); 
                    },
                    { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
                );
            } else {
                alert("Geolocation is not supported by your browser.");
            }
        }
    };

    const handleMarkPickedUp = async () => {
        if (!shipment) return;
        try {
            await updateDoc(doc(db, 'shipments', shipment.id), { status: 'In Transit', progress: 50 });
            await updateDoc(doc(db, 'deliveries', shipment.id), { status: 'In Transit' });
        } catch (e) { console.error(e); }
    };

    const handleComplete = async () => {
        if (!shipment) return;
        try {
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
            setIsTracking(false);
            await updateDoc(doc(db, 'shipments', shipment.id), { status: 'Delivered', progress: 100, completedAt: new Date().toISOString() });
            await updateDoc(doc(db, 'deliveries', shipment.id), { status: 'Delivered' });
        } catch (e) { console.error(e); }
    };

    if (loading) return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Loading route...</div>;
    if (error) return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red'}}>{error}</div>;

    const isDelivered = shipment?.status === 'Delivered';

    return (
        <div className="mesh-bg" style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <style>{customCss}</style>
            
            {/* Header */}
            <header style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 500, position: 'sticky', top: 0, borderBottom: '1px solid rgba(255,255,255,1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '14px', background: 'linear-gradient(135deg, #0f172a, #1e293b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                        <Truck size={24} />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>NagroMS Fleet</h1>
                        <p style={{ margin: 0, fontSize: 12, color: '#64748b', fontWeight: 600 }}>Driver ID: {shipment?.driver || 'Unassigned'}</p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ flex: 1, position: 'relative' }}>
                {!isDelivered ? (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '45%', zIndex: 0 }}>
                        <MapContainer center={[7.8731, 80.7718]} zoom={8} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                            
                            {userLocation && <Marker position={[userLocation.lat, userLocation.lng]} icon={truckIcon} />}
                            <MapFitter bounds={mapBounds} />

                            {routePath.length > 0 && (
                                <>
                                    <Polyline positions={routePath} color="#2563eb" weight={6} opacity={0.8} />
                                    {(shipment.status === 'Accepted' || shipment.status === 'Pending') ? (
                                        <Marker position={[shipment.gps.pickupLat, shipment.gps.pickupLng]} icon={targetIcon}><Popup>Pickup Location</Popup></Marker>
                                    ) : (
                                        <Marker position={[shipment.gps.dropLat, shipment.gps.dropLng]} icon={targetIcon}><Popup>Dropoff Location</Popup></Marker>
                                    )}
                                </>
                            )}
                        </MapContainer>
                    </div>
                ) : (
                    <div style={{ height: '55%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ecfdf5' }}>
                        <div style={{ textAlign: 'center' }}>
                            <CheckCircle size={80} color="#10b981" style={{ marginBottom: 20 }} />
                            <h2 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: '#064e3b' }}>Delivery Complete!</h2>
                        </div>
                    </div>
                )}

                {/* Bottom Sheet Overlay */}
                <div className="poly-card" style={{ position: 'absolute', bottom: 24, left: 16, right: 16, maxHeight: '65%', padding: 28, zIndex: 10, display: 'flex', flexDirection: 'column' }}>
                    {isDelivered ? (
                        <div style={{ textAlign: 'center', marginTop: 'auto', marginBottom: 'auto' }}>
                            <p style={{ fontSize: 16, color: '#64748b', fontWeight: 600, marginBottom: 30 }}>Great job! You can close this window. Your manager has been notified.</p>
                            <button onClick={() => window.close()} className="poly-btn-primary" style={{ padding: '16px 40px', borderRadius: 20, fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>Close Window</button>
                        </div>
                    ) : (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <span style={{ background: (shipment.status === 'Accepted' || shipment.status === 'Pending') ? '#eff6ff' : '#ecfdf5', color: (shipment.status === 'Accepted' || shipment.status === 'Pending') ? '#2563eb' : '#10b981', padding: '8px 20px', borderRadius: 24, fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                                    {shipment.status === 'Pending' ? 'Route Assigned' : (shipment.status === 'Accepted' ? 'Heading to Pickup' : 'Heading to Drop-off')}
                                </span>
                                <span style={{ background: isTracking ? '#ecfdf5' : '#f1f5f9', color: isTracking ? '#10b981' : '#64748b', padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: isTracking ? '#10b981' : '#cbd5e1' }} />
                                    {isTracking ? 'GPS Live' : 'GPS Paused'}
                                </span>
                            </div>
                            
                            <div style={{ background: 'rgba(255, 255, 255, 0.5)', borderRadius: 20, padding: 20, marginBottom: 24, border: '1px solid rgba(255,255,255,0.8)' }}>
                                <h3 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 800, color: '#0f172a' }}>{shipment.product}</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', opacity: (shipment.status === 'Accepted' || shipment.status === 'Pending') ? 1 : 0.4 }}>
                                        <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#2563eb', boxShadow: '0 0 0 4px rgba(37,99,235,0.2)' }} />
                                        <span style={{ fontSize: 15, color: '#0f172a', fontWeight: 600 }}>{shipment.from}</span>
                                    </div>
                                    <div style={{ borderLeft: `2px dashed #cbd5e1`, height: 20, marginLeft: 6, marginTop: -8, marginBottom: -8 }} />
                                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', opacity: shipment.status === 'In Transit' ? 1 : 0.4 }}>
                                        <div style={{ width: 14, height: 14, borderRadius: '4px', background: '#10b981', boxShadow: '0 0 0 4px rgba(16,185,129,0.2)' }} />
                                        <span style={{ fontSize: 15, color: '#0f172a', fontWeight: 600 }}>{shipment.to}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 'auto' }}>
                                {!isTracking && shipment.status !== 'Delivered' && (
                                    <button onClick={toggleTracking} className="poly-btn-primary" style={{ padding: '18px', borderRadius: 20, fontWeight: 800, fontSize: 16, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
                                        <Navigation size={20} />
                                        Start Driving
                                    </button>
                                )}

                                {isTracking && (shipment.status === 'Accepted' || shipment.status === 'Pending') && (
                                    <button onClick={handleMarkPickedUp} className="poly-btn-primary" style={{ padding: '18px', borderRadius: 20, fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>
                                        Mark as Picked Up
                                    </button>
                                )}

                                {isTracking && shipment.status === 'In Transit' && (
                                    <button onClick={handleComplete} className="poly-btn-success poly-btn-primary" style={{ padding: '18px', borderRadius: 20, fontWeight: 800, fontSize: 16, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
                                        <CheckCircle size={20} />
                                        Order Delivered
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
