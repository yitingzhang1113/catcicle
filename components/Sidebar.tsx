
import React from 'react';
import { OwnerProfile } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  owner: OwnerProfile;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, owner, onLogout }) => {
  const navItems = [
    { id: 'feed', label: 'Square', icon: '🐾' },
    { id: 'discover', label: 'Matching', icon: '✨' },
    { id: 'assistant', label: 'AI Assistant', icon: '🐱' },
    { id: 'mall', label: 'Mall', icon: '🛍️' },
    { id: 'chats', label: 'Messages', icon: '💬' },
    { id: 'profile', label: 'Profile', icon: '🏠' },
  ];

  return (
    <div className="w-full md:w-64 bg-white border-r-2 border-gray-50 h-full md:sticky top-0 p-6 flex flex-col">
      {/* Updated Logo Section */}
      <div 
        className="flex items-center space-x-3 mb-12 px-2 group cursor-pointer" 
        onClick={() => setActiveTab('feed')}
      >
        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg shadow-amber-100 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
          <img src="https://api.typedream.com/v0/document/public/ac662580-562a-43f1-9c3e-8f65457f002b_logo_png" alt="CatCircle Logo" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-2xl font-black text-amber-600 tracking-tighter">CatCircle</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-4 px-4 py-4 rounded-2xl transition-all ${
              activeTab === item.id 
                ? 'bg-amber-100 text-amber-700 font-black shadow-inner' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-sm uppercase tracking-widest font-bold">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-8 border-t-2 border-gray-50 space-y-4">
        <div 
          className="flex items-center space-x-4 px-2 cursor-pointer group"
          onClick={() => setActiveTab('profile')}
        >
          <div className="relative">
            <img src={owner.avatar} alt="Me" className="w-12 h-12 rounded-2xl border-2 border-amber-200 object-cover shadow-sm group-hover:scale-110 transition-transform" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-black text-gray-900 truncate tracking-tight">{owner.accountName}</p>
            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest truncate">{owner.cats[0]?.name || 'Meow'}'s Parent</p>
          </div>
        </div>
        
        <button 
          onClick={onLogout}
          className="w-full px-4 py-2 text-[9px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
        >
          🚪 Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
