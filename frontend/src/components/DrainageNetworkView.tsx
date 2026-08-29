import React, { useState } from 'react';
import { GitFork, Gauge, AlertTriangle, ShieldCheck, Activity, RefreshCw, Layers } from 'lucide-react';
import { DrainSegment, DrainNode } from '../types';

interface DrainageNetworkViewProps {
  drainSegments: DrainSegment[];
  drainNodes: DrainNode[];
}

export const DrainageNetworkView: React.FC<DrainageNetworkViewProps> = ({
  drainSegments,
  drainNodes,
}) => {
  // Manning Calculator State
  const [diameter, setDiameter] = useState<number>(2.0);
  const [slope, setSlope] = useState<number>(0.25);
  const [manningN, setManningN] = useState<number>(0.015);
  const [blockagePct, setBlockagePct] = useState<number>(15.0);

  // Manning's Equation Calculation: Q = (1/n) * A * (R^(2/3)) * (S^(1/2))
  const r = diameter / 2.0;
  const area = Math.PI * (r ** 2);
  const perimeter = 2.0 * Math.PI * r;
  const hydraulicRadius = perimeter > 0 ? area / perimeter : 0;
  const slopeMPerM = Math.max(slope / 100.0, 0.0005);
  const theoreticalQ = (1.0 / Math.max(manningN, 0.010)) * area * (hydraulicRadius ** (2.0 / 3.0)) * Math.sqrt(slopeMPerM);
  const effectiveQ = theoreticalQ * (1.0 - (Math.min(blockagePct, 90.0) / 100.0));
  const velocity = area > 0 ? effectiveQ / area : 0;

  return (
    <div className="space-y-6 p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Hydraulic Infrastructure Model</span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded font-bold">
                MANNING CONDUIT GRAPH
              </span>
            </div>
            <h2 className="text-2xl font-black text-white font-['Outfit'] mt-1">
              Stormwater Drainage Network & Surcharge Solver
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Directed graph modeling of primary canals, secondary conduits, and manhole chambers with backwater analysis.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-right">
              <div className="text-[10px] text-slate-400 uppercase">Monitored Conduits</div>
              <div className="text-lg font-bold text-cyan-400 font-['Outfit']">{drainSegments.length} Segments</div>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-right">
              <div className="text-[10px] text-slate-400 uppercase">Drain Nodes</div>
              <div className="text-lg font-bold text-white font-['Outfit']">{drainNodes.length} Chambers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Manning's Pipe Capacity Solver */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white font-['Outfit']">
              Manning's Equation Hydraulic Simulator
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Q = (1/n) · A · R^(2/3) · S^(1/2)</span>
        </div>

        <div className="grid md:grid-cols-4 gap-4 pt-2">
          {/* 1. Diameter Slider */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Pipe Diameter:</span>
              <span className="text-cyan-400 font-bold">{diameter.toFixed(1)} m</span>
            </div>
            <input
              type="range"
              min="0.6"
              max="5.0"
              step="0.1"
              value={diameter}
              onChange={(e) => setDiameter(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="text-[10px] text-slate-400">Precast circular stormwater pipe</div>
          </div>

          {/* 2. Slope Slider */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Bed Slope (S):</span>
              <span className="text-cyan-400 font-bold">{slope.toFixed(2)} %</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1.5"
              step="0.05"
              value={slope}
              onChange={(e) => setSlope(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="text-[10px] text-slate-400">Longitudinal hydraulic gradient</div>
          </div>

          {/* 3. Manning's Roughness n */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Manning's n:</span>
              <span className="text-cyan-400 font-bold">{manningN.toFixed(3)}</span>
            </div>
            <input
              type="range"
              min="0.011"
              max="0.035"
              step="0.001"
              value={manningN}
              onChange={(e) => setManningN(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="text-[10px] text-slate-400">Concrete = 0.015, Brick/Silt = 0.024</div>
          </div>

          {/* 4. Blockage / Debris */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Silt Blockage:</span>
              <span className={`font-bold ${blockagePct > 40 ? 'text-red-400' : 'text-amber-400'}`}>
                {blockagePct.toFixed(0)} %
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              step="5"
              value={blockagePct}
              onChange={(e) => setBlockagePct(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="text-[10px] text-slate-400">De-rates full cross-section capacity</div>
          </div>
        </div>

        {/* Calculated Output Display */}
        <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-800">
          <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl">
            <div className="text-[10px] text-cyan-300 uppercase font-bold">Effective Discharge Capacity</div>
            <div className="text-2xl font-black text-cyan-400 font-['Outfit'] mt-1">
              {effectiveQ.toFixed(2)} <span className="text-xs font-normal text-slate-400">m³/s</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Flow Velocity</div>
            <div className="text-2xl font-black text-white font-['Outfit'] mt-1">
              {velocity.toFixed(2)} <span className="text-xs font-normal text-slate-400">m/s</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Self-Cleansing Criterion</div>
            <div className="text-2xl font-black font-['Outfit'] mt-1">
              {velocity >= 0.75 ? (
                <span className="text-emerald-400 text-lg">✓ Adequate (&ge; 0.75 m/s)</span>
              ) : (
                <span className="text-red-400 text-lg">⚠️ Siltation Hazard (&lt; 0.75 m/s)</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Drainage Conduits Surcharge Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <h3 className="text-base font-bold text-white font-['Outfit']">
          Chennai Monitored Drainage Segments & Hydraulic Utilization
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Conduit Code</th>
                <th className="p-3">Type</th>
                <th className="p-3">Length & Diam</th>
                <th className="p-3">Design Capacity</th>
                <th className="p-3">Current Flow</th>
                <th className="p-3">Capacity Utilization</th>
                <th className="p-3">Silt Blockage</th>
                <th className="p-3">Outfall Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {drainSegments.map((seg) => (
                <tr key={seg.id} className="hover:bg-slate-800/50 transition">
                  <td className="p-3 font-semibold text-cyan-300">{seg.segment_code}</td>
                  <td className="p-3 text-slate-400">{seg.drain_type}</td>
                  <td className="p-3 text-slate-300">{seg.length_m}m (Ø {seg.diameter_m}m)</td>
                  <td className="p-3 font-medium text-slate-200">{seg.design_capacity_m3s} m³/s</td>
                  <td className="p-3 font-bold text-slate-100">{seg.current_flow_m3s} m³/s</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full ${seg.capacity_utilization_pct > 100 ? 'bg-red-500' : seg.capacity_utilization_pct > 75 ? 'bg-amber-500' : 'bg-cyan-500'}`}
                          style={{ width: `${Math.min(100, seg.capacity_utilization_pct)}%` }}
                        ></div>
                      </div>
                      <span className={`font-bold ${seg.capacity_utilization_pct > 100 ? 'text-red-400' : seg.capacity_utilization_pct > 75 ? 'text-amber-400' : 'text-cyan-300'}`}>
                        {seg.capacity_utilization_pct}%
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      seg.debris_blockage_pct > 30 ? 'bg-red-500/20 text-red-300' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {seg.debris_blockage_pct}% Silt
                    </span>
                  </td>
                  <td className="p-3 text-slate-400 truncate max-w-[180px]">{seg.outfall_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
