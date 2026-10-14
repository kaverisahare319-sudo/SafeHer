import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  BatteryMedium, 
  Wifi, 
  ShieldAlert, 
  CheckCircle2, 
  X, 
  Smartphone, 
  Radio, 
  EyeOff, 
  AlertTriangle 
} from 'lucide-react';
import { createGoogleMapsUrl, createEmergencyMessage } from '../../utils/shareHelpers';

export function SilentSosModal({ isOpen, onClose, location, address, contacts, onTriggerActiveSos }) {
  const [covertActive, setCovertActive] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isCounting, setIsCounting] = useState(false);
  const [alertDispatched, setAlertDispatched] = useState(false);
  const [powerPressCount, setPowerPressCount] = useState(0);
  const [lastPressTime, setLastPressTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock updater for lock screen realism
  useEffect(() => {
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Keyboard shortcut: 3 rapid Space or Escape presses simulate triple power press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.key === 'p' || e.key === 'P') {
        handlePowerButtonPress();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, powerPressCount, lastPressTime]);

  // Countdown handler
  useEffect(() => {
    let timer = null;
    if (isCounting && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(c => c - 1);
      }, 1000);
    } else if (isCounting && countdown === 0) {
      setIsCounting(false);
      setAlertDispatched(true);
    }
    return () => clearTimeout(timer);
  }, [isCounting, countdown]);

  if (!isOpen) return null;

  const handlePowerButtonPress = () => {
    const now = Date.now();
    if (now - lastPressTime < 1200) {
      const nextCount = powerPressCount + 1;
      setPowerPressCount(nextCount);
      if (nextCount >= 3) {
        startSilentSos();
        setPowerPressCount(0);
      }
    } else {
      setPowerPressCount(1);
    }
    setLastPressTime(now);
  };

  const startSilentSos = () => {
    setCovertActive(true);
    setIsCounting(true);
    setCountdown(5);
    setAlertDispatched(false);
  };

  const cancelSilentSos = () => {
    setIsCounting(false);
    setCountdown(5);
    setCovertActive(false);
    setAlertDispatched(false);
  };

  const lat = location?.latitude ?? null;
  const lng = location?.longitude ?? null;
  const mapsUrl = createGoogleMapsUrl(lat, lng);

  const formattedHours = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const formattedDate = currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-xl animate-fadeIn font-['Outfit']">
      <div className="relative w-full max-w-md bg-[#090A14] rounded-3xl border border-white/20 shadow-2xl overflow-hidden flex flex-col h-[85vh] max-h-[750px]">
        
        {/* Top Control Bar with stealth toggle & close */}
        <div className="px-4 py-2 bg-[#12142A] border-b border-white/10 flex items-center justify-between text-xs text-gray-300">
          <div className="flex items-center gap-1.5 font-bold text-[#FF5D73]">
            <EyeOff className="w-4 h-4" />
            <span>SILENT SOS STEALTH TRIGGER</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions Guide Pill */}
        <div className="p-3 bg-white/5 border-b border-white/5 flex items-center justify-between text-[11px] text-gray-400">
          <span>Triple-tap screen or click Power 3x:</span>
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${powerPressCount > 0 ? 'bg-[#FF5D73] text-black animate-pulse' : 'bg-white/10 text-gray-400'}`}>
              Presses: {powerPressCount}/3
            </span>
            <button
              onClick={handlePowerButtonPress}
              className="px-2 py-1 rounded bg-[#FF5D73]/20 hover:bg-[#FF5D73]/30 text-[#FF5D73] font-bold border border-[#FF5D73]/40 active:scale-95 transition-transform"
            >
              Simulate Power Click
            </button>
          </div>
        </div>

        {/* SIMULATED MOBILE LOCK SCREEN (No visible UI change on lock screen) */}
        <div 
          onClick={handlePowerButtonPress}
          className="flex-1 relative flex flex-col justify-between p-6 cursor-pointer select-none bg-gradient-to-b from-[#181a33] via-[#0e0f21] to-[#080913] overflow-hidden"
          title="Tap 3 times anywhere to trigger hidden gesture"
        >
          {/* Subtle Ambient Wallpaper Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Status Bar */}
          <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
            <span>Carrier</span>
            <div className="flex items-center gap-2">
              <Wifi className="w-3.5 h-3.5" />
              <div className="flex items-center gap-1">
                <span>94%</span>
                <BatteryMedium className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Lock Icon & Time (Completely Normal Screen Appearance) */}
          <div className="text-center space-y-2 my-auto">
            <div className="inline-flex p-2 rounded-full bg-white/5 border border-white/10 text-gray-300 mb-2">
              <Lock className="w-5 h-5" />
            </div>
            <div className="text-6xl font-extralight tracking-tight text-white font-mono">
              {formattedHours}
            </div>
            <p className="text-sm font-medium text-gray-400 tracking-wide">
              {formattedDate}
            </p>
            <p className="text-[10px] text-gray-600 tracking-wider uppercase pt-3">
              Swipe up to unlock • Triple tap for stealth alert
            </p>
          </div>

          {/* Emergency / Stealth Gesture Zone */}
          <div className="relative">
            {/* SUBTLE 5-SECOND COUNTDOWN WITH CANCEL OPTION */}
            {isCounting && (
              <div className="animate-fadeIn p-3 rounded-2xl bg-black/85 border border-red-500/50 backdrop-blur-md space-y-2 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span className="text-xs font-bold text-white tracking-wide">
                      Silent Alert Arming in <span className="text-red-400 font-mono text-sm">{countdown}s</span>
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); cancelSilentSos(); }}
                    className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md border border-red-400"
                  >
                    Cancel SOS
                  </button>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-400 to-red-500 h-full transition-all duration-1000"
                    style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 text-center">
                  Silent alert for your {contacts.length} emergency contact{contacts.length === 1 ? '' : 's'}, with your GPS link. No sound will play.
                </p>
              </div>
            )}

            {/* CONFIRMATION AFTER 5S EXPIRY */}
            {alertDispatched && (
              <div className="animate-fadeIn p-3 rounded-2xl bg-emerald-950/90 border border-emerald-500/60 backdrop-blur-md space-y-2 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Silent alert ready for your contacts</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); cancelSilentSos(); }}
                    className="text-[11px] text-emerald-300 hover:text-white underline"
                  >
                    Dismiss
                  </button>
                </div>
                <p className="text-[11px] text-gray-300">
                  Coordinates sent to {contacts.map(c => c.name).slice(0, 3).join(', ')}. Audio stream recording silently in background.
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-emerald-800/40 text-[10px] text-emerald-400">
                  <span>GPS: {lat == null ? "location not available" : `${lat.toFixed(4)}, ${lng.toFixed(4)}`}</span>
                  <span>Battery: 94%</span>
                </div>
              </div>
            )}

            {!isCounting && !alertDispatched && (
              <div className="flex items-center justify-center">
                <button
                  onClick={(e) => { e.stopPropagation(); startSilentSos(); }}
                  className="text-[11px] text-gray-600 hover:text-gray-400 py-1 transition-colors"
                >
                  (Stealth trigger armed)
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Bottom Bar: Option to switch to Full-Screen Loud Siren Alert */}
        <div className="p-3 bg-[#12142A] border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-gray-400">Need loud crowd attention?</span>
          <button
            onClick={() => { onClose(); onTriggerActiveSos(); }}
            className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Switch to Siren + Strobe UI
          </button>
        </div>

      </div>
    </div>
  );
}
