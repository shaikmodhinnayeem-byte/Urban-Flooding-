import React from 'react';
import { 
  CloudRain, Shield, Activity, Compass, Cpu, BrainCircuit, 
  ArrowRight, ExternalLink, Database, CheckCircle2, AlertTriangle, Navigation, MapPin
} from 'lucide-react';
import { Area } from '../types';

interface LandingPageProps {
  onEnterDashboard: () => void;
  onOpenAuth: () => void;
  areas: Area[];
  rainfallIntensity: number;
  activeAlertCount: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterDashboard,
  onOpenAuth,
  areas,
  rainfallIntensity,
  activeAlertCount,
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('ALL');

  const sih35Datasets = [
    // 1-7 Meteorology
    { id: 1, name: "Chennai Doppler Weather Radar (DWR)", agency: "IMD", link: "https://mausam.imd.gov.in/responsive/radar.php?id=Chennai", category: "METEOROLOGY", desc: "Live S-Band Doppler radar reflectivity (dBZ) and radial velocity." },
    { id: 2, name: "IMD Weather API Specification", agency: "IMD", link: "https://api.imd.gov.in/public/api_reference.html", category: "METEOROLOGY", desc: "Public meteorological endpoint for automated nowcast ingestion." },
    { id: 3, name: "IMD Current Weather Data", agency: "IMD", link: "https://api.imd.gov.in/api/v1/current_wx", category: "METEOROLOGY", desc: "Real-time atmospheric pressure, temperature, wind, and humidity." },
    { id: 4, name: "IMD District Rainfall Data", agency: "IMD", link: "https://api.imd.gov.in/api/v1/districtrainfall", category: "METEOROLOGY", desc: "District-level cumulative precipitation statistics." },
    { id: 5, name: "IMD AWS / ARG Data", agency: "IMD", link: "https://api.imd.gov.in/api/v1/aws_data", category: "METEOROLOGY", desc: "Automated Weather Stations and Rain Gauge telemetry feeds." },
    { id: 6, name: "IMD Rainfall Forecast", agency: "IMD", link: "https://api.imd.gov.in/api/v1/state_district_rainfall_forecast", category: "METEOROLOGY", desc: "0-3 hour temporal precipitation forecast hyetographs." },
    { id: 7, name: "IMD District Warning", agency: "IMD", link: "https://api.imd.gov.in/api/v1/districtwarning", category: "METEOROLOGY", desc: "Official Common Alerting Protocol (CAP) cyclone and storm alerts." },

    // 8-11 TNGIS / CUMTA
    { id: 8, name: "Chennai GIS / TNGIS Spatial Data", agency: "TNGIS", link: "https://tngis.tn.gov.in/apps/cumta/", category: "GIS_TERRAIN", desc: "Metropolitan spatial layers, ward boundaries, and zoning maps." },
    { id: 9, name: "Chennai Drainage Network", agency: "TNGIS", link: "https://tngis.tn.gov.in/apps/cumta/", category: "DRAINAGE_GRAPH", desc: "Primary canals and secondary stormwater conduit directed graph." },
    { id: 10, name: "Chennai Water Bodies", agency: "TNGIS", link: "https://tngis.tn.gov.in/apps/cumta/", category: "GIS_TERRAIN", desc: "Velachery Lake, Pallikaranai Marshland, Buckingham Canal boundaries." },
    { id: 11, name: "Chennai Land Use / Land Cover (LULC)", agency: "TNGIS", link: "https://tngis.tn.gov.in/apps/cumta/", category: "GIS_TERRAIN", desc: "Built-up concrete imperviousness and vegetation spatial coverage." },

    // 12-13 Road Networks
    { id: 12, name: "Chennai Roads Geometry", agency: "OSM", link: "https://www.openstreetmap.org/", category: "ROADS_ROUTING", desc: "OpenStreetMap road vectors and arterial network topology." },
    { id: 13, name: "India Road GIS Data", agency: "Geofabrik", link: "https://download.geofabrik.de/asia/india.html", category: "ROADS_ROUTING", desc: "Comprehensive highway and collector road shapefiles." },

    // 14-15 DEM & Bhuvan
    { id: 14, name: "Chennai Digital Elevation Model (DEM)", agency: "Survey of India", link: "https://surveyofindia.gov.in/pages/availability-of-ori-and-dem", category: "GIS_TERRAIN", desc: "High-resolution CartoDEM 2.5m micro-topographic grid." },
    { id: 15, name: "Bhuvan GIS Data Portal", agency: "ISRO NRSC", link: "https://bhuvan-app1.nrsc.gov.in/bhuvan2d/bhuvan/bhuvan2d.php", category: "GIS_TERRAIN", desc: "2D/3D national geospatial raster and vector services." },

    // 16-19 Flood History & IMD GIS
    { id: 16, name: "Historical Flood / Inundation Data", agency: "ISRO NRSC", link: "https://bhuvan-app1.nrsc.gov.in/fews/index.php", category: "FLOOD_HISTORY", desc: "Bhuvan FEWS satellite-derived flood inundation extents." },
    { id: 17, name: "Chennai Flood Monitoring Records", agency: "ISRO NRSC", link: "https://bhuvan-app1.nrsc.gov.in/fews/index.php", category: "FLOOD_HISTORY", desc: "Historical deluge inundation depths from 2015 to 2023." },
    { id: 18, name: "IMD Chennai Weather Map", agency: "IMD DSS", link: "https://dss.imd.gov.in/dwr_img/GIS/chennai_obsums.html", category: "METEOROLOGY", desc: "Decision Support System Doppler observation summaries." },
    { id: 19, name: "IMD Rainfall GIS Portal", agency: "IMD Geospatial", link: "https://imdgeospatial.imd.gov.in/Rainfall/", category: "METEOROLOGY", desc: "Gridded rainfall maps and isohyetal contours." },

    // 20-23 Municipal Hydraulics
    { id: 20, name: "GCC Ward Manhole Locations", agency: "Municipal GCC", link: "https://tngis.tn.gov.in/apps/cumta/", category: "DRAINAGE_GRAPH", desc: "Geotagged manholes, chamber depths, and invert levels." },
    { id: 21, name: "Drain Conduit Dimensions", agency: "Municipal GCC", link: "https://tngis.tn.gov.in/apps/cumta/", category: "DRAINAGE_GRAPH", desc: "Pipe diameters, box drain widths, and roughness factors." },
    { id: 22, name: "Drain Elevation & Longitudinal Slope", agency: "Municipal GCC", link: "https://tngis.tn.gov.in/apps/cumta/", category: "DRAINAGE_GRAPH", desc: "Bed slope gradients and outfall sill elevations." },
    { id: 23, name: "Drain Hydraulic Capacity", agency: "DRAIN-X Physics", link: "https://tngis.tn.gov.in/apps/cumta/", category: "DRAINAGE_GRAPH", desc: "Manning's full-flow and surcharged capacity calculations." },

    // 24-27 DRAIN-X Edge IoT (Simulated Telemetry)
    { id: 24, name: "Manhole Water-Level Data", agency: "DRAIN-X IoT", link: "https://drainx.chennaicorp.gov.in/", category: "IOT_TELEMETRY", desc: "Live ultrasonic radar depth transducer telemetry." },
    { id: 25, name: "Manhole Overflow Status", agency: "DRAIN-X IoT", link: "https://drainx.chennaicorp.gov.in/", category: "IOT_TELEMETRY", desc: "Real-time edge alert for surcharge spilling onto street surface." },
    { id: 26, name: "Manhole Blockage Status", agency: "DRAIN-X IoT", link: "https://drainx.chennaicorp.gov.in/", category: "IOT_TELEMETRY", desc: "Acoustic debris and silt accumulation percentage." },
    { id: 27, name: "Real-Time Sensor Locations", agency: "DRAIN-X IoT", link: "https://drainx.chennaicorp.gov.in/", category: "IOT_TELEMETRY", desc: "Geospatial coordinate registry of active edge telemetry nodes." },

    // 28-29 Historical Locations
    { id: 28, name: "Historical Flood Locations", agency: "ISRO FEWS", link: "https://bhuvan-app1.nrsc.gov.in/fews/index.php", category: "FLOOD_HISTORY", desc: "Geocoded historical inundation sink locations across Chennai." },
    { id: 29, name: "Flood Hazard / Inundation Zonation", agency: "ISRO FEWS", link: "https://bhuvan-app1.nrsc.gov.in/fews/index.php", category: "FLOOD_HISTORY", desc: "Return-period flood hazard classification maps." },

    // 30-33 Administrative & Infrastructure
    { id: 30, name: "Chennai Ward Boundaries", agency: "TNGIS / GCC", link: "https://tngis.tn.gov.in/apps/cumta/", category: "GIS_TERRAIN", desc: "Official administrative polygons for Zones 1 to 15 and 200 Wards." },
    { id: 31, name: "Critical Infrastructure Register", agency: "TNGIS", link: "https://tngis.tn.gov.in/apps/cumta/", category: "EMERGENCY_RESCUE", desc: "110kV substations, telecom switches, and water supply grids." },
    { id: 32, name: "Hospitals & Emergency Facilities", agency: "OSM / Health", link: "https://www.openstreetmap.org/", category: "EMERGENCY_RESCUE", desc: "Trauma centers, fire rescue stations, and relief shelters." },
    { id: 33, name: "Emergency Roads & Evacuation Routes", agency: "OSM / Traffic", link: "https://www.openstreetmap.org/", category: "ROADS_ROUTING", desc: "Elevated corridors and designated disaster response expressways." },

    // 34-35 Hydrography & Elevation Flow
    { id: 34, name: "Rivers, Tanks & Reservoirs", agency: "TNGIS / WRD", link: "https://tngis.tn.gov.in/apps/cumta/", category: "GIS_TERRAIN", desc: "Adyar, Cooum, Chembarambakkam, Red Hills, and Poondi reservoirs." },
    { id: 35, name: "Terrain Elevation & Flow Analysis", agency: "Survey of India", link: "https://surveyofindia.gov.in/pages/availability-of-ori-and-dem", category: "GIS_TERRAIN", desc: "D8 flow direction and accumulation grid for surface runoff routing." }
  ];

