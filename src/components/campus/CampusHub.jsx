import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Layers, 
  Building, 
  GraduationCap 
} from 'lucide-react';
import { CampusEscortRequest } from './CampusEscortRequest';
import { SafetyHeatmap } from './SafetyHeatmap';
import { HostelRaPanicLink } from './HostelRaPanicLink';

export function CampusHub({ userLocation, address, token, contacts }) {
  const [subTab, setSubTab] = useState('escort'); // 'escort' | 'heatmap' | 'hostel'

  return (
    <div className="space-y-5 font-['Outfit'] animate-fadeIn">
      
      {/* Sub Navigation */}
      <div className="flex items-center gap-1.5 p-1.5 bg-black/40 border border-white/10 rounded-2xl overflow-x-auto">
        <button
          onClick={() => setSubTab('escort')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            subTab === 'escort'
              ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Security Escort</span>
        </button>

        <button
          onClick={() => setSubTab('heatmap')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            subTab === 'heatmap'
              ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Safety Heatmap</span>
        </button>

        <button
          onClick={() => setSubTab('hostel')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            subTab === 'hostel'
              ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Hostel Help</span>
        </button>
      </div>

      {/* Render Component */}
      {subTab === 'escort' && (
        <CampusEscortRequest token={token} />
      )}

      {subTab === 'heatmap' && (
        <SafetyHeatmap />
      )}

      {subTab === 'hostel' && (
        <HostelRaPanicLink contacts={contacts} userLocation={userLocation} />
      )}

    </div>
  );
}
