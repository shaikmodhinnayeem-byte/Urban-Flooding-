import React, { useState } from 'react';
import { LifeBuoy, Users, Phone, MapPin, AlertTriangle, CheckCircle2, Send, Truck, Shield } from 'lucide-react';
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

  const canManageRescue = currentUser?.role === 'ADMIN' || currentUser?.role === 'RESCUE';

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
    <div className="space-y-6 p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Disaster Response Logistics</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-bold">
                NDRF / SDRF TACTICAL UNIT
              </span>
            </div>
            <h2 className="text-2xl font-black text-white font-['Outfit'] mt-1">
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
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-600/25 transition active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Deploy Rescue Taskforce</span>
              </button>
            )}
          </div>
        </div>
      </div>

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
