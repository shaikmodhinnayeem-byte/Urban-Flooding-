import React from 'react';
import { Zap, CloudRain, ShieldCheck, Waves, RefreshCw, Activity, ArrowRight } from 'lucide-react';

interface SimulationBarProps {
  onTriggerScenario: (scenario: string) => void;
  isSimulating: boolean;
  currentScenario: string;
}

export const SimulationBar: React.FC<SimulationBarProps> = ({
  onTriggerScenario,
  isSimulating,
  currentScenario,
}) => {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-cyan-500/20 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs shadow-inner">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 px-2.5 py-1 rounded-md font-bold text-[11px]">
          <Activity className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
          <span>REAL-TIME SCENARIO CONTROLLER</span>
        </div>
        <span className="text-slate-400 hidden md:inline text-[11px]">
          Simulate storm cells to watch 2D surface runoff, drainage surcharge & AI nowcasting:
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Normal */}
        <button
          onClick={() => onTriggerScenario('NORMAL')}
          disabled={isSimulating}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium border transition-all ${
            currentScenario === 'NORMAL'
              ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/60 shadow-sm'
              : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Calm (0 mm/h)</span>
        </button>

        {/* Moderate Rain */}
        <button
          onClick={() => onTriggerScenario('MODERATE_RAIN')}
          disabled={isSimulating}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium border transition-all ${
            currentScenario === 'MODERATE_RAIN'
              ? 'bg-blue-600/30 text-blue-300 border-blue-500/60 shadow-sm'
              : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
        >
          <CloudRain className="w-3.5 h-3.5 text-blue-400" />
          <span>Monsoon (28 mm/h)</span>
        </button>

        {/* Severe Cloudburst */}
        <button
          onClick={() => onTriggerScenario('CLOUDBURST_100MM')}
          disabled={isSimulating}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-bold border transition-all ${
            currentScenario === 'CLOUDBURST_100MM'
              ? 'bg-red-600 text-white border-red-400 shadow-md shadow-red-600/30 animate-pulse'
              : 'bg-red-950/80 text-red-300 border-red-700/80 hover:bg-red-900'
          }`}
        >
          <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
          <span>⚡ 115 mm/h Cloudburst</span>
        </button>

        {/* Backflow / Surcharge */}
        <button
          onClick={() => onTriggerScenario('SURCHARGE_BACKFLOW')}
          disabled={isSimulating}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium border transition-all ${
            currentScenario === 'SURCHARGE_BACKFLOW'
              ? 'bg-amber-600/30 text-amber-300 border-amber-500/60 shadow-sm'
              : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
        >
          <Waves className="w-3.5 h-3.5 text-amber-400" />
          <span>Tidal Surcharge</span>
        </button>

        {/* Reset */}
        <button
          onClick={() => onTriggerScenario('RECESSION')}
          disabled={isSimulating}
          className="flex items-center gap-1 px-2 py-1 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700 rounded-md transition"
          title="Simulate pump drainage recession"
        >
          <RefreshCw className={`w-3 h-3 ${isSimulating ? 'animate-spin' : ''}`} />
          <span>Dewater</span>
        </button>
      </div>
    </div>
  );
};
