import React, { useState, useEffect } from 'react';
import { 
  Vibrate, 
  Sliders, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  Activity, 
  HelpCircle,
  ShieldCheck,
  X 
} from 'lucide-react';

export function ShakeAlertModal({ isOpen, onClose, onSaveSettings }) {
  const [sensitivity, setSensitivity] = useState('medium'); // light | medium | hard
  const [isEnabled, setIsEnabled] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [testScore, setTestScore] = useState(0);
  const [shakeDetected, setShakeDetected] = useState(false);

  // Thresholds based on sensitivity
  const thresholds = {
    light: 15,
    medium: 28,
    hard: 45
  };

  const currentThreshold = thresholds[sensitivity];

  // Device motion sensor listener for real devices
  useEffect(() => {
    if (!isOpen || !isTesting) return;

    let lastX = 0, lastY = 0, lastZ = 0;
    const handleMotion = (e) => {
      const acc = e.accelerationIncludingGravity || e.acceleration;
      if (!acc) return;
      const deltaX = Math.abs(acc.x - lastX);
      const deltaY = Math.abs(acc.y - lastY);
      const deltaZ = Math.abs(acc.z - lastZ);
      const speed = deltaX + deltaY + deltaZ;

      setTestScore(Math.min(100, Math.round((speed / currentThreshold) * 100)));

      if (speed >= currentThreshold) {
        setShakeDetected(true);
        setTimeout(() => setShakeDetected(false), 2000);
      }

      lastX = acc.x;
      lastY = acc.y;
      lastZ = acc.z;
    };

    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => {
      if (window.DeviceMotionEvent) {
        window.removeEventListener('devicemotion', handleMotion);
      }
    };
  }, [isOpen, isTesting, currentThreshold]);

  if (!isOpen) return null;

  const simulateShake = () => {
    setIsTesting(true);
    setTestScore(100);
    setShakeDetected(true);
    setTimeout(() => {
      setShakeDetected(false);
      setTestScore(0);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fadeIn font-['Outfit']">
      <div className="relative w-full max-w-lg bg-[#12142A] border border-[#FF5D73]/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-900/40 via-[#1B1E3D] to-[#12142A] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#FF5D73]/15 text-[#FF5D73] border border-[#FF5D73]/30">
              <Vibrate className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">Shake-to-Alert SOS</h2>
              <p className="text-xs text-gray-400">Vigorous motion emergency trigger</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Onboarding Explanation Banner */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-pink-300">
              <Sparkles className="w-4 h-4 text-[#FF5D73]" />
              <span>HOW IT WORKS</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
              When caught in a dangerous situation where you cannot look at or unlock your screen, firmly shake your phone back and forth 3 times. SafeHer detects the motion signature and immediately arms emergency dispatch.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Anti-pocket misfire filter active</span>
            </div>
          </div>

          {/* Toggle Enable/Disable */}
          <div className="flex items-center justify-between p-3.5 bg-black/40 border border-white/10 rounded-2xl">
            <div>
              <p className="text-xs font-bold text-white">Enable Shake Detection</p>
              <p className="text-[11px] text-gray-400">Listens to device accelerometer</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF5D73]"></div>
            </label>
          </div>

          {/* SENSITIVITY SLIDER (Light / Medium / Hard shake) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#FF5D73]" />
                <span>SHAKE SENSITIVITY:</span>
              </label>
              <span className="text-xs font-extrabold text-[#FF5D73] uppercase bg-[#FF5D73]/10 px-2 py-0.5 rounded-lg border border-[#FF5D73]/30">
                {sensitivity} Shake
              </span>
            </div>

            {/* Visual 3-step buttons */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'light', label: 'Light', desc: 'Gentle shake' },
                { key: 'medium', label: 'Medium', desc: 'Recommended' },
                { key: 'hard', label: 'Hard', desc: 'Vigorous shake' }
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setSensitivity(item.key)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    sensitivity === item.key
                      ? 'bg-[#FF5D73]/20 border-[#FF5D73] text-white shadow-[0_0_15px_rgba(255,93,115,0.25)]'
                      : 'bg-black/30 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <p className="text-xs font-black">{item.label}</p>
                  <p className="text-[10px] text-gray-400">{item.desc}</p>
                </button>
              ))}
            </div>

            <p className="text-[11px] text-gray-400">
              * Hard sensitivity is recommended when running or walking briskly to avoid accidental triggers.
            </p>
          </div>

          {/* TEST BUTTON & REAL-TIME SHAKE METER */}
          <div className="bg-black/50 border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Activity className="w-4 h-4 text-purple-400" />
                <span>Motion Calibration Meter</span>
              </div>
              <span className="text-[11px] font-mono text-gray-400">{testScore}% Force</span>
            </div>

            {/* Meter Bar */}
            <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  shakeDetected ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-gradient-to-r from-blue-500 via-purple-500 to-[#FF5D73]'
                }`}
                style={{ width: `${testScore}%` }}
              />
            </div>

            {/* Status notification */}
            {shakeDetected && (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 animate-bounce">
                <CheckCircle className="w-4 h-4" />
                <span>SHAKE TRIGGER DETECTED! SOS WOULD FIRE</span>
              </div>
            )}

            {/* Test button */}
            <button
              onClick={simulateShake}
              className="w-full py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 text-xs font-extrabold uppercase tracking-wide transition-colors flex items-center justify-center gap-2"
            >
              <Vibrate className="w-4 h-4" />
              <span>Simulate / Test Shake Trigger</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0D0E20] border-t border-white/10 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (onSaveSettings) onSaveSettings({ isEnabled, sensitivity });
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-[#FF5D73] hover:bg-[#ff425d] text-black font-extrabold text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(255,93,115,0.4)]"
          >
            Save Configuration
          </button>
        </div>

      </div>
    </div>
  );
}
