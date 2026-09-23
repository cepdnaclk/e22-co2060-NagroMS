import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Webpack/React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom icon for a delivery truck/driver
const truckIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/713/713311.png', // Temporary free truck icon
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

// Component to recenter map when driver moves
const RecenterMap = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.setView([location.lat, location.lng], map.getZoom(), {
        animate: true,
      });
    }
  }, [location, map]);
  return null;
};

const LiveMap = ({ driverLocation, destinationLocation }) => {
  // Default to a central location (e.g., Colombo, Sri Lanka) if no data
  const defaultCenter = [6.9271, 79.8612];
  
  const currentCenter = driverLocation 
    ? [driverLocation.lat, driverLocation.lng] 
    : defaultCenter;

  return (
    <div style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden', zIndex: 0, position: 'relative', border: '1px solid #e5e7eb' }}>
      <MapContainer center={currentCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {driverLocation && (
          <>
            <RecenterMap location={driverLocation} />
            <Marker position={[driverLocation.lat, driverLocation.lng]} icon={truckIcon}>
              <Popup>Driver is here!</Popup>
            </Marker>
          </>
        )}

        {destinationLocation && (
          <Marker position={[destinationLocation.lat, destinationLocation.lng]}>
            <Popup>Delivery Destination</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default LiveMap;
