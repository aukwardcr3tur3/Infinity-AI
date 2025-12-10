
import React, { useState } from 'react';
import { User, Lock, ArrowRight, ShieldCheck, Database, UserPlus, LogIn, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';
import { createUser, loginUser } from '../services/dbService';
import { InfinityLogo } from './InfinityLogo';

interface UserLoginProps {
  onLogin: (user: UserProfile) => void;
}

export const UserLogin: React.FC<UserLoginProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  
  // Login State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // Register State
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'Athlete' | 'Coach'>('Athlete');
  const [regError, setRegError] = useState('');

  const handleStrictLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!loginUsername.trim() || !loginPassword.trim()) return;
      
      setLoading(true);
      setLoginError('');
      
      try {
          // Strict Database Check with Password Hash Verification
          const user = await loginUser(loginUsername.trim(), loginPassword);
          if (user) {
              onLogin(user);
          } else {
              setLoginError("Invalid Username or Password.");
          }
      } catch (err) {
          setLoginError("Database connection failed.");
      } finally {
          setLoading(false);
      }
  };

  const handleStrictRegister = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!regUsername.trim() || !regPassword.trim()) return;

      setLoading(true);
      setRegError('');

      try {
          const newUser = await createUser(regUsername.trim(), regPassword, regRole);
          if (newUser) {
              onLogin(newUser);
          }
      } catch (err) {
          if (typeof err === 'string' && err.includes('exists')) {
              setRegError("Error: Username already exists.");
          } else {
              setRegError("Registration failed. Try again.");
          }
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-[fadeIn_0.5s_ease-out] w-full px-4">
       <div className="mb-8 text-center">
            <InfinityLogo className="w-32 h-32 mx-auto mb-6 drop-shadow-[0_0_30px_rgba(34,211,238,0.4)]" />
            <h1 className="text-4xl font-bold text-white font-mono tracking-tighter mb-2">INFINITY <span className="text-cyan-400">AI</span></h1>
            <p className="text-slate-400 font-mono text-sm">SECURE BIOMECHANICS DATABASE</p>
       </div>

       <div className="glass-panel w-full max-w-md p-1 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden flex flex-col">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
          
          {/* Tab Switcher */}
          <div className="flex bg-slate-900/50 p-1 m-2 rounded-2xl">
              <button 
                onClick={() => setActiveTab('LOGIN')}
                className={`flex-1 flex items-center justify-center py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'LOGIN' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                  <LogIn size={16} className="mr-2" /> LOGIN
              </button>
              <button 
                onClick={() => setActiveTab('REGISTER')}
                className={`flex-1 flex items-center justify-center py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'REGISTER' ? 'bg-cyan-900/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'}`}
              >
                  <UserPlus size={16} className="mr-2" /> REGISTER
              </button>
          </div>

          <div className="p-6">
            {activeTab === 'LOGIN' ? (
                <form onSubmit={handleStrictLogin} className="space-y-4 animate-[fadeIn_0.3s]">
                    <div className="text-center mb-4">
                        <h2 className="text-xl font-bold text-white">Coach/Athlete Login</h2>
                        <p className="text-xs text-slate-500">Enter your credentials to access encrypted history.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-mono text-slate-400 ml-1">USERNAME</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 text-slate-500" size={18} />
                            <input 
                                type="text" 
                                value={loginUsername}
                                onChange={e => setLoginUsername(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-cyan-500 outline-none transition-colors"
                                placeholder="Enter ID..."
                                autoFocus
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-slate-400 ml-1">PASSWORD</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 text-slate-500" size={18} />
                            <input 
                                type="password" 
                                value={loginPassword}
                                onChange={e => setLoginPassword(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-cyan-500 outline-none transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {loginError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center text-xs text-red-400">
                            <AlertCircle size={14} className="mr-2 flex-shrink-0" />
                            {loginError}
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={loading || !loginUsername || !loginPassword}
                        className="w-full py-4 rounded-xl bg-slate-100 hover:bg-white text-slate-900 font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all flex items-center justify-center disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Access Database'} <ArrowRight size={18} className="ml-2" />
                    </button>
                </form>
            ) : (
                <form onSubmit={handleStrictRegister} className="space-y-4 animate-[fadeIn_0.3s]">
                     <div className="text-center mb-4">
                        <h2 className="text-xl font-bold text-white">Create Account</h2>
                        <p className="text-xs text-slate-500">Register a new profile in the local database.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-mono text-slate-400 ml-1">NEW USERNAME</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 text-slate-500" size={18} />
                            <input 
                                type="text" 
                                value={regUsername}
                                onChange={e => setRegUsername(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-cyan-500 outline-none transition-colors"
                                placeholder="Choose unique ID..."
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-slate-400 ml-1">SECURE PASSWORD</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 text-slate-500" size={18} />
                            <input 
                                type="password" 
                                value={regPassword}
                                onChange={e => setRegPassword(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-cyan-500 outline-none transition-colors"
                                placeholder="Create password..."
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                         <label className="text-xs font-mono text-slate-400 ml-1">ROLE</label>
                         <div className="grid grid-cols-2 gap-3">
                            <button 
                                type="button"
                                onClick={() => setRegRole('Athlete')}
                                className={`py-3 rounded-xl text-sm font-bold border transition-colors ${regRole === 'Athlete' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-700 text-slate-500'}`}
                            >
                                Athlete
                            </button>
                            <button 
                                type="button"
                                onClick={() => setRegRole('Coach')}
                                className={`py-3 rounded-xl text-sm font-bold border transition-colors ${regRole === 'Coach' ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-slate-900 border-slate-700 text-slate-500'}`}
                            >
                                Coach
                            </button>
                         </div>
                    </div>

                    {regError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center text-xs text-red-400">
                            <AlertCircle size={14} className="mr-2 flex-shrink-0" />
                            {regError}
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={loading || !regUsername || !regPassword}
                        className="w-full py-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Register Profile'} <UserPlus size={18} className="ml-2" />
                    </button>
                </form>
            )}
          </div>

          <div className="p-4 bg-slate-900/80 border-t border-white/5 flex items-center justify-center text-[10px] text-slate-600 font-mono space-x-4">
             <div className="flex items-center"><ShieldCheck size={12} className="mr-1"/> 256-BIT ENCRYPTION</div>
             <div className="flex items-center"><Database size={12} className="mr-1"/> 10M+ CAPACITY</div>
          </div>
       </div>
    </div>
  );
};
