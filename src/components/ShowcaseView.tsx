import React from 'react';
import { ArrowLeft, Clock, Radio } from 'lucide-react';
import { motion } from 'motion/react';

interface ShowcaseViewProps {
  onBackToLanding: () => void;
  onEnterStudio: () => void;
  onOpenDiagnostic: () => void;
}

export const ShowcaseView: React.FC<ShowcaseViewProps> = ({ onBackToLanding }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 min-h-[80vh]"
    >
      <div className="absolute top-6 left-6">
        <button
          onClick={onBackToLanding}
          className="flex items-center space-x-2 text-slate-400 hover:text-white font-mono text-xs tracking-wider transition-colors cursor-pointer px-4 py-2 rounded-lg hover:bg-slate-900/50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO NEXUS</span>
        </button>
      </div>

      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="inline-flex items-center justify-center space-x-3 px-4 py-2 rounded-full bg-cyan-950/30 border border-cyan-900/50 text-cyan-500 font-mono text-xs">
          <Radio className="w-4 h-4 animate-pulse" />
          <span>INCOMING TRANSMISSION</span>
        </div>
        
        <h2 className="text-4xl sm:text-5xl font-black text-white font-display tracking-wide">
          THE LAST SIGNAL
        </h2>
        
        <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-20" />
          
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500">
              <Clock className="w-8 h-8" />
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-slate-200 mb-4 font-display">
            Showcase Universe Disconnected
          </h3>
          
          <p className="text-slate-400 leading-relaxed font-sans mb-6">
            The flagship demonstration universe, <span className="text-slate-300 font-semibold">The Last Signal</span>, is currently undergoing atmospheric stabilization. This interactive environment will be connected in a later phase of the NEXUS engine rollout.
          </p>
          
          <div className="inline-block px-4 py-2 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-slate-500">
            STATUS: AWAITING PHASE 5 ORCHESTRATION
          </div>
        </div>
      </div>
    </motion.div>
  );
};
