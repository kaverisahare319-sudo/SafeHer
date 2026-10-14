import React, { useState, useEffect } from 'react';
import { 
  PhoneIncoming, 
  PhoneOff, 
  Phone, 
  User, 
  Clock, 
  Settings, 
  Play, 
  Sparkles, 
  MessageSquare, 
  ChevronRight, 
  ChevronLeft, 
  Volume2, 
  VolumeX, 
  Check, 
  X,
  Upload
} from 'lucide-react';
import { audioSiren } from '../../utils/audioSiren';

const CALLER_PRESETS = [
  { 
    name: 'Dad', 
    relation: 'Family', 
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80' 
  },
  { 
    name: 'Mom', 
    relation: 'Family', 
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' 
  },
  { 
    name: 'Dad', 
    relation: 'Family', 
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' 
  },
  { 
    name: 'Best Friend', 
    relation: 'Friend', 
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' 
  }
];

const DEFAULT_SCRIPT_LINES = [
  {
    caller: "Hey sweetie! I'm waiting in the running car right outside the gate. Where are you?",
    youSay: "Hey! Yeah, I just walked past the main door, I see your hazard lights!"
  },
  {
    caller: "Good, hurry up and don't stop to talk to anyone, dinner is ready on the table.",
    youSay: "I'm walking straight towards you right now, give me 20 seconds."
  },
  {
    caller: "I'm tracking your live location on my phone, see you walking toward me.",
    youSay: "Opening the front passenger door right now, talk in a sec!"
  }
];

