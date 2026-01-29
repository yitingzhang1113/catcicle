
import React, { useState, useEffect } from 'react';
import { RecommendedMatch } from '../types';
import { apiService } from '../services/apiService';

interface DiscoverProps {
  onChat: (ownerId: string) => void;
  onViewProfile: (ownerId: string) => void;
}

const Discover: React.FC<DiscoverProps> = ({ onChat, onViewProfile }) => {
  const [matches, setMatches] = useState<RecommendedMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const data = await apiService.getRecommendedMatches();
        setMatches(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadMatches();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-2xl">🔍</div>
        </div>
        <p className="mt-8 text-gray-400 font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">Analyzing Interest Vectors...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-amber-500 rounded-[40px] p-12 text-white relative overflow-hidden shadow-2xl">
         <div className="relative z-10">
            <div className="inline-block bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">Neural Matching v2.5</div>
            <h2 className="text-4xl font-black mb-4 italic tracking-tight">AI Soulmates 🐾</h2>
            <p className="opacity-90 text-sm max-w-lg font-medium leading-relaxed">
              Our recommendation engine uses deep vector embeddings to find cat owners with similar care habits and feline personalities.
            </p>
         </div>
         <div className="absolute -right-20 -bottom-20 text-[260px] opacity-10 rotate-12 pointer-events-none">✨</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {matches.map((match, idx) => (
          <div key={idx} className="bg-white rounded-[45px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 group overflow-hidden flex flex-col">
            <div className="p-8 flex-1">
              <div className="flex items-center justify-between mb-8">
                <div className="relative cursor-pointer" onClick={() => onViewProfile(match.owner.id)}>
                   <img src={match.owner.avatar} className="w-24 h-24 rounded-[35px] object-cover border-4 border-amber-50 shadow-xl group-hover:scale-105 transition-transform duration-500" />
                   <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white text-[9px] font-black px-3 py-1.5 rounded-full border-4 border-white shadow-lg">
                      ACTIVE
                   </div>
                </div>
                <div className="text-right">
                  <div className="relative inline-block">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                      <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="8" fill="transparent" 
                        strokeDasharray={220} 
                        strokeDashoffset={220 - (220 * match.matchScore) / 100} 
                        className="text-amber-500 transition-all duration-1000 delay-300" 
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg font-black text-gray-900 leading-none">{match.matchScore}%</span>
                    </div>
                  </div>
                  <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2">Similarity</div>
                </div>
              </div>

              <h4 className="text-2xl font-black text-gray-900 mb-2">{match.owner.accountName}</h4>
              <div className="flex flex-wrap gap-2 mb-6">
                {match.owner.interests.slice(0, 3).map(tag => (
                  <span key={tag} className="bg-gray-50 text-gray-400 text-[9px] font-black px-2 py-1 rounded-md uppercase">#{tag}</span>
                ))}
              </div>

              <div className="bg-indigo-50/50 rounded-3xl p-5 mb-8 border border-indigo-100/50 relative">
                <div className="absolute -top-3 left-6 bg-indigo-500 text-white text-[8px] font-black px-2 py-1 rounded-lg shadow-sm uppercase tracking-tighter">AI Analysis</div>
                <p className="text-xs text-indigo-900 font-semibold leading-relaxed mt-1">{match.reason}</p>
              </div>

              <div className="flex space-x-4">
                <button 
                  onClick={() => onViewProfile(match.owner.id)}
                  className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-lg active:scale-95"
                >
                  View Pet Cards
                </button>
                <button 
                  onClick={() => onChat(match.owner.id)}
                  className="w-16 h-16 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-amber-200 hover:rotate-12 transition-all active:scale-95"
                >
                  <span className="text-2xl">💬</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Discover;
