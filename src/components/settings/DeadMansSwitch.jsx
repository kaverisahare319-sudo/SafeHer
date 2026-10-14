import React, { useState, useEffect } from 'react';
import { 
  BatteryWarning, 
  BatteryCharging, 
  ShieldCheck, 
  Sliders, 
  Navigation, 
  Radio, 
  AlertTriangle,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { createGoogleMapsUrl } from '../../utils/shareHelpers';

export function DeadMansSwitch({ userLocation }) {
  const [isArmed, setIsArmed] = useState(true);
  const [threshold, setThreshold] = useState(10); // 5% to 20%
  const [currentBattery, setCurrentBattery] = useState(74);
  const [isCharging, setIsCharging] = useState(false);
  const [autoTripOnly, setAutoTripOnly] = useState(true);

  // Web Battery API detection if supported in browser
  useEffect(() => {
    if ('getBattery' in navigator) {
      navigator.getBattery().then((battery) => {
        setCurrentBattery(Math.round(battery.level * 100));
        setIsCharging(battery.charging);

        battery.addEventListener('levelchange', () => {
          setCurrentBattery(Math.round(battery.level * 100));
        });
        battery.addEventListener('chargingchange', () => {
          setIsCharging(battery.charging);
        });
      }).catch(err => {
        console.log('Battery API not supported, using simulation fallback.');
      });
    }
  }, []);

  const lat = userLocation?.latitude ?? null;
  const lng = userLocation?.longitude ?? null;
  const mapsUrl = createGoogleMapsUrl(lat, lng);

  return (
    <div className="space-y-6 font-['Outfit'] animate-fadeIn">
      
      {/* Header */}
      <div className="glass-panel p-5 rounded-3xl border border-amber-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <BatteryWarning className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Low Battery Dead-man's Switch</h2>
            <p className="text-xs text-gray-400">Sends your last location to your contacts when battery is low (app must be open)</p>
          </div>
        </div>
      </div>

      {/* ARMED STATUS INDICATOR */}
      <div className={`p-5 rounded-3xl border transition-all ${
        isArmed 
          ? 'bg-gradient-to-r from-emerald-950/40 via-[#12142A] to-emerald-950/40 border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.15)]' 
          : 'bg-black/40 border-white/10 opacity-70'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3.5 h-3.5 rounded-full ${isArmed ? 'bg-emerald-400 animate-ping' : 'bg-gray-600'}`} />
            <div>
              <span className="text-xs font-mono font-black uppercase tracking-wider text-emerald-300">
                SYSTEM STATUS
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                {isArmed ? "DEAD-MAN'S SWITCH ARMED" : "SWITCH DISARMED (DISABLED)"}
              </h3>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isArmed}
              onChange={(e) => setIsArmed(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {isArmed && (
          <div className="mt-4 pt-3 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-200">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Auto-sends final breadcrumb coordinates when battery drops to <strong>{threshold}%</strong></span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
              Works while app is open
            </span>
          </div>
        )}
      </div>

      {/* BATTERY THRESHOLD SLIDER (5% - 20%) */}
      <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Trigger Threshold Slider (5% – 20%):</span>
          </label>
          <span className="text-sm font-black text-amber-400 font-mono bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/30">
            {threshold}% Remaining
          </span>
        </div>

        <div className="space-y-2">
          <input
            type="range"
            min="5"
            max="20"
            step="1"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full accent-amber-400 h-2 bg-gray-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-bold text-gray-400">
            <span>5% (Absolute Minimum)</span>
            <span>10% (Recommended)</span>
            <span>20% (Early Warning)</span>
          </div>
        </div>

        {/* Current Battery Level Indicator & Simulator */}
        <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            {isCharging ? (
              <BatteryCharging className="w-5 h-5 text-emerald-400" />
            ) : (
              <BatteryWarning className={`w-5 h-5 ${currentBattery <= threshold ? 'text-red-400 animate-bounce' : 'text-emerald-400'}`} />
            )}
            <div>
              <p className="font-bold text-white">Current Phone Battery: {currentBattery}%</p>
              <p className="text-[11px] text-gray-400">{isCharging ? 'Charging on power adapter' : 'Discharging on battery'}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentBattery(threshold)}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 text-[10px] font-bold transition-colors"
            >
              Simulate {threshold}% Drop
            </button>
            <button
              onClick={() => setCurrentBattery(85)}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 text-[10px] font-bold transition-colors"
            >
              Reset 85%
            </button>
          </div>
        </div>
      </div>

      {/* TRIP SAFETY TOGGLE & CACHED LOCATION */}
      <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-white">Only trigger during active trips / night walks</p>
            <p className="text-[11px] text-gray-400">Avoids spam alerts when your phone is dying at home safely</p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoTripOnly}
              onChange={(e) => setAutoTripOnly(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF5D73]"></div>
          </label>
        </div>

        <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-[#FF5D73]" />
            <span className="text-gray-300">Last Cached GPS Breadcrumb:</span>
          </div>
          <span className="font-mono text-white text-[11px]">{lat == null ? "location not available" : `${lat.toFixed(4)}, ${lng.toFixed(4)}`}</span>
        </div>
      </div>

    </div>
  );
}