  const filtered35 = selectedCategory === 'ALL'
    ? sih35Datasets
    : sih35Datasets.filter(d => d.category === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans']">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-gradient-to-b from-slate-900/60 via-slate-950 to-slate-950">
        {/* Glowing background ambient lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/4 -translate-y-1/2 w-[400px] h-[250px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-6xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold shadow-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span>SMART DISASTER MANAGEMENT PROTOTYPE • CHENNAI METROPOLITAN AREA</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight font-['Outfit'] leading-[1.15]">
            Predict Street Floods <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
              Before They Happen.
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-slate-300 text-base sm:text-lg leading-relaxed">
            High-resolution <b>0–3 Hour Urban Flood Nowcasting System</b> coupling Doppler Weather Radar nowcasts, 
            micro-topographic Digital Elevation Models (DEM), and graph-based stormwater hydraulic surcharge networks 
            to protect Chennai's streets, transit, and lives.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={onEnterDashboard}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 transition active:scale-95"
            >
              <span>Launch Live Nowcasting Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Admin / Responder Login</span>
            </button>
          </div>

          {/* Quick Real-Time Status Ticker */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
            <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl">
              <div className="text-[11px] text-slate-400">Current Rainfall Intensity</div>
              <div className="text-xl font-bold text-cyan-400 mt-0.5">{rainfallIntensity.toFixed(1)} mm/hr</div>
              <div className="text-[10px] text-slate-400">IMD DWR Chennai Port</div>
            </div>
            <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl">
              <div className="text-[11px] text-slate-400">Forecast Horizon</div>
              <div className="text-xl font-bold text-white mt-0.5">0 – 3 Hours</div>
              <div className="text-[10px] text-emerald-400">30-min Step Granularity</div>
            </div>
            <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl">
              <div className="text-[11px] text-slate-400">Drainage Resolution</div>
              <div className="text-xl font-bold text-indigo-400 mt-0.5">Street & Node</div>
              <div className="text-[10px] text-slate-400">Manning's Conduits Graph</div>
            </div>
            <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl">
              <div className="text-[11px] text-slate-400">Active Flood Alerts</div>
              <div className={`text-xl font-bold mt-0.5 ${activeAlertCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {activeAlertCount} Active
              </div>
              <div className="text-[10px] text-slate-400">TNSDMA Emergency Triage</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Traditional Weather Models Fall Short */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
            The Hyper-Local Flooding Problem
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Knowing <i>how much rain will fall</i> does not tell municipal bodies <i>where the streets will flood</i>.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4 font-bold">
              1
            </div>
            <h3 className="font-bold text-base text-white">Micro-Topography & Sinks</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Chennai's coastal lowlands (e.g. Velachery at 2.4m elevation) create bowl depressions where water accumulates within minutes of heavy downpours.
            </p>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 font-bold">
              2
            </div>
            <h3 className="font-bold text-base text-white">Drain Surcharge & Backflow</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Underground storm pipes face silt blockages and high-tide backwater pressure from Buckingham Canal, causing water to spew back out onto streets.
            </p>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 font-bold">
              3
            </div>
            <h3 className="font-bold text-base text-white">Coupled AI Prediction</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              DRAIN-X fuses Doppler radar nowcasts, 2D terrain slope, and directed drainage hydraulic graphs to predict water depth in centimeters per street.
            </p>
          </div>
        </div>
      </section>

      {/* Core Engineering Pipeline: Monitor -> Predict -> Visualize -> Warn -> Respond */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/40 border-y border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-bold text-cyan-400 tracking-wider uppercase mb-1">Architecture Pipeline</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
              Monitor → Predict → Visualize → Warn → Respond
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 mb-2">
                <CloudRain className="w-4 h-4" />
                <span>1. INGESTION</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Live IMD Doppler Radar reflectivity, AWS rain gauges, and high-resolution Survey of India CartoDEM.
              </p>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5 mb-2">
                <Cpu className="w-4 h-4" />
                <span>2. HYDRAULICS</span>
              </div>
              <p className="text-[11px] text-slate-400">
                NetworkX directed pipe graph calculating Manning capacity, debris blockage, and junction backflow.
              </p>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-xs font-bold text-indigo-400 flex items-center gap-1.5 mb-2">
                <BrainCircuit className="w-4 h-4" />
                <span>3. AI NOWCAST</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Deep Learning spatio-temporal model generating 0-3 hour street water depth (cm) and risk probabilities.
              </p>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-2">
                <Navigation className="w-4 h-4" />
                <span>4. SAFE ROUTING</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Dynamic Dijkstra routing penalizing flooded arteries to guide emergency responders and commuters.
              </p>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-xs font-bold text-red-400 flex items-center gap-1.5 mb-2">
                <Shield className="w-4 h-4" />
                <span>5. DISPATCH</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Automated triage and NDRF / GCC boat squad dispatch to critical waterlogged sectors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SIH Datasets Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <div className="text-xs font-bold text-cyan-400 tracking-wider uppercase mb-1">Official Data Pipeline</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
              Complete SIH Requirement Datasets (35 Registers)
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              Fully coupled with Indian Meteorological Department, TNGIS CUMTA, ISRO Bhuvan FEWS, Survey of India, and DRAIN-X Edge IoT Telemetry.
            </p>
          </div>
          <button
            onClick={onEnterDashboard}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 self-start md:self-auto"
          >
            <span>Explore live map integration</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap mb-6 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          {[
            { id: 'ALL', label: 'All 35 Datasets' },
            { id: 'METEOROLOGY', label: '🛰️ Meteorology & Radar (1-7, 18-19)' },
            { id: 'GIS_TERRAIN', label: '🏔️ GIS, DEM & Water Bodies (8, 10-11, 14-15, 30, 34-35)' },
            { id: 'DRAINAGE_GRAPH', label: '🚰 Drainage & Hydraulics (9, 20-23)' },
            { id: 'ROADS_ROUTING', label: '🛣️ Roads & Routing (12-13, 33)' },
            { id: 'IOT_TELEMETRY', label: '📡 Edge IoT Telemetry (24-27)' },
            { id: 'FLOOD_HISTORY', label: '🌊 Historical Inundation (16-17, 28-29)' },
            { id: 'EMERGENCY_RESCUE', label: '🏥 Critical Facilities (31-32)' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCategory === cat.id
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 35 Datasets Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtered35.map((ds) => (
            <a
              key={ds.id}
              href={ds.link.startsWith('http') ? ds.link : undefined}
              target={ds.link.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="p-4 bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl transition flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-cyan-400 font-bold mb-1">
                  <span>{ds.id}. {ds.agency}</span>
                  {ds.link.startsWith('http') ? (
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  ) : (
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded">INTERNAL API</span>
                  )}
                </div>
                <div className="text-sm font-semibold text-white group-hover:text-cyan-200 transition">
                  {ds.name}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {ds.desc}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[10px]">
                <span className="text-slate-400 font-mono">{ds.category}</span>
                <span className="text-emerald-400 font-semibold">✓ Integrated</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-400 text-center">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white font-['Outfit']">DRAIN-X CHENNAI</span>
            <span>•</span>
            <span>Smart City Disaster Management Prototype</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Greater Chennai Corporation</span>
            <span>TNSDMA</span>
            <span>IMD Radar</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
