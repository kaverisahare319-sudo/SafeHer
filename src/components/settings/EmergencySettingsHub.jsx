import React, { useState } from 'react';
import { 
  MessageSquare, 
  BatteryWarning, 
  Settings,
  ShieldCheck 
} from 'lucide-react';
import { PrivacyPromise } from './PrivacyPromise';
import { AutoSmsSettings } from './AutoSmsSettings';
import { DeadMansSwitch } from './DeadMansSwitch';

export function EmergencySettingsHub({ contacts, setContacts, userLocation, userName }) {
  const [subTab, setSubTab] = useState('autosms'); // 'autosms' | 'deadman' | 'privacy'

  return (
    <div className="space-y-5 font-['Outfit'] animate-fadeIn">
      
      {/* Sub Navigation */}
      <div className="flex items-center gap-1.5 p-1.5 bg-black/40 border border-white/10 rounded-2xl overflow-x-auto">
        <button
          onClick={() => setSubTab('autosms')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            subTab === 'autosms'
              ? 'bg-[#FF5D73] text-black shadow-[0_0_15px_rgba(255,93,115,0.3)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Auto-SMS & Location</span>
        </button>

        <button
          onClick={() => setSubTab('deadman')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            subTab === 'deadman'
              ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BatteryWarning className="w-3.5 h-3.5" />
          <span>Battery Dead-Man Switch</span>
        </button>

        <button
          onClick={() => setSubTab('privacy')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            subTab === 'privacy'
              ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Privacy Promise</span>
        </button>
      </div>

      {/* Render Component */}
      {subTab === 'autosms' && (
        <AutoSmsSettings 
          contacts={contacts} 
          setContacts={setContacts} 
          userLocation={userLocation} 
          userName={userName}
        />
      )}

      {subTab === 'deadman' && (
        <DeadMansSwitch userLocation={userLocation} />
      )}

      {subTab === 'privacy' && <PrivacyPromise />}

    </div>
  );
}
