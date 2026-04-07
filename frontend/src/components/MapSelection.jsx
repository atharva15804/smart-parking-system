import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './MapSelection.css';
import garageImage from '../assets/background.jpg';

// Fix for default marker icons in Leaflet with Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMarker = ({ location, isSelected, onSelect }) => {
  const icon = new L.Icon({
    iconUrl: isSelected 
      ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png'
      : 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <Marker 
      position={location.coords} 
      icon={icon} 
      eventHandlers={{ click: () => onSelect(location) }}
    >
      <Popup className="premium-popup">
        <div className="popup-content">
          <h4>{location.name}</h4>
          <p>{location.desc}</p>
          <p className="slots-avail">Available Slots: {location.totalSlots}</p>
          <button 
            className="btn-select-location"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(location);
            }}
          >
            {isSelected ? "Selected" : "Select this Location"}
          </button>
        </div>
      </Popup>
    </Marker>
  );
};

const MapSelection = ({ onLocationConfirm }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const nashikLocations = [
    { id: 1, name: 'City Centre Mall', desc: 'Premium mall parking with 24/7 security.', coords: [19.9911, 73.7638], totalSlots: 30, image: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&q=80&w=800' },
    { id: 2, name: 'Sula Vineyards', desc: 'Secure parking near the vineyards.', coords: [20.0055, 73.6896], totalSlots: 30, image: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Sula_Vineyards_in_Nashik.jpg' },
    { id: 3, name: 'Panchavati', desc: 'Convenient parking near the temple area.', coords: [20.0075, 73.7917], totalSlots: 30, image: 'https://upload.wikimedia.org/wikipedia/commons/3/38/Ramkund%2Cnashik_%282%29.jpg' },
    { id: 4, name: 'Nashik Road Railway Station', desc: 'Station parking for short and long term.', coords: [19.9535, 73.8166], totalSlots: 30, image: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Nashik_Road_Railway_Station.jpg' },
    { id: 5, name: 'Muktidham Temple', desc: 'Parking facility for temple visitors.', coords: [19.9585, 73.8159], totalSlots: 30, image: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Muktidham_Temple%2C_Nashik%2C_Maharastra.jpg' },
    { id: 6, name: 'College Road', desc: 'Premium parking on the busy College Road.', coords: [20.0094, 73.7540], totalSlots: 30, image: 'https://upload.wikimedia.org/wikipedia/commons/b/b7/Bike_Exhibition.jpg' },
    { id: 7, name: 'CBS (Central Bus Stand)', desc: 'City center bus stand parking.', coords: [19.9942, 73.7788], totalSlots: 30, image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800' },
    { id: 8, name: 'Gangapur Dam', desc: 'Scenic area parking near the dam.', coords: [20.0264, 73.6749], totalSlots: 30, image: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Gangapur_dam-_Nashik.jpg' },
    { id: 9, name: 'Pandavleni Caves', desc: 'Tourist parking for Pandavleni area.', coords: [19.9525, 73.7486], totalSlots: 30, image: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Buddhist_monks_at_the_Pandavleni_Caves_near_Nashik_city.jpg' },
    { id: 10, name: 'Rajiv Gandhi Bhavan', desc: 'NMC Head office parking area.', coords: [19.9902, 73.7742], totalSlots: 30, image: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Nashik_Municipal_Corporation_Support_For_WikiConference.jpeg' },
  ];

  const handleSelect = (location) => {
    setSelectedLocation(location);
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationConfirm(selectedLocation.name);
    }
  };

  return (
    <div className="map-selection-container">
      <div className="map-header animate-fade-in-up">
        <h2>// SELECT LOCATION //</h2>
        <h3>Choose Your Destination</h3>
        <p>Find real-time parking availability across Nashik.</p>
      </div>

      <div className="map-layout">
        <div className="map-view-wrapper">
          <MapContainer 
            center={[19.9911, 73.7638]} 
            zoom={13} 
            scrollWheelZoom={false}
            className="leaflet-map-wrapper"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            {nashikLocations.map((loc) => (
              <LocationMarker 
                key={loc.id} 
                location={loc} 
                isSelected={selectedLocation?.id === loc.id}
                onSelect={handleSelect}
              />
            ))}
          </MapContainer>
        </div>

        <div className="location-info-panel">
          {selectedLocation ? (
            <div className="location-card">
              <div className="location-card-image">
                 {/* Premium custom image (Local rendering) */}
                 <img src={selectedLocation.image} alt={selectedLocation.name} />
              </div>
              <div className="location-card-details">
                <h4>{selectedLocation.name}</h4>
                <p>{selectedLocation.desc}</p>
                <div className="ai-insight">
                  <div className="ai-insight-header">
                    <i className="fas fa-brain"></i>
                    <span>AI Demand Forecast</span>
                  </div>
                  <p>Model predicts <strong>85% occupancy</strong> within 2 hours. Price surge likely. Book now to secure optimal slots.</p>
                </div>
                <div className="card-features">
                  <span><i className="fas fa-shield-alt"></i> Secure</span>
                  <span><i className="fas fa-video"></i> CCTV</span>
                  <span><i className="fas fa-clock"></i> 24/7</span>
                </div>
                <button className="btn-confirm-location" onClick={handleConfirm}>
                  Proceed to Booking
                </button>
              </div>
            </div>
          ) : (
            <div className="location-card empty-card">
              <div className="empty-state">
                <i className="fas fa-map-marker-alt"></i>
                <p>Click on any pin on the map to select your parking location.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapSelection;
