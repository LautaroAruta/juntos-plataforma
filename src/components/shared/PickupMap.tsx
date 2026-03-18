"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, Info, LocateFixed, Loader2, Search } from "lucide-react";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Bandha Premium Marker Icon
const bandhaMarkerIcon = L.divIcon({
  className: 'bandha-marker-icon',
  html: `<div style="background-color: #009EE3; color: white; padding: 6px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,158,227,0.3);"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36]
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
  onLocationSelect?: (lat: number, lng: number) => void;
  center?: [number, number];
  showSearch?: boolean;
  isPicker?: boolean;
}

function ChangeView({ center, zoom }: { center: [number, number], zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom || map.getZoom());
  }, [center, zoom, map]);
  return null;
}

function MapEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FitBounds({ points, userLocation }: { points: Point[], userLocation: [number, number] | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map(p => [
        typeof p.latitude === 'string' ? parseFloat(p.latitude) : p.latitude, 
        typeof p.longitude === 'string' ? parseFloat(p.longitude) : p.longitude
      ] as [number, number]));
      
      if (userLocation) bounds.extend(userLocation);
      
      if (points.length > 1) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [points, userLocation, map]);
  
  return null;
}

export default function PickupMap({ 
  points = [], 
  selectedPointId, 
  onSelectPoint, 
  onLocationSelect,
  center = [-34.6037, -58.3816], 
  showSearch = true,
  isPicker = false
}: PickupMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);
  const [mapZoom, setMapZoom] = useState(13);
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setMapCenter(center);
  }, [center]);

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert("La geolocalización no está soportada por tu navegador.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation: [number, number] = [latitude, longitude];
        setUserLocation(newLocation);
        setMapCenter(newLocation);
        setIsLocating(false);
        if (isPicker && onLocationSelect) {
          onLocationSelect(latitude, longitude);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("No se pudo obtener tu ubicación.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/geocoding/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    const newLocation: [number, number] = [lat, lon];
    setMapCenter(newLocation);
    setMapZoom(14);
    setSearchResults([]);
    setSearchQuery(result.display_name);
    
    if (isPicker && onLocationSelect) {
      onLocationSelect(lat, lon);
    }
  };

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          if (onLocationSelect) {
            onLocationSelect(lat, lng);
          }
        }
      },
    }),
    [onLocationSelect],
  );

  const handleMapClick = (lat: number, lng: number) => {
    if (isPicker) {
      setMapCenter([lat, lng]);
      if (onLocationSelect) {
        onLocationSelect(lat, lng);
      }
    }
  };

  if (!isMounted) return <div className="h-[400px] w-full bg-slate-50 animate-pulse rounded-[2.5rem]" />;

  return (
    <div className="space-y-6">
      <div className="relative h-[400px] w-full rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50">
        <MapContainer 
          center={center} 
          zoom={13} 
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ChangeView center={mapCenter} zoom={mapZoom} />
          {!isPicker && <FitBounds points={points} userLocation={userLocation} />}
          {isPicker && <MapEvents onMapClick={handleMapClick} />}
          
          {userLocation && (
            <Marker 
              position={userLocation} 
              icon={L.divIcon({
                className: 'user-location-icon',
                html: `<div style="background-color: #00AEEF; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,174,239,0.5); position: relative;"><div style="position: absolute; inset: -8px; background-color: rgba(0,174,239,0.2); border-radius: 50%; animation: pulse 2s infinite;"></div></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8]
              })}
            />
          )}

          {isPicker && (
            <Marker
              draggable={true}
              eventHandlers={eventHandlers}
              position={mapCenter}
              ref={markerRef}
              icon={L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: #FF4B2B; color: white; padding: 5px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(255,75,43,0.4);"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
                iconSize: [38, 38],
                iconAnchor: [19, 38],
              })}
            >
              <Popup offset={[0, -38]}>
                <div className="p-2 text-center">
                  <p className="font-black text-slate-800 text-xs uppercase mb-1">Tu Ubicación</p>
                  <p className="text-[10px] text-slate-500 font-bold">Arrastrá el pin o hacé click en el mapa para ajustar</p>
                </div>
              </Popup>
            </Marker>
          )}

          {!isPicker && points.map((point) => {
            const position: [number, number] = [
              typeof point.latitude === 'string' ? parseFloat(point.latitude) : point.latitude,
              typeof point.longitude === 'string' ? parseFloat(point.longitude) : point.longitude
            ];
            
            const isSelected = selectedPointId === point.id;
            
            return (
              <Marker 
                key={point.id} 
                position={position} 
                icon={isSelected ? L.divIcon({
                  className: 'custom-div-icon',
                  html: `<div style="background-color: #00A650; color: white; padding: 6px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 15px rgba(0,166,80,0.4); transform: scale(1.1); transition: all 0.2s;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
                  iconSize: [40, 40],
                  iconAnchor: [20, 40],
                  popupAnchor: [0, -40]
                }) : bandhaMarkerIcon}
                eventHandlers={{
                  click: () => onSelectPoint && onSelectPoint(point),
                }}
              >
                <Popup>
                  <div className="p-3 min-w-[180px]">
                    <h4 className="font-black text-slate-800 text-[13px] uppercase tracking-tight mb-1">{point.name}</h4>
                    <p className="text-[11px] font-bold text-slate-500 mb-3 leading-tight">{point.address}</p>
                    {isSelected ? (
                      <span className="block w-full text-center bg-[#00A650] text-white text-[11px] font-black uppercase tracking-widest py-3 rounded-xl shadow-lg shadow-green-200">
                        Punto Seleccionado
                      </span>
                    ) : (
                      <button 
                        onClick={() => onSelectPoint && onSelectPoint(point)}
                        className="w-full bg-[#009EE3] text-white text-[11px] font-black uppercase tracking-widest py-3 rounded-xl shadow-lg shadow-blue-200 hover:scale-105 transition-transform"
                      >
                        Seleccionar este punto
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        <div className="absolute top-4 left-4 z-[1000] w-[calc(100%-120px)] max-w-sm">
            {showSearch && (
                <div className="relative group">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="text"
                                placeholder={isPicker ? "Buscá tu dirección..." : "Buscá tu ciudad o pueblo..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/90 backdrop-blur-md border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium shadow-lg focus:outline-none focus:ring-4 focus:ring-[#00AEEF]/10 focus:bg-white transition-all"
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={isSearching}
                            className="bg-[#00AEEF] text-white p-3 rounded-2xl shadow-lg hover:bg-[#009EE3] active:scale-95 transition-all disabled:grayscale"
                        >
                            {isSearching ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                        </button>
                    </form>

                    {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[1001] max-h-[300px] overflow-y-auto">
                            {searchResults.map((result: any, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectSearchResult(result)}
                                    className="w-full p-4 text-left hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors flex items-start gap-3"
                                >
                                    <MapPin size={16} className="text-[#00AEEF] shrink-0 mt-0.5" />
                                    <span className="text-xs font-bold text-slate-700 line-clamp-2 leading-relaxed">{result.display_name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>

        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
            <button 
                type="button"
                onClick={handleUseLocation}
                disabled={isLocating}
                className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-3 hover:bg-white transition-all active:scale-95 disabled:opacity-50"
            >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isLocating ? 'bg-slate-100 text-slate-400' : 'bg-[#00AEEF]/10 text-[#00AEEF]'}`}>
                    {isLocating ? <Loader2 className="animate-spin" size={16} /> : <LocateFixed size={18} />}
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Localizarme</p>
                    <p className="text-[10px] font-bold text-slate-800 leading-none">
                        {isLocating ? 'Obteniendo...' : userLocation ? 'Ubicación activa' : 'Usar mi ubicación'}
                    </p>
                </div>
            </button>
        </div>
      </div>

          {points.length > 0 && points.map((point) => (
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
              <h4 className="font-black text-slate-800 uppercase tracking-tight mb-1 text-[13px]">{point.name}</h4>
              <div className="flex items-center gap-2 text-slate-400">
                  <Info size={14} strokeWidth={2.5} />
                  <span className="text-[11px] font-bold leading-relaxed">{point.address}</span>
              </div>
            </button>
          ))}
      <style jsx global>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.5; }
          70% { transform: scale(2.5); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
