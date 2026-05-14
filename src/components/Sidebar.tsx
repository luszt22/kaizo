import { Home, User as UserIcon, Plus, MessageSquare, Users, UserCircle, Package, RefreshCw, Globe, FileText, ShoppingCart, Gift } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  user: User;
}

export default function Sidebar({ user }: SidebarProps) {
  const navItems = [
    { icon: Home, label: 'Home' },
    { icon: UserCircle, label: 'Profile' },
    { icon: Plus, label: 'Roblox Plus' },
    { icon: MessageSquare, label: 'Messages', badge: 76 },
    { icon: Users, label: 'Friends', badge: 63 },
    { icon: UserIcon, label: 'Avatar' },
    { icon: Package, label: 'Inventory' },
    { icon: RefreshCw, label: 'Trade' },
    { icon: Globe, label: 'Communities' },
    { icon: FileText, label: 'Blog' },
    { icon: ShoppingCart, label: 'Official Store' },
    { icon: Gift, label: 'Buy Gift Cards' },
  ];

  return (
    <aside className="w-[240px] shrink-0 p-3 border-r border-gray-200 bg-white hidden lg:flex flex-col gap-1 overflow-y-auto h-[calc(100vh-56px)]">
      <a href="#" className="flex items-center gap-3 p-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 italic transition-colors">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900" />
        <span>{user.displayName}</span>
      </a>
      {navItems.map((item) => (
        <a
          key={item.label}
          href="#"
          className="flex items-center gap-3 p-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <item.icon size={18} className="text-gray-400" />
          <span>{item.label}</span>
          {item.badge && (
            <span className="ml-auto px-2 py-0.5 rounded-full bg-gray-900 text-white text-[10px] font-bold">
              {item.badge}
            </span>
          )}
        </a>
      ))}
    </aside>
  );
}
