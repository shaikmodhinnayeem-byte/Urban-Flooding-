// ==============================================================================
// DRAIN-X REACT MAIN DASHBOARD CONTAINER (FRONTEND APPLICATION ROOT)
// ==============================================================================
// PURPOSE: Root React component orchestrating global application state:
//   - JWT authentication state (currentUser)
//   - Selected Ward & Area spatial switching (selectedAreaId / currentArea)
//   - Dynamic data fetching (roads, sensors, drain nodes, alerts, rescue squads)
//   - Hydrodynamic cloudburst scenario trigger simulations
//   - Sidebar view routing (Dashboard, GIS Flood Map, ML Prediction, IoT Fleet, Rescue)
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavView } from './components/Sidebar';
import { SimulationBar } from './components/SimulationBar';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { DashboardView } from './components/DashboardView';
import { GisFloodMap } from './components/GisFloodMap';
import { AreaAnalysisView } from './components/AreaAnalysisView';
import { RainfallRadarView } from './components/RainfallRadarView';
import { DrainageNetworkView } from './components/DrainageNetworkView';
import { SensorsView } from './components/SensorsView';
import { PredictionView } from './components/PredictionView';
import { SafeRouteView } from './components/SafeRouteView';
import { AlertsView } from './components/AlertsView';
import { RescueView } from './components/RescueView';
import { AdminPortalView } from './components/AdminPortalView';
import { ReportsView } from './components/ReportsView';
import { apiClient } from './services/api';
import { User, Area, Road, DrainNode, DrainSegment, Sensor, Alert, RescueTeam, RescueTask } from './types';

