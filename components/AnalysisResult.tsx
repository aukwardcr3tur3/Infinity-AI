
import React, { useState, useRef, useEffect } from 'react';
import { BiomechanicsAnalysis, AnalysisRecord } from '../types';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Dumbbell, Zap, PlayCircle, AlertTriangle, Cpu, Star, MessageSquare, Volume2, Layers, Activity, PauseCircle, Timer, Gauge, Waves, Printer, Rotate3D, Scan, Swords, Shield, Target, Anchor, Calendar, TrendingUp } from 'lucide-react';
import { updateAnalysisRating } from '../services/dbService';
import { extractSkeletonFromFrame, drawSkeleton, getGhostSkeleton } from '../services/vectorMath';

interface AnalysisResultProps {
  data: BiomechanicsAnalysis;
  recordId?: number;
  videoBlob?: Blob; // Actual video file if available
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ data, recordId, videoBlob }) => {
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGhost, setShowGhost] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [viewAngle, setViewAngle] = useState(0); // 0 = Front, 1.57 = Side
  const [activeDrillAudio, setActiveDrillAudio] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'metrics' | 'schedule'>('metrics');
  const [ghostArchetype, setGhostArchetype] = useState('Standard');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  const chartData = data.muscleGroups.map(mg => ({
    subject: mg.muscle,
    A: mg.score,
    fullMark: 100,
  }));

  // Setup Video Player
  useEffect(() => {
    if (videoBlob && videoRef.current) {
        videoRef.current.src = URL.createObjectURL(videoBlob);
    }
    return () => {
        if (videoRef.current?.src) URL.revokeObjectURL(videoRef.current.src);
        cancelAnimationFrame(animationRef.current);
    };
  }, [videoBlob]);

  // Video Overlay Loop
  const animateOverlay = () => {
    if (!canvasRef.current) return;

    // We can draw the skeleton even if video is paused, to allow rotating view in pause mode
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // Draw Skeleton with 3D Rotation
        if (showSkeleton) {
            const skeleton = extractSkeletonFromFrame(ctx, canvasRef.current.width, canvasRef.current.height);
            drawSkeleton(ctx, skeleton, false, viewAngle);
        }

        // Draw Ghost
        if (showGhost) {
            const ghost = getGhostSkeleton(canvasRef.current.width, canvasRef.current.height, ghostArchetype);
            drawSkeleton(ctx, ghost, true, viewAngle);
        }
    }
    
    // Loop only if playing to update animation phase
    if (isPlaying && videoRef.current && !videoRef.current.paused) {
        animationRef.current = requestAnimationFrame(animateOverlay);
    } else {
        // One-off frame for rotation updates while paused
        animationRef.current = requestAnimationFrame(animateOverlay); 
    }
  };

  useEffect(() => {
      // Trigger animation frame when view angle changes even if paused
      const id = requestAnimationFrame(animateOverlay);
      return () => cancelAnimationFrame(id);
  }, [viewAngle, showSkeleton, showGhost, ghostArchetype]);

  const togglePlay = () => {
    if (videoRef.current) {
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
            // Start the loop
            animationRef.current = requestAnimationFrame(animateOverlay);
        }
        setIsPlaying(!isPlaying);
    }
  };

  const playDrillAudio = (text: string) => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
        setActiveDrillAudio(text);
        utterance.onend = () => setActiveDrillAudio(null);
    }
  };

  const handleFeedbackSubmit = () => {
    if (recordId) {
        updateAnalysisRating(recordId, rating, feedback);
        setSubmitted(true);
    }
  };
  
  const handlePrint = () => {
      window.print();
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-[fadeIn_0.5s_ease-out] pb-20">
      
      {/* Header Summary */}
      <div className="glass-panel p-4 md:p-6 rounded-2xl border-l-4 border-cyan-400 relative">
        <button 
            onClick={handlePrint}
            className="absolute top-4 right-4 p-2 bg-slate-800 text-slate-400 rounded-lg hover:text-white hover:bg-slate-700 transition-colors no-print"
            title="Export to PDF"
        >
            <Printer size={18} />
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
                <div className="flex flex-wrap items-center gap-2 mb-2 pr-10 md:pr-0">
                    <h2 className="text-xl md:text-2xl font-bold text-white uppercase tracking-widest">{data.athleteType} Analysis</h2>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${data.processingMethod?.includes('Vector') ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'bg-purple-500/20 border-purple-500/40 text-purple-300'}`}>
                        {data.processingMethod}
                    </span>
                </div>
                <p className="text-slate-300 font-mono text-xs md:text-sm leading-relaxed max-w-2xl">{data.summary}</p>
            </div>
            <div className="bg-cyan-900/20 px-4 py-2 md:px-6 md:py-3 rounded-lg border border-cyan-500/30 w-full md:w-auto md:min-w-[180px] text-center backdrop-blur-md mt-2 md:mt-0">
                <p className="text-[10px] md:text-xs text-cyan-300 uppercase tracking-widest font-bold mb-1">Projected Gain</p>
                <p className="text-2xl md:text-3xl font-bold text-white font-mono">{data.projectedImprovement}</p>
            </div>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="flex space-x-4 border-b border-white/10 no-print overflow-x-auto">
          <button 
            onClick={() => setActiveTab('metrics')}
            className={`pb-3 text-xs md:text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'metrics' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500 hover:text-white'}`}
          >
              VISUAL TELEMETRY
          </button>
          <button 
            onClick={() => setActiveTab('schedule')}
            className={`pb-3 text-xs md:text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'schedule' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-slate-500 hover:text-white'}`}
          >
              AI TRAINING SCHEDULE
          </button>
      </div>

      {activeTab === 'metrics' ? (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-[fadeIn_0.3s]">
        
        {/* 3D VIDEO PLAYER & OVERLAY */}
        <div className="col-span-1 lg:col-span-2 glass-panel p-1 rounded-2xl overflow-hidden relative group no-print">
            <div className="absolute top-4 left-4 z-20 flex space-x-2">
                <button 
                    onClick={() => setShowSkeleton(!showSkeleton)}
                    className={`p-2 rounded-lg text-xs font-bold border transition-colors ${showSkeleton ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-900/80 border-slate-700 text-slate-500'}`}
                    title="Toggle Skeleton"
                >
                    <Activity size={16} />
                </button>
                <button 
                    onClick={() => setShowGhost(!showGhost)}
                    className={`p-2 rounded-lg text-xs font-bold border transition-colors ${showGhost ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-slate-900/80 border-slate-700 text-slate-500'}`}
                    title="Compare Ideal Form"
                >
                    <Layers size={16} />
                </button>
                {showGhost && (
                    <select 
                        className="bg-slate-900/90 border border-purple-500/50 text-purple-300 text-[10px] rounded-lg px-2 outline-none font-mono"
                        value={ghostArchetype}
                        onChange={(e) => setGhostArchetype(e.target.value)}
                    >
                        <option value="Standard">Standard Model</option>
                        {data.athleteType === 'Boxing' && <option value="Power Boxer">Power Boxer</option>}
                        {data.athleteType === 'Athletics' && <option value="Elite Sprinter">Elite Sprinter</option>}
                    </select>
                )}
            </div>

            {/* View Rotation Controls - Mobile Optimized */}
            <div className="absolute top-4 right-4 z-20 flex flex-col items-center bg-slate-900/80 rounded-lg p-2 border border-slate-700">
                 <div className="flex items-center text-[10px] md:text-xs text-slate-400 mb-1 md:mb-2 font-mono">
                    <Rotate3D size={12} className="mr-1"/> 3D VIEW
                 </div>
                 <input 
                    type="range" 
                    min="-1.5" 
                    max="1.5" 
                    step="0.1" 
                    value={viewAngle}
                    onChange={(e) => setViewAngle(parseFloat(e.target.value))}
                    className="w-20 md:w-32 h-1.5 md:h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    title="Rotate Camera Angle"
                 />
            </div>

            <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
                <video 
                    ref={videoRef} 
                    className="w-full h-full object-contain opacity-70" // Dimmed slightly to show overlay better
                    playsInline
                    loop
                    onEnded={() => setIsPlaying(false)}
                />
                <canvas 
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    width={800}
                    height={450}
                />
                
                {/* Play Button Overlay */}
                {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer" onClick={togglePlay}>
                        <PlayCircle size={64} className="text-cyan-400 opacity-80 hover:opacity-100 transition-opacity" />
                    </div>
                )}
                
                {/* Scanline Effect */}
                <div className="scanline opacity-20"></div>
            </div>

            {/* Metrics Scroll Container */}
            <div className="p-3 md:p-4 flex items-center justify-between bg-slate-900/50">
                <button onClick={togglePlay} className="text-cyan-400 hover:text-white transition-colors mr-3 flex-shrink-0">
                    {isPlaying ? <PauseCircle size={24} /> : <PlayCircle size={24} />}
                </button>
                <div className="flex space-x-4 md:space-x-6 text-xs font-mono text-slate-400 whitespace-nowrap overflow-x-auto pb-1 custom-scrollbar">
                    {data.athleteType === 'Soccer' ? (
                        <>
                            <div className="flex items-center"><Gauge size={14} className="mr-1 text-emerald-500"/> KICK: <span className="text-white ml-1">{data.advancedMetrics?.kickVelocity} km/h</span></div>
                            <div className="flex items-center"><Anchor size={14} className="mr-1 text-cyan-500"/> STABILITY: <span className="text-white ml-1">{data.advancedMetrics?.plantFootStability}%</span></div>
                            <div className="flex items-center"><Target size={14} className="mr-1 text-yellow-500"/> ACC: <span className="text-white ml-1">{data.advancedMetrics?.shotAccuracyProb}%</span></div>
                        </>
                    ) : data.athleteType === 'Swimming' ? (
                        <>
                             <div className="flex items-center"><Waves size={14} className="mr-1 text-blue-500"/> DRAG: <span className="text-white ml-1">{data.advancedMetrics?.hydrodynamicDrag}</span></div>
                             <div className="flex items-center"><Activity size={14} className="mr-1 text-cyan-500"/> CATCH: <span className="text-white ml-1">{data.advancedMetrics?.catchEfficiency}%</span></div>
                             <div className="flex items-center"><Timer size={14} className="mr-1 text-yellow-500"/> SWOLF: <span className="text-white ml-1">{data.advancedMetrics?.swolfScore}</span></div>
                        </>
                    ) : data.athleteType === 'Boxing' ? (
                         <>
                             <div className="flex items-center"><Swords size={14} className="mr-1 text-red-500"/> CHAIN: <span className="text-white ml-1">{data.advancedMetrics?.kineticChainEfficiency}%</span></div>
                             <div className="flex items-center"><Shield size={14} className="mr-1 text-blue-500"/> RETRACT: <span className="text-white ml-1">{data.advancedMetrics?.retractionSpeed} m/s</span></div>
                             <div className="flex items-center"><Zap size={14} className="mr-1 text-yellow-500"/> FORCE: <span className="text-white ml-1">{data.advancedMetrics?.impactForce} N</span></div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center"><Zap size={14} className="mr-1 text-orange-500"/> GRF: <span className="text-white ml-1">{data.advancedMetrics?.groundReactionForce}x</span></div>
                            <div className="flex items-center"><Activity size={14} className="mr-1 text-purple-500"/> RECOIL: <span className="text-white ml-1">{data.advancedMetrics?.elasticRecoil}%</span></div>
                            <div className="flex items-center"><Timer size={14} className="mr-1 text-cyan-500"/> RATE: <span className="text-white ml-1">{data.advancedMetrics?.strideRate}</span></div>
                        </>
                    )}
                </div>
            </div>
            
            {/* Temporal Graph */}
            {data.timeSeriesData && (
                <div className="mt-4 bg-slate-900/50 p-3 md:p-4 rounded-xl border border-white/5">
                    <h4 className="text-xs font-bold text-slate-400 mb-2 flex items-center"><TrendingUp size={12} className="mr-2" /> FORCE & VELOCITY DYNAMICS</h4>
                    <div className="h-32 w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.timeSeriesData}>
                                <defs>
                                    <linearGradient id="colorForce" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorVel" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                                <XAxis dataKey="time" hide />
                                <YAxis hide />
                                <Tooltip contentStyle={{backgroundColor: '#0f172a', border: '1px solid #334155'}} itemStyle={{fontSize: '10px'}} labelStyle={{display:'none'}}/>
                                <Area type="monotone" dataKey="force" stroke="#a855f7" fillOpacity={1} fill="url(#colorForce)" name="Force Output" />
                                <Area type="monotone" dataKey="velocity" stroke="#06b6d4" fillOpacity={1} fill="url(#colorVel)" name="Velocity" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>

        {/* METRICS & RADAR */}
        <div className="col-span-1 space-y-6">
            <div className="glass-panel p-4 md:p-6 rounded-2xl h-full">
                <h3 className="text-lg font-bold text-white mb-4 font-mono border-b border-white/10 pb-2 flex items-center">
                    <Scan className="w-5 h-5 mr-2 text-cyan-400"/>
                    BIOMETRIC SIGNATURE
                </h3>
                
                {/* Detailed Joint Dashboard */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                    <div className="bg-slate-900/50 p-2 rounded border border-slate-700 text-center">
                        <div className="text-[10px] text-slate-500 uppercase">Knee Flexion</div>
                        <div className="text-lg md:text-xl font-mono text-amber-400 font-bold">145°</div>
                    </div>
                    <div className="bg-slate-900/50 p-2 rounded border border-slate-700 text-center">
                        <div className="text-[10px] text-slate-500 uppercase">Hip Ext</div>
                        <div className="text-lg md:text-xl font-mono text-cyan-400 font-bold">22°</div>
                    </div>
                    <div className="bg-slate-900/50 p-2 rounded border border-slate-700 text-center">
                        <div className="text-[10px] text-slate-500 uppercase">Trunk Lean</div>
                        <div className="text-lg md:text-xl font-mono text-purple-400 font-bold">8°</div>
                    </div>
                    <div className="bg-slate-900/50 p-2 rounded border border-slate-700 text-center">
                        <div className="text-[10px] text-slate-500 uppercase">Ankle Dorsi</div>
                        <div className="text-lg md:text-xl font-mono text-emerald-400 font-bold">15°</div>
                    </div>
                </div>

                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                        name="Activation"
                        dataKey="A"
                        stroke="#22d3ee"
                        strokeWidth={2}
                        fill="#06b6d4"
                        fillOpacity={0.3}
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                            itemStyle={{ color: '#22d3ee' }}
                        />
                    </RadarChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                    {data.advancedMetrics && (
                        <>
                            <div className="flex justify-between text-xs font-mono">
                                <span className="text-slate-400">SYMMETRY</span>
                                <span className="text-emerald-400">{data.advancedMetrics.symmetryScore}%</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full" style={{width: `${data.advancedMetrics.symmetryScore}%`}}></div>
                            </div>
                            
                            <div className="flex justify-between text-xs font-mono mt-2">
                                <span className="text-slate-400">EFFICIENCY</span>
                                <span className="text-cyan-400">{data.advancedMetrics.efficiencyIndex}/100</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-cyan-500 h-full" style={{width: `${data.advancedMetrics.efficiencyIndex}%`}}></div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
      </div>
      ) : (
          <div className="animate-[fadeIn_0.3s]">
               {/* TRAINING SCHEDULE VIEW */}
               <div className="glass-panel p-4 md:p-6 rounded-2xl">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                                <Calendar className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-lg md:text-xl font-bold text-white font-mono">AI PERIODIZATION</h3>
                                <p className="text-xs md:text-sm text-slate-400">4-Week Corrective Cycle based on detected weaknesses.</p>
                            </div>
                        </div>
                        <button className="w-full md:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 font-bold border border-slate-700">
                            Sync to .ICS
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {data.trainingSchedule?.map((day, i) => (
                            <div key={i} className={`p-4 rounded-xl border ${day.intensity === 'High' ? 'bg-red-900/10 border-red-500/20' : day.intensity === 'Medium' ? 'bg-cyan-900/10 border-cyan-500/20' : 'bg-emerald-900/10 border-emerald-500/20'}`}>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-bold text-white">{day.day}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase ${day.intensity === 'High' ? 'bg-red-500 text-white' : day.intensity === 'Medium' ? 'bg-cyan-500 text-white' : 'bg-emerald-500 text-white'}`}>
                                        {day.intensity}
                                    </span>
                                </div>
                                <h4 className="text-sm font-bold text-slate-300 mb-2">{day.focus}</h4>
                                <ul className="space-y-1">
                                    {day.drills.map((drill, idx) => (
                                        <li key={idx} className="text-xs text-slate-400 flex items-center">
                                            <span className="w-1 h-1 bg-slate-500 rounded-full mr-2"></span>
                                            {drill}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 p-4 bg-slate-900/50 rounded-xl border border-white/5 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-500">
                         <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span> HIGH INTENSITY</div>
                         <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-cyan-500 mr-2"></span> TECHNICAL</div>
                         <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span> RECOVERY</div>
                    </div>
               </div>
          </div>
      )}

      {/* Weakness & Drills */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 glass-panel p-4 md:p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center text-red-400 font-mono">
                <AlertTriangle className="w-5 h-5 mr-2" />
                CRITICAL WEAKNESSES
            </h3>
            <div className="space-y-3">
                {data.muscleGroups.filter(m => m.status === 'Weak').map((m, i) => (
                    <div key={i} className="p-3 rounded-lg bg-red-900/10 border border-red-500/20">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-red-200">{m.muscle}</span>
                            <span className="text-xs font-mono bg-red-500/20 text-red-300 px-2 py-0.5 rounded">SCORE: {m.score}</span>
                        </div>
                        <p className="text-xs text-red-200/70">{m.observation}</p>
                    </div>
                ))}
                {data.muscleGroups.filter(m => m.status === 'Weak').length === 0 && (
                    <div className="text-slate-500 text-sm italic">No critical weaknesses detected.</div>
                )}
            </div>
        </div>

        <div className="col-span-1 md:col-span-2 glass-panel p-4 md:p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center text-emerald-400 font-mono">
                <Dumbbell className="w-5 h-5 mr-2" />
                CORRECTIVE DRILL PROTOCOL
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.suggestedDrills.map((drill, i) => (
                    <div key={i} className="group p-4 rounded-xl bg-slate-800 hover:bg-slate-750 transition-colors border border-slate-700 hover:border-emerald-500/30">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-emerald-300 group-hover:text-emerald-200">{drill.name}</h4>
                            <span className="text-[10px] uppercase tracking-wide text-slate-500 border border-slate-600 px-1.5 rounded">{drill.targetMuscle}</span>
                        </div>
                        <p className="text-xs text-slate-400 mb-3 h-10 overflow-hidden leading-relaxed">{drill.description}</p>
                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                            <span className="text-sm font-mono text-white bg-slate-900 px-2 py-1 rounded">{drill.reps}</span>
                            {drill.audioGuidance && (
                                <button 
                                    onClick={() => playDrillAudio(drill.audioGuidance!)}
                                    className={`flex items-center space-x-2 text-xs font-bold uppercase transition-colors no-print ${activeDrillAudio === drill.audioGuidance ? 'text-cyan-400 animate-pulse' : 'text-slate-500 hover:text-white'}`}
                                >
                                    <Volume2 size={16} />
                                    <span>{activeDrillAudio === drill.audioGuidance ? 'Speaking...' : 'Audio Coach'}</span>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* FEEDBACK LOOP (Not printed) */}
      <div className="glass-panel p-4 md:p-6 rounded-2xl border-t border-purple-500/30 bg-gradient-to-br from-slate-900 to-purple-900/10 no-print">
        <div className="flex items-center mb-4">
            <Cpu className="text-purple-400 mr-2" />
            <h3 className="text-lg font-bold text-white font-mono">SYSTEM LEARNING LOOP</h3>
        </div>
        
        {!submitted ? (
            <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 w-full text-center md:text-left">
                    <p className="text-slate-300 text-sm mb-3">Rate analysis accuracy. Feedback updates global neural weights.</p>
                    <div className="flex space-x-2 justify-center md:justify-start">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button 
                                key={star} 
                                onClick={() => setRating(star)}
                                className={`transition-all hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-slate-600'}`}
                            >
                                <Star fill={rating >= star ? "currentColor" : "none"} size={24} />
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex-1 w-full">
                    <div className="flex flex-col md:flex-row gap-2">
                        <input 
                            type="text" 
                            placeholder="Optional: Correction notes..."
                            className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:border-purple-500 outline-none font-mono"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                        />
                        <button 
                            onClick={handleFeedbackSubmit}
                            disabled={rating === 0}
                            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors font-mono whitespace-nowrap"
                        >
                            TRAIN MODEL
                        </button>
                    </div>
                </div>
            </div>
        ) : (
            <div className="flex items-center text-emerald-400 bg-emerald-900/10 p-4 rounded-lg border border-emerald-500/20">
                <MessageSquare className="mr-3" />
                <div>
                    <p className="font-bold font-mono">FEEDBACK INTEGRATED</p>
                    <p className="text-xs opacity-80">Neural weights adjusted. System will recall this correction.</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