export function FakeCallModal({ isOpen, onClose }) {
  const [callerName, setCallerName] = useState('Dad');
  const [callerAvatar, setCallerAvatar] = useState(CALLER_PRESETS[0].avatar);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  
  const [scheduleDelay, setScheduleDelay] = useState(0); // 0, 5, 15, 30, 60 seconds
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledCountdown, setScheduledCountdown] = useState(0);

  const [callActive, setCallActive] = useState(false);
  const [callAnswered, setCallAnswered] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  const [activeScriptStep, setActiveScriptStep] = useState(0);
  const [showScriptTeleprompter, setShowScriptTeleprompter] = useState(true);

  // Ringtone synthesizer interval
  useEffect(() => {
    let interval = null;
    if (callActive && !callAnswered) {
      interval = setInterval(() => {
        audioSiren.playBeep(440, 800);
      }, 2400);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callActive, callAnswered]);

  // Call duration timer
  useEffect(() => {
    let timer = null;
    if (callAnswered) {
      timer = setInterval(() => {
        setCallTimer(t => t + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [callAnswered]);

  // Scheduled countdown trigger
  useEffect(() => {
    let timer = null;
    if (isScheduled && scheduledCountdown > 0) {
      timer = setTimeout(() => {
        setScheduledCountdown(c => c - 1);
      }, 1000);
    } else if (isScheduled && scheduledCountdown === 0) {
      setIsScheduled(false);
      setCallActive(true);
      setCallAnswered(false);
      setCallTimer(0);
      setActiveScriptStep(0);
    }
    return () => clearTimeout(timer);
  }, [isScheduled, scheduledCountdown]);

  if (!isOpen) return null;

  const triggerCall = (delay = 0) => {
    if (delay === 0) {
      setCallActive(true);
      setCallAnswered(false);
      setCallTimer(0);
      setActiveScriptStep(0);
    } else {
      setScheduledCountdown(delay);
      setIsScheduled(true);
    }
  };

  const handleAnswer = () => {
    setCallAnswered(true);
  };

  const handleHangup = () => {
    setCallActive(false);
    setCallAnswered(false);
    setCallTimer(0);
    setIsScheduled(false);
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl animate-fadeIn font-['Outfit']">
      
      {/* 1. CONFIGURATION & SCHEDULING SCREEN (When call is NOT actively ringing or answered) */}
      {!callActive && (
        <div className="relative w-full max-w-lg bg-[#12142A] border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-900/50 via-[#1B1E3D] to-[#12142A] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <PhoneIncoming className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white">Fake Incoming Call Generator</h2>
                <p className="text-xs text-gray-400">Excuses you safely with realistic call & script</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
            
            {/* Countdown Banner if scheduled */}
            {isScheduled && (
              <div className="p-4 rounded-2xl bg-purple-600/20 border border-purple-500/50 text-center space-y-2 animate-pulse">
                <p className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                  Call scheduled! Triggering in:
                </p>
                <div className="text-4xl font-mono font-black text-white">
                  {scheduledCountdown}s
                </div>
                <button
                  onClick={() => setIsScheduled(false)}
                  className="text-xs text-red-400 underline hover:text-red-300"
                >
                  Cancel Scheduled Call
                </button>
              </div>
            )}

            {/* Caller Name & Photo Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                1. Select Caller Preset or Custom Name:
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CALLER_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      setCallerName(preset.name);
                      setCallerAvatar(preset.avatar);
                    }}
                    className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col items-center text-center gap-2 ${
                      callerName === preset.name
                        ? 'bg-purple-600/30 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <img
                      src={preset.avatar}
                      alt={preset.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white/20 shadow-md"
                    />
                    <div>
                      <p className="text-xs font-bold text-white truncate max-w-[80px]">{preset.name}</p>
                      <p className="text-[10px] text-gray-400">{preset.relation}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div className="pt-1">
                <input
                  type="text"
                  value={callerName}
                  onChange={(e) => setCallerName(e.target.value)}
                  placeholder="Or type custom caller name..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 font-semibold"
                />
              </div>
            </div>

            {/* SCHEDULE-IN-X-SECONDS OPTIONS */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>2. Schedule Delay (Trigger in X seconds):</span>
              </label>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Instant', sec: 0 },
                  { label: '5 sec', sec: 5 },
                  { label: '15 sec', sec: 15 },
                  { label: '30 sec', sec: 30 }
                ].map((item) => (
                  <button
                    key={item.sec}
                    onClick={() => {
                      setScheduleDelay(item.sec);
                      triggerCall(item.sec);
                    }}
                    className={`py-3 px-2 rounded-2xl border text-center transition-all ${
                      scheduleDelay === item.sec
                        ? 'bg-purple-600 text-white font-extrabold shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-xs font-bold block">{item.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-gray-400">
                Tap a timer delay so you have time to pocket your phone before it starts ringing.
              </p>
            </div>

            {/* Pre-written Fake Conversation Script Preview */}
            <div className="space-y-2 bg-black/40 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-pink-300">
                <MessageSquare className="w-4 h-4 text-[#FF5D73]" />
                <span>IN-CALL GLANCEABLE SCRIPT INCLUDED</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                During the call, a discreet script teleprompter floats on screen with realistic lines you can read out loud so you sound completely natural when walking away!
              </p>
            </div>

          </div>

          {/* Footer Trigger Button */}
          <div className="p-4 bg-[#0D0E20] border-t border-white/10 flex items-center justify-between">
            <button
              onClick={onClose}
              className="text-xs text-gray-400 hover:text-white"
            >
              Close
            </button>
            <button
              onClick={() => triggerCall(0)}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(168,85,247,0.5)] active:scale-95 transition-all flex items-center gap-2"
            >
              <PhoneIncoming className="w-4 h-4" />
              <span>TRIGGER CALL NOW</span>
            </button>
          </div>

        </div>
      )}

      {/* 2. REALISTIC FULL-SCREEN INCOMING / IN-CALL UI */}
      {callActive && (
        <div className="fixed inset-0 z-50 flex flex-col justify-between p-6 sm:p-8 bg-[#090A14] text-white font-['Outfit'] animate-fadeIn select-none">
          
          {/* Top Caller Info */}
          <div className="text-center pt-8 sm:pt-12 space-y-4">
            <div className="relative inline-block">
              <img
                src={callerAvatar}
                alt={callerName}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white/20 mx-auto shadow-[0_0_40px_rgba(255,255,255,0.2)] animate-pulse"
              />
              {!callAnswered && (
                <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-black animate-ping" />
              )}
            </div>

            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-wide text-white">{callerName}</h2>
              <p className="text-sm font-semibold text-gray-400 tracking-widest uppercase mt-1">
                {callAnswered ? `Connected • ${formatTimer(callTimer)}` : 'Incoming Mobile Call...'}
              </p>
            </div>
          </div>

          {/* IN-CALL GLANCEABLE SCRIPT TELEPROMPTER */}
          {callAnswered && showScriptTeleprompter && (
            <div className="max-w-md mx-auto w-full bg-black/85 border border-purple-500/50 rounded-2xl p-4 backdrop-blur-xl shadow-2xl space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300 uppercase tracking-wider">
                  <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                  <span>Glanceable Script (Cue {activeScriptStep + 1}/{DEFAULT_SCRIPT_LINES.length})</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveScriptStep(s => Math.max(0, s - 1))}
                    disabled={activeScriptStep === 0}
                    className="p-1 rounded bg-white/10 text-gray-300 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setActiveScriptStep(s => Math.min(DEFAULT_SCRIPT_LINES.length - 1, s + 1))}
                    disabled={activeScriptStep === DEFAULT_SCRIPT_LINES.length - 1}
                    className="p-1 rounded bg-white/10 text-gray-300 disabled:opacity-30"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Script Cue */}
              <div className="space-y-2 text-left">
                <div className="bg-purple-950/40 p-2.5 rounded-xl border border-purple-500/20">
                  <p className="text-[10px] font-bold text-purple-300 uppercase">They say (Listen):</p>
                  <p className="text-xs text-purple-100 font-medium italic mt-0.5">
                    "{DEFAULT_SCRIPT_LINES[activeScriptStep].caller}"
                  </p>
                </div>

                <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/20">
                  <p className="text-[10px] font-bold text-emerald-300 uppercase">You say out loud:</p>
                  <p className="text-xs sm:text-sm text-emerald-100 font-bold mt-0.5">
                    "{DEFAULT_SCRIPT_LINES[activeScriptStep].youSay}"
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
                <span>Auto-advances script cues</span>
                <button
                  onClick={() => setActiveScriptStep(s => (s + 1) % DEFAULT_SCRIPT_LINES.length)}
                  className="text-purple-400 underline font-bold"
                >
                  Next Line
                </button>
              </div>
            </div>
          )}

          {/* Bottom Action Controls */}
          <div className="pb-10 max-w-xs mx-auto w-full">
            {callAnswered ? (
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={handleHangup}
                  className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-[0_0_35px_rgba(220,38,38,0.8)] active:scale-95 transition-all"
                  title="End Call"
                >
                  <PhoneOff className="w-9 h-9" />
                </button>
                <span className="text-xs font-semibold text-gray-400">Tap red button to end call</span>
              </div>
            ) : (
              <div className="flex items-center justify-around">
                {/* Decline Button */}
                <div className="text-center space-y-2">
                  <button
                    onClick={handleHangup}
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-[0_0_25px_rgba(220,38,38,0.7)] active:scale-95 transition-all"
                  >
                    <PhoneOff className="w-8 h-8 sm:w-9 sm:h-9" />
                  </button>
                  <p className="text-xs font-bold text-gray-400">Decline</p>
                </div>

                {/* Accept Button */}
                <div className="text-center space-y-2">
                  <button
                    onClick={handleAnswer}
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-[0_0_35px_rgba(16,185,129,0.8)] animate-bounce active:scale-95 transition-all"
                  >
                    <Phone className="w-8 h-8 sm:w-9 sm:h-9" />
                  </button>
                  <p className="text-xs font-bold text-emerald-400">Accept</p>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
