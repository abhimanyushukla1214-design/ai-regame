import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Play, HelpCircle, X, Shield, Swords, Zap, Key, Settings } from 'lucide-react';
import { PlayableGameDefinition, GameConfigurationOverrides } from '../types/gameBuilder.js';
import { ComprehensiveGameSpec } from '../types/nexusSpec.js';
import { UniverseState } from '../types/universe.js';
import { UniverseView } from './UniverseView.js';
import { GameConfigurator } from './GameConfigurator.js';

interface PlayViewProps {
  htmlContent: string;
  title: string;
  spec?: ComprehensiveGameSpec;
  definition?: PlayableGameDefinition;
  universe?: UniverseState;
  onBack: () => void;
  onGameEnd?: (result: { win: boolean, score: number }) => void;
}

export const PlayView: React.FC<PlayViewProps> = ({ htmlContent, title, spec, definition, universe, onBack, onGameEnd }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showConfigurator, setShowConfigurator] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showUniverse, setShowUniverse] = useState(false);
  const [key, setKey] = useState(0);

  const [gameState, setGameState] = useState({ state: 'PLAYING', hp: 100, maxHp: 100, score: 0 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // ... (rest of the component)

  // Derive exact application state for HUD display and system visibility
  const getAppState = (): string => {
    if (showExitConfirm) return 'PAUSED';
    if (isGameOver) return 'GAME_OVER';
    if (isVictory) return 'RESULT';
    if (showConfigurator) return 'CONFIG';
    if (showInstructions) return 'GAME_INTRO';
    return 'PLAYING';
  };
  const activeAppState = getAppState();

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'GAME_STATE') {
        const payload = e.data.payload;
        if (payload) {
          setGameState(prev => ({
            ...prev,
            hp: payload.hp !== undefined ? payload.hp : prev.hp,
            score: payload.score !== undefined ? payload.score : prev.score
          }));
        }
      } else if (e.data?.type === 'GAME_OVER') {
        const win = e.data.payload?.win;
        const score = e.data.payload?.score ?? gameState.score;
        if (win) {
          setIsVictory(true);
          if (onGameEnd) onGameEnd({ win: true, score });
        } else {
          setIsGameOver(true);
          if (onGameEnd) onGameEnd({ win: false, score });
        }
      } else if (e.data?.type === 'HOME') {
        onBack();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onGameEnd, gameState.score]);

  useEffect(() => {
    if (isPlaying && iframeRef.current?.contentWindow) {
      if (showInstructions) {
        iframeRef.current.contentWindow.postMessage({ type: 'PAUSE' }, '*');
      } else {
        iframeRef.current.contentWindow.postMessage({ type: 'RESUME' }, '*');
      }
    }
  }, [showInstructions, isPlaying, key]);

  useEffect(() => {
    if (activeAppState !== 'PLAYING' || !isPlaying) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling or browser defaults for gameplay keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', ' ', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key) || 
          ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'KEY_EVENT',
          subtype: 'keydown',
          code: e.code,
          key: e.key
        }, '*');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', ' ', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key) || 
          ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'KEY_EVENT',
          subtype: 'keyup',
          code: e.code,
          key: e.key
        }, '*');
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp, { passive: false });

    // Focus iframe immediately on transition to PLAYING state
    const timer = setTimeout(() => {
      iframeRef.current?.focus();
    }, 150);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearTimeout(timer);
    };
  }, [activeAppState, isPlaying]);

  const handleRestart = () => {
    setKey(prev => prev + 1);
    setIsPlaying(true);
    setShowInstructions(false);
    setIsGameOver(false);
    setIsVictory(false);
    setGameState({ state: 'PLAYING', hp: 100, maxHp: 100, score: 0 });
  };

  const renderMiniMap = () => {
    if (!spec) return null;
    const isRacing = htmlContent.includes('RACING');
    const isTopDown = htmlContent.includes('TOP_DOWN');
    return (
      <div className="w-full bg-slate-950 border border-cyan-900 rounded p-4 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.4) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        <h3 className="text-[10px] font-mono text-cyan-500 mb-4 uppercase tracking-widest relative z-10">Map Topology</h3>
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 relative z-10">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-900/50 -translate-y-1/2" />
          <div className="relative bg-slate-800 px-3 py-1.5 rounded text-cyan-300 border border-slate-700 shadow-[0_0_10px_rgba(6,182,212,0.3)]">START</div>
          <div className="relative w-2 h-2 rounded-full bg-cyan-700 shadow-[0_0_5px_rgba(6,182,212,0.5)]" />
          <div className="relative w-2 h-2 rounded-full bg-cyan-700 shadow-[0_0_5px_rgba(6,182,212,0.5)]" />
          <div className="relative bg-slate-800 px-3 py-1.5 rounded text-emerald-400 border border-emerald-900 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
            {isRacing ? 'FINISH LINE' : (isTopDown ? 'CORE' : 'PORTAL')}
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col bg-slate-950"
    >
      <header className="h-14 border-b border-cyan-900/50 bg-slate-900 flex items-center justify-between px-6 z-30">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowExitConfirm(true)}
            className="text-slate-400 hover:text-white transition-colors text-sm font-mono flex items-center space-x-2"
          >
            <span>←</span>
            <span>HOME</span>
          </button>
          <div className="w-px h-4 bg-slate-700" />
          <h1 className="text-lg font-black tracking-widest text-white font-display uppercase">{title}</h1>
          <div className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest border transition-all duration-300 ${
            activeAppState === 'PLAYING' ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.2)]' :
            activeAppState === 'GAME_INTRO' ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.2)]' :
            activeAppState === 'PAUSED' ? 'bg-amber-950/40 border-amber-500/50 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.2)]' :
            activeAppState === 'GAME_OVER' ? 'bg-rose-950/40 border-rose-500/50 text-rose-400 shadow-[0_0_8px_rgba(239,68,68,0.2)]' :
            'bg-purple-950/40 border-purple-500/50 text-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.2)]' // RESULT
          }`}>
            {activeAppState}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {isPlaying && !showInstructions && (
            <button
              onClick={() => setShowInstructions(true)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors text-xs font-mono"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>CONTROLS</span>
            </button>
          )}
          {universe && (
            <button
              onClick={() => setShowUniverse(true)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-800 hover:border-cyan-600 text-cyan-300 hover:text-white transition-colors text-xs font-mono"
            >
              <span>UNIVERSE ({universe.version})</span>
            </button>
          )}
          <button
            onClick={handleRestart}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors text-xs font-mono"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESTART</span>
          </button>
        </div>
      </header>

      <main className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        <AnimatePresence>
          {showInstructions && spec && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 overflow-y-auto"
            >
              <div className="relative max-w-3xl w-full bg-slate-900/90 border border-cyan-900/60 rounded-xl p-8 shadow-2xl shadow-cyan-950/50">
                {isPlaying && (
                  <button 
                    onClick={() => setShowInstructions(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
                
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-display font-black tracking-widest uppercase text-white mb-2">{title}</h2>
                  <p className="text-cyan-400 font-mono text-sm uppercase tracking-wider">{spec.story.logline}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-800/50 p-4 rounded border border-slate-700">
                    <h3 className="text-[10px] font-mono text-cyan-500 mb-1 uppercase tracking-widest flex items-center gap-1"><Shield className="w-3 h-3"/> PLAYER</h3>
                    <div className="text-slate-200 text-sm font-semibold">{spec.character.protagonist.role}</div>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded border border-slate-700">
                    <h3 className="text-[10px] font-mono text-rose-500 mb-1 uppercase tracking-widest flex items-center gap-1"><Swords className="w-3 h-3"/> HAZARD</h3>
                    <div className="text-slate-200 text-sm font-semibold">{spec.character.antagonistOrHazard.name}</div>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded border border-slate-700">
                    <h3 className="text-[10px] font-mono text-emerald-500 mb-1 uppercase tracking-widest flex items-center gap-1"><Key className="w-3 h-3"/> OBJECTIVE</h3>
                    <div className="text-slate-200 text-sm font-semibold">{spec.gameplay.winCondition}</div>
                  </div>
                </div>

                {renderMiniMap()}

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xs font-mono text-slate-500 mb-2 uppercase tracking-widest">Controls</h3>
                    <ul className="space-y-2">
                      {spec.gameplay.controls.map((ctrl, i) => (
                        <li key={i} className="flex items-center text-sm">
                          <span className="inline-block px-2 py-1 bg-slate-800 rounded text-cyan-300 font-mono text-xs mr-3 min-w-[40px] text-center border border-slate-700">{ctrl.key}</span>
                          <span className="text-slate-300">{ctrl.action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xs font-mono text-slate-500 mb-2 uppercase tracking-widest">System</h3>
                    <p className="text-slate-300 text-sm leading-relaxed mb-4">
                      {spec.gameplay.primaryMechanics[0]} • {spec.world.settingName}
                    </p>
                    <h3 className="text-xs font-mono text-slate-500 mb-2 uppercase tracking-widest">Engine</h3>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-slate-800 text-slate-400 text-[10px] font-mono rounded">Delta Time Physics</span>
                      <span className="px-2 py-1 bg-slate-800 text-slate-400 text-[10px] font-mono rounded">Parallax</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <button 
                    onClick={() => { setIsPlaying(true); setShowInstructions(false); }}
                    className="group relative px-10 py-3 bg-cyan-950 border border-cyan-500 hover:bg-cyan-900 rounded flex items-center space-x-3 overflow-hidden transition-all"
                  >
                    <Play className="w-5 h-5 text-cyan-400 relative z-10" />
                    <span className="font-mono text-cyan-50 tracking-widest text-sm relative z-10 font-bold">{isPlaying ? 'RESUME' : 'START MISSION'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {(!isPlaying && (!showInstructions || !spec)) ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm z-10">
            <button
              onClick={() => setIsPlaying(true)}
              className="w-24 h-24 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center shadow-lg shadow-cyan-900/50 hover:scale-105 transition-all"
            >
              <Play className="w-10 h-10 ml-2" />
            </button>
            <p className="mt-6 font-mono text-cyan-400 text-sm tracking-widest uppercase">Launch Sandbox</p>
          </div>
        ) : null}

        {isPlaying && (
          <iframe
            ref={iframeRef}
            key={key}
            srcDoc={htmlContent}
            title="NEXUS Sandbox"
            sandbox="allow-scripts"
            className="w-full h-full border-none outline-none focus:outline-none"
            style={{ width: '100%', height: '100%' }}
          />
        )}
      </main>

      <AnimatePresence>
        {(isGameOver || isVictory) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-40 flex items-center justify-center bg-black/90 backdrop-blur-md"
          >
            <div className="bg-slate-900 border border-slate-700 p-10 rounded-xl max-w-md w-full text-center shadow-2xl">
              <h2 className={`text-4xl font-display font-black mb-4 uppercase tracking-widest ${isVictory ? 'text-emerald-400' : 'text-rose-500'}`}>
                {isVictory ? 'MISSION COMPLETE' : 'GAME OVER'}
              </h2>
              <div className="text-white text-2xl font-mono mb-8">SCORE: {gameState.score}</div>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={onBack}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-sm rounded transition-colors"
                >
                  HOME
                </button>
                <button
                  onClick={() => { setIsGameOver(false); setIsVictory(false); handleRestart(); }}
                  className="px-6 py-3 bg-cyan-900/50 hover:bg-cyan-800 text-cyan-300 border border-cyan-800 font-mono text-sm rounded transition-colors"
                >
                  PLAY AGAIN
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUniverse && universe && (
          <UniverseView universe={universe} onClose={() => setShowUniverse(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <div className="bg-slate-900 border border-slate-700 p-8 rounded-xl max-w-md w-full text-center shadow-2xl">
              <h2 className="text-xl font-display font-bold text-white mb-4 uppercase tracking-widest">Return to NEXUS Home?</h2>
              <p className="text-slate-400 font-mono text-sm mb-8">
                Your current game session will be exited.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-sm rounded transition-colors"
                >
                  CANCEL
                </button>
                <button
                  onClick={onBack}
                  className="px-6 py-2 bg-cyan-900/50 hover:bg-cyan-800 text-cyan-300 border border-cyan-800 font-mono text-sm rounded transition-colors"
                >
                  CONFIRM
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
