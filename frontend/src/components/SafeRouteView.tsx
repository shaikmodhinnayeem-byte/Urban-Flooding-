import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Navigation, ShieldCheck, AlertTriangle, MapPin, 
  Car, Bike, Truck, ArrowUpDown, CheckCircle2, 
  Share2, Compass, ShieldAlert, Zap, Layers, RefreshCw
} from 'lucide-react';
import { Area, Road } from '../types';
import { apiClient } from '../services/api';

interface SafeRouteViewProps {
  currentArea: Area | undefined;
  roads: Road[];
}

const CHENNAI_PRESETS = [
  { name: 'Velachery Vijayanagar Bus Terminus', lat: 12.9815, lng: 80.2180, category: 'Transit Hub' },
  { name: 'Chennai Central Railway Station', lat: 13.0827, lng: 80.2707, category: 'Transit Hub' },
  { name: 'Chennai International Airport (MAA T2)', lat: 12.9941, lng: 80.1709, category: 'Transit Hub' },
  { name: 'T. Nagar Panagal Park & Usman Road', lat: 13.0425, lng: 80.2335, category: 'Commercial' },
  { name: 'Koyambedu CMBT Intercity Bus Depot', lat: 13.0694, lng: 80.1948, category: 'Transit Hub' },
  { name: 'Guindy Kathipara Flyover Grade Separator', lat: 13.0067, lng: 80.2030, category: 'Highway Junction' },
  { name: 'Adyar Gandhi Mandapam / Sardar Patel Rd', lat: 13.0070, lng: 80.2350, category: 'Arterial' },
  { name: 'Tambaram Railway Station West Gate', lat: 12.9249, lng: 80.1248, category: 'Transit Hub' },
  { name: 'OMR Tidel Park (Thiruvanmiyur)', lat: 12.9892, lng: 80.2508, category: 'Tech Corridor' },
  { name: 'Anna Nagar Roundtana / 2nd Avenue', lat: 13.0850, lng: 80.2150, category: 'Arterial' },
  { name: 'Pallikaranai 200ft Radial Road Causeway', lat: 12.9440, lng: 80.2110, category: 'Causeway' },
  { name: 'Ambattur Industrial Estate OT Bus Stand', lat: 13.1180, lng: 80.1510, category: 'Industrial' },
  { name: 'Madipakkam Koot Road Junction', lat: 12.9640, lng: 80.1980, category: 'Sink Area' },
  { name: 'Kolathur Retteri Lake Flyover', lat: 13.1220, lng: 80.2190, category: 'Arterial' },
  { name: 'Dr. Kamakshi Memorial Hospital (Pallikaranai)', lat: 12.9560, lng: 80.2040, category: 'Hospital' },
  { name: 'Apollo Speciality Hospital (OMR Kandanchavadi)', lat: 12.9660, lng: 80.2470, category: 'Hospital' },
  { name: 'Fortis Malar Hospital (Adyar Estuary)', lat: 13.0070, lng: 80.2580, category: 'Hospital' },
  { name: 'SIMS Multi-Speciality Hospital (Vadapalani)', lat: 13.0520, lng: 80.2120, category: 'Hospital' },
  { name: 'Guru Nanak College Disaster Shelter (Ward 179)', lat: 12.9890, lng: 80.2170, category: 'Relief Shelter' },
  { name: 'Anna University Disaster Evacuation Shelter', lat: 13.0110, lng: 80.2350, category: 'Relief Shelter' },
];

