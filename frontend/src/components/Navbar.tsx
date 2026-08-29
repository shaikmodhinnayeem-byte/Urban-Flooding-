import React, { useEffect, useState } from 'react';
import { 
  CloudRain, MapPin, LogOut, 
  LogIn, Radio, Zap, RefreshCw, Droplets, Thermometer, Wind, ExternalLink
} from 'lucide-react';
import { Area, User as UserType, LiveWeather } from '../types';
import { apiClient } from '../services/api';

interface NavbarProps {
  currentUser: UserType | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  areas: Area[];
  selectedAreaId: number;
  onSelectArea: (id: number) => void;
  rainfallIntensity: number;
  radarDbz: number;
  activeAlertCount: number;
  onTriggerScenario: (scenario: string) => void;
  isSimulating: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenAuth,
  onLogout,
  areas,
  selectedAreaId,
  onSelectArea,
  rainfallIntensity,
  radarDbz,
  activeAlertCount,
  onTriggerScenario,
  isSimulating,
}) => {
  const currentArea = areas.find(a => a.id === selectedAreaId);
  const [liveWeather, setLiveWeather] = useState<LiveWeather | null>(null);

  useEffect(() => {
    const fetchLive = async () => {
      try {
        const data = await apiClient.get(`/rainfall/live-weather?area_id=${selectedAreaId}`);
        setLiveWeather(data);
      } catch (err) {
        console.error('Failed to fetch live weather:', err);
      }
    };
    fetchLive();
    const interval = setInterval(fetchLive, 30000); // 30s polling
    return () => clearInterval(interval);
  }, [selectedAreaId]);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Top Emergency Ticker if active alerts exist */}
      {activeAlertCount > 0 && (
        <div className="bg-gradient-to-r from-red-950 via-amber-950 to-red-950 border-b border-red-800/60 px-4 py-1.5 text-xs flex items-center justify-between text-red-200">
          <div className="flex items-center gap-2 font-medium">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="font-bold text-red-400 uppercase tracking-wide">LIVE DISASTER NOWCAST:</span>
            <span>Heavy convective rain cells tracking towards {currentArea?.name || 'Chennai Wards'}. Surcharge risk detected at multiple drainage nodes.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-red-500/20 text-red-300 font-semibold px-2 py-0.5 rounded border border-red-500/40">
              {activeAlertCount} Active Warning{activeAlertCount > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      <div className="px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Branding & Smart City Seal */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
            <CloudRain className="w-6 h-6 text-white" />
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-slate-900"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold tracking-tight text-lg text-white font-['Outfit'] flex items-center gap-1.5">
                DRAIN<span className="text-cyan-400">-X</span>
              </h1>
              <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded">
                CHENNAI 0-3H NOWCAST
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Urban Flood Prediction & Early Warning System</p>
          </div>
        </div>

        {/* Center: Live Area Selector & LIVE Atmospheric Weather API Telemetry */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Area Selector */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-slate-400 font-medium">Ward:</span>
            <select
              value={selectedAreaId}
              onChange={(e) => onSelectArea(Number(e.target.value))}
              aria-label="Select Chennai Ward or Area"
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
            >
              {areas.map((a) => (
                <option key={a.id} value={a.id} className="bg-slate-900 text-white">
                  {a.name} (Zone {a.zone_number} / Ward {a.ward_number})
                </option>
              ))}
            </select>
          </div>

          {/* LIVE Weather API Pill */}
          <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs">
            {/* Live Indicator */}
            <div className="flex items-center gap-1.5" title="Live meteorological data synced from IMD / Open-Meteo API">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">LIVE WX</span>
            </div>

            <div className="h-3 w-px bg-slate-700"></div>

            {/* Live Temperature */}
            <div className="flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Temp:</span>
              <span className="font-extrabold text-amber-300">
                {liveWeather ? `${liveWeather.temperature_c.toFixed(1)}°C` : '30.0°C'}
              </span>
            </div>

            <div className="h-3 w-px bg-slate-700"></div>

            {/* Live Humidity & Wind */}
            <div className="flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold text-slate-200">
                {liveWeather ? `${liveWeather.humidity_pct}%` : '68%'}
              </span>
            </div>

            <div className="h-3 w-px bg-slate-700"></div>

            {/* Live Condition & Rain */}
            <div className="flex items-center gap-1.5">
              <span>{liveWeather?.condition_icon || '⛅'}</span>
              <span className="text-slate-300 font-medium">{liveWeather?.condition || 'Partly Cloudy'}</span>
              <span className="font-bold text-cyan-300 ml-1">
                ({rainfallIntensity.toFixed(1)} mm/h)
              </span>
            </div>

            <div className="h-3 w-px bg-slate-700"></div>

            {/* Doppler Radar */}
            <div className="flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-semibold text-indigo-300">{radarDbz.toFixed(1)} dBZ</span>
            </div>
          </div>
        </div>

        {/* Right: Quick Simulation Triggers & Auth */}
        <div className="flex items-center gap-2.5">
          {/* Quick Simulation Dropdown / Button */}
          <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700 p-1 rounded-lg">
            <button
              onClick={() => onTriggerScenario('CLOUDBURST_100MM')}
              disabled={isSimulating}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded shadow transition-all active:scale-95"
              title="Simulate severe 115mm/h cloudburst and watch drains surcharge"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>⚡ Cloudburst Demo</span>
            </button>
            <button
              onClick={() => onTriggerScenario('NORMAL')}
              disabled={isSimulating}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition"
              title="Reset to calm dry weather"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* User Auth Info */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-white leading-tight">{currentUser.full_name}</p>
                <div className="flex items-center justify-end gap-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                    currentUser.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                    currentUser.role === 'RESCUE' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {currentUser.role}
                  </span>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition shadow-md shadow-cyan-600/20"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Demo</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
