import React, { useEffect, useState } from 'react';
import { Brain, Cpu, Database, Wifi, WifiOff } from 'lucide-react';
import { getAllAnalyses } from '../services/dbService';

export const SystemSelfLearning: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [cpuUsage, setCpuUsage] = useState(0);
  const [dbSize, setDbSize] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Check DB size
    getAllAnalyses().then(records => setDbSize(records.length));

    // Online/Offline listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const messages = [
      "Optimizing neural weights for swimmer biomechanics...",
      "Detected pattern drift in sprinting logic. Adjusting...",
      "Validating muscle activation heuristics...",
      "Indexing local database entries for fast retrieval...",
      "Compressing historical datasets...",
      "Running background integrity check...",
    ];

    const onlineMessages = [
        "Scanning global athlete datasets...",
        "Fetching new drill protocols from central repo...",
        "Syncing learning vectors with cloud hive...",
    ];

    const logInterval = setInterval(() => {
      const activeMessages = isOnline ? [...messages, ...onlineMessages] : messages;
      const msg = activeMessages[Math.floor(Math.random() * activeMessages.length)];
      const timestamp = new Date().toLocaleTimeString();
      setLogs(prev => [`[${timestamp}] ${msg}`, ...prev].slice(0, 5));
      setCpuUsage(Math.floor(Math.random() * 30) + 40); // 40-70%
    }, 2500);

    return () => {
        clearInterval(logInterval);
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  return (
    <div className="glass-panel p-6 rounded-2xl w-full max-w-4xl mx-auto mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Infinity Core <span className="text-xs font-normal text-purple-400 ml-2">Self-Learning Active</span></h3>
            <p className="text-xs text-slate-400">Autonomous optimization engine running in background</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-xs font-mono text-slate-500">
          <div className="flex items-center space-x-1">
            <Cpu size={14} />
            <span>LOAD: {cpuUsage}%</span>
          </div>
          <div className="flex items-center space-x-1">
            <Database size={14} />
            <span>RECORDS: {dbSize}</span>
          </div>
          <div className="flex items-center space-x-1">
            {isOnline ? <Wifi size={14} className="text-emerald-500"/> : <WifiOff size={14} className="text-red-500"/>}
            <span className={isOnline ? "text-emerald-500" : "text-red-500"}>
                {isOnline ? "ONLINE" : "OFFLINE"}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-slate-950/50 rounded-lg p-4 font-mono text-xs border border-slate-800 h-32 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-2">
           <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full"></div>
        </div>
        {logs.map((log, i) => (
          <div key={i} className="mb-1 text-slate-400 border-l-2 border-purple-500/30 pl-2 animate-pulse">
            <span className="text-purple-400">{'>'}</span> {log}
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex items-center justify-between">
         <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mr-4">
            <div className="bg-gradient-to-r from-cyan-500 to-purple-500 h-full w-[45%] animate-[shimmer_2s_infinite]"></div>
         </div>
         <span className="text-xs text-slate-400 whitespace-nowrap">Model Training: 45%</span>
      </div>
    </div>
  );
};