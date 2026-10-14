import React, { useState, useEffect } from 'react';
import { WifiOff, ShieldCheck, Zap, AlertCircle } from 'lucide-react';

export function OfflineBanner({ isSimulatedOffline, onToggleSimulation }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const showBanner = !isOnline || isSimulatedOffline;

  if (!showBanner) return null;

  return (
    <div className="bg-gradient-to-r from-amber-600/95 via-rose-600/95 to-amber-700/95 text-white px-3 py-2 text-xs font-semibold shadow-lg border-b border-white/20 sticky top-0 z-50 animate-fadeIn backdrop-blur-md">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-black/30 animate-pulse">
            <WifiOff className="w-4 h-4 text-amber-200" />
          </div>
          <p className="text-white text-xs sm:text-[13px] leading-tight font-medium">
            <span className="font-extrabold uppercase tracking-wide text-amber-200 mr-1.5">Offline mode:</span>
            SOS, siren, flashlight, and SMS alerts still active
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1 bg-emerald-950/70 border border-emerald-400/40 text-emerald-200 px-2 py-0.5 rounded-full font-bold">
            <ShieldCheck className="w-3 h-3 text-emerald-300" />
            Hardware Armed
          </span>
          {onToggleSimulation && (
            <button
              onClick={onToggleSimulation}
              className="bg-black/40 hover:bg-black/60 text-amber-200 px-2 py-0.5 rounded text-[11px] font-bold border border-white/20 transition-colors"
              title="Toggle simulated offline state"
            >
              {isSimulatedOffline ? 'Resume Online' : 'Simulate'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
