"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, Info } from "lucide-react";

// Fix Leaflet marker icons - using unpkg as reliable source for standard icons
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Point {
  id: string;
  name: string;
  address: string;
  latitude: number | string;
  longitude: number | string;
}

interface PickupMapProps {
  points: Point[];
  selectedPointId?: string;
  onSelectPoint?: (point: Point) => void;
  onLocationSelect?: (lat: number, lng: number) => void; // Added for compatibility
  center?: [number, number];
  showSearch?: boolean; // Added for compatibility
  isPicker?: boolean; // Added for compatibility
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function PickupMap({ 
  points = [], 
  selectedPointId, 
  onSelectPoint, 
  onLocationSelect, // Ignored in simple version but kept for types
  center = [-34.6037, -58.3816],
  showSearch = false, // Ignored in simple version
  isPicker = false // Ignored in simple version
}: PickupMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="h-[400px] w-full bg-slate-50 animate-pulse rounded-[2.5rem]" />;

  return (
    <div className="space-y-6">
      <div className="relative h-[400px] w-full rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50">
        <MapContainer 
          center={center} 
          zoom={13} 
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ChangeView center={center} />
          {points.map((point) => {
            const position: [number, number] = [
              typeof point.latitude === 'string' ? parseFloat(point.latitude) : point.latitude,
              typeof point.longitude === 'string' ? parseFloat(point.longitude) : point.longitude
            ];

            return (
              <Marker 
                key={point.id} 
                position={position} 
                icon={icon}
                eventHandlers={{
                  click: () => onSelectPoint && onSelectPoint(point),
                }}
              >
                <Popup>
                  <div className="p-3 min-w-[180px]">
                    <h4 className="font-black text-slate-800 text-[13px] uppercase tracking-tight mb-1">{point.name}</h4>
                    <p className="text-[11px] font-bold text-slate-500 mb-3 leading-tight">{point.address}</p>
                    <button 
                      onClick={() => onSelectPoint && onSelectPoint(point)}
                      className="w-full bg-[#009EE3] text-white text-[11px] font-black uppercase tracking-widest py-3 rounded-xl shadow-lg shadow-blue-200 hover:scale-105 transition-transform"
                    >
                      Seleccionar este punto
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
            <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#00AEEF]/10 text-[#00AEEF] flex items-center justify-center">
                    <Navigation size={16} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Localidad</p>
                    <p className="text-[10px] font-bold text-slate-800 leading-none">Puntos cercanos</p>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {points.map((point) => (
          <button
            key={point.id}
            onClick={() => onSelectPoint && onSelectPoint(point)}
            className={`p-6 rounded-[2.5rem] border-2 transition-all flex flex-col text-left group hover:scale-[1.02] ${
              selectedPointId === point.id 
                ? "border-[#009EE3] bg-white shadow-xl shadow-blue-100 ring-4 ring-[#009EE3]/5" 
                : "border-slate-50 bg-white hover:border-[#009EE3]/20 hover:shadow-lg hover:shadow-slate-100"
            }`}
          >
            <div className="flex items-center justify-between mb-4 w-full">
                <div className={`p-4 rounded-2xl transition-all ${
                  selectedPointId === point.id ? "bg-[#009EE3] text-white" : "bg-slate-50 text-slate-400 group-hover:bg-[#009EE3]/10 group-hover:text-[#009EE3]"
                }`}>
                    <MapPin size={22} strokeWidth={2.5} />
                </div>
                {selectedPointId === point.id && (
                    <span className="bg-[#00A650] text-white text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">Seleccionado</span>
                )}
            </div>
            <h4 className="font-black text-slate-800 uppercase tracking-tight mb-1">{point.name}</h4>
            <div className="flex items-center gap-2 text-slate-400">
                <Info size={14} strokeWidth={2.5} />
                <span className="text-[11px] font-bold leading-relaxed">{point.address}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
