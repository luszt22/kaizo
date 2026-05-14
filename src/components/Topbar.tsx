import React, { useState } from 'react';
import { Search, Bell, Settings, Shield } from 'lucide-react';
import { User } from '../types';
import RobuxIcon from './RobuxIcon';
import { User as FirebaseUser } from 'firebase/auth';

interface TopbarProps {
  user: User;
  onOpenSettings: () => void;
  onSearch: (query: string) => void;
  currentUser: FirebaseUser | null;
  adminEmail: string;
  onOpenAdmin: () => void;
  onLogin: () => void;
}

export default function Topbar({ 
  user, 
  onOpenSettings, 
  onSearch, 
  currentUser, 
  adminEmail,
  onOpenAdmin,
  onLogin
}: TopbarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <header className="sticky top-0 z-50 flex items-center gap-6 h-14 px-6 border-b border-gray-200 bg-white">
      <a href="#" className="text-xl font-black tracking-tighter">
        R<span className="inline-block transform rotate-12">O</span>BLOX
      </a>
      <nav className="hidden md:flex gap-7 ml-2">
        {['Charts', 'Marketplace', 'Create', 'Robux'].map((item, i) => (
          <a
            key={item}
            href="#"
            className={`text-sm font-semibold py-1 border-b-2 transition-colors ${
              i === 3 ? 'text-blue-600 border-blue-600' : 'border-transparent hover:text-blue-600 hover:border-blue-600'
            }`}
          >
            {item}
          </a>
        ))}
      </nav>
      <form 
        onSubmit={handleSubmit}
        className="flex-1 max-w-[380px] mx-auto hidden sm:flex items-center gap-2 bg-gray-100 px-4 py-1.5 rounded-full text-gray-500"
      >
        <Search size={16} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Profiles"
          className="bg-transparent border-none outline-none text-sm w-full text-gray-900"
        />
      </form>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900" />
          <span>{user.displayName}</span>
        </div>
        <button className="relative flex text-gray-900">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            4
          </span>
        </button>
        <div className="flex items-center gap-1.5 text-sm font-semibold">
          <RobuxIcon size={18} className="text-slate-800" />
          <span>{user.robux.toLocaleString()}</span>
        </div>
        <button 
          onClick={onOpenSettings}
          className="text-gray-400 hover:text-gray-900 transition-colors"
        >
          <Settings size={20} />
        </button>
        {currentUser?.email === adminEmail ? (
          <button 
            onClick={onOpenAdmin}
            className="flex items-center gap-1 bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full hover:bg-red-700 transition-all uppercase tracking-tighter shadow-lg shadow-red-500/20"
          >
            <Shield size={12} />
            Console
          </button>
        ) : !currentUser ? (
          <button 
            onClick={onLogin}
            className="text-[10px] bg-zinc-100 text-zinc-500 font-bold px-3 py-1.5 rounded-full hover:bg-zinc-200"
          >
            ADMIN
          </button>
        ) : null}
      </div>
    </header>
  );
}
