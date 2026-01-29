
import React, { useState, useRef } from 'react';
import { PostType, Post, OwnerProfile, CatChallenge, Community } from '../types';
import { geminiService } from '../services/geminiService';

interface PostCreatorProps {
  onPostCreated: (post: Post) => void;
  onTriageRedirect: () => void;
  owner: OwnerProfile;
  challenges: CatChallenge[];
  communities: Community[];
}

const PostCreator: React.FC<PostCreatorProps> = ({ onPostCreated, onTriageRedirect, owner, challenges, communities }) => {
  const [content, setContent] = useState('');
  const [type, setType] = useState<PostType>(PostType.DAILY);
  const [selectedCatId, setSelectedCatId] = useState<string>(owner.cats[0]?.id || '');
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [triageWarning, setTriageWarning] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const myCommunities = communities.filter(c => c.memberIds.includes(owner.id));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAIHelp = async (style: 'Cute' | 'Witty' | 'Pro' | 'Story' = 'Cute') => {
    if (!content.trim()) return;
    setIsGenerating(true);
    setShowStyleMenu(false);
    try {
      if (type === PostType.PROBLEM) {
        const triage = await geminiService.triageQuery(content);
        if (triage.category === 'HEALTH' || triage.riskLevel === 'High') {
          setTriageWarning(`This looks like a medical risk. For safety, please check with the Cat Assistant.`);
          setIsGenerating(false);
          return;
        }
      }
      const draft = await geminiService.generatePostDraft(content.trim(), type, style);
      setContent(draft);
      setTriageWarning(null);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setIsGenerating(false); 
    }
  };

  const handlePost = () => {
    const finalTags = Array.from(new Set([...tags, type.toLowerCase()]));
    const newPost: Post = {
      id: Math.random().toString(36).substr(2, 9),
      catId: selectedCatId,
      ownerId: owner.id,
      communityId: selectedCommunityId || undefined,
      type,
      content,
      mediaUrl: selectedImage || undefined,
      timestamp: Date.now(),
      likes: 0,
      tips: 0,
      comments: [],
      tags: finalTags,
    };
    onPostCreated(newPost);
    setContent('');
    setSelectedImage(null);
    setTriageWarning(null);
    setTags([]);
    setTagInput('');
    setSelectedCommunityId('');
  };

  const addTag = (tag: string) => {
    const cleanTag = tag.replace('#', '').trim();
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const trendingTags = [
    { name: 'Caturday', reward: 0, isOfficial: false },
    ...challenges
      .filter(ch => ch.isActive)
      .map(ch => ({ name: ch.tag.replace('#', ''), reward: ch.reward, isOfficial: true }))
  ];

  const hasContent = content.trim().length > 5;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6 transition-all hover:shadow-md relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="flex p-1 bg-gray-50 rounded-2xl self-start">
          {[PostType.DAILY, PostType.CARE_TIPS, PostType.PROBLEM].map(t => (
            <button 
              key={t} 
              onClick={() => { setType(t); setTriageWarning(null); }} 
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                type === t 
                  ? 'bg-white text-amber-600 shadow-sm' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white border px-4 py-2 rounded-2xl shadow-sm">
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Post in</span>
             <select 
               value={selectedCommunityId} 
               onChange={(e) => setSelectedCommunityId(e.target.value)}
               className="text-xs font-black bg-transparent border-none focus:ring-0 cursor-pointer text-amber-600"
             >
               <option value="">Public Square</option>
               {myCommunities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
          </div>
          <div className="flex items-center space-x-2 bg-white border px-4 py-2 rounded-2xl shadow-sm">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">As</span>
            <select 
              value={selectedCatId} 
              onChange={(e) => setSelectedCatId(e.target.value)}
              className="text-xs font-black bg-transparent border-none focus:ring-0 cursor-pointer text-gray-800"
            >
              {owner.cats.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="relative group mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={type === PostType.PROBLEM ? "Describe the problem..." : "What's on your cat's mind?"}
          className="w-full min-h-[120px] p-6 bg-gray-50 rounded-2xl border-none focus:ring-4 focus:ring-amber-500/10 focus:bg-white transition-all resize-none text-sm font-medium leading-relaxed"
        />
        {isGenerating && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center">
             <div className="flex space-x-2 mb-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
             </div>
          </div>
        )}
      </div>

      {/* Tag Management */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          {tags.map(t => (
            <span key={t} className="bg-amber-100 text-amber-700 text-[10px] font-black px-3 py-1.5 rounded-full flex items-center group shadow-sm">
              #{t}
              <button onClick={() => removeTag(t)} className="ml-2 hover:text-rose-500 transition-colors">×</button>
            </span>
          ))}
          <input 
            type="text" 
            placeholder="Add tag..." 
            className="bg-gray-50 border-none rounded-full px-4 py-1.5 text-[10px] font-bold outline-none w-24"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(tagInput))}
          />
        </div>
      </div>

      {triageWarning && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl mb-6 text-xs font-medium animate-in slide-in-from-top-2">
          {triageWarning} <button onClick={onTriageRedirect} className="font-black underline ml-1">Connect with Cat Assistant</button>
        </div>
      )}

      {selectedImage && (
        <div className="mb-6 relative inline-block">
          <img src={selectedImage} className="w-32 h-32 rounded-3xl object-cover border-4 border-amber-50 shadow-lg" />
          <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-rose-500 text-white w-7 h-7 rounded-full text-xs font-black shadow-lg">×</button>
        </div>
      )}

      <div className="flex justify-between items-center border-t pt-6">
        <div className="flex items-center space-x-6 relative">
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center space-x-2 text-gray-400 hover:text-amber-500 transition-colors">
            <span className="text-2xl">🖼️</span>
          </button>
          <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
          
          <div className="relative">
            <button 
              onClick={() => setShowStyleMenu(!showStyleMenu)} 
              disabled={isGenerating || !content.trim()} 
              className={`flex items-center space-x-2 transition-all ${hasContent ? 'text-amber-600' : 'text-gray-400 opacity-50'}`}
            >
              <span className="text-xl">✨</span> 
              <span className="text-[10px] font-black uppercase tracking-widest">Polish</span>
            </button>
            
            {showStyleMenu && (
              <div className="absolute bottom-full left-0 mb-4 bg-white border border-gray-100 rounded-2xl shadow-2xl p-3 w-48 z-20">
                {['Cute', 'Witty', 'Pro', 'Story'].map(s => (
                  <button key={s} onClick={() => handleAIHelp(s as any)} className="w-full text-left px-3 py-2 rounded-xl hover:bg-amber-50 text-gray-700 text-xs font-bold transition-all">
                    {s} Style
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <button 
          onClick={handlePost} 
          disabled={!content.trim() && !selectedImage} 
          className="bg-amber-500 text-white px-10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-amber-600 transition-all disabled:opacity-50"
        >
          Publish
        </button>
      </div>
    </div>
  );
};

export default PostCreator;