export function App() {
  // ----------------------------------------------------------------------------
  // APPLICATION REACT STATE REGISTRATION
  // ----------------------------------------------------------------------------
  // Why this code is used: Maintains application state across components.
  const [currentUser, setCurrentUser] = useState<User | null>(null);             // Logged-in user session & RBAC role
  const [currentView, setCurrentView] = useState<NavView>('dashboard');           // Active navigation tab identifier
  const [showAuthModal, setShowAuthModal] = useState(false);                      // Controls Login/Register Modal visibility
  const [selectedAreaId, setSelectedAreaId] = useState<number>(1);                // Primary active Ward ID (Default: 1 = Velachery)
  const [areas, setAreas] = useState<Area[]>([]);                                 // List of Chennai Metropolitan Wards
  const [gisData, setGisData] = useState<any>(null);                               // GeoJSON GIS spatial layers (roads, conduits)
  const [rainfallIntensity, setRainfallIntensity] = useState<number>(24.5);      // Live IMD rainfall rate (mm/hr)
  const [radarDbz, setRadarDbz] = useState<number>(38.5);                        // Doppler radar reflectivity (dBZ)
  const [roads, setRoads] = useState<Road[]>([]);                                 // Road arterial corridors & inundation depth
  const [sensors, setSensors] = useState<Sensor[]>([]);                           // Ultrasonic IoT manhole sensors
  const [drainNodes, setDrainNodes] = useState<DrainNode[]>([]);                  // Subsurface storm drainage junction nodes
  const [drainSegments, setDrainSegments] = useState<DrainSegment[]>([]);          // Stormwater conduit pipe segments
  const [alerts, setAlerts] = useState<Alert[]>([]);                              // Disaster warnings & emergency alarms
  const [rescueTeams, setRescueTeams] = useState<RescueTeam[]>([]);               // NDRF / SDRF / GCC Rescue squads
  const [rescueTasks, setRescueTasks] = useState<RescueTask[]>([]);               // Active evacuation rescue assignments
  const [isSimulating, setIsSimulating] = useState(false);                        // Indicates cloudburst scenario simulation in progress
  const [currentScenario, setCurrentScenario] = useState('NORMAL');              // Active scenario mode (e.g. CLOUDBURST_100MM)
  const [selectedRoadName, setSelectedRoadName] = useState<string | null>(null);  // Clicked road name for detail inspection
  const [inLandingMode, setInLandingMode] = useState(true);                       // Toggles public landing page vs operation portal

  // ----------------------------------------------------------------------------
  // INITIAL DATA LOADER & PROFILE CHECK
  // ----------------------------------------------------------------------------
  // Why this code is used: Fetches authenticated user session, Ward lists,
  // sensors, alerts, and rescue squads upon application launch.
  const loadInitialData = async () => {
    try {
      // 1. Check local cached user first so offline / non-database sessions are preserved
      const cached = localStorage.getItem('drainx_user');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.email) {
            setCurrentUser(parsed);
            setInLandingMode(false);
          }
        } catch {}
      }

      // Verify existing bearer token and retrieve user profile (/api/auth/me) if available
      if (apiClient.getToken()) {
        const user = await apiClient.get('/auth/me').catch(() => null);
        if (user) {
          const normalized = {
            ...user,
            role: (user.role || 'USER').toUpperCase() as any,
            full_name: user.full_name || user.name || 'Disaster Control Official',
          };
          setCurrentUser(normalized);
          localStorage.setItem('drainx_user', JSON.stringify(normalized));
          setInLandingMode(false);
        }
      }

      // 2. Fetch Chennai Wards List (/api/areas)
      const areaList = await apiClient.get('/areas');
      setAreas(areaList);

      // 3. Fetch Spatial Layers for default selected Ward
      await loadAreaLayers(selectedAreaId);

      // 4. Fetch Active Disaster Alerts, Rescue Squads, and Evacuation Tasks
      const [al, rt, rtasks] = await Promise.all([
        apiClient.get('/alerts'),
        apiClient.get('/rescue/teams'),
        apiClient.get('/rescue/tasks'),
      ]);
      setAlerts(al);
      setRescueTeams(rt);
      setRescueTasks(rtasks);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  // ----------------------------------------------------------------------------
  // SPATIAL WARD LAYER LOADER
  // ----------------------------------------------------------------------------
  // Why this code is used: Dynamically loads GIS GeoJSON layers, sensor readings,
  // and road geometries whenever the user switches Wards in the top header selector.
  const loadAreaLayers = async (areaId: number) => {
    try {
      const [layers, rainList, snList, dNodes, dSegs] = await Promise.all([
        apiClient.get(`/gis/layers/${areaId}`),
        apiClient.get('/rainfall/current'),
        apiClient.get(`/sensors?area_id=${areaId}`),
        apiClient.get(`/drainage/nodes?area_id=${areaId}`),
        apiClient.get('/drainage/segments'),
      ]);
      setGisData(layers);
      setSensors(snList);
      setDrainNodes(dNodes);
      setDrainSegments(dSegs);

      // Match rain telemetry for current selected Ward
      const areaRain = rainList.find((r: any) => r.area_id === areaId) || rainList[0];
      if (areaRain) {
        setRainfallIntensity(areaRain.intensity_mm_hr);
        setRadarDbz(areaRain.radar_reflectivity_dbz);
      }

      // Extract road properties from GeoJSON features
      if (layers?.roads_geojson?.features) {
        const rList = layers.roads_geojson.features.map((f: any) => f.properties);
        setRoads(rList);
      }
    } catch (err) {
      console.error('Failed to load area layers:', err);
    }
  };

  // Trigger initial data loading on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Reload spatial layers when selectedAreaId changes
  useEffect(() => {
    if (selectedAreaId) {
      loadAreaLayers(selectedAreaId);
    }
  }, [selectedAreaId]);

  // Ensure Citizen / Public role stays on user-accessible views
  useEffect(() => {
    const role = currentUser?.role?.toUpperCase() || 'USER';
    const restrictedForUser = ['rainfall', 'terrain_dem', 'drainage', 'sensors', 'rescue', 'reports', 'admin_portal'];
    if (role === 'USER' && restrictedForUser.includes(currentView)) {
      setCurrentView('dashboard');
    }
  }, [currentView, currentUser]);

  // ----------------------------------------------------------------------------
  // HYDRODYNAMIC SCENARIO SIMULATION TRIGGER
  // ----------------------------------------------------------------------------
  // Why this code is used: Sends a request to /api/simulation/trigger to execute
  // a synthetic 115mm/h cloudburst scenario and update inundation levels.
  const handleTriggerScenario = async (scenario: string) => {
    setIsSimulating(true);
    setCurrentScenario(scenario);
    try {
      await apiClient.post('/simulation/trigger', {
        scenario_type: scenario,
        target_area: areas.find(a => a.id === selectedAreaId)?.name || 'Velachery',
      });
      // Refresh layers & entities to reflect simulated surcharge depths
      await loadAreaLayers(selectedAreaId);
      const al = await apiClient.get('/alerts');
      setAlerts(al);
    } catch (err) {
      console.error('Simulation trigger failed:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Acknowledge Disaster Alert (/api/alerts/{id}/acknowledge)
  const handleAcknowledgeAlert = async (id: number) => {
    try {
      await apiClient.patch(`/alerts/${id}/acknowledge`);
      const al = await apiClient.get('/alerts');
      setAlerts(al);
    } catch (err) {
      console.error('Failed to ack alert:', err);
    }
  };

  // User Logout Handler
  const handleLogout = () => {
    apiClient.clearToken();
    localStorage.removeItem('drainx_user');
    setCurrentUser(null);
    setInLandingMode(true);
  };

  // Derived helper variables for current active Area and unacknowledged alert counts
  const currentArea = areas.find(a => a.id === selectedAreaId) || areas[0];
  const activeAlertCount = alerts.filter(a => a.is_active && !a.is_acknowledged).length;

  // ----------------------------------------------------------------------------
  // PUBLIC LANDING PAGE VIEW (UNAUTHENTICATED OR DEMO MODE)
  // ----------------------------------------------------------------------------
  if (inLandingMode && !currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans']">
        <Navbar
          currentUser={currentUser}
          onOpenAuth={() => setShowAuthModal(true)}
          onLogout={handleLogout}
          areas={areas}
          selectedAreaId={selectedAreaId}
          onSelectArea={setSelectedAreaId}
          rainfallIntensity={rainfallIntensity}
          radarDbz={radarDbz}
          activeAlertCount={activeAlertCount}
          onTriggerScenario={handleTriggerScenario}
          isSimulating={isSimulating}
        />
        <LandingPage
          onEnterDashboard={() => setInLandingMode(false)}
          onOpenAuth={() => setShowAuthModal(true)}
          areas={areas}
          rainfallIntensity={rainfallIntensity}
          activeAlertCount={activeAlertCount}
        />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={(u) => {
            setCurrentUser(u);
            setInLandingMode(false);
            if (u.role === 'ADMIN') {
              setCurrentView('admin_portal');
            } else if (u.role === 'RESCUE') {
              setCurrentView('rescue');
            } else {
              setCurrentView('dashboard');
            }
          }}
        />
      </div>
    );
  }

  // ----------------------------------------------------------------------------
  // MAIN DASHBOARD & DISASTER OPERATION PORTAL VIEW
  // ----------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-cyan-500 selection:text-white">
      {/* Sticky Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        areas={areas}
        selectedAreaId={selectedAreaId}
        onSelectArea={setSelectedAreaId}
        rainfallIntensity={rainfallIntensity}
        radarDbz={radarDbz}
        activeAlertCount={activeAlertCount}
        onTriggerScenario={handleTriggerScenario}
        isSimulating={isSimulating}
      />

      {/* Floating Hydrodynamic Cloudburst Scenario Bar */}
      <SimulationBar
        onTriggerScenario={handleTriggerScenario}
        isSimulating={isSimulating}
        currentScenario={currentScenario}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar Navigation */}
        <Sidebar
          currentView={currentView}
          onSelectView={setCurrentView}
          currentUser={currentUser}
          activeAlertCount={activeAlertCount}
        />

        {/* Main Operational View Routing Container */}
        <main className="flex-1 overflow-y-auto bg-slate-950/60 pb-12">
          {/* 1. Dashboard Command Center */}
          {currentView === 'dashboard' && (
            <DashboardView
              currentArea={currentArea}
              gisData={gisData}
              rainfallIntensity={rainfallIntensity}
              radarDbz={radarDbz}
              roads={roads}
              sensors={sensors}
              drainNodes={drainNodes}
              alerts={alerts}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onNavigateToView={setCurrentView}
              onSelectRoad={setSelectedRoadName}
            />
          )}

          {/* 2. Interactive GIS Flood Map */}
          {currentView === 'flood_map' && (
            <div className="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white font-['Outfit']">
                    Interactive GIS Urban Flood & Drainage Map
                  </h2>
                  <p className="text-xs text-slate-400">
                    High-resolution spatial layer inspection for {currentArea?.name || 'Chennai Wards'}.
                  </p>
                </div>
              </div>
              <div className="h-[calc(100vh-14rem)] min-h-[550px] w-full">
                <GisFloodMap
                  currentArea={currentArea}
                  gisData={gisData}
                  leadTimeSelected={60}
                  onSelectRoad={setSelectedRoadName}
                />
              </div>
            </div>
          )}

          {/* 3. Catchment Elevation Analysis */}
          {currentView === 'area_analysis' && (
            <AreaAnalysisView
              currentArea={currentArea}
              roads={roads}
              drainNodes={drainNodes}
              sensors={sensors}
              rainfallIntensity={rainfallIntensity}
            />
          )}

          {/* 4. Doppler Radar Telemetry */}
          {currentView === 'rainfall' && (
            <RainfallRadarView
              currentArea={currentArea}
              rainfallIntensity={rainfallIntensity}
              radarDbz={radarDbz}
            />
          )}

          {/* 5. Terrain DEM Sink Inspection */}
          {currentView === 'terrain_dem' && (
            <AreaAnalysisView
              currentArea={currentArea}
              roads={roads}
              drainNodes={drainNodes}
              sensors={sensors}
              rainfallIntensity={rainfallIntensity}
            />
          )}

          {/* 6. Storm Drainage Network Digital Twin */}
          {currentView === 'drainage' && (
            <DrainageNetworkView
              drainSegments={drainSegments}
              drainNodes={drainNodes}
            />
          )}

          {/* 7. IoT Sensor Fleet & Multi-Manhole Register */}
          {currentView === 'sensors' && (
            <SensorsView
              currentArea={currentArea}
              sensors={sensors}
              rainfallIntensity={rainfallIntensity}
            />
          )}

          {/* 8. Spatiotemporal AI Nowcasting (XGBoost 94.15% vs GBR 93.98%) */}
          {currentView === 'prediction' && (
            <PredictionView
              currentArea={currentArea}
              roads={roads}
              rainfallIntensity={rainfallIntensity}
              radarDbz={radarDbz}
              onSelectRoad={setSelectedRoadName}
            />
          )}

          {/* 9. Safe Evacuation Route Engine */}
          {currentView === 'safe_route' && (
            <SafeRouteView
              currentArea={currentArea}
              roads={roads}
            />
          )}

          {/* 10. Disaster Warnings & Alerts */}
          {currentView === 'alerts' && (
            <AlertsView
              alerts={alerts}
              currentUser={currentUser}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onRefreshAlerts={() => apiClient.get('/alerts').then(setAlerts)}
            />
          )}

          {/* 11. NDRF / SDRF Rescue Fleet & Admin Broadcast Command */}
          {currentView === 'rescue' && (
            <RescueView
              rescueTeams={rescueTeams}
              rescueTasks={rescueTasks}
              currentUser={currentUser}
              onRefreshTasks={() => apiClient.get('/rescue/tasks').then(setRescueTasks)}
            />
          )}

          {/* 12. Municipal Disaster Reports & Analytics Export */}
          {currentView === 'reports' && (
            <ReportsView
              currentArea={currentArea}
              roads={roads}
              drainNodes={drainNodes}
              sensors={sensors}
              alerts={alerts}
              rainfallIntensity={rainfallIntensity}
            />
          )}

          {/* 13. System Admin Audit Portal */}
          {currentView === 'admin_portal' && (
            <AdminPortalView />
          )}
        </main>
      </div>

      {/* Authentication Modal (Login / Register) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(u) => {
          setCurrentUser(u);
          setInLandingMode(false);
          if (u.role === 'ADMIN') {
            setCurrentView('admin_portal');
          } else if (u.role === 'RESCUE') {
            setCurrentView('rescue');
          } else {
            setCurrentView('dashboard');
          }
        }}
      />
    </div>
  );
}

export default App;
