import React from 'react';
import { ShieldAlert, MapPin, Volume2, VolumeX, Download, LogOut, User } from 'lucide-react';
import { audioSiren } from '../utils/audioSiren';

export function Header({ 
  locationError, 
  isSirenActive, 
  toggleSiren, 
  deferredPrompt, 
  onInstallPwa, 
  user, 
  onLogout,
  onOpenSilentSos,
  onOpenFakeCall 
}) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-[#2C2F55] px-4 py-3 bg-[#12142A]/90 backdrop-blur-md">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF5D73] to-[#FF007F] p-0.5 shadow-[0_0_15px_rgba(255,93,115,0.4)]">
            <div className="w-full h-full bg-[#0D0E20] rounded-[10px] flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-[#FF5D73] animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-extrabold tracking-tight text-[#F4F2FA] font-['Space_Grotesk']">
                Safe<span className="text-[#FF5D73] drop-shadow-[0_0_10px_rgba(255,93,115,0.4)]">Her</span>
              </h1>
              <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-[#FF5D73]/20 text-[#FF5D73] border border-[#FF5D73]/40">
                PROT
              </span>
            </div>
            <p className="text-[11px] text-[#9491B4] font-medium leading-none">Personal Safety System</p>
          </div>
        </div>

        {/* Action Controls & Badges */}
        <div className="flex items-center gap-2">
          
          {/* GPS Live Badge */}
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
            locationError 
              ? 'bg-red-500/10 text-red-400 border-red-500/30' 
              : 'bg-emerald-500/10 text-[#33D6A6] border-[#164638]'
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
                ? 'bg-[#FF5D73] text-black border-[#FF5D73] animate-pulse shadow-[0_0_20px_#FF5D73]'
                : 'bg-white/5 text-[#F4F2FA] border-[#2C2F55] hover:border-[#FF5D73]/50 hover:text-[#FF5D73]'
            }`}
          >
            {isSirenActive ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span className="hidden xs:inline">STOP SIREN</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-[#FF5D73]" />
                <span className="hidden xs:inline">SIREN</span>
              </>
            )}
          </button>

          {/* Quick Stealth SOS trigger */}
          <button
            onClick={onOpenSilentSos}
            title="Open Silent SOS Stealth Disguise Screen"
            className="p-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all flex items-center gap-1"
          >
            <span className="text-xs">🤫</span>
            <span className="hidden sm:inline">STEALTH SOS</span>
          </button>

          {/* Quick Fake Call trigger */}
          <button
            onClick={onOpenFakeCall}
            title="Trigger Realistic Fake Call"
            className="p-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all flex items-center gap-1"
          >
            <span className="text-xs">📞</span>
            <span className="hidden sm:inline">FAKE CALL</span>
          </button>

          {/* PWA Install Button */}
          {deferredPrompt && (
            <button
              onClick={onInstallPwa}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF5D73]/20 hover:bg-[#FF5D73]/30 text-[#FF5D73] border border-[#FF5D73]/50 text-xs font-bold transition-all"
            >
              <Download className="w-4 h-4" />
              <span className="hidden xs:inline">INSTALL</span>
            </button>
          )}

          {/* User Profile / Logout Button */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-[#2C2F55]">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-[#F4F2FA] leading-tight max-w-[100px] truncate">{user.name}</span>
                <span className="text-[10px] text-[#33D6A6]">Protected</span>
              </div>
              
              <button
                onClick={onLogout}
                title="Sign out"
                className="p-2 rounded-xl bg-[#1B1E3D] hover:bg-[#20244A] text-[#9491B4] hover:text-[#FF5D73] border border-[#2C2F55] transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
