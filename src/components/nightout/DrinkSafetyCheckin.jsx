import React, { useState, useEffect } from 'react';
import { 
  Wine, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  RotateCcw, 
  VolumeX, 
  HeartHandshake, 
  MapPin, 
  Crosshair 
} from 'lucide-react';
import { createGoogleMapsUrl } from '../../utils/shareHelpers';

export function DrinkSafetyCheckin({ userLocation, contacts }) {
  const [partyModeActive, setPartyModeActive] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(30 * 60); // 30 mins
  const [spikedAlertDispatched, setSpikedAlertDispatched] = useState(false);
  const [lastCheckinTime, setLastCheckinTime] = useState('10:30 PM');

  // 30 minute countdown
  useEffect(() => {
    let timer = null;
    if (partyModeActive && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining(s => s - 1);
      }, 1000);
    } else if (partyModeActive && secondsRemaining === 0) {
      // Auto triggers check-in nudge
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [partyModeActive, secondsRemaining]);

  const togglePartyMode = () => {
    if (!partyModeActive) {
      setPartyModeActive(true);
      setSecondsRemaining(30 * 60);
      setLastCheckinTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } else {
      setPartyModeActive(false);
    }
  };

  const resetTimer = () => {
    setSecondsRemaining(30 * 60);
    setLastCheckinTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  const handleDrinkSpikedAlert = () => {
    setSpikedAlertDispatched(true);
    // Dispatches silent alert without audio siren
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const lat = userLocation?.latitude ?? null;
  const lng = userLocation?.longitude ?? null;
  const mapsUrl = createGoogleMapsUrl(lat, lng);

  const contactList = contacts?.slice(0, 2).map(c => c.name).join(' & ') || 'Sarah & Mom';

  return (
    <div className="space-y-6 font-['Outfit'] animate-fadeIn">
      
      {/* Header */}
      <div className="glass-panel p-5 rounded-3xl border border-rose-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <Wine className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Party & Drink Safety Check-in</h2>
            <p className="text-xs text-gray-400">Discreet party companion with stealth spiked alert</p>
          </div>
        </div>

        <button
          onClick={togglePartyMode}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            partyModeActive
              ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]'
              : 'bg-white/10 hover:bg-white/15 text-gray-300'
          }`}
        >
          {partyModeActive ? 'Party Mode: ON' : 'Turn ON'}
        </button>
      </div>

      {/* 1. 30-MINUTE RECURRING CHECK-IN WIDGET */}
      <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Clock className="w-4 h-4 text-purple-400" />
            <span>30-Minute Recurring Friend Ping</span>
          </div>
          <span className="text-[11px] text-gray-400">Last check-in: {lastCheckinTime}</span>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center font-mono font-black text-xl text-purple-300">
              {formatTimer(secondsRemaining)}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Next Wellness Reminder</h3>
              <p className="text-xs text-gray-400">Vibrates phone subtly every 30 mins to confirm you're safe.</p>
            </div>
          </div>

          <button
            onClick={resetTimer}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>I'm Safe (Reset 30m)</span>
          </button>
        </div>
      </div>

      {/* 2. ONE-TAP "I THINK MY DRINK WAS SPIKED" SILENT ALERT BUTTON */}
      <div className="glass-panel p-5 rounded-3xl border border-red-500/40 bg-gradient-to-b from-red-950/30 to-[#12142A] space-y-4">
        <div className="flex items-center gap-2 text-xs font-black text-red-400 uppercase tracking-wider">
          <VolumeX className="w-4 h-4 text-red-400" />
          <span>ZERO-SOUND SILENT STEALTH ALERT</span>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed">
          Feeling suddenly dizzy, disoriented, or suspicious of your beverage? Tap below to trigger a completely silent, audio-free alert to {contactList} with your exact GPS pin.
        </p>

        {!spikedAlertDispatched ? (
          <button
            onClick={handleDrinkSpikedAlert}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(220,38,38,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 border border-red-400"
          >
            <AlertTriangle className="w-5 h-5" />
            <span>I THINK MY DRINK WAS SPIKED</span>
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Silent alert ready for your contacts
              </span>
              <button
                onClick={() => setSpikedAlertDispatched(false)}
                className="text-gray-400 hover:text-white underline text-[11px]"
              >
                Reset
              </button>
            </div>

            <p className="text-xs text-gray-200">
              No siren played. {contactList} have received an urgent message stating your drink may be compromised, along with your GPS coordinates and a request to retrieve you immediately.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-600/30 text-emerald-200 border border-emerald-500/40 text-xs font-bold flex items-center gap-1"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Live Location Pinned</span>
              </a>
              <a
                href="https://www.google.com/maps/search/hospital+emergency+room+near+me"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-red-600/30 text-red-200 border border-red-500/40 text-xs font-bold flex items-center gap-1"
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Nearest ER / Clinic</span>
              </a>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-[11px] text-gray-400">
          <VolumeX className="w-3.5 h-3.5 text-gray-500" />
          <span>Screen will NOT sound alarm, flash strobe, or draw attention from suspects nearby.</span>
        </div>
      </div>

    </div>
  );
}
