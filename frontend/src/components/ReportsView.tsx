import React, { useState } from 'react';
import { FileText, Download, Printer, CheckCircle2, ShieldCheck, Waves, Droplets, MapPin } from 'lucide-react';
import { Area, Road, DrainNode, Sensor, Alert } from '../types';

interface ReportsViewProps {
  currentArea: Area | undefined;
  roads: Road[];
  drainNodes: DrainNode[];
  sensors: Sensor[];
  alerts: Alert[];
  rainfallIntensity: number;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  currentArea,
  roads,
  drainNodes,
  sensors,
  alerts,
  rainfallIntensity,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const reportId = `REP-CHN-WD${currentArea?.ward_number || 179}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;
  const inundatedRoads = roads.filter(r => r.current_water_depth_cm > 15);
  const maxDepth = Math.max(...roads.map(r => r.current_water_depth_cm), 0);
  const surchargedNodes = drainNodes.filter(n => n.status === 'SURCHARGE' || n.status === 'OVERFLOW' || n.status === 'BACKFLOW');

  const handleDownloadCsv = () => {
    const csvContent = [
      ['DRAIN-X CHENNAI URBAN FLOOD NOWCAST REPORT'],
      ['Report ID', reportId],
      ['Generated At', new Date().toISOString()],
      ['Ward / Area', currentArea?.name || 'Velachery'],
      ['Zone', currentArea?.zone_number || 13],
      ['Rainfall Intensity (mm/h)', rainfallIntensity.toFixed(1)],
      ['Max Street Flood Depth (cm)', maxDepth],
      ['Inundated Roads Count', inundatedRoads.length],
      ['Surcharged Manholes Count', surchargedNodes.length],
      [],
      ['STREET INUNDATION DETAILS'],
      ['Street Name', 'Road Type', 'Elevation (m)', 'Current Depth (cm)', 'Passability'],
      ...roads.map(r => [r.name, r.road_type, r.elevation_m, r.current_water_depth_cm, r.passability_status]),
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportId}_Flood_Analytics.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Executive Disaster Analytics</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                {reportId}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white font-['Outfit'] mt-1">
              Urban Inundation & Drainage Executive Summary
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Automated compliance report for GCC Zonal Engineers, NDRF field commanders, and TNSDMA controllers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow transition"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV / Data</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Briefing</span>
            </button>
          </div>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Successfully exported CSV report: <b>{reportId}_Flood_Analytics.csv</b></span>
        </div>
      )}

      {/* Structured Report Document Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl space-y-6 text-slate-200">
        {/* Report Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="text-xs font-bold text-cyan-400 uppercase">DRAIN-X SMART CITY PLATFORM</div>
            <h3 className="text-xl font-black text-white font-['Outfit'] mt-0.5">
              Ward {currentArea?.ward_number} ({currentArea?.name}) Flood Vulnerability Assessment
            </h3>
            <p className="text-xs text-slate-400">Generated: {new Date().toLocaleString()}</p>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-right text-xs">
            <div className="text-[10px] text-slate-400">Risk Classification:</div>
            <div className="text-base font-black text-red-400 uppercase">
              {maxDepth > 40 ? 'CRITICAL DELUGE' : maxDepth > 20 ? 'ELEVATED WARNING' : 'NOMINAL MONITORING'}
            </div>
          </div>
        </div>

        {/* Section 1: Executive KPI Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="text-[10px] text-slate-400 uppercase">Rainfall Rate</div>
            <div className="text-xl font-bold text-cyan-400 font-['Outfit'] mt-1">
              {rainfallIntensity.toFixed(1)} mm/h
            </div>
          </div>
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="text-[10px] text-slate-400 uppercase">Max Flood Depth</div>
            <div className="text-xl font-bold text-red-400 font-['Outfit'] mt-1">
              {maxDepth} cm
            </div>
          </div>
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="text-[10px] text-slate-400 uppercase">Flooded Streets</div>
            <div className="text-xl font-bold text-amber-400 font-['Outfit'] mt-1">
              {inundatedRoads.length} / {roads.length}
            </div>
          </div>
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="text-[10px] text-slate-400 uppercase">Surcharged Nodes</div>
            <div className="text-xl font-bold text-purple-400 font-['Outfit'] mt-1">
              {surchargedNodes.length} / {drainNodes.length}
            </div>
          </div>
        </div>

        {/* Section 2: Detailed Street Inundation Log */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            1. Monitored Street-Level Inundation Status
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-2.5">Street Name</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5">DEM Elevation</th>
                  <th className="p-2.5">Current Depth</th>
                  <th className="p-2.5">Passability Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {roads.map(r => (
                  <tr key={r.id}>
                    <td className="p-2.5 font-semibold text-white">{r.name}</td>
                    <td className="p-2.5 text-slate-400">{r.road_type}</td>
                    <td className="p-2.5 text-cyan-300">{r.elevation_m} m</td>
                    <td className="p-2.5 font-bold text-slate-200">{r.current_water_depth_cm} cm</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.passability_status === 'IMPASSABLE' ? 'bg-red-500/20 text-red-300' :
                        r.passability_status === 'SLOW' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-emerald-500/20 text-emerald-300'
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

        {/* Section 3: Recommended Municipal Interventions */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
          <h4 className="text-xs font-bold text-cyan-300 uppercase">
            2. Tactical Mitigation Directives (TNSDMA / GCC)
          </h4>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
            <li><b>Dewatering Pump Deployment:</b> Position 5000 LPM mobile diesel pumps at Vijayanagar Bus Stand and Lake Bund lowlands.</li>
            <li><b>Traffic Advisory:</b> Implement arterial diversion away from Velachery Main Road towards elevated 100ft Bypass corridor.</li>
            <li><b>Canal Outfall Gate Check:</b> Inspect Buckingham Canal sea outfall for tidal backpressure and clear debris silt blockages at MH-VEL-06.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
