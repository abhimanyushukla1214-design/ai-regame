import React from 'react';
import { motion } from 'motion/react';
import { UniverseState } from '../types/universe.js';
import { Globe, X, Trophy, Map, Clock, Activity, History, Zap } from 'lucide-react';
import { useState } from 'react';

interface UniverseViewProps {
  universe: UniverseState;
  onClose: () => void;
}

export const UniverseView: React.FC<UniverseViewProps> = ({ universe, onClose }) => {
  const [evolving, setEvolving] = useState(false);
  
  const handleEvolve = async () => {
    setEvolving(true);
    try {
      const res = await fetch('/api/nexus/evolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ universeState: universe, feedback: { rating: 'JUST_RIGHT', tags: [], comments: 'Auto-evolution triggered' } })
      });
      const data = await res.json();
      if (data.success) {
         console.log('Evolution proposal:', data.data.evolution);
         alert('Evolution Proposal Generated: ' + JSON.stringify(data.data.evolution.suggestedChanges));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEvolving(false);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[60] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 overflow-y-auto"
    >
      <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-700 rounded-xl p-8 shadow-2xl flex flex-col max-h-full">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center space-x-4 mb-8">
          <Globe className="w-8 h-8 text-cyan-400" />
          <div>
            <h2 className="text-2xl font-display font-black tracking-widest uppercase text-white">Universe Data</h2>
            <p className="text-cyan-400 font-mono text-sm uppercase tracking-wider">Version {universe.version} | ID: {universe.universeId}</p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mb-6">
           <button onClick={handleEvolve} disabled={evolving} className="flex items-center space-x-2 px-4 py-2 bg-purple-900/40 border border-purple-700/50 hover:bg-purple-800/60 rounded text-purple-300 font-mono text-sm transition-colors">
              <Zap className="w-4 h-4" />
              <span>{evolving ? 'ANALYZING...' : 'AI EVOLUTION'}</span>
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-2">
          
          {/* Player Progress */}
          <div className="bg-slate-800/50 border border-slate-700/50 p-5 rounded-lg">
            <div className="flex items-center space-x-2 mb-4">
              <Trophy className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest">Player Progress</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500 text-sm">Score</span>
                <span className="text-white font-mono">{universe.playerState.score}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 text-sm">Objectives Completed</span>
                <span className="text-white font-mono">{universe.playerState.completedObjectives.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 text-sm">Items Collected</span>
                <span className="text-white font-mono">{universe.playerState.statistics.itemsCollected}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 text-sm">Total Playtime</span>
                <span className="text-white font-mono">{Math.floor(universe.playerState.statistics.playTimeSeconds / 60)}m {universe.playerState.statistics.playTimeSeconds % 60}s</span>
              </div>
            </div>
          </div>

          {/* World Data */}
          <div className="bg-slate-800/50 border border-slate-700/50 p-5 rounded-lg">
            <div className="flex items-center space-x-2 mb-4">
              <Map className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest">World State</h3>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-slate-500 text-sm block mb-1">Discovered Areas</span>
                <div className="flex flex-wrap gap-2">
                  {universe.worldState.discoveredLocations.map((loc, i) => (
                    <span key={i} className="text-xs bg-slate-700 text-indigo-200 px-2 py-1 rounded">{loc}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Evolution History */}
          <div className="bg-slate-800/50 border border-slate-700/50 p-5 rounded-lg md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <History className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest">Evolution History</h3>
            </div>
            <div className="space-y-4">
              {universe.evolutionHistory.slice().reverse().map((entry, i) => (
                <div key={i} className="border-l-2 border-purple-500/30 pl-4 py-1">
                  <div className="flex items-baseline space-x-3 mb-1">
                    <span className="text-purple-400 font-mono text-sm">v{entry.version}</span>
                    <span className="text-slate-500 text-xs">{new Date(entry.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="text-slate-300 text-sm mb-2">{entry.triggerEvent}</div>
                  <ul className="list-disc list-inside text-slate-400 text-xs space-y-1">
                    {entry.changes.map((change, j) => (
                      <li key={j}>{change}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};
