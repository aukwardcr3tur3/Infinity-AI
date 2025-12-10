
import React, { useState } from 'react';
import { Mail, MessageSquare, Bug, AlertTriangle, Send, LifeBuoy } from 'lucide-react';
import { UserProfile } from '../types';

interface ContactSupportProps {
  currentUser?: UserProfile | null;
}

export const ContactSupport: React.FC<ContactSupportProps> = ({ currentUser }) => {
  const [subject, setSubject] = useState('Feedback');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    const email = "jaghanabuden@gmail.com";
    const userPart = currentUser ? `User: ${currentUser.username} (ID: ${currentUser.id})` : "User: Guest";
    const systemPart = `System: Infinity Core v1.0.0 | Platform: ${navigator.platform}`;
    
    const fullBody = `${message}\n\n--------------------------------\n${userPart}\n${systemPart}\n--------------------------------`;
    
    // Construct mailto link
    const mailtoLink = `mailto:${email}?subject=[Infinity AI Support] ${subject}&body=${encodeURIComponent(fullBody)}`;
    
    // Open default mail client
    window.location.href = mailtoLink;
  };

  return (
    <div className="max-w-2xl mx-auto animate-[fadeIn_0.5s_ease-out]">
      <div className="glass-panel p-8 rounded-2xl border-l-4 border-cyan-500">
        <div className="flex items-center space-x-4 mb-6">
           <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
               <LifeBuoy className="w-8 h-8 text-cyan-400" />
           </div>
           <div>
               <h2 className="text-2xl font-bold text-white font-mono">SUPPORT UPLINK</h2>
               <p className="text-slate-400 text-sm">Direct line to Infinity engineering team.</p>
           </div>
        </div>

        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
                <button 
                    onClick={() => setSubject('Bug Report')}
                    className={`p-4 rounded-xl border flex flex-col items-center transition-all ${subject === 'Bug Report' ? 'bg-red-500/20 border-red-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-500 hover:bg-slate-800'}`}
                >
                    <Bug className="mb-2" />
                    <span className="text-xs font-bold">BUG REPORT</span>
                </button>
                <button 
                    onClick={() => setSubject('Feature Request')}
                    className={`p-4 rounded-xl border flex flex-col items-center transition-all ${subject === 'Feature Request' ? 'bg-purple-500/20 border-purple-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-500 hover:bg-slate-800'}`}
                >
                    <MessageSquare className="mb-2" />
                    <span className="text-xs font-bold">FEATURE</span>
                </button>
                <button 
                    onClick={() => setSubject('Account Issue')}
                    className={`p-4 rounded-xl border flex flex-col items-center transition-all ${subject === 'Account Issue' ? 'bg-orange-500/20 border-orange-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-500 hover:bg-slate-800'}`}
                >
                    <AlertTriangle className="mb-2" />
                    <span className="text-xs font-bold">ACCOUNT</span>
                </button>
            </div>

            <div>
                <label className="text-xs font-mono text-slate-400 ml-1 mb-2 block">MESSAGE DETAILS</label>
                <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full h-40 bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:border-cyan-500 outline-none font-mono text-sm"
                    placeholder="Describe your issue or suggestion in detail..."
                ></textarea>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 text-xs text-slate-500 font-mono">
                <p>TARGET: <span className="text-cyan-500">jaghanabuden@gmail.com</span></p>
                <p>METADATA: Including app version {currentUser ? `& User ID #${currentUser.id}` : ''}</p>
            </div>

            <button 
                onClick={handleSend}
                disabled={!message.trim()}
                className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-slate-900 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Send className="w-5 h-5 mr-2" />
                INITIATE TRANSMISSION
            </button>
        </div>
      </div>
    </div>
  );
};
