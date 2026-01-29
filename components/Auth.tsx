
import React, { useState } from 'react';
import { OwnerProfile, CatProfile } from '../types';
import { CAT_BREEDS } from '../constants';
import { localDB } from '../services/localDB';

interface AuthProps {
  onLogin: (user: OwnerProfile) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [error, setError] = useState('');
  
  const [accountName, setAccountName] = useState('');
  const [email, setEmail] = useState('');
  const [catName, setCatName] = useState('');
  const [catBreed, setCatBreed] = useState('Ragdoll');

  const existingUsers = localDB.getUsers();

  const handleSignIn = (user: OwnerProfile) => {
    localDB.setCurrentUserId(user.id);
    onLogin(user);
  };

  const handleManualSignIn = () => {
    const lowerInput = accountName.toLowerCase();
    const user = existingUsers.find(u => 
      u.accountName.toLowerCase() === lowerInput || 
      u.email?.toLowerCase() === lowerInput
    );

    if (user) {
      handleSignIn(user);
    } else {
      setError('User not found. Check your name/email or Sign Up!');
    }
  };

  const handleSignUp = () => {
    if (!accountName || !catName || !email) {
      setError('Your name, email, and cat\'s name are all required!');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (existingUsers.some(u => u.email?.toLowerCase() === email.toLowerCase())) {
      setError('This email is already registered. Please sign in.');
      return;
    }

    const newOwnerId = `owner_${Math.random().toString(36).substr(2, 5)}`;
    const newCatId = `cat_${Math.random().toString(36).substr(2, 5)}`;

    const newCat: CatProfile = {
      id: newCatId,
      ownerId: newOwnerId,
      name: catName,
      breed: catBreed,
      age: 1,
      gender: 'Female',
      neutered: true,
      personality: ['Curious'],
      healthTags: [],
      avatar: `https://picsum.photos/seed/${newCatId}/200/200`,
      bio: `The start of a grand adventure.`
    };

    const newUser: OwnerProfile = {
      id: newOwnerId,
      accountName,
      email,
      avatar: `https://i.pravatar.cc/150?u=${newOwnerId}`,
      bio: `New member of the CatCircle family!`,
      coinBalance: 500,
      followersCount: 0,
      followingCount: 0,
      cats: [newCat],
      interests: [catBreed]
    };

    localDB.saveUser(newUser);
    handleSignIn(newUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center p-6">
      <div className="bg-white/95 backdrop-blur-xl rounded-[50px] shadow-2xl w-full max-w-lg p-10 md:p-16 animate-in zoom-in-95 duration-500 border border-white/20">
        <div className="text-center mb-12">
          {/* Main Brand Logo */}
          <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center shadow-2xl shadow-amber-500/20 mx-auto mb-8 transform -rotate-3 hover:rotate-0 transition-all duration-700 overflow-hidden border-4 border-amber-50">
             <img src="https://api.typedream.com/v0/document/public/ac662580-562a-43f1-9c3e-8f65457f002b_logo_png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">CatCircle</h1>
          <p className="text-gray-500 font-medium text-sm">Where cats lead the social life.</p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-2xl mb-10">
          <button 
            onClick={() => { setMode('signin'); setError(''); }}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'signin' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Sign In
          </button>
          <button 
            onClick={() => { setMode('signup'); setError(''); }}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'signup' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-xs font-bold mb-6 animate-in slide-in-from-top-2">
            ⚠️ {error}
          </div>
        )}

        {mode === 'signin' ? (
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block pl-1">Your Name or Email</label>
              <input 
                type="text" 
                placeholder="e.g. Ragdoll_Official"
                value={accountName}
                onChange={e => setAccountName(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl p-5 text-sm font-bold focus:ring-4 focus:ring-amber-500/10 transition-all outline-none"
              />
            </div>
            
            <button 
              onClick={handleManualSignIn}
              className="w-full bg-amber-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-amber-500/20 hover:bg-amber-600 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              Enter Circle
            </button>

            <div className="pt-8 border-t">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 text-center">Quick Login</p>
              <div className="grid grid-cols-2 gap-4">
                {existingUsers.slice(0, 2).map(user => (
                  <button 
                    key={user.id} 
                    onClick={() => handleSignIn(user)}
                    className="flex items-center space-x-3 p-3 bg-white border border-gray-100 rounded-2xl hover:bg-amber-50 hover:border-amber-200 transition-all text-left"
                  >
                    <img src={user.avatar} className="w-10 h-10 rounded-xl object-cover" />
                    <span className="text-xs font-black text-gray-700 truncate">{user.accountName}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
               <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block pl-1">Your Identity</label>
                <input 
                  type="text" 
                  placeholder="Your Name"
                  value={accountName}
                  onChange={e => setAccountName(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl p-5 text-sm font-bold focus:ring-4 focus:ring-amber-500/10 transition-all outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block pl-1">Email Address</label>
                <input 
                  type="email" 
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl p-5 text-sm font-bold focus:ring-4 focus:ring-amber-500/10 transition-all outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block pl-1">Your First Cat's Name</label>
                <input 
                  type="text" 
                  placeholder="Mochi"
                  value={catName}
                  onChange={e => setCatName(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl p-5 text-sm font-bold focus:ring-4 focus:ring-amber-500/10 transition-all outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block pl-1">Cat Breed</label>
                <select 
                  value={catBreed}
                  onChange={e => setCatBreed(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl p-5 text-sm font-bold focus:ring-4 focus:ring-amber-500/10 transition-all outline-none appearance-none"
                >
                  {CAT_BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>

            <button 
              onClick={handleSignUp}
              className="w-full bg-rose-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-rose-500/20 hover:bg-rose-600 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              Start Adventure
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
