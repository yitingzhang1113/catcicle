
import React, { useState, useEffect } from 'react';
import { Post, PostType, CatChallenge, Comment, Community } from '../types';
import { MOCK_OWNERS } from '../mockData';

interface FeedProps {
  posts: Post[];
  communities: Community[];
  followingIds: string[];
  onTip: (postId: string, amount: number) => void;
  onLike: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
  onFollow: (ownerId: string) => void;
  onViewProfile?: (ownerId: string) => void;
  challenges?: CatChallenge[];
  onChallengeTagClick?: (tag: string) => void;
  currentUserId: string;
}

const Feed: React.FC<FeedProps> = ({ 
  posts, 
  communities,
  followingIds, 
  onTip, 
  onLike,
  onComment,
  onFollow, 
  onViewProfile, 
  challenges,
  onChallengeTagClick,
  currentUserId
}) => {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  
  const getOwner = (id: string) => MOCK_OWNERS.find(o => o.id === id) || MOCK_OWNERS[0];
  const getCat = (ownerId: string, catId: string) => {
    const owner = getOwner(ownerId);
    return owner.cats.find(c => c.id === catId) || owner.cats[0];
  };

  const activeChallenge = challenges?.find(c => c.isActive);

  useEffect(() => {
    if (!activeChallenge) return;

    const timer = setInterval(() => {
      const diff = activeChallenge.endDate - Date.now();
      if (diff <= 0) {
        setTimeLeft('Ended');
        clearInterval(timer);
      } else {
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        setTimeLeft(`${hours}h ${mins}m left`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeChallenge]);

  const handleCommentSubmit = (postId: string) => {
    const text = commentInputs[postId];
    if (!text?.trim()) return;
    onComment(postId, text);
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  return (
    <div className="space-y-6">
      {/* Official Challenge Banner */}
      {activeChallenge && (
        <div 
          className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-[2px] rounded-3xl mb-8 shadow-xl overflow-hidden group cursor-pointer"
          onClick={() => onChallengeTagClick?.(activeChallenge.tag)}
        >
          <div className="bg-white rounded-[22px] p-6 transition-all hover:bg-gray-50/50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
               <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Challenge</span>
                    <span className="text-rose-500 font-bold text-[10px] bg-rose-50 px-2 py-0.5 rounded-full">{timeLeft}</span>
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-1">{activeChallenge.title}</h3>
                  <p className="text-gray-500 text-xs font-medium">{activeChallenge.description}</p>
               </div>
               <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-2xl">
                  <p className="text-xl font-black text-amber-600">🪙 {activeChallenge.reward}</p>
                  <div className="h-8 w-px bg-gray-200"></div>
                  <p className="text-sm font-black text-indigo-600 underline">{activeChallenge.tag}</p>
               </div>
            </div>
          </div>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <p className="text-gray-400 font-bold">No posts found.</p>
        </div>
      ) : posts.map((post) => {
        const owner = getOwner(post.ownerId);
        const cat = getCat(post.ownerId, post.catId);
        const community = post.communityId ? communities.find(c => c.id === post.communityId) : null;
        const isFollowing = followingIds.includes(owner.id);
        const isCommenting = selectedPostId === post.id;

        return (
          <div key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-in fade-in duration-300">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onViewProfile?.(owner.id)}>
                <img src={cat.avatar} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h3 className="font-bold text-gray-900 leading-none mb-1 flex items-center">
                    {cat.name}
                    {community && (
                      <span className="ml-2 bg-amber-50 text-amber-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase border border-amber-100">
                        In {community.name}
                      </span>
                    )}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">{owner.accountName}</p>
                </div>
              </div>
              <button 
                onClick={() => onFollow(owner.id)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${isFollowing ? 'bg-gray-100 text-gray-400' : 'bg-amber-100 text-amber-600'}`}
              >
                {isFollowing ? 'Following' : 'Follow +'}
              </button>
            </div>

            <div className="px-4 pb-4">
              <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {post.tags.map(tag => (
                  <button key={tag} onClick={() => onChallengeTagClick?.(`#${tag}`)} className="text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded hover:bg-indigo-100 transition-colors">#{tag}</button>
                ))}
              </div>
            </div>

            {post.mediaUrl && (
              <div className="w-full h-auto max-h-[500px] overflow-hidden">
                <img src={post.mediaUrl} className="w-full h-full object-contain bg-gray-50" />
              </div>
            )}

            <div className="p-4 border-t flex items-center justify-between">
               <div className="flex space-x-6 items-center">
                  <button onClick={() => onLike(post.id)} className="text-gray-500 text-sm flex items-center space-x-1 hover:text-rose-500 group">
                    <span className="group-active:scale-125 transition-transform">❤️</span> 
                    <span className="font-bold">{post.likes}</span>
                  </button>
                  <button onClick={() => setSelectedPostId(isCommenting ? null : post.id)} className={`text-sm flex items-center space-x-1 font-bold ${isCommenting ? 'text-amber-600' : 'text-gray-500'}`}>
                    <span>💬</span> <span>{post.comments.length}</span>
                  </button>
               </div>
               <div className="flex items-center space-x-2">
                  <span className="text-xs text-amber-600 font-black">🪙 {post.tips}</span>
                  {post.ownerId !== currentUserId && (
                    <button onClick={() => onTip(post.id, 5)} className="bg-amber-500 text-white px-3 py-1.5 rounded-xl text-[9px] font-black shadow-md hover:scale-110 active:scale-95 transition-transform">TIP 5</button>
                  )}
               </div>
            </div>

            {isCommenting && (
              <div className="p-4 bg-gray-50 border-t">
                <div className="space-y-4 mb-4">
                  {post.comments.map(c => {
                    const cOwner = getOwner(c.ownerId);
                    return (
                      <div key={c.id} className="flex space-x-3">
                        <img src={cOwner.avatar} className="w-8 h-8 rounded-full object-cover" />
                        <div className="bg-white p-3 rounded-2xl border shadow-sm flex-1">
                          <p className="text-[10px] font-black text-amber-600 uppercase mb-1">{cOwner.accountName}</p>
                          <p className="text-xs text-gray-700 font-medium">{c.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex space-x-2">
                  <input 
                    type="text"
                    placeholder="Write a comment..."
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                    value={commentInputs[post.id] || ''}
                    onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleCommentSubmit(post.id)}
                  />
                  <button onClick={() => handleCommentSubmit(post.id)} className="bg-amber-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">Post</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Feed;
