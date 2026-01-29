
import React, { useState, useRef, useMemo } from 'react';
import { OwnerProfile, Post, PurchaseRecord, CatProfile, Community } from '../types';
import Feed from './Feed';
import { CAT_BREEDS } from '../constants';
import { MOCK_OWNERS } from '../mockData';
import PaymentModal from './PaymentModal';

interface ProfileProps {
  owner: OwnerProfile;
  posts: Post[];
  communities: Community[];
  purchases: PurchaseRecord[];
  isOwnProfile: boolean;
  onUpdateOwner: (updated: Partial<OwnerProfile>) => void;
  onUpdateCat: (catId: string, updated: Partial<CatProfile>) => void;
  onAddCat: (cat: CatProfile) => void;
  onDeleteCat: (catId: string) => void;
  onTopUp: (amount: number) => void;
  onTip: (postId: string, amount: number) => void;
  followingIds: string[];
  onFollow: (ownerId: string) => void;
  onChat: (ownerId: string) => void;
  onBack?: () => void;
  onViewOtherProfile?: (ownerId: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ 
  owner, 
  posts, 
  communities,
  purchases, 
  isOwnProfile,
  onUpdateOwner,
  onUpdateCat,
  onAddCat,
  onDeleteCat,
  onTopUp, 
  onTip,
  followingIds,
  onFollow,
  onChat,
  onBack,
  onViewOtherProfile
}) => {
  const [activeTab, setActiveTab] = useState<'Posts' | 'Pets' | 'Purchases' | 'Friends'>('Posts');
  const [isEditingOwner, setIsEditingOwner] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [showTopUpOptions, setShowTopUpOptions] = useState(false);
  const [selectedCatIdForPosts, setSelectedCatIdForPosts] = useState<string | 'all'>('all');
  
  // Payment State
  const [pendingTopUp, setPendingTopUp] = useState<{amount: number, usdPrice: number} | null>(null);
  
  const ownerFileRef = useRef<HTMLInputElement>(null);
  const catFileRef = useRef<HTMLInputElement>(null);
  const addCatFileRef = useRef<HTMLInputElement>(null);

  // Owner Edit Form State
  const [ownerForm, setOwnerForm] = useState({
    accountName: owner.accountName,
    bio: owner.bio,
    avatar: owner.avatar
  });

  // Cat Form State
  const [catForm, setCatForm] = useState<Partial<CatProfile>>({});

  const handleOwnerFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setOwnerForm({ ...ownerForm, avatar: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleCatFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCatForm({ ...catForm, avatar: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSaveOwner = () => {
    onUpdateOwner(ownerForm);
    setIsEditingOwner(false);
  };

  const handleStartEditCat = (cat: CatProfile) => {
    setCatForm({ ...cat });
    setEditingCatId(cat.id);
  };

  const handleSaveCat = () => {
    if (editingCatId) {
      onUpdateCat(editingCatId, catForm);
      setEditingCatId(null);
    }
  };

  const handleSaveNewCat = () => {
    const newCat: CatProfile = {
      id: Math.random().toString(36).substr(2, 9),
      ownerId: owner.id,
      name: catForm.name || 'New Kitty',
      breed: catForm.breed || 'Other',
      age: catForm.age || 1,
      gender: catForm.gender || 'Female',
      neutered: catForm.neutered || false,
      personality: catForm.personality || ['Curious'],
      healthTags: catForm.healthTags || [],
      avatar: catForm.avatar || 'https://picsum.photos/seed/cat/200/200',
      bio: catForm.bio || ''
    };
    onAddCat(newCat);
    setIsAddingCat(false);
    setCatForm({});
  };

  const isFollowing = followingIds.includes(owner.id);
  
  const filteredPostsByCat = useMemo(() => {
    const ownerPosts = posts.filter(p => p.ownerId === owner.id);
    if (selectedCatIdForPosts === 'all') return ownerPosts;
    return ownerPosts.filter(p => p.catId === selectedCatIdForPosts);
  }, [posts, owner.id, selectedCatIdForPosts]);

  const handlePetPostView = (catId: string) => {
    setSelectedCatIdForPosts(catId);
    setActiveTab('Posts');
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Owner Header Section */}
      <div className="bg-white rounded-[40px] border shadow-sm mb-6 overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 relative">
          {!isOwnProfile && onBack && (
            <button onClick={onBack} className="absolute top-6 left-6 bg-black/20 backdrop-blur-md text-white border border-white/30 px-4 py-2 rounded-2xl font-black text-xs hover:bg-black/40 transition-all">
              ← BACK
            </button>
          )}
          {isOwnProfile && (
            <button onClick={() => setIsEditingOwner(!isEditingOwner)} className="absolute top-6 right-6 bg-white/20 backdrop-blur-md text-white border border-white/30 px-5 py-2 rounded-2xl font-black text-xs hover:bg-white/40 transition-all">
              {isEditingOwner ? 'CANCEL' : 'EDIT IDENTITY'}
            </button>
          )}
        </div>

        <div className="px-10 pb-10 relative">
          <div className="absolute -top-16 left-10">
            <div className="relative group cursor-pointer" onClick={() => isEditingOwner && ownerFileRef.current?.click()}>
              <img src={isEditingOwner ? ownerForm.avatar : owner.avatar} className="w-32 h-32 rounded-[40px] border-4 border-white shadow-2xl object-cover bg-white" />
              {isEditingOwner && (
                <div className="absolute inset-0 bg-black/40 rounded-[40px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-[10px] font-black uppercase text-center px-4">Change Photo</span>
                </div>
              )}
              <input type="file" ref={ownerFileRef} onChange={handleOwnerFile} className="hidden" accept="image/*" />
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full"></div>
            </div>
          </div>

          <div className="pt-20 flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="flex-1">
              {isEditingOwner ? (
                <div className="space-y-4 max-w-md animate-in slide-in-from-left-2">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Account Name</label>
                    <input className="text-3xl font-black w-full border-b-2 border-amber-500 focus:outline-none py-1 bg-transparent" value={ownerForm.accountName} onChange={e => setOwnerForm({...ownerForm, accountName: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Bio</label>
                    <textarea className="w-full bg-gray-50 p-4 rounded-2xl border border-gray-100 focus:outline-none h-24 text-sm font-medium" value={ownerForm.bio} onChange={e => setOwnerForm({...ownerForm, bio: e.target.value})} />
                  </div>
                  <button onClick={handleSaveOwner} className="bg-amber-500 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-amber-200 uppercase tracking-widest text-xs">Save Identity</button>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-3 mb-4">
                    <h3 className="text-3xl font-black text-gray-900 tracking-tight">{owner.accountName}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed max-w-xl text-sm font-medium mb-6">{owner.bio}</p>
                  
                  {!isOwnProfile && (
                    <div className="flex items-center space-x-3">
                      <button onClick={() => onFollow(owner.id)} className={`px-10 py-3 rounded-2xl font-black text-xs tracking-widest transition-all ${isFollowing ? 'bg-gray-100 text-gray-400' : 'bg-amber-500 text-white shadow-lg shadow-amber-100'}`}>
                        {isFollowing ? 'FOLLOWING' : 'FOLLOW +'}
                      </button>
                      <button onClick={() => onChat(owner.id)} className="px-10 py-3 bg-white border-2 border-amber-500 text-amber-500 rounded-2xl font-black text-xs tracking-widest hover:bg-amber-50 transition-all">
                        ✉️ MESSAGE
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="w-full md:w-64 bg-amber-50/50 rounded-3xl p-6 border border-amber-100">
              <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Cat Coins ✨</span>
              <div className="text-4xl font-black text-amber-600 mb-4">🪙 {owner.coinBalance}</div>
              {isOwnProfile && (
                <button onClick={() => setShowTopUpOptions(true)} className="w-full bg-amber-500 text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-200">
                  RECHARGE COINS
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="bg-white rounded-[40px] border shadow-sm p-8">
        <div className="flex space-x-8 border-b border-gray-100 mb-8 px-4 overflow-x-auto">
          {['Posts', 'Pets', 'Purchases', 'Friends'].map((tab) => (
            (isOwnProfile || tab !== 'Purchases') && (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`pb-5 px-2 text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'text-amber-500 border-b-4 border-amber-500' : 'text-gray-400'}`}>
                {tab}
              </button>
            )
          ))}
        </div>

        {activeTab === 'Posts' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
              <button 
                onClick={() => setSelectedCatIdForPosts('all')}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedCatIdForPosts === 'all' ? 'bg-amber-500 text-white shadow-md shadow-amber-100' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}
              >
                All Pets
              </button>
              {owner.cats.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setSelectedCatIdForPosts(cat.id)}
                  className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center space-x-2 ${selectedCatIdForPosts === cat.id ? 'bg-amber-500 text-white shadow-md shadow-amber-100' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}
                >
                  <img src={cat.avatar} className="w-4 h-4 rounded-full object-cover" />
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
            
            <Feed 
              posts={filteredPostsByCat} 
              communities={communities}
              onTip={onTip} 
              onLike={() => {}} 
              onComment={() => {}} 
              followingIds={followingIds} 
              onFollow={onFollow} 
              onViewProfile={onViewOtherProfile} 
              currentUserId={isOwnProfile ? owner.id : 'owner_me'} 
            />
          </div>
        )}

        {activeTab === 'Pets' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {owner.cats.map(cat => {
              const isEditing = editingCatId === cat.id;
              return (
                <div key={cat.id} className={`p-8 rounded-[40px] border-2 bg-white transition-all ${isEditing ? 'border-amber-500 shadow-xl' : 'border-amber-50'}`}>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div onClick={() => catFileRef.current?.click()} className="cursor-pointer relative group">
                          <img src={catForm.avatar} className="w-16 h-16 rounded-2xl object-cover shadow-md border-2 border-white" />
                          <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-[8px] font-black">EDIT</span>
                          </div>
                        </div>
                        <input type="file" ref={catFileRef} onChange={handleCatFile} className="hidden" accept="image/*" />
                        <div className="flex-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Name</label>
                          <input className="w-full bg-gray-50 border-none rounded-lg p-2 font-bold" value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} />
                        </div>
                      </div>
                      <select className="w-full bg-gray-50 border-none rounded-lg p-3 text-xs font-bold" value={catForm.breed} onChange={e => setCatForm({...catForm, breed: e.target.value})}>
                        {CAT_BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                      <textarea className="w-full bg-gray-50 border-none rounded-lg p-3 text-xs" value={catForm.bio} onChange={e => setCatForm({...catForm, bio: e.target.value})} placeholder="About your cat..." />
                      <div className="flex space-x-2">
                        <button onClick={handleSaveCat} className="flex-1 bg-amber-500 text-white py-3 rounded-2xl font-black text-[10px] uppercase">Save</button>
                        <button onClick={() => setEditingCatId(null)} className="flex-1 bg-gray-100 text-gray-500 py-3 rounded-2xl font-black text-[10px] uppercase">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col h-full">
                      <div className="flex justify-between items-start mb-6">
                        <img src={cat.avatar} className="w-20 h-20 rounded-[30px] object-cover shadow-md" />
                        <div className="flex flex-col space-y-2">
                           <button 
                             onClick={() => handlePetPostView(cat.id)}
                             className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-amber-500 text-white rounded-xl shadow-sm hover:scale-105 transition-transform"
                           >
                             View Posts
                           </button>
                           {isOwnProfile && (
                            <div className="flex space-x-2 justify-end">
                              <button onClick={() => handleStartEditCat(cat)} className="text-xs p-2 bg-amber-50 text-amber-500 rounded-lg">✏️</button>
                              <button onClick={() => onDeleteCat(cat.id)} className="text-xs p-2 bg-rose-50 text-rose-500 rounded-lg">🗑️</button>
                            </div>
                           )}
                        </div>
                      </div>
                      <h4 className="text-xl font-black text-gray-900">{cat.name}</h4>
                      <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest mb-4">{cat.breed} • {cat.age}y</p>
                      <p className="text-sm text-gray-500 mb-6 italic line-clamp-2">"{cat.bio || 'Living the dream life.'}"</p>
                    </div>
                  )}
                </div>
              );
            })}
            {isAddingCat ? (
              <div className="p-8 rounded-[40px] border-2 border-amber-500 bg-white shadow-xl animate-in zoom-in-95">
                <div className="flex items-center space-x-4 mb-4">
                  <div onClick={() => addCatFileRef.current?.click()} className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center cursor-pointer border border-dashed border-gray-300">
                    {catForm.avatar ? <img src={catForm.avatar} className="w-full h-full object-cover rounded-2xl" /> : <span className="text-2xl">📸</span>}
                  </div>
                  <input type="file" ref={addCatFileRef} onChange={handleCatFile} className="hidden" accept="image/*" />
                  <input className="flex-1 bg-gray-50 border-none rounded-lg p-3 font-bold" placeholder="Cat Name" onChange={e => setCatForm({...catForm, name: e.target.value})} />
                </div>
                <button onClick={handleSaveNewCat} className="w-full bg-amber-500 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-lg shadow-amber-200">Register Identity</button>
                <button onClick={() => setIsAddingCat(false)} className="w-full text-gray-400 font-black text-[10px] uppercase py-2">Cancel</button>
              </div>
            ) : isOwnProfile && (
              <button onClick={() => { setCatForm({ avatar: '' }); setIsAddingCat(true); }} className="p-8 rounded-[40px] border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-400 min-h-[250px] hover:border-amber-400 hover:text-amber-500 transition-all">
                <span className="text-4xl mb-2">➕</span>
                <span className="font-black text-[10px] uppercase tracking-widest">Add New Cat Card</span>
              </button>
            )}
          </div>
        )}

        {activeTab === 'Friends' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {MOCK_OWNERS.filter(o => o.id !== owner.id).map(friend => (
               <div key={friend.id} onClick={() => onViewOtherProfile?.(friend.id)} className="p-5 rounded-3xl border border-gray-100 bg-white flex items-center space-x-4 cursor-pointer hover:shadow-md transition-all">
                 <img src={friend.avatar} className="w-14 h-14 rounded-2xl object-cover" />
                 <h4 className="font-black text-gray-900 text-sm flex-1">{friend.accountName}</h4>
                 <span className="text-xs text-amber-500 font-black">VIEW 🐾</span>
               </div>
             ))}
          </div>
        )}

        {isOwnProfile && activeTab === 'Purchases' && (
          <div className="space-y-4">
            {purchases.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-4xl mb-2">🛒</p>
                <p className="font-black text-xs uppercase tracking-widest">No purchases yet</p>
              </div>
            ) : (
              purchases.map(p => (
                <div key={p.id} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-3xl border border-gray-100">
                  <img src={p.product.imageUrl} className="w-16 h-16 rounded-2xl object-cover" />
                  <div className="flex-1">
                    <p className="font-black text-gray-900 text-sm">{p.product.name}</p>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{new Date(p.timestamp).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-900">{p.paymentMethod === 'USD' ? `$${p.amountPaid.toFixed(2)}` : `🪙 ${p.amountPaid}`}</p>
                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Delivered</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Top Up Options Modal */}
      {showTopUpOptions && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl text-center">
            <h4 className="text-2xl font-black mb-2 text-gray-900 tracking-tight">Select Package</h4>
            <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-8">Refill your Cat Circle balance</p>
            <div className="grid grid-cols-2 gap-4 my-8">
              {[
                { coins: 500, price: 4.99 },
                { coins: 1200, price: 9.99 },
                { coins: 3000, price: 24.99 },
                { coins: 7000, price: 49.99 }
              ].map(pkg => (
                <button 
                  key={pkg.coins} 
                  onClick={() => { 
                    setPendingTopUp({ amount: pkg.coins, usdPrice: pkg.price });
                    setShowTopUpOptions(false);
                  }} 
                  className="p-6 rounded-3xl border-2 border-gray-100 hover:border-amber-500 hover:bg-amber-50 transition-all group"
                >
                  <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🪙</div>
                  <div className="font-black text-amber-600 text-lg">{pkg.coins}</div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">${pkg.price}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setShowTopUpOptions(false)} className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-gray-900 transition-colors">Close</button>
          </div>
        </div>
      )}

      {/* Actual Payment Modal for Top Up */}
      {pendingTopUp && (
        <PaymentModal 
          isOpen={!!pendingTopUp}
          onClose={() => setPendingTopUp(null)}
          onSuccess={() => onTopUp(pendingTopUp.amount)}
          amount={pendingTopUp.usdPrice}
          currency="USD"
          itemName={`${pendingTopUp.amount} Cat Coins Pack`}
        />
      )}
    </div>
  );
};

export default Profile;
