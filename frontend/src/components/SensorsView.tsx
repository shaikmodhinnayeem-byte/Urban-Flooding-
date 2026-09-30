import React, { useState, useEffect } from 'react';
import { 
  Cpu, Activity, Battery, Signal, AlertTriangle, ShieldCheck, RefreshCw, Layers, 
  Waves, Gauge, Thermometer, Radio, ArrowRight, CheckCircle2, Maximize2, Zap, HardDrive,
  Droplets, Binary, Calculator, CloudRain, Shield, BarChart3, Wifi, MapPin, Filter
} from 'lucide-react';
import { Sensor, Area } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface SensorsViewProps {
  sensors: Sensor[];
  rainfallIntensity: number;
  currentArea?: Area | null;
}

export const SensorsView: React.FC<SensorsViewProps> = ({
  sensors,
  rainfallIntensity,
  currentArea,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [selectedSensorId, setSelectedSensorId] = useState<number>(sensors[0]?.id || 1);
  const [showDiagramModal, setShowDiagramModal] = useState<boolean>(false);
  const [activeTelemetryMetric, setActiveTelemetryMetric] = useState<'depth' | 'flow' | 'temp'>('depth');
  const [selectedWardFilter, setSelectedWardFilter] = useState<string>('ALL');

  // Sync selectedWardFilter when top navbar currentArea changes
  useEffect(() => {
    if (currentArea?.name) {
      const areaNameUpper = currentArea.name.toUpperCase();
      if (areaNameUpper.includes('VELACHERY')) setSelectedWardFilter('VELACHERY');
      else if (areaNameUpper.includes('NAGAR')) setSelectedWardFilter('TNAGAR');
      else if (areaNameUpper.includes('TAMBARAM')) setSelectedWardFilter('TAMBARAM');
      else if (areaNameUpper.includes('ADYAR')) setSelectedWardFilter('ADYAR');
      else if (areaNameUpper.includes('PERUNGUDI')) setSelectedWardFilter('PERUNGUDI');
      else if (areaNameUpper.includes('MYLAPORE')) setSelectedWardFilter('MYLAPORE');
    }
  }, [currentArea]);

  const filteredSensors = filterType === 'ALL'
    ? sensors
    : sensors.filter(s => s.sensor_type === filterType);

  const selectedSensor = sensors.find(s => s.id === selectedSensorId) || sensors[0];

  // Comprehensive Multi-Manhole Ward Sensor Network Dataset for all Chennai Metropolitan Zones
  const wardManholes = [
    // --- Ward 179 (Velachery) ---
    {
      id: 'MH-179-01',
      name: 'Vijayanagar Bus Terminus Junction',
      ward: 'Ward 179 (Velachery)',
      zoneCode: 'VELACHERY',
      pipeDiameterMm: 1500,
      pipeDiameterInch: '60"',
      groundElevM: 2.4,
      invertElevM: 0.8,
      rangingDistCm: 78,
      waterDepthCm: 85,
      surchargePct: 85,
      flowRateLs: 52.4,
      status: 'CRITICAL',
      batteryPct: 98,
      rssi: -92,
      sensorCode: 'SN-VEL-MH-01'
    },
    {
      id: 'MH-179-02',
      name: '100ft Bypass Canal Intake Node',
      ward: 'Ward 179 (Velachery)',
      zoneCode: 'VELACHERY',
      pipeDiameterMm: 1800,
      pipeDiameterInch: '72"',
      groundElevM: 2.6,
      invertElevM: 1.1,
      rangingDistCm: 92,
      waterDepthCm: 58,
      surchargePct: 58,
      flowRateLs: 68.2,
      status: 'SURCHARGE',
      batteryPct: 94,
      rssi: -88,
      sensorCode: 'SN-VEL-MH-02'
    },
    {
      id: 'MH-179-03',
      name: 'Taramani Link Road Conduit Siphon',
      ward: 'Ward 179 (Velachery)',
      zoneCode: 'VELACHERY',
      pipeDiameterMm: 1200,
      pipeDiameterInch: '48"',
      groundElevM: 3.6,
      invertElevM: 1.5,
      rangingDistCm: 115,
      waterDepthCm: 35,
      surchargePct: 35,
      flowRateLs: 34.0,
      status: 'NORMAL',
      batteryPct: 100,
      rssi: -76,
      sensorCode: 'SN-VEL-MH-03'
    },
    {
      id: 'MH-179-04',
      name: 'Velachery Lake Outfall Channel',
      ward: 'Ward 179 (Velachery)',
      zoneCode: 'VELACHERY',
      pipeDiameterMm: 2000,
      pipeDiameterInch: '80"',
      groundElevM: 1.9,
      invertElevM: 0.5,
      rangingDistCm: 48,
      waterDepthCm: 92,
      surchargePct: 92,
      flowRateLs: 88.5,
      status: 'CRITICAL',
      batteryPct: 91,
      rssi: -95,
      sensorCode: 'SN-VEL-MH-04'
    },
    {
      id: 'MH-179-05',
      name: 'Pallikaranai Marsh Sluice Chamber',
      ward: 'Ward 179 (Velachery)',
      zoneCode: 'VELACHERY',
      pipeDiameterMm: 1500,
      pipeDiameterInch: '60"',
      groundElevM: 2.2,
      invertElevM: 0.4,
      rangingDistCm: 68,
      waterDepthCm: 72,
      surchargePct: 72,
      flowRateLs: 74.1,
      status: 'SURCHARGE',
      batteryPct: 96,
      rssi: -84,
      sensorCode: 'SN-VEL-MH-05'
    },

    // --- Ward 173 (T. Nagar) ---
    {
      id: 'MH-173-01',
      name: 'Usman Road Flyover Trunk Drain',
      ward: 'Ward 173 (T. Nagar)',
      zoneCode: 'TNAGAR',
      pipeDiameterMm: 1500,
      pipeDiameterInch: '60"',
      groundElevM: 5.8,
      invertElevM: 3.5,
      rangingDistCm: 85,
      waterDepthCm: 65,
      surchargePct: 65,
      flowRateLs: 48.0,
      status: 'SURCHARGE',
      batteryPct: 95,
      rssi: -82,
      sensorCode: 'SN-TNG-MH-01'
    },
    {
      id: 'MH-173-02',
      name: 'Pondy Bazaar Central Storm Siphon',
      ward: 'Ward 173 (T. Nagar)',
      zoneCode: 'TNAGAR',
      pipeDiameterMm: 1800,
      pipeDiameterInch: '72"',
      groundElevM: 4.9,
      invertElevM: 2.8,
      rangingDistCm: 36,
      waterDepthCm: 94,
      surchargePct: 94,
      flowRateLs: 92.0,
      status: 'CRITICAL',
      batteryPct: 90,
      rssi: -96,
      sensorCode: 'SN-TNG-MH-02'
    },
    {
      id: 'MH-173-03',
      name: 'Rangarajapuram Subway Box Culvert',
      ward: 'Ward 173 (T. Nagar)',
      zoneCode: 'TNAGAR',
      pipeDiameterMm: 2000,
      pipeDiameterInch: '80"',
      groundElevM: 4.2,
      invertElevM: 1.9,
      rangingDistCm: 55,
      waterDepthCm: 75,
      surchargePct: 75,
      flowRateLs: 64.2,
      status: 'HIGH',
      batteryPct: 97,
      rssi: -86,
      sensorCode: 'SN-TNG-MH-03'
    },
    {
      id: 'MH-173-04',
      name: 'GN Chetty Road Junction Outfall',
      ward: 'Ward 173 (T. Nagar)',
      zoneCode: 'TNAGAR',
      pipeDiameterMm: 1200,
      pipeDiameterInch: '48"',
      groundElevM: 5.2,
      invertElevM: 3.1,
      rangingDistCm: 108,
      waterDepthCm: 42,
      surchargePct: 42,
      flowRateLs: 38.5,
      status: 'NORMAL',
      batteryPct: 99,
      rssi: -78,
      sensorCode: 'SN-TNG-MH-04'
    },

    // --- Ward 192 (Tambaram) ---
    {
      id: 'MH-192-01',
      name: 'Mudichur Low Basin Main Siphon',
      ward: 'Ward 192 (Tambaram)',
      zoneCode: 'TAMBARAM',
      pipeDiameterMm: 1800,
      pipeDiameterInch: '72"',
      groundElevM: 3.1,
      invertElevM: 1.0,
      rangingDistCm: 42,
      waterDepthCm: 88,
      surchargePct: 88,
      flowRateLs: 78.4,
      status: 'CRITICAL',
      batteryPct: 92,
      rssi: -94,
      sensorCode: 'SN-TMB-MH-01'
    },
    {
      id: 'MH-192-02',
      name: 'GST Road Highway Culvert Intake',
      ward: 'Ward 192 (Tambaram)',
      zoneCode: 'TAMBARAM',
      pipeDiameterMm: 1500,
      pipeDiameterInch: '60"',
      groundElevM: 4.5,
      invertElevM: 2.2,
      rangingDistCm: 88,
      waterDepthCm: 62,
      surchargePct: 62,
      flowRateLs: 54.0,
      status: 'SURCHARGE',
      batteryPct: 96,
      rssi: -85,
      sensorCode: 'SN-TMB-MH-02'
    },
    {
      id: 'MH-192-03',
      name: 'West Tambaram Rail Subway Box Drain',
      ward: 'Ward 192 (Tambaram)',
      zoneCode: 'TAMBARAM',
      pipeDiameterMm: 2000,
      pipeDiameterInch: '80"',
      groundElevM: 2.8,
      invertElevM: 0.9,
      rangingDistCm: 50,
      waterDepthCm: 82,
      surchargePct: 82,
      flowRateLs: 86.1,
      status: 'CRITICAL',
      batteryPct: 89,
      rssi: -98,
      sensorCode: 'SN-TMB-MH-03'
    },
    {
      id: 'MH-192-04',
      name: 'Tambaram Lake Overflow Spillway',
      ward: 'Ward 192 (Tambaram)',
      zoneCode: 'TAMBARAM',
      pipeDiameterMm: 1500,
      pipeDiameterInch: '60"',
      groundElevM: 5.1,
      invertElevM: 3.0,
      rangingDistCm: 110,
      waterDepthCm: 45,
      surchargePct: 45,
      flowRateLs: 41.2,
      status: 'NORMAL',
      batteryPct: 98,
      rssi: -80,
      sensorCode: 'SN-TMB-MH-04'
    },

    // --- Ward 175 (Adyar) ---
    {
      id: 'MH-175-01',
      name: 'Kotturpuram Sluice Gate Junction',
      ward: 'Ward 175 (Adyar)',
      zoneCode: 'ADYAR',
      pipeDiameterMm: 1500,
      pipeDiameterInch: '60"',
      groundElevM: 3.8,
      invertElevM: 1.9,
      rangingDistCm: 76,
      waterDepthCm: 68,
      surchargePct: 68,
      flowRateLs: 58.0,
      status: 'SURCHARGE',
      batteryPct: 95,
      rssi: -86,
      sensorCode: 'SN-ADY-MH-01'
    },
    {
      id: 'MH-175-02',
      name: 'LB Road Underpass Storm Siphon',
      ward: 'Ward 175 (Adyar)',
      zoneCode: 'ADYAR',
      pipeDiameterMm: 1200,
      pipeDiameterInch: '48"',
      groundElevM: 4.6,
      invertElevM: 2.7,
      rangingDistCm: 104,
      waterDepthCm: 48,
      surchargePct: 48,
      flowRateLs: 36.5,
      status: 'NORMAL',
      batteryPct: 100,
      rssi: -79,
      sensorCode: 'SN-ADY-MH-02'
    },
    {
      id: 'MH-175-03',
      name: 'Adyar Estuary Tidal Outfall',
      ward: 'Ward 175 (Adyar)',
      zoneCode: 'ADYAR',
      pipeDiameterMm: 2200,
      pipeDiameterInch: '88"',
      groundElevM: 1.5,
      invertElevM: 0.2,
      rangingDistCm: 62,
      waterDepthCm: 74,
      surchargePct: 74,
      flowRateLs: 95.2,
      status: 'HIGH',
      batteryPct: 93,
      rssi: -90,
      sensorCode: 'SN-ADY-MH-03'
    },

    // --- Ward 184 (Perungudi) ---
    {
      id: 'MH-184-01',
      name: 'Kallukuttai Wetland Main Channel',
      ward: 'Ward 184 (Perungudi)',
      zoneCode: 'PERUNGUDI',
      pipeDiameterMm: 1800,
      pipeDiameterInch: '72"',
      groundElevM: 2.1,
      invertElevM: 0.5,
      rangingDistCm: 45,
      waterDepthCm: 86,
      surchargePct: 86,
      flowRateLs: 79.0,
      status: 'CRITICAL',
      batteryPct: 91,
      rssi: -93,
      sensorCode: 'SN-PRG-MH-01'
    },
    {
      id: 'MH-184-02',
      name: 'OMR IT Expressway Box Culvert',
      ward: 'Ward 184 (Perungudi)',
      zoneCode: 'PERUNGUDI',
      pipeDiameterMm: 2000,
      pipeDiameterInch: '80"',
      groundElevM: 3.4,
      invertElevM: 1.6,
      rangingDistCm: 82,
      waterDepthCm: 64,
      surchargePct: 64,
      flowRateLs: 61.5,
      status: 'SURCHARGE',
      batteryPct: 96,
      rssi: -87,
      sensorCode: 'SN-PRG-MH-02'
    },
    {
      id: 'MH-184-03',
      name: 'Thoraipakkam Marsh Link Conduit',
      ward: 'Ward 184 (Perungudi)',
      zoneCode: 'PERUNGUDI',
      pipeDiameterMm: 1500,
      pipeDiameterInch: '60"',
      groundElevM: 4.0,
      invertElevM: 2.1,
      rangingDistCm: 118,
      waterDepthCm: 38,
      surchargePct: 38,
      flowRateLs: 32.0,
      status: 'NORMAL',
      batteryPct: 99,
      rssi: -77,
      sensorCode: 'SN-PRG-MH-03'
    },

    // --- Ward 124 (Mylapore) ---
    {
      id: 'MH-124-01',
      name: 'Kapaleeshwarar Tank Overflow Outfall',
      ward: 'Ward 124 (Mylapore)',
      zoneCode: 'MYLAPORE',
      pipeDiameterMm: 1500,
      pipeDiameterInch: '60"',
      groundElevM: 5.5,
      invertElevM: 3.4,
      rangingDistCm: 52,
      waterDepthCm: 82,
      surchargePct: 82,
      flowRateLs: 71.0,
      status: 'CRITICAL',
      batteryPct: 94,
      rssi: -91,
      sensorCode: 'SN-MYL-MH-01'
    },
    {
      id: 'MH-124-02',
      name: 'Luz Church Road Main Trunk Drain',
      ward: 'Ward 124 (Mylapore)',
      zoneCode: 'MYLAPORE',
      pipeDiameterMm: 1200,
      pipeDiameterInch: '48"',
      groundElevM: 6.1,
      invertElevM: 4.0,
      rangingDistCm: 96,
      waterDepthCm: 52,
      surchargePct: 52,
      flowRateLs: 44.5,
      status: 'SURCHARGE',
      batteryPct: 97,
      rssi: -83,
      sensorCode: 'SN-MYL-MH-02'
    },
    {
      id: 'MH-124-03',
      name: 'Santhome Beach Road Tidal Outfall',
      ward: 'Ward 124 (Mylapore)',
      zoneCode: 'MYLAPORE',
      pipeDiameterMm: 1800,
      pipeDiameterInch: '72"',
      groundElevM: 2.0,
      invertElevM: 0.6,
      rangingDistCm: 125,
      waterDepthCm: 32,
      surchargePct: 32,
      flowRateLs: 28.0,
      status: 'NORMAL',
      batteryPct: 100,
      rssi: -75,
      sensorCode: 'SN-MYL-MH-03'
    }
  ];

  // Dynamic Ward Filter Logic
  const filteredWardManholes = selectedWardFilter === 'ALL'
    ? wardManholes
    : wardManholes.filter(mh => mh.zoneCode === selectedWardFilter);

  // Dynamic Ward Telemetry Metrics Map (re-computes all top ribbon values automatically on Ward selection!)
  const wardTelemetryMap: Record<string, {
    rainRate: number;
    tips60m: number;
    waterDepth: number;
    rimDist: number;
    flowVelocity: number;
    flowSpeed: number;
    tempC: number;
    humidityPct: number;
    blockageRiskStr: string;
    blockageRiskPct: number;
    rssi: number;
    batteryPct: number;
    wardTitle: string;
  }> = {
    ALL: {
      rainRate: rainfallIntensity > 0 ? rainfallIntensity : 19.5,
      tips60m: Math.round((rainfallIntensity > 0 ? rainfallIntensity : 19.5) * 3.58),
      waterDepth: 82.0,
      rimDist: 78,
      flowVelocity: 52.4,
      flowSpeed: 1.85,
      tempC: 29.2,
      humidityPct: 78,
      blockageRiskStr: 'LOW',
      blockageRiskPct: 12,
      rssi: -88,
      batteryPct: 98,
      wardTitle: 'All Metropolitan Zones (14 Wards)'
    },
    VELACHERY: {
      rainRate: 24.5,
      tips60m: 88,
      waterDepth: 85.0,
      rimDist: 78,
      flowVelocity: 52.4,
      flowSpeed: 1.85,
      tempC: 29.2,
      humidityPct: 78,
      blockageRiskStr: 'CRITICAL',
      blockageRiskPct: 85,
      rssi: -92,
      batteryPct: 98,
      wardTitle: 'Ward 179 (Velachery Zone 13)'
    },
    TNAGAR: {
      rainRate: 18.2,
      tips60m: 65,
      waterDepth: 94.0,
      rimDist: 36,
      flowVelocity: 92.0,
      flowSpeed: 2.45,
      tempC: 28.8,
      humidityPct: 82,
      blockageRiskStr: 'CRITICAL',
      blockageRiskPct: 94,
      rssi: -96,
      batteryPct: 90,
      wardTitle: 'Ward 173 (T. Nagar Zone 10)'
    },
    TAMBARAM: {
      rainRate: 32.0,
      tips60m: 115,
      waterDepth: 88.0,
      rimDist: 42,
      flowVelocity: 78.4,
      flowSpeed: 2.20,
      tempC: 30.1,
      humidityPct: 85,
      blockageRiskStr: 'CRITICAL',
      blockageRiskPct: 88,
      rssi: -94,
      batteryPct: 92,
      wardTitle: 'Ward 192 (Tambaram Zone 15)'
    },
    ADYAR: {
      rainRate: 14.0,
      tips60m: 50,
      waterDepth: 68.0,
      rimDist: 76,
      flowVelocity: 58.0,
      flowSpeed: 1.45,
      tempC: 27.5,
      humidityPct: 72,
      blockageRiskStr: 'HIGH',
      blockageRiskPct: 68,
      rssi: -86,
      batteryPct: 95,
      wardTitle: 'Ward 175 (Adyar Zone 13)'
    },
    PERUNGUDI: {
      rainRate: 28.0,
      tips60m: 100,
      waterDepth: 86.0,
      rimDist: 45,
      flowVelocity: 79.0,
      flowSpeed: 2.10,
      tempC: 29.8,
      humidityPct: 80,
      blockageRiskStr: 'CRITICAL',
      blockageRiskPct: 86,
      rssi: -93,
      batteryPct: 91,
      wardTitle: 'Ward 184 (Perungudi Zone 14)'
    },
    MYLAPORE: {
      rainRate: 12.5,
      tips60m: 45,
      waterDepth: 52.0,
      rimDist: 96,
      flowVelocity: 44.5,
      flowSpeed: 1.20,
      tempC: 28.0,
      humidityPct: 70,
      blockageRiskStr: 'MODERATE',
      blockageRiskPct: 52,
      rssi: -83,
      batteryPct: 97,
      wardTitle: 'Ward 124 (Mylapore Zone 9)'
    }
  };

  const activeMetrics = wardTelemetryMap[selectedWardFilter] || wardTelemetryMap.ALL;

  // Dynamic 60-minute time-series telemetry based on selected Ward
  const telemetryHistory = [
    { time: '-60m', depth: Number((activeMetrics.waterDepth * 0.45).toFixed(1)), flow: Number((activeMetrics.flowVelocity * 0.42).toFixed(1)), temp: Number((activeMetrics.tempC - 1.1).toFixed(1)) },
    { time: '-50m', depth: Number((activeMetrics.waterDepth * 0.55).toFixed(1)), flow: Number((activeMetrics.flowVelocity * 0.55).toFixed(1)), temp: Number((activeMetrics.tempC - 0.9).toFixed(1)) },
    { time: '-40m', depth: Number((activeMetrics.waterDepth * 0.68).toFixed(1)), flow: Number((activeMetrics.flowVelocity * 0.70).toFixed(1)), temp: Number((activeMetrics.tempC - 0.7).toFixed(1)) },
    { time: '-30m', depth: Number((activeMetrics.waterDepth * 0.78).toFixed(1)), flow: Number((activeMetrics.flowVelocity * 0.80).toFixed(1)), temp: Number((activeMetrics.tempC - 0.5).toFixed(1)) },
    { time: '-20m', depth: Number((activeMetrics.waterDepth * 0.88).toFixed(1)), flow: Number((activeMetrics.flowVelocity * 0.89).toFixed(1)), temp: Number((activeMetrics.tempC - 0.3).toFixed(1)) },
    { time: '-10m', depth: Number((activeMetrics.waterDepth * 0.95).toFixed(1)), flow: Number((activeMetrics.flowVelocity * 0.95).toFixed(1)), temp: Number((activeMetrics.tempC - 0.1).toFixed(1)) },
    { time: 'NOW', depth: Number(activeMetrics.waterDepth.toFixed(1)), flow: Number(activeMetrics.flowVelocity.toFixed(1)), temp: Number(activeMetrics.tempC.toFixed(1)) },
  ];

  return (
    <div className="space-y-8 p-4 lg:p-6 max-w-7xl mx-auto font-['Inter']">
      {/* 1. TOP HEADER & TELEMETRY DASHBOARD BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-cyan-400 uppercase tracking-widest bg-cyan-950/80 border border-cyan-500/30 px-3 py-1 rounded-full">
                DRAIN-X IoT SENSING FLEET & HARDWARE ARCHITECTURE
              </span>
              <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-extrabold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                LoRaWAN 865 MHz ACTIVE
              </span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <h2 className="text-3xl font-black text-white font-['Outfit'] tracking-tight">
                Smart Urban Manhole Sensing Fleet
              </h2>
              {/* Top Header Ward Selector */}
              <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-2xl border border-cyan-500/50 text-xs">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <select
                  value={selectedWardFilter}
                  onChange={(e) => setSelectedWardFilter(e.target.value)}
                  className="bg-slate-900 border-none text-cyan-300 font-bold text-xs rounded-xl focus:ring-0 cursor-pointer"
                >
                  <option value="ALL">📍 ALL WARDS (14 Zones)</option>
                  <option value="VELACHERY">📍 Ward 179 — Velachery</option>
                  <option value="TNAGAR">📍 Ward 173 — T. Nagar</option>
                  <option value="TAMBARAM">📍 Ward 192 — Tambaram</option>
                  <option value="ADYAR">📍 Ward 175 — Adyar</option>
                  <option value="PERUNGUDI">📍 Ward 184 — Perungudi</option>
                  <option value="MYLAPORE">📍 Ward 124 — Mylapore</option>
                </select>
              </div>
            </div>

            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              Multi-sensor deployment across Chennai. Displaying telemetry for <b className="text-cyan-300">{activeMetrics.wardTitle}</b>. Integrates JSN-SR04T Ultrasonic transducers, YF-S201 Doppler flow meters, tipping-bucket rain gauges & LoRa gateways.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl text-right min-w-[130px] backdrop-blur-md">
              <div className="text-[10px] text-slate-400 font-extrabold uppercase">Monitored Manholes</div>
              <div className="text-2xl font-black text-cyan-400 font-['Outfit']">
                {filteredWardManholes.length} Nodes
              </div>
            </div>
            <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl text-right min-w-[130px] backdrop-blur-md">
              <div className="text-[10px] text-slate-400 font-extrabold uppercase">Sensors Online</div>
              <div className="text-2xl font-black text-emerald-400 font-['Outfit']">
                {filteredWardManholes.length} / {filteredWardManholes.length}
              </div>
            </div>
            <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl text-right min-w-[130px] backdrop-blur-md">
              <div className="text-[10px] text-slate-400 font-extrabold uppercase">Live Rainfall Rate</div>
              <div className="text-2xl font-black text-blue-400 font-['Outfit']">
                {activeMetrics.rainRate.toFixed(1)} <span className="text-xs font-normal">mm/h</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LIVE REAL-TIME SENSOR TELEMETRY READINGS METRICS RIBBON (AUTO-UPDATES ON WARD SELECTION) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* 1. Rain Gauge Live Reading */}
        <div className="bg-slate-900/90 border border-blue-500/40 p-4 rounded-2xl space-y-1 shadow-lg backdrop-blur-md hover:border-blue-400 transition">
          <div className="flex items-center justify-between text-[10px] font-bold text-blue-400 uppercase tracking-wider">
            <span>Rain Gauge</span>
            <CloudRain className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-white font-['Outfit']">
            {activeMetrics.rainRate.toFixed(1)} <span className="text-xs text-blue-300 font-normal">mm/h</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">60m Tips: <b className="text-blue-300">{activeMetrics.tips60m} tips</b></div>
        </div>

        {/* 2. Water Level Ultrasonic Ranging */}
        <div className="bg-slate-900/90 border border-cyan-500/40 p-4 rounded-2xl space-y-1 shadow-lg backdrop-blur-md hover:border-cyan-400 transition">
          <div className="flex items-center justify-between text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
            <span>Ultrasonic Water Level</span>
            <Waves className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-white font-['Outfit']">
            {activeMetrics.waterDepth.toFixed(1)} <span className="text-xs text-cyan-300 font-normal">cm</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">Ranging: <b className="text-cyan-300">{activeMetrics.rimDist} cm rim</b></div>
        </div>

        {/* 3. Flow Velocity Speed */}
        <div className="bg-slate-900/90 border border-blue-500/40 p-4 rounded-2xl space-y-1 shadow-lg backdrop-blur-md hover:border-blue-400 transition">
          <div className="flex items-center justify-between text-[10px] font-bold text-blue-400 uppercase tracking-wider">
            <span>Flow Velocity</span>
            <Gauge className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-white font-['Outfit']">
            {activeMetrics.flowVelocity.toFixed(1)} <span className="text-xs text-blue-300 font-normal">L/s</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">Speed: <b className="text-blue-300">{activeMetrics.flowSpeed.toFixed(2)} m/s</b></div>
        </div>

        {/* 4. Temperature & Thermal Signature */}
        <div className="bg-slate-900/90 border border-amber-500/40 p-4 rounded-2xl space-y-1 shadow-lg backdrop-blur-md hover:border-amber-400 transition">
          <div className="flex items-center justify-between text-[10px] font-bold text-amber-400 uppercase tracking-wider">
            <span>Thermal Signature</span>
            <Thermometer className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-white font-['Outfit']">
            {activeMetrics.tempC.toFixed(1)} <span className="text-xs text-amber-300 font-normal">°C</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">Humidity: <b className="text-amber-300">{activeMetrics.humidityPct}% RH</b></div>
        </div>

        {/* 5. Blockage & Overflow Risk */}
        <div className="bg-slate-900/90 border border-red-500/40 p-4 rounded-2xl space-y-1 shadow-lg backdrop-blur-md hover:border-red-400 transition">
          <div className="flex items-center justify-between text-[10px] font-bold text-red-400 uppercase tracking-wider">
            <span>Blockage Risk</span>
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-red-400 font-['Outfit']">
            {activeMetrics.blockageRiskStr} <span className="text-xs text-slate-400 font-normal">({activeMetrics.blockageRiskPct}%)</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">Conduit: <b className="text-amber-300">Monitored</b></div>
        </div>

        {/* 6. LoRaWAN Gateway RSSI */}
        <div className="bg-slate-900/90 border border-indigo-500/40 p-4 rounded-2xl space-y-1 shadow-lg backdrop-blur-md hover:border-indigo-400 transition">
          <div className="flex items-center justify-between text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
            <span>Radio Gateway</span>
            <Radio className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-white font-['Outfit']">
            {activeMetrics.rssi} <span className="text-xs text-indigo-300 font-normal">dBm</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">Battery: <b className="text-emerald-400">{activeMetrics.batteryPct}%</b></div>
        </div>
      </div>

      {/* 2. SECTION 05: HARDWARE COMPONENTS ARCHITECTURE SHOWCASE */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black text-cyan-400 uppercase tracking-widest bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                05. HARDWARE
              </span>
              <h3 className="text-2xl font-black text-white font-['Outfit']">
                Hardware Components Architecture
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Deliberately simple edge hardware — the intelligence lives in the simulation and AI nowcast layer.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              SIH Problem 26085 • Ministry of Earth Sciences
            </span>
          </div>
        </div>

        {/* 3 Sensor Cards Row (Matching Presentation Slide 1) */}
        <div>
          <div className="text-xs font-mono font-black text-cyan-400 uppercase tracking-wider mb-3">
            SENSORS FLEET
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {/* Sensor 1: Ultrasonic Water Level */}
            <div className="bg-slate-950/90 border border-cyan-500/40 p-5 rounded-2xl space-y-4 hover:border-cyan-400 transition shadow-xl relative group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-lg group-hover:scale-110 transition">
                  <Droplets className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950 px-2.5 py-1 rounded-lg border border-cyan-700/50">
                  JSN-SR04T
                </span>
              </div>
              <div>
                <h4 className="text-base font-bold text-white font-['Outfit']">Ultrasonic Water-Level Sensor</h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Measures rising water levels in drains and manholes via non-contact ultrasonic ranging (20 cm - 450 cm distance). IP68 waterproof transducer.
                </p>
              </div>
            </div>

            {/* Sensor 2: Flow Sensor */}
            <div className="bg-slate-950/90 border border-cyan-500/40 p-5 rounded-2xl space-y-4 hover:border-cyan-400 transition shadow-xl relative group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-950 border border-blue-500/50 flex items-center justify-center text-blue-400 shadow-lg group-hover:scale-110 transition">
                  <Waves className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-bold text-blue-300 bg-blue-950 px-2.5 py-1 rounded-lg border border-blue-700/50">
                  YF-S201 / Doppler
                </span>
              </div>
              <div>
                <h4 className="text-base font-bold text-white font-['Outfit']">Flow Velocity & Discharge Sensor</h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Measures the speed (m/s) and volumetric flow rate (L/s) of water flowing through the main stormwater conduit.
                </p>
              </div>
            </div>

            {/* Sensor 3: Temperature Sensor */}
            <div className="bg-slate-950/90 border border-cyan-500/40 p-5 rounded-2xl space-y-4 hover:border-cyan-400 transition shadow-xl relative group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-950 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-lg group-hover:scale-110 transition">
                  <Thermometer className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950 px-2.5 py-1 rounded-lg border border-amber-700/50">
                  DS18B20
                </span>
              </div>
              <div>
                <h4 className="text-base font-bold text-white font-['Outfit']">Temperature & Quality Sensor</h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Tracks ambient and water temperature (0°C - 85°C) to detect thermal signatures and environmental context.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2 Connectivity & Processing Cards Row (Matching Presentation Slide 1) */}
        <div>
          <div className="text-xs font-mono font-black text-cyan-400 uppercase tracking-wider mb-3">
            CONNECTIVITY & EDGE PROCESSING
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {/* Microcontroller: ESP32 */}
            <div className="bg-slate-950/90 border border-slate-800 p-5 rounded-2xl flex items-start gap-4 hover:border-cyan-500/50 transition">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-700 flex items-center justify-center text-cyan-400 shrink-0">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-white font-['Outfit']">ESP32 Edge Microcontroller</h4>
                  <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
                    Dual-Core 240MHz
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Edge microcontroller — reads sensor pins, computes pulse counts, formats JSON telemetry payloads, and drives the LoRa radio link.
                </p>
              </div>
            </div>

            {/* Radio Link: LoRaWAN */}
            <div className="bg-slate-950/90 border border-slate-800 p-5 rounded-2xl flex items-start gap-4 hover:border-indigo-500/50 transition">
              <div className="w-12 h-12 rounded-2xl bg-indigo-950 border border-indigo-700 flex items-center justify-center text-indigo-400 shrink-0">
                <Radio className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-white font-['Outfit']">LoRaWAN Wireless Radio Link</h4>
                  <span className="text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800">
                    865 MHz ISM Band
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Long-range, low-power radio link (865 MHz) carrying sensor readings up to 15 km back to the municipal central gateway.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECTION: RAIN GAUGE SENSOR — WORKING & CONNECTION BREAKDOWN (Matching Presentation Slide 2) */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-6">
        <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CloudRain className="w-6 h-6 text-blue-400" />
              <h3 className="text-2xl font-black text-white font-['Outfit']">
                Rain Gauge Sensor — Working & Connection Architecture
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Precision tipping-bucket digital pulse counter supplying leading-indicator rainfall intensity to DRAIN-X.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-blue-300 bg-blue-950 px-3 py-1.5 rounded-xl border border-blue-700">
            Resolution: 0.2 mm/tip
          </span>
        </div>

        {/* 3 Steps Pipeline Row */}
        <div className="grid md:grid-cols-3 gap-5">
          {/* Step 1: Tipping Bucket */}
          <div className="bg-slate-950 border border-blue-500/40 p-5 rounded-2xl space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center font-mono">
                1
              </span>
              <span className="text-xs font-bold text-blue-400">Rainfall Collector</span>
            </div>
            <h4 className="text-base font-bold text-white font-['Outfit']">Tipping Bucket Mechanism</h4>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
              <li>Funnel collects rainwater from storm cell</li>
              <li>Bucket tips at fixed volume (<b className="text-blue-300">0.2 mm</b>)</li>
              <li>Magnet reed switch triggers on each tip</li>
            </ul>
          </div>

          {/* Step 2: Digital Output */}
          <div className="bg-slate-950 border border-emerald-500/40 p-5 rounded-2xl space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center font-mono">
                2
              </span>
              <span className="text-xs font-bold text-emerald-400">GPIO Pulse Link</span>
            </div>
            <h4 className="text-base font-bold text-white font-['Outfit']">Digital Switch Output</h4>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
              <li>Each tip = one switch closure pulse</li>
              <li>No analog / I2C noise — simple digital signal</li>
              <li>Highly reliable & low-power operation</li>
            </ul>
          </div>

          {/* Step 3: ESP32 Processing */}
          <div className="bg-slate-950 border border-amber-500/40 p-5 rounded-2xl space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-full bg-amber-600 text-white font-black text-sm flex items-center justify-center font-mono">
                3
              </span>
              <span className="text-xs font-bold text-amber-400">Hub Node Counter</span>
            </div>
            <h4 className="text-base font-bold text-white font-['Outfit']">ESP32 (Hub Node) Processing</h4>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
              <li>Interrupt pin counts digital pulses</li>
              <li><code className="text-amber-300 font-mono">tipCount++</code> on each FALLING edge</li>
              <li>Aggregates rainfall rate every 60 seconds</li>
            </ul>
          </div>
        </div>

        {/* Calculation & Purpose Cards */}
        <div className="grid md:grid-cols-2 gap-5">
          {/* Formula Calculation Card */}
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Calculator className="w-4 h-4" />
              <span>Mathematical Calculation Formula</span>
            </div>
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
              <div className="text-cyan-300 font-bold">
                Rainfall (mm) = tipCount × bucket resolution <span className="text-slate-500">(0.2794 mm/tip)</span>
              </div>
              <div className="border-t border-slate-800 pt-2 text-emerald-400 font-bold">
                Rainfall rate (mm/hr) = accumulated tips in last 60 minutes
              </div>
            </div>
          </div>

          {/* Purpose in DRAIN-X Card */}
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
              <Shield className="w-4 h-4" />
              <span>Purpose in DRAIN-X System</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Provides leading-indicator rainfall intensity data — one rain gauge per Hub Node, combined with manhole ultrasonic level readings before transmission via LoRaWAN/GSM to the ML Nowcasting model.
            </p>
          </div>
        </div>

        {/* Key Benefits Ribbon */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="font-extrabold text-white font-['Outfit'] uppercase">Key Benefits:</div>
          <div className="flex items-center gap-6 flex-wrap font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" /> High Accuracy (0.2mm resolution)
            </span>
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Activity className="w-4 h-4" /> Real-time Intensity Monitoring
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <AlertTriangle className="w-4 h-4" /> Early Flood Warning
            </span>
            <span className="flex items-center gap-1.5 text-indigo-400">
              <Wifi className="w-4 h-4" /> Easy ESP32 Integration
            </span>
          </div>
        </div>
      </div>

      {/* 4. PHYSICAL CUTAWAY DIAGRAM & SENSOR CALLOUT REGISTRY */}
      <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xl font-black text-white font-['Outfit']">
                Urban Stormwater Manhole Physical Engineering Cutaway
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Cross-sectional schematic showing sensor mounting positions, pipe invert elevations, and LoRaWAN edge controller installation.
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

        {/* Diagram & Component Callouts Grid */}
        <div className="grid lg:grid-cols-12 gap-6 items-center">
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

          {/* Callout Details */}
          <div className="lg:col-span-5 space-y-3 max-h-[380px] overflow-y-auto pr-1">
            <div className="p-3 bg-slate-950/80 border border-cyan-500/40 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
                <span className="flex items-center gap-1.5">
                  <Waves className="w-4 h-4 text-cyan-400" /> 1. WATER-LEVEL SENSOR
                </span>
                <span className="font-mono text-cyan-200 bg-cyan-950 px-2 py-0.5 rounded">{activeMetrics.waterDepth.toFixed(0)} cm</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Non-contact ultrasonic beam mounted at top rim, converting distance to water surface into real-time depth.
              </p>
            </div>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-blue-300">
                <span className="flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-blue-400" /> 2. FLOW VELOCITY SENSOR
                </span>
                <span className="font-mono text-blue-200 bg-blue-950 px-2 py-0.5 rounded">{activeMetrics.flowVelocity.toFixed(0)} L/s</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Submerged Doppler acoustic velocity sensor measuring water discharge rate inside the conduit.
              </p>
            </div>

            <div className="p-3 bg-slate-950/80 border border-amber-500/40 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" /> 3. BLOCKAGE ALGORITHM
                </span>
                <span className="font-mono text-amber-200 bg-amber-950 px-2 py-0.5 rounded">{activeMetrics.blockageRiskStr} ({activeMetrics.blockageRiskPct}%)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Condition estimation algorithm combining rising level + restricted flow rate to detect debris/sediment obstruction.
              </p>
            </div>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> 4. OVERFLOW SENSOR
                </span>
                <span className="font-mono text-emerald-200 bg-emerald-950 px-2 py-0.5 rounded">ARMED</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Event-triggered threshold sensor at critical rim height triggering instant priority alarm on surcharge.
              </p>
            </div>

            <div className="p-3 bg-slate-950/80 border border-cyan-500/40 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
                <span className="flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-cyan-400" /> 5. IP68 IoT EDGE CONTROLLER
                </span>
                <span className="font-mono text-cyan-200 bg-cyan-950 px-2 py-0.5 rounded">NODE M26</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Waterproof wall-mounted microcontroller aggregating sensor signals, stamping UTC time & packaging telemetry payloads.
              </p>
            </div>
          </div>
        </div>

        {/* Physical Communication Pipeline Flow */}
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

      {/* 5. MULTI-MANHOLE WARD SENSOR NETWORK REGISTER (Dynamic Area Selection Filter) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-white font-['Outfit']">
                Ward-by-Ward Multi-Manhole Sensor Network Register
              </h3>
              <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-800">
                DYNAMIC AREA FILTER ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Showing monitored manholes and hydraulic parameters for: <b className="text-cyan-300">{activeMetrics.wardTitle}</b> ({filteredWardManholes.length} Active Nodes)
            </p>
          </div>

          {/* DYNAMIC AREA / WARD SELECTOR DROPDOWN & PILLS */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
              <MapPin className="w-4 h-4 text-cyan-400 ml-1" />
              <select
                value={selectedWardFilter}
                onChange={(e) => setSelectedWardFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white font-bold text-xs rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-cyan-500"
              >
                <option value="ALL">📍 ALL METROPOLITAN WARDS (14 Zones)</option>
                <option value="VELACHERY">📍 Ward 179 — Velachery (Zone 13)</option>
                <option value="TNAGAR">📍 Ward 173 — T. Nagar (Zone 10)</option>
                <option value="TAMBARAM">📍 Ward 192 — Tambaram (Zone 15)</option>
                <option value="ADYAR">📍 Ward 175 — Adyar (Zone 13)</option>
                <option value="PERUNGUDI">📍 Ward 184 — Perungudi (Zone 14)</option>
                <option value="MYLAPORE">📍 Ward 124 — Mylapore (Zone 9)</option>
              </select>
            </div>
          </div>
        </div>

        {/* QUICK WARD SELECTION PILLS */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { label: 'All Wards', key: 'ALL' },
            { label: 'Ward 179 (Velachery)', key: 'VELACHERY' },
            { label: 'Ward 173 (T. Nagar)', key: 'TNAGAR' },
            { label: 'Ward 192 (Tambaram)', key: 'TAMBARAM' },
            { label: 'Ward 175 (Adyar)', key: 'ADYAR' },
            { label: 'Ward 184 (Perungudi)', key: 'PERUNGUDI' },
            { label: 'Ward 124 (Mylapore)', key: 'MYLAPORE' },
          ].map((w) => (
            <button
              key={w.key}
              onClick={() => setSelectedWardFilter(w.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                selectedWardFilter === w.key
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>{w.label}</span>
              {selectedWardFilter === w.key && <CheckCircle2 className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>

        {/* MANHOLE TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 font-mono text-[11px]">
              <tr>
                <th className="p-3">Manhole Node Code</th>
                <th className="p-3">Ward / Location</th>
                <th className="p-3">Conduit Pipe Diameter</th>
                <th className="p-3">Invert / Ground MSL</th>
                <th className="p-3">Ultrasonic Ranging</th>
                <th className="p-3">Water Level & Surcharge</th>
                <th className="p-3">Discharge Flow</th>
                <th className="p-3">Status</th>
                <th className="p-3">Radio Ping</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {filteredWardManholes.map((mh) => (
                <tr key={mh.id} className="hover:bg-slate-800/50 transition">
                  <td className="p-3">
                    <div className="font-bold text-white text-sm font-['Outfit']">{mh.id}</div>
                    <div className="text-[10px] text-cyan-400">{mh.sensorCode}</div>
                  </td>
                  <td className="p-3 font-mono text-slate-300">
                    <div className="font-semibold text-slate-200">{mh.name}</div>
                    <div className="text-[10px] text-slate-400">{mh.ward}</div>
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                      {mh.pipeDiameterMm} mm ({mh.pipeDiameterInch})
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">
                    Ground: <b>{mh.groundElevM}m</b> <br />
                    Invert: <b>{mh.invertElevM}m</b>
                  </td>
                  <td className="p-3 text-slate-300 font-bold">
                    {mh.rangingDistCm} cm <span className="text-[10px] text-slate-500 font-normal">(rim to water)</span>
                  </td>
                  <td className="p-3">
                    <div className="font-black text-white text-sm">
                      {mh.waterDepthCm} cm <span className="text-xs text-amber-400">({mh.surchargePct}% Full)</span>
                    </div>
                    <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                      <div 
                        className={`h-full ${mh.status === 'CRITICAL' ? 'bg-red-500' : mh.status === 'SURCHARGE' || mh.status === 'HIGH' ? 'bg-amber-400' : 'bg-cyan-400'}`}
                        style={{ width: `${mh.surchargePct}%` }}
                      />
                    </div>
                  </td>
                  <td className="p-3 font-bold text-blue-300 text-sm">
                    {mh.flowRateLs} L/s
                  </td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider ${
                      mh.status === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                      mh.status === 'SURCHARGE' || mh.status === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {mh.status}
                    </span>
                  </td>
                  <td className="p-3 text-[11px]">
                    <div className="text-emerald-400 font-bold">Bat: {mh.batteryPct}%</div>
                    <div className="text-slate-400">{mh.rssi} dBm</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. TELEMETRY STREAM & DIAGNOSTICS DEEP DIVE */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Selected Sensor Info */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 uppercase">Selected Node Diagnostics</span>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              ONLINE
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-white font-['Outfit']">{activeMetrics.wardTitle}</h3>
            <p className="text-xs font-mono text-cyan-300 mt-0.5">ZONE-SENSING-NODE-01</p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
            <div className="text-xs text-slate-400 font-bold uppercase">Current Measured Telemetry</div>
            <div className="text-3xl font-black text-white font-['Outfit'] mt-1">
              {activeMetrics.waterDepth.toFixed(1)} <span className="text-base font-normal text-cyan-400">cm</span>
            </div>
            <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-2 font-mono">
              <span>Warning: <b>50.0 cm</b></span>
              <span className="text-red-400">Critical: <b>80.0 cm</b></span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2">
              <Battery className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[10px] text-slate-400">Battery Power</div>
                <div className="font-bold text-white">{activeMetrics.batteryPct}%</div>
              </div>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2">
              <Signal className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-[10px] text-slate-400">LoRa RSSI</div>
                <div className="font-bold text-white">{activeMetrics.rssi} dBm</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: 60-Minute Telemetry Stream Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white font-['Outfit']">
                60-Minute Real-Time Telemetry Stream — {activeMetrics.wardTitle}
              </h3>
            </div>

            {/* Metric Switcher */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTelemetryMetric('depth')}
                className={`px-3 py-1 rounded-lg font-bold transition ${activeTelemetryMetric === 'depth' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Water Depth (cm)
              </button>
              <button
                onClick={() => setActiveTelemetryMetric('flow')}
                className={`px-3 py-1 rounded-lg font-bold transition ${activeTelemetryMetric === 'flow' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Flow Speed (L/s)
              </button>
              <button
                onClick={() => setActiveTelemetryMetric('temp')}
                className={`px-3 py-1 rounded-lg font-bold transition ${activeTelemetryMetric === 'temp' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Temperature (°C)
              </button>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', fontSize: '11px' }} />
                <Line 
                  type="monotone" 
                  dataKey={activeTelemetryMetric} 
                  stroke={activeTelemetryMetric === 'depth' ? '#22d3ee' : activeTelemetryMetric === 'flow' ? '#3b82f6' : '#f59e0b'} 
                  strokeWidth={3} 
                  dot={{ r: 5 }} 
                  name={activeTelemetryMetric === 'depth' ? 'Water Depth (cm)' : activeTelemetryMetric === 'flow' ? 'Flow Rate (L/s)' : 'Temperature (°C)'} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-2 font-mono">
            <span>📡 Telemetry Source: <b>{activeMetrics.wardTitle}</b></span>
            <span className="text-cyan-300 font-bold">Continuous Ingestion Active</span>
          </div>
        </div>
      </div>

      {/* High-Res Cutaway Modal */}
      {showDiagramModal && (
        <div 
          className="fixed inset-0 z-[999] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setShowDiagramModal(false)}
        >
          <div className="relative max-w-6xl w-full bg-slate-900 border border-cyan-500/50 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xl font-black text-white font-['Outfit']">
                  DRAIN-X Smart Manhole Hardware & Sensing Engineering Cutaway
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Physical Sensor Placement • Data Flow • IP68 Edge Enclosure • LoRaWAN Gateway Architecture
                </p>
              </div>
              <button 
                onClick={() => setShowDiagramModal(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl"
              >
                Close (ESC)
              </button>
            </div>

            <div className="overflow-auto max-h-[80vh] flex items-center justify-center">
              <img 
                src="/smart_manhole_diagram.jpg" 
                alt="High-Res Smart Manhole Engineering Cutaway Diagram" 
                className="w-full h-auto rounded-2xl object-contain max-h-[75vh]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
