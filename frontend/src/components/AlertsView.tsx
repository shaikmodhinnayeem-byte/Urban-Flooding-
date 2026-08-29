import React, { useState } from 'react';
import { AlertOctagon, ShieldCheck, AlertTriangle, Send, CheckCircle2, Clock, Filter, Radio } from 'lucide-react';
import { Alert, User } from '../types';
import { apiClient } from '../services/api';

interface AlertsViewProps {
  alerts: Alert[];
  currentUser: User | null;
  onAcknowledgeAlert: (id: number) => void;
  onRefreshAlerts: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  currentUser,
  onAcknowledgeAlert,
  onRefreshAlerts,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('WARNING');
  const [sending, setSending] = useState(false);

  const isAdmin = currentUser?.role === 'ADMIN';

  const filteredAlerts = filterSeverity === 'ALL'
    ? alerts
    : alerts.filter(a => a.severity === filterSeverity);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await apiClient.post('/alerts', {
        title,
        description,
        severity,
        area_id: 1,
        alert_type: 'EMERGENCY_BROADCAST',
      });
      setTitle('');
      setDescription('');
      setShowCreateModal(false);
      onRefreshAlerts();
    } catch (err) {
      console.error('Failed to dispatch alert:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Early Warning Broadcast System</span>
              <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded font-bold">
                TNSDMA / CAP COMPLIANT
              </span>
            </div>
            <h2 className="text-2xl font-black text-white font-['Outfit'] mt-1">
              Disaster Early Warnings & Inundation Alerts
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Automated nowcast threshold alarms and manual emergency broadcasts to first responders and municipal wards.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/25 transition active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Broadcast Emergency Alert</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          {['ALL', 'CRITICAL', 'WARNING', 'HIGH', 'INFO'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                filterSeverity === sev ? 'bg-cyan-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400">
          Showing <b>{filteredAlerts.length}</b> alert{filteredAlerts.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const isCritical = alert.severity === 'CRITICAL';
          const isWarn = alert.severity === 'WARNING' || alert.severity === 'HIGH';

          return (
            <div
              key={alert.id}
              className={`p-5 rounded-2xl border transition-all ${
                isCritical ? 'bg-red-950/40 border-red-800/80 shadow-lg shadow-red-950/50' :
                isWarn ? 'bg-amber-950/30 border-amber-800/70' :
                'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl mt-0.5 ${
                    isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                    isWarn ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                    'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  }`}>
                    <AlertOctagon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-white font-['Outfit']">{alert.title}</h3>
                      <span className={`px-2 py-0.2 rounded text-[9px] font-black uppercase ${
                        isCritical ? 'bg-red-500 text-white' :
                        isWarn ? 'bg-amber-500 text-slate-950' :
                        'bg-cyan-500 text-slate-950'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {alert.description}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-2 font-mono">
                      <span>Type: {alert.alert_type}</span>
                      <span>•</span>
                      <span>Dispatched: {new Date(alert.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {alert.is_acknowledged ? (
                    <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Acknowledged</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white rounded-lg text-xs font-bold transition"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Acknowledge</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Broadcast Modal (Admin Only) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white font-['Outfit']">
              Broadcast Emergency Inundation Warning
            </h3>

            <form onSubmit={handleBroadcast} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Alert Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 🚨 CRITICAL SURCHARGE WARNING: Velachery Lake Sector"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Severity Level</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                >
                  <option value="CRITICAL">🔴 CRITICAL (Immediate Evacuation / Diversion)</option>
                  <option value="WARNING">🟠 WARNING (Water Accumulation &gt; 30cm)</option>
                  <option value="HIGH">🟡 HIGH (Drain Capacity &gt; 85%)</option>
                  <option value="INFO">🔵 INFO (Meteorological Advisory)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Alert Description & Action Instructions</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe street locations affected, expected water depth, and safe evacuation corridors..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold"
                >
                  {sending ? 'Broadcasting...' : 'Broadcast to Ward'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
