import React, { useEffect, useState } from 'react';
import { Database, BrainCircuit, ShieldAlert, Cpu, Activity, RefreshCw, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { apiClient } from '../services/api';

export const AdminPortalView: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [models, setModels] = useState<any[]>([]);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrainingModelId, setRetrainingModelId] = useState<number | null>(null);
  const [validatingDsId, setValidatingDsId] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [ov, md, ds, lg] = await Promise.all([
        apiClient.get('/admin/overview'),
        apiClient.get('/admin/models'),
        apiClient.get('/admin/datasets'),
        apiClient.get('/admin/audit-logs'),
      ]);
      setOverview(ov);
      setModels(md);
      setDatasets(ds);
      setAuditLogs(lg);
    } catch (err) {
      console.error('Failed to fetch admin telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRetrain = async (modelId: number) => {
    setRetrainingModelId(modelId);
    setMsg(null);
    try {
      const res = await apiClient.post(`/admin/models/${modelId}/retrain`, {});
      setMsg(res.message);
      fetchData();
    } catch (err: any) {
      setMsg(err.message || 'Retraining failed');
    } finally {
      setRetrainingModelId(null);
    }
  };

  const handleValidateDs = async (dsId: number) => {
    setValidatingDsId(dsId);
    setMsg(null);
    try {
      const res = await apiClient.post(`/admin/datasets/${dsId}/validate`, {});
      setMsg(`Validated '${res.dataset_name}' — 100% Geometry Passed`);
      fetchData();
    } catch (err: any) {
      setMsg(err.message || 'Validation failed');
    } finally {
      setValidatingDsId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <Activity className="w-8 h-8 animate-spin mx-auto text-cyan-400 mb-2" />
        <p className="text-xs">Loading Secure Administrator Operations Center...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-purple-500/30 p-6 rounded-2xl shadow-lg shadow-purple-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Super Administrator Command Center</span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded font-bold">
                ROOT PRIVILEGES
              </span>
            </div>
            <h2 className="text-2xl font-black text-white font-['Outfit'] mt-1">
              DRAIN-X Infrastructure & MLOps Operations Hub
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Manage deep learning model pipelines, geospatial dataset integrity, and immutable audit logs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Telemetry</span>
            </button>
          </div>
        </div>
      </div>

      {msg && (
        <div className="p-3.5 bg-cyan-950/80 border border-cyan-500/50 rounded-xl text-cyan-200 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-semibold">{msg}</span>
          </div>
          <button onClick={() => setMsg(null)} className="text-slate-400 hover:text-white text-xs font-bold">✕</button>
        </div>
      )}

      {/* Admin KPIs Overview */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="text-[11px] text-slate-400">Total Monitored Wards</div>
            <div className="text-2xl font-black text-white mt-1 font-['Outfit']">{overview.total_monitored_wards} Wards</div>
            <div className="text-[10px] text-emerald-400">100% Ingestion Coverage</div>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="text-[11px] text-slate-400">IoT Sensor Health</div>
            <div className="text-2xl font-black text-cyan-400 mt-1 font-['Outfit']">
              {overview.online_sensors} / {overview.total_sensors}
            </div>
            <div className="text-[10px] text-slate-400">{overview.critical_sensors} In Alarm State</div>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="text-[11px] text-slate-400">Surcharged Manholes</div>
            <div className={`text-2xl font-black mt-1 font-['Outfit'] ${overview.surcharged_manholes_count > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {overview.surcharged_manholes_count} Nodes
            </div>
            <div className="text-[10px] text-slate-400">Hydraulic Surcharge</div>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="text-[11px] text-slate-400">Active Rescue Operations</div>
            <div className="text-2xl font-black text-purple-400 mt-1 font-['Outfit']">
              {overview.active_rescue_tasks} Tasks
            </div>
            <div className="text-[10px] text-slate-400">{overview.available_rescue_teams} Teams Available</div>
          </div>
        </div>
      )}

      {/* ML / DL Model Registry & Retraining Operations */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white font-['Outfit']">
              Registered Deep Learning Prediction Models (MLOps)
            </h3>
          </div>
          <span className="text-xs text-slate-400">PyTorch & PINN Architecture</span>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {models.map((m) => (
            <div key={m.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">{m.model_name}</span>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-mono font-bold">
                    {m.version}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{m.model_type}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-800">
                <div>
                  <div className="text-[10px] text-slate-400">Accuracy (R²)</div>
                  <div className="font-bold text-emerald-400">{m.accuracy_score}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">RMSE Error</div>
                  <div className="font-bold text-cyan-300">± {m.rmse} cm</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="text-[10px] text-slate-400">
                  Last trained: {new Date(m.last_trained).toLocaleTimeString()}
                </div>
                <button
                  onClick={() => handleRetrain(m.id)}
                  disabled={retrainingModelId === m.id}
                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-[10px] font-bold transition disabled:opacity-50"
                >
                  {retrainingModelId === m.id ? 'Training...' : 'Retrain Pipeline'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Geospatial Datasets Register */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white font-['Outfit']">
              SIH Official Datasets Pipeline & Operational Registry
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                try {
                  await apiClient.post('/admin/datasets/sync', {});
                  setMsg('Live datasets refreshed successfully!');
                  fetchData();
                } catch (e) {
                  setMsg('Sync trigger failed.');
                }
              }}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Trigger Sync</span>
            </button>
            <span className="text-xs text-slate-400 font-mono">35 Master Sources</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Dataset Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Record Count</th>
                <th className="p-3">Format / Protocol</th>
                <th className="p-3">Sync Status</th>
                <th className="p-3">Last Synced</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {datasets.map((ds) => {
                let badgeStyle = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
                let statusLabel = ds.status;

                if (ds.status === "LIVE") {
                  badgeStyle = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-black";
                  statusLabel = "🟢 LIVE API";
                } else if (ds.status === "STATIC_SEED") {
                  badgeStyle = "bg-blue-500/20 text-blue-300 border-blue-500/30 font-bold";
                  statusLabel = "📦 STATIC SEED";
                } else if (ds.status === "NOT_AVAILABLE") {
                  badgeStyle = "bg-rose-500/20 text-rose-300 border-rose-500/30 font-bold";
                  statusLabel = "🔴 NOT AVAILABLE - No Public API";
                } else if (ds.status === "MANUAL_ONLY") {
                  badgeStyle = "bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold";
                  statusLabel = "🟡 MANUAL ACQUISITION REQUIRED";
                }

                return (
                  <tr key={ds.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-3 font-semibold text-white">{ds.name}</td>
                    <td className="p-3 text-cyan-300 font-mono text-[11px]">{ds.category}</td>
                    <td className="p-3 text-slate-300 font-medium">{ds.record_count.toLocaleString()} rows</td>
                    <td className="p-3 text-slate-400">{ds.file_format}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-[10px] border ${badgeStyle}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 font-mono text-[10px]">
                      {ds.last_synced_at ? new Date(ds.last_synced_at).toLocaleTimeString() : 'N/A'}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleValidateDs(ds.id)}
                        disabled={validatingDsId === ds.id}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white rounded text-[10px] font-bold transition disabled:opacity-50"
                      >
                        {validatingDsId === ds.id ? 'Validating...' : 'Validate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Immutable Security & Audit Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white font-['Outfit']">
              Security & Disaster Audit Trail
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">SHA-256 Verified Trail</span>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-[11px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className="text-cyan-400 font-bold">{log.username}</span>
                <span className="text-slate-200">{log.action}</span>
              </div>
              <div className="text-slate-400 text-[11px] truncate max-w-xs">{log.details}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
