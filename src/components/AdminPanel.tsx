import { useState, useEffect } from 'react';
import { db, auth, ADMIN_EMAIL } from '../lib/firebase';
import { collection, setDoc, getDocs, query, orderBy, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Key, Plus, Trash2, Calendar, Infinity, LogOut, Loader2, Copy, Check } from 'lucide-react';

interface KeyRecord {
  id: string;
  key: string;
  expiresAt: Timestamp | null;
  isLifetime: boolean;
  createdAt: Timestamp;
}

export default function AdminPanel({ onClose }: { onClose: () => void }) {
  const [keys, setKeys] = useState<KeyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expiryType, setExpiryType] = useState<'lifetime' | '7days' | '30days'>('7days');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const q = query(collection(db, 'access_keys'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as KeyRecord));
      setKeys(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const generateRandomKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segment = () => Array.from({ length: 3 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    return `Larp-${segment()}-${segment()}-${segment()}`;
  };

  const handleCreateKey = async () => {
    setGenerating(true);
    const newKey = generateRandomKey();
    let expiresAt: Date | null = null;

    if (expiryType === '7days') {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
    } else if (expiryType === '30days') {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
    }

    try {
      await setDoc(doc(db, 'access_keys', newKey), {
        key: newKey,
        isLifetime: expiryType === 'lifetime',
        expiresAt: expiresAt ? Timestamp.fromDate(expiresAt) : null,
        createdAt: Timestamp.now(),
        createdBy: auth.currentUser?.email || 'admin'
      });
      await fetchKeys();
    } catch (e) {
      console.error(e);
      alert("Failed to create key. Make sure you are logged in as admin.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm("Delete this key?")) return;
    try {
      await deleteDoc(doc(db, 'access_keys', id));
      setKeys(keys.filter(k => k.id !== id));
    } catch (e) {
      alert("Failed to delete key.");
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-[300] bg-zinc-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-80 bg-zinc-900 border-r border-white/5 p-8 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-white font-black text-xl tracking-tight">Admin Console</h1>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Control Center</p>
          </div>
        </div>

        <div className="space-y-6 flex-1">
          <div>
            <label className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-3 block">Key Duration</label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: '7days', label: '7 Days', icon: Calendar },
                { id: '30days', label: '30 Days', icon: Calendar },
                { id: 'lifetime', label: 'Lifetime', icon: Infinity },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setExpiryType(opt.id as any)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                    expiryType === opt.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  <opt.icon size={18} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCreateKey}
            disabled={generating}
            className="w-full bg-white text-black font-black py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-2xl"
          >
            {generating ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
            GENERATE NEW KEY
          </button>
        </div>

        <button 
          onClick={onClose}
          className="mt-8 flex items-center justify-center gap-2 text-zinc-500 hover:text-white font-bold py-4 rounded-xl border border-white/5 hover:bg-white/5 transition-all"
        >
          <LogOut size={18} />
          EXIT CONSOLE
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 md:p-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-white text-3xl font-black tracking-tight">Active Access Keys</h2>
            <div className="bg-zinc-900 border border-white/5 px-4 py-2 rounded-full">
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Total: {keys.length}</span>
            </div>
          </div>

          <div className="grid gap-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                <Loader2 className="animate-spin mb-4" size={40} />
                <span className="font-bold uppercase tracking-widest text-xs">Loading Keys...</span>
              </div>
            ) : keys.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[40px]">
                <Key className="mx-auto text-zinc-800 mb-4" size={48} />
                <p className="text-zinc-500 font-bold">No active keys generated yet.</p>
              </div>
            ) : (
              keys.map((k) => (
                <motion.div
                  key={k.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-zinc-900 border border-white/5 p-6 rounded-[32px] flex items-center justify-between group"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center text-blue-500">
                      <Key size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <code className="text-white font-mono font-black text-lg">{k.key}</code>
                        <button 
                          onClick={() => copyToClipboard(k.key, k.id)}
                          className="text-zinc-500 hover:text-white transition-colors"
                        >
                          {copiedId === k.id ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${k.isLifetime ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                          {k.isLifetime ? 'Lifetime Access' : 'Temporary'}
                        </span>
                        <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                          {k.isLifetime ? 'Never Expires' : `Expires: ${k.expiresAt?.toDate().toLocaleDateString()}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteKey(k.id)}
                    className="p-4 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
