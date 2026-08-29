import React, { useState } from 'react';
import { 
  Cpu, Activity, Battery, Signal, AlertTriangle, ShieldCheck, RefreshCw, Layers, 
  Waves, Gauge, Thermometer, Radio, ArrowRight, CheckCircle2, Maximize2, Zap, HardDrive 
} from 'lucide-react';
import { Sensor } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface SensorsViewProps {
  sensors: Sensor[];
  rainfallIntensity: number;
}

export const SensorsView: React.FC<SensorsViewProps> = ({
  sensors,
  rainfallIntensity,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [selectedSensorId, setSelectedSensorId] = useState<number>(sensors[0]?.id || 1);
  const [showDiagramModal, setShowDiagramModal] = useState<boolean>(false);

  const filteredSensors = filterType === 'ALL'
    ? sensors
    : sensors.filter(s => s.sensor_type === filterType);

  const selectedSensor = sensors.find(s => s.id === selectedSensorId) || sensors[0];

  // Simulated 60-minute time-series telemetry for selected sensor
  const telemetryHistory = [
    { time: '-60m', val: Number((selectedSensor?.current_value * 0.45 || 35).toFixed(2)) },
    { time: '-50m', val: Number((selectedSensor?.current_value * 0.55 || 42).toFixed(2)) },
    { time: '-40m', val: Number((selectedSensor?.current_value * 0.68 || 55).toFixed(2)) },
    { time: '-30m', val: Number((selectedSensor?.current_value * 0.78 || 64).toFixed(2)) },
    { time: '-20m', val: Number((selectedSensor?.current_value * 0.88 || 72).toFixed(2)) },
    { time: '-10m', val: Number((selectedSensor?.current_value * 0.95 || 78).toFixed(2)) },
    { time: 'NOW', val: Number((selectedSensor?.current_value || 82).toFixed(2)) },
  ];

  return (
    <div className="space-y-6 p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Edge IoT Telemetry</span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded font-bold">
                LoRaWAN / IP68 EDGE GATEWAY
              </span>
            </div>
            <h2 className="text-2xl font-black text-white font-['Outfit'] mt-1">
              Smart Urban Manhole Sensing Fleet & Hardware Architecture
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Real-time non-contact ultrasonic transducers, Doppler pipe velocity meters, and LoRa Edge Telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-right">
              <div className="text-[10px] text-slate-400 uppercase">Fleet Size</div>
              <div className="text-lg font-bold text-cyan-400 font-['Outfit']">{sensors.length} Nodes</div>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-right">
              <div className="text-[10px] text-slate-400 uppercase">Online Health</div>
              <div className="text-lg font-bold text-emerald-400 font-['Outfit']">
                {sensors.filter(s => s.health_status === 'ONLINE').length} / {sensors.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURED: PROFESSIONAL ENGINEERING CUTAWAY DIAGRAM SECTION */}
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xl font-black text-white font-['Outfit']">
                DRAIN-X Smart Urban Stormwater Manhole Sensing System
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Physical engineering cutaway, sensor placement, data pipeline & LoRaWAN gateway communication architecture.
            </p>
          </div>

          <button
            onClick={() => setShowDiagramModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-xs rounded-xl shadow-lg hover:brightness-110 transition border border-cyan-300/30"
          >
            <Maximize2 className="w-4 h-4" />
            <span>View High-Res Cutaway</span>
          </button>
        </div>

        {/* Diagram & Component Breakdown Grid */}
        <div className="grid lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Image Preview */}
          <div className="lg:col-span-7 relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl group cursor-pointer" onClick={() => setShowDiagramModal(true)}>
            <img 
              src="/smart_manhole_diagram.jpg" 
              alt="DRAIN-X Smart Manhole Sensing System Engineering Diagram" 
              className="w-full h-[380px] object-cover group-hover:scale-105 transition duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex items-end p-4">
              <div className="flex items-center justify-between w-full text-xs">
                <span className="bg-slate-900/90 text-cyan-300 font-mono px-3 py-1 rounded-lg border border-slate-700">
                  📷 Figure 1: Urban Stormwater Manhole Technical Cutaway
                </span>
                <span className="text-cyan-400 font-bold bg-cyan-950/90 px-3 py-1 rounded-lg border border-cyan-600/50 flex items-center gap-1">
                  <Maximize2 className="w-3.5 h-3.5" /> Click to Enlarge
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Physical Sensor Callout Registry */}
          <div className="lg:col-span-5 space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {/* 1. Ultrasonic Water-Level */}
            <div className="p-3 bg-slate-950/80 border border-cyan-500/40 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
                <span className="flex items-center gap-1.5">
                  <Waves className="w-4 h-4 text-cyan-400" /> 1. WATER-LEVEL SENSOR
                </span>
                <span className="font-mono text-cyan-200 bg-cyan-950 px-2 py-0.5 rounded">82 cm</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Non-contact ultrasonic beam mounted at top rim, converting distance to water surface into real-time depth.
              </p>
            </div>

            {/* 2. Flow Sensor */}
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1 hover:border-slate-700 transition">
              <div className="flex items-center justify-between text-xs font-bold text-blue-300">
                <span className="flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-blue-400" /> 2. FLOW SENSOR
                </span>
                <span className="font-mono text-blue-200 bg-blue-950 px-2 py-0.5 rounded">46 L/s</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Submerged Doppler acoustic velocity sensor measuring water discharge rate inside the pipe.
              </p>
            </div>

            {/* 3. Blockage Monitoring */}
            <div className="p-3 bg-slate-950/80 border border-amber-500/40 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" /> 3. BLOCKAGE DETECTION
                </span>
                <span className="font-mono text-amber-200 bg-amber-950 px-2 py-0.5 rounded">Level ↑ / Flow ↓</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Condition estimation algorithm combining rising level + restricted flow rate to detect debris/sediment obstruction.
              </p>
            </div>

            {/* 4. Overflow Sensor */}
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> 4. OVERFLOW SENSOR
                </span>
                <span className="font-mono text-emerald-200 bg-emerald-950 px-2 py-0.5 rounded">NORMAL</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Event-triggered threshold sensor at critical rim height triggering instant priority alarm on surcharge.
              </p>
            </div>

            {/* 5. Temperature Sensor */}
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-slate-400" /> 5. TEMPERATURE SENSOR
                </span>
                <span className="font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded">29°C</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Wall-mounted waterproof ambient/enclosure thermal sensor for operational health diagnostics.
              </p>
            </div>

            {/* 6. IoT Edge Controller */}
            <div className="p-3 bg-slate-950/80 border border-cyan-500/40 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
                <span className="flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-cyan-400" /> 6. IP68 IoT EDGE CONTROLLER
                </span>
                <span className="font-mono text-cyan-200 bg-cyan-950 px-2 py-0.5 rounded">NODE M26</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Waterproof wall-mounted microcontroller aggregating sensor signals, stamping UTC time & packaging telemetry payloads.
              </p>
            </div>

            {/* 7. LoRa Radio & Gateway */}
            <div className="p-3 bg-slate-950/80 border border-indigo-500/40 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
                <span className="flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-indigo-400" /> 7. LoRa RADIO & GATEWAY
                </span>
                <span className="font-mono text-indigo-200 bg-indigo-950 px-2 py-0.5 rounded">868 MHz</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Transmits data wirelessly out of manhole to street-level LoRaWAN Gateway servicing multiple urban manholes.
              </p>
            </div>
          </div>
        </div>

        {/* Data Pipeline Flow Banner */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="font-extrabold text-cyan-300 uppercase tracking-wider font-['Outfit']">
            Physical Communication Path:
          </div>
          
          <div className="flex items-center gap-2 flex-wrap text-[11px] font-bold font-mono">
            <span className="px-2.5 py-1 rounded bg-slate-900 text-slate-200 border border-slate-700">Sensors</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            <span className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">IoT Edge Controller</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            <span className="px-2.5 py-1 rounded bg-slate-900 text-slate-200 border border-slate-700">LoRa Radio</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            <span className="px-2.5 py-1 rounded bg-indigo-950 text-indigo-300 border border-indigo-700">Wireless Transmission</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">LoRaWAN Gateway</span>
          </div>
        </div>
      </div>

      {/* Selected Sensor Telemetry Deep Dive */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Sensor Details Card */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 uppercase">Node Diagnostics</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              selectedSensor?.health_status === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
              selectedSensor?.health_status === 'WARNING' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
              'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}>
              {selectedSensor?.health_status || 'ONLINE'}
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-white font-['Outfit']">{selectedSensor?.name || 'Velachery Manhole Sensor'}</h3>
            <p className="text-xs font-mono text-cyan-300 mt-0.5">{selectedSensor?.sensor_code || 'SN-VEL-001'}</p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400">Current Reading Value</div>
            <div className="text-3xl font-black text-white font-['Outfit'] mt-1">
              {selectedSensor?.current_value || 82} <span className="text-base font-normal text-cyan-400">{selectedSensor?.unit || 'cm'}</span>
            </div>
            <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-2">
              <span>Warning: <b>{selectedSensor?.warning_threshold || 50} {selectedSensor?.unit || 'cm'}</b></span>
              <span className="text-red-400">Critical: <b>{selectedSensor?.critical_threshold || 80} {selectedSensor?.unit || 'cm'}</b></span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2">
              <Battery className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[10px] text-slate-400">Battery Level</div>
                <div className="font-bold text-white">{selectedSensor?.battery_level_pct || 94}%</div>
              </div>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2">
              <Signal className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-[10px] text-slate-400">Signal RSSI</div>
                <div className="font-bold text-white">{selectedSensor?.signal_rssi || -72} dBm</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: 60-Minute Telemetry Stream Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white font-['Outfit']">
                60-Minute Real-Time Telemetry Stream
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">Sample Interval: 10 min</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="val" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4, fill: '#22d3ee' }} name={`Value (${selectedSensor?.unit || 'cm'})`} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-2">
            <span>📡 Node Location: <b>{selectedSensor?.lat.toFixed(4) || 12.9815}°N, {selectedSensor?.lng.toFixed(4) || 80.2180}°E</b></span>
            <span className="text-cyan-300">Live Ingestion Active</span>
          </div>
        </div>
      </div>

      {/* Sensor Registry Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-bold text-white font-['Outfit']">
            Monitored Sensor Fleet Register
          </h3>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {['ALL', 'WATER_LEVEL', 'FLOW_VELOCITY', 'ULTRASONIC_BLOCKAGE', 'RAIN_GAUGE'].map((typ) => (
              <button
                key={typ}
                onClick={() => setFilterType(typ)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                  filterType === typ
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {typ.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Sensor Node</th>
                <th className="p-3">Type</th>
                <th className="p-3">Current Telemetry</th>
                <th className="p-3">Warning / Critical</th>
                <th className="p-3">Battery</th>
                <th className="p-3">Health Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSensors.map((s) => (
                <tr key={s.id} className={`hover:bg-slate-800/50 transition ${selectedSensorId === s.id ? 'bg-slate-800/30' : ''}`}>
                  <td className="p-3">
                    <div className="font-semibold text-white">{s.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{s.sensor_code}</div>
                  </td>
                  <td className="p-3 text-slate-300">{s.sensor_type.replace('_', ' ')}</td>
                  <td className="p-3 font-bold text-cyan-300 text-sm">
                    {s.current_value} {s.unit}
                  </td>
                  <td className="p-3 text-slate-400">
                    {s.warning_threshold} / {s.critical_threshold} {s.unit}
                  </td>
                  <td className="p-3 text-emerald-400 font-medium">{s.battery_level_pct}%</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.health_status === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                      s.health_status === 'WARNING' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {s.health_status}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => setSelectedSensorId(s.id)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white rounded text-[10px] font-semibold transition"
                    >
                      View Stream
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* High-Res Modal */}
      {showDiagramModal && (
        <div 
          className="fixed inset-0 z-[999] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setShowDiagramModal(false)}
        >
          <div className="relative max-w-6xl w-full bg-slate-900 border border-cyan-500/50 rounded-2xl overflow-hidden shadow-2xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-white font-['Outfit']">
                  DRAIN-X Smart Manhole Hardware & Sensing Engineering Cutaway
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Physical Sensor Placement • Data Flow • IP68 Edge Enclosure • LoRaWAN Gateway Architecture
                </p>
              </div>
              <button 
                onClick={() => setShowDiagramModal(false)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg"
              >
                Close (ESC)
              </button>
            </div>

            <div className="overflow-auto max-h-[80vh] flex items-center justify-center">
              <img 
                src="/smart_manhole_diagram.jpg" 
                alt="High-Res Smart Manhole Engineering Cutaway Diagram" 
                className="w-full h-auto rounded-xl object-contain max-h-[75vh]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
