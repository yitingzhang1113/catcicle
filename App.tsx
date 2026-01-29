
import React, { useState, useRef, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Feed from './components/Feed';
import PostCreator from './components/PostCreator';
import CatAssistant from './components/CatAssistant';
import Mall from './components/Mall';
import Profile from './components/Profile';
import Auth from './components/Auth';
import Discover from './components/Discover';
import { MOCK_OWNERS, MOCK_CHALLENGES, MOCK_PRODUCTS } from './mockData';
import { Post, Product, OwnerProfile, PurchaseRecord, CatProfile, ChatMessage, CatChallenge, Comment, ProductReview, Community } from './types';
import { localDB } from './services/localDB';
import { apiService } from './services/apiService';

const App: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [userProfile, setUserProfile] = useState<OwnerProfile | null>(null);
  const [activeTab, setActiveTab] = useState('feed');
  const [isSyncing, setIsSyncing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseRecord[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [groupMessages, setGroupMessages] = useState<Record<string, ChatMessage[]>>({});
  const [chatList, setChatList] = useState<string[]>(['owner_luna']); 

  const [challenges] = useState<CatChallenge[]>(MOCK_CHALLENGES);
  const [mallProducts, setMallProducts] = useState<Product[]>(MOCK_PRODUCTS);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [tippingPost, setTippingPost] = useState<{id: string, amount: number} | null>(null);
  const [activeChatTarget, setActiveChatTarget] = useState<string | null>(null);
  const [activeGroupTarget, setActiveGroupTarget] = useState<string | null>(null);
  const [messageView, setMessageView] = useState<'direct' | 'groups'>('direct');
  const [chatInput, setChatInput] = useState('');
  const [chatImage, setChatImage] = useState<string | null>(null);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [newCommName, setNewCommName] = useState('');
  const [newCommDesc, setNewCommDesc] = useState('');

  useEffect(() => {
    const initApp = async () => {
      try {
        localDB.init();
        const sessionId = localDB.getCurrentUserId();
        
        const [allPosts, allCommunities] = await Promise.all([
          apiService.getPosts(),
          apiService.getCommunities()
        ]);

        setPosts(allPosts);
        setCommunities(allCommunities);

        if (sessionId) {
          const user = await apiService.getCurrentUser(sessionId);
          if (user) {
            const [purchases, following, directMsgs] = await Promise.all([
              apiService.getPurchases(user.id),
              apiService.getFollowing(user.id),
              apiService.getDirectMessages(user.id)
            ]);
            setUserProfile(user);
            setPurchaseHistory(purchases);
            setFollowingIds(following);
            setChatMessages(directMsgs);
          }
        }
      } catch (err: any) {
        setApiError('Unable to connect to CatCloud.');
        console.error(err);
      } finally {
        setTimeout(() => setIsLoaded(true), 1500);
      }
    };
    initApp();
  }, []);

  useEffect(() => {
    if (isLoaded && userProfile) {
      const syncData = async () => {
        try {
          setIsSyncing(true);
          await apiService.updateUser(userProfile);
        } catch (err) {
          console.warn('Sync failed');
        } finally {
          setIsSyncing(false);
        }
      };
      syncData();
    }
  }, [userProfile, isLoaded]);

  const handleLogin = async (user: OwnerProfile) => {
    setIsLoaded(false);
    localDB.setCurrentUserId(user.id);
    try {
      const [purchases, following, directMsgs] = await Promise.all([
        apiService.getPurchases(user.id),
        apiService.getFollowing(user.id),
        apiService.getDirectMessages(user.id)
      ]);
      setUserProfile(user);
      setPurchaseHistory(purchases);
      setFollowingIds(following);
      setChatMessages(directMsgs);
      setActiveTab('feed');
    } catch (err) {
      setApiError('Sign in failed.');
    } finally {
      setIsLoaded(true);
    }
  };

  const handleLogout = () => {
    localDB.setCurrentUserId(null);
    setUserProfile(null);
    setActiveTab('feed');
  };

  // 核心更新：处理查看任何用户主页的跳转逻辑
  const handleViewProfile = (ownerId: string) => {
    setViewingProfileId(ownerId);
    setActiveTab('profile');
  };

  const filteredPosts = useMemo(() => {
    if (!searchTerm.trim()) return posts;
    const lower = searchTerm.toLowerCase();
    const isTagSearch = lower.startsWith('#');
    const tagToSearch = isTagSearch ? lower.slice(1) : lower;

    return posts.filter(post => {
      if (isTagSearch) return post.tags.some(tag => tag.toLowerCase() === tagToSearch);
      const owner = MOCK_OWNERS.find(o => o.id === post.ownerId) || (post.ownerId === userProfile?.id ? userProfile : null);
      const ownerMatch = owner?.accountName.toLowerCase().includes(lower);
      const tagMatch = post.tags.some(tag => tag.toLowerCase().includes(lower));
      const contentMatch = post.content.toLowerCase().includes(lower);
      return ownerMatch || tagMatch || contentMatch;
    });
  }, [posts, searchTerm, userProfile]);

  const handlePostCreated = async (post: Post) => {
    if (!userProfile) return;
    try {
      setIsSyncing(true);
      const created = await apiService.createPost(post);
      setPosts([created, ...posts]);
      setUserProfile(prev => prev ? ({ ...prev, coinBalance: prev.coinBalance + 10 }) : null);
      setActiveTab('feed');
    } catch (err) {
      alert('Failed to publish.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConfirmTip = () => {
    if (!tippingPost || !userProfile) return;
    const { id, amount } = tippingPost;
    if (userProfile.coinBalance < amount) return;
    setUserProfile(prev => prev ? ({ ...prev, coinBalance: prev.coinBalance - amount }) : null);
    setPosts(prev => prev.map(p => p.id === id ? { ...p, tips: (p.tips || 0) + amount } : p));
    setTippingPost(null);
  };

  const handleLike = (postId: string) => setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));

  const handleAddComment = (postId: string, text: string) => {
    if (!userProfile) return;
    const newComment: Comment = { id: Math.random().toString(36).substr(2, 9), ownerId: userProfile.id, text, timestamp: Date.now() };
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p));
  };

  const handleFollow = (ownerId: string) => setFollowingIds(prev => prev.includes(ownerId) ? prev.filter(id => id !== ownerId) : [...prev, ownerId]);

  const handleChatRequest = (ownerId: string) => {
    if (!chatList.includes(ownerId)) setChatList(prev => [ownerId, ...prev]);
    setActiveChatTarget(ownerId);
    setActiveGroupTarget(null);
    setMessageView('direct');
    setViewingProfileId(null);
    setActiveTab('chats');
  };

  const handleSendChatMessage = () => {
    if ((!chatInput.trim() && !chatImage) || !userProfile) return;
    const newMessage: ChatMessage = { id: Date.now().toString(), senderId: userProfile.id, text: chatInput.trim() || undefined, imageUrl: chatImage || undefined, timestamp: Date.now() };
    if (messageView === 'direct' && activeChatTarget) {
      setChatMessages(prev => ({ ...prev, [activeChatTarget]: [...(prev[activeChatTarget] || []), newMessage] }));
      setChatInput(''); setChatImage(null);
      setTimeout(() => {
        const reply: ChatMessage = { id: Date.now().toString(), senderId: activeChatTarget, text: "Meow! 🐾", timestamp: Date.now() };
        setChatMessages(prev => ({ ...prev, [activeChatTarget]: [...(prev[activeChatTarget] || []), reply] }));
      }, 1000);
    } else if (messageView === 'groups' && activeGroupTarget) {
      setGroupMessages(prev => ({ ...prev, [activeGroupTarget]: [...(prev[activeGroupTarget] || []), newMessage] }));
      setChatInput(''); setChatImage(null);
    }
  };

  const handleCreateCommunity = async () => {
    if (!newCommName.trim() || !userProfile) return;
    try {
      const newComm: Community = { id: `comm_${Math.random().toString(36).substr(2, 5)}`, name: newCommName, description: newCommDesc, avatar: `https://picsum.photos/seed/${newCommName}/200/200`, memberIds: [userProfile.id], creatorId: userProfile.id };
      const created = await apiService.createCommunity(newComm);
      setCommunities([...communities, created]);
      setNewCommName(''); setNewCommDesc(''); setShowCreateCommunity(false);
    } catch (err) {
      alert('Failed.');
    }
  };

  const handlePurchase = (product: Product, method: 'USD' | 'Coins') => {
    if (!userProfile) return;
    const price = method === 'USD' ? product.usdPrice : product.catCoinPrice;
    if (method === 'Coins' && userProfile.coinBalance < price) return alert("Not enough coins!");
    const newPurchase: PurchaseRecord = { id: Math.random().toString(36).substr(2, 9), product, paymentMethod: method, amountPaid: price, timestamp: Date.now() };
    setPurchaseHistory([newPurchase, ...purchaseHistory]);
    if (method === 'Coins') setUserProfile(prev => prev ? ({ ...prev, coinBalance: prev.coinBalance - price }) : null);
  };

  const handleAddProductReview = (productId: string, rating: number, comment: string) => {
    if (!userProfile) return;
    const newReview: ProductReview = { id: Math.random().toString(36).substr(2, 9), ownerId: userProfile.id, rating, comment, timestamp: Date.now() };
    setMallProducts(prev => prev.map(p => p.id === productId ? { ...p, reviews: [newReview, ...p.reviews] } : p));
  };

  const handleUpdateOwner = (updated: Partial<OwnerProfile>) => setUserProfile(prev => prev ? ({ ...prev, ...updated }) : null);

  const handleUpdateCat = (catId: string, updated: Partial<CatProfile>) => setUserProfile(prev => prev ? ({ ...prev, cats: prev.cats.map(c => c.id === catId ? { ...c, ...updated } : c) }) : null);

  const handleAddCat = (cat: CatProfile) => setUserProfile(prev => prev ? ({ ...prev, cats: [...prev.cats, cat] }) : null);

  const handleDeleteCat = (catId: string) => setUserProfile(prev => prev ? ({ ...prev, cats: prev.cats.filter(c => c.id !== catId) }) : null);

  const handleTopUp = (amount: number) => setUserProfile(prev => prev ? ({ ...prev, coinBalance: prev.coinBalance + amount }) : null);

  if (!isLoaded) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10">
       <div className="w-32 h-32 mb-8 animate-pulse">
          <img src="https://api.typedream.com/v0/document/public/ac662580-562a-43f1-9c3e-8f65457f002b_logo_png" alt="Loading Logo" className="w-full h-full object-contain" />
       </div>
       <div className="flex space-x-2">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
       </div>
       <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-amber-600">Syncing with CatCloud</p>
    </div>
  );

  if (!userProfile) return <Auth onLogin={handleLogin} />;

  const myCommunities = communities.filter(c => userProfile && c.memberIds.includes(userProfile.id));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row max-w-[1200px] mx-auto relative">
      {isSyncing && <div className="fixed top-4 right-4 z-[1000] bg-white/80 backdrop-blur px-4 py-2 rounded-full border shadow-sm flex items-center space-x-2 animate-in fade-in slide-in-from-top-2"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div><span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Syncing...</span></div>}

      <Sidebar activeTab={activeTab} setActiveTab={(tab) => { if (tab === 'profile') setViewingProfileId(null); setActiveTab(tab); }} owner={userProfile} onLogout={handleLogout} />
      
      <main className="flex-1 p-4 md:p-10">
        <header className="mb-12 flex justify-between items-center">
          <h2 className="text-4xl font-black text-gray-900 tracking-tight capitalize">{activeTab.replace('_', ' ')}</h2>
          <div className="flex bg-white px-6 py-4 rounded-[30px] shadow-sm border border-gray-100 items-center space-x-4"><span className="text-amber-500 font-black text-2xl">🪙 {userProfile.coinBalance}</span></div>
        </header>

        {activeTab === 'feed' && (
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-black text-gray-900">Square</h3><button onClick={() => setShowCreateCommunity(true)} className="bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-black transition-all">+ Create Community</button></div>
            <PostCreator onPostCreated={handlePostCreated} onTriageRedirect={() => setActiveTab('assistant')} owner={userProfile} challenges={challenges} communities={communities} />
            <div className="mb-8 relative"><input type="text" placeholder="Search..." className="w-full bg-white border-2 border-amber-50 rounded-2xl px-12 py-4 text-sm font-medium shadow-sm outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /><span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-40">🔍</span></div>
            {/* Feed 使用 handleViewProfile */}
            <Feed posts={filteredPosts} communities={communities} followingIds={followingIds} onTip={(id, amount) => setTippingPost({id, amount})} onLike={handleLike} onComment={handleAddComment} onFollow={handleFollow} onViewProfile={handleViewProfile} challenges={challenges} onChallengeTagClick={setSearchTerm} currentUserId={userProfile.id} />
          </div>
        )}

        {activeTab === 'discover' && (
          /* Discover 使用 handleViewProfile */
          <Discover onChat={handleChatRequest} onViewProfile={handleViewProfile} />
        )}

        {activeTab === 'chats' && (
          <div className="max-w-5xl mx-auto h-[700px] flex bg-white rounded-[40px] border overflow-hidden shadow-2xl">
             <div className="w-80 border-r bg-gray-50/10 flex flex-col"><div className="p-6 border-b bg-white flex space-x-2"><button onClick={() => { setMessageView('direct'); setActiveGroupTarget(null); }} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${messageView === 'direct' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-400'}`}>Direct</button><button onClick={() => { setMessageView('groups'); setActiveChatTarget(null); }} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${messageView === 'groups' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-400'}`}>Groups</button></div><div className="flex-1 overflow-y-auto">{messageView === 'direct' ? chatList.map(oid => { const owner = MOCK_OWNERS.find(o => o.id === oid); if (!owner) return null; const isActive = activeChatTarget === oid; return <button key={oid} onClick={() => setActiveChatTarget(oid)} className={`w-full p-6 flex items-center space-x-4 border-b ${isActive ? 'bg-amber-50 border-r-4 border-amber-500' : 'bg-white'}`}><img src={owner.avatar} className="w-12 h-12 rounded-2xl object-cover" /><p className="font-black text-gray-900 text-sm">{owner.accountName}</p></button>; }) : myCommunities.map(comm => { const isActive = activeGroupTarget === comm.id; return <button key={comm.id} onClick={() => setActiveGroupTarget(comm.id)} className={`w-full p-6 flex items-center space-x-4 border-b ${isActive ? 'bg-amber-50 border-r-4 border-amber-500' : 'bg-white'}`}><img src={comm.avatar} className="w-12 h-12 rounded-2xl object-cover" /><p className="font-black text-gray-900 text-sm truncate">{comm.name}</p></button>; })}</div></div>
             <div className="flex-1 flex flex-col bg-white">{(activeChatTarget || activeGroupTarget) ? <div className="h-full flex flex-col"><div className="p-6 border-b flex items-center space-x-4"><img src={activeChatTarget ? MOCK_OWNERS.find(o => o.id === activeChatTarget)?.avatar : communities.find(c => c.id === activeGroupTarget)?.avatar} className="w-10 h-10 rounded-xl" /><h4 className="font-black text-gray-900">{activeChatTarget ? MOCK_OWNERS.find(o => o.id === activeChatTarget)?.accountName : communities.find(c => c.id === activeGroupTarget)?.name}</h4></div><div className="flex-1 p-8 overflow-y-auto space-y-4 bg-gray-50/20">{(activeChatTarget ? (chatMessages[activeChatTarget] || []) : (groupMessages[activeGroupTarget!] || [])).map(m => { const isMe = m.senderId === userProfile.id; const sender = MOCK_OWNERS.find(o => o.id === m.senderId) || (m.senderId === userProfile.id ? userProfile : null); return <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}><div className="max-w-[70%]">{!isMe && messageView === 'groups' && <p className="text-[8px] font-black text-amber-600 uppercase mb-1">{sender?.accountName}</p>}<div className={`p-4 rounded-3xl ${isMe ? 'bg-amber-500 text-white rounded-br-none' : 'bg-white text-gray-800 border rounded-bl-none'}`}>{m.imageUrl && <img src={m.imageUrl} className="rounded-xl mb-2" />}<p className="text-sm font-medium">{m.text}</p></div></div></div>; })}</div><div className="p-6 border-t"><div className="flex space-x-2"><input className="flex-1 bg-gray-100 rounded-2xl p-4 text-sm font-medium border-none outline-none focus:ring-2 focus:ring-amber-500" placeholder="Meow..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendChatMessage()} /><button onClick={handleSendChatMessage} className="bg-amber-500 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg">🚀</button></div></div></div> : <div className="flex-1 flex flex-col items-center justify-center p-20 text-center text-gray-300"><p className="text-6xl mb-6">💬</p><p className="font-black uppercase tracking-[0.2em] text-[10px]">Select a conversation</p></div>}</div>
          </div>
        )}

        {activeTab === 'assistant' && <CatAssistant onShareToCommunity={handlePostCreated} products={mallProducts} onGoToMall={(pid) => { if(pid) setSearchTerm(pid); setActiveTab('mall'); }} />}
        {activeTab === 'mall' && <Mall onPurchase={handlePurchase} userCoins={userProfile.coinBalance} products={mallProducts} onAddReview={handleAddProductReview} />}
        {activeTab === 'profile' && <Profile owner={viewingProfileId ? (MOCK_OWNERS.find(o => o.id === viewingProfileId) || userProfile) : userProfile} posts={posts} communities={communities} purchases={!viewingProfileId ? purchaseHistory : []} isOwnProfile={!viewingProfileId} onUpdateOwner={handleUpdateOwner} onUpdateCat={handleUpdateCat} onAddCat={handleAddCat} onDeleteCat={handleDeleteCat} onTopUp={handleTopUp} onTip={(id, amount) => setTippingPost({id, amount})} followingIds={followingIds} onFollow={handleFollow} onChat={handleChatRequest} onViewOtherProfile={handleViewProfile} onBack={() => { setViewingProfileId(null); setActiveTab('feed'); }} />}
      </main>

      {showCreateCommunity && <div className="fixed inset-0 z-[400] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"><div className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95"><h3 className="text-2xl font-black text-gray-900 mb-6">Create New Circle</h3><div className="space-y-4"><div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Community Name</label><input className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold" value={newCommName} onChange={e => setNewCommName(e.target.value)} /></div><div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Description</label><textarea className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold h-24" value={newCommDesc} onChange={e => setNewCommDesc(e.target.value)} /></div><button onClick={handleCreateCommunity} className="w-full bg-amber-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Establish Circle</button><button onClick={() => setShowCreateCommunity(false)} className="w-full text-gray-400 font-black text-[10px] uppercase tracking-widest mt-4">Dismiss</button></div></div></div>}
      {tippingPost && <div className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-white rounded-[40px] p-10 max-sm-sm w-full text-center"><h3 className="text-xl font-black text-gray-900 mb-2">Tip {tippingPost.amount} Coins?</h3><div className="flex space-x-3 mt-6"><button onClick={() => setTippingPost(null)} className="flex-1 bg-gray-100 text-gray-400 py-4 rounded-2xl font-black text-[10px] uppercase">Cancel</button><button onClick={handleConfirmTip} className="flex-1 bg-amber-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase">Confirm</button></div></div></div>}
    </div>
  );
};

export default App;
