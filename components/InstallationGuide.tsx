
import React, { useState } from 'react';
import { Terminal, Monitor, Server, Download, Apple, Shield } from 'lucide-react';
import { InfinityLogo } from './InfinityLogo';

export const InstallationGuide: React.FC = () => {
  const [os, setOs] = useState<'linux' | 'windows' | 'mac'>('windows');

  const handleDownload = (platform: string) => {
    alert(`Initiating secure download for ${platform} standalone executable... \n\n(This is a demo action. In a real deployment, this would serve the compiled binary.)`);
  };

  const content = {
    linux: {
      title: "Linux Standalone",
      description: "AppImage or Debian package for workstations.",
      isSimple: false,
      steps: [
        "Update your package list: `sudo apt update`",
        "Clone the Infinity repo: `git clone https://github.com/infinity-ai/core.git`",
        "Navigate to directory: `cd core`",
        "Install dependencies: `npm install`",
        "Start server: `npm start`"
      ]
    },
    windows: {
      title: "Windows Standalone",
      description: "Standalone .EXE for Windows 10/11 (64-bit).",
      isSimple: true, // Non-techy flag
      steps: [] as string[]
    },
    mac: {
      title: "macOS Standalone",
      description: "Signed .DMG for Apple Silicon and Intel.",
      isSimple: true,
      steps: [] as string[]
    }
  };

  const activeContent = content[os];

  return (
    <div className="max-w-4xl mx-auto animate-[fadeIn_0.5s_ease-out]">
      <div className="glass-panel p-8 rounded-2xl text-center mb-8 bg-gradient-to-b from-slate-900/50 to-slate-900/80">
        <InfinityLogo className="w-24 h-24 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]" />
        <h2 className="text-3xl font-bold text-white mb-2">Software Distribution Center</h2>
        <p className="text-slate-400">Select your platform to download the Infinity Core standalone software.</p>
        
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={() => setOs('windows')}
            className={`flex items-center space-x-2 px-6 py-4 rounded-xl font-medium transition-all duration-200 border ${
              os === 'windows' 
                ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-[0_0_20px_rgba(37,99,235,0.2)]' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <Monitor size={20} />
            <span>Windows</span>
          </button>
          
          <button
            onClick={() => setOs('mac')}
            className={`flex items-center space-x-2 px-6 py-4 rounded-xl font-medium transition-all duration-200 border ${
              os === 'mac' 
                ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-[0_0_20px_rgba(147,51,234,0.2)]' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <Apple size={20} />
            <span>macOS</span>
          </button>

          <button
            onClick={() => setOs('linux')}
            className={`flex items-center space-x-2 px-6 py-4 rounded-xl font-medium transition-all duration-200 border ${
              os === 'linux' 
                ? 'bg-orange-600/20 border-orange-500 text-orange-300 shadow-[0_0_20px_rgba(234,88,12,0.2)]' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <Terminal size={20} />
            <span>Linux</span>
          </button>
        </div>
      </div>

      <div className="glass-panel p-10 rounded-2xl border-t border-white/5 relative overflow-hidden">
        {/* Background shine */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

        <div className="flex flex-col items-center">
          <h3 className="text-2xl font-bold text-white mb-2">{activeContent.title}</h3>
          <p className="text-slate-400 mb-8">{activeContent.description}</p>
          
          {activeContent.isSimple ? (
             <div className="text-center w-full max-w-md">
                <button 
                    onClick={() => handleDownload(activeContent.title)}
                    className="w-full group relative flex items-center justify-center space-x-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-5 px-8 rounded-xl transition-all shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)]"
                >
                    <Download className="w-6 h-6" />
                    <span className="text-lg">Download Installer (.exe)</span>
                    <div className="absolute inset-0 rounded-xl ring-2 ring-white/20 group-hover:ring-white/40"></div>
                </button>
                <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-slate-500">
                    <Shield size={12} className="text-emerald-500"/>
                    <span>Securely Signed & Verified</span>
                </div>
                
                <div className="mt-8 p-4 bg-slate-900/50 rounded-lg border border-slate-800 text-left">
                    <h4 className="text-sm font-semibold text-slate-300 mb-2">Instructions:</h4>
                    <ol className="list-decimal list-inside text-sm text-slate-400 space-y-2">
                        <li>Click the button above to download.</li>
                        <li>Double-click the installer file.</li>
                        <li>Follow the setup wizard.</li>
                        <li>Infinity AI will launch as a desktop application.</li>
                    </ol>
                </div>
             </div>
          ) : (
            <div className="w-full bg-[#0a0c10] rounded-xl border border-slate-800 p-6 font-mono text-sm text-slate-300 shadow-inner">
                {activeContent.steps?.map((step, idx) => (
                <div key={idx} className="mb-4 flex items-start">
                    <span className="text-cyan-500 mr-3 select-none">$</span>
                    <span className="break-all">
                    {step.split('`').map((part, i) => 
                        i % 2 === 1 ? <span key={i} className="text-yellow-300 font-bold">{part}</span> : part
                    )}
                    </span>
                </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
