import { useState } from 'react';
import { ShieldCheck, Key, ExternalLink, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { doc, getDocFromServer, Timestamp } from 'firebase/firestore';

interface KeyGateModalProps {
  onVerify: () => void;
  onAdminLogin: () => void;
}

export default function KeyGateModal({ onVerify, onAdminLogin }: KeyGateModalProps) {
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleVerify = async () => {
    if (!inputKey.trim()) return;
    setIsChecking(true);
    setError(false);
    
    try {
      // 1. Get User IP
      let ip = 'Unknown';
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        ip = ipData.ip;
      } catch (e) {
        console.error("IP Fetch failed", e);
      }

      // 2. Check Key in Firestore
      const docRef = doc(db, 'access_keys', inputKey.trim());
      const docSnap = await getDocFromServer(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const now = Timestamp.now();
        
        // 3. Check expiry
        if (!data.isLifetime && data.expiresAt && data.expiresAt.toMillis() < now.toMillis()) {
          setError(true);
          await fetch('/api/log-access', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: inputKey, ip, status: 'error', msg: 'Attempted to use an expired key.' })
          });
        } 
        // 4. Check HWID (IP)
        else if (data.hwid && data.hwid !== ip) {
          setError(true);
          await fetch('/api/log-access', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: inputKey, ip, status: 'error', msg: `HWID Mismatch! Key is locked to ${data.hwid}` })
          });
          alert(`Key is locked to another HWID/IP. Contact support to reset.`);
        }
        else {
          // Success! Associate HWID if not set
          if (!data.hwid) {
            const { updateDoc } = await import('firebase/firestore');
            await updateDoc(docRef, { hwid: ip });
          }

          // Log success to discord
          await fetch('/api/log-access', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: inputKey, ip, status: 'success', msg: data.hwid ? 'Returning user (HWID Match)' : 'New user (HWID Associated)' })
          });

          onVerify();
        }
      } else {
        setError(true);
        // Log invalid attempt
        await fetch('/api/log-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: inputKey, ip, status: 'error', msg: 'Attempted to use a non-existent key.' })
        });
      }
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-zinc-950">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[40px] w-full max-w-[440px] shadow-2xl overflow-hidden"
      >
        <div className="bg-zinc-900 p-8 text-center text-white">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/40">
            <ShieldCheck size={32} />
          </div>
          <h3 className="text-2xl font-black tracking-tight">SCorbin</h3>
          <p className="text-zinc-500 text-[10px] mt-2 font-bold uppercase tracking-[0.2em]">Buy from corbin</p>
        </div>

        <div className="p-8">
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              To prevent automated abuse, please enter your unique **Access Key**. You can generate one for free below.
            </p>
            
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Key size={18} />
                </div>
                <input
                  type="text"
                  value={inputKey}
                  onChange={(e) => {
                    setInputKey(e.target.value);
                    setError(false);
                  }}
                  className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 rounded-2xl font-mono text-sm focus:outline-none transition-all ${
                    error ? 'border-red-500 bg-red-50' : 'border-gray-100 focus:border-blue-500'
                  }`}
                  placeholder="Enter Key Here..."
                />
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl"
                >
                  <AlertTriangle size={14} />
                  INVALID OR EXPIRED KEY
                </motion.div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleVerify}
              disabled={isChecking || !inputKey.trim()}
              className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isChecking ? 'VERIFYING...' : 'UNLOCK FEATURES'}
            </button>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert("ily.");
              }}
              className="w-full bg-zinc-100 text-zinc-700 font-bold py-4 rounded-2xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <ExternalLink size={16} />
              GET ACCESS KEY
            </a>
          </div>

          <p className="text-[10px] text-gray-400 text-center mt-6 uppercase font-bold tracking-widest">
            Dm corbin to buy key
          </p>

          <button 
            onClick={onAdminLogin}
            disabled={isChecking}
            className="w-full mt-4 text-[10px] text-zinc-300 font-bold uppercase tracking-widest hover:text-white transition-colors disabled:opacity-50"
          >
            {isChecking ? 'Authenticating...' : 'Admin Authorization'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