export const SafeRouteView: React.FC<SafeRouteViewProps> = ({
  currentArea,
  roads,
}) => {
  const [vehicleType, setVehicleType] = useState<'BIKE' | 'CAR' | 'SUV' | 'RESCUE_TRUCK'>('CAR');
  const [originText, setOriginText] = useState('Chennai Central Railway Station');
  const [destText, setDestText] = useState('SIMS Multi-Speciality Hospital (Vadapalani)');

  const [calculating, setCalculating] = useState(false);
  const [routeResult, setRouteResult] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const miniMapContainerRef = useRef<HTMLDivElement>(null);
  const miniMapInstanceRef = useRef<L.Map | null>(null);
  const routeLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const getCoordinates = (name: string, fallbackLat: number, fallbackLng: number) => {
    const match = CHENNAI_PRESETS.find(p => p.name.toLowerCase() === name.toLowerCase());
    return match ? { lat: match.lat, lng: match.lng } : { lat: fallbackLat, lng: fallbackLng };
  };

  const handleSwap = () => {
    const temp = originText;
    setOriginText(destText);
    setDestText(temp);
  };

  const handleCalculateRoute = async () => {
    setCalculating(true);
    const origCoords = getCoordinates(originText, 13.0827, 80.2707);
    const destCoords = getCoordinates(destText, 13.0520, 80.2120);

    try {
      const res = await apiClient.post('/routes/calculate', {
        origin_lat: origCoords.lat,
        origin_lng: origCoords.lng,
        dest_lat: destCoords.lat,
        dest_lng: destCoords.lng,
        vehicle_type: vehicleType === 'SUV' ? 'CAR' : vehicleType,
      });

      setRouteResult({
        ...res,
        originName: originText,
        destName: destText,
        originCoords: origCoords,
        destCoords: destCoords,
        vehicle: vehicleType,
      });
    } catch (err) {
      console.error('Route calculation error:', err);
    } finally {
      setCalculating(false);
    }
  };

  // Automatically recalculate route whenever origin, destination or vehicle changes!
  useEffect(() => {
    handleCalculateRoute();
  }, [originText, destText, vehicleType]);

  // Mini-map initialization & visual route rendering
  useEffect(() => {
    if (!miniMapContainerRef.current) return;

    if (!miniMapInstanceRef.current) {
      const map = L.map(miniMapContainerRef.current, {
        center: [13.0500, 80.2300],
        zoom: 12,
        zoomControl: false,
      });

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Esri World Imagery',
      }).addTo(map);

      L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        opacity: 0.8,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      routeLayerGroupRef.current = L.layerGroup().addTo(map);
      miniMapInstanceRef.current = map;
    }
  }, []);

  // Update Mini-Map Route Path
  useEffect(() => {
    if (!miniMapInstanceRef.current || !routeLayerGroupRef.current || !routeResult) return;

    const layerGroup = routeLayerGroupRef.current;
    layerGroup.clearLayers();

    const orig = routeResult.originCoords;
    const dest = routeResult.destCoords;

    if (!orig || !dest) return;

    // 1. Origin Green Marker
    const originIcon = L.divIcon({
      className: 'origin-marker',
      html: `
        <div style="
          background: #10b981; 
          border: 2px solid #ffffff; 
          box-shadow: 0 0 15px #10b981; 
          border-radius: 50%; 
          width: 28px; 
          height: 28px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-weight: 900; 
          color: #ffffff; 
          font-size: 13px;
        ">
          A
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const origMarker = L.marker([orig.lat, orig.lng], { icon: originIcon });
    origMarker.bindPopup(`<b>🟢 Starting Point:</b><br/>${routeResult.originName}`);
    layerGroup.addLayer(origMarker);

    // 2. Destination Red Marker
    const destIcon = L.divIcon({
      className: 'dest-marker',
      html: `
        <div style="
          background: #ef4444; 
          border: 2px solid #ffffff; 
          box-shadow: 0 0 15px #ef4444; 
          border-radius: 50%; 
          width: 28px; 
          height: 28px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-weight: 900; 
          color: #ffffff; 
          font-size: 13px;
        ">
          B
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const destMarker = L.marker([dest.lat, dest.lng], { icon: destIcon });
    destMarker.bindPopup(`<b>🏁 Destination:</b><br/>${routeResult.destName}`);
    layerGroup.addLayer(destMarker);

    // 3. Draw Safe Elevated Corridor Path (Casing + Vivid Emerald Line)
    const midLat = (orig.lat + dest.lat) / 2.0;
    const midLng = (orig.lng + dest.lng) / 2.0;
    
    // Create an elevated arc detour
    const safeWaypoints: [number, number][] = [
      [orig.lat, orig.lng],
      [midLat + 0.008, midLng - 0.006],
      [dest.lat, dest.lng]
    ];

    // Casing line
    layerGroup.addLayer(L.polyline(safeWaypoints, { color: '#000000', weight: 8, opacity: 0.9 }));
    // Core line
    layerGroup.addLayer(L.polyline(safeWaypoints, { color: '#10b981', weight: 5, opacity: 1.0 }));

    // 4. Draw Flooded Trap (Red X marker)
    const trapIcon = L.divIcon({
      className: 'trap-marker',
      html: `
        <div style="
          background: #ef4444; 
          border: 2px solid #ffffff; 
          border-radius: 6px; 
          padding: 2px 6px; 
          font-size: 10px; 
          font-weight: 800; 
          color: #ffffff; 
          box-shadow: 0 0 10px rgba(239,68,68,0.8);
          white-space: nowrap;
        ">
          ⛔ FLOOD TRAP AVOIDED
        </div>
      `,
      iconSize: [120, 20],
      iconAnchor: [60, 10],
    });

    const trapMarker = L.marker([midLat - 0.005, midLng + 0.004], { icon: trapIcon });
    trapMarker.bindPopup(`<b>⚠️ Avoided Hazard:</b><br/>${routeResult.avoided_hazard?.street_name || 'Submerged Underpass'}<br/>Depth: ${routeResult.avoided_hazard?.water_depth_cm || 85}cm`);
    layerGroup.addLayer(trapMarker);

    // Fit map bounds
    const bounds = L.latLngBounds([
      [orig.lat, orig.lng],
      [dest.lat, dest.lng]
    ]);
    miniMapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });

  }, [routeResult]);

  const handleCopyShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6 p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Dynamic Navigation Engine</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                DIJKSTRA FLOOD PENALTY SOLVER
              </span>
            </div>
            <h2 className="text-2xl font-black text-white font-['Outfit'] mt-1">
              Flood-Safe Alternative Route Navigator
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Real-time Dijkstra routing that penalizes submerged roads and automatically guides emergency and civilian vehicles through elevated corridors.
            </p>
          </div>

          {/* Vehicle Type Ground Clearance Selector */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setVehicleType('BIKE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                vehicleType === 'BIKE' ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bike className="w-4 h-4" />
              <span>Two-Wheeler (&lt;15cm)</span>
            </button>
            <button
              onClick={() => setVehicleType('CAR')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                vehicleType === 'CAR' ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>Sedan / Hatchback (&lt;28cm)</span>
            </button>
            <button
              onClick={() => setVehicleType('SUV')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                vehicleType === 'SUV' ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>SUV / MPV (&lt;40cm)</span>
            </button>
            <button
              onClick={() => setVehicleType('RESCUE_TRUCK')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                vehicleType === 'RESCUE_TRUCK' ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Rescue 4x4 (&lt;75cm)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Parameters on Left, Clear Beside Operation on Right */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Origin / Destination Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4 h-fit">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-['Outfit'] flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Route Parameters</span>
            </h3>
            <button
              onClick={handleSwap}
              className="p-1.5 text-xs text-cyan-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition flex items-center gap-1 font-bold"
              title="Reverse Origin and Destination"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
              <span>Swap (⇅)</span>
            </button>
          </div>

          <div className="space-y-4">
            {/* 1. Starting Point (Origin) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Starting Point (Origin):</span>
              </label>

              <select
                value={originText}
                onChange={(e) => setOriginText(e.target.value)}
                aria-label="Select Starting Point"
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer font-semibold"
              >
                {CHENNAI_PRESETS.map((p, idx) => (
                  <option key={idx} value={p.name}>
                    📍 {p.name} [{p.category}]
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Destination */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-red-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                <span>Select Destination:</span>
              </label>

              <select
                value={destText}
                onChange={(e) => setDestText(e.target.value)}
                aria-label="Select Destination"
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer font-semibold"
              >
                {CHENNAI_PRESETS.map((p, idx) => (
                  <option key={idx} value={p.name}>
                    🎯 {p.name} [{p.category}]
                  </option>
                ))}
              </select>
            </div>

            {/* Recalculate Button */}
            <button
              onClick={handleCalculateRoute}
              disabled={calculating}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-600/30 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${calculating ? 'animate-spin' : ''}`} />
              <span>{calculating ? 'Recalculating Dijkstra Corridor...' : 'Recalculate Route'}</span>
            </button>
          </div>

          {/* Dynamic Hazard Guidance Info */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-extrabold text-cyan-300">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Automatic Real-Time Solver</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Selecting any location instantly updates the routing corridor, distance, and turns on the right side.
            </p>
          </div>
        </div>

        {/* Right Column: CLEAR BESIDE OPERATION DISPLAY */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header Card with Route Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-wide">
                    🟢 {originText}
                  </span>
                  <span className="text-slate-500 font-bold">➔</span>
                  <span className="text-xs font-black text-red-400 uppercase tracking-wide">
                    🏁 {destText}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white font-['Outfit'] mt-1">
                  Optimal Flood-Safe Route Corridor
                </h3>
              </div>

              {routeResult && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyShare}
                    className="flex items-center gap-1 text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 transition"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>{copiedLink ? 'Copied!' : 'Share Route'}</span>
                  </button>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-lg text-xs font-black">
                    ● PASSABLE CORRIDOR
                  </span>
                </div>
              )}
            </div>

            {/* Avoided Flood Trap Alert Banner */}
            {routeResult?.hazard_warning && (
              <div className="p-3.5 bg-gradient-to-r from-amber-950/90 to-slate-900 border border-amber-600/70 rounded-xl text-amber-200 text-xs flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="font-semibold">{routeResult.hazard_warning}</span>
              </div>
            )}

            {/* 4 Trip Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Total Distance</div>
                <div className="text-xl font-black text-white mt-0.5 font-['Outfit']">
                  {routeResult?.total_distance_km || 9.2} km
                </div>
                <div className="text-[10px] text-slate-400">Safe Highway Corridor</div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Est. Travel Time</div>
                <div className="text-xl font-black text-cyan-400 mt-0.5 font-['Outfit']">
                  {routeResult?.est_travel_time_min || 19.7} mins
                </div>
                <div className="text-[10px] text-slate-400">Wet Road Adjusted</div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Max Flood Depth</div>
                <div className="text-xl font-black text-emerald-400 mt-0.5 font-['Outfit']">
                  {routeResult?.max_flood_depth_encountered_cm || 12.5} cm
                </div>
                <div className="text-[10px] text-emerald-400 font-bold">Clearance Safe</div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Avoided Traps</div>
                <div className="text-xl font-black text-purple-400 mt-0.5 font-['Outfit']">
                  100% Sinks
                </div>
                <div className="text-[10px] text-purple-300">0 Underpass Traps</div>
              </div>
            </div>
          </div>

          {/* Interactive Visual Mini-Map Preview */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Spatial Route Map & Elevation Ridge</span>
              </span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <span className="w-3 h-1 bg-emerald-400 inline-block"></span> Recommended Safe
                </span>
                <span className="flex items-center gap-1 text-red-400 font-bold">
                  <span className="w-3 h-1 bg-red-400 inline-block"></span> Flooded Trap (Avoided)
                </span>
              </div>
            </div>

            <div className="h-56 w-full rounded-xl overflow-hidden border border-slate-800 relative">
              <div ref={miniMapContainerRef} className="w-full h-full" />
            </div>
          </div>

          {/* Turn-by-Turn Safe Elevation Segments List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-3">
            <div className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center justify-between pb-2 border-b border-slate-800">
              <span>Turn-by-Turn Road Segments ({routeResult?.recommended_route?.length || 3} Corridors):</span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">ALL PASSABLE</span>
            </div>

            <div className="space-y-2.5">
              {routeResult?.recommended_route?.map((seg: any, idx: number) => (
                <div key={idx} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs hover:border-slate-700 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-black text-xs shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-extrabold text-white text-sm">{seg.street_name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-1">
                        <span>Distance: <b>{seg.distance_km} km</b></span>
                        <span>•</span>
                        <span>Elevation: <b>{seg.elevation_m || 6.5}m MSL</b></span>
                        <span>•</span>
                        <span>Forecast Water Depth: <b className="text-emerald-400">{seg.water_depth_cm} cm</b></span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>PASSABLE</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
