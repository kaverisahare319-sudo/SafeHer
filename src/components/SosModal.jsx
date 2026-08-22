import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  X, 
  Share2, 
  MessageSquare, 
  PhoneCall, 
  Copy, 
  Check, 
  MapPin, 
  Volume2, 
  VolumeX, 
  ExternalLink,
  ShieldAlert,
  Send
} from 'lucide-react';
import { 
  createEmergencyMessage, 
  getWhatsAppShareUrl, 
  getSmsShareUrl, 
  createGoogleMapsUrl, 
  copyToClipboard 
} from '../utils/shareHelpers';
import { audioSiren } from '../utils/audioSiren';

export function SosModal({ isOpen, onClose, location, address, contacts, isSirenActive, toggleSiren }) {
  const [countdown, setCountdown] = useState(3);
  const [isCounting, setIsCounting] = useState(true);
  const [copied, setCopied] = useState(false);
  const [customNote, setCustomNote] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setCountdown(3);
      setIsCounting(true);
      return;
    }

    if (isCounting && countdown > 0) {
      audioSiren.playBeep(800 + (3 - countdown) * 200, 150);
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && isCounting) {
      setIsCounting(false);
      // Auto trigger siren sound on SOS confirmation
      if (!isSirenActive) {
        toggleSiren();
      }
    }
  }, [isOpen, countdown, isCounting, isSirenActive, toggleSiren]);

  if (!isOpen) return null;

  const lat = location?.latitude || 0;
  const lng = location?.longitude || 0;
  const mapsUrl = createGoogleMapsUrl(lat, lng);
  const fullMessage = createEmergencyMessage(lat, lng, address, customNote);

  const handleCopy = async () => {
    const success = await copyToClipboard(fullMessage);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const primaryPhone = contacts.find(c => c.isPrimary)?.phone || contacts[0]?.phone || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-lg glass-panel rounded-2xl border-2 border-[#FF10F0] shadow-[0_0_50px_rgba(255,16,240,0.5)] overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header Bar */}
        <div className="p-4 bg-gradient-to-r from-red-600 to-[#FF10F0] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-7 h-7 animate-bounce text-yellow-300" />
            <div>
              <h2 className="text-xl font-extrabold tracking-wide uppercase">EMERGENCY SOS ALERT</h2>
              <p className="text-xs font-medium text-pink-100">Broadcast your live location to contacts</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-black/30 hover:bg-black/60 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          
          {/* Safety Countdown Banner */}
          {isCounting ? (
            <div className="p-4 rounded-xl bg-red-500/20 border-2 border-red-500 text-center space-y-2">
              <p className="text-xs font-bold text-red-300 uppercase tracking-widest">
                Activating Emergency Broadcast in
              </p>
              <div className="text-5xl font-black text-red-500 animate-ping">
                {countdown}
              </div>
              <button
                onClick={() => { setIsCounting(false); setCountdown(0); }}
                className="text-xs text-gray-300 underline hover:text-white"
              >
                Skip timer & broadcast now
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-[#FF10F0]/15 border border-[#FF10F0]/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#FF10F0] animate-pulse" />
                <span className="text-xs font-bold text-white">SOS ACTIVATED - READY TO SHARE</span>
              </div>
              <button
                onClick={toggleSiren}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                  isSirenActive ? 'bg-red-600 text-white animate-pulse' : 'bg-[#FF10F0]/30 text-[#FF10F0] border border-[#FF10F0]'
                }`}
              >
                {isSirenActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                {isSirenActive ? 'SILENCE' : 'SIREN'}
              </button>
            </div>
          )}

          {/* Location Info Box */}
          <div className="p-3 rounded-xl bg-black/60 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#FF10F0]">
                <MapPin className="w-4 h-4" />
                <span>YOUR CURRENT LOCATION</span>
              </div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-pink-300 flex items-center gap-1 hover:underline"
              >
                Open Google Maps <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            
            <p className="text-sm font-semibold text-white">
              {address || 'Fetching street address...'}
            </p>
            
            <div className="flex items-center gap-3 text-[11px] text-gray-400 font-mono">
              <span>Lat: {lat ? lat.toFixed(6) : '--'}</span>
              <span>Lng: {lng ? lng.toFixed(6) : '--'}</span>
            </div>
          </div>

          {/* Pre-filled Message & Note input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300 flex items-center justify-between">
              <span>PRE-FILLED EMERGENCY MESSAGE</span>
              <button 
                onClick={handleCopy}
                className="text-[11px] text-[#FF10F0] hover:underline flex items-center gap-1 font-normal"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Text'}
              </button>
            </label>
            
            <div className="relative">
              <textarea
                readOnly
                value={fullMessage}
                rows={4}
                className="w-full p-2.5 rounded-xl bg-black/80 border border-white/15 text-xs text-gray-200 font-mono resize-none focus:outline-none focus:border-[#FF10F0]"
              />
            </div>
          </div>

          {/* Quick Share Grid Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            
            {/* WhatsApp Share Button */}
            <a
              href={getWhatsAppShareUrl(primaryPhone, fullMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
            >
              <Send className="w-5 h-5" />
              <span>Share via WhatsApp</span>
            </a>

            {/* SMS Share Button */}
            <a
              href={getSmsShareUrl(primaryPhone, fullMessage)}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Share via SMS</span>
            </a>

          </div>

          {/* Emergency Helplines Direct Call */}
          <div className="pt-2">
            <a
              href="tel:112"
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-[#FF10F0] hover:bg-[#d900c9] text-black font-extrabold text-base shadow-[0_0_25px_#FF10F0] transition-all"
            >
              <PhoneCall className="w-5 h-5 animate-pulse" />
              <span>CALL 112 POLICE HELPLINE</span>
            </a>
          </div>

          {/* Contacts list overview */}
          {contacts.length > 0 && (
            <div className="pt-2 border-t border-white/10">
              <p className="text-[11px] font-bold text-gray-400 mb-2">QUICK DIAL TRUSTED CONTACTS:</p>
              <div className="grid grid-cols-2 gap-2">
                {contacts.slice(0, 4).map((c, i) => (
                  <a
                    key={i}
                    href={`tel:${c.phone}`}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white"
                  >
                    <span className="truncate">{c.name}</span>
                    <PhoneCall className="w-3.5 h-3.5 text-[#FF10F0]" />
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
