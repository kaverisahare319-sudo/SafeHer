import React, { useState, useEffect } from 'react';
import { Timer, ShieldAlert, CheckCircle2, AlertOctagon, Key, Bell, RefreshCw } from 'lucide-react';
import { audioSiren } from '../utils/audioSiren';

export function SafetyCheckin({ onTriggerSos, isSirenActive, toggleSiren }) {
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isDisarming, setIsDisarming] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [userPin, setUserPin] = useState('1234');
  const [statusNote, setStatusNote] = useState('Walking home late');

  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      // Trigger Siren & Emergency SOS alert
      if (!isSirenActive) {
        toggleSiren();
      }
      onTriggerSos();
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, onTriggerSos, isSirenActive, toggleSiren]);

  const handleStartTimer = (mins) => {
    const totalSeconds = mins * 60;
    setDurationMinutes(mins);
    setTimeLeft(totalSeconds);
    setIsRunning(true);
    audioSiren.playBeep(600, 150);
  };

  const handleCancelTimer = () => {
    setIsDisarming(true);
    setPinInput('');
    setPinError(false);
  };

  const handleVerifyPin = (e) => {
    e.preventDefault();
    if (pinInput === userPin) {
      setIsRunning(false);
      setTimeLeft(0);
      setIsDisarming(false);
      audioSiren.playBeep(1000, 300);
    } else {
      setPinError(true);
      audioSiren.playBeep(400, 300);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalSecs = durationMinutes * 60;
  const progressPercent = totalSecs > 0 ? ((totalSecs - timeLeft) / totalSecs) * 100 : 0;

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-[#FF10F0]/20">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Timer className="w-5 h-5 text-[#FF10F0]" />
            <span>Safety Check-in Timer</span>
          </h2>
          <p className="text-xs text-gray-400">
            Set a timer for cab rides or walking. If not disarmed, SOS triggers automatically.
          </p>
        </div>
      </div>

      {/* Main Timer Display Card */}
      <div className="glass-panel p-6 rounded-2xl border border-[#FF10F0]/30 text-center space-y-6 relative overflow-hidden">
        
        {isRunning ? (
          <div className="space-y-6">
            
            {/* Status note */}
            <div className="inline-block px-3 py-1 rounded-full bg-[#FF10F0]/10 border border-[#FF10F0]/30 text-[#FF10F0] text-xs font-semibold">
              Status: {statusNote}
            </div>

            {/* Circular Timer Visual */}
            <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className="stroke-gray-800"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className="stroke-[#FF10F0] transition-all duration-1000 ease-linear"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={276}
                  strokeDashoffset={276 - (276 * progressPercent) / 100}
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0 0 8px #FF10F0)' }}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold text-white font-mono tracking-tight drop-shadow-[0_0_10px_#FF10F0]">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-[11px] text-gray-400 font-semibold uppercase mt-1">
                  REMAINING
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 max-w-xs mx-auto">
              <button
                onClick={handleCancelTimer}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>I'm Safe - Stop Timer</span>
              </button>
            </div>

          </div>
        ) : (
          <div className="space-y-6 py-2">
            
            <div className="max-w-xs mx-auto space-y-2">
              <label className="text-xs font-bold text-gray-300">Trip / Activity Label</label>
              <input
                type="text"
                value={statusNote}
                onChange={e => setStatusNote(e.target.value)}
                placeholder="e.g. Uber ride home, Evening jog"
                className="w-full p-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white text-center focus:outline-none focus:border-[#FF10F0]"
              />
            </div>

            {/* Duration Preset Buttons */}
            <div>
              <p className="text-xs font-bold text-gray-300 mb-3">SELECT CHECK-IN DURATION:</p>
              <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
                {[5, 15, 30, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setDurationMinutes(mins)}
                    className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                      durationMinutes === mins
                        ? 'bg-[#FF10F0] text-black border-[#FF10F0] shadow-[0_0_15px_#FF10F0]'
                        : 'bg-white/5 text-gray-300 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <div className="max-w-xs mx-auto pt-2">
              <button
                onClick={() => handleStartTimer(durationMinutes)}
                className="w-full py-3.5 rounded-xl bg-[#FF10F0] hover:bg-[#d900c9] text-black font-extrabold text-base shadow-[0_0_25px_#FF10F0] flex items-center justify-center gap-2 transition-all"
              >
                <Bell className="w-5 h-5 animate-bounce" />
                <span>START {durationMinutes} MIN SAFETY TIMER</span>
              </button>
            </div>

          </div>
        )}

      </div>

      {/* PIN Verification Modal */}
      {isDisarming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-sm glass-panel p-6 rounded-2xl border border-[#FF10F0] shadow-[0_0_30px_rgba(255,16,240,0.4)] text-center space-y-4">
            
            <div className="w-12 h-12 rounded-full bg-[#FF10F0]/20 border border-[#FF10F0] flex items-center justify-center mx-auto text-[#FF10F0]">
              <Key className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Enter Disarm PIN</h3>
              <p className="text-xs text-gray-400">Confirm you are safe to stop the timer (Default: 1234)</p>
            </div>

            <form onSubmit={handleVerifyPin} className="space-y-3">
              <input
                type="password"
                maxLength={4}
                autoFocus
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                placeholder="1234"
                className="w-32 mx-auto p-3 text-center text-2xl font-bold tracking-widest rounded-xl bg-black/80 border border-[#FF10F0] text-white focus:outline-none focus:ring-2 focus:ring-[#FF10F0]"
              />

              {pinError && (
                <p className="text-xs text-red-400 font-bold animate-pulse">Incorrect PIN. Try default: 1234</p>
              )}

              <div className="flex justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDisarming(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-gray-300 text-xs font-semibold"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                >
                  Confirm Safe
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
