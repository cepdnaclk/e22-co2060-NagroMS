import React, { useState } from 'react';
import { MapPin, Truck, AlertCircle } from 'lucide-react';

export default function DeliveryFeeCalculator() {
    // We mock a Farmer's location (e.g., Dambulla Economic Centre)
    const FARMER_LOCATION = { lat: 7.8731, lng: 80.6511, name: 'Dambulla Farm' };
    
    // Fee constants
    const BASE_FARE = 500; // Rs. 500 fixed base fare
    const PER_KM_RATE = 150; // Rs. 150 per kilometer

    const [customerLocation, setCustomerLocation] = useState(null);
    const [distance, setDistance] = useState(null);
    const [fee, setFee] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // The Haversine Formula to calculate distance between two coordinates in km
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const toRad = (value) => (value * Math.PI) / 180;
        const R = 6371; // Earth's radius in km
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        // Straight line distance
        const straightLineKm = R * c; 
        
        // Road multiplier (roads aren't perfectly straight, usually ~1.3x longer)
        return straightLineKm * 1.3; 
    };

    const handleGetLocation = () => {
        setLoading(true);
        setError('');

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    setCustomerLocation({ lat, lng });
                    
                    // Calculate distance
                    const distKm = calculateDistance(FARMER_LOCATION.lat, FARMER_LOCATION.lng, lat, lng);
                    setDistance(distKm);
                    
                    // Calculate fee
                    const totalFee = BASE_FARE + (distKm * PER_KM_RATE);
                    setFee(totalFee);
                    
                    setLoading(false);
                },
                (err) => {
                    setError("Location access denied or unavailable. Please allow location permissions.");
                    setLoading(false);
                }
            );
        } else {
            setError("Geolocation is not supported by your browser.");
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', padding: '24px', background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontFamily: 'sans-serif' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={20} color="#16a34a" /> 
                Delivery Fee Estimator
            </h3>

            <div style={{ marginBottom: '20px', padding: '12px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #dcfce7', fontSize: '14px', color: '#166534' }}>
                <strong>Farmer Location:</strong> {FARMER_LOCATION.name}
            </div>

            <button 
                onClick={handleGetLocation} 
                disabled={loading}
                style={{ width: '100%', padding: '12px', background: '#111827', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            >
                <MapPin size={18} />
                {loading ? 'Locating...' : 'Get My Location & Calculate'}
            </button>

            {error && (
                <div style={{ marginTop: '16px', padding: '12px', background: '#fef2f2', color: '#dc2626', borderRadius: '8px', fontSize: '13px', display: 'flex', gap: '8px' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    {error}
                </div>
            )}

            {distance !== null && (
                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#4b5563', fontSize: '14px' }}>
                        <span>Estimated Road Distance:</span>
                        <span style={{ fontWeight: 600, color: '#111827' }}>{distance.toFixed(1)} km</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#4b5563', fontSize: '14px' }}>
                        <span>Base Fare:</span>
                        <span style={{ fontWeight: 600, color: '#111827' }}>Rs. {BASE_FARE}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: '#4b5563', fontSize: '14px' }}>
                        <span>Distance Charge (Rs. {PER_KM_RATE}/km):</span>
                        <span style={{ fontWeight: 600, color: '#111827' }}>Rs. {(distance * PER_KM_RATE).toFixed(2)}</span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '16px' }}>Total Delivery Fee:</span>
                        <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '18px' }}>Rs. {fee.toFixed(0)}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
