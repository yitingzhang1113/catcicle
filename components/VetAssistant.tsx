
import React, { useState, useRef, useEffect } from 'react';
// Fix: Use AssistantMessage instead of VetMessage as it's the correct exported member from types
import { AssistantMessage, RiskLevel, PostType, Post, Product } from '../types';
import { geminiService } from '../services/geminiService';
// Fix: Ensure MOCK_OWNER_ME is imported correctly
import { MOCK_OWNER_ME } from '../mockData';

interface VetAssistantProps {
  onShareToCommunity: (post: Post) => void;
  // Fix: Added products prop required by getAssistantAdvice
  products: Product[];
}

const VetAssistant: React.FC<VetAssistantProps> = ({ onShareToCommunity, products }) => {
  // Fix: Use AssistantMessage
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi there! I'm your Cat Copilot. How can I help with your cat's health or behavior today? (Risk assessment included)",
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
      // Fix: Call getAssistantAdvice which exists on geminiService
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
          communitySummary: advice.communitySummary,
          recommendedProductIds: advice.recommendedProductIds
        }
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const shareSummary = (msg: AssistantMessage) => {
    if (!msg.metadata) return;
    // Fix: Corrected property names to meet Post interface requirements
    const summaryPost: Post = {
      id: Math.random().toString(36).substr(2, 9),
      catId: MOCK_OWNER_ME.cats[0]?.id || 'unknown',
      ownerId: MOCK_OWNER_ME.id,
      type: PostType.CARE_TIPS,
      content: `💡 AI Care Summary:\n${msg.content.substring(0, 100)}...\n\nAction Steps:\n${msg.metadata.actionableSteps?.map(s => `• ${s}`).join('\n')}`,
      timestamp: Date.now(),
      likes: 0,
      tips: 0,
      comments: [],
      tags: ['HealthSummary', 'AICare']
    };
    onShareToCommunity(summaryPost);
    alert('Experience shared to community!');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-3xl overflow-hidden shadow-xl border">
      <div className="bg-amber-500 p-4 flex items-center space-x-3 text-white">
        <div className="bg-white/20 p-2 rounded-lg">🩺</div>
        <div>
          <h2 className="font-bold">Vet-RAG Health Assistant</h2>
          <p className="text-xs text-amber-100">Professional insights • Safety first</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 ${
              m.role === 'user' 
                ? 'bg-amber-500 text-white rounded-br-none' 
                : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200'
            }`}>
              {m.metadata?.riskLevel && (
                <div className={`text-[10px] font-bold uppercase mb-2 px-2 py-0.5 rounded inline-block ${
                  m.metadata.riskLevel === RiskLevel.HIGH ? 'bg-rose-500 text-white' : 
                  m.metadata.riskLevel === RiskLevel.MEDIUM ? 'bg-orange-500 text-white' : 
                  'bg-emerald-500 text-white'
                }`}>
                  Risk: {m.metadata.riskLevel}
                </div>
              )}
              
              <p className="text-sm whitespace-pre-wrap">{m.content}</p>

              {m.metadata?.actionableSteps && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-bold text-gray-500">Actionable Steps:</p>
                  {m.metadata.actionableSteps.map((s, idx) => (
                    <div key={idx} className="text-xs flex items-start space-x-2">
                      <span className="text-amber-500">✓</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              )}

              {m.metadata?.citations && (
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <p className="text-[10px] font-medium text-gray-400">Sources: {m.metadata.citations.join(', ')}</p>
                </div>
              )}

              {m.role === 'assistant' && m.id !== '1' && (
                <button 
                  onClick={() => shareSummary(m)}
                  className="mt-4 text-xs font-bold text-amber-600 flex items-center space-x-1 hover:bg-amber-50 p-1 px-2 rounded-lg transition-colors border border-amber-200"
                >
                  <span>📝</span>
                  <span>Share Experience to Community</span>
                </button>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl p-4 text-xs text-gray-500 italic">
              Analyzing professional vet sources...
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 border-t bg-gray-50">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe symptoms or behavior..."
            className="flex-1 bg-white rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none shadow-sm"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-amber-500 text-white w-12 h-12 rounded-xl flex items-center justify-center hover:bg-amber-600 transition-shadow shadow-lg shadow-amber-200 disabled:opacity-50"
          >
            🚀
          </button>
        </div>
      </div>
    </div>
  );
};

export default VetAssistant;
