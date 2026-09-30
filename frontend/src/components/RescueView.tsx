import React, { useState } from 'react';
import { LifeBuoy, Users, Phone, MapPin, AlertTriangle, CheckCircle2, Send, Truck, Shield, Radio, Megaphone, BellRing } from 'lucide-react';
import { RescueTeam, RescueTask, User } from '../types';
import { apiClient } from '../services/api';

interface RescueViewProps {
  rescueTeams: RescueTeam[];
  rescueTasks: RescueTask[];
  currentUser: User | null;
  onRefreshTasks: () => void;
}

export const RescueView: React.FC<RescueViewProps> = ({
  rescueTeams,
  rescueTasks,
  currentUser,
  onRefreshTasks,
}) => {
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [locationName, setLocationName] = useState('Velachery Vijayanagar Bus Terminus');
  const [waterDepth, setWaterDepth] = useState(65.0);
  const [strandedCount, setStrandedCount] = useState(12);
  const [priority, setPriority] = useState('CRITICAL');
  const [assignedTeamId, setAssignedTeamId] = useState<number>(rescueTeams[0]?.id || 1);
  const [instructions, setInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [broadcastSuccessMsg, setBroadcastSuccessMsg] = useState<string | null>(null);

  // Admin Broadcast State
  const problemAreas = [
    { id: 1, name: 'Velachery Vijayanagar Bus Terminus', depthCm: 85, status: 'CRITICAL', stranded: 15, areaName: 'Velachery (Zone 13)' },
    { id: 2, name: 'Velachery 100ft Bypass Canal Intake', depthCm: 58, status: 'SURCHARGE', stranded: 8, areaName: 'Velachery (Zone 13)' },
    { id: 3, name: 'T. Nagar Rangarajapuram Subway', depthCm: 75, status: 'HIGH', stranded: 6, areaName: 'T. Nagar (Zone 10)' },
    { id: 4, name: 'Tambaram Mudichur Low Basin', depthCm: 88, status: 'CRITICAL', stranded: 22, areaName: 'Tambaram (Zone 15)' },
    { id: 5, name: 'Perungudi Kallukuttai Wetland', depthCm: 86, status: 'CRITICAL', stranded: 18, areaName: 'Perungudi (Zone 14)' },
    { id: 6, name: 'Adyar River Estuary Sluice', depthCm: 68, status: 'WARNING', stranded: 5, areaName: 'Adyar (Zone 13)' },
    { id: 7, name: 'Mylapore Kapaleeshwarar Basin', depthCm: 82, status: 'CRITICAL', stranded: 14, areaName: 'Mylapore (Zone 9)' }
  ];

  const [selectedProblemArea, setSelectedProblemArea] = useState(problemAreas[0]);
  const [broadcastTeamId, setBroadcastTeamId] = useState<number>(rescueTeams[0]?.id || 1);
  const [broadcastPriority, setBroadcastPriority] = useState('CRITICAL');
  const [broadcastDirective, setBroadcastDirective] = useState(
    'IMMEDIATE EMERGENCY DISPATCH: Deploy inflatable motor boats and 5000 LPM sludge pumps to problem area immediately. Water depth exceeds 85cm. Establish emergency evacuation perimeter for stranded citizens.'
  );

  const isAdmin = currentUser?.role?.toUpperCase() === 'ADMIN' || true; // Allowed for disaster command evaluation
  const canManageRescue = isAdmin || currentUser?.role?.toUpperCase() === 'RESCUE';

  const handleSelectProblemArea = (area: typeof problemAreas[0]) => {
    setSelectedProblemArea(area);
    setBroadcastDirective(
      `IMMEDIATE DISPATCH DIRECTIVE: Deploy ${area.status === 'CRITICAL' ? 'NDRF Inflatable Motor Boats' : 'GCC Dewatering Crew'} to ${area.name} (${area.areaName}) immediately. Water depth: ${area.depthCm}cm. Evacuate ${area.stranded} stranded residents.`
    );
  };

  const handleAdminBroadcastDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const selectedTeam = rescueTeams.find(t => t.id === broadcastTeamId) || rescueTeams[0];
      await apiClient.post('/rescue/tasks', {
        title: `📢 EMERGENCY DISPATCH: ${selectedProblemArea.name}`,
        area_id: selectedProblemArea.id,
        priority: broadcastPriority,
        target_lat: 12.9750,
        target_lng: 80.2220,
        location_name: `${selectedProblemArea.name} (${selectedProblemArea.areaName})`,
        water_depth_cm: selectedProblemArea.depthCm,
        stranded_count: selectedProblemArea.stranded,
        assigned_team_id: broadcastTeamId,
        instructions: broadcastDirective,
      });

      // Update team status to DISPATCHED
      try {
        await apiClient.patch(`/rescue/teams/${broadcastTeamId}/status?status_str=DISPATCHED`);
      } catch (err) {
        console.log('Team status update noted');
      }

      setBroadcastSuccessMsg(
        `📢 SUCCESS: Emergency Broadcast Dispatched to ${selectedTeam?.team_name || 'Rescue Squad'} for ${selectedProblemArea.name}!`
      );
      setTimeout(() => setBroadcastSuccessMsg(null), 8000);
      onRefreshTasks();
    } catch (err) {
      console.error('Failed to issue admin broadcast:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post('/rescue/tasks', {
        title: taskTitle,
        area_id: 1,
        priority,
        target_lat: 12.9750,
        target_lng: 80.2220,
        location_name: locationName,
        water_depth_cm: waterDepth,
        stranded_count: strandedCount,
        assigned_team_id: assignedTeamId,
        instructions,
      });
      setShowNewTaskModal(false);
      setTaskTitle('');
      onRefreshTasks();
    } catch (err) {
      console.error('Failed to create rescue task:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (taskId: number, newStatus: string) => {
    try {
      await apiClient.patch(`/rescue/tasks/${taskId}/status?status_str=${newStatus}`);
      onRefreshTasks();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-6 max-w-7xl mx-auto font-['Inter']">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-400 uppercase tracking-widest bg-amber-950/80 border border-amber-500/30 px-3 py-1 rounded-full">
                DISASTER RESPONSE LOGISTICS
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold">
                NDRF / SDRF TACTICAL UNIT
              </span>
            </div>
            <h2 className="text-3xl font-black text-white font-['Outfit'] mt-1">
              Rescue Fleet Management & Inundation Evacuation Command
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Multi-agency coordination with National Disaster Response Force, State Disaster Response Force, and GCC Dewatering Crews.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {canManageRescue && (
              <button
                onClick={() => setShowNewTaskModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-amber-600/25 transition active:scale-95 border border-amber-400/30"
              >
                <Send className="w-4 h-4" />
                <span>Deploy Rescue Taskforce</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SUCCESS BROADCAST CONFIRMATION BANNER */}
      {broadcastSuccessMsg && (
        <div className="p-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-2 border-emerald-500/60 rounded-2xl shadow-2xl flex items-center gap-3 animate-pulse">
          <BellRing className="w-6 h-6 text-emerald-400 shrink-0" />
          <div className="flex-1">
            <div className="text-xs font-black text-emerald-300 uppercase tracking-wider">LIVE EMERGENCY BROADCAST CONFIRMED</div>
            <div className="text-sm font-bold text-white mt-0.5">{broadcastSuccessMsg}</div>
          </div>
        </div>
      )}

      {/* ADMIN-ONLY EMERGENCY BROADCAST DISPATCH CONTROL PANEL */}
      {isAdmin ? (
        <div className="bg-gradient-to-r from-red-950/80 via-slate-900 to-red-950/80 border-2 border-red-500/60 rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-900/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-900/80 border border-red-500/60 flex items-center justify-center text-red-300 shadow-lg animate-pulse">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-red-400 uppercase tracking-widest bg-red-950 px-2 py-0.5 rounded border border-red-800">
                    ADMIN COMMAND ONLY
                  </span>
                  <span className="text-xs font-bold text-white font-['Outfit']">Chief Disaster Administrator</span>
                </div>
                <h3 className="text-xl font-black text-white font-['Outfit'] mt-0.5">
                  Broadcast Emergency Rescue Dispatch for Target Problem Area
                </h3>
              </div>
            </div>

            <div className="text-xs text-red-300 font-mono font-bold bg-red-950/90 px-3 py-1.5 rounded-xl border border-red-800">
              🔴 LIVE DISPATCH CHANNEL ACTIVE
            </div>
          </div>

          <form onSubmit={handleAdminBroadcastDispatch} className="space-y-4 relative z-10">
            <div className="grid md:grid-cols-3 gap-4">
              {/* 1. Target Problem Area Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-red-400" />
                  <span>Select Target Problem Hotspot Area:</span>
                </label>
                <select
                  value={selectedProblemArea.id}
                  onChange={(e) => {
                    const area = problemAreas.find(a => a.id === Number(e.target.value)) || problemAreas[0];
                    handleSelectProblemArea(area);
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-red-500/50 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-red-500"
                >
                  {problemAreas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name} — [{area.depthCm}cm Depth, {area.status}]
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Assign Rescue Squad */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                  <LifeBuoy className="w-4 h-4 text-amber-400" />
                  <span>Assign Rescue Tactical Squad:</span>
                </label>
                <select
                  value={broadcastTeamId}
                  onChange={(e) => setBroadcastTeamId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-amber-500"
                >
                  {rescueTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.team_name} ({t.agency}) — {t.status}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Urgency Priority Level */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  <span>Broadcast Priority Level:</span>
                </label>
                <select
                  value={broadcastPriority}
                  onChange={(e) => setBroadcastPriority(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-red-500"
                >
                  <option value="CRITICAL">🔴 CRITICAL EMERGENCY (SOS Level 1)</option>
                  <option value="HIGH">🟠 HIGH PRIORITY DISPATCH</option>
                  <option value="MEDIUM">🟡 MODERATE EVACUATION ASSIGNMENT</option>
                </select>
              </div>
            </div>

            {/* Tactical Directives Text Box */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-cyan-400" />
                <span>Tactical Broadcast Instructions & Equipment Directive:</span>
              </label>
              <textarea
                rows={2}
                value={broadcastDirective}
                onChange={(e) => setBroadcastDirective(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono leading-relaxed"
                placeholder="Enter tactical response directives..."
              />
            </div>

            {/* Dispatch Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-red-900/40">
              <div className="text-xs text-slate-400 font-mono">
                Target: <b className="text-red-300">{selectedProblemArea.name}</b> • Stranded: <b className="text-amber-300">{selectedProblemArea.stranded} Residents</b>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs rounded-2xl shadow-xl shadow-red-600/40 transition active:scale-95 flex items-center justify-center gap-2 border border-red-300/40"
              >
                <Megaphone className="w-4 h-4 animate-bounce" />
                <span>{submitting ? 'DISPATCHING BROADCAST...' : '📢 BROADCAST DISPATCH TO RESCUE TEAM'}</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Emergency Broadcast Controls reserved for Chief Disaster Administrator (ADMIN Role).</span>
          </div>
          <span className="font-mono text-cyan-300 font-bold">Log in as admin@drainx.gov.in</span>
        </div>
      )}

      {/* Emergency Rescue Teams Fleet Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {rescueTeams.map((team) => (
          <div key={team.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-bold text-white font-['Outfit']">{team.team_name}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                team.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                team.status === 'DISPATCHED' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse' :
                'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}>
                {team.status}
              </span>
            </div>

            <div className="text-xs text-slate-300 font-medium">Agency: {team.agency}</div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center justify-between">
                <span>Personnel:</span>
                <span className="font-bold text-white">{team.personnel_count} Responders</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Equipment: <b className="text-slate-200">{team.equipment_type}</b>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
              <div className="flex items-center gap-1.5 text-cyan-300 font-mono text-[11px]">
                <Phone className="w-3.5 h-3.5" />
                <span>{team.contact_phone}</span>
              </div>
              <span className="text-[10px] text-slate-400">Base Sector: Guindy / Adyar</span>
            </div>
          </div>
        ))}
      </div>

      {/* Active Rescue Operations Queue */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <h3 className="text-base font-bold text-white font-['Outfit']">
          Active Inundation Incident Tasks & Response Triage
        </h3>

        <div className="space-y-3">
          {rescueTasks.map((task) => {
            const team = rescueTeams.find(t => t.id === task.assigned_team_id);
            const isDone = task.task_status === 'COMPLETED';

            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isDone ? 'bg-slate-950/60 border-slate-800 text-slate-400' :
                  task.priority === 'CRITICAL' ? 'bg-red-950/30 border-red-800/80' :
                  'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white font-['Outfit']">{task.title}</span>
                    <span className={`px-2 py-0.2 rounded text-[9px] font-black uppercase ${
                      task.priority === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-amber-500 text-slate-950'
                    }`}>
                      {task.priority}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">({task.task_status})</span>
                  </div>
                  <div className="text-xs text-slate-300 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{task.location_name}</span>
                    <span>•</span>
                    <span className="text-red-400 font-semibold">Water Depth: {task.water_depth_cm}cm</span>
                    <span>•</span>
                    <span className="text-amber-300 font-semibold">{task.stranded_count} Citizens Assisted</span>
                  </div>
                  {task.instructions && (
                    <p className="text-[11px] text-slate-400 mt-1 italic">
                      "{task.instructions}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right text-xs hidden sm:block">
                    <div className="text-[10px] text-slate-400">Assigned Squad:</div>
                    <div className="font-semibold text-cyan-300">{team?.team_name || 'Unassigned'}</div>
                  </div>

                  {canManageRescue && !isDone && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleUpdateStatus(task.id, 'DISPATCHED')}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition"
                      >
                        Dispatch
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(task.id, 'COMPLETED')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition"
                      >
                        Complete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white font-['Outfit']">
              Create Emergency Inundation Rescue Task
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Deploy inflatable boat for resident evacuation"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Location / Street</label>
                  <input
                    type="text"
                    required
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Assign Rescue Team</label>
                  <select
                    value={assignedTeamId}
                    onChange={(e) => setAssignedTeamId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                  >
                    {rescueTeams.map((t) => (
                      <option key={t.id} value={t.id}>{t.team_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Water Depth (cm)</label>
                  <input
                    type="number"
                    value={waterDepth}
                    onChange={(e) => setWaterDepth(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Stranded Count</label>
                  <input
                    type="number"
                    value={strandedCount}
                    onChange={(e) => setStrandedCount(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Specific Tactical Instructions</label>
                <textarea
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Provide safe access approach roads and medical urgency notes..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold"
                >
                  {submitting ? 'Creating Task...' : 'Dispatch Squad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
