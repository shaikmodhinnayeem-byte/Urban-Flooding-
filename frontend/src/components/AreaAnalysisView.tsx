import React from 'react';
import { Mountain, Droplets, Gauge, AlertTriangle, ShieldCheck, ArrowRight, Waves } from 'lucide-react';
import { Area, Road, DrainNode, Sensor } from '../types';

interface AreaAnalysisViewProps {
  currentArea: Area | undefined;
  roads: Road[];
  drainNodes: DrainNode[];
  sensors: Sensor[];
  rainfallIntensity: number;
}

export const AreaAnalysisView: React.FC<AreaAnalysisViewProps> = ({
  currentArea,
  roads,
  drainNodes,
  sensors,
  rainfallIntensity,
}) => {
  // Catchment Runoff Calculation: Q = 0.278 * C * I * A
  const cCoeff = currentArea?.impervious_ratio || 0.85;
  const areaSqkm = currentArea?.catchment_area_sqkm || 14.2;
  const peakRunoffM3s = (0.278 * cCoeff * rainfallIntensity * areaSqkm).toFixed(1);
  const hourlyVolumeM3 = Math.round((rainfallIntensity / 1000.0) * (areaSqkm * 1_000_000) * cCoeff);

  return (
    <div className="space-y-6 p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Hydrological Micro-Catchment Analysis</span>
            </div>
            <h2 className="text-2xl font-black text-white font-['Outfit'] mt-1">
              {currentArea?.name} Detailed Terrain & Drainage Profile
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Greater Chennai Corporation Zone {currentArea?.zone_number} • Ward {currentArea?.ward_number} • Population: {currentArea?.population.toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-right">
              <div className="text-[10px] text-slate-400 uppercase">Runoff Coefficient (C)</div>
              <div className="text-lg font-bold text-cyan-400 font-['Outfit']">{cCoeff.toFixed(2)}</div>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-right">
              <div className="text-[10px] text-slate-400 uppercase">Catchment Area</div>
              <div className="text-lg font-bold text-white font-['Outfit']">{areaSqkm} km²</div>
            </div>
          </div>
        </div>
      </div>

      {/* Surface Hydrology & Runoff Estimation Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Peak Runoff Rate */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Peak Surface Inflow (Q)</span>
            <Waves className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-['Outfit']">
            {peakRunoffM3s} <span className="text-sm font-normal text-slate-400">m³/s</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Rational method output based on {rainfallIntensity.toFixed(1)} mm/h downpour rate.
          </p>
        </div>

        {/* Hourly Volume */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Hourly Runoff Volume</span>
            <Droplets className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-['Outfit']">
            {hourlyVolumeM3.toLocaleString()} <span className="text-sm font-normal text-slate-400">m³</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Net water volume routed across concrete surfaces and road conduits per hour.
          </p>
        </div>

        {/* Elevation Sinks */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>DEM Depression Bowl</span>
            <Mountain className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-['Outfit']">
            {currentArea?.avg_elevation_m} <span className="text-sm font-normal text-slate-400">m MSL</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {currentArea?.avg_elevation_m && currentArea.avg_elevation_m < 3.0 ? (
              <span className="text-red-400 font-medium">⚠️ Severe coastal depression: high vulnerability to backflow pooling.</span>
            ) : (
              <span className="text-emerald-400 font-medium">✓ Moderate elevation slope to primary outfall.</span>
            )}
          </p>
        </div>
      </div>

      {/* Street Elevation & Hydraulic Inundation Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <h3 className="text-base font-bold text-white font-['Outfit']">
          Street Micro-Topography & Surcharge Vulnerability
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Street / Arterial Name</th>
                <th className="p-3">Road Type</th>
                <th className="p-3">Surface Elevation (DEM)</th>
                <th className="p-3">Current Depth</th>
                <th className="p-3">1-Hour Nowcast</th>
                <th className="p-3">3-Hour Nowcast</th>
                <th className="p-3">Passability Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {roads.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/50 transition">
                  <td className="p-3 font-semibold text-white">{r.name}</td>
                  <td className="p-3 text-slate-400">{r.road_type}</td>
                  <td className="p-3 text-cyan-300 font-medium">{r.elevation_m} m</td>
                  <td className="p-3 font-bold text-slate-200">{r.current_water_depth_cm} cm</td>
                  <td className="p-3 font-bold text-amber-400">{r.predicted_depth_1h_cm} cm</td>
                  <td className="p-3 font-bold text-red-400">{r.predicted_depth_3h_cm} cm</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.passability_status === 'IMPASSABLE' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                      r.passability_status === 'SLOW' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {r.passability_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
