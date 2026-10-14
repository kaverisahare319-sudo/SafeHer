import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  UserCheck, 
  CheckCircle2, 
  Share2, 
  Play, 
  AlertCircle,
  ExternalLink 
} from 'lucide-react';
import { createGoogleMapsUrl } from '../../utils/shareHelpers';

export function WalkMeHome({ userLocation, contacts, onSafeStop }) {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(contacts[0]?.name || 'Sarah');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [secondsRemaining, setSecondsRemaining] = useState(30 * 60);
  const [estimatedArrival, setEstimatedArrival] = useState('11:15 PM');
  const [distanceRemaining, setDistanceRemaining] = useState('0.8 miles (12 mins walk)');
  const [friendViewing, setFriendViewing] = useState(true);

  // Auto-expire countdown
  useEffect(() => {
    let timer = null;
    if (isSessionActive && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining(s => s - 1);
      }, 1000);
    } else if (isSessionActive && secondsRemaining === 0) {
      setIsSessionActive(false);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSessionActive, secondsRemaining]);

  const startWalk = (minutes = 30) => {
    setDurationMinutes(minutes);
    setSecondsRemaining(minutes * 60);
    setIsSessionActive(true);
  };

  const stopSharing = () => {
    setIsSessionActive(false);
    if (onSafeStop) onSafeStop();
  };

  const formatCountdown = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const lat = userLocation?.latitude ?? null;
  const lng = userLocation?.longitude ?? null;
  const mapsUrl = createGoogleMapsUrl(lat, lng);

  const progressPercent = Math.max(0, Math.min(100, (secondsRemaining / (durationMinutes * 60)) * 100));

  return (
    <div className="space-y-6 font-['Outfit'] animate-fadeIn">
      
      {/* Header */}
      <div className="glass-panel p-5 rounded-3xl border border-[#33D6A6]/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#33D6A6]/15 text-[#33D6A6] border border-[#33D6A6]/30">
            <Navigation className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Walk Me Home Companion</h2>
            <p className="text-xs text-gray-400">Temporary live location tracking with a trusted buddy</p>
          </div>
        </div>
      </div>

      {!isSessionActive ? (
        /* Configuration State */
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
              1. Choose a trusted friend to watch your walk:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {contacts.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedFriend(c.name)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedFriend === c.name
                      ? 'bg-[#33D6A6]/20 border-[#33D6A6] text-white shadow-[0_0_15px_rgba(51,214,166,0.25)]'
                      : 'bg-black/30 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <p className="text-xs font-bold text-white truncate">{c.name}</p>
                  <p className="text-[10px] text-gray-400">{c.relation}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#33D6A6]" />
              <span>2. Auto-Expire Timer (Walk Duration):</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[15, 30, 45].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setDurationMinutes(mins)}
                  className={`py-3 rounded-2xl border text-center transition-all ${
                    durationMinutes === mins
                      ? 'bg-[#33D6A6] text-black font-black shadow-[0_0_15px_rgba(51,214,166,0.4)]'
                      : 'bg-black/30 border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <span className="text-xs font-bold">{mins} Minutes</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-400">
              When the timer expires, if you have not marked yourself safe, an urgent check-in notification will sound.
            </p>
          </div>

          <button
            onClick={() => startWalk(durationMinutes)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#33D6A6] to-emerald-400 hover:from-[#2bc095] hover:to-emerald-300 text-black font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(51,214,166,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Navigation className="w-5 h-5" />
            <span>START LIVE WALK & SHARE LINK WITH {selectedFriend.toUpperCase()}</span>
          </button>
        </div>
      ) : (
        /* Active Live Session State */
        <div className="space-y-4 animate-fadeIn">
          
          {/* Active Live Tracking Banner */}
          <div className="glass-panel p-5 rounded-3xl border border-[#33D6A6]/50 bg-gradient-to-r from-[#33D6A6]/10 via-[#1B1E3D] to-[#33D6A6]/10 space-y-4">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#33D6A6] animate-ping" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  LIVE TRACKING SHARED WITH {selectedFriend}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#33D6A6]/20 text-[#33D6A6] text-[10px] font-bold border border-[#33D6A6]/40">
                ACTIVE
              </span>
            </div>

            {/* ETA & Distance */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 text-center">
                <p className="text-[11px] font-bold text-gray-400 uppercase">ESTIMATED ARRIVAL</p>
                <p className="text-lg font-black text-white mt-0.5">{estimatedArrival}</p>
                <p className="text-[10px] text-emerald-400 font-semibold">{distanceRemaining}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 text-center">
                <p className="text-[11px] font-bold text-gray-400 uppercase">AUTO-EXPIRE TIMER</p>
                <p className="text-lg font-mono font-black text-[#33D6A6] mt-0.5">
                  {formatCountdown(secondsRemaining)}
                </p>
                <p className="text-[10px] text-gray-400">Sharing stops automatically</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-[#33D6A6] h-full transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Map Preview Link */}
            <div className="flex items-center justify-between text-xs text-gray-300 pt-1">
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-[#33D6A6]" />
                {lat == null ? "location not available" : `${lat.toFixed(4)}, ${lng.toFixed(4)}`}
              </span>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#33D6A6] hover:underline flex items-center gap-1 font-bold text-[11px]"
              >
                View Shared Web Map <ExternalLink className="w-3 h-3" />
              </a>
            </div>

          </div>

          {/* BIG "I'M SAFE, STOP SHARING" BUTTON */}
          <button
            onClick={stopSharing}
            className="w-full py-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-base uppercase tracking-wider shadow-[0_0_35px_rgba(16,185,129,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 border-2 border-emerald-300"
          >
            <CheckCircle2 className="w-6 h-6" />
            <span>I'M SAFE, STOP SHARING</span>
          </button>

        </div>
      )}

    </div>
  );
}
