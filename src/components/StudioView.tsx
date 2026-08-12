import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Lock, Loader2, CheckCircle2, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { nexusApi } from '../services/apiClient.js';
import { GameDirectorPlan, DesignTask } from '../types/nexus.js';
import { PlayView } from './PlayView.js';
import { Gamepad2 } from 'lucide-react';
import { ComprehensiveGameSpec } from '../types/nexusSpec.js';

interface StudioViewProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  plan: GameDirectorPlan | null;
  setPlan: (plan: GameDirectorPlan | null) => void;
  currentStageIndex: number;
  setCurrentStageIndex: React.Dispatch<React.SetStateAction<number>>;
  spec: ComprehensiveGameSpec | null;
  setSpec: (spec: ComprehensiveGameSpec | null) => void;
  gameVersions: Array<{ version: number, spec: ComprehensiveGameSpec, html: string, changes: any[], feedback: string }>;
  setGameVersions: (versions: Array<{ version: number, spec: ComprehensiveGameSpec, html: string, changes: any[], feedback: string }>) => void;
  onBackToLanding: () => void;
  onOpenDiagnostic: () => void;
  onPlayGame: (html: string, title: string, spec: ComprehensiveGameSpec) => void;
}

export const StudioView: React.FC<StudioViewProps> = ({
  prompt,
  setPrompt,
  plan,
  setPlan,
  currentStageIndex,
  setCurrentStageIndex,
  spec,
  setSpec,
  gameVersions,
  setGameVersions,
  onBackToLanding,
  onOpenDiagnostic,
  onPlayGame
}) => {
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingSpec, setIsGeneratingSpec] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  
  // Phase 8 Evolution State
  const [evolutionFeedback, setEvolutionFeedback] = useState("");
  const [isEvolving, setIsEvolving] = useState(false);
  const [evolutionError, setEvolutionError] = useState<string | null>(null);

  // Prompt Architect tab state
  const [activeTab, setActiveTab] = useState<'domains' | 'prompt'>('domains');
  const [copied, setCopied] = useState(false);

  const handleCopyPrompt = () => {
    if (plan?.expandedPrompt) {
      navigator.clipboard.writeText(plan.expandedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };




  const handleEvolve = async () => {
    if (!evolutionFeedback.trim() || !spec) return;
    
    setIsEvolving(true);
    setEvolutionError(null);
    try {
      const res = await nexusApi.evolveGame({ currentSpec: spec, feedback: evolutionFeedback });
      if (!res.success || !res.data) throw new Error(res.error?.message || 'Evolution failed');
      
      const data = res.data;
      const newVersion = {
        version: gameVersions.length + 1,
        spec: data.updatedSpec,
        html: data.html,
        changes: data.changes,
        feedback: evolutionFeedback
      };
      
      setGameVersions([newVersion, ...gameVersions]);
      setSpec(data.updatedSpec);
      onPlayGame(data.html, data.updatedSpec.title, data.updatedSpec);
      setEvolutionFeedback("");
    } catch (e: any) {
      console.error("Evolution error:", e);
      setEvolutionError(e.message || "Evolution could not be completed. Your current game is unchanged.");
    } finally {
      setIsEvolving(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsOrchestrating(true);
    setError(null);
    setPlan(null);
    setSpec(null);
    setCurrentStageIndex(0);

    try {
      // Start fake progress for animation
      const interval = setInterval(() => {
        setCurrentStageIndex(prev => (prev < 6 ? prev + 1 : prev));
      }, 1500);

      const res = await nexusApi.orchestrateUniverse({ userPrompt: prompt });
      
      clearInterval(interval);
      setCurrentStageIndex(7); // Done
      
      if (res.success && res.data) {
        setPlan(res.data);
      } else {
        setError(res.error?.message || 'Orchestration failed.');
      }
    } catch (e) {
      setError('An unexpected error occurred during orchestration.');
    } finally {
      setIsOrchestrating(false);
    }
  };

  const stages = [
    'Analyzing intent',
    'World architecture',
    'Narrative structure',
    'Character design',
    'Gameplay systems',
    'Physics model',
    'Cinematic direction',
    'DESIGN PLAN READY'
  ];

  const renderDomainCard = (title: string, task: DesignTask) => (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h4>
        <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full border ${
          task.priority === 'high' ? 'border-amber-500/50 text-amber-400 bg-amber-500/10' :
          task.priority === 'medium' ? 'border-cyan-500/50 text-cyan-400 bg-cyan-500/10' :
          'border-slate-500/50 text-slate-400 bg-slate-500/10'
        }`}>
          {task.priority} Priority
        </span>
      </div>
      <p className="text-xs text-slate-300 mb-4">{task.objective}</p>
      <div className="space-y-2">
        <div>
          <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">Expected Outputs</span>
          <div className="flex flex-wrap gap-1.5">
            {task.expectedOutputs.map((out, i) => (
              <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded-md">{out}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  
  const handleGenerateSpec = async () => {
    if (!plan) return;
    setIsGeneratingSpec(true);
    setError(null);
    try {
      const res = await nexusApi.generateSpec({ plan });
      if (res.success && res.data) {
        setSpec(res.data);
      } else {
        setError(res.error?.message || 'Specification generation failed.');
      }
    } catch (e) {
      setError('An unexpected error occurred during specification generation.');
    } finally {
      setIsGeneratingSpec(false);
    }
  };

  
  const handleBuildGame = async () => {
    if (!spec) return;
    setIsBuilding(true);
    setError(null);
    try {
      const res = await nexusApi.buildGame({ spec });
      if (res.success && res.data && res.data.html) {
        onPlayGame(res.data.html, spec.title, spec);
      } else {
        setError(res.error?.message || 'Game build failed.');
      }
    } catch (e) {
      setError('An unexpected error occurred during game build.');
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex-1 flex flex-col p-6 max-w-5xl mx-auto w-full relative z-10"
    >
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={onBackToLanding}
          className="flex items-center space-x-2 text-slate-400 hover:text-white font-mono text-xs tracking-wider transition-colors cursor-pointer px-4 py-2 rounded-lg hover:bg-slate-900/50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO NEXUS</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start">
        <div className="w-full max-w-4xl space-y-8">
          
          {!plan && !isOrchestrating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-black text-white font-display">
                CREATE A NEW UNIVERSE
              </h2>
              <p className="text-slate-400 font-sans">
                Define the rules, lore, and aesthetics of your reality.
              </p>
            </motion.div>
          )}

          {!plan && (
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-2xl">
              <div className="space-y-6">
                <div className="relative">
                  <div className="absolute top-4 left-4 text-slate-500">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isOrchestrating}
                    className="w-full h-32 bg-slate-950/80 border border-slate-800 rounded-xl p-4 pl-12 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-sans resize-none disabled:opacity-50"
                    placeholder="Describe the world you want to create..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs font-mono text-slate-500 flex items-center space-x-2">
                    <Lock className="w-4 h-4" />
                    <span>MVP Phase 4: Intent & Design Plan</span>
                  </div>
                  
                  <button
                    onClick={handleGenerate}
                    disabled={isOrchestrating || !prompt.trim()}
                    className="w-full sm:w-auto px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold tracking-widest rounded-xl transition-all shadow-lg shadow-cyan-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isOrchestrating ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>ORCHESTRATE</span>}
                  </button>
                </div>

                {error && (
                  <div className="p-4 bg-rose-950/50 border border-rose-900/50 rounded-lg text-rose-400 text-sm">
                    {error}
                  </div>
                )}
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {isOrchestrating && (
              <motion.div 
                key="orchestrating"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col items-center justify-center py-12 space-y-6"
              >
                <div className="text-sm font-mono text-cyan-400 mb-4 animate-pulse">NEXUS DIRECTOR</div>
                <div className="flex flex-col items-center space-y-3 relative">
                   <div className="absolute top-0 bottom-0 w-px bg-slate-800 -z-10" />
                   {stages.map((stage, idx) => {
                     const isPast = idx < currentStageIndex;
                     const isCurrent = idx === currentStageIndex;
                     
                     if (idx > currentStageIndex + 1) return null; // reveal slowly

                     return (
                       <motion.div 
                         key={stage}
                         initial={{ opacity: 0, y: -10 }}
                         animate={{ opacity: 1, y: 0 }}
                         className={`flex items-center space-x-3 bg-slate-950 px-4 py-2 rounded-full border ${isCurrent ? 'border-cyan-500/50 text-cyan-300' : isPast ? 'border-slate-800 text-slate-500' : 'border-slate-800/50 text-slate-700'}`}
                       >
                         {isPast ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : isCurrent ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-700" />}
                         <span className="text-xs font-mono uppercase tracking-wider">{stage}</span>
                       </motion.div>
                     );
                   })}
                </div>
              </motion.div>
            )}

            {plan && !isOrchestrating && (
              <motion.div 
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-white font-display">STRUCTURED DESIGN PLAN</h2>
                    <p className="text-xs text-slate-400 font-mono mt-1">ID: {plan.requestId}</p>
                  </div>
                  <button onClick={() => { setPlan(null); setSpec(null); }} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-mono transition-colors">
                    NEW PLAN
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 space-y-6">
                    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
                      <h3 className="text-xs font-mono text-cyan-400 mb-4 tracking-widest uppercase">Extracted Intent</h3>
                      <div className="space-y-4 text-sm">
                        <div><span className="text-slate-500 block text-xs">Summary</span><span className="text-slate-200">{plan.intent.summary}</span></div>
                        <div><span className="text-slate-500 block text-xs">Setting</span><span className="text-slate-200">{plan.intent.setting}</span></div>
                        <div><span className="text-slate-500 block text-xs">Player Role</span><span className="text-slate-200">{plan.intent.playerRole}</span></div>
                        <div><span className="text-slate-500 block text-xs">Camera</span><span className="text-slate-200">{plan.intent.cameraPerspective}</span></div>
                        
                        <div className="pt-2">
                          <span className="text-slate-500 block text-xs mb-1">Genres</span>
                          <div className="flex flex-wrap gap-1">{plan.intent.genre.map(g => <span key={g} className="text-[10px] bg-slate-800 px-2 py-1 rounded">{g}</span>)}</div>
                        </div>
                        <div className="pt-2">
                          <span className="text-slate-500 block text-xs mb-1">Atmosphere</span>
                          <div className="flex flex-wrap gap-1">{plan.intent.atmosphere.map(a => <span key={a} className="text-[10px] bg-slate-800 px-2 py-1 rounded">{a}</span>)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
                      <h3 className="text-xs font-mono text-amber-400 mb-3 tracking-widest uppercase">Explicit Constraints</h3>
                      {plan.constraints.length > 0 ? (
                        <ul className="list-disc pl-4 space-y-1 text-xs text-slate-300">
                          {plan.constraints.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      ) : <span className="text-xs text-slate-500">None explicitly requested.</span>}
                      
                      <h3 className="text-xs font-mono text-purple-400 mb-3 mt-6 tracking-widest uppercase">Director Assumptions</h3>
                      {plan.assumptions.length > 0 ? (
                        <ul className="list-disc pl-4 space-y-1 text-xs text-slate-300">
                          {plan.assumptions.map((a, i) => <li key={i}>{a}</li>)}
                        </ul>
                      ) : <span className="text-xs text-slate-500">None inferred.</span>}
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <div className="flex border-b border-slate-800">
                      <button
                        onClick={() => setActiveTab('domains')}
                        className={`px-4 py-2.5 font-mono text-xs tracking-wider border-b-2 font-bold transition-all duration-200 cursor-pointer ${
                          activeTab === 'domains'
                            ? 'border-cyan-500 text-cyan-400'
                            : 'border-transparent text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        DESIGN DOMAINS
                      </button>
                      <button
                        onClick={() => setActiveTab('prompt')}
                        className={`px-4 py-2.5 font-mono text-xs tracking-wider border-b-2 font-bold transition-all duration-200 cursor-pointer flex items-center space-x-1.5 ${
                          activeTab === 'prompt'
                            ? 'border-cyan-500 text-cyan-400'
                            : 'border-transparent text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>PROMPT BLUEPRINT</span>
                      </button>
                    </div>

                    {activeTab === 'domains' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {renderDomainCard('World', plan.designDomains.world)}
                        {renderDomainCard('Story', plan.designDomains.story)}
                        {renderDomainCard('Character', plan.designDomains.character)}
                        {renderDomainCard('Gameplay', plan.designDomains.gameplay)}
                        {renderDomainCard('Physics', plan.designDomains.physics)}
                        {renderDomainCard('Cinematography', plan.designDomains.cinematography)}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-slate-400">
                            The engineered 32-section specification prompt generated by the NEXUS Prompt Architect.
                          </p>
                          <button
                            onClick={handleCopyPrompt}
                            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-mono transition-colors cursor-pointer"
                          >
                            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copied ? 'COPIED!' : 'COPY PROMPT'}</span>
                          </button>
                        </div>
                        <div className="p-5 bg-slate-950 border border-slate-800/80 rounded-xl max-h-[450px] overflow-y-auto shadow-inner">
                          <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {plan.expandedPrompt || 'No expanded prompt was generated.'}
                          </pre>
                        </div>
                      </div>
                    )}

                    <div className="mt-8 pt-8 border-t border-slate-800/80 flex flex-col items-center">
                      {!spec ? (
                        <button
                          onClick={handleGenerateSpec}
                          disabled={isGeneratingSpec}
                          className="w-full sm:w-auto px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold tracking-widest rounded-xl transition-all shadow-lg shadow-cyan-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                          {isGeneratingSpec ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>GENERATE GAME SPECIFICATION</span>}
                        </button>
                      ) : (
                        <div className="w-full space-y-6">
                          <h3 className="text-xl font-display font-black text-cyan-400">COMPREHENSIVE GAME SPECIFICATION</h3>
                          <div className="p-4 bg-slate-900/50 border border-cyan-900/50 rounded-xl">
                             <pre className="text-xs font-mono text-cyan-100 overflow-x-auto whitespace-pre-wrap">
                               {JSON.stringify(spec, null, 2)}
                             </pre>
                          </div>

                          <div className="mt-8 pt-8 border-t border-slate-800/80 flex flex-col items-center">
                            <button
                              onClick={handleBuildGame}
                              disabled={isBuilding}
                              className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 flex items-center justify-center space-x-2"
                            >
                              {isBuilding ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Gamepad2 className="w-5 h-5" /><span>COMPILE & PLAY</span></>}
                            </button>
                          </div>
                        </div>

                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

            )}
          </AnimatePresence>

        </div>
      </div>
    </motion.div>
  );
};
