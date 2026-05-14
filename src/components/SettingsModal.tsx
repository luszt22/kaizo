import { X } from 'lucide-react';
import { User } from '../types';
import { useState } from 'react';
import { motion } from 'motion/react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave: (updatedUser: User) => void;
  onLogout: () => void;
}

export default function SettingsModal({ isOpen, onClose, user, onSave, onLogout }: SettingsModalProps) {
  const [formData, setFormData] = useState<User>(user);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[28px] w-full max-w-[460px] shadow-2xl overflow-hidden"
      >
        <div className="flex justify-between items-center px-6 py-4.5 border-b border-gray-100">
          <h3 className="text-xl font-bold">Settings</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors">
            <X size={28} />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-500">Display Name</label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-base focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Display Name"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-500">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-base focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Username"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-500">Robux Balance</label>
              <input
                type="number"
                value={formData.robux}
                onChange={(e) => setFormData({ ...formData, robux: Number(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-base focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Balance"
              />
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <button
              onClick={() => onSave(formData)}
              className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              Save Changes
            </button>
            <button
              onClick={onLogout}
              className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-full hover:bg-gray-200 transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
