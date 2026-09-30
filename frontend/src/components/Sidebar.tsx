import React from 'react';
import {
  LayoutDashboard, Map, Compass, CloudRain, Mountain, GitFork,
  Cpu, BrainCircuit, Navigation, AlertOctagon, LifeBuoy, FileText,
  ShieldAlert, Database, Settings, HelpCircle
} from 'lucide-react';
import { User } from '../types';

export type NavView =
  | 'dashboard'
  | 'flood_map'
  | 'area_analysis'
  | 'rainfall'
  | 'terrain_dem'
  | 'drainage'
  | 'sensors'
  | 'prediction'
  | 'safe_route'
  | 'alerts'
  | 'rescue'
  | 'reports'
  | 'admin_portal';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  currentUser: User | null;
  activeAlertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  currentUser,
  activeAlertCount,
}) => {
  const userRole = currentUser?.role?.toUpperCase() || 'USER';
  const isAdmin = userRole === 'ADMIN';
  const isRescue = userRole === 'RESCUE';

  // Base navigation items for Citizen / Resident User dashboard
  const userNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'flood_map', label: 'GIS Flood Map', icon: Map, badge: 'Live' },
    { id: 'area_analysis', label: 'Area Analysis', icon: Compass, badge: null },
    { id: 'prediction', label: 'AI 0-3h Nowcast', icon: BrainCircuit, badge: 'ML/DL' },
    { id: 'safe_route', label: 'Safe Route Engine', icon: Navigation, badge: null },
    { id: 'alerts', label: 'Disaster Alerts', icon: AlertOctagon, badge: activeAlertCount > 0 ? `${activeAlertCount}` : null },
  ];

  // Full navigation items for Admin Command and Specialized Technical Roles
  const adminNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'flood_map', label: 'GIS Flood Map', icon: Map, badge: 'Live' },
    { id: 'area_analysis', label: 'Area Analysis', icon: Compass, badge: null },
    { id: 'rainfall', label: 'Rainfall & Radar', icon: CloudRain, badge: 'IMD' },
    { id: 'terrain_dem', label: 'Terrain & DEM', icon: Mountain, badge: null },
    { id: 'drainage', label: 'Drainage Network', icon: GitFork, badge: null },
    { id: 'sensors', label: 'IoT Sensor Fleet', icon: Cpu, badge: null },
    { id: 'prediction', label: 'AI 0-3h Nowcast', icon: BrainCircuit, badge: 'ML/DL' },
    { id: 'safe_route', label: 'Safe Route Engine', icon: Navigation, badge: null },
    { id: 'alerts', label: 'Disaster Alerts', icon: AlertOctagon, badge: activeAlertCount > 0 ? `${activeAlertCount}` : null },
    { id: 'rescue', label: 'Rescue Command', icon: LifeBuoy, badge: null },
    { id: 'reports', label: 'Reports & Analytics', icon: FileText, badge: null },
  ];

  // Rescue squad navigation
  const rescueNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'flood_map', label: 'GIS Flood Map', icon: Map, badge: 'Live' },
    { id: 'prediction', label: 'AI 0-3h Nowcast', icon: BrainCircuit, badge: 'ML/DL' },
    { id: 'safe_route', label: 'Safe Route Engine', icon: Navigation, badge: null },
    { id: 'alerts', label: 'Disaster Alerts', icon: AlertOctagon, badge: activeAlertCount > 0 ? `${activeAlertCount}` : null },
    { id: 'rescue', label: 'Rescue Command', icon: LifeBuoy, badge: null },
  ];

  const navItems = isAdmin ? adminNavItems : isRescue ? rescueNavItems : userNavItems;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-[calc(100vh-4rem)] select-none shrink-0">
      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Core Operations
        </div>
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id as NavView)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                  item.id === 'alerts' && activeAlertCount > 0
                    ? 'bg-red-500 text-white animate-pulse'
                    : isActive
                    ? 'bg-cyan-400/20 text-cyan-300'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Administration Section */}
        {isAdmin && (
          <>
            <div className="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center justify-between">
              <span>Admin Center</span>
              <ShieldAlert className="w-3 h-3" />
            </div>
            <button
              onClick={() => onSelectView('admin_portal')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'admin_portal'
                  ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-purple-400" />
                <span>MLOps & Datasets</span>
              </div>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-bold">
                ROOT
              </span>
            </button>
          </>
        )}
      </div>

      {/* Footer info */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-center">
        <div className="text-[10px] text-slate-400 font-medium">
          Greater Chennai Smart City Platform
        </div>
        <div className="text-[9px] text-slate-400 flex items-center justify-center gap-1 mt-0.5">
          <span>v2.3.4-PROD</span>
          <span>•</span>
          <span className="text-emerald-400">TNSDMA Ready</span>
        </div>
      </div>
    </aside>
  );
};
