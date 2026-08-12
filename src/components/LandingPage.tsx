import React from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onEnterStudio: () => void;
  onExploreSignal: () => void;
  onOpenDiagnostic: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterStudio,
  onExploreSignal,
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="flex-1 flex flex-col items-center justify-center min-h-[80vh] relative z-10 px-4"
    >
      <div className="text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 font-display tracking-widest mb-6">
            NEXUS
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-light text-cyan-400 tracking-[0.2em] uppercase mb-8">
            From Imagination To Playable Worlds.
          </h2>
          <p className="text-slate-400 text-lg md:text-xl font-sans max-w-2xl mx-auto leading-relaxed mb-12">
            NEXUS transforms natural-language ideas into interactive game universes. Describe your vision, and our multi-agent architecture will construct the lore, mechanics, and executable environment.
          </p>
        </motion.div>

        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <button
            onClick={onEnterStudio}
            className="group relative px-8 py-4 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-mono font-bold tracking-widest rounded-xl hover:from-cyan-500 hover:to-cyan-400 transition-all shadow-[0_0_40px_-10px_rgba(6,182,212,0.5)] hover:shadow-[0_0_60px_-10px_rgba(6,182,212,0.7)] flex items-center space-x-3 overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative z-10">ENTER THE UNIVERSE</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onExploreSignal}
            className="group px-8 py-4 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white font-mono font-bold tracking-widest rounded-xl border border-slate-700 hover:border-slate-500 transition-all flex items-center space-x-3 backdrop-blur-md cursor-pointer"
          >
            <Play className="w-5 h-5 text-cyan-500 group-hover:text-cyan-400 transition-colors" />
            <span>EXPLORE THE DEMO</span>
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};
