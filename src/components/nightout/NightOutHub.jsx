import React, { useState } from 'react';
import { 
  Navigation, 
  Wine, 
  Car, 
  Moon, 
  Shield 
} from 'lucide-react';
import { WalkMeHome } from './WalkMeHome';
import { DrinkSafetyCheckin } from './DrinkSafetyCheckin';
import { RideShareDetails } from './RideShareDetails';

export function NightOutHub({ userLocation, contacts, address }) {
  const [subTab, setSubTab] = useState('walk'); // 'walk' | 'drink' | 'ride'

  return (
    <div className="space-y-5 font-['Outfit'] animate-fadeIn">
      
      {/* Sub Tab Navigation Pills */}
      <div className="flex items-center gap-1.5 p-1.5 bg-black/40 border border-white/10 rounded-2xl overflow-x-auto">
        <button
          onClick={() => setSubTab('walk')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            subTab === 'walk'
              ? 'bg-[#33D6A6] text-black shadow-[0_0_15px_rgba(51,214,166,0.3)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Walk Me Home</span>
        </button>

        <button
          onClick={() => setSubTab('drink')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            subTab === 'drink'
              ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Wine className="w-3.5 h-3.5" />
          <span>Drink Check-in</span>
        </button>

        <button
          onClick={() => setSubTab('ride')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            subTab === 'ride'
              ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          <span>Share Ride</span>
        </button>
      </div>

      {/* Render Subtab Component */}
      {subTab === 'walk' && (
        <WalkMeHome userLocation={userLocation} contacts={contacts} />
      )}

      {subTab === 'drink' && (
        <DrinkSafetyCheckin userLocation={userLocation} contacts={contacts} />
      )}

      {subTab === 'ride' && (
        <RideShareDetails contacts={contacts} />
      )}

    </div>
  );
}
