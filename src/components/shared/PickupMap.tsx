"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, Info } from "lucide-react";

// Fix Leaflet marker icons
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
  latitude: number;
  longitude: number;
}

interface PickupMapProps {
  points: Point[];
  selectedPointId?: string;
  onSelectPoint: (point: Point) => void;
  center?: [number, number];
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

export default function PickupMap({ points, selectedPointId, onSelectPoint, center = [-34.6037, -58.3816] }: PickupMapProps) {
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
          {points.map((point) => (
            <Marker 
              key={point.id} 
              position={[point.latitude, point.longitude]} 
              icon={icon}
              eventHandlers={{
                click: () => onSelectPoint(point),
              }}
            >
              <Popup>
                <div className="p-2">
                  <h4 className="font-black text-slate-800 text-sm mb-1">{point.name}</h4>
                  <p className="text-xs text-slate-500 mb-2">{point.address}</p>
                  <button 
                    onClick={() => onSelectPoint(point)}
                    className="w-full bg-[#00AEEF] text-white text-[10px] font-black uppercase py-2 rounded-lg"
                  >
                    Seleccionar este punto
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
            <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
                    <Navigation size={16} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Tu Ubicación</p>
                    <p className="text-[10px] font-bold text-slate-800 leading-none">CABA, Buenos Aires</p>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {points.map((point) => (
          <button
            key={point.id}
            onClick={() => onSelectPoint(point)}
            className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col text-left group ${
              selectedPointId === point.id 
                ? "border-[#00AEEF] bg-[#E8F7FF] ring-4 ring-[#00AEEF]/5" 
                : "border-slate-50 bg-white hover:border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between mb-4 w-full">
                <div className={`p-3 rounded-2xl transition-colors ${
                  selectedPointId === point.id ? "bg-[#00AEEF] text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100"
                }`}>
                    <MapPin size={20} />
                </div>
                {selectedPointId === point.id && (
                    <span className="bg-[#00AEEF] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Seleccionado</span>
                )}
            </div>
            <h4 className="font-black text-slate-800 uppercase tracking-tight mb-1">{point.name}</h4>
            <div className="flex items-center gap-2 text-slate-400">
                <Info size={14} />
                <span className="text-xs font-bold leading-relaxed">{point.address}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
