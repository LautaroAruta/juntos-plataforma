"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Store, MapPin, Package, Users } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";

// Fix for Leaflet icons in Next.js
const hubIcon = L.divIcon({
  html: renderToStaticMarkup(
    <div className="w-10 h-10 bg-white rounded-2xl shadow-xl flex items-center justify-center border-2 border-[#009EE3] text-[#009EE3]">
      <Store size={20} />
    </div>
  ),
  className: "custom-div-icon",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const userIcon = L.divIcon({
  html: renderToStaticMarkup(
    <div className="w-4 h-4 bg-[#009EE3] rounded-full border-2 border-white shadow-lg animate-pulse" />
  ),
  className: "user-location-icon",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

interface Hub {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  tipo: string;
}

interface ProximityMapProps {
  hubs: Hub[];
  center?: [number, number];
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center);
  return null;
}

export default function ProximityMap({ hubs, center = [-34.6037, -58.3816] }: ProximityMapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.error("Error getting location", err)
      );
    }
  }, []);

  return (
    <div className="w-full h-full rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
      <MapContainer 
        center={userLocation || center} 
        zoom={14} 
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>Tu ubicación actual</Popup>
          </Marker>
        )}

        {hubs.map((hub) => (
          <Marker 
            key={hub.id} 
            position={[Number(hub.latitude), Number(hub.longitude)]} 
            icon={hubIcon}
          >
            <Popup className="custom-popup">
              <div className="p-2 min-w-[200px]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#009EE3]/10 flex items-center justify-center text-[#009EE3]">
                    <Store size={16} />
                  </div>
                  <h4 className="font-black text-slate-800 text-sm">{hub.name}</h4>
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1 mb-4">
                  <MapPin size={10} /> {hub.address}
                </p>
                <div className="grid grid-cols-2 gap-2 border-t border-slate-50 pt-3">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-[#009EE3]">ACTIVOS</p>
                    <p className="text-sm font-black text-slate-800 tracking-tight">12 Deals</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-[#00A650]">PARTICIPACIÓN</p>
                    <p className="text-sm font-black text-slate-800 tracking-tight">85%</p>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {userLocation && <ChangeView center={userLocation} />}
      </MapContainer>

      <style jsx global>{`
        .leaflet-container {
          background-color: #f8fafc;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 1.5rem;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
        }
        .custom-popup .leaflet-popup-tip-container {
          display: none;
        }
      `}</style>
    </div>
  );
}
