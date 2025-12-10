
import React from 'react';
import { Upload, Download, Database, BarChart2, LogOut, User, LifeBuoy, X } from 'lucide-react';
import { AppView, UserProfile } from '../types';
import { InfinityLogo } from './InfinityLogo';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  currentUser?: UserProfile;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, currentUser, onLogout, isOpen, onClose }) => {
  const navItemClass = (view: AppView) => 
    `flex items-center space-x-3 w-full p-3 rounded-xl transition-all duration-300 font-medium ${
      currentView === view 
        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]' 
        : 'text-slate-400 hover:bg-white/5 hover:text-white'
    }`;

  const handleNavClick = (view: AppView) => {
    setView(view);
    onClose(); // Close sidebar on mobile selection
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside className={`fixed md:static inset-y-0 left-0 w-64 bg-[#0f111a]/95 backdrop-blur-xl border-r border-white/5 flex flex-col p-4 z-50 transition-transform duration-300 shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className="md:hidden absolute top-4 right-4 text-slate-500 hover:text-white"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center mb-8 px-2 pt-6">
          <div className="relative w-32 h-32 group mb-4">
              {/* Primary Logo Component */}
              <InfinityLogo className="w-full h-full drop-shadow-[0_0_25px_rgba(34,211,238,0.6)] transition-transform duration-500 hover:scale-105" />
          </div>
          <div className="flex flex-col items-center text-center">
              <h1 className="text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-400 font-mono leading-none drop-shadow-md">INFINITY</h1>
              <span className="text-[10px] text-cyan-500/70 font-mono tracking-[0.3em] mt-2 border-b border-cyan-500/20 pb-1 w-full">BIOMECHANICS</span>
          </div>
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto custom-scrollbar">
          <button 
            onClick={() => handleNavClick(AppView.UPLOAD)}
            className={navItemClass(AppView.UPLOAD)}
          >
            <Upload size={20} />
            <span>New Analysis</span>
          </button>

          <button 
            onClick={() => handleNavClick(AppView.DATABASE)}
            className={navItemClass(AppView.DATABASE)}
          >
            <Database size={20} />
            <span>History & DB</span>
          </button>

          <button 
            onClick={() => handleNavClick(AppView.CONTACT)}
            className={navItemClass(AppView.CONTACT)}
          >
            <LifeBuoy size={20} />
            <span>Support Uplink</span>
          </button>

          {currentView === AppView.ANALYSIS && (
            <button 
              className="flex items-center space-x-3 w-full p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30"
            >
              <BarChart2 size={20} />
              <span>Active Report</span>
            </button>
          )}
        </nav>

        <div className="mt-auto pt-4">
          {currentUser && (
              <div className="mb-4 p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center space-x-3">
                  <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow"
                      style={{ backgroundColor: currentUser.avatarColor || '#6366f1' }}
                  >
                      {currentUser.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 overflow-hidden">
                      <div className="text-xs text-slate-300 font-bold truncate">{currentUser.username}</div>
                      <div className="text-[10px] text-slate-500">{currentUser.role}</div>
                  </div>
                  <button onClick={onLogout} className="text-slate-500 hover:text-red-400 transition-colors">
                      <LogOut size={16} />
                  </button>
              </div>
          )}

          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border border-white/5 mb-4 relative overflow-hidden group hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center space-x-2 text-xs text-slate-400 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="font-mono">VECTOR ENGINE v1.0</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Vision Processing Active
            </div>
          </div>

          <button 
            onClick={() => handleNavClick(AppView.INSTALL)}
            className={navItemClass(AppView.INSTALL)}
          >
            <Download size={20} />
            <span>Download Suite</span>
          </button>
        </div>
      </aside>
    </>
  );
};
