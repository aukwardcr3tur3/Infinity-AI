
import React, { useState, useRef, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { AppView, BiomechanicsAnalysis, AnalysisRecord, UserProfile, SportType } from './types';
import { SystemSelfLearning } from './components/SystemSelfLearning';
import { AnalysisResult } from './components/AnalysisResult';
import { InstallationGuide } from './components/InstallationGuide';
import { DatabaseView } from './components/DatabaseView';
import { UserLogin } from './components/UserLogin';
import { ContactSupport } from './components/ContactSupport';
import { InfinityLogo } from './components/InfinityLogo';
import { FileVideo, AlertCircle, WifiOff, Save, CheckCircle2, Activity, Disc, Waves, Trophy, Swords, Menu } from 'lucide-react';
import { analyzeVideoWithGemini, fileToGenerativePart } from './services/geminiService';
import { initDB, saveAnalysis } from './services/dbService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [view, setView] = useState<AppView>(AppView.LOGIN); // Start at login
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<BiomechanicsAnalysis | null>(null);
  const [currentRecordId, setCurrentRecordId] = useState<number | undefined>(undefined);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeFile, setActiveFile] = useState<File | undefined>(undefined);
  const [selectedSport, setSelectedSport] = useState<SportType>('Athletics');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initDB().catch(console.error);
    
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setView(AppView.UPLOAD);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView(AppView.LOGIN);
    setAnalysisData(null);
    setIsSidebarOpen(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser) return;
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsAnalyzing(true);
    setView(AppView.ANALYSIS);
    setAnalysisData(null);
    setActiveFile(file);

    const MAX_SIZE_BYTES = 5 * 1024 * 1024 * 1024; // 5GB
    if (file.size > MAX_SIZE_BYTES) {
      setUploadError(`File too large. Max size is 5GB.`);
      setIsAnalyzing(false);
      setView(AppView.UPLOAD);
      return;
    }

    try {
      const base64Data = await fileToGenerativePart(file);
      // Pass the selected sport context for accurate physics modeling
      const result = await analyzeVideoWithGemini(base64Data || null, file.type, file, selectedSport);
      setAnalysisData(result);
      
      const recordId = await saveAnalysis(currentUser.id, result, file);
      if (recordId > 0) setCurrentRecordId(recordId);
      
    } catch (error: any) {
      setUploadError("Analysis failed. Please try a valid video file.");
      console.error(error);
      setView(AppView.UPLOAD);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleViewRecord = (record: AnalysisRecord) => {
    setAnalysisData(record.data);
    setCurrentRecordId(record.id);
    setActiveFile(record.videoBlob as File | undefined);
    setView(AppView.ANALYSIS);
  };

  const renderContent = () => {
    switch (view) {
      case AppView.LOGIN:
        return <UserLogin onLogin={handleLogin} />;
        
      case AppView.DASHBOARD:
        setView(AppView.UPLOAD);
        return null;

      case AppView.UPLOAD:
        return (
          <div className="max-w-4xl mx-auto animate-[fadeIn_0.5s_ease-out] mt-6">
             {uploadError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center text-red-400">
                <AlertCircle className="mr-2" /> {uploadError}
              </div>
            )}
            
            <div className="text-center mb-8 flex flex-col items-center">
                <InfinityLogo className="w-32 h-32 md:w-48 md:h-48 mb-6 md:mb-8 animate-[float_4s_ease-in-out_infinite] drop-shadow-[0_0_40px_rgba(34,211,238,0.4)]" />
                <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-4 font-mono">
                    UPLOAD FOOTAGE
                </h2>
                <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-lg mb-8 px-4">
                    Select Sport Context for 100% Accuracy Vector Analysis.
                </p>

                {/* Sport Selector */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 w-full max-w-3xl px-2">
                    <button 
                        onClick={() => setSelectedSport('Athletics')}
                        className={`p-4 md:p-6 rounded-2xl border flex flex-col items-center justify-center transition-all duration-300 ${selectedSport === 'Athletics' ? 'bg-orange-500/20 border-orange-500 text-white shadow-lg shadow-orange-900/40 scale-105' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750 hover:text-white'}`}
                    >
                        <Activity className="mb-2 md:mb-3 w-6 h-6 md:w-8 md:h-8" />
                        <span className="font-bold text-xs md:text-sm tracking-wider">ATHLETICS</span>
                    </button>
                    <button 
                        onClick={() => setSelectedSport('Soccer')}
                        className={`p-4 md:p-6 rounded-2xl border flex flex-col items-center justify-center transition-all duration-300 ${selectedSport === 'Soccer' ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-lg shadow-emerald-900/40 scale-105' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750 hover:text-white'}`}
                    >
                        <Disc className="mb-2 md:mb-3 w-6 h-6 md:w-8 md:h-8" />
                        <span className="font-bold text-xs md:text-sm tracking-wider">SOCCER</span>
                    </button>
                    <button 
                        onClick={() => setSelectedSport('Swimming')}
                        className={`p-4 md:p-6 rounded-2xl border flex flex-col items-center justify-center transition-all duration-300 ${selectedSport === 'Swimming' ? 'bg-blue-500/20 border-blue-500 text-white shadow-lg shadow-blue-900/40 scale-105' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750 hover:text-white'}`}
                    >
                        <Waves className="mb-2 md:mb-3 w-6 h-6 md:w-8 md:h-8" />
                        <span className="font-bold text-xs md:text-sm tracking-wider">SWIMMING</span>
                    </button>
                    <button 
                        onClick={() => setSelectedSport('Boxing')}
                        className={`p-4 md:p-6 rounded-2xl border flex flex-col items-center justify-center transition-all duration-300 ${selectedSport === 'Boxing' ? 'bg-red-600/20 border-red-500 text-white shadow-lg shadow-red-900/40 scale-105' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750 hover:text-white'}`}
                    >
                        <Swords className="mb-2 md:mb-3 w-6 h-6 md:w-8 md:h-8" />
                        <span className="font-bold text-xs md:text-sm tracking-wider">BOXING</span>
                    </button>
                </div>
            </div>

            <div 
              className={`relative overflow-hidden border-2 border-dashed rounded-3xl p-8 md:p-16 text-center transition-all group duration-300 mx-2 ${
                'border-slate-700 hover:border-cyan-400 hover:bg-slate-800/50 cursor-pointer shadow-2xl hover:shadow-[0_0_30px_rgba(34,211,238,0.1)]' 
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="video/*"
                onChange={handleFileUpload}
              />
              <div className="w-16 h-16 md:w-24 md:h-24 bg-slate-800/80 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 group-hover:scale-110 transition-transform shadow-inner border border-white/5 relative">
                <div className="absolute inset-0 border-2 border-cyan-500/20 rounded-full animate-ping"></div>
                <FileVideo className="w-8 h-8 md:w-10 md:h-10 text-cyan-400 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2 relative z-10 font-mono">DRAG & DROP VIDEO</h3>
              <p className="text-xs md:text-base text-slate-400 mb-6 relative z-10">Supports MP4, MOV, MKV (5GB Limit)</p>
              
              <div className="flex flex-col md:flex-row justify-center gap-2 md:gap-4 relative z-10">
                 <div className="px-3 py-1 rounded-full bg-slate-900/50 border border-slate-700 text-xs text-slate-400 flex items-center justify-center">
                    <CheckCircle2 size={12} className="mr-1 text-emerald-500"/> {selectedSport} Mode
                 </div>
                 <div className="px-3 py-1 rounded-full bg-slate-900/50 border border-slate-700 text-xs text-slate-400 flex items-center justify-center">
                    <Activity size={12} className="mr-1 text-purple-500"/> Vector Tracking
                 </div>
              </div>
            </div>
          </div>
        );

      case AppView.ANALYSIS:
        if (isAnalyzing) {
          return (
            <div className="flex flex-col items-center justify-center h-[50vh] animate-[fadeIn_0.5s_ease-out]">
              <div className="relative w-24 h-24 md:w-32 md:h-32 mb-8">
                <div className="absolute inset-0 border-4 border-slate-800/50 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-b-transparent animate-spin animation-delay-500" style={{animationDirection: 'reverse'}}></div>
                <div className="absolute inset-8 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full animate-pulse backdrop-blur-sm"></div>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 font-mono text-center">PROCESSING BIOMETRICS</h3>
              <p className="text-cyan-400 animate-pulse tracking-widest uppercase text-xs font-mono text-center">
                Calculating {selectedSport} Motion Vectors...
              </p>
            </div>
          );
        }
        
        if (analysisData) {
            return (
                <div className="relative">
                    {currentRecordId && (
                        <div className="absolute -top-10 md:-top-12 right-0 z-10 flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 px-3 py-1 md:px-4 md:py-2 rounded-full border border-emerald-500/20 text-xs md:text-sm font-medium shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                            <Save size={14} /> <span>Record #{currentRecordId} Saved</span>
                        </div>
                    )}
                    <AnalysisResult data={analysisData} recordId={currentRecordId} videoBlob={activeFile} />
                </div>
            );
        } 
        
        return <div className="text-white">No data found.</div>;

      case AppView.INSTALL:
        return <InstallationGuide />;
      
      case AppView.DATABASE:
        return <DatabaseView onViewRecord={handleViewRecord} userId={currentUser?.id} />;

      case AppView.CONTACT:
        return <ContactSupport currentUser={currentUser} />;
        
      default:
        return null;
    }
  };

  // Login view is separate wrapper
  if (view === AppView.LOGIN) {
      return (
        <div className="min-h-screen w-full bg-[#05050a] flex items-center justify-center relative overflow-hidden">
             {/* Background Effects - Simplified for mobile performance */}
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/40 via-[#05050a] to-[#05050a]"></div>
             <div className="absolute z-10 w-full p-4">
                <UserLogin onLogin={handleLogin} />
             </div>
        </div>
      );
  }

  return (
    <div className="flex min-h-[100dvh] w-full bg-[#05050a] text-slate-200 overflow-x-hidden">
      {/* Background Effects - Optimized */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden no-print opacity-50 md:opacity-100">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[80px] md:blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-900/20 blur-[80px] md:blur-[120px]"></div>
      </div>

      <Sidebar 
        currentView={view} 
        setView={setView} 
        currentUser={currentUser || undefined}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 overflow-y-auto relative z-10 flex flex-col h-[100dvh]">
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#05050a]/80 border-b border-white/5 px-4 md:px-8 py-4 flex justify-between items-center no-print">
          <div className="flex items-center gap-3">
            <button 
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 text-slate-400 hover:text-white"
            >
                <Menu size={24} />
            </button>
            <h2 className="text-sm md:text-xl font-bold text-white tracking-tight font-mono truncate">
              {view === AppView.UPLOAD && 'DATA INGESTION'}
              {view === AppView.ANALYSIS && 'VECTOR OUTPUT'}
              {view === AppView.INSTALL && 'DEPLOYMENT'}
              {view === AppView.DATABASE && 'SECURE ARCHIVE'}
              {view === AppView.CONTACT && 'SUPPORT UPLINK'}
            </h2>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
             {!isOnline && (
                 <div className="px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] md:text-xs text-orange-400 font-mono flex items-center">
                    <WifiOff size={10} className="mr-1 md:mr-2"/> <span className="hidden md:inline">OFFLINE - LOCAL MODE</span><span className="md:hidden">LOCAL</span>
                 </div>
             )}
             <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Sys v1.0.0</span>
             </div>
          </div>
        </header>

        <div className="p-4 md:p-8 w-full max-w-7xl mx-auto flex-1 overflow-y-auto custom-scrollbar">
          <div className="mb-6 md:mb-8 no-print">
              <SystemSelfLearning />
          </div>
          
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
