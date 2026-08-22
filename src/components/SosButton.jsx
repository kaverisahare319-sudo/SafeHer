import React from 'react';
import { AlertOctagon, PhoneCall, ShieldAlert, Sparkles } from 'lucide-react';
import { audioSiren } from '../utils/audioSiren';

export function SosButton({ onTriggerSos, locationLoading, address }) {
  const handleClick = () => {
    audioSiren.playBeep(900, 200);
    onTriggerSos();
  };

  return (
    <div className="flex flex-col items-center justify-center my-6 relative py-4">
      
      {/* Outer Pulse Rings */}
      <div className="relative flex items-center justify-center">
        <div className="absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full sos-ring-1 pointer-events-none" />
        <div className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full sos-ring-2 pointer-events-none" />
        
        {/* Main SOS Button */}
        <button
          onClick={handleClick}
          type="button"
          className="relative group z-10 w-48 h-48 sm:w-56 sm:h-56 rounded-full sos-button-glow flex flex-col items-center justify-center cursor-pointer transition-all duration-300 transform active:scale-95 hover:scale-105 border-4 border-white/80"
          aria-label="Trigger Emergency SOS"
        >
          {/* Inner Glow Overlay */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          
          <AlertOctagon className="w-16 h-16 sm:w-20 sm:h-20 text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] animate-pulse" />
          
          <span className="text-4xl sm:text-5xl font-black tracking-wider text-white font-['Outfit'] drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] mt-1">
            SOS
          </span>
          
          <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-pink-100 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md mt-1 border border-white/30">
            TAP FOR HELP
          </span>
        </button>
      </div>

      {/* Subtext info & address preview */}
      <div className="mt-8 text-center max-w-sm px-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF10F0]/10 border border-[#FF10F0]/30 text-[#FF10F0] text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Pressing broadcasts live GPS to contacts</span>
        </div>
        {address ? (
          <p className="text-xs text-gray-400 line-clamp-2 bg-white/5 p-2 rounded-lg border border-white/10">
            📍 Current: <span className="text-gray-200">{address}</span>
          </p>
        ) : locationLoading ? (
          <p className="text-xs text-gray-400 animate-pulse">Acquiring high precision GPS location...</p>
        ) : null}
      </div>

    </div>
  );
}
