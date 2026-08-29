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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState<number>(1);
  const [areas, setAreas] = useState<Area[]>([]);
  const [gisData, setGisData] = useState<any>(null);
  const [rainfallIntensity, setRainfallIntensity] = useState<number>(24.5);
  const [radarDbz, setRadarDbz] = useState<number>(38.5);
  const [roads, setRoads] = useState<Road[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [drainNodes, setDrainNodes] = useState<DrainNode[]>([]);
  const [drainSegments, setDrainSegments] = useState<DrainSegment[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [rescueTeams, setRescueTeams] = useState<RescueTeam[]>([]);
  const [rescueTasks, setRescueTasks] = useState<RescueTask[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentScenario, setCurrentScenario] = useState('NORMAL');
  const [selectedRoadName, setSelectedRoadName] = useState<string | null>(null);
  const [inLandingMode, setInLandingMode] = useState(true);

  // Initial Data Fetch
  const loadInitialData = async () => {
    try {
      // 1. Check Profile
      if (apiClient.getToken()) {
        const user = await apiClient.get('/auth/me').catch(() => null);
        if (user) {
          setCurrentUser(user);
          setInLandingMode(false);
        }
      }

      // 2. Fetch Areas
      const areaList = await apiClient.get('/areas');
      setAreas(areaList);

      // 3. Fetch Area Layers & Entities
      await loadAreaLayers(selectedAreaId);

      // 4. Fetch Global Alerts, Teams, Tasks
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

      const areaRain = rainList.find((r: any) => r.area_id === areaId) || rainList[0];
      if (areaRain) {
        setRainfallIntensity(areaRain.intensity_mm_hr);
        setRadarDbz(areaRain.radar_reflectivity_dbz);
      }

      // Extract roads
      if (layers?.roads_geojson?.features) {
        const rList = layers.roads_geojson.features.map((f: any) => f.properties);
        setRoads(rList);
      }
    } catch (err) {
      console.error('Failed to load area layers:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedAreaId) {
      loadAreaLayers(selectedAreaId);
    }
  }, [selectedAreaId]);

  // Handle Scenario Triggers (e.g. 115mm Cloudburst)
  const handleTriggerScenario = async (scenario: string) => {
    setIsSimulating(true);
    setCurrentScenario(scenario);
    try {
      await apiClient.post('/simulation/trigger', {
        scenario_type: scenario,
        target_area: areas.find(a => a.id === selectedAreaId)?.name || 'Velachery',
      });
      // Refresh layers & entities
      await loadAreaLayers(selectedAreaId);
      const al = await apiClient.get('/alerts');
      setAlerts(al);
    } catch (err) {
      console.error('Simulation trigger failed:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleAcknowledgeAlert = async (id: number) => {
    try {
      await apiClient.patch(`/alerts/${id}/acknowledge`);
      const al = await apiClient.get('/alerts');
      setAlerts(al);
    } catch (err) {
      console.error('Failed to ack alert:', err);
    }
  };

  const handleLogout = () => {
    apiClient.clearToken();
    setCurrentUser(null);
    setInLandingMode(true);
  };

  const currentArea = areas.find(a => a.id === selectedAreaId) || areas[0];
  const activeAlertCount = alerts.filter(a => a.is_active && !a.is_acknowledged).length;

  // Render Public Landing Page
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
          }}
        />
      </div>
    );
  }

  // Render Main Dashboard & Operation Portal
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-cyan-500 selection:text-white">
      {/* Top Navbar */}
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

      {/* Floating Simulation Bar */}
      <SimulationBar
        onTriggerScenario={handleTriggerScenario}
        isSimulating={isSimulating}
        currentScenario={currentScenario}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          currentView={currentView}
          onSelectView={setCurrentView}
          currentUser={currentUser}
          activeAlertCount={activeAlertCount}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-950/60 pb-12">
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

          {currentView === 'area_analysis' && (
            <AreaAnalysisView
              currentArea={currentArea}
              roads={roads}
              drainNodes={drainNodes}
              sensors={sensors}
              rainfallIntensity={rainfallIntensity}
            />
          )}

          {currentView === 'rainfall' && (
            <RainfallRadarView
              currentArea={currentArea}
              rainfallIntensity={rainfallIntensity}
              radarDbz={radarDbz}
            />
          )}

          {currentView === 'terrain_dem' && (
            <AreaAnalysisView
              currentArea={currentArea}
              roads={roads}
              drainNodes={drainNodes}
              sensors={sensors}
              rainfallIntensity={rainfallIntensity}
            />
          )}

          {currentView === 'drainage' && (
            <DrainageNetworkView
              drainSegments={drainSegments}
              drainNodes={drainNodes}
            />
          )}

          {currentView === 'sensors' && (
            <SensorsView
              sensors={sensors}
              rainfallIntensity={rainfallIntensity}
            />
          )}

          {currentView === 'prediction' && (
            <PredictionView
              currentArea={currentArea}
              roads={roads}
              rainfallIntensity={rainfallIntensity}
              radarDbz={radarDbz}
              onSelectRoad={setSelectedRoadName}
            />
          )}

          {currentView === 'safe_route' && (
            <SafeRouteView
              currentArea={currentArea}
              roads={roads}
            />
          )}

          {currentView === 'alerts' && (
            <AlertsView
              alerts={alerts}
              currentUser={currentUser}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onRefreshAlerts={() => apiClient.get('/alerts').then(setAlerts)}
            />
          )}

          {currentView === 'rescue' && (
            <RescueView
              rescueTeams={rescueTeams}
              rescueTasks={rescueTasks}
              currentUser={currentUser}
              onRefreshTasks={() => apiClient.get('/rescue/tasks').then(setRescueTasks)}
            />
          )}

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

          {currentView === 'admin_portal' && (
            <AdminPortalView />
          )}
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(u) => {
          setCurrentUser(u);
          setInLandingMode(false);
        }}
      />
    </div>
  );
}

export default App;
