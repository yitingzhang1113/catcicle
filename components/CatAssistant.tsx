
import React, { useState, useRef, useEffect } from 'react';
import { AssistantMessage, RiskLevel, PostType, Post, Product } from '../types';
import { geminiService } from '../services/geminiService';
import { MOCK_OWNER_ME } from '../mockData';

interface CatAssistantProps {
  onShareToCommunity: (post: Post) => void;
  products: Product[];
  onGoToMall: (productId?: string) => void;
}

const CatAssistant: React.FC<CatAssistantProps> = ({ onShareToCommunity, products, onGoToMall }) => {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI Assistant. I have access to professional veterinary knowledge and our entire Cat Mall. How can I help you and your cat today?",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: AssistantMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const advice = await geminiService.getAssistantAdvice(input, messages, products);
      const assistantMsg: AssistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: advice.analysis,
        timestamp: Date.now(),
        metadata: {
          riskLevel: advice.riskLevel as RiskLevel,
          citations: advice.citations,
          actionableSteps: advice.actionableSteps,
          recommendedProductIds: advice.recommendedProductIds,
          communitySummary: advice.communitySummary
        }
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (e) {
      console.error(e);
      const errorMsg: AssistantMessage = {
        id: 'error',
        role: 'assistant',
        content: "I'm having trouble connecting to the feline cloud. Please try again later!",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const shareSummary = (msg: AssistantMessage) => {
    if (!msg.metadata) return;
    const summaryPost: Post = {
      id: Math.random().toString(36).substr(2, 9),
      catId: MOCK_OWNER_ME.cats[0]?.id || 'unknown',
      ownerId: MOCK_OWNER_ME.id,
      type: PostType.CARE_TIPS,
      content: `💡 AI Assistant Summary:\n${msg.metadata.communitySummary || msg.content}\n\nKey Recommendations:\n${msg.metadata.actionableSteps?.map(s => `• ${s}`).join('\n')}`,
      timestamp: Date.now(),
      likes: 0,
      tips: 0,
      comments: [],
      tags: ['AIAssistant', 'CatCare']
    };
    onShareToCommunity(summaryPost);
    alert('Experience shared to community!');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-[40px] overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-gradient-to-r from-indigo-500 to-amber-500 p-6 flex items-center justify-between text-white shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md text-xl">🤖</div>
          <div>
            <h2 className="font-black text-lg tracking-tight">AI Assistant</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Medical RAG & Smart Shopping</p>
          </div>
        </div>
        <div className="flex space-x-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Online</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/10">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-[30px] p-6 shadow-sm ${
              m.role === 'user' 
                ? 'bg-amber-500 text-white rounded-br-none' 
                : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
            }`}>
              {m.metadata?.riskLevel && (
                <div className={`text-[9px] font-black uppercase mb-3 px-3 py-1 rounded-full inline-block ${
                  m.metadata.riskLevel === RiskLevel.HIGH ? 'bg-rose-500 text-white shadow-lg shadow-rose-100' : 
                  m.metadata.riskLevel === RiskLevel.MEDIUM ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 
                  'bg-emerald-500 text-white shadow-lg shadow-emerald-100'
                }`}>
                  {m.metadata.riskLevel} Priority
                </div>
              )}
              
              <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{m.content}</p>

              {m.metadata?.actionableSteps && m.metadata.actionableSteps.length > 0 && (
                <div className="mt-5 p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/50">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Professional Advice</p>
                  {m.metadata.actionableSteps.map((s, idx) => (
                    <div key={idx} className="text-xs flex items-start space-x-2 mb-2 font-semibold text-indigo-900">
                      <span className="text-indigo-500 mt-0.5">●</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              )}

              {m.metadata?.recommendedProductIds && m.metadata.recommendedProductIds.length > 0 && (
                <div className="mt-6 space-y-3">
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1 flex items-center">
                    <span className="mr-2">🛍️</span> Personal Shopping Recommendations
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {m.metadata.recommendedProductIds.map(pid => {
                      const p = products.find(prod => prod.id === pid);
                      if (!p) return null;
                      return (
                        <div 
                          key={pid}
                          onClick={() => onGoToMall(pid)}
                          className="flex items-center justify-between bg-amber-50/50 border border-amber-100 p-3 rounded-2xl hover:bg-amber-100 transition-all shadow-sm cursor-pointer group"
                        >
                          <div className="flex items-center space-x-3">
                            <img src={p.imageUrl} className="w-10 h-10 rounded-xl object-cover shadow-sm group-hover:scale-110 transition-transform" />
                            <div>
                              <p className="text-[11px] font-black text-gray-800 line-clamp-1">{p.name}</p>
                              <p className="text-[9px] font-bold text-amber-600">Buy for ${p.usdPrice.toFixed(2)}</p>
                            </div>
                          </div>
                          <span className="text-lg group-hover:translate-x-1 transition-transform">➡️</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {m.metadata?.citations && m.metadata.citations.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Knowledge Context: {m.metadata.citations.join(', ')}</p>
                </div>
              )}

              {m.role === 'assistant' && m.id !== '1' && (
                <button 
                  onClick={() => shareSummary(m)}
                  className="mt-6 w-full py-3.5 text-[10px] font-black uppercase tracking-widest text-amber-600 border-2 border-amber-100 rounded-2xl hover:bg-amber-50 hover:border-amber-200 transition-all flex items-center justify-center space-x-2"
                >
                  <span>📢</span>
                  <span>Share Advice to Feed</span>
                </button>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-[25px] p-6 shadow-sm border border-gray-100 flex items-center space-x-3">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce delay-150"></div>
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Consulting Cat Database...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-8 border-t bg-white">
        <div className="flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about health, care, or finding gear..."
            className="flex-1 bg-gray-50 rounded-[22px] px-6 py-4.5 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-indigo-400"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-indigo-500 text-white w-14 h-14 rounded-[22px] flex items-center justify-center hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 active:scale-95"
          >
            <span className="text-xl">🚀</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CatAssistant;
