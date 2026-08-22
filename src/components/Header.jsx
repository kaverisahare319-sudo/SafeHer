import React from 'react';
import { ShieldAlert, MapPin, Volume2, VolumeX, Download, HeartHandshake } from 'lucide-react';
import { audioSiren } from '../utils/audioSiren';

export function Header({ locationError, isSirenActive, toggleSiren, deferredPrompt, onInstallPwa }) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-[#FF10F0]/20 px-4 py-3 bg-[#050509]/80 backdrop-blur-md">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF10F0] to-[#FF007F] p-0.5 shadow-[0_0_15px_#FF10F0]">
            <div className="w-full h-full bg-[#050509] rounded-[10px] flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-[#FF10F0] animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-extrabold tracking-tight text-white font-['Outfit']">
                Safe<span className="text-[#FF10F0] drop-shadow-[0_0_10px_#FF10F0]">Her</span>
              </h1>
              <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-[#FF10F0]/20 text-[#FF10F0] border border-[#FF10F0]/40">
                PROT
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-medium leading-none">Personal Safety System</p>
          </div>
        </div>

        {/* Action Controls & Badges */}
        <div className="flex items-center gap-2">
          
          {/* GPS Live Badge */}
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
            locationError 
              ? 'bg-red-500/10 text-red-400 border-red-500/30' 
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          }`}>
            <MapPin className="w-3.5 h-3.5 animate-bounce" />
            <span>{locationError ? 'GPS Error' : 'GPS Active'}</span>
          </div>

          {/* Emergency Siren Quick Toggle */}
          <button
            onClick={toggleSiren}
            title={isSirenActive ? "Stop Emergency Siren" : "Sound Emergency Siren"}
            className={`p-2 rounded-xl border transition-all flex items-center gap-1 text-xs font-bold ${
              isSirenActive
                ? 'bg-[#FF10F0] text-black border-[#FF10F0] animate-pulse shadow-[0_0_20px_#FF10F0]'
                : 'bg-white/5 text-gray-300 border-white/10 hover:border-[#FF10F0]/50 hover:text-[#FF10F0]'
            }`}
          >
            {isSirenActive ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span className="hidden xs:inline">STOP SIREN</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-[#FF10F0]" />
                <span className="hidden xs:inline">SIREN</span>
              </>
            )}
          </button>

          {/* PWA Install Button */}
          {deferredPrompt && (
            <button
              onClick={onInstallPwa}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF10F0]/20 hover:bg-[#FF10F0]/30 text-[#FF10F0] border border-[#FF10F0]/50 text-xs font-bold shadow-[0_0_12px_rgba(255,16,240,0.3)] transition-all"
            >
              <Download className="w-4 h-4" />
              <span>INSTALL</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
