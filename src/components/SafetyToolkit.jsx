import React, { useState, useEffect } from 'react';
import { 
  PhoneIncoming, 
  PhoneOff, 
  Phone, 
  Volume2, 
  VolumeX, 
  Zap, 
  Wrench, 
  User, 
  Clock, 
  Play 
} from 'lucide-react';
import { audioSiren } from '../utils/audioSiren';

export function SafetyToolkit({ isSirenActive, toggleSiren }) {
  const [fakeCallActive, setFakeCallActive] = useState(false);
  const [fakeCallAnswered, setFakeCallAnswered] = useState(false);
  const [callerName, setCallerName] = useState('Mom');
  const [callTimer, setCallTimer] = useState(0);
  const [strobeActive, setStrobeActive] = useState(false);

  // Fake Call Ringtone Synth
  useEffect(() => {
    let ringtoneInterval = null;
    if (fakeCallActive && !fakeCallAnswered) {
      ringtoneInterval = setInterval(() => {
        audioSiren.playBeep(440, 800);
      }, 2500);
    }
    return () => {
      if (ringtoneInterval) clearInterval(ringtoneInterval);
    };
  }, [fakeCallActive, fakeCallAnswered]);

  // Fake Call Timer
  useEffect(() => {
    let timer = null;
    if (fakeCallAnswered) {
      timer = setInterval(() => {
        setCallTimer(c => c + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [fakeCallAnswered]);

  const triggerFakeCall = (name) => {
    setCallerName(name);
    setFakeCallActive(true);
    setFakeCallAnswered(false);
    setCallTimer(0);
  };

  const handleAnswerCall = () => {
    setFakeCallAnswered(true);
  };

  const handleEndCall = () => {
    setFakeCallActive(false);
    setFakeCallAnswered(false);
    setCallTimer(0);
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-[#FF10F0]/20">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-[#FF10F0]" />
            <span>Personal Safety Toolkit</span>
          </h2>
          <p className="text-xs text-gray-400">
            Discreet tools to help escape unsafe situations or signal for assistance.
          </p>
        </div>
      </div>

      {/* Grid of Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* Tool 1: Fake Call Generator */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <PhoneIncoming className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Fake Call Escape</h3>
                <p className="text-xs text-gray-400">Simulate incoming phone call</p>
              </div>
            </div>
            <p className="text-xs text-gray-300">
              Triggers a realistic incoming call UI with ringtone to excuse yourself safely.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-bold text-gray-400 uppercase">SELECT CALLER:</p>
            <div className="grid grid-cols-2 gap-1.5">
              {['Mom', 'Dad', 'Police', 'Boss'].map((name) => (
                <button
                  key={name}
                  onClick={() => triggerFakeCall(name)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-[#FF10F0]/20 border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-1 transition-all"
                >
                  <User className="w-3.5 h-3.5 text-[#FF10F0]" />
                  <span>{name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tool 2: Loud Distress Siren */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
                {isSirenActive ? <VolumeX className="w-5 h-5 animate-ping" /> : <Volume2 className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Loud Alarm Siren</h3>
                <p className="text-xs text-gray-400">High-pitch Web Audio synth</p>
              </div>
            </div>
            <p className="text-xs text-gray-300">
              Produces a piercing 850Hz/1250Hz dual siren to draw immediate crowd attention.
            </p>
          </div>

          <button
            onClick={toggleSiren}
            className={`w-full py-3 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
              isSirenActive
                ? 'bg-red-600 text-white animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.7)]'
                : 'bg-[#FF10F0] text-black hover:bg-[#d900c9] shadow-[0_0_15px_#FF10F0]'
            }`}
          >
            {isSirenActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isSirenActive ? 'SILENCE SIREN' : 'SOUND SIREN ALARM'}</span>
          </button>
        </div>

        {/* Tool 3: Screen Strobe Flashlight */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2.5 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Strobe Light</h3>
                <p className="text-xs text-gray-400">High-visibility screen strobe</p>
              </div>
            </div>
            <p className="text-xs text-gray-300">
              Flashes the display with bright white & neon pink light for dark environment signaling.
            </p>
          </div>

          <button
            onClick={() => setStrobeActive(true)}
            className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(234,179,8,0.5)] flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            <span>START STROBE LIGHT</span>
          </button>
        </div>

      </div>

      {/* FULL-SCREEN FAKE CALL OVERLAY */}
      {fakeCallActive && (
        <div className="fixed inset-0 z-50 flex flex-col justify-between p-8 bg-[#09090e] text-white animate-fadeIn font-['Outfit']">
          
          <div className="text-center pt-12 space-y-3">
            <div className="w-24 h-24 rounded-full bg-[#FF10F0]/20 border-2 border-[#FF10F0] flex items-center justify-center mx-auto shadow-[0_0_30px_#FF10F0] animate-pulse">
              <User className="w-12 h-12 text-[#FF10F0]" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-wide">{callerName}</h2>
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
              {fakeCallAnswered ? `In Call • ${formatTimer(callTimer)}` : 'Incoming Call...'}
            </p>
          </div>

          <div className="pb-16 max-w-xs mx-auto w-full">
            {fakeCallAnswered ? (
              <div className="space-y-6 text-center">
                <p className="text-xs text-emerald-400 font-mono animate-pulse">Connected Audio Channel</p>
                <button
                  onClick={handleEndCall}
                  className="w-20 h-20 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(220,38,38,0.8)]"
                >
                  <PhoneOff className="w-8 h-8" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-around">
                {/* Decline */}
                <button
                  onClick={handleEndCall}
                  className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.6)]"
                >
                  <PhoneOff className="w-7 h-7" />
                </button>

                {/* Accept */}
                <button
                  onClick={handleAnswerCall}
                  className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.8)] animate-bounce"
                >
                  <Phone className="w-7 h-7" />
                </button>
              </div>
            )}
          </div>

        </div>
      )}

      {/* FULL-SCREEN STROBE LIGHT OVERLAY */}
      {strobeActive && (
        <div 
          onClick={() => setStrobeActive(false)}
          className="fixed inset-0 z-50 animate-strobe cursor-pointer flex items-center justify-center"
        >
          <div className="bg-black/70 p-4 rounded-xl text-center text-white font-extrabold text-sm border border-white">
            ⚡ STROBE ACTIVE • TAP ANYWHERE TO CLOSE ⚡
          </div>
        </div>
      )}

    </div>
  );
}
