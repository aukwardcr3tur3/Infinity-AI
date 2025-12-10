import React, { useEffect, useState } from 'react';
import { getUserAnalyses, deleteAnalysis } from '../services/dbService';
import { AnalysisRecord } from '../types';
import { Trash2, Eye, Calendar, User, Database, Star, Video, MessageSquare } from 'lucide-react';

interface DatabaseViewProps {
  onViewRecord: (record: AnalysisRecord) => void;
  userId?: number;
}

export const DatabaseView: React.FC<DatabaseViewProps> = ({ onViewRecord, userId }) => {
  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    if (userId === undefined) return;
    setIsLoading(true);
    const data = await getUserAnalyses(userId);
    setRecords(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this analysis record?")) {
      await deleteAnalysis(id);
      loadData();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-cyan-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mr-3"></div>
        Loading Database...
      </div>
    );
  }

  return (
    <div className="animate-[fadeIn_0.5s_ease-out]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Analysis Database</h2>
          <p className="text-slate-400">
             Local storage encrypted. {records.length} records found for current user.
          </p>
        </div>
        <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
           <Database className="text-cyan-400" />
        </div>
      </div>

      {records.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center border-dashed border-2 border-slate-700">
          <Database className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">Database Empty</h3>
          <p className="text-slate-500">Run an analysis to populate the local database.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {records.map((record) => (
            <div 
              key={record.id} 
              className="glass-panel p-6 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-slate-800/50 transition-colors cursor-pointer group"
              onClick={() => onViewRecord(record)}
            >
              <div className="flex items-start space-x-4 mb-4 md:mb-0">
                <div className={`p-4 rounded-lg ${
                  record.data.athleteType === 'Athletics' ? 'bg-orange-500/10' : 
                  record.data.athleteType === 'Soccer' ? 'bg-emerald-500/10' : 
                  'bg-blue-500/10'
                }`}>
                   <User className={`w-6 h-6 ${
                     record.data.athleteType === 'Athletics' ? 'text-orange-400' : 
                     record.data.athleteType === 'Soccer' ? 'text-emerald-400' : 
                     'text-blue-400'
                   }`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                      {record.data.athleteType} Analysis
                    </h3>
                    {record.videoBlob && (
                      <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 rounded flex items-center" title="Video source available">
                        <Video size={10} className="mr-1"/> SRC
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center text-slate-500 text-xs mt-1 space-x-3">
                    <span className="flex items-center"><Calendar size={12} className="mr-1"/> {new Date(record.date).toLocaleDateString()}</span>
                    <span>#{record.id}</span>
                    {record.userRating && (
                      <span className="flex items-center text-yellow-500"><Star size={10} fill="currentColor" className="mr-1"/> {record.userRating}</span>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm mt-2 line-clamp-1">{record.data.summary}</p>
                  {record.userFeedback && (
                      <p className="text-emerald-500/70 text-xs mt-1 flex items-center">
                          <MessageSquare size={10} className="mr-1"/> Feedback Logged
                      </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 w-full md:w-auto mt-2 md:mt-0">
                <button 
                  onClick={(e) => { e.stopPropagation(); onViewRecord(record); }}
                  className="flex-1 md:flex-none px-4 py-2 bg-slate-800 hover:bg-cyan-900/30 text-cyan-400 text-sm font-medium rounded-lg transition-colors border border-slate-700 hover:border-cyan-500/50 flex items-center justify-center"
                >
                  <Eye size={16} className="mr-2" /> View
                </button>
                <button 
                  onClick={(e) => handleDelete(record.id, e)}
                  className="px-4 py-2 bg-slate-800 hover:bg-red-900/20 text-slate-500 hover:text-red-400 text-sm font-medium rounded-lg transition-colors border border-slate-700 hover:border-red-500/30"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};