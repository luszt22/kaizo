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
      <nav className="hidden md:flex gap-6 ml-2">
        {['Charts', 'Marketplace', 'Create', 'Robux'].map((item) => (
          <a
            key={item}
            href="#"
            className="text-[13px] font-bold text-[#232527] hover:text-blue-600 transition-colors"
          >
            {item}
          </a>
        ))}
      </nav>
      <form 
        onSubmit={handleSubmit}
        className="flex-1 max-w-[440px] mx-auto hidden sm:flex items-center gap-2 bg-[#EBEDF0] border border-[#DEE1E5] px-3 py-1 rounded-md text-[#616A72] group focus-within:border-zinc-400 focus-within:bg-white transition-all relative"
      >
        <Search size={16} strokeWidth={2.5} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="bg-transparent border-none outline-none text-[13px] w-full text-zinc-900 placeholder:text-[#8D949A]"
        />
      </form>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-[13px] font-bold text-[#393B3D]">
          <div className="w-[30px] h-[30px] rounded-full overflow-hidden border border-[#BDC3C7] bg-white">
            <img 
              src={user.avatarUrl || "https://tr.rbxcdn.com/30DAY-AvatarHeadshot-C318C9101602477C9F9A7C91ECEEE44A-Png/150/150/AvatarHeadshot/Webp/noFilter"} 
              alt="User Avatar"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== "https://tr.rbxcdn.com/30DAY-AvatarHeadshot-C318C9101602477C9F9A7C91ECEEE44A-Png/150/150/AvatarHeadshot/Webp/noFilter") {
                  target.src = "https://tr.rbxcdn.com/30DAY-AvatarHeadshot-C318C9101602477C9F9A7C91ECEEE44A-Png/150/150/AvatarHeadshot/Webp/noFilter";
                }
              }}
            />
          </div>
          <span className="hidden lg:inline">{user.displayName}</span>
        </div>
        <button className="relative flex text-[#393B3D] hover:text-black">
          <Bell size={20} />
          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#E2231A] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
            4
          </span>
        </button>
        <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#393B3D]">
          <RobuxIcon size={20} />
          <span>{user.robux.toLocaleString()}</span>
        </div>
        <button 
          onClick={onOpenSettings}
          className="text-[#616A72] hover:text-black transition-colors"
        >
          <Settings size={20} />
        </button>
        <button 
          onClick={onOpenAdmin}
          className="flex items-center gap-1 bg-zinc-800 text-white text-[10px] font-black px-3 py-1.5 rounded-full hover:bg-black transition-all uppercase tracking-tighter shadow-lg shadow-black/10"
        >
          <Shield size={12} />
          Admin
        </button>
      </div>
    </header>
  );
}
