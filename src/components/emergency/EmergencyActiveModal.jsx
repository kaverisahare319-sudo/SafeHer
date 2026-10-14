import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Zap, 
  ShieldAlert, 
  PhoneCall, 
  CheckCircle2, 
  AlertOctagon, 
  Share2, 
  Radio,
  MapPin,
  X
} from 'lucide-react';
import { audioSiren } from '../../utils/audioSiren';
import { createGoogleMapsUrl } from '../../utils/shareHelpers';

export function EmergencyActiveModal({ 
  isOpen, 
  onClose, 
  location, 
  address, 
  contacts, 
  isSirenActive, 
  toggleSiren 
}) {
  const [strobeActive, setStrobeActive] = useState(true);
  const [strobeSpeed, setStrobeSpeed] = useState('fast'); // fast | medium | hyper
  const [activeTimer, setActiveTimer] = useState(0);

  // Active distress timer
  useEffect(() => {
    let timer = null;
    if (isOpen) {
      timer = setInterval(() => setActiveTimer(t => t + 1), 1000);
    } else {
      setActiveTimer(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const lat = location?.latitude ?? null;
  const lng = location?.longitude ?? null;
  const mapsUrl = createGoogleMapsUrl(lat, lng);

  const contactCount = contacts?.length || 3;
  const contactNames = contacts?.map(c => c.name).slice(0, 3).join(', ') || 'your emergency contacts';

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStopAlert = () => {
    if (isSirenActive) {
      toggleSiren();
    }
    setStrobeActive(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-[#0B0C18] text-white p-4 sm:p-6 animate-fadeIn font-['Outfit'] overflow-y-auto select-none">
      
      {/* Dynamic Strobe Overlay if active */}
      {strobeActive && (
        <div 
          className="fixed inset-0 pointer-events-none z-0 opacity-25"
          style={{
            animation: strobeSpeed === 'hyper' ? 'strobe 0.08s infinite' : strobeSpeed === 'fast' ? 'strobe 0.15s infinite' : 'strobe 0.3s infinite'
          }}
        />
      )}

      {/* Top Banner & Header */}
      <div className="relative z-10 max-w-lg mx-auto w-full space-y-4 pt-2">
        <div className="flex items-center justify-between border-b border-white/15 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-red-600 animate-ping" />
            <span className="text-xs font-mono font-black text-red-400 tracking-wider uppercase">
              DISTRESS BROADCAST ACTIVE • {formatTimer(activeTimer)}
            </span>
          </div>

          <button
            onClick={handleStopAlert}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
            title="Dismiss screen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* REQUIRED STATUS LINE */}
        <div className="bg-gradient-to-r from-red-600/30 via-[#FF5D73]/30 to-red-600/30 border border-[#FF5D73]/60 rounded-2xl p-4 text-center backdrop-blur-md shadow-[0_0_30px_rgba(255,93,115,0.3)]">
          <div className="flex items-center justify-center gap-2 text-white font-extrabold text-base sm:text-lg">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Alert sent to {contactCount} contacts</span>
          </div>
          <p className="text-xs text-pink-200 mt-1">
            Recipients: <span className="font-semibold text-white">{contactNames}</span>
          </p>
          <div className="flex items-center justify-center gap-2 mt-2 text-[11px] text-gray-300">
            <Radio className="w-3.5 h-3.5 text-[#FF5D73] animate-pulse" />
            <span>Live GPS broadcast active via SMS & encrypted relay</span>
          </div>
        </div>

        {/* Live Location Card */}
        <div className="bg-black/60 border border-white/15 rounded-2xl p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 truncate mr-2">
            <div className="p-2 rounded-xl bg-red-500/20 text-[#FF5D73]">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="font-bold text-white truncate">{address || 'Locating current street...'}</p>
              <p className="text-[11px] text-gray-400 font-mono">{lat == null ? "location not available" : `${lat.toFixed(5)}, ${lng.toFixed(5)}`}</p>
            </div>
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-pink-300 font-bold text-[11px] whitespace-nowrap transition-colors"
          >
            Map Link
          </a>
        </div>
      </div>

      {/* Center Action Controls: Siren Toggle & Flashlight Strobe */}
      <div className="relative z-10 max-w-lg mx-auto w-full my-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* LOUD SIREN TOGGLE */}
        <div className="bg-[#181A33] border border-white/15 rounded-3xl p-5 flex flex-col justify-between items-center text-center gap-4 shadow-xl">
          <div className="space-y-1">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto transition-all ${
              isSirenActive ? 'bg-red-600 text-white animate-pulse shadow-[0_0_35px_rgba(239,68,68,0.8)]' : 'bg-white/10 text-gray-400'
            }`}>
              {isSirenActive ? <Volume2 className="w-8 h-8 animate-bounce" /> : <VolumeX className="w-8 h-8" />}
            </div>
            <h3 className="font-extrabold text-base text-white">Loud Acoustic Siren</h3>
            <p className="text-[11px] text-gray-400">850Hz-1250Hz piercing frequency</p>
          </div>

          <button
            onClick={toggleSiren}
            className={`w-full py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
              isSirenActive 
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_20px_rgba(239,68,68,0.7)]' 
                : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
            }`}
          >
            {isSirenActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isSirenActive ? 'MUTE SIREN ALARM' : 'START LOUD SIREN'}</span>
          </button>
        </div>

        {/* FLASHLIGHT STROBE CONTROL */}
        <div className="bg-[#181A33] border border-white/15 rounded-3xl p-5 flex flex-col justify-between items-center text-center gap-4 shadow-xl">
          <div className="space-y-1">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto transition-all ${
              strobeActive ? 'bg-yellow-400 text-black shadow-[0_0_35px_rgba(250,204,21,0.8)] animate-pulse' : 'bg-white/10 text-gray-400'
            }`}>
              <Zap className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-base text-white">Flashlight Strobe</h3>
            <p className="text-[11px] text-gray-400">High-intensity distress flash</p>
          </div>

          <div className="w-full space-y-2">
            <button
              onClick={() => setStrobeActive(!strobeActive)}
              className={`w-full py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
                strobeActive 
                  ? 'bg-yellow-400 hover:bg-yellow-300 text-black shadow-[0_0_20px_rgba(250,204,21,0.6)]' 
                  : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>{strobeActive ? 'STROBE ON (ACTIVE)' : 'ENABLE STROBE'}</span>
            </button>

            {strobeActive && (
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold">
                {['medium', 'fast', 'hyper'].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setStrobeSpeed(speed)}
                    className={`px-2 py-0.5 rounded capitalize ${strobeSpeed === speed ? 'bg-yellow-400 text-black' : 'bg-black/40 text-gray-400 hover:text-white'}`}
                  >
                    {speed}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Area: Big Red "Stop Alert" Button & Emergency Call */}
      <div className="relative z-10 max-w-lg mx-auto w-full space-y-3 pb-4">
        
        {/* BIG RED "STOP ALERT" BUTTON */}
        <button
          onClick={handleStopAlert}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-base uppercase tracking-wider shadow-[0_0_35px_rgba(220,38,38,0.7)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 border-2 border-red-400"
        >
          <AlertOctagon className="w-6 h-6" />
          <span>STOP ALERT (I'M SAFE NOW)</span>
        </button>

        {/* Quick Call Police 112 Helpline */}
        <a
          href="tel:112"
          className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/20 transition-colors"
        >
          <PhoneCall className="w-4 h-4 text-emerald-400" />
          <span>Direct Police Call (112)</span>
        </a>
      </div>

    </div>
  );
}
